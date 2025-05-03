"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useSession } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AIUsage {
  current: number;
  limit: number;
  plan: string;
  nextReset: string | null;
}

const AI_INITIAL_MESSAGE_KEY = "ai-initial-message";
const DEFAULT_INITIAL_MESSAGE = 'Explain the word "{word}"';

export default function AISettingsPage() {
  const { data: session, isPending } = useSession();
  const [usage, setUsage] = useState<AIUsage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialMessage, setInitialMessage] = useState(DEFAULT_INITIAL_MESSAGE);

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

    // Load initial message from localStorage
    const savedMessage = localStorage.getItem(AI_INITIAL_MESSAGE_KEY);
    if (savedMessage) {
      setInitialMessage(savedMessage);
    }

    if (session?.user) {
      fetchUsage();
    }
  }, [session]);

  const handleSaveMessage = () => {
    localStorage.setItem(AI_INITIAL_MESSAGE_KEY, initialMessage);
    toast.success("Initial message saved!");
  };

  const handleResetMessage = () => {
    setInitialMessage(DEFAULT_INITIAL_MESSAGE);
    localStorage.setItem(AI_INITIAL_MESSAGE_KEY, DEFAULT_INITIAL_MESSAGE);
    toast.success("Initial message reset to default!");
  };

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
          <h1 className="text-4xl font-bold mb-4">AI Settings</h1>
          <p className="text-muted-foreground">
            Please sign in to view your AI usage.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative w-full overflow-hidden px-1">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">AI Settings</h1>

        {usage && (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold mb-4">Credits Usage</h2>
              <div className="space-y-4">
                <div className="space-y-2">
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
            </div>

            <div className="space-y-4 border-t pt-6">
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

            <div className="space-y-4 border-t pt-6">
              <h2 className="text-lg font-semibold">Initial AI Message</h2>
              <p className="text-sm text-muted-foreground">
                Customize the initial message that appears when you click "Ask
                AI" in the search. Use {"{word}"} as a placeholder - it will be
                replaced with the word you searched for.
              </p>
              <div className="space-y-2">
                <Label htmlFor="initial-message">Message Template</Label>
                <Input
                  id="initial-message"
                  value={initialMessage}
                  onChange={(e) => setInitialMessage(e.target.value)}
                  placeholder='Example: "Tell me about the word {word}"'
                />
                <p className="text-xs text-muted-foreground">
                  Example: If you type "Tell me about {`word`}" and click "Ask
                  AI" for the word "happy", the initial message will be "Tell me
                  about happy"
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveMessage}>Save Message</Button>
                <Button variant="outline" onClick={handleResetMessage}>
                  Reset to Default
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
