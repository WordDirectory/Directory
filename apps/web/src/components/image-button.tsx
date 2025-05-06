"use client";

import { Image } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useImagesStore } from "@/stores/images-store";

interface ImageButtonProps {
  className?: string;
  word: string;
}

export function ImageButton({ className, word }: ImageButtonProps) {
  const { toggle, isLoading, hasImages, fetchImages } = useImagesStore();

  // If there are no images and we're not loading, don't render the button
  if (!hasImages && !isLoading) return null;

  return (
    <motion.button
      onClick={() => {
        if (!hasImages) {
          fetchImages(word);
        } else {
          toggle();
        }
      }}
      disabled={isLoading}
      className={cn(
        "relative flex items-center justify-center w-10 h-10 rounded-full",
        "bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      whileTap={{ scale: 0.85 }}
      transition={{ type: "spring", stiffness: 500, damping: 15 }}
    >
      <Image className="w-5 h-5 stroke-foreground" strokeWidth={2} />
    </motion.button>
  );
}
