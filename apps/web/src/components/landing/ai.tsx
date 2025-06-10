"use client";
import { cn } from "@/lib/utils";
import { ShineBorder } from "../shine-border";
import { useTheme } from "next-themes";

export function AISection() {
  return (
    <section className="relative w-full overflow-hidden px-8">
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center gap-12">
        <div className="w-full text-center flex flex-col items-center gap-10">
          <div className="flex flex-col items-center justify-center gap-5 sm:gap-8">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-[2.9rem]">
              Follow-up with AI
            </h1>
            <p className="text-xl text-muted-foreground md:text-[1.4rem] max-w-[40rem]">
              Understand words in your specific context, translate it to another
              language, and more.
            </p>
          </div>
        </div>
        <div className="w-full flex flex-col gap-6 max-w-[40rem]">
          <AIMessage
            role="user"
            content="When would I actually use this word in a conversation?"
          />
          <AIMessage
            role="ai"
            content="When describing monuments or giving directions - like 'Meet me by the obelisk in the park' or talking about ancient Egyptian stuff"
          />
        </div>
      </div>
    </section>
  );
}

function AIMessage({
  role,
  content,
}: {
  role: "user" | "ai";
  content: string;
}) {
  const { theme } = useTheme();

  return (
    <div className="relative">
      <div
        className={cn(
          "w-full px-6 py-4 flex items-center text-left rounded-3xl text-xl text-muted-foreground",
          role === "ai" &&
            "bg-clip-text text-transparent bg-gradient-to-r from-pink-400/90 to-amber-500/60 dark:to-amber-300/70"
        )}
      >
        {content}
      </div>
      {role === "ai" ? (
        <ShineBorder
          shineColor={
            theme === "dark"
              ? ["#FFC0CB50", "#FFB6C150"]
              : ["#FFC0CB95", "#FFB6C195"]
          }
          duration={12}
          borderWidth={2}
          className="rounded-3xl border"
        />
      ) : (
        <div className="absolute inset-0 rounded-3xl border-2 border-border/50" />
      )}
    </div>
  );
}
