import { headers } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
import { getWord } from "@/lib/db/queries";
import {
  WordLookupError,
  checkWordLookupLimit,
  incrementWordLookupCount,
  hasUserViewedWord,
} from "@/lib/word-limits";
import lemmatizer from "@/lib/lemmatizer";
import { trackWordView as dbTrackWordView } from "@/lib/db/queries";

export interface WordServiceResult {
  type: "success" | "limit_reached" | "not_found";
  data?: {
    id: string;
    word: string;
    details: {
      definitions: {
        text: string;
        examples: string[];
      }[];
    };
  };
  redirect?: {
    url: string;
    status?: number;
  };
  usage?: any; // For limit reached case
}

export async function getWordWithLimits(
  word: string,
  userId: string | null,
  ip: string,
  baseUrl: string
): Promise<WordServiceResult> {
  try {
    // Apply rate limiting
    await rateLimit(ip);

    const decodedWord = decodeURIComponent(word).trim();
    const capitalizedWord =
      decodedWord.charAt(0).toUpperCase() + decodedWord.slice(1).toLowerCase();

    // Get only the word content without social data
    let result = await getWord(capitalizedWord);

    // If word doesn't exist, try lemmatization
    if (!result) {
      // Try verb form first
      const verbLemmas = lemmatizer.only_lemmas(
        decodedWord.toLowerCase(),
        "verb"
      );
      if (verbLemmas.length > 0) {
        const baseWord = verbLemmas[0];
        const capitalizedBase =
          baseWord.charAt(0).toUpperCase() + baseWord.slice(1);
        result = await getWord(capitalizedBase);
      }

      // If no result, try noun form
      if (!result) {
        const nounLemmas = lemmatizer.only_lemmas(
          decodedWord.toLowerCase(),
          "noun"
        );
        if (nounLemmas.length > 0) {
          const baseWord = nounLemmas[0];
          const capitalizedBase =
            baseWord.charAt(0).toUpperCase() + baseWord.slice(1);
          result = await getWord(capitalizedBase);
        }
      }
    }

    // If word exists (either directly or through lemmatization)
    if (result) {
      // First check if user has already viewed this word
      const hasViewed = await hasUserViewedWord(userId, ip, result.id);

      // Only check limits and increment count if this is a new view
      if (!hasViewed) {
        // Check lookup limit first
        await checkWordLookupLimit(userId, ip);

        await incrementWordLookupCount(userId, ip);
      }

      // Always track the view attempt (this is idempotent)
      await dbTrackWordView(userId, ip, result.id);

      return {
        type: "success",
        data: {
          id: result.id,
          word: result.word,
          details: result.details,
        },
      };
    }

    // If word doesn't exist
    return {
      type: "not_found",
      redirect: {
        url: `${baseUrl}/words/not-found?word=${encodeURIComponent(capitalizedWord)}`,
        status: 307,
      },
    };
  } catch (error) {
    if ((error as WordLookupError)?.code === "LOOKUP_LIMIT_REACHED") {
      return {
        type: "limit_reached",
        redirect: {
          url: `${baseUrl}/word-limit-reached?word=${encodeURIComponent(word)}&usage=${encodeURIComponent(
            JSON.stringify((error as WordLookupError).usage)
          )}`,
        },
        usage: (error as WordLookupError).usage,
      };
    }
    throw error;
  }
}
