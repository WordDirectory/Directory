"use client";
import { ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";

export async function toggleVote(word: string, prevVoted: boolean) {
  try {
    const res = await fetch(`/api/words/${encodeURIComponent(word)}/vote`, {
      method: prevVoted ? "DELETE" : "POST",
    });

    if (!res.ok) {
      console.error("[toggleVote] API error:", await res.json());
      return null;
    }

    return (await res.json()) as { votes: number; hasVoted: boolean };
  } catch (error) {
    console.error("[toggleVote] Error:", error);
    return null;
  }
}

interface VoteButtonProps {
  word: string;
  initialVotes: number;
  initialHasVoted: boolean;
}

export function VoteButton({
  word,
  initialVotes,
  initialHasVoted,
}: VoteButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [votes, setVotes] = useState(initialVotes);
  const [hasVoted, setHasVoted] = useState(initialHasVoted);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleVote = async () => {
    if (!session) {
      // Redirect unauthenticated users to login
      const currentUrl = encodeURIComponent(window.location.pathname);
      router.push(`/auth/login?next=${currentUrl}`);
      return;
    }

    setIsAnimating(true);

    // Optimistic update
    const prevVoted = hasVoted;
    const prevVotes = votes;
    setHasVoted(!hasVoted);
    setVotes(votes + (hasVoted ? -1 : 1));

    const result = await toggleVote(word, prevVoted);

    if (!result) {
      // Revert on error
      setHasVoted(prevVoted);
      setVotes(prevVotes);
    } else {
      setHasVoted(result.hasVoted);
      setVotes(result.votes);
    }

    // Reset animation state after a delay
    setTimeout(() => setIsAnimating(false), 600);
  };

  return (
    <div className="flex items-center gap-2">
      <motion.button
        onClick={handleVote}
        className={cn(
          "relative flex items-center justify-center w-10 h-10 rounded-full",
          hasVoted
            ? "bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500"
            : "bg-muted hover:bg-muted/80"
        )}
        whileTap={{ scale: 0.85 }}
        transition={{ type: "spring", stiffness: 500, damping: 15 }}
      >
        <motion.div
          animate={
            isAnimating
              ? {
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                  y: [0, -2, 0],
                }
              : {}
          }
          transition={{
            duration: 0.5,
            ease: "easeInOut",
          }}
        >
          <ThumbsUp
            className={cn(
              "w-5 h-5",
              hasVoted ? "fill-white stroke-white" : "stroke-foreground"
            )}
            strokeWidth={hasVoted ? 2.5 : 2}
          />
        </motion.div>

        <AnimatePresence>
          {isAnimating && hasVoted && (
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
          {isAnimating && hasVoted && (
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

      <motion.div
        key={votes}
        initial={{ opacity: 1, y: 0 }}
        animate={
          isAnimating
            ? {
                opacity: [0, 1],
                y: [-10, 0],
              }
            : {}
        }
        transition={{ duration: 0.2 }}
        className="min-w-[1rem] text-sm font-medium"
      >
        {votes}
      </motion.div>
    </div>
  );
}
