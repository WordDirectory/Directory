"use client";

import { ShineBorder } from "./shine-border";
import { Sparkles } from "lucide-react";
import { Button } from "./ui/button";

export function AskAI() {
  return (
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
  );
}
