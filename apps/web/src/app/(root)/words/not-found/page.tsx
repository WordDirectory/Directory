import { WordNotFound } from "@/components/word-not-found";
import { notFound } from "next/navigation";

interface WordNotFoundPageProps {
  params: {};
  searchParams: {
    word?: string;
  };
}

export default function WordNotFoundPage({
  searchParams,
}: WordNotFoundPageProps) {
  const { word } = searchParams;

  // If we somehow don't have a word, show the generic 404
  if (!word) {
    notFound();
  }

  return <WordNotFound word={word} />;
} 