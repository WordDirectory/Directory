"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useSession } from "@/lib/auth-client";

interface AIUsage {
  current: number;
  limit: number;
  plan: string;
  nextReset: string | null;
}

export default function AISettingsPage() {
  const { data: session, isPending } = useSession();
  const [usage, setUsage] = useState<AIUsage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const response = await fetch("/api/ai/usage");
        const data = await response.json();
        if (response.ok) {
          setUsage(data.usage);
        } else {
          console.error("Failed to fetch AI usage:", data);
        }
      } catch (error) {
        console.error("Error fetching AI usage:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchUsage();
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
            Please sign in to view your AI usage.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative w-full overflow-hidden">
      <div className="flex flex-col gap-12">
        <section className="flex flex-col gap-8">
          <h1 className="text-4xl font-bold">Usage</h1>

          {usage && (
            <>
              <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-semibold">Credits Usage</h2>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {usage.current} / {usage.limit} credits used
                    </span>
                    <span className="font-medium">
                      {Math.round((usage.current / usage.limit) * 100)}%
                    </span>
                  </div>
                  <Progress
                    value={(usage.current / usage.limit) * 100}
                    className="h-2"
                  />
                </div>
              </div>

              <section className="flex flex-col gap-4 border-t pt-8">
                <h2 className="text-2xl font-semibold">Plan Details</h2>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Current Plan
                    </span>
                    <span className="font-medium capitalize">{usage.plan}</span>
                  </div>
                  {usage.nextReset && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Next Reset
                      </span>
                      <span className="font-medium">
                        {new Date(usage.nextReset).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
