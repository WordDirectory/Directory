import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
import { getWord } from "@/lib/db/queries";
import { auth } from "@/lib/auth";
import { getWordWithLimits } from "@/lib/word-service";

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

    // Just return if word exists or not, no tracking needed for HEAD requests
    return new NextResponse(null, { status: result ? 200 : 404 });
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
    const { searchParams } = new URL(request.url);
    const next = searchParams.get("next");
    const { word } = await params;

    // If we have a next URL, do a fast redirect without all the tracking bullshit
    if (next) {
      // Just do basic rate limiting and redirect immediately
      const headersList = await headers();
      const forwardedFor = headersList.get("x-forwarded-for");
      const ip = forwardedFor ? forwardedFor.split(",")[0] : "127.0.0.1";

      // Quick rate limit check only
      await rateLimit(ip);

      return NextResponse.redirect(next);
    }

    // Only do the full processing if we're not redirecting
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const userAgent = headersList.get("user-agent");
    const ip = forwardedFor ? forwardedFor.split(",")[0] : "127.0.0.1";
    const session = await auth.api.getSession(request);
    const userId = session?.user?.id || null;
    const fallback = searchParams.get("fallback");

    // Get the word and process it with all limits and tracking
    const result = await getWordWithLimits(
      word,
      userId,
      ip,
      new URL(request.url).origin,
      userAgent
    );

    // Handle the different result types
    switch (result.type) {
      case "success":
        return NextResponse.json(result.data);

      case "limit_reached":
      case "not_found":
        // For these cases, use fallback if provided, otherwise use the service's redirect
        const redirectUrl = fallback || result.redirect?.url;
        if (!redirectUrl) {
          throw new Error("No redirect URL available");
        }

        // For limit_reached, we need to include the usage data
        if (result.type === "limit_reached" && result.usage) {
          const url = new URL(redirectUrl);
          url.searchParams.set("usage", JSON.stringify(result.usage));
          return NextResponse.redirect(url.toString(), {
            status: result.redirect?.status,
          });
        }

        return NextResponse.redirect(redirectUrl, {
          status: result.redirect?.status,
        });

      default:
        throw new Error("Unexpected result type");
    }
  } catch (error) {
    console.error("[Word API] Unhandled error:", error);
    throw error;
  }
}
