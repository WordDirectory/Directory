import { headers } from "next/headers";
import { auth } from "./auth";
import { db } from "./db";
import { wordLookups } from "./db/schema";
import { eq, sql } from "drizzle-orm";
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
  // Get or create lookup tracking
  let lookupData = await db.query.wordLookups.findFirst({
    where: userId
      ? eq(wordLookups.userId, userId)
      : eq(wordLookups.ipAddress, ip),
  });

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
        userId ? eq(wordLookups.userId, userId) : eq(wordLookups.ipAddress, ip)
      );
  }

  if (!lookupData) {
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
      userId ? eq(wordLookups.userId, userId) : eq(wordLookups.ipAddress, ip)
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
