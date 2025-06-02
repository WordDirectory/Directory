"use client";
import { useState, useRef } from "react";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export async function playWordAudio(word: string): Promise<HTMLAudioElement> {
  try {
    const response = await fetch(
      `/api/words/${encodeURIComponent(word)}/elevenlabs`
    );

    if (!response.ok) {
      throw new Error("Failed to load audio");
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    // Clean up the blob URL when the audio is done
    audio.addEventListener("ended", () => {
      URL.revokeObjectURL(audioUrl);
    });

    await audio.play();
    return audio;
  } catch (error) {
    console.error("Failed to play audio:", error);
    throw error;
  }
}

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

      const audio = await playWordAudio(word);

      // Cache so subsequent plays are instant
      audioRef.current = audio;
    } catch (error) {
      // Already logged inside playWordAudio
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
