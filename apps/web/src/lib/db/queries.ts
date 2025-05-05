import { db } from "@/lib/db";
import {
  aiUsage,
  words,
  wordVotes,
  subscriptions,
  savedWords,
  wordLookups,
  wordHistory,
} from "@/lib/db/schema";
import { desc, eq, ilike, sql, and, isNull } from "drizzle-orm";

export async function searchWords(query: string, limit = 50, offset = 0) {
  const results = await db.transaction(async (tx) => {
    // Get matching words
    const matchingWords = await tx.query.words.findMany({
      columns: { word: true },
      where: ilike(words.word, `%${query}%`),
      limit,
      offset,
      orderBy: (words) => words.word,
    });

    // Get total count
    const [{ count }] = await tx
      .select({ count: sql<number>`count(*)` })
      .from(words)
      .where(ilike(words.word, `%${query}%`));

    return {
      words: matchingWords.map((w) => w.word),
      totalCount: Number(count),
    };
  });

  return results;
}

export async function getWord(word: string, userId?: string | null) {
  console.log("Fetching word: ", word);

  // Single query to get everything we need
  const result = await db.query.words.findFirst({
    where: ilike(words.word, word),
    with: {
      definitions: {
        with: {
          examples: true,
        },
        orderBy: (def) => [def.order],
      },
      votes: {
        // Only get vote count and user's vote status
        columns: {
          userId: true,
        },
      },
      savedBy: {
        // Only get user's save status
        where: userId ? eq(savedWords.userId, userId) : undefined,
        columns: {
          userId: true,
        },
      },
    },
  });

  if (!result) return null;

  return {
    id: result.id,
    word: result.word,
    details: {
      definitions: result.definitions.map((def) => ({
        text: def.text,
        examples: def.examples.map((ex) => ex.text),
      })),
    },
    votes: result.votes.length,
    hasVoted: userId
      ? result.votes.some((vote) => vote.userId === userId)
      : false,
    isSaved: userId ? result.savedBy.length > 0 : false,
  };
}

export async function wordExists(word: string): Promise<boolean> {
  const result = await db.query.words.findFirst({
    where: ilike(words.word, word),
  });

  return !!result;
}

export async function getRandomWords(limit: number = 50): Promise<string[]> {
  const randomWords = await db
    .select({ word: words.word })
    .from(words)
    .orderBy(sql`RANDOM()`)
    .limit(limit);

  return randomWords.map((row) => row.word);
}

export async function getWordsByLetter(letter: string) {
  return db.query.words.findMany({
    columns: {
      word: true,
      updatedAt: true,
    },
    where: ilike(words.word, `${letter}%`),
    orderBy: (words) => words.word,
  });
}

export async function getUniqueFirstLetters() {
  const letters = await db
    .select({
      firstLetter: sql<string>`LOWER(LEFT(${words.word}, 1))`,
    })
    .from(words)
    .groupBy(sql`LOWER(LEFT(${words.word}, 1))`)
    .orderBy(sql`LOWER(LEFT(${words.word}, 1))`);

  return letters.map((l) => l.firstLetter);
}
export async function getAIUsage(userId: string) {
  return db.query.aiUsage.findFirst({
    where: eq(aiUsage.userId, userId),
    orderBy: (aiUsage) => desc(aiUsage.createdAt),
  });
}

export async function getWordVotes(wordId: string) {
  console.log("Getting word votes for: ", wordId);
  const result = await db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(wordVotes)
    .where(eq(wordVotes.wordId, wordId));

  console.log("Result: ", result);

  // Debug: Let's see what's in the votes table for this word
  const allVotes = await db
    .select()
    .from(wordVotes)
    .where(eq(wordVotes.wordId, wordId));
  console.log("All votes for word:", allVotes);

  return Number(result[0].count);
}

export async function hasUserVotedWord(userId: string, wordId: string) {
  const vote = await db.query.wordVotes.findFirst({
    where: sql`${wordVotes.userId} = ${userId} AND ${wordVotes.wordId} = ${wordId}`,
  });

  console.log("Checking if user voted:", { userId, wordId, hasVoted: !!vote });
  return !!vote;
}

export async function createWordVote(userId: string, wordId: string) {
  console.log("Creating vote:", { userId, wordId });

  // Debug: Let's see if the vote already exists
  const existingVote = await db.query.wordVotes.findFirst({
    where: sql`${wordVotes.userId} = ${userId} AND ${wordVotes.wordId} = ${wordId}`,
  });
  console.log("Existing vote:", existingVote);

  const result = await db
    .insert(wordVotes)
    .values({
      userId,
      wordId,
    })
    .returning();

  console.log("Create vote result:", result);
  return result;
}

export async function deleteWordVote(userId: string, wordId: string) {
  return db
    .delete(wordVotes)
    .where(
      sql`${wordVotes.userId} = ${userId} AND ${wordVotes.wordId} = ${wordId}`
    );
}

/**
 * Get the most relevant subscription for a user, prioritizing active and trialing subscriptions
 * over incomplete ones.
 */
export async function getActiveSubscription(userId: string) {
  return await db.query.subscriptions.findFirst({
    where: eq(subscriptions.referenceId, userId),
    orderBy: [
      sql`CASE 
        WHEN ${subscriptions.status} = 'active' THEN 1
        WHEN ${subscriptions.status} = 'trialing' THEN 2
        ELSE 3
      END`,
      desc(subscriptions.periodStart),
    ],
  });
}

export async function getSavedWords(userId: string, limit = 50, offset = 0) {
  const results = await db.transaction(async (tx) => {
    // Get saved words with their save date
    const savedWordsList = await tx.query.savedWords.findMany({
      where: eq(savedWords.userId, userId),
      limit,
      offset,
      orderBy: desc(savedWords.createdAt),
      with: {
        word: {
          columns: {
            word: true,
          },
        },
      },
    });

    // Get total count
    const [{ count }] = await tx
      .select({ count: sql<number>`count(*)` })
      .from(savedWords)
      .where(eq(savedWords.userId, userId));

    return {
      words: savedWordsList.map((sw) => sw.word.word),
      totalCount: Number(count),
    };
  });

  return results;
}

export async function hasUserSavedWord(userId: string, wordId: string) {
  const saved = await db.query.savedWords.findFirst({
    where: sql`${savedWords.userId} = ${userId} AND ${savedWords.wordId} = ${wordId}`,
  });

  return !!saved;
}

export async function saveWord(userId: string, wordId: string) {
  return db
    .insert(savedWords)
    .values({
      userId,
      wordId,
    })
    .onConflictDoNothing()
    .returning();
}

export async function unsaveWord(userId: string, wordId: string) {
  return db
    .delete(savedWords)
    .where(
      sql`${savedWords.userId} = ${userId} AND ${savedWords.wordId} = ${wordId}`
    );
}

export async function getWordLookups(userId: string | null, ip: string) {
  if (userId) {
    // For logged-in users, only use userId
    return await db.query.wordLookups.findFirst({
      where: eq(wordLookups.userId, userId),
    });
  } else {
    // For anonymous users, use IP
    return await db.query.wordLookups.findFirst({
      where: and(eq(wordLookups.ipAddress, ip), isNull(wordLookups.userId)),
    });
  }
}

export async function createWordLookups(data: {
  userId: string | null;
  ipAddress: string;
  resetAt: Date;
}) {
  const [lookupData] = await db
    .insert(wordLookups)
    .values({
      userId: data.userId,
      ipAddress: data.ipAddress,
      count: 0,
      resetAt: data.resetAt,
    })
    .returning();

  return lookupData;
}

export async function updateWordLookups(
  userId: string | null,
  ip: string,
  data: {
    count?: number;
    resetAt?: Date;
  }
) {
  const [updatedData] = await db
    .update(wordLookups)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(
      userId
        ? eq(wordLookups.userId, userId)
        : and(eq(wordLookups.ipAddress, ip), isNull(wordLookups.userId))
    )
    .returning();

  return updatedData;
}

export async function incrementWordLookups(userId: string | null, ip: string) {
  const [updatedData] = await db
    .update(wordLookups)
    .set({
      count: sql`${wordLookups.count} + 1`,
      updatedAt: new Date(),
    })
    .where(
      userId
        ? eq(wordLookups.userId, userId)
        : and(eq(wordLookups.ipAddress, ip), isNull(wordLookups.userId))
    )
    .returning();

  return updatedData;
}

export async function hasUserViewedWord(
  userId: string | null,
  ip: string,
  wordId: string
) {
  return await db.query.wordHistory.findFirst({
    where: userId
      ? sql`${wordHistory.userId} = ${userId} AND ${wordHistory.wordId} = ${wordId}`
      : sql`${wordHistory.ipAddress} = ${ip} AND ${wordHistory.wordId} = ${wordId}`,
  });
}

export async function trackWordView(
  userId: string | null,
  ip: string,
  wordId: string
) {
  return await db
    .insert(wordHistory)
    .values({
      userId,
      ipAddress: ip,
      wordId,
    })
    .onConflictDoNothing()
    .returning();
}
