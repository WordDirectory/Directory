import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saved Words | WordDirectory",
  description: "View and manage your saved words on WordDirectory",
  openGraph: {
    title: "Your Saved Words on WordDirectory",
    description: "View and manage your saved words on WordDirectory",
    url: "https://worddirectory.app/user/saved",
    siteName: "WordDirectory",
  },
  twitter: {
    card: "summary_large_image",
    title: "Your Saved Words on WordDirectory",
    description: "View and manage your saved words on WordDirectory",
  },
};

export default function SavedWordsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
