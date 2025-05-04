import { Metadata } from "next";
import { Separator } from "@/components/ui/separator";
import { capitalize } from "@/lib/utils";
import { getWord } from "@/lib/words";
import { Quote } from "lucide-react";
import { FaQuoteLeft } from "react-icons/fa6";
import { Card, CardContent } from "@/components/ui/card";
import { WordNotFound } from "@/components/word-not-found";
import { WordAudioButton } from "@/components/word-audio-button";
import { WordResponse } from "@/types/api";
import { VoteButton } from "@/components/vote-button";
import { SaveWord } from "@/components/save-word";
import { auth } from "@/lib/auth";
import {
  getWordVotes,
  hasUserVotedWord,
  hasUserSavedWord,
} from "@/lib/db/queries";
import { headers } from "next/headers";

interface WordPageProps {
  params: Promise<{
    word: string;
  }>;
}

// Generate metadata for each word page
export async function generateMetadata({
  params,
}: WordPageProps): Promise<Metadata> {
  const { word: paramWord } = await params;
  const result = await getWord(paramWord);

  if (!result) {
    return {
      title: `${capitalize(paramWord)} - Word Not Found | WordDirectory`,
      description: `Definition for "${paramWord}" not found. Explore our extensive dictionary for human-readable definitions of other words.`,
    };
  }

  const { word, details } = result;
  const definition = details.definitions[0]?.text || "";

  return {
    title: `${capitalize(word)} Definition - Simple English Explanation | WordDirectory`,
    description: `${capitalize(word)} definition: ${definition.slice(0, 150)}${definition.length > 150 ? "..." : ""}`,
    keywords: [
      word,
      `${word} definition`,
      `${word} meaning`,
      `what does ${word} mean`,
      `define ${word}`,
      "dictionary",
      "definitions",
      "word meanings",
    ].join(", "),
    alternates: {
      canonical: `https://worddirectory.app/words/${encodeURIComponent(word)}`,
    },
    openGraph: {
      title: `${capitalize(word)} Definition - Simple English Explanation`,
      description: `${capitalize(word)} definition: ${definition.slice(0, 150)}${definition.length > 150 ? "..." : ""}`,
      url: `https://worddirectory.app/words/${encodeURIComponent(word)}`,
      siteName: "WordDirectory",
    },
    twitter: {
      card: "summary_large_image",
      title: `${capitalize(word)} Definition - Simple English Explanation`,
      description: `${capitalize(word)} definition: ${definition.slice(0, 150)}${definition.length > 150 ? "..." : ""}`,
    },
  };
}

export default async function WordPage({ params }: WordPageProps) {
  const { word: paramWord } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  try {
    // Get word data first to get the ID
    const wordResult = await getWord(paramWord);
    if (!wordResult) {
      return <WordNotFound word={decodeURI(paramWord)} />;
    }

    // Get vote data
    const [votes, hasVoted, isSaved] = await Promise.all([
      getWordVotes(wordResult.id),
      session?.user?.id
        ? hasUserVotedWord(session.user.id, wordResult.id)
        : false,
      session?.user?.id
        ? hasUserSavedWord(session.user.id, wordResult.id)
        : false,
    ]);

    return (
      <div className="mx-auto max-w-3xl py-12 md:py-20 px-6">
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
            <WordContent word={wordResult.word} details={wordResult.details} />
          </>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error fetching word:", error);
    const isTimeout =
      error instanceof Error &&
      (error.message.includes("Connection terminated") ||
        error.message.includes("connection timeout"));
    return <WordNotFound word={paramWord} isTimeout={isTimeout} />;
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
