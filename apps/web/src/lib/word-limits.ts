import { headers } from "next/headers";
import { auth } from "./auth";
import { db } from "./db";
import { wordLookups } from "./db/schema";
import { eq, sql, and, isNull } from "drizzle-orm";
import {
  getActiveSubscription,
  hasUserViewedWord,
  trackWordView as dbTrackWordView,
} from "./db/queries";
import { WordUsageResponse } from "@/types/api";

export type WordLookupError = {
  message: string;
  code: "LOOKUP_LIMIT_REACHED";
  status: 429;
  usage: WordUsageResponse;
};

function getNextResetDate() {
  const resetAt = new Date();
  resetAt.setMonth(resetAt.getMonth() + 1);
  resetAt.setDate(1);
  resetAt.setHours(0, 0, 0, 0);
  return resetAt;
}

async function getOrCreateLookupData(userId: string | null, ip: string) {
  console.log("[Word Limits] Getting lookup data:", { userId, ip });

  // If user is logged in, we only care about user ID, not IP
  if (userId) {
    console.log("[Word Limits] User is logged in, looking up by user ID");

    // Try to get the data based on user ID
    let lookupData = await db.query.wordLookups.findFirst({
      where: eq(wordLookups.userId, userId),
    });

    console.log("[Word Limits] User lookup data:", lookupData);

    // If no lookup data exists, create a new record
    if (!lookupData) {
      console.log(
        "[Word Limits] No user lookup data found, creating new record"
      );

      // First check if there's an IP-based record we should migrate
      const ipLookups = await db.query.wordLookups.findFirst({
        where: and(eq(wordLookups.ipAddress, ip), isNull(wordLookups.userId)),
      });

      console.log("[Word Limits] Found IP lookups to migrate:", ipLookups);

      const [newLookupData] = await db
        .insert(wordLookups)
        .values({
          userId: userId,
          ipAddress: ip,
          count: ipLookups?.count || 0,
          resetAt: ipLookups?.resetAt || getNextResetDate(),
        })
        .returning();

      console.log("[Word Limits] Created new user lookup data:", newLookupData);

      // If we found and migrated an IP-based record, delete it
      if (ipLookups) {
        console.log("[Word Limits] Deleting migrated IP lookup data");
        await db
          .delete(wordLookups)
          .where(
            and(eq(wordLookups.ipAddress, ip), isNull(wordLookups.userId))
          );
      }

      lookupData = newLookupData;
    }

    // Check if we need to reset the counter
    if (lookupData && lookupData.resetAt < new Date()) {
      console.log("[Word Limits] Resetting counter for user");
      lookupData.count = 0;
      lookupData.resetAt = getNextResetDate();
      await db
        .update(wordLookups)
        .set({
          count: 0,
          resetAt: lookupData.resetAt,
          updatedAt: new Date(),
        })
        .where(eq(wordLookups.userId, userId));
    }

    return lookupData;
  }

  console.log("[Word Limits] User not logged in, using IP-based lookup");

  // For anonymous users, use IP-based lookup
  let lookupData = await db.query.wordLookups.findFirst({
    where: and(eq(wordLookups.ipAddress, ip), isNull(wordLookups.userId)),
  });

  console.log("[Word Limits] Anonymous lookup data:", lookupData);

  // Check if we need to reset the counter
  if (lookupData && lookupData.resetAt < new Date()) {
    console.log("[Word Limits] Resetting counter for anonymous user");
    lookupData.count = 0;
    lookupData.resetAt = getNextResetDate();
    await db
      .update(wordLookups)
      .set({
        count: 0,
        resetAt: lookupData.resetAt,
        updatedAt: new Date(),
      })
      .where(and(eq(wordLookups.ipAddress, ip), isNull(wordLookups.userId)));
  }

  // If no lookup data exists at all, create a new record
  if (!lookupData) {
    console.log("[Word Limits] Creating new anonymous lookup data");
    const [newLookupData] = await db
      .insert(wordLookups)
      .values({
        userId: null,
        ipAddress: ip,
        count: 0,
        resetAt: getNextResetDate(),
      })
      .returning();

    console.log(
      "[Word Limits] Created new anonymous lookup data:",
      newLookupData
    );
    lookupData = newLookupData;
  }

  return lookupData;
}

export async function checkWordLookupLimit(
  userId: string | null,
  ip: string
): Promise<void> {
  console.log("[Word Limits] Checking lookup limit:", { userId, ip });

  const subscriptionData = userId ? await getActiveSubscription(userId) : null;
  console.log("[Word Limits] Subscription data:", subscriptionData);

  const lookupData = await getOrCreateLookupData(userId, ip);
  console.log("[Word Limits] Got lookup data:", lookupData);

  // Default limit based on plan AND status
  const limit =
    subscriptionData?.plan === "plus" &&
    ["active", "trialing", "past_due"].includes(subscriptionData?.status || "")
      ? 999999999
      : 10;

  console.log("[Word Limits] Calculated limit:", {
    limit,
    count: lookupData.count,
  });

  if (lookupData.count >= limit) {
    console.log("[Word Limits] Limit reached, throwing error");
    const error: WordLookupError = {
      message:
        "Word lookup limit reached. Sign up for Plus for unlimited lookups!",
      code: "LOOKUP_LIMIT_REACHED",
      status: 429,
      usage: {
        current: lookupData.count,
        limit,
        plan: subscriptionData?.plan || "free",
        nextReset: lookupData.resetAt.toISOString(),
      },
    };
    throw error;
  }
}

export async function incrementWordLookupCount(
  userId: string | null,
  ip: string
): Promise<void> {
  console.log("[Word Limits] Incrementing count:", { userId, ip });

  // For logged-in users, only use userId in the where clause
  if (userId) {
    console.log("[Word Limits] Incrementing for user");
    const result = await db
      .update(wordLookups)
      .set({
        count: sql`${wordLookups.count} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(wordLookups.userId, userId))
      .returning();
    console.log("[Word Limits] User increment result:", result);
  } else {
    console.log("[Word Limits] Incrementing for anonymous user");
    const result = await db
      .update(wordLookups)
      .set({
        count: sql`${wordLookups.count} + 1`,
        updatedAt: new Date(),
      })
      .where(and(eq(wordLookups.ipAddress, ip), isNull(wordLookups.userId)))
      .returning();
    console.log("[Word Limits] Anonymous increment result:", result);
  }
}

export async function trackWordView(
  request: Request,
  wordId: string
): Promise<void> {
  const session = await auth.api.getSession(request);
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const userId = session?.user?.id || null;

  // Check if user has viewed this word before
  const hasViewed = await hasUserViewedWord(userId, ip, wordId);
  if (hasViewed) {
    return;
  }

  // Track this word view
  await dbTrackWordView(userId, ip, wordId);
}
