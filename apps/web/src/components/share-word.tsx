"use client";
import { LinkIcon, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion } from "motion/react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface ShareWordProps {
  word: string;
  definition: string;
}

export function ShareWord({ word, definition }: ShareWordProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleCopyLink = async () => {
    const url = `https://worddirectory.app/words/${encodeURIComponent(word)}`;
    await navigator.clipboard.writeText(url);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <motion.button
          className={cn(
            "relative flex items-center justify-center w-10 h-10 rounded-full",
            "bg-muted hover:bg-muted/80"
          )}
          whileTap={{ scale: 0.85 }}
          transition={{ type: "spring", stiffness: 500, damping: 15 }}
        >
          <Share2 className="w-5 h-5 stroke-foreground" strokeWidth={2} />
        </motion.button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2" align="center">
        <div className="grid gap-1">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleCopyLink}
          >
            <LinkIcon className="w-4 h-4 mr-1" />
            Copy link
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
} 