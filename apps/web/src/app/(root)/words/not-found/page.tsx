import { WordNotFound } from "@/components/word-not-found";
import { notFound } from "next/navigation";

interface SearchParams {
  word?: string;
}

export default async function WordNotFoundPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // Since we're in a Server Component, we can access searchParams directly
  const { word } = searchParams;

  // If we somehow don't have a word, show the generic 404
  if (!word) {
    notFound();
  }

  return <WordNotFound word={word} />;
} 