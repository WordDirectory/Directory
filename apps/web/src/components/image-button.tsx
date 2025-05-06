"use client";

import { Image } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useImagesStore } from "@/stores/images-store";

interface ImageButtonProps {
  className?: string;
}

export function ImageButton({ className }: ImageButtonProps) {
  const { toggle } = useImagesStore();

  return (
    <motion.button
      onClick={toggle}
      className={cn(
        "relative flex items-center justify-center w-10 h-10 rounded-full",
        "bg-muted hover:bg-muted/80",
        className
      )}
      whileTap={{ scale: 0.85 }}
      transition={{ type: "spring", stiffness: 500, damping: 15 }}
    >
      <Image className="w-5 h-5 stroke-foreground" strokeWidth={2} />
    </motion.button>
  );
}
