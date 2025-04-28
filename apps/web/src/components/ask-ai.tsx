"use client";

import { useEffect, useState } from "react";
import { ShineBorder } from "./shine-border";
import { ArrowUp, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { CustomPopover } from "./ui/custom-popover";

const MESSAGE_STORAGE_KEY = "ai-message-draft";

export function AskAI() {
  const [message, setMessage] = useState("");

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

  return (
    <CustomPopover
      trigger={
        <div className="relative w-fit overflow-hidden rounded-full">
          <Button variant="outline" size="icon" className="rounded-full">
            <Sparkles strokeWidth={1.5} className="h-4 w-4 text-[#ff7893]" />
          </Button>
          <ShineBorder
            shineColor={["#FFADF0", "#FFC3A3"]}
            duration={12}
            borderWidth={2}
            className="rounded-full"
          />
        </div>
      }
    >
      <div className="space-y-4">
        <div className="relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask me anything..."
            className="p-0 pr-6 min-h-[120px] resize-none !rounded-none !ring-0 border-none shadow-none"
          />
          <Button
            size="icon"
            className="rounded-full w-7 h-7 absolute bottom-1 right-1"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </CustomPopover>
  );
}
