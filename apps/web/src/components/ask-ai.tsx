"use client";

import { ShineBorder } from "./shine-border";
import { Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export function AskAI() {
  return (
    <Popover>
      <PopoverTrigger asChild>
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
      </PopoverTrigger>
      <PopoverContent className="p-5">
        <div className="space-y-4">
          <h4 className="font-bold leading-none">Ask AI</h4>
          <p className="text-sm text-muted-foreground">
            Get help understanding words and concepts with our AI assistant.
          </p>
          <div className="flex justify-end">
            <Button size="sm" variant="outline">Coming Soon</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
