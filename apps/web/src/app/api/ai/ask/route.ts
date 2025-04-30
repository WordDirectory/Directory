import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { aiRateLimit } from "@/lib/rate-limit";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { getWord } from "@/lib/db/queries";
import { z } from "zod";

// Request validation schema
const requestSchema = z.object({
  message: z
    .string()
    .min(1, "Message is required")
    .max(50000, "Message is too long"),
  word: z.string().min(1, "Word is required").max(100, "Word is too long"),
});

// Initialize the Gemini model
const model = google("gemini-2.0-flash", {
  safetySettings: [
    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "OFF" },
    {
      category: "HARM_CATEGORY_DANGEROUS_CONTENT",
      threshold: "BLOCK_LOW_AND_ABOVE",
    },
    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_LOW_AND_ABOVE" },
    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "OFF" },
  ],
});

export async function POST(request: Request) {
  try {
    // Get IP address from X-Forwarded-For header or fallback to a default
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0] : "127.0.0.1";

    // Apply rate limiting
    await aiRateLimit(ip);

    // Parse and validate request body
    const body = await request.json();
    const result = requestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Invalid request data",
          errors: result.error.errors,
          status: 400,
        },
        { status: 400 }
      );
    }

    const { message, word } = result.data;

    // Get word details from database
    const wordDetails = await getWord(decodeURIComponent(word));
    if (!wordDetails) {
      return NextResponse.json(
        { message: `Word "${word}" not found`, status: 404 },
        { status: 404 }
      );
    }

    // Generate response using Gemini
    const { text } = await generateText({
      model,
      prompt: `
<system>
You are an AI assistant for WordDirectory, a website that provides simple, human-readable word definitions.

The user is currently on a word page for ${word}.

You must answer the user's question. It will not always be about the word, sometimes it will.

Ensure your response is concise and to the point.
</system>

<context>
Current word: ${word}
Word details: ${JSON.stringify(wordDetails)}
</context>

<user_question>
${message}
</user_question>

Response:`,
      temperature: 0.7,
      maxTokens: 500,
    });

    return NextResponse.json({ response: text });
  } catch (error: unknown) {
    // First, log the full error details
    const errorDetails = {
      error:
        error instanceof Error
          ? {
              message: error.message,
              stack: error.stack,
              name: error.name,
            }
          : error,
      timestamp: new Date().toISOString(),
    };

    console.error(
      "[AI API Error] Details:",
      JSON.stringify(errorDetails, null, 2)
    );

    if (error instanceof Error) {
      if (error.message === "Too many AI requests") {
        return NextResponse.json(
          {
            message:
              "Daily AI request limit of 300 requests reached. Please try again tomorrow.",
            status: 429,
          },
          {
            status: 429,
            headers: {
              "Retry-After": "86400", // 24 hours
            },
          }
        );
      }

      // Return the actual error message in development
      if (process.env.NODE_ENV === "development") {
        return NextResponse.json(
          {
            message: error.message,
            stack: error.stack,
            status: 500,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        message: "An error occurred while processing your request",
        status: 500,
      },
      { status: 500 }
    );
  }
}
