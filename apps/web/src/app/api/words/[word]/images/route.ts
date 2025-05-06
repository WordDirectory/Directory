// /api/words/[word]/images
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
import { getWord } from "@/lib/db/queries";
import { APIError } from "@/types/api";

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

    // Decode the URL-encoded word parameter
    const { word } = await params;
    const decodedWord = decodeURIComponent(word).trim();

    // Check if word exists
    const wordData = await getWord(decodedWord);
    if (!wordData) {
      const error: APIError = {
        message: `Word "${word}" not found`,
        status: 404,
        code: "WORD_NOT_FOUND",
      };
      return NextResponse.json(error, { status: 404 });
    }

    // Call Unsplash API
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(decodedWord)}&per_page=10`,
      {
        headers: {
          Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY!}`,
        },
      }
    );

    if (!response.ok) {
      console.error("Unsplash API error:", await response.text());
      return NextResponse.json(
        {
          message: "Failed to fetch images",
          status: 500,
          code: "UNSPLASH_API_ERROR",
        } satisfies APIError,
        { status: 500 }
      );
    }

    const data = await response.json();
    
    // Map to simplified response format
    const images = data.results.map((image: any) => ({
      id: image.id,
      url: image.urls.regular,
      alt: image.alt_description || decodedWord,
      user: {
        name: image.user.name,
        username: image.user.username,
      },
    }));

    return NextResponse.json({ images });
  } catch (error) {
    console.error("[Images API Error]", error);

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
            headers: {
              "Retry-After": "60",
            },
          }
        );
      }

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
        message: "An error occurred while fetching images",
        status: 500,
        code: "INTERNAL_SERVER_ERROR",
      } satisfies APIError,
      { status: 500 }
    );
  }
}