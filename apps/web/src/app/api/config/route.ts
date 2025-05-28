import { rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

export async function GET() {
  try {
    // Apply rate limiting
    const headersList = await headers();
    const ip = headersList.get("x-real-ip") || "unknown";
    await rateLimit(ip);

    // Return public config
    return Response.json({
      siteUrl: process.env.SITE_URL,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Too many requests") {
      return Response.json({ error: "Too many requests" }, { status: 429 });
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
