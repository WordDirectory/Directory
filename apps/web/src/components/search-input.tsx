"use client";

import { useState } from "react";
import { Input } from "./ui/input";
import { SearchCommand } from "./search-command";
import { Button } from "./ui/button";
import { Search } from "lucide-react";
import { cn, capitalize } from "@/lib/utils";
import { usePathname } from "next/navigation";

const SIZES = {
  sm: {
    input: "h-9 w-full md:w-72 text-sm rounded-full",
    container: "w-full md:w-auto",
    showSearchIcon: false,
  },
  lg: {
    input:
      "h-12 w-full max-w-[450px] text-base sm:text-lg pl-4 pr-12 rounded-full",
    container: "w-full max-w-[450px]",
    showSearchIcon: true,
  },
} as const;

type SearchInputProps = {
  size?: keyof typeof SIZES;
};

export function SearchInput({ size = "sm" }: SearchInputProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const {
    input: inputClasses,
    container: containerClasses,
    showSearchIcon,
  } = SIZES[size];

  const handleOpen = () => setOpen(true);

  // Get the word from the pathname if we're on a word page
  const word = pathname.startsWith("/words/")
    ? capitalize(decodeURIComponent(pathname.split("/words/")[1]))
    : "";

  return (
    <div className={cn("relative mx-auto", containerClasses)}>
      <div className="relative w-full">
        <Input
          type="search"
          placeholder="Search words..."
          value={word}
          onClick={handleOpen}
          readOnly
          className={cn("cursor-pointer hover:bg-accent !ring-0", inputClasses)}
        />
        {showSearchIcon && (
          <Button
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
            onClick={handleOpen}
          >
            <Search className="h-5 w-5" />
          </Button>
        )}
      </div>
      <SearchCommand open={open} onOpenChange={setOpen} />
    </div>
  );
}
