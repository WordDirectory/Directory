import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
import { getWord } from "@/lib/db/queries";
import { APIError } from "@/types/api";

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
    console.log("Raw word parameter: ", word);
    const decodedWord = decodeURIComponent(word).trim();
    console.log("Decoded word: ", decodedWord)
    const capitalizedWord =
      decodedWord.charAt(0).toUpperCase() + decodedWord.slice(1).toLowerCase();
    console.log("Capitalized word: ", capitalizedWord);
    const result = await getWord(capitalizedWord);
    console.log("Result", result)

    if (result) {
      return new NextResponse(null, { status: 200 });
    }

    return new NextResponse(null, { status: 404 });
  } catch (error: unknown) {
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

    console.log(`[Debug] Fetching word: ${capitalizedWord}`);
    const result = await getWord(capitalizedWord);
    console.log(`[Debug] Word fetch result:`, result ? "Found" : "Not found");

    // If word exists and we have a next URL, redirect there
    if (result && next) {
      return NextResponse.redirect(next);
    }

    // If word exists, return the data
    if (result) {
      return NextResponse.json(result);
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
    // Detailed error logging
    console.error("[Word API Error] Details:", {
      error:
        error instanceof Error
          ? {
              message: error.message,
              stack: error.stack,
              name: error.name,
            }
          : error,
      word: params,
      timestamp: new Date().toISOString(),
    });

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
