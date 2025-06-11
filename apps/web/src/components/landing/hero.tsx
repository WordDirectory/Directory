"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronRightIcon, SearchIcon, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden px-8">
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center gap-8">
        <div className="w-full text-center flex flex-col items-center gap-10">
          <div className="flex flex-col items-center justify-center gap-5 sm:gap-7">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Words explained{" "}
              <span className="bg-gradient-to-r from-pink-400/90 to-amber-400 bg-clip-text text-transparent">
                simply
              </span>
            </h1>
            <p className="text-xl text-muted-foreground md:text-[1.6rem] max-w-xl">
              Because looking up one word shouldn't mean looking up five more.
              We explain words how you'd explain them to a friend.
            </p>
          </div>
          <div className="w-full flex flex-col items-center justify-center gap-8">
            <HeroSearchInput />
            <WordSuggestions />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroSearchInput() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (value.trim() && !isLoading) {
      setIsLoading(true);
      router.push(`/words/${encodeURIComponent(value.trim())}`);
    }
  };

  return (
    <div className="relative w-full max-w-lg">
      {/* Subtle gradient glow around the input */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-400/25 via-amber-400/25 to-pink-400/25 rounded-full blur-xl dark:opacity-35"></div>

      {/* Main search input */}
      <form onSubmit={handleSearch} className="relative">
        <div className="relative bg-background rounded-full border shadow-sm">
          <div className="flex items-center pl-5 pr-3 h-[3.2rem] rounded-full">
            <SearchIcon className="w-5 h-5 text-muted-foreground mr-4 flex-shrink-0" />
            <Input
              name="search"
              type="search"
              placeholder="Search for a word"
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-full h-[3.2rem] px-0 shadow-none [&::-webkit-search-cancel-button]:hidden"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && value.trim() && !isLoading) {
                  setIsLoading(true);
                  router.push(`/words/${encodeURIComponent(value.trim())}`);
                }
              }}
            />
            <Button
              type="submit"
              size="icon"
              className="ml-2 rounded-full aspect-square"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ChevronRightIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

function WordSuggestions() {
  const router = useRouter();
  const words = [
    "Obelisk",
    "Serendipity",
    "Lummox",
    "Ephemeral",
    "Lugubrious",
    "Pernicious",
    "Pulchritude",
    "Soliloquy",
    "Susurrus",
    "Obfuscate",
    "Quixotic",
    "Vicissitude",
    "Ineffable",
  ];
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({
    canScrollLeft: false,
    canScrollRight: true, // Set to true initially since we know we'll be scrolled to the left
  });
  const [recentlyScrolled, setRecentlyScrolled] = useState(false);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const updateScrollState = () => {
      const { scrollLeft, scrollWidth, clientWidth } = element;
      const canScrollLeft = scrollLeft > 0;
      const canScrollRight = scrollLeft < scrollWidth - clientWidth - 1; // -1 for rounding

      setScrollState({ canScrollLeft, canScrollRight });
    };

    // Initial check
    updateScrollState();

    // Add scroll listener
    element.addEventListener("scroll", updateScrollState);

    // Cleanup
    return () => element.removeEventListener("scroll", updateScrollState);
  }, []);

  const handleScroll = (direction: "left" | "right") => {
    const element = scrollRef.current;
    if (!element) return;

    // Set flag to prevent accidental word clicks
    setRecentlyScrolled(true);

    // Clear the flag after a short delay
    setTimeout(() => {
      setRecentlyScrolled(false);
    }, 2500);

    const scrollAmount = 200; // Adjust this value to control scroll distance
    const targetScroll =
      element.scrollLeft +
      (direction === "left" ? -scrollAmount : scrollAmount);
    element.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative w-full max-w-lg">
      {/* Navigation buttons */}
      <button
        onClick={() => handleScroll("left")}
        className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-background/80 backdrop-blur-sm rounded-full p-1.5 shadow-md border transition-opacity duration-200 ${
          scrollState.canScrollLeft
            ? "opacity-100"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <ChevronRightIcon className="size-5 rotate-180" />
      </button>

      <button
        onClick={() => handleScroll("right")}
        className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-background/80 backdrop-blur-sm rounded-full p-1.5 shadow-md border transition-opacity duration-200 ${
          scrollState.canScrollRight
            ? "opacity-100"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <ChevronRightIcon className="size-5" />
      </button>

      {/* Left fade overlay */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none transition-opacity duration-200 ${
          scrollState.canScrollLeft ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Right fade overlay */}
      <div
        className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none transition-opacity duration-200 ${
          scrollState.canScrollRight ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        ref={scrollRef}
        className="flex items-center justify-start gap-3 w-full overflow-x-auto hidden-scrollbar"
      >
        {words.map((word) => (
          <Badge
            key={word}
            variant="outline"
            className="bg-gradient-to-r from-pink-400/90 to-amber-400/80 bg-clip-text text-transparent text-base rounded-full h-10 px-4 font-normal cursor-pointer"
            onClick={() => {
              // Prevent accidental clicks if we just scrolled
              if (recentlyScrolled) return;
              router.push(`/words/${word}`);
            }}
          >
            <span>{word}</span>
            <ChevronRightIcon className="!size-5 text-amber-400 ml-1" />
          </Badge>
        ))}
      </div>
    </div>
  );
}
