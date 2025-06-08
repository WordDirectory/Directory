import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { MessageProvider } from "@/components/message-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "WordDirectory",
  description:
    "Words explained like a human would - definitions that actually make sense without using other complex words you don't know",
  keywords: [
    "words",
    "dictionary",
    "definitions",
    "learning",
    "language",
    "simple",
    "human",
    "readable",
  ],
  openGraph: {
    title: "WordDirectory",
    description:
      "Words explained like a human would - definitions that actually make sense without using other complex words you don't know",
    url: "https://worddirectory.app",
    siteName: "WordDirectory",
    images: [
      {
        url: "https://worddirectory.app/og/primary.jpg",
        width: 1200,
        height: 630,
        alt: "WordDirectory - Words explained like a human would",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WordDirectory",
    description:
      "Words explained like a human would - definitions that actually make sense without using other complex words you don't know",
    images: ["https://worddirectory.app/og/primary.jpg"],
  },
  alternates: {
    canonical: "https://worddirectory.app",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/og/primary.jpg",
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased overflow-x-hidden`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <TooltipProvider>
            {children}
            <Analytics />
            <Toaster />
            <MessageProvider />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
