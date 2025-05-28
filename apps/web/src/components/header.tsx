"use client";

import { SearchInput } from "./search-input";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { AskAI } from "./ask-ai";
import { UserDropdown } from "./user-dropdown";

export function Header() {
  return (
    <header
      className={cn(
        "w-full px-4 border-b bg-background flex h-14 items-center justify-between sticky top-0 z-50"
      )}
    >
      <div className="mr-4 flex">
        <Link href="/" className="flex items-center space-x-3">
          <div className="relative w-8 h-8">
            <Image
              src="/logo.png"
              alt="WordDirectory Logo"
              fill
              sizes="32px"
              priority
              className="object-contain"
            />
          </div>
          <h2 className="pr-12 text-lg font-bold sm:inline-block hidden md:block">
            WordDirectory
          </h2>
        </Link>
      </div>

      <div className="flex w-full items-center justify-between gap-4 md:w-auto md:flex-none">
        <SearchInput />
        <div className="flex items-center gap-3">
          <AskAI />
          <UserDropdown />
        </div>
      </div>
    </header>
  );
}
