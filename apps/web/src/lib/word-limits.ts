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
  // First, try to get the data based on user ID if available
  let lookupData = userId
    ? await db.query.wordLookups.findFirst({
        where: eq(wordLookups.userId, userId),
      })
    : null;

  // If we have a user ID but no lookup data, check if there's an IP-based record
  // that should be migrated to this user
  if (userId && !lookupData) {
    const ipBasedLookup = await db.query.wordLookups.findFirst({
      where: and(eq(wordLookups.ipAddress, ip), isNull(wordLookups.userId)),
    });

    if (ipBasedLookup) {
      // Migrate the IP-based record to the user
      console.log("[Word Limits] Migrating IP-based lookup to user", {
        ip,
        userId,
        count: ipBasedLookup.count,
      });

      // Create a new record with the user ID and the count from the IP record
      const [newUserLookupData] = await db
        .insert(wordLookups)
        .values({
          userId: userId,
          ipAddress: ip,
          count: ipBasedLookup.count,
          resetAt: ipBasedLookup.resetAt,
        })
        .returning();

      // Delete the IP-based record to avoid duplication
      await db
        .delete(wordLookups)
        .where(and(eq(wordLookups.ipAddress, ip), isNull(wordLookups.userId)));

      lookupData = newUserLookupData;
    }
  }

  // If still no user-based lookup data, then try IP-based lookup for anonymous users
  if (!lookupData && !userId) {
    lookupData = await db.query.wordLookups.findFirst({
      where: and(eq(wordLookups.ipAddress, ip), isNull(wordLookups.userId)),
    });
  }

  // Check if we need to reset the counter
  if (lookupData && lookupData.resetAt < new Date()) {
    lookupData.count = 0;
    lookupData.resetAt = getNextResetDate();
    await db
      .update(wordLookups)
      .set({
        count: 0,
        resetAt: lookupData.resetAt,
        updatedAt: new Date(),
      })
      .where(
        userId
          ? eq(wordLookups.userId, userId)
          : and(eq(wordLookups.ipAddress, ip), isNull(wordLookups.userId))
      );
  }

  // If no lookup data exists at all, create a new record
  if (!lookupData) {
    console.log("[Word Limits] Creating new lookup data", {
      userId,
      ip,
    });

    const [newLookupData] = await db
      .insert(wordLookups)
      .values({
        userId: userId,
        ipAddress: ip,
        count: 0,
        resetAt: getNextResetDate(),
      })
      .returning();
    lookupData = newLookupData;
  }

  return lookupData;
}

export async function checkWordLookupLimit(
  userId: string | null,
  ip: string
): Promise<void> {
  const subscriptionData = userId ? await getActiveSubscription(userId) : null;
  const lookupData = await getOrCreateLookupData(userId, ip);

  // Default limit based on plan AND status
  const limit =
    subscriptionData?.plan === "plus" && subscriptionData?.status === "active"
      ? Infinity
      : 10;

  if (lookupData.count >= limit) {
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
  await db
    .update(wordLookups)
    .set({
      count: sql`${wordLookups.count} + 1`,
      updatedAt: new Date(),
    })
    .where(
      userId
        ? eq(wordLookups.userId, userId)
        : and(eq(wordLookups.ipAddress, ip), isNull(wordLookups.userId))
    );
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
