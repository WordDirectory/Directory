import { create } from "zustand";
import { searchWords, getRandomWords } from "@/lib/words";
import { WordUsageResponse } from "@/types/api";
import {
  SHOW_RANDOM_WORDS_KEY,
  DEFAULT_SHOW_RANDOM_WORDS,
} from "@/lib/settings";

const RANDOM_WORDS_CACHE_KEY = "random-words-cache";
const SEARCH_CACHE_KEY = "search-results-cache";
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours
const SEARCH_CACHE_DURATION = 1000 * 60 * 15; // 15 minutes for search results

interface CacheEntry {
  words: string[];
  timestamp: number;
}

interface SearchCache {
  [query: string]: CacheEntry;
}

interface SearchState {
  // State
  query: string;
  words: string[];
  isLoading: boolean;
  wordUsage: WordUsageResponse | null;

  // Actions
  setQuery: (query: string) => void;
  setWords: (words: string[]) => void;
  setIsLoading: (loading: boolean) => void;
  setWordUsage: (usage: WordUsageResponse | null) => void;

  // Complex actions
  performSearch: (searchQuery: string) => Promise<void>;
  refreshRandomWords: () => Promise<void>;
  fetchUsage: () => Promise<void>;

  // Cache utilities
  getRandomWordsFromCache: () => string[] | null;
  setRandomWordsCache: (words: string[]) => void;
  getSearchFromCache: (query: string) => string[] | null;
  setSearchCache: (query: string, words: string[]) => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  // Initial state
  query: "",
  words: [],
  isLoading: false,
  wordUsage: null,

  // Basic setters
  setQuery: (query) => set({ query }),
  setWords: (words) => set({ words }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setWordUsage: (usage) => set({ wordUsage: usage }),

  // Cache utilities
  getRandomWordsFromCache: () => {
    try {
      const cached = localStorage.getItem(RANDOM_WORDS_CACHE_KEY);
      if (!cached) return null;

      const { words, timestamp }: CacheEntry = JSON.parse(cached);
      if (Date.now() - timestamp > CACHE_DURATION) {
        localStorage.removeItem(RANDOM_WORDS_CACHE_KEY);
        return null;
      }

      return words;
    } catch {
      return null;
    }
  },

  setRandomWordsCache: (words) => {
    try {
      const entry: CacheEntry = {
        words,
        timestamp: Date.now(),
      };
      localStorage.setItem(RANDOM_WORDS_CACHE_KEY, JSON.stringify(entry));
    } catch {
      // Ignore cache failures
    }
  },

  getSearchFromCache: (query) => {
    try {
      const cached = localStorage.getItem(SEARCH_CACHE_KEY);
      if (!cached) return null;

      const searchCache: SearchCache = JSON.parse(cached);
      const entry = searchCache[query.toLowerCase()];

      if (!entry) return null;

      if (Date.now() - entry.timestamp > SEARCH_CACHE_DURATION) {
        // Remove expired entry
        delete searchCache[query.toLowerCase()];
        localStorage.setItem(SEARCH_CACHE_KEY, JSON.stringify(searchCache));
        return null;
      }

      return entry.words;
    } catch {
      return null;
    }
  },

  setSearchCache: (query, words) => {
    try {
      const cached = localStorage.getItem(SEARCH_CACHE_KEY);
      const searchCache: SearchCache = cached ? JSON.parse(cached) : {};

      searchCache[query.toLowerCase()] = {
        words,
        timestamp: Date.now(),
      };

      localStorage.setItem(SEARCH_CACHE_KEY, JSON.stringify(searchCache));
    } catch {
      // Ignore cache failures
    }
  },

  // Complex actions
  performSearch: async (searchQuery: string) => {
    const {
      getRandomWordsFromCache,
      setRandomWordsCache,
      getSearchFromCache,
      setSearchCache,
    } = get();

    if (!searchQuery) {
      // Always fetch random words for visual consistency
      // The UI will handle blurring based on user preference

      // Try to get cached random words first
      const cached = getRandomWordsFromCache();
      if (cached) {
        set({ words: cached });
        return;
      }

      // If no cache, fetch and cache
      try {
        set({ isLoading: true });
        const results = await getRandomWords();
        setRandomWordsCache(results.words);
        set({ words: results.words });
      } catch (error) {
        console.error("Failed to fetch random words:", error);
      } finally {
        set({ isLoading: false });
      }
      return;
    }

    // Check cache for search results first
    const cachedResults = getSearchFromCache(searchQuery);
    if (cachedResults) {
      set({ words: cachedResults });
      return;
    }

    // If not cached, fetch and cache
    try {
      set({ isLoading: true });
      const results = await searchWords(searchQuery);
      set({ words: results.words });
      setSearchCache(searchQuery, results.words);
    } catch (error) {
      console.error("Search failed:", error);
      set({ words: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  refreshRandomWords: async () => {
    const { setRandomWordsCache } = get();

    // Always refresh random words for visual consistency
    // The UI will handle blurring based on user preference

    try {
      set({ isLoading: true });
      const results = await getRandomWords();
      setRandomWordsCache(results.words);
      set({ words: results.words });
    } catch (error) {
      console.error("[Random Words] Failed to fetch:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUsage: async () => {
    try {
      const response = await fetch("/api/words/usage");
      if (!response.ok) {
        set({ wordUsage: null });
        return;
      }
      const data = await response.json();
      set({ wordUsage: data.usage });
    } catch (error) {
      console.error("Error fetching word usage:", error);
      set({ wordUsage: null });
    }
  },
}));
