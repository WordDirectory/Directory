import { auth } from "@/lib/auth";
import { WordLookupLimit } from "@/components/word-lookup-limit";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

interface WordLimitReachedPageProps {
  searchParams: Promise<{
    word?: string;
    usage?: string;
  }>;
}

export default async function WordLimitReachedPage({
  searchParams,
}: WordLimitReachedPageProps) {
  const { word, usage: usageStr } = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });

  // If we don't have the required params, 404
  if (!word || !usageStr) {
    notFound();
  }

  // Parse the usage data
  let usage;
  try {
    usage = JSON.parse(usageStr);
  } catch (error) {
    console.error("Failed to parse usage data:", error);
    notFound();
  }

  return (
    <WordLookupLimit
      word={word}
      usage={usage}
      isLoggedIn={!!session?.user}
    />
  );
}
