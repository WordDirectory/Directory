import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
import { auth } from "@/lib/auth";
import {
  getWord,
  createWordReport,
  deleteWordReport,
  hasUserReportedWord,
} from "@/lib/db/queries";
import { APIError } from "@/types/api";

// GET: Check if user has reported
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

    // Check if user has reported (if authenticated)
    const session = await auth.api.getSession(request);
    const hasReported = session?.user?.id
      ? await hasUserReportedWord(session.user.id, wordData.id)
      : false;

    return NextResponse.json({
      hasReported,
    });
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

// POST: Add a report
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

    // Check if user has already reported
    const hasReported = await hasUserReportedWord(session.user.id, wordData.id);

    if (hasReported) {
      return NextResponse.json(
        {
          message: "You have already reported this word",
          status: 400,
          code: "ALREADY_VOTED",
        } satisfies APIError,
        { status: 400 }
      );
    }

    // Create the report
    await createWordReport(session.user.id, wordData.id);

    return NextResponse.json({ hasReported: true });
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

// DELETE: Remove a report
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

    // Delete the report
    await deleteWordReport(session.user.id, wordData.id);

    return NextResponse.json({ hasReported: false });
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
