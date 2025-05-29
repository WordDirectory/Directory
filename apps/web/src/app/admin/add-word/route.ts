import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
import { createClient } from "@supabase/supabase-js";
import { APIError, ValidationError } from "@/types/api";
import { z } from "zod";

// Initialize Supabase client for production
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Validation schema for adding a word
const addWordSchema = z.object({
  word: z
    .string()
    .min(1, "Word is required")
    .max(100, "Word cannot be longer than 100 characters")
    .trim(),
  definitions: z
    .array(
      z.object({
        text: z
          .string()
          .min(1, "Definition text is required")
          .max(1000, "Definition cannot be longer than 1000 characters")
          .trim(),
        examples: z
          .array(
            z
              .string()
              .min(1, "Example text is required")
              .max(500, "Example cannot be longer than 500 characters")
              .trim()
          )
          .min(1, "At least one example is required per definition")
          .max(10, "Cannot have more than 10 examples per definition"),
      })
    )
    .min(1, "At least one definition is required")
    .max(20, "Cannot have more than 20 definitions"),
});

export async function POST(request: Request) {
  try {
    // Get IP address and apply rate limiting
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0] : "127.0.0.1";
    await rateLimit(ip);

    // Parse and validate request body
    const body = await request.json();
    const validationResult = addWordSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Invalid request data",
          status: 400,
          code: "VALIDATION_ERROR",
          errors: validationResult.error.flatten().fieldErrors,
        } satisfies ValidationError,
        { status: 400 }
      );
    }

    const { word, definitions: definitionsData } = validationResult.data;

    // Normalize the word (capitalize first letter, lowercase rest)
    const normalizedWord =
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();

    // Check if word already exists
    const { data: existingWord } = await supabase
      .from("words")
      .select("id")
      .eq("word", normalizedWord)
      .single();

    let wordToUse = existingWord;

    if (existingWord) {
      // Word exists - delete existing definitions (we'll replace with new ones)
      const { error: deleteError } = await supabase
        .from("definitions")
        .delete()
        .eq("word_id", existingWord.id);

      if (deleteError) {
        console.error("Error deleting existing definitions:", deleteError);
        throw new Error("Failed to delete existing definitions");
      }
    } else {
      // Word doesn't exist - create it
      const { data: insertedWord, error: wordError } = await supabase
        .from("words")
        .insert({
          word: normalizedWord,
        })
        .select()
        .single();

      if (wordError) {
        console.error("Error inserting word:", wordError);
        throw new Error("Failed to insert word");
      }

      wordToUse = insertedWord;
    }

    // Insert definitions and examples
    const insertedDefinitions = [];

    for (let i = 0; i < definitionsData.length; i++) {
      const definitionData = definitionsData[i];

      // Insert definition
      const { data: insertedDefinition, error: defError } = await supabase
        .from("definitions")
        .insert({
          word_id: wordToUse?.id,
          text: definitionData.text,
          order: i + 1, // 1-based ordering
        })
        .select()
        .single();

      if (defError) {
        console.error("Error inserting definition:", defError);
        throw new Error("Failed to insert definition");
      }

      // Insert examples for this definition
      const insertedExamples = [];
      for (let j = 0; j < definitionData.examples.length; j++) {
        const exampleText = definitionData.examples[j];

        const { data: insertedExample, error: exError } = await supabase
          .from("examples")
          .insert({
            definition_id: insertedDefinition.id,
            text: exampleText,
            order: j + 1, // 1-based ordering
          })
          .select()
          .single();

        if (exError) {
          console.error("Error inserting example:", exError);
          throw new Error("Failed to insert example");
        }

        insertedExamples.push(insertedExample);
      }

      insertedDefinitions.push({
        ...insertedDefinition,
        examples: insertedExamples,
      });
    }

    return NextResponse.json({
      message: `Word "${normalizedWord}" saved successfully`,
      data: {
        word: wordToUse,
        definitions: insertedDefinitions,
      },
    });
  } catch (error) {
    console.error("[Add Word API Error]", error);

    if (error instanceof Error) {
      if (error.message === "Too many requests") {
        return NextResponse.json(
          {
            message: "Too many requests. Please slow down.",
            status: 429,
            code: "RATE_LIMIT_EXCEEDED",
          } satisfies APIError,
          {
            status: 429,
            headers: { "Retry-After": "60" },
          }
        );
      }

      if (process.env.NODE_ENV === "development") {
        return NextResponse.json(
          {
            message: error.message,
            status: 500,
            code: "INTERNAL_SERVER_ERROR",
          } satisfies APIError,
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        message: "An error occurred while adding the word",
        status: 500,
        code: "INTERNAL_SERVER_ERROR",
      } satisfies APIError,
      { status: 500 }
    );
  }
}
