"use client";

import { useEffect, useCallback } from "react";
import { Input } from "./ui/input";
import { capitalize, cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { RotateCw, FileX2, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { useAskAIStore } from "@/stores/ask-ai-store";
import { useSearchStore } from "@/stores/search-store";
import { motion, AnimatePresence } from "framer-motion";
import { Separator } from "./ui/separator";

const AI_INITIAL_MESSAGE_KEY = "ai-initial-message";
const DEFAULT_INITIAL_MESSAGE = 'Explain the word "{word}"';

function getWordFromPathname(pathname: string): string {
  if (!pathname.startsWith("/words/")) {
    return "";
  }

  const wordPart = pathname.split("/words/")[1];
  if (!wordPart) {
    return "";
  }

  return capitalize(decodeURIComponent(wordPart).replace(/\/$/, ""));
}

export function SearchInput() {
  const pathname = usePathname();
  const router = useRouter();
  const { setIsOpen: setAIOpen, setInitialMessage } = useAskAIStore();

  // Zustand store
  const {
    isOpen,
    query,
    words,
    isLoading,
    wordUsage,
    setQuery,
    performSearch,
    refreshRandomWords,
    fetchUsage,
    openWithQuery,
    close,
  } = useSearchStore();

  const debouncedQuery = useDebounce(query, 300);
  const currentWord = getWordFromPathname(pathname);

  const handleOpen = useCallback(() => {
    const currentWord = getWordFromPathname(pathname);
    if (currentWord && currentWord !== query) {
      openWithQuery(currentWord);
    } else if (!currentWord && query) {
      // If no current word but we have a query, clear it
      openWithQuery("");
    } else {
      openWithQuery(query);
    }
  }, [pathname, query, openWithQuery]);

  // Pre-fetch usage and random words in background on mount
  useEffect(() => {
    fetchUsage();
    performSearch(""); // Pre-load random words
  }, [fetchUsage, performSearch]);

  // Handle search query changes - always keep words in sync with query
  useEffect(() => {
    performSearch(debouncedQuery);
  }, [debouncedQuery, performSearch]);

  const handleWordSelect = (word: string) => {
    const url = `/words/${encodeURIComponent(word)}`;
    router.push(url);
    close();
  };

  const handleAskAI = () => {
    setAIOpen(true);
    const savedMessage =
      localStorage.getItem(AI_INITIAL_MESSAGE_KEY) || DEFAULT_INITIAL_MESSAGE;
    const message = savedMessage.replace("{word}", query);
    setInitialMessage(message);
    close();
  };

  const remainingLookups = wordUsage
    ? wordUsage.limit === 999999999
      ? 999999999
      : wordUsage.limit - wordUsage.current
    : 10;

  const showWarning = remainingLookups !== 999999999 && remainingLookups < 3;

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest("[data-search-container]")) {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, close]);

  return (
    <div className="relative mx-auto w-full md:w-auto" data-search-container>
      <div className="relative w-full">
        <Input
          type="search"
          placeholder="Search words..."
          value={isOpen ? query : currentWord}
          onChange={(e) => setQuery(e.target.value)}
          onClick={handleOpen}
          readOnly={!isOpen}
          className="h-9 w-full md:w-72 text-sm rounded-full"
        />
      </div>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="fixed top-16 left-0 right-0 bottom-0 bg-background/5 backdrop-blur-sm z-40"
              onClick={close}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -4 }}
              transition={{
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1], // Apple-style gentle ease
              }}
              className="fixed max-w-[30rem] mx-auto sm:absolute left-4 right-4 sm:left-0 sm:right-0 sm:top-full mt-1 bg-background border border-border rounded-lg shadow-lg z-50 overflow-hidden"
              style={{
                top:
                  typeof window !== "undefined" && window.innerWidth < 640
                    ? `${(document.querySelector("[data-search-container]") as Element)?.getBoundingClientRect().bottom + 4}px`
                    : undefined,
              }}
            >
              {/* Warning banner */}
              {showWarning && (
                <div className="px-4 py-2 text-sm text-amber-500 bg-amber-500/15 border-b border-amber-500/20">
                  Warning: You have {remainingLookups}{" "}
                  {remainingLookups === 1 ? "lookup" : "lookups"} remaining this
                  month.
                </div>
              )}

              {/* Content */}
              <div
                className={cn(
                  "flex flex-col",
                  isLoading
                    ? "h-[20rem]"
                    : query
                      ? "max-h-[18rem]"
                      : "h-[18rem]"
                )}
              >
                {isLoading ? (
                  <div className="p-4 flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="mb-4 flex justify-center">
                        <RotateCw className="h-8 w-8 text-muted-foreground opacity-50 animate-spin" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Searching words...
                      </p>
                    </div>
                  </div>
                ) : words.length === 0 && query ? (
                  <div className="p-4 flex items-center justify-center min-h-[200px]">
                    <div className="text-center">
                      <div className="mb-4 flex justify-center">
                        <FileX2 className="h-12 w-12 text-muted-foreground opacity-50" />
                      </div>
                      <p className="mb-4 text-sm text-muted-foreground">
                        No results found
                      </p>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 max-w-64"
                        onClick={handleAskAI}
                      >
                        <Sparkles className="h-4 w-4 shrink-0" />
                        <span className="truncate">
                          Ask AI about &quot;
                          {query.length > 15
                            ? `${query.slice(0, 15)}...`
                            : query}
                          &quot;
                        </span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Scrollable word list */}
                    <div className="flex-1 overflow-y-auto py-2">
                      {words.map((word) => (
                        <button
                          key={word}
                          onClick={() => handleWordSelect(word)}
                          className="w-full px-4 py-2 text-left hover:bg-accent text-sm transition-colors"
                        >
                          {word}
                        </button>
                      ))}
                    </div>

                    {/* Fixed refresh button at bottom */}
                    {words.length > 0 && !query && (
                      <>
                        <Separator />
                        <div>
                          <button
                            onClick={refreshRandomWords}
                            disabled={isLoading}
                            className="w-full px-4 py-3 text-left hover:bg-accent text-sm transition-colors flex items-center gap-2 text-muted-foreground hover:text-foreground"
                          >
                            <RotateCw
                              size={14}
                              className={isLoading ? "animate-spin" : ""}
                            />
                            <span>Refresh list</span>
                          </button>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
