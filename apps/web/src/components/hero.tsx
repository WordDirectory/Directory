"use client";

import { SearchCommand } from "@/components/search-command";
import { SearchInput } from "./search-input";
import { useState } from "react";

export function Hero() {
  const [open, setOpen] = useState(false);
  const wordCount = 150000;

  const formatNumber = (num: number) => {
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      useGrouping: true,
    });
  };

  return (
    <section className="relative w-full overflow-hidden px-8">
      <div className="container mx-auto flex flex-col items-center justify-center gap-16 py-20 md:py-24 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Words explained simply
          </h1>
          <p className="mb-10 text-xl text-muted-foreground md:text-2xl">
            Because looking up one word shouldn't mean looking up five more. We
            explain words how you'd explain them to a friend.
          </p>
          <SearchInput size="lg" />
        </div>

        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 border-t border-border pt-10 sm:grid-cols-4">
          {[
            [formatNumber(wordCount), "Words"],
            ["100%", "Human readable"],
            ["24/7", "Availability"],
            ["Free", "Forever"],
          ].map(([value, label], i) => (
            <div key={i} className="text-center">
              <div className="text-2xl font-bold text-foreground">{value}</div>
              <div className="text-sm text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <SearchCommand open={open} onOpenChange={setOpen} />
    </section>
  );
}
