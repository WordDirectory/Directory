"use client";

import { useState } from "react";
import { Input } from "./ui/input";
import { SearchCommand } from "./search-command";
import { capitalize } from "@/lib/utils";
import { usePathname } from "next/navigation";

function getWordFromPathname(pathname: string): string {
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
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const handleOpen = () => setOpen(true);

  const word = getWordFromPathname(pathname);

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
