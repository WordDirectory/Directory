import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { wordExists } from "@/lib/db/queries";
import { elevenlabsRateLimit } from "@/lib/rate-limit";

// Default voice ID for a natural, clear voice from ElevenLabs
const DEFAULT_VOICE_ID = "TX3LPaxmHKxFdv7VOQHJ";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ word: string }> }
) {
  try {
    // Get IP address from X-Forwarded-For header or fallback to a default
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0] : "127.0.0.1";

    // Apply strict rate limiting for expensive ElevenLabs API calls
    await elevenlabsRateLimit(ip);

    // Decode the URL-encoded word parameter
    const { word } = await params;
    const decodedWord = decodeURIComponent(word).trim();

    // Check if word exists
    const exists = await wordExists(decodedWord);
    if (!exists) {
      return new NextResponse(null, { status: 404 });
    }

    // Call ElevenLabs API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${DEFAULT_VOICE_ID}`,
      {
        method: "POST",
        headers: {
          Accept: "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": process.env.ELEVEN_LABS_API_KEY!,
        },
        body: JSON.stringify({
          text: decodedWord,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.75,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error("ElevenLabs API error:", await response.text());
      return new NextResponse(null, { status: 500 });
    }

    // Get the audio data
    const audioData = await response.arrayBuffer();

    // Return the audio with appropriate headers
    return new NextResponse(audioData, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=31536000", // Cache for 1 year
      },
    });
  } catch (error: unknown) {
    console.error("Error in audio generation:", error);

    if (error instanceof Error) {
      if (error.message === "Too many ElevenLabs requests") {
        return new NextResponse(null, {
          status: 429,
          headers: {
            "Retry-After": "60",
          },
        });
      }
    }

    return new NextResponse(null, { status: 500 });
  }
}
