"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useSession } from "@/lib/auth-client";
import { Separator } from "@/components/ui/separator";
import { AIUsageResponse, WordUsageResponse } from "@/types/api";

export default function SettingsUsagePage() {
  const { data: session, isPending } = useSession();
  const [aiUsage, setAiUsage] = useState<AIUsageResponse | null>(null);
  const [wordUsage, setWordUsage] = useState<WordUsageResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aiResponse, wordResponse] = await Promise.all([
          fetch("/api/ai/usage"),
          fetch("/api/words/usage"),
        ]);

        const aiData = await aiResponse.json();
        const wordData = await wordResponse.json();

        if (aiResponse.ok) {
          setAiUsage(aiData.usage);
        } else {
          console.error("Failed to fetch AI usage:", aiData);
        }

        if (wordResponse.ok) {
          setWordUsage(wordData.usage);
        } else {
          console.error("Failed to fetch word lookup usage:", wordData);
        }
      } catch (error) {
        console.error("Error fetching usage data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [session]);

  if (isPending || isLoading) {
    return (
      <main className="relative w-full overflow-hidden flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </main>
    );
  }

  if (!session?.user) {
    return (
      <main className="relative w-full overflow-hidden">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">Usage</h1>
          <p className="text-muted-foreground">
            Please sign in to view your usage statistics.
          </p>
        </div>
      </main>
    );
  }

  const formatLimit = (limit: number | null) => {
    if (limit === null) return "0";
    return limit === Infinity ? "Unlimited" : limit.toString();
  };

  return (
    <main className="relative w-full overflow-hidden">
      <div className="flex flex-col gap-12">
        <section className="flex flex-col gap-8">
          <h1 className="text-4xl font-bold">Usage</h1>

          {wordUsage && (
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-semibold">Word Lookups</h2>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {wordUsage.current} / {formatLimit(wordUsage.limit)} lookups
                    used
                  </span>
                  {typeof wordUsage.limit === "number" &&
                    wordUsage.limit !== Infinity && (
                      <span className="font-medium">
                        {Math.round(
                          (wordUsage.current / wordUsage.limit) * 100
                        )}
                        %
                      </span>
                    )}
                </div>
                {typeof wordUsage.limit === "number" &&
                wordUsage.limit !== Infinity ? (
                  <Progress
                    value={(wordUsage.current / wordUsage.limit) * 100}
                    className="h-2"
                  />
                ) : (
                  <Progress value={100} className="h-2 bg-primary/20" />
                )}
              </div>
            </div>
          )}

          {aiUsage && (
            <>
              <Separator className="my-2" />
              <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-semibold">AI Requests</h2>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {aiUsage.current} / {formatLimit(aiUsage.limit)} requests
                      used
                    </span>
                    {isFinite(aiUsage.limit) && (
                      <span className="font-medium">
                        {Math.round((aiUsage.current / aiUsage.limit) * 100)}%
                      </span>
                    )}
                  </div>
                  {isFinite(aiUsage.limit) ? (
                    <Progress
                      value={(aiUsage.current / aiUsage.limit) * 100}
                      className="h-2"
                    />
                  ) : (
                    <Progress value={100} className="h-2 bg-primary/20" />
                  )}
                </div>
              </div>
            </>
          )}

          <section className="flex flex-col gap-4 border-t pt-8">
            <h2 className="text-2xl font-semibold">Plan Details</h2>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Current Plan
                </span>
                <span className="font-medium capitalize">
                  {aiUsage?.plan || wordUsage?.plan || "Free"}
                </span>
              </div>
              {(aiUsage?.nextReset || wordUsage?.nextReset) && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Next Reset
                  </span>
                  <span className="font-medium">
                    {new Date(
                      aiUsage?.nextReset || wordUsage?.nextReset || ""
                    ).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
