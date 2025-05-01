import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { getAIUsage, getWord } from "@/lib/db/queries";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { aiUsage, subscriptions } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { APIError, AIError, ValidationError } from "@/types/api";

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
    const [aiUsageData, subscriptionData] = await Promise.all([
      getAIUsage(session.user.id),
      db.query.subscriptions.findFirst({
        where: eq(subscriptions.referenceId, session.user.id),
      }),
    ]);
    console.log("AI usage", aiUsageData);

    if (aiUsageData) {
      const limit = subscriptionData?.plan === "plus" ? 1000 : 10;
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

    // Get word details from database
    const wordDetails = await getWord(decodeURIComponent(word));
    if (!wordDetails) {
      const error: APIError = {
        message: `Word "${word}" not found`,
        status: 404,
        code: "WORD_NOT_FOUND",
      };
      return NextResponse.json(error, { status: 404 });
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
