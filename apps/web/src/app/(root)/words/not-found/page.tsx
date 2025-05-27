import { WordNotFound } from "@/components/word-not-found";
import { notFound } from "next/navigation";

interface WordNotFoundPageProps {
  searchParams: Promise<{
    word?: string;
  }>;
}

export const runtime = "edge";

export default async function WordNotFoundPage({
  searchParams,
}: WordNotFoundPageProps) {
  const { word } = await searchParams;

  // If we somehow don't have a word, show the generic 404
  if (!word) {
    notFound();
  }

  return <WordNotFound word={word} />;
} 