"use client";
import { Button } from "@/components/ui/button";
import { getRandomWords } from "@/lib/words";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface WordNotFoundProps {
  word: string;
  isTimeout?: boolean;
}

export function WordNotFound({ word, isTimeout = false }: WordNotFoundProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleRandomWord = async () => {
    try {
      setIsLoading(true);
      const { words } = await getRandomWords(1);
      if (words.length > 0) {
        router.push(`/words/${words[0]}`);
      }
    } catch (error) {
      console.error("Error getting random word:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] mx-auto max-w-3xl py-16 px-6 text-center flex flex-col justify-center items-center">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground/85 mb-8">
        {isTimeout ? "Connection Timeout" : "Word Not Found"}
      </h1>
      <p className="text-xl text-muted-foreground mb-8">
        {isTimeout
          ? `Sorry, we're experiencing some connection issues. Please try again in a moment.`
          : `Sorry, we couldn't find a definition for "${decodeURIComponent(
              word
            )}". This word might not be in our dictionary yet.`}
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild variant="default">
          <Link href="/">Go home</Link>
        </Button>
        {!isTimeout && (
          <Button
            variant="outline"
            onClick={handleRandomWord}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Try a random word"}
          </Button>
        )}
        {isTimeout && (
          <Button variant="outline" onClick={() => router.refresh()}>
            Try again
          </Button>
        )}
      </div>
    </div>
  );
}
