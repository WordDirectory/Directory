"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import domtoimage from "dom-to-image";
import { slide } from "./data";

export default function Videos() {
  const downloadSlide = async () => {
    const slideElement = document.getElementById("slide");
    if (!slideElement) return;

    try {
      const dataUrl = await domtoimage.toPng(slideElement, {
        quality: 1.0,
        bgcolor: "white",
        height: 1643,
        width: 1080,
      });

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${slide.title.replace('"', "").replace('"', "")}.png`;
      link.click();
    } catch (error) {
      console.error("Failed to download slide:", error);
    }
  };

  return (
    <div className="bg-white flex items-center justify-center min-h-screen p-8 relative">
      <div
        id="slide"
        style={{
          width: "1080px",
          height: "1643px",
        }}
        className="bg-white outline outline-4 outline-accent p-24 space-y-8 flex flex-col justify-center"
      >
        <h3 className="text-[3.5em] font-semibold flex flex-col leading-none gap-2">
          {slide.title} <span>{slide.subtitle}</span>
        </h3>
        <ul className="list-disc list-outside pl-12 space-y-2">
          {slide.items.map((item) => (
            <li key={item.text} className="pl-0 text-foreground text-[3rem]">
              {item.text}
            </li>
          ))}
        </ul>
      </div>

      <Button
        onClick={downloadSlide}
        className="fixed bottom-8 right-8"
        variant="outline"
      >
        <Download className="mr-2 h-4 w-4" />
        Download Slide
      </Button>
    </div>
  );
}
