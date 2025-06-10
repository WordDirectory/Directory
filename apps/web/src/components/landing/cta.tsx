"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { SearchCommand } from "@/components/search-command";

export function CTA() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <section className="relative max-w-[55rem] w-full h-fit mx-auto overflow-hidden bg-gradient-to-tr from-[#FFBA96] to-[#FF99C2] md:rounded-2xl px-14 py-20 flex flex-col gap-6">
        <h2 className="text-5xl text-white font-semibold">
          Start understanding words, not memorizing them
        </h2>
        <h2 className="text-2xl text-white/80">
          Try WordDirectory for free and see the difference simple explanations
          make.
        </h2>
        <Button 
          size="lg" 
          className="bg-white hover:bg-stone-100 text-black shadow-none rounded-full text-xl h-14 w-fit px-10"
          onClick={() => setOpen(true)}
        >
          Search a word
        </Button>
      </section>

      <SearchCommand open={open} onOpenChange={setOpen} />
    </div>
  );
}
