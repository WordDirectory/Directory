"use client";
import { useEffect, useState } from "react";
import { ShineBorder } from "./shine-border";
import { ArrowUp, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { CustomPopover } from "./ui/custom-popover";
import { usePathname } from "next/navigation";
import { Message as AIMessage } from "ai";
import { cn } from "@/lib/utils";
import { Separator } from "./ui/separator";
import { toast } from "sonner";
import { useTheme } from "next-themes";

const MESSAGE_STORAGE_KEY = "ai-message-draft";

export function AskAI() {
  const pathname = usePathname();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const word = pathname?.split("/words/")[1]?.split("/")[0] || "";
  const { theme } = useTheme();

  // Load message from localStorage on mount
  useEffect(() => {
    const savedMessage = localStorage.getItem(MESSAGE_STORAGE_KEY);
    if (savedMessage) {
      setMessage(savedMessage);
    }
  }, []);

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
        const error = await response.json();
        if (response.status === 429) {
          throw new Error(
            "You've reached the daily limit for AI requests. Please try again tomorrow."
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

  // Don't render if not on a word page
  if (!pathname?.includes("words/")) {
    return null;
  }

  return (
    <CustomPopover
      className="max-h-[380px] overflow-y-auto mt-2"
      trigger={
        <div className="relative w-fit overflow-hidden rounded-full">
          <Button variant="outline" size="icon" className="rounded-full">
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
      }
    >
      <div className="space-y-4">
        {messages.length === 0 && (
          <div className="relative">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask me anything..."
              className="p-0 pr-6 min-h-[120px] resize-none !rounded-none !ring-0 border-none shadow-none"
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
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask me anything..."
                className="p-0 pr-6 min-h-[20px] h-auto resize-none rounded-none !ring-0 border-none shadow-none"
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
          </div>
        )}
      </div>
    </CustomPopover>
  );
}

function Message({ message }: { message: AIMessage }) {
  return (
    <div
      className={cn(
        "text-sm",
        message.role === "user"
          ? "p-2 px-3 bg-accent border rounded-lg"
          : "px-1"
      )}
    >
      {message.content}
    </div>
  );
}
