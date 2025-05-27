import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
import { searchWords } from "@/lib/db/queries";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    // Get IP address from X-Forwarded-For header or fallback to a default
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0] : "127.0.0.1";

    // Apply rate limiting
    await rateLimit(ip);

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "50", 10),
      100
    ); // Max 100 results
    const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0);

    const results = await searchWords(query, limit, offset);

    return NextResponse.json(results);
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

    return new NextResponse(null, { status: 500 });
  }
}
