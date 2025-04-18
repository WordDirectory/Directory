"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "./ui/input";
import { searchWords } from "@/lib/utils";

export function SearchInput() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const results = query ? searchWords(query) : [];

  return (
    <div className="relative w-full md:w-64">
      <Input
        type="search"
        placeholder="Search words..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setShowResults(true)}
      />

      {showResults && query && (
        <>
          <div
            className="fixed inset-0"
            onClick={() => setShowResults(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg max-h-[300px] overflow-y-auto z-10">
            {results.length > 0 ? (
              <ul className="p-2">
                {results.map((word) => (
                  <li key={word}>
                    <button
                      onClick={() => {
                        router.push(`/words/${word}`);
                        setQuery("");
                        setShowResults(false);
                      }}
                      className="w-full px-4 py-2 rounded-md text-left text-sm hover:bg-muted focus:bg-muted focus:outline-none"
                    >
                      {word}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-2 text-sm text-muted-foreground">
                No results found
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
