import { db } from "@/lib/db";
import { aiUsage, words } from "@/lib/db/schema";
import { desc, eq, ilike, sql } from "drizzle-orm";

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

export async function getWord(word: string) {
  const result = await db.query.words.findFirst({
    where: eq(words.word, word),
    with: {
      definitions: {
        with: {
          examples: true,
        },
        orderBy: (def) => [def.order],
      },
    },
  });

  if (!result) return null;

  return {
    word: result.word,
    details: {
      definitions: result.definitions.map((def) => ({
        text: def.text,
        examples: def.examples.map((ex) => ex.text),
      })),
    },
  };
}

export async function wordExists(word: string): Promise<boolean> {
  const result = await db.query.words.findFirst({
    where: eq(words.word, word),
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
