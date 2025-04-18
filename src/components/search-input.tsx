"use client";

import { useState } from "react";
import { Input } from "./ui/input";
import { SearchCommand } from "./search-command";

export function SearchInput() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative w-full md:w-72">
      <Input
        type="search"
        placeholder="Search words..."
        onClick={() => setOpen(true)}
        readOnly
        className="cursor-pointer hover:bg-accent !ring-0"
      />
      <SearchCommand open={open} onOpenChange={setOpen} />
    </div>
  );
}
