"use client";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";

interface SaveWordProps {
  word: string;
}

export function SaveWord({ word }: SaveWordProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);

  // Fetch initial save state
  useEffect(() => {
    if (!session) return;

    fetch(`/api/words/${encodeURIComponent(word)}/save`)
      .then((res) => res.json())
      .then((data) => {
        setIsSaved(data.isSaved);
      });
  }, [word, session]);

  const handleSave = async () => {
    if (!session) {
      // Get the current URL and encode it
      const currentUrl = encodeURIComponent(window.location.pathname);
      router.push(`/auth/login?next=${currentUrl}`);
      return;
    }

    // Optimistic update
    const prevSaved = isSaved;
    setIsSaved(!isSaved);

    try {
      const res = await fetch(`/api/words/${encodeURIComponent(word)}/save`, {
        method: prevSaved ? "DELETE" : "POST",
      });

      if (!res.ok) {
        // Revert on error
        setIsSaved(prevSaved);
      }
    } catch (error) {
      // Revert on error
      setIsSaved(prevSaved);
      console.error("Error saving word:", error);
    }
  };

  return (
    <motion.button
      onClick={handleSave}
      className={cn(
        "relative flex items-center justify-center w-10 h-10 rounded-full",
        isSaved
          ? "bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-500"
          : "bg-muted hover:bg-muted/80"
      )}
      whileTap={{ scale: 0.85 }}
      transition={{ type: "spring", stiffness: 500, damping: 15 }}
    >
      <motion.div
        animate={{
          scale: isSaved ? [1, 1.2, 1] : 1,
          rotate: isSaved ? [0, 10, -10, 0] : 0,
          y: isSaved ? [0, -2, 0] : 0,
        }}
        transition={{
          duration: 0.5,
          ease: "easeInOut",
        }}
      >
        <Bookmark
          className={cn(
            "w-5 h-5",
            isSaved ? "fill-white stroke-white" : "stroke-foreground"
          )}
          strokeWidth={isSaved ? 2.5 : 2}
        />
      </motion.div>

      <AnimatePresence>
        {isSaved && (
          <motion.div
            className="absolute"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.5, 0] }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-16 h-16 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSaved && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full bg-white"
                initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                animate={{
                  scale: [0, 1, 0.5],
                  x: [0, (i % 2 ? 1 : -1) * (15 + Math.random() * 15)],
                  y: [0, -20 - Math.random() * 20],
                  opacity: [1, 1, 0],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
