"use client";

import { SearchCommand } from "@/components/search-command";
import { useRef, useState, useEffect } from "react";
import { ChevronRightIcon, SearchIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

export function Hero() {
  const [open, setOpen] = useState(false);

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

      <SearchCommand open={open} onOpenChange={setOpen} />
    </section>
  );
}

function HeroSearchInput() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative w-full max-w-lg">
      {/* Subtle gradient glow around the input */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-400/25 via-amber-400/25 to-pink-400/25 rounded-full blur-xl dark:opacity-35"></div>

      {/* Main search input */}
      <div className="relative bg-background rounded-full border shadow-sm">
        <div
          className="flex items-center px-6 h-[3.2rem] cursor-pointer rounded-full"
          onClick={() => setOpen(true)}
        >
          <SearchIcon className="w-5 h-5 text-muted-foreground mr-4 flex-shrink-0" />
          <div className="flex-1 text-muted-foreground text-base cursor-pointer text-left">
            Search for a word
          </div>
        </div>
      </div>

      <SearchCommand open={open} onOpenChange={setOpen} />
    </div>
  );
}

function WordSuggestions() {
  const router = useRouter();
  const words = ["Obelisk", "Serendipity", "Lummox"];
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({
    canScrollLeft: false,
    canScrollRight: false,
  });

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

  return (
    <div className="relative w-full max-w-lg">
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
        className="flex items-center justify-start sm:justify-center gap-3 w-full overflow-x-auto hidden-scrollbar"
      >
        {words.map((word) => (
          <Badge
            key={word}
            variant="outline"
            className="bg-gradient-to-r from-pink-400/90 to-amber-400/80 bg-clip-text text-transparent text-base rounded-full h-10 px-4 font-normal cursor-pointer"
            onClick={() => router.push(`/words/${word}`)}
          >
            <span>{word}</span>
            <ChevronRightIcon className="!size-5 text-amber-400" />
          </Badge>
        ))}
      </div>
    </div>
  );
}
