"use client";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useImagesStore } from "@/stores/images-store";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useRef } from "react";
import { Sheet, SheetContent, SheetClose } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "motion/react";

interface UnsplashImage {
  id: string;
  url: string;
  alt: string;
  user: {
    name: string;
    username: string;
  };
}

// Create a cache to store images by word
const imageCache = new Map<string, UnsplashImage[]>();

export function WordImages({ word }: { word: string }) {
  const {
    isOpen,
    setIsOpen,
    initializeFromPreference,
    images,
    isLoading,
    error,
    fetchImages,
  } = useImagesStore();
  const isMobile = useIsMobile();
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch images when word changes
    fetchImages(word);
  }, [word, fetchImages]);

  useEffect(() => {
    initializeFromPreference();
  }, [initializeFromPreference]);

  const handleImageClick = (image: any) => {
    window.open(
      `https://unsplash.com/photos/${image.id}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const ImageGrid = ({ isMobileView }: { isMobileView?: boolean }) => (
    <div
      className={cn(
        "grid grid-cols-2 gap-4 p-4 pt-0",
        isMobileView && "w-full"
      )}
    >
      {isLoading ? (
        <div className="col-span-2">
          <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "relative flex flex-col rounded-lg overflow-hidden",
                  isMobileView && "w-full"
                )}
              >
                <div className="relative aspect-square">
                  <Skeleton className="absolute inset-0" />
                </div>
                <div className="p-2 text-xs text-center">
                  <Skeleton className="h-4 w-24 mx-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="col-span-2 text-center py-8 text-red-500">{error}</div>
      ) : images.length === 0 ? (
        <div className="col-span-2 text-center py-8">No images found</div>
      ) : isOpen ? (
        <AnimatePresence>
          {images.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className={cn(
                "relative flex flex-col rounded-lg overflow-hidden",
                isMobileView && "w-full"
              )}
            >
              <div
                className="relative aspect-square cursor-pointer"
                onClick={() => handleImageClick(image)}
              >
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-2 text-xs text-center text-muted-foreground">
                {image.user.name} on Unsplash
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      ) : null}
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0">
          <div className="flex items-center justify-between sticky top-0 bg-background px-6 py-4 shadow-xl shadow-background/65 z-10">
            <h2 className="text-lg font-semibold">Images</h2>
            <SheetClose asChild>
              <Button variant="ghost" size="icon">
                <XIcon className="w-4 h-4" />
              </Button>
            </SheetClose>
          </div>
          <div className="overflow-y-auto max-h-[calc(100vh-3.5rem)]">
            <ImageGrid isMobileView />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className="relative transition-all duration-300 ease-in-out"
      style={{ width: isOpen ? "24rem" : 0 }}
    >
      {isOpen && (
        <div
          ref={sidebarRef}
          className="sticky top-14 w-96 border-l bg-background overflow-hidden"
          style={{
            height: "calc(100vh - 3.5rem)",
            overflowY: "auto",
          }}
        >
          <div className="flex items-center justify-between sticky top-0 bg-background px-5 py-4 shadow-xl shadow-background/65 z-10">
            <h3 className="text-xl font-semibold">Images</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <XIcon className="w-4 h-4" />
            </Button>
          </div>
          <ImageGrid />
        </div>
      )}
    </div>
  );
}
