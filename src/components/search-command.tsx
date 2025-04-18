"use client";

import { useRouter } from "next/navigation";
import { getRandomWords, searchWords } from "@/lib/utils";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useState } from "react";
import { useEffect } from "react";

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
  const router = useRouter();
  const [words, setWords] = useState<string[]>([]);

  useEffect(() => {
    setWords(getRandomWords({ maxCount: 10 }));
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search words..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Words">
          {searchWords({ query: "", limit: 50 }).map((word) => (
            <CommandItem
              key={word}
              onSelect={() => {
                router.push(`/words/${word}`);
                onOpenChange(false);
              }}
            >
              {word}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
