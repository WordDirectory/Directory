import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
import {
  getWord,
  saveWord,
  unsaveWord,
  hasUserSavedWord,
} from "@/lib/db/queries";
import { auth } from "@/lib/auth";
import { APIError } from "@/types/api";

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

    // Check authentication
    const session = await auth.api.getSession(request);
    if (!session || !session.user.id) {
      const error: APIError = {
        message: "You must be logged in to check saved words",
        status: 401,
        code: "AUTH_REQUIRED",
      };
      return NextResponse.json(error, { status: 401 });
    }

    // Get word details and verify it exists
    const { word } = await params;
    const wordDetails = await getWord(decodeURIComponent(word));
    if (!wordDetails) {
      const error: APIError = {
        message: `Word "${word}" not found`,
        status: 404,
        code: "WORD_NOT_FOUND",
      };
      return NextResponse.json(error, { status: 404 });
    }

    // Check if word is saved
    const isSaved = await hasUserSavedWord(session.user.id, wordDetails.id);

    return NextResponse.json({ isSaved });
  } catch (error: unknown) {
    console.error("[Check Save Word API Error]", error);

    if (error instanceof Error) {
      if (error.message === "Too many requests") {
        return NextResponse.json(
          {
            message: "Too many requests. Please slow down.",
            status: 429,
            code: "RATE_LIMIT_EXCEEDED",
          },
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
        message: "An error occurred while checking word save status",
        status: 500,
      },
      { status: 500 }
    );
  }
}

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
    if (!session || !session.user.id) {
      const error: APIError = {
        message: "You must be logged in to save words",
        status: 401,
        code: "AUTH_REQUIRED",
      };
      return NextResponse.json(error, { status: 401 });
    }

    // Get word details and verify it exists
    const { word } = await params;
    const wordDetails = await getWord(decodeURIComponent(word));
    if (!wordDetails) {
      const error: APIError = {
        message: `Word "${word}" not found`,
        status: 404,
        code: "WORD_NOT_FOUND",
      };
      return NextResponse.json(error, { status: 404 });
    }

    // Save the word
    await saveWord(session.user.id, wordDetails.id);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("[Save Word API Error]", error);

    if (error instanceof Error) {
      if (error.message === "Too many requests") {
        return NextResponse.json(
          {
            message: "Too many requests. Please slow down.",
            status: 429,
            code: "RATE_LIMIT_EXCEEDED",
          },
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
        message: "An error occurred while saving the word",
        status: 500,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    if (!session || !session.user.id) {
      const error: APIError = {
        message: "You must be logged in to unsave words",
        status: 401,
        code: "AUTH_REQUIRED",
      };
      return NextResponse.json(error, { status: 401 });
    }

    // Get word details and verify it exists
    const { word } = await params;
    const wordDetails = await getWord(decodeURIComponent(word));
    if (!wordDetails) {
      const error: APIError = {
        message: `Word "${word}" not found`,
        status: 404,
        code: "WORD_NOT_FOUND",
      };
      return NextResponse.json(error, { status: 404 });
    }

    // Unsave the word
    await unsaveWord(session.user.id, wordDetails.id);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("[Unsave Word API Error]", error);

    if (error instanceof Error) {
      if (error.message === "Too many requests") {
        return NextResponse.json(
          {
            message: "Too many requests. Please slow down.",
            status: 429,
            code: "RATE_LIMIT_EXCEEDED",
          },
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
        message: "An error occurred while unsaving the word",
        status: 500,
      },
      { status: 500 }
    );
  }
}
