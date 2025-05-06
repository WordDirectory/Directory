import { Metadata } from "next";
import { Separator } from "@/components/ui/separator";
import { capitalize, cn } from "@/lib/utils";
import { Quote, XIcon } from "lucide-react";
import { FaQuoteLeft } from "react-icons/fa6";
import { Card, CardContent } from "@/components/ui/card";
import { WordAudioButton } from "@/components/word-audio-button";
import { WordResponse } from "@/types/api";
import { VoteButton } from "@/components/vote-button";
import { SaveWord } from "@/components/save-word";
import { ShareWord } from "@/components/share-word";
import { auth } from "@/lib/auth";
import {
  getWordVotes,
  hasUserVotedWord,
  hasUserSavedWord,
} from "@/lib/db/queries";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ImageButton } from "@/components/image-button";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useImagesStore } from "@/stores/images-store";
import { WordImages } from "@/components/word-images";

interface WordPageProps {
  params: Promise<{
    word: string;
  }>;
}

export async function generateMetadata({
  params,
}: WordPageProps): Promise<Metadata> {
  const { word: paramWord } = await params;
  const decodedWord = decodeURI(paramWord);
  const word = capitalize(decodedWord);

  return {
    title: `${word} Definition - WordDirectory`,
    description: `Find out what "${word}" means in simple, human-readable terms. Get clear explanations without needing to look up five more words.`,
    keywords: [
      decodedWord,
      `${decodedWord} definition`,
      `${decodedWord} meaning`,
      `what does ${decodedWord} mean`,
      `define ${decodedWord}`,
      "dictionary",
      "definitions",
      "word meanings",
    ].join(", "),
    alternates: {
      canonical: `https://worddirectory.app/words/${encodeURIComponent(decodedWord)}`,
    },
    openGraph: {
      title: `${word} Definition - Simple English Explanation`,
      description: `Looking for what "${word}" means? Get a clear, simple explanation that actually makes sense.`,
      url: `https://worddirectory.app/words/${encodeURIComponent(decodedWord)}`,
      siteName: "WordDirectory",
    },
    twitter: {
      card: "summary_large_image",
      title: `${word} Definition - Simple English Explanation`,
      description: `Looking for what "${word}" means? Get a clear, simple explanation that actually makes sense.`,
    },
  };
}

export default async function WordPage({ params }: WordPageProps) {
  const { word: paramWord } = await params;

  // Get headers once and reuse
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  try {
    const url = `${process.env.NEXT_PUBLIC_SITE_URL}/api/words/${paramWord}`;

    // Use rate-limited API for actual page content
    const res = await fetch(url, {
      cache: "no-store", // Don't cache since we need to track lookups
      headers: Object.fromEntries(headersList.entries()),
    });

    // Check if we've been sent to the not-found page
    if (res.url.includes("/words/not-found")) {
      return redirect(res.url);
    }

    // Check if the fetch was redirected to the limit page
    if (res.url.includes("/word-limit-reached")) {
      return redirect(res.url);
    }

    if (!res.ok) {
      // Handle fetch errors
      throw new Error(`Failed to fetch word: ${res.status} ${res.statusText}`);
    }

    let wordResult;
    try {
      const text = await res.text();
      wordResult = JSON.parse(text);
    } catch (e) {
      console.error("[WordPage] Failed to parse word response:", e);
      throw new Error("Invalid response format from API");
    }

    if (!wordResult || !wordResult.id) {
      console.error("Invalid word result:", wordResult);
      throw new Error("Invalid word data received");
    }

    // Get vote data with error handling
    let votes = 0,
      hasVoted = false,
      isSaved = false;
    try {
      [votes, hasVoted, isSaved] = await Promise.all([
        getWordVotes(wordResult.id),
        session?.user?.id
          ? hasUserVotedWord(session.user.id, wordResult.id)
          : false,
        session?.user?.id
          ? hasUserSavedWord(session.user.id, wordResult.id)
          : false,
      ]);
    } catch (e) {
      console.error("Failed to fetch word metadata:", e);
      // Continue with default values rather than failing the whole request
    }

    return (
      <div className="min-h-screen relative">
        <div className="grid grid-cols-1 md:grid-cols-[1fr,auto]">
          {/* Word content */}
          <div className="py-12 md:py-20 px-12 pl-14">
            <div className="max-w-3xl mx-auto">
              <WordHeader
                word={wordResult.word}
                details={wordResult.details}
                votes={votes}
                hasVoted={hasVoted}
                isSaved={isSaved}
              />
              {wordResult.details.definitions.length > 1 && (
                <>
                  <Separator className="mb-8" />
                  <WordContent
                    word={wordResult.word}
                    details={wordResult.details}
                  />
                </>
              )}
            </div>
          </div>
          {/* Images */}
          <WordImages word={wordResult.word} />
        </div>
      </div>
    );
  } catch (error: any) {
    // Check if the error is the specific redirect error by its digest
    if (
      typeof error?.digest === "string" &&
      error.digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error; // Re-throw the redirect error so Next.js can handle it
    }

    // Handle other errors
    console.error("Error fetching word:", error);
    throw error; // Let the error boundary handle it
  }
}

function WordHeader({
  word,
  details,
  votes,
  hasVoted,
  isSaved,
}: {
  word: string;
  details: WordResponse["details"];
  votes: number;
  hasVoted: boolean;
  isSaved: boolean;
}) {
  return (
    <>
      <div className="mb-8 flex items-center gap-4">
        <div className="flex flex-col gap-6">
          <div className="flex gap-5">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-foreground/85 break-words hyphens-auto max-w-full">
              {capitalize(word)}
            </h1>
            <div className="flex items-center gap-3">
              <WordAudioButton word={word} />
            </div>
          </div>
          <div className="flex gap-3">
            <VoteButton
              word={word}
              initialVotes={votes}
              initialHasVoted={hasVoted}
            />
            <SaveWord word={word} initialIsSaved={isSaved} />
            <div className="pl-2">
              <ShareWord word={word} definitions={details.definitions} />
            </div>
            <div className="pl-2">
              <ImageButton word={word} />
            </div>
          </div>
        </div>
      </div>

      {details.definitions.length === 1 && (
        <div className="mb-6">
          <p className="text-foreground/70 mb-6">
            {details.definitions[0].text}
          </p>
        </div>
      )}

      {details.definitions.length === 1 &&
        details.definitions[0].examples.length > 0 && (
          <>
            <Separator className="mb-8" />
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground/85 flex items-center gap-2">
                <FaQuoteLeft className="w-5 h-5 text-muted-foreground" />
                Examples
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {details.definitions[0].examples.map(
                  (example: string, i: number) => (
                    <Card key={i} className="group relative">
                      <CardContent className="p-4">
                        <div className="absolute -left-2 -top-2 text-4xl text-muted-foreground opacity-10 select-none"></div>
                        <p className="text-foreground/80 relative z-10 break-words">
                          {example}
                        </p>
                      </CardContent>
                    </Card>
                  )
                )}
              </div>
            </div>
          </>
        )}
    </>
  );
}

function WordContent({
  word,
  details,
}: {
  word: string;
  details: WordResponse["details"];
}) {
  return (
    <section className="mb-12">
      <h2 className="mb-6 text-2xl font-semibold text-foreground/85">
        Definitions
      </h2>

      <div className="space-y-12">
        {details.definitions.map(
          (def: WordResponse["details"]["definitions"][0], index: number) => (
            <div key={index} className="relative">
              {index > 0 && <Separator className="absolute -top-6 w-full" />}
              <div className="flex items-start gap-2">
                <span className="text-lg font-medium text-muted-foreground select-none leading-[1.5]">
                  {index + 1}.
                </span>
                <div className="flex-1 pt-[2px]">
                  <p className="text-foreground/70">{def.text}</p>

                  {def.examples.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-3">
                        <Quote className="w-4 h-4" />
                        Usage Examples
                      </h3>
                      <div className="grid gap-3 md:grid-cols-2">
                        {def.examples.map((example: string, i: number) => (
                          <Card key={i} className="group relative">
                            <CardContent className="p-4">
                              <div className="absolute -left-2 -top-2 text-4xl text-muted-foreground opacity-10 select-none"></div>
                              <p className="text-foreground/80 relative z-10 break-words">
                                {example}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
}
