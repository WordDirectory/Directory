"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { Input } from "./ui/input";
import { capitalize } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { useSearchStore } from "@/stores/search-store";
import { SearchDropdown } from "./search-dropdown";

function getWordFromPathname(pathname: string, searchParams: URLSearchParams): string {
  // Check for word param on not-found page
  if (pathname === "/words/not-found") {
    const wordParam = searchParams.get("word");
    if (wordParam) {
      return capitalize(decodeURIComponent(wordParam));
    }
  }

  // Normal word path handling
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Zustand store
  const { query, setQuery, performSearch, fetchUsage } = useSearchStore();

  const debouncedQuery = useDebounce(query, 300);
  const currentWord = getWordFromPathname(pathname, searchParams);

  const handleOpen = useCallback(() => {
    const currentWord = getWordFromPathname(pathname, searchParams);
    if (currentWord && currentWord !== query) {
      setQuery(currentWord);
    } else if (!currentWord && query) {
      // If no current word but we have a query, clear it
      setQuery("");
    }
    setIsOpen(true);

    // Focus the input after state update
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }, [pathname, searchParams, query, setQuery]);

  const handleClose = () => {
    setIsOpen(false);
  };

  // Pre-fetch usage and random words in background on mount
  useEffect(() => {
    fetchUsage();
    performSearch(""); // Pre-load random words
  }, [fetchUsage, performSearch]);

  // Listen for custom event to open header search from external components
  useEffect(() => {
    console.log("SearchInput: Setting up openHeaderSearch event listener");

    const handleOpenHeaderSearch = () => {
      console.log(
        "SearchInput: openHeaderSearch event received, calling handleOpen()"
      );
      handleOpen();
    };

    window.addEventListener("openHeaderSearch", handleOpenHeaderSearch);
    return () => {
      console.log("SearchInput: Cleaning up openHeaderSearch event listener");
      window.removeEventListener("openHeaderSearch", handleOpenHeaderSearch);
    };
  }, [handleOpen]);

  // Handle search query changes - always keep words in sync with query
  useEffect(() => {
    performSearch(debouncedQuery);
  }, [debouncedQuery, performSearch]);

  const handleWordSelect = (word: string) => {
    const url = `/words/${encodeURIComponent(word)}`;
    router.push(url);
    handleClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      // Immediately navigate to the word, even if search results are still loading
      const url = `/words/${encodeURIComponent(query.trim())}`;
      router.push(url);
      handleClose();
    }
  };

  return (
    <div className="relative mx-auto w-full md:w-auto">
      <div className="relative w-full">
        <Input
          ref={inputRef}
          type="search"
          placeholder="Search words..."
          value={isOpen ? query : currentWord}
          onChange={(e) => setQuery(e.target.value)}
          onClick={handleOpen}
          onKeyDown={handleKeyDown}
          readOnly={!isOpen}
          className="h-9 w-full md:w-72 text-sm rounded-full"
        />
      </div>

      <SearchDropdown
        isOpen={isOpen}
        onClose={handleClose}
        onWordSelect={handleWordSelect}
        showBackdrop={true}
      />
    </div>
  );
}
