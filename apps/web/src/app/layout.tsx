import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
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
        url: "https://worddirectory.app/og-image.jpg",
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
    images: ["https://worddirectory.app/og/default.png"],
  },
  alternates: {
    canonical: "https://worddirectory.app",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/og/default.png",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider>
            {children}
            <Analytics />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
