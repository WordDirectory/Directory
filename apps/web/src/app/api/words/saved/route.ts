import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
import { getSavedWords } from "@/lib/db/queries";
import { auth } from "@/lib/auth";
import { APIError } from "@/types/api";
import { z } from "zod";

// Request validation schema
const querySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform(Number)
    .pipe(z.number().min(1).max(100)),
  offset: z.string().optional().transform(Number).pipe(z.number().min(0)),
});

export async function GET(request: Request) {
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
        message: "You must be logged in to view saved words",
        status: 401,
        code: "AUTH_REQUIRED",
      };
      return NextResponse.json(error, { status: 401 });
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const result = querySchema.safeParse({
      limit: searchParams.get("limit") ?? "50",
      offset: searchParams.get("offset") ?? "0",
    });

    if (!result.success) {
      const error: APIError = {
        message: "Invalid query parameters",
        code: "VALIDATION_ERROR",
        status: 400,
        errors: result.error.flatten().fieldErrors,
      };
      return NextResponse.json(error, { status: 400 });
    }

    const { limit, offset } = result.data;

    // Get saved words
    const savedWords = await getSavedWords(session.user.id, limit, offset);

    return NextResponse.json(savedWords);
  } catch (error: unknown) {
    console.error("[Get Saved Words API Error]", error);

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
        message: "An error occurred while fetching saved words",
        status: 500,
      },
      { status: 500 }
    );
  }
}
