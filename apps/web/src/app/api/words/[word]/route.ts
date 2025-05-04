import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
import { getWord } from "@/lib/db/queries";
import { APIError } from "@/types/api";
import { trackWordLookup, WordLookupError } from "@/lib/word-limits";

export async function HEAD(
  request: Request,
  { params }: { params: Promise<{ word: string }> }
) {
  try {
    // Get IP address from X-Forwarded-For header or fallback to a default
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0] : "127.0.0.1";

    // Apply rate limiting
    await rateLimit(ip);

    // Decode the URL-encoded word parameter
    const { word } = await params;
    const decodedWord = decodeURIComponent(word).trim();
    const capitalizedWord =
      decodedWord.charAt(0).toUpperCase() + decodedWord.slice(1).toLowerCase();
    const result = await getWord(capitalizedWord);

    if (result) {
      // Only track lookup when word is found
      await trackWordLookup(request, result.id);
      return new NextResponse(null, { status: 200 });
    }

    return new NextResponse(null, { status: 404 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "Too many requests") {
        return new NextResponse(null, {
          status: 429,
          headers: {
            "Retry-After": "60",
          },
        });
      }
    }

    // Handle word lookup limit error
    if ((error as WordLookupError)?.code === "LOOKUP_LIMIT_REACHED") {
      return NextResponse.json(error, { status: 429 });
    }

    return new NextResponse(null, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ word: string }> }
) {
  try {
    // Get IP address from X-Forwarded-For header or fallback to a default
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0] : "127.0.0.1";

    // Apply rate limiting
    await rateLimit(ip);

    const { searchParams } = new URL(request.url);
    const fallback = searchParams.get("fallback");
    const next = searchParams.get("next");

    // Decode the URL-encoded word parameter
    const { word } = await params;
    const decodedWord = decodeURIComponent(word).trim();
    const capitalizedWord =
      decodedWord.charAt(0).toUpperCase() + decodedWord.slice(1).toLowerCase();

    // Get only the word content without social data
    const result = await getWord(capitalizedWord);

    // If word exists, track the lookup and return the content
    if (result) {
      // Only track lookup when word is found
      await trackWordLookup(request, result.id);

      // If we have a next URL, redirect there
      if (next) {
        return NextResponse.redirect(next);
      }

      // Otherwise return the word data
      return NextResponse.json({
        id: result.id,
        word: result.word,
        details: result.details,
      });
    }

    // If word doesn't exist and we have a fallback URL, redirect there
    if (fallback) {
      return NextResponse.redirect(fallback);
    }

    // If no fallback provided, return structured 404 error
    return NextResponse.json(
      {
        message: `Word "${capitalizedWord}" not found`,
        status: 404,
        code: "WORD_NOT_FOUND",
      } satisfies APIError,
      { status: 404 }
    );
  } catch (error: unknown) {
    // Handle word lookup limit error
    if ((error as WordLookupError)?.code === "LOOKUP_LIMIT_REACHED") {
      return NextResponse.json(error, { status: 429 });
    }

    if (error instanceof Error && error.message === "Too many requests") {
      return new NextResponse(null, {
        status: 429,
        headers: {
          "Retry-After": "60",
        },
      });
    }

    return new NextResponse(null, { status: 500 });
  }
}
