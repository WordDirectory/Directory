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
  PlayCircle,
  ChevronDown,
  Link2,
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
import type { APIError, WordPronunciationResponse } from "@/types/api";
import {
  HEAR_EXAMPLES_BEHAVIOR_KEY,
  DEFAULT_HEAR_EXAMPLES_BEHAVIOR,
  type HearExamplesBehavior,
} from "@/lib/settings";

// Buffer time (in seconds) to add before and after pronunciation examples
const PRONUNCIATION_START_BUFFER_SECONDS = 0.5;
const PRONUNCIATION_END_BUFFER_SECONDS = 2.0;

const ERROR_MESSAGES: {
  [K in APIError["code"]]?: { title: string; description: string };
} = {
  AUTH_REQUIRED: {
    title: "Authentication required",
    description: "Please sign in to submit feedback for this word",
  },
  RATE_LIMIT_EXCEEDED: {
    title: "Too many requests",
    description: "Please wait a moment before submitting more feedback",
  },
  INTERNAL_SERVER_ERROR: {
    title: "Server error",
    description: "Something went wrong on our end. Please try again later",
  },
  VALIDATION_ERROR: {
    title: "Invalid feedback",
    description: "Please ensure your feedback meets our requirements",
  },
  FEEDBACK_ERROR: {
    title: "Feedback error",
    description: "Unable to submit feedback at this time",
  },
  PRONUNCIATION_NOT_FOUND: {
    title: "No pronunciation examples",
    description: "Try the 'Pronounce' button for AI-generated audio instead",
  },
};

interface WordHeaderProps {
  word: string;
  votes: number;
  hasVoted: boolean;
  isSaved: boolean;
  definitions: string[];
}

export function WordHeader({
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
  const [isPlayingExample, setIsPlayingExample] = useState(false);
  const [hearExamplesBehavior, setHearExamplesBehavior] =
    useState<HearExamplesBehavior>(DEFAULT_HEAR_EXAMPLES_BEHAVIOR);

  // Pre-fetching state for pronunciation examples
  const [prefetchedPronunciation, setPrefetchedPronunciation] =
    useState<WordPronunciationResponse | null>(null);
  const [isPrefetching, setIsPrefetching] = useState(false);
  const [prefetchError, setPrefetchError] = useState<APIError | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

    // Load hear examples behavior from localStorage
    const savedBehavior = localStorage.getItem(HEAR_EXAMPLES_BEHAVIOR_KEY);
    if (
      savedBehavior &&
      (savedBehavior === "hear-examples" || savedBehavior === "youglish")
    ) {
      setHearExamplesBehavior(savedBehavior as HearExamplesBehavior);
    }
  }, []);

  // Pre-fetch pronunciation data
  const prefetchPronunciation = async () => {
    if (isPrefetching || prefetchedPronunciation || prefetchError) {
      return; // Already prefetching, cached, or failed
    }

    setIsPrefetching(true);
    try {
      const response = await fetch(
        `/api/words/${encodeURIComponent(word)}/pronunciation`
      );

      const responseData = await response.json();

      if (!response.ok) {
        const errorData = responseData as APIError;
        setPrefetchError(errorData);
        return;
      }

      const data = responseData as WordPronunciationResponse;
      setPrefetchedPronunciation(data);
    } catch (error) {
      console.error("Error prefetching pronunciation:", error);
      setPrefetchError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to prefetch pronunciation",
        status: 500,
      });
    } finally {
      setIsPrefetching(false);
    }
  };

  // Always pre-fetch pronunciation data to determine availability
  useEffect(() => {
    prefetchPronunciation();
  }, [word]);

  // Handle dropdown state changes
  const handleDropdownOpenChange = (open: boolean) => {
    setIsDropdownOpen(open);
  };

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

  const handlePlayExample = async () => {
    let loadingTimeout: NodeJS.Timeout;

    // Only show loading state if operation takes more than 50ms
    loadingTimeout = setTimeout(() => {
      setIsPlayingExample(true);
    }, 50);

    try {
      let data: WordPronunciationResponse;

      // Use pre-fetched data if available
      if (prefetchedPronunciation) {
        data = prefetchedPronunciation;
        // Clear loading timeout immediately since we have cached data
        clearTimeout(loadingTimeout);
      } else if (prefetchError) {
        // Use cached error if we already know it failed
        const errorInfo = ERROR_MESSAGES[prefetchError.code];
        if (errorInfo) {
          toast.error(errorInfo.title, {
            description: errorInfo.description,
          });
        } else {
          toast.error(
            prefetchError.message || "Failed to get pronunciation example"
          );
        }
        clearTimeout(loadingTimeout);
        setIsPlayingExample(false);
        return;
      } else {
        // Fall back to fetching if not pre-fetched
        const response = await fetch(
          `/api/words/${encodeURIComponent(word)}/pronunciation`
        );

        const responseData = await response.json();

        if (!response.ok) {
          // Response is an error, use the structured error message
          const errorData = responseData as APIError;
          const errorInfo = ERROR_MESSAGES[errorData.code];

          if (errorInfo) {
            toast.error(errorInfo.title, {
              description: errorInfo.description,
            });
          } else {
            toast.error(
              errorData.message || "Failed to get pronunciation example"
            );
          }

          clearTimeout(loadingTimeout);
          setIsPlayingExample(false);
          return;
        }

        data = responseData as WordPronunciationResponse;
        // Clear loading timeout since we got the data
        clearTimeout(loadingTimeout);
      }

      // Calculate buffered start time (don't go below 0)
      const bufferedStartTime = Math.max(
        0,
        data.timestampStart - PRONUNCIATION_START_BUFFER_SECONDS
      );

      // Calculate total duration including buffer at both ends
      const totalDuration =
        data.duration +
        PRONUNCIATION_START_BUFFER_SECONDS +
        PRONUNCIATION_END_BUFFER_SECONDS;

      // Create hidden YouTube iframe for audio playback
      const iframe = document.createElement("iframe");
      iframe.width = "1";
      iframe.height = "1";
      iframe.style.position = "absolute";
      iframe.style.top = "-9999px";
      iframe.style.left = "-9999px";
      iframe.allow = "autoplay";
      iframe.src = `https://www.youtube.com/embed/${data.videoId}?enablejsapi=1&autoplay=1&start=${Math.floor(bufferedStartTime)}`;

      document.body.appendChild(iframe);

      // Stop playback after duration (including buffer time)
      setTimeout(
        () => {
          iframe.remove();
          setIsPlayingExample(false);
        },
        (totalDuration + 0.5) * 1000
      ); // Add 0.5s buffer for cleanup
    } catch (error) {
      console.error("Error playing pronunciation example:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to play pronunciation example";
      toast.error(errorMessage);
      clearTimeout(loadingTimeout);
      setIsPlayingExample(false);
    }
  };

  const handleYouglish = async () => {
    const url = `https://youglish.com/pronounce/${encodeURIComponent(word)}/english`;
    window.open(url, "_blank");
  };

  const handleHearExamples = async () => {
    if (hearExamplesBehavior === "youglish") {
      handleYouglish();
    } else {
      handlePlayExample();
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
        const errorMessage = ERROR_MESSAGES[error.code] || {
          title: "Error",
          description: error.message || "Something went wrong",
        };
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
        const errorMessage = ERROR_MESSAGES[error.code] || {
          title: "Error",
          description: error.message || "Something went wrong",
        };
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
            <div className="flex flex-wrap items-center gap-6 pl-1.5">
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
              <div className="flex items-center gap-2.5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-primary text-sm h-auto w-auto p-0 !bg-transparent"
                  title="Hear real world examples"
                  onClick={handleHearExamples}
                  disabled={
                    isPlayingExample ||
                    (hearExamplesBehavior === "hear-examples" &&
                      !prefetchedPronunciation)
                  }
                >
                  {isPlayingExample ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <PlayCircle className="w-4 h-4 mr-1" />
                  )}
                  <span>
                    {hearExamplesBehavior === "youglish"
                      ? "YouGlish"
                      : "Hear examples"}
                  </span>
                </Button>
                <DropdownMenu onOpenChange={handleDropdownOpenChange}>
                  <DropdownMenuTrigger>
                    <ChevronDown className="w-4 h-4 mr-1 text-muted-foreground" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={handlePlayExample}
                      disabled={!prefetchedPronunciation}
                    >
                      <PlayCircle className="w-4 h-4 mr-0.5" />
                      Hear examples
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleYouglish}>
                      <Link2 className="w-4 h-4 mr-0.5" />
                      Youglish
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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
