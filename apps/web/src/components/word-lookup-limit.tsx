"use client";

import { Button } from "./ui/button";
import { Sparkles } from "lucide-react";
import { Card } from "./ui/card";
import { UpgradeButton } from "./upgrade-button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShineBorder } from "./shine-border";
import { useTheme } from "next-themes";

interface WordLookupLimitProps {
  word: string;
  usage: {
    current: number;
    limit: number;
    plan: "free" | "plus";
    nextReset: string;
  };
  isLoggedIn: boolean;
}

export function WordLookupLimit({
  word,
  usage,
  isLoggedIn,
}: WordLookupLimitProps) {
  const router = useRouter();
  const { theme } = useTheme();

  if (!isLoggedIn) {
    return (
      <div className="mx-auto max-w-2xl py-12 md:py-20 px-6">
        <Card className="relative overflow-hidden">
          <div className="p-6 md:p-8 space-y-6">
            <div className="relative w-fit">
              <div className="rounded-full bg-primary/10 p-3 w-fit">
                <Sparkles className="h-5 w-5 text-primary" strokeWidth={2} />
              </div>
              <ShineBorder
                shineColor={
                  theme === "dark"
                    ? ["#FFADF050", "#FFC3A350"]
                    : ["#FFADF095", "#FFC3A395"]
                }
                duration={12}
                borderWidth={2}
                className="rounded-full"
              />
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

            <div className="flex flex-col gap-3">
              <Button
                size="lg"
                className="w-full"
                onClick={() => router.push("/auth/signup")}
              >
                Create free account
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="text-primary hover:underline"
                >
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl py-12 md:py-20 px-6">
      <Card className="relative overflow-hidden">
        <div className="p-6 md:p-8 space-y-6">
          <div className="relative w-fit">
            <div className="rounded-full bg-primary/10 p-3 w-fit">
              <Sparkles className="h-5 w-5 text-primary" strokeWidth={2} />
            </div>
            <ShineBorder
              shineColor={
                theme === "dark"
                  ? ["#FFADF050", "#FFC3A350"]
                  : ["#FFADF095", "#FFC3A395"]
              }
              duration={12}
              borderWidth={2}
              className="rounded-full"
            />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              You're a power user!
            </h1>
            <p className="text-muted-foreground">
              You've used {usage.current} out of {usage.limit} word lookups this
              month.
            </p>
          </div>

          <div className="space-y-3">
            <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${(usage.current / usage.limit) * 100}%` }}
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
      </Card>
    </div>
  );
}
