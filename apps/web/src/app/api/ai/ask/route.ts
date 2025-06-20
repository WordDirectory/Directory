import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { getAIUsage, getWord, getActiveSubscription } from "@/lib/db/queries";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { aiUsage } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { AIError, ValidationError } from "@/types/api";

// Request validation schema
const requestSchema = z.object({
  message: z
    .string()
    .min(1, "Message is required")
    .max(50000, "Message is too long"),
  word: z.string().max(100, "Word is too long").nullish(),
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
    await rateLimit(ip);

    // Parse and validate request body
    const body = await request.json();
    const result = requestSchema.safeParse(body);

    if (!result.success) {
      const error: ValidationError = {
        message: "Invalid request data",
        code: "VALIDATION_ERROR",
        status: 400,
        errors: result.error.flatten().fieldErrors,
      };
      console.log("Invalid request data", result.error);
      return NextResponse.json(error, { status: 400 });
    }

    const session = await auth.api.getSession(request);

    if (!session || !session.user.id) {
      const error: AIError = {
        message: "You must be logged in to use AI features",
        status: 401,
        code: "AUTH_REQUIRED",
      };
      return NextResponse.json(error, { status: 401 });
    }

    console.log("Fetching AI usage for user", session.user.id);

    // Debug the queries being made
    let [aiUsageData, subscriptionData] = await Promise.all([
      getAIUsage(session.user.id),
      getActiveSubscription(session.user.id),
    ]);

    // Initialize AI usage if it doesn't exist
    if (!aiUsageData) {
      const resetAt = new Date();
      resetAt.setMonth(resetAt.getMonth() + 1);
      resetAt.setDate(1);
      resetAt.setHours(0, 0, 0, 0);

      try {
        const newAiUsage = await db
          .insert(aiUsage)
          .values({
            userId: session.user.id,
            count: 0,
            resetAt,
          })
          .returning();
        aiUsageData = newAiUsage[0];
      } catch (error) {
        throw new Error("Failed to initialize AI usage");
      }
    }

    if (aiUsageData) {
      // Check limits
      const limit =
        subscriptionData?.plan === "plus" &&
        ["active", "trialing", "past_due"].includes(
          subscriptionData?.status || ""
        )
          ? 1000
          : 10;

      if (aiUsageData.count >= limit) {
        const error: AIError = {
          message: "AI usage limit reached",
          status: 429,
          code: "SUBSCRIPTION_LIMIT_REACHED",
          usage: {
            current: aiUsageData.count,
            limit,
            plan: subscriptionData?.plan || "free",
            nextReset: aiUsageData.resetAt.toISOString(),
          },
        };
        return NextResponse.json(error, { status: 429 });
      }
    }

    const { message, word } = result.data;

    // Get word details from database if it exists
    let wordDetails = null;
    if (word) {
      wordDetails = await getWord(decodeURIComponent(word));
      // Note: We don't return 404 if the word doesn't exist
      // We still want to allow AI to answer questions about unknown words
    }

    const prompt = `
    <system>
You are an AI assistant for WordDirectory, a website that provides simple, human-readable word definitions.

${word ? `The user is currently on a word page for ${word}.` : ""}
${wordDetails ? `The word exists in our database with these details: ${JSON.stringify(wordDetails)}` : word ? `This word is not in our database yet.` : ""}

You must answer the user's question. It will not always be about the word, sometimes it will.

Ensure your response is concise and to the point.

If the user asks about the word, you must explain it in a way that is easy to understand. Do NOT use overly complex language.

Prefer simple words over complex. Eg:
- "I need to start working" instead of "I must commence my duties"

Avoid using overly complex language at all times. Simplicity matters.

You can talk about anything - daily life, movies, music, books, whatever.
</system>

${
  word
    ? `<context>
Current word: ${word}
Word details: ${JSON.stringify(wordDetails)}
</context>`
    : ""
}

<user_question>
${message}
</user_question>

Response:
    `;

    // Generate response using Gemini
    const { text } = await generateText({
      model,
      prompt,
      temperature: 0.7,
      maxTokens: 500,
    });

    // After generating the Gemini response but before returning it
    if (session && session.user.id) {
      // Increment the usage count
      await db
        .update(aiUsage)
        .set({
          count: sql`${aiUsage.count} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(aiUsage.userId, session.user.id));
    }

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
        const rateLimitError: AIError = {
          message: "Too many requests. Please slow down.",
          status: 429,
          code: "RATE_LIMIT_EXCEEDED",
        };
        return NextResponse.json(rateLimitError, {
          status: 429,
          headers: {
            "Retry-After": "60",
          },
        });
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
