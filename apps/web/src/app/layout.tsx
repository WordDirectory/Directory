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
  title: "WordDirectory - Simple dictionary with human-readable definitions",
  description:
    "WordDirectory explains words like a human would - clear, simple definitions without complex jargon. Search 150,000+ words with AI pronunciation and examples.",
  keywords: [
    "worddirectory",
    "word directory",
    "simple dictionary",
    "human readable definitions",
    "words explained simply",
    "dictionary",
    "definitions",
    "learning",
    "language",
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "WordDirectory",
              url: "https://worddirectory.app",
              description: "Simple dictionary with human-readable definitions",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://worddirectory.app/words/{search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "WordDirectory",
              url: "https://worddirectory.app",
              logo: "https://worddirectory.app/logo.png",
            }),
          }}
        />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased overflow-x-hidden`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
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
