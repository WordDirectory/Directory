"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCw, FileX2, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { cn } from "@/lib/utils";
import { useSearchStore } from "@/stores/search-store";
import { useAskAIStore } from "@/stores/ask-ai-store";
import {
  SHOW_RANDOM_WORDS_KEY,
  DEFAULT_SHOW_RANDOM_WORDS,
} from "@/lib/settings";

const AI_INITIAL_MESSAGE_KEY = "ai-initial-message";
const DEFAULT_INITIAL_MESSAGE = 'Explain the word "{word}"';

interface SearchDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onWordSelect: (word: string) => void;
  showBackdrop?: boolean;
  containerClassName?: string;
  dropdownClassName?: string;
  useFixedPosition?: boolean;
  showUsageWarning?: boolean;
  showRefreshButton?: boolean;
  isIntegrated?: boolean;
}

export function SearchDropdown({
  isOpen,
  onClose,
  onWordSelect,
  showBackdrop = true,
  containerClassName,
  dropdownClassName,
  useFixedPosition = false,
  showUsageWarning = true,
  showRefreshButton = true,
  isIntegrated = false,
}: SearchDropdownProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setIsOpen: setAIOpen, setInitialMessage } = useAskAIStore();

  const { query, words, isLoading, wordUsage, refreshRandomWords } =
    useSearchStore();

  const handleAskAI = () => {
    setAIOpen(true);
    const savedMessage =
      localStorage.getItem(AI_INITIAL_MESSAGE_KEY) || DEFAULT_INITIAL_MESSAGE;
    const message = savedMessage.replace("{word}", query);
    setInitialMessage(message);
    onClose();
  };

  const remainingLookups = wordUsage
    ? wordUsage.limit === 999999999
      ? 999999999
      : wordUsage.limit - wordUsage.current
    : 10;

  const showWarning = remainingLookups !== 999999999 && remainingLookups < 3;

  // Close on click outside - but not when integrated since parent handles it
  useEffect(() => {
    if (isIntegrated) return; // Skip outside click handling for integrated version

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (containerRef.current && !containerRef.current.contains(target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose, isIntegrated]);

  const renderDropdownContent = () => (
    <>
      {/* Warning banner */}
      {showUsageWarning && showWarning && (
        <div className="px-4 py-2 text-sm text-amber-500 bg-amber-500/15 border-b border-amber-500/20">
          Warning: You have {remainingLookups}{" "}
          {remainingLookups === 1 ? "lookup" : "lookups"} remaining this month.
        </div>
      )}

      {/* Content */}
      <div
        className={cn(
          "flex flex-col",
          isLoading ? "h-[20rem]" : query ? "max-h-[18rem]" : "h-[18rem]"
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
                  {query.length > 15 ? `${query.slice(0, 15)}...` : query}
                  &quot;
                </span>
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Scrollable word list */}
            <div
              className={cn(
                "flex-1 py-2",
                (() => {
                  // Check if random words should be scrollable
                  const showRandomWords = localStorage.getItem(
                    SHOW_RANDOM_WORDS_KEY
                  );
                  const shouldShowRandomWords = showRandomWords
                    ? showRandomWords === "true"
                    : DEFAULT_SHOW_RANDOM_WORDS;
                  const isRandomWordsDisabled =
                    !query && !shouldShowRandomWords;
                  return isRandomWordsDisabled
                    ? "overflow-hidden"
                    : "overflow-y-auto";
                })()
              )}
            >
              <div
                className={cn(
                  "relative",
                  !query &&
                    (() => {
                      // Check if random words should be shown clearly
                      const showRandomWords = localStorage.getItem(
                        SHOW_RANDOM_WORDS_KEY
                      );
                      const shouldShowRandomWords = showRandomWords
                        ? showRandomWords === "true"
                        : DEFAULT_SHOW_RANDOM_WORDS;
                      return !shouldShowRandomWords ? "blur-md" : "";
                    })()
                )}
              >
                {words.map((word) => {
                  // Check if random words should be interactive
                  const showRandomWords = localStorage.getItem(
                    SHOW_RANDOM_WORDS_KEY
                  );
                  const shouldShowRandomWords = showRandomWords
                    ? showRandomWords === "true"
                    : DEFAULT_SHOW_RANDOM_WORDS;
                  const isRandomWordsDisabled =
                    !query && !shouldShowRandomWords;

                  return (
                    <button
                      key={word}
                      onClick={
                        isRandomWordsDisabled
                          ? undefined
                          : () => onWordSelect(word)
                      }
                      className={cn(
                        "w-full px-4 py-2 text-left text-sm transition-colors",
                        isRandomWordsDisabled
                          ? "cursor-default opacity-60"
                          : "hover:bg-accent cursor-pointer"
                      )}
                      disabled={isRandomWordsDisabled}
                    >
                      {word}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fixed refresh button at bottom */}
            {showRefreshButton &&
              words.length > 0 &&
              !query &&
              (() => {
                const showRandomWords = localStorage.getItem(
                  SHOW_RANDOM_WORDS_KEY
                );
                const shouldShowRandomWords = showRandomWords
                  ? showRandomWords === "true"
                  : DEFAULT_SHOW_RANDOM_WORDS;
                return shouldShowRandomWords;
              })() && (
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
    </>
  );

  return (
    <div
      ref={containerRef}
      className={cn("relative", containerClassName)}
      data-search-container
    >
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop overlay */}
            {showBackdrop && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.3,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="fixed top-16 left-0 right-0 bottom-0 bg-background/5 backdrop-blur-sm z-40"
                onClick={onClose}
              />
            )}

            {/* Dropdown - simple absolute positioning with smooth animations */}
            <motion.div
              initial={
                isIntegrated
                  ? { opacity: 0, scaleY: 0.8, transformOrigin: "top" }
                  : { opacity: 0, scale: 0.94, y: -8 }
              }
              animate={
                isIntegrated
                  ? { opacity: 1, scaleY: 1, transformOrigin: "top" }
                  : { opacity: 1, scale: 1, y: 0 }
              }
              exit={
                isIntegrated
                  ? { opacity: 0, scaleY: 0.8, transformOrigin: "top" }
                  : { opacity: 0, scale: 0.96, y: -4 }
              }
              transition={{
                duration: isIntegrated ? 0.15 : 0.4,
                ease: [0.16, 1, 0.3, 1], // Apple-style gentle ease
              }}
              className={cn(
                "absolute top-full left-0 right-0 z-50 overflow-visible",
                (() => {
                  // Check if random words should be shown clearly for background opacity
                  const showRandomWords = localStorage.getItem(
                    SHOW_RANDOM_WORDS_KEY
                  );
                  const shouldShowRandomWords = showRandomWords
                    ? showRandomWords === "true"
                    : DEFAULT_SHOW_RANDOM_WORDS;
                  const bgOpacity =
                    shouldShowRandomWords || query
                      ? "bg-background"
                      : "bg-background/50";

                  return isIntegrated
                    ? `${bgOpacity} border border-t-0 border-border rounded-t-none rounded-b-2xl shadow-lg`
                    : `${bgOpacity} border border-border rounded-lg overflow-hidden shadow-lg`;
                })(),
                dropdownClassName
              )}
            >
              {renderDropdownContent()}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
