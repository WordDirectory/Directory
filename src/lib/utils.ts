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

export function searchWords({
  query,
  limit = 50,
}: {
  query: string;
  limit?: number;
}): string[] {
  const normalizedQuery = query?.toLowerCase().trim() || "";
  const matches: string[] = [];

  for (const word of Object.keys(words)) {
    if (word.toLowerCase().includes(normalizedQuery)) {
      matches.push(word);
      if (matches.length >= limit) break;
    }
  }

  return matches;
}

export function getRandomWords({ maxCount }: { maxCount: number }): string[] {
  const totalWords = Object.entries(words).length;

  if (maxCount > totalWords) {
    maxCount = totalWords;
  }

  const selectedIndices = new Set<number>();
  while (selectedIndices.size < maxCount) {
    selectedIndices.add(Math.floor(Math.random() * totalWords));
  }

  return Array.from(selectedIndices).map((index) => Object.keys(words)[index]);
}

export function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
