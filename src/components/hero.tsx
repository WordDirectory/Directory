"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SearchCommand } from "@/components/search-command";

export function Hero() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4 gap-6">
      <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
        Words explained simply
      </h1>
      <p className="text-lg leading-8 text-muted-foreground max-w-2xl">
        Because looking up one word shouldn't mean looking up five more. We
        explain words how you'd explain them to a friend.
      </p>
      <div className="flex items-center justify-center gap-4">
        <Button size="lg" onClick={() => setOpen(true)}>
          Start exploring
        </Button>
      </div>
      <SearchCommand open={open} onOpenChange={setOpen} />
    </div>
  );
}
