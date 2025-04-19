"use client";

import { useState } from "react";
import { Input } from "./ui/input";
import { SearchCommand } from "./search-command";
import { Button } from "./ui/button";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: {
    input: "h-9 w-full md:w-72 text-sm",
    container: "w-full",
    showSearchIcon: false,
  },
  lg: {
    input: "h-12 w-[450px] text-lg pl-4 pr-12 rounded-full",
    container: "w-full w-[450px]",
    showSearchIcon: true,
  },
} as const;

type SearchInputProps = {
  size?: keyof typeof SIZES;
};

export function SearchInput({ size = "sm" }: SearchInputProps) {
  const [open, setOpen] = useState(false);
  const {
    input: inputClasses,
    container: containerClasses,
    showSearchIcon,
  } = SIZES[size];

  const handleOpen = () => setOpen(true);

  return (
    <div className={cn("relative mx-auto", containerClasses)}>
      <div className="relative w-full">
        <Input
          type="search"
          placeholder="Search words..."
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
