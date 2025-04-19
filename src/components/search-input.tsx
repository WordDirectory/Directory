"use client";

import { useState } from "react";
import { Input } from "./ui/input";
import { SearchCommand } from "./search-command";
import { Button } from "./ui/button";
import { Search } from "lucide-react";

type SearchInputProps = {
  size?: "sm" | "lg";
};

export function SearchInput({ size = "sm" }: SearchInputProps) {
  const [open, setOpen] = useState(false);

  const sizeClasses = {
    sm: "h-9 w-72 text-sm",
    lg: "h-12 w-96 text-lg pl-4 pr-12 rounded-full",
  };

  return (
    <div className="relative mx-auto w-full max-w-96">
      <div className="relative w-full">
        <Input
          type="search"
          placeholder="Search words..."
          onClick={() => setOpen(true)}
          readOnly
          className={`cursor-pointer hover:bg-accent !ring-0 ${sizeClasses[size]}`}
        />
        {size === "lg" && (
          <Button
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
            onClick={() => setOpen(true)}
          >
            <Search className="h-5 w-5" />
          </Button>
        )}
      </div>
      <SearchCommand open={open} onOpenChange={setOpen} />
    </div>
  );
}
