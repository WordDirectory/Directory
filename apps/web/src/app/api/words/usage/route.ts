import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { wordLookups } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { getActiveSubscription } from "@/lib/db/queries";
import { rateLimit } from "@/lib/rate-limit";
import { createWordLookups } from "@/lib/db/queries";
import { WordUsageResponse } from "@/types/api";

export async function GET(request: Request) {
  try {
    // Get IP address and apply rate limiting
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

    // Apply rate limiting
    await rateLimit(ip);

    // Get session
    const session = await auth.api.getSession(request);

    // Get subscription data if user is logged in
    const subscriptionData = session?.user?.id
      ? await getActiveSubscription(session.user.id)
      : null;

    console.log("Subscription data:", subscriptionData);

    // Get lookup tracking data
    const lookupData = await db.query.wordLookups.findFirst({
      where: session?.user?.id
        ? eq(wordLookups.userId, session.user.id)
        : and(eq(wordLookups.ipAddress, ip), isNull(wordLookups.userId)),
    });

    console.log("Lookup data:", lookupData);

    // Default limit based on plan AND status
    const limit =
      subscriptionData?.plan === "plus" &&
      ["active", "trialing", "past_due"].includes(
        subscriptionData?.status || ""
      )
        ? 999999999
        : 10;

    console.log("Calculated limit:", limit);

    // If no lookup data found, create it
    if (!lookupData && session?.user?.id) {
      const newLookupData = await createWordLookups({
        userId: session.user.id,
        ipAddress: ip,
        resetAt: new Date(new Date().setDate(new Date().getDate() + 30)),
      });

      return NextResponse.json<{
        usage: WordUsageResponse;
      }>({
        usage: {
          current: newLookupData.count,
          limit,
          plan: subscriptionData?.plan || "free",
          nextReset: newLookupData.resetAt.toISOString(),
        },
      });
    }

    // If still no lookup data (no session), return defaults
    if (!lookupData) {
      return NextResponse.json<{
        usage: WordUsageResponse;
      }>({
        usage: {
          current: 0,
          limit,
          plan: subscriptionData?.plan || "free",
          nextReset: new Date(
            new Date().setDate(new Date().getDate() + 30)
          ).toISOString(),
        },
      });
    }

    return NextResponse.json<{
      usage: WordUsageResponse;
    }>({
      usage: {
        current: lookupData.count,
        limit,
        plan: subscriptionData?.plan || "free",
        nextReset: lookupData.resetAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching word lookup usage:", error);

    if (error instanceof Error && error.message === "Too many requests") {
      return NextResponse.json(
        {
          message: "Too many requests. Please slow down.",
          status: 429,
          code: "RATE_LIMIT_EXCEEDED",
        },
        {
          status: 429,
          headers: { "Retry-After": "60" },
        }
      );
    }

    return NextResponse.json(
      {
        message: "Failed to fetch word lookup usage",
        status: 500,
        code: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
