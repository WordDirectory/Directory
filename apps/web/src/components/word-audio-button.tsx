"use client";
import { useState, useRef } from "react";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WordAudioButtonProps {
  word: string;
}

export function WordAudioButton({ word }: WordAudioButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = async () => {
    try {
      // If we already have an audio element loaded, just play it
      if (audioRef.current) {
        audioRef.current.play();
        return;
      }

      setIsLoading(true);

      // Fetch the audio
      const response = await fetch(
        `/api/words/${encodeURIComponent(word)}/audio`
      );

      if (!response.ok) {
        throw new Error("Failed to load audio");
      }

      // Get audio blob
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create audio element
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Clean up the blob URL when the audio is done
      audio.addEventListener("ended", () => {
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      });

      // Play the audio
      await audio.play();
    } catch (error) {
      console.error("Failed to play audio:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="lg"
      onClick={playAudio}
      disabled={isLoading}
      className="rounded-full !h-12 !w-12 p-0"
      aria-label="Play pronunciation"
    >
      <Volume2
        className={cn(
          "!h-6 !w-6 text-muted-foreground transition-opacity duration-200",
          isLoading && "text-foreground/40"
        )}
      />
    </Button>
  );
}
