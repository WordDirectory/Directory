import { WordNotFound } from "@/components/word-not-found";
import { notFound } from "next/navigation";

type Params = Promise<{
  word?: string;
}>;

interface WordNotFoundPageProps {
  params: {};
  searchParams: Params;
}

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