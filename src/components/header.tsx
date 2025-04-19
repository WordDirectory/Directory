"use client";

import { SearchInput } from "./search-input";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <header className="w-full px-4 border-b bg-background flex h-14 items-center justify-between">
      <div className="mr-4 flex">
        <Link href="/" className="flex items-center space-x-3">
          <Image
            src="/logo.png"
            alt="WordDirectory Logo"
            width={32}
            height={32}
          />
          <h2 className="pr-12 text-lg font-bold sm:inline-block hidden md:block">
            WordDirectory
          </h2>
        </Link>
      </div>

      <div className="flex w-full items-center justify-between gap-4 md:w-auto md:flex-none">
        <SearchInput />
        <ThemeToggle />
      </div>
    </header>
  );
}
