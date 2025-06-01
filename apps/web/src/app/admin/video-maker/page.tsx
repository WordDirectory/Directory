"use client";

import { useState } from "react";
import { tikTokContent, TikTokPost } from "./tiktok-content";
import satori from "satori";

// Convert SVG to PNG
const convertSvgToPng = (
  svg: string,
  width: number,
  height: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = width;
    canvas.height = height;

    const img = new Image();
    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0);
        const pngDataURL = canvas.toDataURL("image/png");
        resolve(pngDataURL);
      } else {
        reject(new Error("Canvas context not available"));
      }
    };

    img.onerror = () => reject(new Error("Failed to load SVG"));
    img.src = `data:image/svg+xml;base64,${btoa(svg)}`;
  });
};

export default function VideoMakerPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const generateImages = async () => {
    setIsGenerating(true);
    setGeneratedImages([]);

    try {
      const images: string[] = [];

      for (let i = 0; i < tikTokContent.slides.length; i++) {
        const slide = tikTokContent.slides[i];

        // Create JSX for the slide
        const slideJSX = (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
              backgroundColor: "#ffffff",
              fontFamily: "Arial",
              padding: "100px",
              textAlign: "center",
            }}
          >
            {slide.isFirstSlide && slide.title && (
              <div
                style={{
                  fontSize: "76px",
                  fontWeight: "bold",
                  color: "#000000",
                  marginBottom: "60px",
                  lineHeight: "1.2",
                }}
              >
                {slide.title}
              </div>
            )}
            {slide.content && (
              <div
                style={{
                  fontSize: slide.isFirstSlide ? "64px" : "72px",
                  fontWeight: slide.isFirstSlide ? "normal" : "bold",
                  color: slide.isFirstSlide ? "#666666" : "#000000",
                  lineHeight: "1.4",
                  textAlign: "center",
                  maxWidth: "920px",
                }}
              >
                {slide.content}
              </div>
            )}
            {slide.showSwipe && (
              <div
                style={{
                  marginTop: slide.isFirstSlide ? "0px" : "57px",
                  fontSize: "62px",
                  color: "#000000",
                }}
              >
                Swipe &gt;
              </div>
            )}
          </div>
        );

        // Generate SVG using Satori
        const svg = await satori(slideJSX, {
          width: 1080,
          height: 1920,
          fonts: [
            {
              name: "Arial",
              data: await fetch(
                "https://cdn.jsdelivr.net/npm/@fontsource/inter@4.5.15/files/inter-latin-400-normal.woff"
              ).then((res) => res.arrayBuffer()),
              weight: 400,
              style: "normal",
            },
            {
              name: "Arial",
              data: await fetch(
                "https://cdn.jsdelivr.net/npm/@fontsource/inter@4.5.15/files/inter-latin-700-normal.woff"
              ).then((res) => res.arrayBuffer()),
              weight: 700,
              style: "normal",
            },
          ],
        });

        // Convert SVG to PNG
        const pngDataURL = await convertSvgToPng(svg, 1080, 1920);
        images.push(pngDataURL);
      }

      setGeneratedImages(images);
    } catch (error) {
      console.error("Error generating images:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = (dataURL: string, index: number) => {
    const link = document.createElement("a");
    link.download = `${tikTokContent.id}-slide-${index + 1}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAll = () => {
    generatedImages.forEach((dataURL, index) => {
      setTimeout(() => {
        downloadImage(dataURL, index);
      }, index * 100); // Small delay between downloads
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          TikTok Image Generator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Content Info & Generate */}
          <div className="space-y-6">
            <div className="p-6 border border-gray-200 rounded-lg bg-white">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                {tikTokContent.title}
              </h2>
              <p className="text-gray-600 mb-4">
                {tikTokContent.slides.length} slides ready to generate
              </p>

              <button
                onClick={generateImages}
                disabled={isGenerating}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? "Generating Images..." : "Generate Images"}
              </button>
            </div>
          </div>

          {/* Generated Images */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-800">
                Generated Images
              </h2>
              {generatedImages.length > 0 && (
                <button
                  onClick={downloadAll}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700"
                >
                  Download All
                </button>
              )}
            </div>

            {generatedImages.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {generatedImages.map((dataURL, index) => (
                  <div key={index} className="space-y-2">
                    <img
                      src={dataURL}
                      alt={`Slide ${index + 1}`}
                      className="w-full border rounded-lg shadow-md"
                      style={{ aspectRatio: "9/16" }}
                    />
                    <button
                      onClick={() => downloadImage(dataURL, index)}
                      className="w-full bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                    >
                      Download Slide {index + 1}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                Select content and click "Generate Images" to create TikTok
                slides
              </div>
            )}
          </div>
        </div>

        {/* Preview Content */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Content Preview: {tikTokContent.title}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tikTokContent.slides.map((slide, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-lg bg-white"
              >
                <div className="text-sm text-gray-500 mb-2">
                  Slide {index + 1}
                  {slide.isFirstSlide && (
                    <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      First
                    </span>
                  )}
                </div>
                {slide.title && (
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {slide.title}
                  </h4>
                )}
                <p className="text-gray-700">{slide.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
