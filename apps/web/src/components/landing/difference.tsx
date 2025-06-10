"use client";
import { ShineBorder } from "../shine-border";
import { Button } from "../ui/button";
import { useTheme } from "next-themes";
import { useState } from "react";

export function DifferenceSection() {
  const { theme } = useTheme();
  const [showSimpleDefinition, setShowSimpleDefinition] = useState(false);

  const definitions = {
    google: {
      text: "A person with whom one has a bond of mutual affection",
      description: (
        <>
          Believe it or not—that's the Google definition of "Friend".{" "}
          <span className="font-medium text-foreground/75">
            That's 4 words most people would need to look up just to understand
            one definition.
          </span>
        </>
      ),
    },
    wordDirectory: {
      text: "Someone you know well, like, and trust. They're the people you enjoy spending time with and can count on.",
      description:
        "That's WordDirectory's definition of \"Friend\". Simple, clear, and actually helpful.",
    },
  };

  const currentDefinition = showSimpleDefinition
    ? definitions.wordDirectory
    : definitions.google;

  return (
    <section className="relative w-full overflow-hidden px-8">
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center gap-16">
        <div className="w-full text-center flex flex-col items-center gap-10">
          <div className="flex flex-col items-center justify-center gap-5 sm:gap-8">
            <h1 className="text-3xl font-semibold italic tracking-tight text-foreground sm:text-4xl md:text-[2.9rem]">
              "{currentDefinition.text}"
            </h1>
            <p className="text-xl text-muted-foreground md:text-[1.4rem] max-w-xl">
              {currentDefinition.description}
            </p>
          </div>
          <div className="relative">
            <Button
              variant="outline"
              size="lg"
              className="relative rounded-full px-6 text-lg h-12 bg-gradient-to-r from-pink-400/90 to-amber-400/80 bg-clip-text !text-transparent"
              onClick={() => setShowSimpleDefinition(!showSimpleDefinition)}
            >
              See the difference
            </Button>
            <ShineBorder
              shineColor={
                theme === "dark"
                  ? ["#FFC0CB50", "#FFB6C150"]
                  : ["#FFC0CB95", "#FFB6C195"]
              }
              duration={12}
              borderWidth={2}
              className="rounded-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
