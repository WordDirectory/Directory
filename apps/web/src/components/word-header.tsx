"use client";

import {
  Volume2,
  ThumbsUp,
  Bookmark,
  MoreHorizontal,
  Video,
  Share2,
  LinkIcon,
  ThumbsDown,
  MessageSquareText,
  Loader2,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { VoteButton, toggleVote } from "@/components/vote-button";
import { SaveWord, toggleSave } from "@/components/save-word";
import { ImageButton } from "@/components/image-button";
import { playWordAudio } from "@/components/word-audio-button";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { APIError } from "@/types/api";

const ERROR_MESSAGES: {
  [K in APIError["code"]]: { title: string; description: string };
} = {
  AUTH_REQUIRED: {
    title: "Authentication required",
    description: "Please sign in to submit feedback for this word",
  },
  SUBSCRIPTION_LIMIT_REACHED: {
    title: "Subscription limit reached",
    description: "Please upgrade your plan to continue",
  },
  RATE_LIMIT_EXCEEDED: {
    title: "Too many requests",
    description: "Please wait a moment before submitting more feedback",
  },
  INTERNAL_SERVER_ERROR: {
    title: "Server error",
    description: "Something went wrong on our end. Please try again later",
  },
  ALREADY_VOTED: {
    title: "Already voted",
    description: "You've already voted for this word",
  },
  UNSPLASH_API_ERROR: {
    title: "Image error",
    description: "Failed to load image",
  },
  WORD_NOT_FOUND: {
    title: "Word not found",
    description: "This word no longer exists in our dictionary",
  },
  INVALID_WORD: {
    title: "Invalid word",
    description: "This word is not valid",
  },
  VALIDATION_ERROR: {
    title: "Invalid feedback",
    description: "Please ensure your feedback meets our requirements",
  },
  FEEDBACK_ERROR: {
    title: "Feedback error",
    description: "Unable to submit feedback at this time",
  },
};

interface WordHeaderProps {
  word: string;
  votes: number;
  hasVoted: boolean;
  isSaved: boolean;
  definitions: string[];
}

export default function WordHeader({
  word,
  votes,
  hasVoted,
  isSaved,
  definitions,
}: WordHeaderProps) {
  // These states are only needed for mobile dropdown optimistic UI.
  const [mobileHasVoted, setMobileHasVoted] = useState(hasVoted);
  const [mobileIsSaved, setMobileIsSaved] = useState(isSaved);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [hasReported, setHasReported] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoRef = useRef<HTMLImageElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isPronouncing, setIsPronouncing] = useState(false);

  // Load initial setup
  useEffect(() => {
    // Check if device is mobile
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));

    // Load logo
    const img = new window.Image();
    img.src = "/logo-with-text-black.png";
    img.crossOrigin = "anonymous";
    img.onload = () => {
      logoRef.current = img;
    };
  }, []);

  const generateImage = async (
    definitionIndex: number,
    format: "png" | "jpeg" = "jpeg"
  ): Promise<string | null> => {
    if (!canvasRef.current || !logoRef.current) {
      console.error("Canvas or logo not ready");
      return null;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      console.error("Could not get canvas context");
      return null;
    }

    // Set canvas size
    canvas.width = 1200;
    canvas.height = 630;

    // Clear canvas with white background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw logo - maintain aspect ratio with fixed height
    const logoHeight = 44;
    const logoWidth =
      logoRef.current.width * (logoHeight / logoRef.current.height);
    ctx.drawImage(logoRef.current, 60, 60, logoWidth, logoHeight);

    // Set up text styles
    ctx.textBaseline = "top";

    // Calculate vertical centering
    const wordHeight = 110; // Approx height of word
    const spaceBetween = 28; // Space between word and definition
    const def = definitions[definitionIndex];
    const words = def.split(" ");
    const maxWidth = canvas.width - 120;

    // Estimate number of lines
    let lineCount = 1;
    let currentLine = "";

    ctx.font = "36px Inter, system-ui, sans-serif";
    for (const word of words) {
      const testLine = currentLine + word + " ";
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine !== "") {
        lineCount++;
        currentLine = word + " ";
      } else {
        currentLine = testLine;
      }
    }

    const defHeight = lineCount * 44; // Line height increased to 44px to match larger font
    const totalContentHeight = wordHeight + spaceBetween + defHeight;
    const availableHeight = canvas.height - 120 - 60; // Subtract logo area and bottom margin

    // Center vertically in available space
    const verticalPadding = (availableHeight - totalContentHeight) / 2;
    const wordY = 120 + verticalPadding;
    const definitionY = wordY + wordHeight + spaceBetween;

    // Draw word
    ctx.font = "bold 96px Inter, system-ui, sans-serif";
    ctx.fillStyle = "#09090B";
    ctx.fillText(word, 60, wordY);

    // Draw definition
    ctx.font = "36px Inter, system-ui, sans-serif";
    ctx.fillStyle = "rgba(9, 9, 11, 0.7)";

    // Word wrap the text
    let line = "";
    let currentY = definitionY;

    words.forEach((word) => {
      const testLine = line + word + " ";
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && line !== "") {
        ctx.fillText(line, 60, currentY);
        line = word + " ";
        currentY += 44; // Line height increased to 44px
      } else {
        line = testLine;
      }
    });

    // Draw the last line
    if (line.trim()) {
      ctx.fillText(line, 60, currentY);
    }

    // Draw URL at bottom
    ctx.fillStyle = "rgba(9, 9, 11, 0.5)";
    ctx.font = "24px Inter, system-ui, sans-serif";
    ctx.fillText("worddirectory.app", 60, 580);

    // Return appropriate format
    return canvas.toDataURL(
      `image/${format}`,
      format === "jpeg" ? 0.9 : undefined
    );
  };

  const handleImageAction = async (definitionIndex: number) => {
    console.log(
      `${isMobile ? "Save" : "Copy"} image clicked for definition ${definitionIndex + 1}`
    );
    setIsGenerating(true);
    try {
      // Use JPEG for downloads (smaller file size) and PNG for clipboard (better compatibility)
      const format = isMobile ? "jpeg" : "png";
      const dataUrl = await generateImage(definitionIndex, format);
      if (!dataUrl) {
        console.error("Failed to generate image");
        toast.error("Failed to generate image");
        return;
      }

      if (isMobile) {
        // Save image on mobile
        console.log("Setting up download");
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `${word}-definition.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        console.log("Download triggered");
        toast.success("Image downloaded successfully");
      } else {
        // Copy image on desktop
        console.log("Creating blob from dataUrl");
        try {
          const response = await fetch(dataUrl);
          const blob = await response.blob();

          console.log("Writing to clipboard");
          await navigator.clipboard.write([
            new ClipboardItem({
              [blob.type]: blob,
            }),
          ]);
          console.log("Successfully copied to clipboard");
          toast.success("Image copied to clipboard");
        } catch (blobError) {
          console.error("Error with blob or clipboard:", blobError);

          // Fallback method if clipboard API fails
          console.log("Trying fallback copy method...");
          try {
            const textarea = document.createElement("textarea");
            textarea.value = `Check out the definition of "${word}" on WordDirectory: https://worddirectory.app/words/${encodeURIComponent(word)}`;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
            console.log("Fallback: Copied link instead");
            toast.success(
              "Link copied to clipboard (image copying not supported in your browser)"
            );
          } catch (fallbackError) {
            console.error("Even fallback copy failed:", fallbackError);
            toast.error("Failed to copy to clipboard");
          }
        }
      }
    } catch (error) {
      console.error(
        `Error in ${isMobile ? "save" : "copy"} image flow:`,
        error
      );
      toast.error(`Failed to ${isMobile ? "save" : "copy"} image`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMobileVote = async () => {
    if (!session) {
      const currentUrl = encodeURIComponent(window.location.pathname);
      router.push(`/auth/login?next=${currentUrl}`);
      return;
    }

    const result = await toggleVote(word, mobileHasVoted);
    if (result) {
      setMobileHasVoted(result.hasVoted);
    }
  };

  const handleMobileSave = async () => {
    if (!session) {
      const currentUrl = encodeURIComponent(window.location.pathname);
      router.push(`/auth/login?next=${currentUrl}`);
      return;
    }

    const result = await toggleSave(word, mobileIsSaved);
    if (result !== null) {
      setMobileIsSaved(result);
    }
  };

  const handlePronounce = async () => {
    let loadingTimeout: NodeJS.Timeout;

    // Only show loading state if operation takes more than 50ms
    loadingTimeout = setTimeout(() => {
      setIsPronouncing(true);
    }, 50);

    try {
      await playWordAudio(word);
    } catch {
      /* already logged */
    } finally {
      clearTimeout(loadingTimeout);
      setIsPronouncing(false);
    }
  };

  const handleCopyLink = async () => {
    const url = `https://worddirectory.app/words/${encodeURIComponent(word)}`;
    await navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  const handleFeedback = () => {
    setIsFeedbackOpen(true);
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackMessage.trim()) {
      toast.error("Please enter your feedback", {
        description: "Your feedback message cannot be empty",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `/api/words/${encodeURIComponent(word)}/feedback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: feedbackMessage.trim(),
          }),
        }
      );

      const data = (await response.json()) as { feedback?: unknown } | APIError;

      if (!response.ok) {
        const error = data as APIError;
        const errorMessage = ERROR_MESSAGES[error.code];
        toast.error(errorMessage.title, {
          description: errorMessage.description,
        });
        return;
      }

      toast.success("Feedback submitted successfully", {
        description: "Thank you for helping us improve WordDirectory!",
      });
      setFeedbackMessage("");
      setIsFeedbackOpen(false);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Network error", {
        description: "Please check your internet connection and try again",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReport = async () => {
    setIsReporting(true);
    try {
      const response = await fetch(
        `/api/words/${encodeURIComponent(word)}/report`,
        {
          method: hasReported ? "DELETE" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = (await response.json()) as
        | { hasReported?: boolean }
        | APIError;

      if (!response.ok) {
        const error = data as APIError;
        const errorMessage = ERROR_MESSAGES[error.code];
        toast.error(errorMessage.title, {
          description: errorMessage.description,
        });
        return;
      }

      setHasReported(!hasReported);

      toast.success(hasReported ? "Report removed" : "Definition reported", {
        description: hasReported
          ? "You've removed your report of this definition"
          : "Thank you for helping us improve WordDirectory",
      });
    } catch (error) {
      console.error("Error reporting definition:", error);
      toast.error("Network error", {
        description: "Please check your internet connection and try again",
      });
    } finally {
      setIsReporting(false);
    }
  };

  // Build share definitions list (use first two for brevity)
  const shareDefinitions = definitions.slice(0, 2);

  return (
    <>
      {/* Hidden canvas for generating image */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <div className="mb-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap justify-between">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground/85 break-words hyphens-auto max-w-[80%]">
              {word}
            </h1>

            {/* Mobile action buttons */}
            <div className="sm:hidden flex items-center gap-2 mt-2">
              <ImageButton word={word} className="!h-10 !w-10" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-primary rounded-full !h-10 !w-10 !ring-0 !outline-none !stroke-none"
                  >
                    <MoreHorizontal className="!w-5 !h-5" />
                    <span className="sr-only">More options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={handleMobileVote}>
                    <ThumbsUp className="w-4 h-4 mr-0.5" />
                    {mobileHasVoted ? "Unlike" : "Like"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={handleMobileSave}>
                    <Bookmark className="w-4 h-4 mr-0.5" />
                    {mobileIsSaved ? "Unsave" : "Save"}
                  </DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Share2 className="w-4 h-4 mr-0.5" />
                      Share
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={handleCopyLink}>
                        <LinkIcon className="w-4 h-4 mr-0.5" />
                        Copy link
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {shareDefinitions.map((_, index) => (
                        <DropdownMenuItem
                          key={index}
                          onClick={() => handleImageAction(index)}
                          disabled={isGenerating}
                        >
                          {isGenerating
                            ? "Generating..."
                            : `Definition ${index + 1}`}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleFeedback}>
                    <MessageSquareText className="w-4 h-4 mr-0.5" />
                    Say something
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleReport}
                    disabled={isReporting}
                    className={hasReported ? "text-primary" : ""}
                  >
                    <ThumbsDown
                      className={`w-4 h-4 mr-0.5 ${
                        hasReported && "fill-primary stroke-primary"
                      }`}
                    />
                    Bad definition
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Desktop action buttons */}
          <div className="flex justify-between">
            <div className="flex flex-wrap items-center gap-6">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary text-sm h-auto w-auto p-0 !bg-transparent"
                title="Listen to pronunciation"
                onClick={handlePronounce}
                disabled={isPronouncing}
              >
                {isPronouncing ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Volume2 className="w-4 h-4 mr-1" />
                )}
                <span>Pronounce</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary text-sm h-auto w-auto p-0 !bg-transparent"
                title="Watch examples on Youglish"
                asChild
              >
                <a
                  href={`https://youglish.com/pronounce/${encodeURIComponent(word)}/english`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Video className="w-4 h-4 mr-1" />
                  <span>Youglish</span>
                </a>
              </Button>
            </div>

            <div className="hidden sm:flex items-center gap-3">
              <VoteButton
                word={word}
                initialVotes={votes}
                initialHasVoted={hasVoted}
              />
              <SaveWord word={word} initialIsSaved={isSaved} />
              <ImageButton word={word} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-primary rounded-full !h-10 !w-10 !ring-0 !outline-none !stroke-none"
                  >
                    <MoreHorizontal className="!w-5 !h-5" />
                    <span className="sr-only">More</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Share2 className="w-4 h-4 mr-0.5" />
                      Share
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={handleCopyLink}>
                        <LinkIcon className="w-4 h-4 mr-0.5" />
                        Copy link
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {shareDefinitions.map((_, index) => (
                        <DropdownMenuItem
                          key={index}
                          onClick={() => handleImageAction(index)}
                          disabled={isGenerating}
                        >
                          {isGenerating
                            ? "Generating..."
                            : `Definition ${index + 1}`}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuItem onClick={handleFeedback}>
                    <MessageSquareText className="w-4 h-4 mr-0.5" />
                    Say something
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleReport}
                    disabled={isReporting}
                    className={hasReported ? "text-primary" : ""}
                  >
                    <ThumbsDown
                      className={`w-4 h-4 mr-0.5 ${
                        hasReported && "fill-primary stroke-primary"
                      }`}
                    />
                    Bad definition
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Dialog */}
      <Dialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
        <DialogContent className="p-5 bg-background">
          <DialogHeader>
            <DialogTitle>Submit Feedback</DialogTitle>
            <DialogDescription>
              Help us improve the definition of "{word}" by sharing your
              thoughts.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2 mx-0.5">
            <Textarea
              placeholder="Your feedback..."
              value={feedbackMessage}
              onChange={(e) => setFeedbackMessage(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsFeedbackOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitFeedback} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
