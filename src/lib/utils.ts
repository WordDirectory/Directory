// Generic utilities

import { words } from "@/data/words";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { TWord } from "@/types/word";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getWord(word: string): {
  word: string;
  details: TWord;
} {
  if (!word) {
    throw new Error("Word parameter is required");
  }

  const normalizedWord = word.toLowerCase().trim();
  const wordDetails = words[normalizedWord];

  if (!wordDetails) {
    throw new Error(`Word not found: ${word}`);
  }

  return { word: normalizedWord, details: wordDetails };
}

export function searchWords(query: string): string[] {
  if (!query) {
    return Object.keys(words);
  }

  const normalizedQuery = query.toLowerCase().trim();
  const allWords = Object.keys(words);

  return allWords.filter((word) =>
    word.toLowerCase().includes(normalizedQuery)
  );
}

export function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
