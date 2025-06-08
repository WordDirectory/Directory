"use client";
import { useState, useRef } from "react";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { AudioLines, PlayIcon, PauseIcon } from "lucide-react";
import { Button } from "../ui/button";
import { ShineBorder } from "../shine-border";
import { useTheme } from "next-themes";

type PronunciationType = "AI transcription" | "Real example";

export function PronunciationSection() {
  const [activeType, setActiveType] =
    useState<PronunciationType>("AI transcription");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { theme } = useTheme();
  
  const handleTypeChange = (type: PronunciationType) => {
    // Reset audio when changing type
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
    }
    setActiveType(type);
  };

  const handlePlayPause = () => {
    if (!audioRef.current) {
      const audioUrl =
        activeType === "Real example"
          ? "https://zbveylgmlsgoxjwgsoel.supabase.co/storage/v1/object/public/static//0608(1).mp3"
          : "https://zbveylgmlsgoxjwgsoel.supabase.co/storage/v1/object/public/static//0608.mp3";

      audioRef.current = new Audio(audioUrl);

      audioRef.current.addEventListener("ended", () => {
        setIsPlaying(false);
      });

      audioRef.current.addEventListener("error", (e) => {
        console.error("Audio playback error:", e);
        setIsPlaying(false);
      });
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((e) => {
          console.error("Audio play error:", e);
          setIsPlaying(false);
        });
    }
  };

  return (
    <section className="relative w-full overflow-hidden px-8">
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center gap-12">
        <div className="w-full text-center flex flex-col items-center gap-10">
          <div className="flex flex-col items-center justify-center gap-8">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-[2.9rem]">
              Pronunce the word
            </h1>
            <p className="text-xl text-muted-foreground md:text-[1.4rem] max-w-[40rem]">
              Ever understood a word but couldn't pronounce it? Get AI
              pronunciations or listen to how people use them in real-life.
            </p>
            <div className="w-full flex items-center gap-3 max-w-[40rem]">
              {(["AI transcription", "Real example"] as const).map((type) => (
                <div key={type} className="relative">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-base rounded-full h-10 px-4 font-normal cursor-pointer text-muted-foreground transition-none relative",
                      activeType === type &&
                        "bg-gradient-to-r from-pink-400/90 to-amber-400/80 bg-clip-text text-transparent"
                    )}
                    onClick={() => handleTypeChange(type)}
                  >
                    <span>{type}</span>
                  </Badge>
                  {activeType === type && (
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
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="w-full flex flex-col -space-y-9 max-w-[40rem]">
          <AudioCard
            word="Probably"
            type={activeType}
            iconBg="bg-sky-500/25"
            background="bg-accent/10"
            opacity={0.25}
          />
          <AudioCard
            word="February"
            type={activeType}
            iconBg="bg-purple-500/50"
            background="bg-accent/10"
            opacity={0.5}
          />
          <AudioCard
            word="Rural"
            type={activeType}
            iconBg="bg-rose-500"
            background="bg-accent/10"
            opacity={1}
            isLast
            onPlayPause={handlePlayPause}
            isPlaying={isPlaying}
          />
        </div>
      </div>
    </section>
  );
}

function AudioCard({
  word,
  type,
  iconBg,
  background,
  opacity,
  isLast = false,
  onPlayPause,
  isPlaying = false,
}: {
  word: string;
  type: string;
  iconBg: string;
  background: string;
  opacity: number;
  isLast?: boolean;
  onPlayPause?: () => void;
  isPlaying?: boolean;
}) {
  return (
    <div
      className={cn(
        "w-full px-4 py-3 flex items-center justify-between rounded-3xl backdrop-blur-md border border-foreground/5",
        background
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "size-12 rounded-xl flex items-center justify-center",
            iconBg
          )}
        >
          <AudioLines className="!size-6 text-white" />
        </div>
        <div className="flex flex-col">
          <h3 className="text-xl" style={{ opacity }}>
            {word}
          </h3>
          <p
            className={cn(
              "text-lg text-muted-foreground",
              !isLast && "opacity-0 pointer-events-none"
            )}
          >
            {type}
          </p>
        </div>
      </div>
      {isLast && (
        <div className="flex items-center gap-3 pr-2">
          <Button
            variant="ghost"
            size="icon"
            className="!bg-transparent"
            onClick={onPlayPause}
          >
            {isPlaying ? (
              <PauseIcon className="!size-6 text-foreground" />
            ) : (
              <PlayIcon className="!size-6 text-foreground" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
