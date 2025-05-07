"use client";

import { Sparkles, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "./ui/button";
import { UpgradeButton } from "./upgrade-button";
import { useState } from "react";
import { toast } from "sonner";
import { WordUsageResponse } from "@/types/api";

interface WordLookupLimitProps {
  word: string;
  usage: WordUsageResponse;
  isLoggedIn: boolean;
}

export function WordLookupLimit({
  word,
  usage,
  isLoggedIn,
}: WordLookupLimitProps) {
  const router = useRouter();

  if (!isLoggedIn) {
    return (
      <div className="space-y-6 w-full">
        <div className="relative w-fit">
          <div className="rounded-full bg-primary/10 p-3 w-fit">
            <Sparkles className="h-5 w-5 text-primary" strokeWidth={2} />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Create a free account to continue
          </h1>
          <p className="text-muted-foreground">
            You've reached the limit for anonymous word lookups this month.
            Create a free account to:
          </p>
        </div>

        <ul className="space-y-3">
          <li className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-1.5">
              <Sparkles className="h-4 w-4 text-primary" strokeWidth={2} />
            </div>
            <span>Get 10 word lookups per month</span>
          </li>
          <li className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-1.5">
              <Sparkles className="h-4 w-4 text-primary" strokeWidth={2} />
            </div>
            <span>Save your favorite words</span>
          </li>
          <li className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-1.5">
              <Sparkles className="h-4 w-4 text-primary" strokeWidth={2} />
            </div>
            <span>Vote on definitions</span>
          </li>
        </ul>

        <div className="flex flex-col gap-5">
          <Button
            className="w-full"
            onClick={() => router.push("/auth/signup")}
          >
            Create free account
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <div className="relative w-fit">
        <div className="rounded-full bg-primary/10 p-3 w-fit">
          <Sparkles className="h-5 w-5 text-primary" strokeWidth={2} />
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          You're a power user!
        </h1>
        <p className="text-muted-foreground">
          You've used {usage.current} out of{" "}
          {usage.limit === 999999999 ? "Unlimited" : usage.limit} word lookups
          this month. Subscribe for just{" "}
          <span className="font-bold">$1/month</span> to unlock unlimited word
          lookups and 1000 AI requests monthly.
        </p>
      </div>

      <div className="space-y-3">
        <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{
              width: `${usage.limit === 999999999 ? usage.current / 100 : (usage.current / usage.limit) * 100}%`,
            }}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Next reset: {new Date(usage.nextReset).toLocaleDateString()}
        </p>
      </div>

      <div className="space-y-6">
        <UpgradeButton />
        <ul className="space-y-3">
          <li className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-1.5">
              <Sparkles className="h-4 w-4 text-primary" strokeWidth={2} />
            </div>
            <span>Unlimited word lookups</span>
          </li>
          <li className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-1.5">
              <Sparkles className="h-4 w-4 text-primary" strokeWidth={2} />
            </div>
            <span>1,000 AI requests per month</span>
          </li>
          <li className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-1.5">
              <Sparkles className="h-4 w-4 text-primary" strokeWidth={2} />
            </div>
            <span>Support development</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
