import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
import { auth } from "@/lib/auth";
import { getWord, createWordFeedback, getWordFeedback } from "@/lib/db/queries";
import { APIError } from "@/types/api";
import { z } from "zod";

// GET: Get feedback for a word
export async function GET(
  request: Request,
  { params }: { params: Promise<{ word: string }> }
) {
  try {
    // Get IP address and apply rate limiting
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0] : "127.0.0.1";
    await rateLimit(ip);

    // Get the word and check if it exists
    const { word } = await params;
    const wordData = await getWord(decodeURIComponent(word));
    if (!wordData) {
      return NextResponse.json(
        {
          message: `Word "${word}" not found`,
          status: 404,
          code: "WORD_NOT_FOUND",
        } satisfies APIError,
        { status: 404 }
      );
    }

    // Get feedback
    const feedback = await getWordFeedback(wordData.id);

    return NextResponse.json({ feedback });
  } catch (error) {
    if (error instanceof Error && error.message === "Too many requests") {
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
    return NextResponse.json(
      {
        message: "An error occurred",
        status: 500,
        code: "INTERNAL_SERVER_ERROR",
      } satisfies APIError,
      { status: 500 }
    );
  }
}

// Validation schema for feedback
const feedbackSchema = z.object({
  message: z.string().min(1).max(1000),
});

// POST: Submit feedback for a word
export async function POST(
  request: Request,
  { params }: { params: Promise<{ word: string }> }
) {
  try {
    // Get IP address and apply rate limiting
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0] : "127.0.0.1";
    await rateLimit(ip);

    // Check authentication
    const session = await auth.api.getSession(request);
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          message: "Authentication required",
          status: 401,
          code: "AUTH_REQUIRED",
        } satisfies APIError,
        { status: 401 }
      );
    }

    // Get the word and check if it exists
    const { word } = await params;
    const wordData = await getWord(decodeURIComponent(word));
    if (!wordData) {
      return NextResponse.json(
        {
          message: `Word "${word}" not found`,
          status: 404,
          code: "WORD_NOT_FOUND",
        } satisfies APIError,
        { status: 404 }
      );
    }

    // Validate request body
    const body = await request.json();
    const validationResult = feedbackSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Invalid request body",
          status: 400,
          code: "VALIDATION_ERROR",
          errors: validationResult.error.flatten().fieldErrors,
        } satisfies APIError,
        { status: 400 }
      );
    }

    // Create the feedback
    const feedback = await createWordFeedback(
      session.user.id,
      wordData.id,
      validationResult.data.message
    );

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("POST Feedback - Error:", error);
    if (error instanceof Error && error.message === "Too many requests") {
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
    return NextResponse.json(
      {
        message: "An error occurred",
        status: 500,
        code: "INTERNAL_SERVER_ERROR",
      } satisfies APIError,
      { status: 500 }
    );
  }
}
