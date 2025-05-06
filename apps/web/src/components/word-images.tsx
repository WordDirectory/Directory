"use client";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useImagesStore } from "@/stores/images-store";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect } from "react";
import { Sheet, SheetContent, SheetClose } from "@/components/ui/sheet";

export function WordImages({ word }: { word: string }) {
  const { isOpen, setIsOpen, initializeFromPreference } = useImagesStore();
  const isMobile = useIsMobile();

  useEffect(() => {
    initializeFromPreference();
  }, [initializeFromPreference]);

  const ImageGrid = ({ isMobileView }: { isMobileView?: boolean }) => (
    <div
      className={cn(
        "grid grid-cols-2 gap-4 p-4 pt-0",
        isMobileView && "w-full"
      )}
    >
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num) => (
        <div
          key={num}
          className={cn(
            "relative aspect-square rounded-lg overflow-hidden",
            isMobileView && "w-full"
          )}
        >
          <Image
            src={`/unsplash-${num}.jpg`}
            alt={`Image ${num} for ${word}`}
            fill
            className="object-cover"
          />
        </div>
      ))}
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
          <div className="overflow-y-auto max-h-[calc(100vh-4rem)]">
            <ImageGrid isMobileView />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden transition-all duration-300 ease-in-out",
        isOpen ? "w-96" : "w-0"
      )}
    >
      <div className="w-96 border-l max-h-[calc(100vh-3.5rem)] align-top overflow-y-auto bg-background">
        <div className="flex items-center justify-between sticky top-0 bg-background px-5 py-4 shadow-xl shadow-background/65 transition-opacity duration-300 z-10">
          <h3 className="text-xl font-semibold">Images</h3>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <XIcon className="w-4 h-4" />
          </Button>
        </div>
        <ImageGrid />
      </div>
    </div>
  );
}
