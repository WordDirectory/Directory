"use client";
import { useEffect, useState } from "react";
import { ShineBorder } from "./shine-border";
import { ArrowUp, Info, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { AutoResizeTextarea } from "./auto-resize-textarea";
import { CustomPopover } from "./ui/custom-popover";
import { usePathname } from "next/navigation";
import { Message as AIMessage } from "ai";
import { cn } from "@/lib/utils";
import { Separator } from "./ui/separator";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { authClient, useSession } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { APIError, AIError, AIUsageResponse } from "@/types/api";
import { UpgradeButton } from "./upgrade-button";
import { useAskAIStore } from "@/stores/ask-ai-store";

const MESSAGE_STORAGE_KEY = "ai-message-draft";

export function AskAI() {
  const pathname = usePathname();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFreeTierLimitReached, setShowFreeTierLimitReached] =
    useState(false);
  const [aiError, setAiError] = useState<AIError | null>(null);
  const word = pathname?.split("/words/")[1]?.split("/")[0] || "";
  const { theme } = useTheme();
  const { data: session } = useSession();
  const router = useRouter();
  const { isOpen, setIsOpen, initialMessage, setInitialMessage } =
    useAskAIStore();

  // Load message from localStorage on mount
  useEffect(() => {
    const savedMessage = localStorage.getItem(MESSAGE_STORAGE_KEY);
    if (initialMessage) {
      setMessage(initialMessage);
      // Clear the initial message after using it
      setInitialMessage(null);
    } else if (savedMessage) {
      setMessage(savedMessage);
    }
  }, [initialMessage, setInitialMessage]);

  // Save message to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(MESSAGE_STORAGE_KEY, message);
  }, [message]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        if (!e.shiftKey) {
          e.preventDefault();
          if (message.trim().length > 0) {
            handleSendMessage();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [message]);

  const handleSendMessage = async () => {
    if (message.trim().length === 0 || isLoading) return;

    try {
      setIsLoading(true);
      setError(null);

      // Add user message immediately
      const userMessage: AIMessage = {
        id: Date.now().toString(),
        role: "user",
        content: message,
      };

      setMessages((prev) => [...prev, userMessage]);
      setMessage(""); // Clear input

      // Call API
      const response = await fetch("/api/ai/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message.trim(),
          word,
        }),
      });

      if (!response.ok) {
        const error = (await response.json()) as APIError;

        if (error.code === "SUBSCRIPTION_LIMIT_REACHED") {
          const aiError = error as AIError;
          if (aiError.usage?.plan === "free") {
            setAiError(aiError);
            setShowFreeTierLimitReached(true);
          } else {
            throw new Error(
              "You've reached your AI request limit for this month. Your limit will reset on " +
                new Date(aiError.usage!.nextReset).toLocaleDateString()
            );
          }
        }

        if (error.code === "RATE_LIMIT_EXCEEDED") {
          throw new Error(
            "Too many requests. Please slow down and try again in a minute."
          );
        }

        throw new Error(error.message || "Failed to get response");
      }

      const data = await response.json();

      // Add AI response
      const aiMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("AI request error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerButton = (
    <div className="relative w-fit overflow-hidden rounded-full">
      <Button
        variant="outline"
        size="icon"
        className="rounded-full"
        onClick={() => setIsOpen(true)}
      >
        <Sparkles strokeWidth={1.5} className="h-4 w-4 text-[#ff7893]" />
      </Button>
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
  );

  return (
    <>
      {!session ? (
        <CustomPopover
          className="max-h-[380px] overflow-y-auto mt-2 p-0"
          trigger={triggerButton}
          open={isOpen}
          onOpenChange={setIsOpen}
        >
          <NotLoggedInUI router={router} />
        </CustomPopover>
      ) : showFreeTierLimitReached && aiError ? (
        <CustomPopover
          className="max-h-[380px] overflow-y-auto mt-2 p-0"
          trigger={triggerButton}
          open={isOpen}
          onOpenChange={setIsOpen}
        >
          <FreeTierLimitReachedUI usage={aiError.usage!} />
        </CustomPopover>
      ) : (
        <CustomPopover
          className="max-h-[380px] overflow-y-auto mt-2"
          trigger={triggerButton}
          open={isOpen}
          onOpenChange={setIsOpen}
        >
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="relative">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask me anything..."
                  className="p-0 pr-6 min-h-[120px] resize-none !rounded-none !ring-0 !ring-offset-0 !bg-transparent !border-none !outline-none !shadow-none"
                  disabled={isLoading}
                />
                <Button
                  size="icon"
                  className="rounded-full w-7 h-7 absolute bottom-0 right-0 !pointer-events-auto disabled:hover:bg-primary"
                  disabled={message.length === 0 || isLoading}
                  onClick={handleSendMessage}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
              </div>
            )}
            {messages.length > 0 && (
              <div className="flex flex-col gap-4 sticky bottom-0">
                <div className="relative flex flex-col gap-4">
                  {messages.map((message, index) => (
                    <Message key={index} message={message} />
                  ))}
                  {error && (
                    <div className="text-sm text-destructive bg-destructive/10 p-2 px-3 rounded-lg">
                      {error}
                    </div>
                  )}
                </div>
                <Separator />
                <div className="relative">
                  <AutoResizeTextarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask me anything..."
                    className="p-0 pr-6 resize-none rounded-none !bg-transparent !ring-0 !ring-offset-0 !border-none !outline-none !shadow-none"
                    disabled={isLoading}
                    autoFocus
                    minRows={1}
                    maxRows={6}
                  />
                </div>
              </div>
            )}
          </div>
        </CustomPopover>
      )}
    </>
  );
}

function Message({ message }: { message: AIMessage }) {
  return (
    <div
      className={cn(
        "text-sm",
        message.role === "user"
          ? "p-2 px-3 bg-background border rounded-lg"
          : "px-1.5"
      )}
    >
      {message.content}
    </div>
  );
}

function NotLoggedInUI({ router }: { router: any }) {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden bg-primary-foreground p-6">
        <h3 className="text-lg font-semibold tracking-tight">
          Unlock AI Powers
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Create a free account to ask me anything about this word! I can help
          you:
        </p>
        <ul className="mt-4 space-y-3 text-sm">
          <li className="flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-1">
              <Sparkles className="h-3 w-3 text-primary" strokeWidth={2} />
            </div>
            <span>Understand complex definitions</span>
          </li>
          <li className="flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-1">
              <Sparkles className="h-3 w-3 text-primary" strokeWidth={2} />
            </div>
            <span>Get example sentences</span>
          </li>
          <li className="flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-1">
              <Sparkles className="h-3 w-3 text-primary" strokeWidth={2} />
            </div>
            <span>Learn related words</span>
          </li>
        </ul>
        <div className="flex flex-col gap-2">
          <Button
            className="mt-6 w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
            onClick={() => router.push("/auth/signup")}
          >
            Create free account
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function FreeTierLimitReachedUI({ usage }: { usage: AIUsageResponse }) {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden bg-primary-foreground p-6">
        <h3 className="text-lg font-semibold tracking-tight">
          You're a power user!
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          You've used {usage.current} out of {usage.limit} free AI requests this
          month.
        </p>
        <div className="mt-4 space-y-3">
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
        <div className="mt-6 space-y-6">
          <UpgradeButton />
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <div className="rounded-full bg-primary/10 p-1">
                <Sparkles className="h-3 w-3 text-primary" strokeWidth={2} />
              </div>
              <span>1,000 AI requests per month</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="rounded-full bg-primary/10 p-1">
                <Sparkles className="h-3 w-3 text-primary" strokeWidth={2} />
              </div>
              <span>Support development</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
