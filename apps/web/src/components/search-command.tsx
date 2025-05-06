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
import { FileX2, Sparkles, RotateCw } from "lucide-react";
import { Button } from "./ui/button";
import { useAskAIStore } from "@/stores/ask-ai-store";
import { WordUsageResponse } from "@/types/api";

const CACHE_KEY = "random-words-cache";
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours
const AI_INITIAL_MESSAGE_KEY = "ai-initial-message";
const DEFAULT_INITIAL_MESSAGE = 'Explain the word "{word}"';

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
  const [wordUsage, setWordUsage] = useState<WordUsageResponse | null>(null);
  const debouncedQuery = useDebounce(query, 300);
  const { setIsOpen: setAIOpen, setInitialMessage } = useAskAIStore();

  const fetchUsage = useCallback(async () => {
    console.log("Fetching word usage...");
    try {
      const response = await fetch("/api/words/usage");
      if (!response.ok) {
        console.error("Failed to fetch word usage:", response.statusText);
        setWordUsage(null);
        return;
      }
      const data = await response.json();
      setWordUsage(data.usage);
    } catch (error) {
      console.error("Error fetching word usage:", error);
      setWordUsage(null);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    try {
      setIsLoading(true);
      const results = await getRandomWords();
      setCache(results.words);
      setWords(results.words);
    } catch (error) {
      console.error("[Random Words] Failed to fetch:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  // Load words and usage when opened
  useEffect(() => {
    if (open) {
      fetchUsage();
      if (!query) {
        performSearch("");
      }
    } else {
      // Reset usage when closed? Optional, depends on desired behavior
      // setWordUsage(null);
    }
  }, [open, query, performSearch, fetchUsage]);

  // Handle search query changes
  useEffect(() => {
    if (debouncedQuery) {
      performSearch(debouncedQuery);
    }
  }, [debouncedQuery, performSearch]);

  const handleAskAI = () => {
    setAIOpen(true);
    const savedMessage =
      localStorage.getItem(AI_INITIAL_MESSAGE_KEY) || DEFAULT_INITIAL_MESSAGE;
    const message = savedMessage.replace("{word}", query);
    setInitialMessage(message);
    onOpenChange(false);
  };

  const remainingLookups = wordUsage
    ? wordUsage.limit === 999999999
      ? 999999999
      : wordUsage.limit - wordUsage.current
    : 10;

  const showWarning = remainingLookups !== 999999999 && remainingLookups < 3;

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search words..."
        value={query}
        onValueChange={setQuery}
        rightSlot={
          !query ? (
            <button
              onClick={handleRefresh}
              className="group p-1 hover:text-foreground text-muted-foreground/70 transition-colors"
              disabled={isLoading}
            >
              <RotateCw
                size={16}
                className={isLoading ? "animate-spin" : ""}
              />
            </button>
          ) : null
        }
      />
      {showWarning && (
        <div className="px-4 py-2 text-sm text-amber-500 bg-amber-500/15 border-b border-amber-500/20">
          Warning: You have {remainingLookups}{" "}
          {remainingLookups === 1 ? "lookup" : "lookups"} remaining this month.
        </div>
      )}
      <CommandList>
        {isLoading ? (
          <CommandEmpty>Searching words...</CommandEmpty>
        ) : words.length === 0 && query ? (
          <div className="py-6 text-center">
            <div className="mb-4 flex justify-center">
              <FileX2 className="h-12 w-12 text-muted-foreground opacity-50" />
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              No results found
            </p>
            <Button
              variant="outline"
              className="mx-auto flex items-center gap-2"
              onClick={handleAskAI}
            >
              <Sparkles className="h-4 w-4" />
              <span>Ask AI about &quot;{query}&quot;</span>
            </Button>
          </div>
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
