import { auth } from "@/lib/auth";
import { WordLookupLimit } from "@/components/word-lookup-limit";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { BackButton } from "@/components/back-button";

interface WordLimitReachedPageProps {
  searchParams: Promise<{
    word?: string;
    usage?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: WordLimitReachedPageProps): Promise<Metadata> {
  const { word } = await searchParams;

  return {
    title: `Word Limit Reached - WordDirectory`,
    description: `You've reached the word lookup limit. Sign up for Plus to continue looking up "${word}".`,
  };
}

export const runtime = "edge";

export default async function WordLimitReachedPage({
  searchParams,
}: WordLimitReachedPageProps) {
  const { word, usage: usageStr } = await searchParams;
  console.log("[WordLimitReachedPage] Raw params:", { word, usageStr });

  const session = await auth.api.getSession({ headers: await headers() });

  // If we don't have the required params, 404
  if (!word || !usageStr) {
    console.log("[WordLimitReachedPage] Missing required params");
    notFound();
  }

  // Parse the usage data
  let usage;
  try {
    console.log("[WordLimitReachedPage] Attempting to parse usage:", usageStr);
    usage = JSON.parse(usageStr);
    console.log("[WordLimitReachedPage] Parsed usage data:", usage);
  } catch (error) {
    console.error("[WordLimitReachedPage] Failed to parse usage data:", error);
    notFound();
  }

  return (
    <div className="h-dvh w-full flex items-center justify-center mx-auto max-w-lg py-12 md:py-20 px-6">
      <div className="absolute left-4 top-4">
        <BackButton text="Home" redirect="/" />
      </div>
      <WordLookupLimit word={word} usage={usage} isLoggedIn={!!session?.user} />
    </div>
  );
}
