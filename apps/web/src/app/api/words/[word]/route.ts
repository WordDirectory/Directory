import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
import { getWord } from "@/lib/db/queries";
import {
  WordLookupError,
  checkWordLookupLimit,
  trackWordView,
  incrementWordLookupCount,
  hasUserViewedWord,
} from "@/lib/word-limits";
import { auth } from "@/lib/auth";
import lemmatizer from "@/lib/lemmatizer";

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
    // Get IP address from X-Forwarded-For header or fallback to a default
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0] : "127.0.0.1";
    const session = await auth.api.getSession(request);
    const userId = session?.user?.id || null;

    console.log("[Word API] Request details:", {
      ip,
      userId,
      session: !!session,
      headers: Object.fromEntries(headersList.entries()),
    });

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

    console.log("[Word API] Looking up word:", {
      word: capitalizedWord,
      userId,
      ip,
    });

    // Get only the word content without social data
    let result = await getWord(capitalizedWord);

    // If word doesn't exist, try lemmatization
    if (!result) {
      console.log("[Word API] Word not found, trying lemmatization");
      
      // Try verb form first
      const verbLemmas = lemmatizer.only_lemmas(decodedWord.toLowerCase(), 'verb');
      if (verbLemmas.length > 0) {
        const baseWord = verbLemmas[0];
        const capitalizedBase = baseWord.charAt(0).toUpperCase() + baseWord.slice(1);
        console.log("[Word API] Found verb lemma:", capitalizedBase);
        result = await getWord(capitalizedBase);
      }
      
      // If no result, try noun form
      if (!result) {
        const nounLemmas = lemmatizer.only_lemmas(decodedWord.toLowerCase(), 'noun');
        if (nounLemmas.length > 0) {
          const baseWord = nounLemmas[0];
          const capitalizedBase = baseWord.charAt(0).toUpperCase() + baseWord.slice(1);
          console.log("[Word API] Found noun lemma:", capitalizedBase);
          result = await getWord(capitalizedBase);
        }
      }
    }

    // If word exists (either directly or through lemmatization), track the lookup and return the content
    if (result) {
      try {
        console.log("[Word API] Word found, checking if previously viewed:", {
          wordId: result.id,
          userId,
          ip,
        });

        // First check if user has already viewed this word
        const hasViewed = await hasUserViewedWord(userId, ip, result.id);
        
        // Only check limits and increment count if this is a new view
        if (!hasViewed) {
          console.log("[Word API] New view, checking limits");
          // Check lookup limit first
          await checkWordLookupLimit(userId, ip);

          console.log("[Word API] Limits OK, incrementing count");
          await incrementWordLookupCount(userId, ip);
          console.log("[Word API] Count incremented");
        } else {
          console.log("[Word API] Word previously viewed, skipping limits");
        }

        // Always track the view attempt (this is idempotent)
        console.log("[Word API] Tracking view");
        await trackWordView(request, result.id);

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
      } catch (error) {
        console.log("[Word API] Error in lookup:", error);
        if ((error as WordLookupError)?.code === "LOOKUP_LIMIT_REACHED") {
          console.log("[Word API] Hit lookup limit, preparing redirect");
          const limitUrl = new URL("/word-limit-reached", request.url);
          limitUrl.searchParams.set("word", capitalizedWord);
          limitUrl.searchParams.set(
            "usage",
            JSON.stringify((error as WordLookupError).usage)
          );
          console.log("[Word API] Redirecting to:", limitUrl.toString());
          return NextResponse.redirect(limitUrl);
        }
        throw error;
      }
    }

    // If word doesn't exist and we have a fallback URL, redirect there
    if (fallback) {
      return NextResponse.redirect(fallback);
    }

    // If no fallback provided, redirect to the not-found page with proper status
    const notFoundUrl = new URL("/words/not-found", request.url);
    notFoundUrl.searchParams.set("word", capitalizedWord);
    return NextResponse.redirect(notFoundUrl, { status: 307 });
  } catch (error) {
    console.error("[Word API] Unhandled error:", error);
    throw error;
  }
}
