import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { audioRateLimit } from "@/lib/rate-limit";
import { getBestWordPronunciation } from "@/lib/db/queries";
import { APIError, WordPronunciationResponse } from "@/types/api";
import { db } from "@/lib/db";
import { words, wordPronunciations } from "@/lib/db/schema";
import { eq, ilike } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ word: string }> }
) {
  try {
    // Get IP address from X-Forwarded-For header or fallback to a default
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0] : "127.0.0.1";

    // Apply stricter rate limiting for audio requests
    await audioRateLimit(ip);

    // Decode the URL-encoded word parameter
    const { word } = await params;
    const decodedWord = decodeURIComponent(word).trim();

    // Get the best pronunciation from database
    const pronunciation = await getBestWordPronunciation(decodedWord);

    console.log(`[Pronunciation API] Pronunciation found:`, {
      found: !!pronunciation,
      videoId: pronunciation?.videoId,
      timestampStart: pronunciation?.timestampStart,
      timestampEnd: pronunciation?.timestampEnd,
      confidenceScore: pronunciation?.confidenceScore,
      duration: pronunciation
        ? pronunciation.timestampEnd - pronunciation.timestampStart
        : null,
    });

    // Debug: Check how many pronunciations exist for this word
    const allPronunciations = await db
      .select()
      .from(wordPronunciations)
      .where(ilike(wordPronunciations.word, decodedWord));

    if (!pronunciation) {
      return NextResponse.json(
        {
          message: `We don't have any pronunciation examples for "${decodedWord}" yet. Try the "Pronounce" button for AI-generated audio instead!`,
          status: 404,
          code: "PRONUNCIATION_NOT_FOUND",
        } satisfies APIError,
        { status: 404 }
      );
    }

    // Return YouTube playback data for client-side audio playback
    const response: WordPronunciationResponse = {
      videoId: pronunciation.videoId,
      timestampStart: pronunciation.timestampStart,
      timestampEnd: pronunciation.timestampEnd,
      confidenceScore: pronunciation.confidenceScore,
      duration: pronunciation.timestampEnd - pronunciation.timestampStart,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("Error in pronunciation API:", error);

    if (error instanceof Error) {
      if (error.message === "Too many audio requests") {
        return NextResponse.json(
          {
            message: "Too many audio requests. Please slow down.",
            status: 429,
            code: "RATE_LIMIT_EXCEEDED",
          } satisfies APIError,
          {
            status: 429,
            headers: { "Retry-After": "60" },
          }
        );
      }
    }

    return NextResponse.json(
      {
        message: "Internal server error",
        status: 500,
        code: "INTERNAL_SERVER_ERROR",
      } satisfies APIError,
      { status: 500 }
    );
  }
}
