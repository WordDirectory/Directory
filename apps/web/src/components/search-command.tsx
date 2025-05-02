"use client";

import { useRouter } from "next/navigation";
import { searchWords, getRandomWords } from "@/lib/words";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";

const CACHE_KEY = "random-words-cache";
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

interface CacheEntry {
  words: string[];
  timestamp: number;
}

function getCache(): string[] | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { words, timestamp }: CacheEntry = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return words;
  } catch {
    return null;
  }
}

function setCache(words: string[]) {
  try {
    const entry: CacheEntry = {
      words,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // Ignore cache failures
  }
}

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [words, setWords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery) {
      // Try to get cached random words first
      const cached = getCache();
      if (cached) {
        setWords(cached);
        return;
      }

      // If no cache, fetch and cache
      try {
        setIsLoading(true);
        const results = await getRandomWords();
        setCache(results.words);
        setWords(results.words);
      } catch (error) {
        console.error("Failed to fetch random words:", error);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {
      setIsLoading(true);
      const results = await searchWords(searchQuery);
      setWords(results.words);
    } catch (error) {
      console.error("Search failed:", error);
      setWords([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load words when opened
  useEffect(() => {
    if (open && !query) {
      performSearch("");
    }
  }, [open, query, performSearch]);

  // Handle search query changes
  useEffect(() => {
    if (debouncedQuery) {
      performSearch(debouncedQuery);
    }
  }, [debouncedQuery, performSearch]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search words..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {isLoading ? (
          <CommandEmpty>Searching words...</CommandEmpty>
        ) : words.length === 0 ? (
          <CommandEmpty>No results found.</CommandEmpty>
        ) : (
          <CommandGroup>
            {words.map((word) => (
              <CommandItem
                key={word}
                onSelect={() => {
                  const url = `/words/${encodeURIComponent(word)}`;
                  console.log("Redirecting...", url);
                  router.push(url);
                  onOpenChange(false);
                }}
              >
                {word}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
