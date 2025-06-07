"use client";

import { useState } from "react";
import { Input } from "./ui/input";
import { SearchCommand } from "./search-command";
import { cn, capitalize } from "@/lib/utils";
import { usePathname } from "next/navigation";

export function SearchInput() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const handleOpen = () => setOpen(true);

  // Get the word from the pathname if we're on a word page
  const word = pathname.startsWith("/words/")
    ? capitalize(decodeURIComponent(pathname.split("/words/")[1]))
    : "";

  return (
    <div className="relative mx-auto w-full md:w-auto">
      <div className="relative w-full">
        <Input
          type="search"
          placeholder="Search words..."
          value={word}
          onClick={handleOpen}
          readOnly
          className="cursor-pointer hover:bg-accent !ring-0 h-9 w-full md:w-72 text-sm rounded-full"
        />
      </div>
      <SearchCommand open={open} onOpenChange={setOpen} />
    </div>
  );
}
