"use client";
import { LinkIcon, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DefinitionItem {
  text: string;
  examples?: string[];
}

interface ShareWordProps {
  word: string;
  definitions: DefinitionItem[];
}

export function ShareWord({ word, definitions }: ShareWordProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoRef = useRef<HTMLImageElement | null>(null);
  const [selectedDefinition, setSelectedDefinition] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if device is mobile
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  // Make sure definitions is an array
  const definitionsArray = Array.isArray(definitions) 
    ? definitions 
    : [definitions].filter(Boolean);

  const hasMultipleDefinitions = definitionsArray.length > 1;
  
  // Load logo and get its dimensions
  useEffect(() => {
    const img = new window.Image();
    img.src = "/logo-with-text-black.png";
    img.crossOrigin = "anonymous";
    img.onload = () => {
      logoRef.current = img;
    };
  }, []);

  const handleCopyLink = async () => {
    const url = `https://worddirectory.app/words/${encodeURIComponent(word)}`;
    await navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
    setIsOpen(false);
  };

  const generateImage = async (definitionIndex: number, format: 'png' | 'jpeg' = 'jpeg'): Promise<string | null> => {
    if (!canvasRef.current || !logoRef.current) {
      console.error("Canvas or logo not ready");
      return null;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
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
    const logoWidth = logoRef.current.width * (logoHeight / logoRef.current.height);
    ctx.drawImage(logoRef.current, 60, 60, logoWidth, logoHeight);
    
    // Set up text styles
    ctx.textBaseline = "top";
    
    // Calculate vertical centering
    const wordHeight = 110; // Approx height of word
    const spaceBetween = 28; // Space between word and definition
    const def = definitionsArray[definitionIndex].text;
    const words = def.split(' ');
    const maxWidth = canvas.width - 120;
    
    // Estimate number of lines
    let lineCount = 1;
    let currentLine = '';
    
    ctx.font = "36px Inter, system-ui, sans-serif";
    for (const word of words) {
      const testLine = currentLine + word + ' ';
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine !== '') {
        lineCount++;
        currentLine = word + ' ';
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
    let line = '';
    let currentY = definitionY;
    
    words.forEach(word => {
      const testLine = line + word + ' ';
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && line !== '') {
        ctx.fillText(line, 60, currentY);
        line = word + ' ';
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
    return canvas.toDataURL(`image/${format}`, format === 'jpeg' ? 0.9 : undefined);
  };

  const handleImageAction = async (definitionIndex: number) => {
    console.log(`${isMobile ? 'Save' : 'Copy'} image clicked for definition ${definitionIndex + 1}`);
    setIsGenerating(true);
    try {
      // Use JPEG for downloads (smaller file size) and PNG for clipboard (better compatibility)
      const format = isMobile ? 'jpeg' : 'png';
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
            const textarea = document.createElement('textarea');
            textarea.value = `Check out the definition of "${word}" on WordDirectory: https://worddirectory.app/words/${encodeURIComponent(word)}`;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            console.log("Fallback: Copied link instead");
            toast.success("Link copied to clipboard (image copying not supported in your browser)");
          } catch (fallbackError) {
            console.error("Even fallback copy failed:", fallbackError);
            toast.error("Failed to copy to clipboard");
          }
        }
      }
    } catch (error) {
      console.error(`Error in ${isMobile ? 'save' : 'copy'} image flow:`, error);
      toast.error(`Failed to ${isMobile ? 'save' : 'copy'} image`);
    } finally {
      setIsGenerating(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Hidden canvas for generating image */}
      <canvas 
        ref={canvasRef} 
        style={{ display: 'none' }}
      />

      {/* Share button and popover */}
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
              <LinkIcon className="w-4 h-4" />
              Copy link
            </Button>
            <div className="h-px bg-border my-1" />
            {definitionsArray.map((_, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleImageAction(index)}
                disabled={isGenerating}
              >
                {isGenerating && selectedDefinition === index ? "Generating..." : `Definition ${index + 1}`}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}