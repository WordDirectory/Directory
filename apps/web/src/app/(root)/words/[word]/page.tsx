import { Metadata } from "next";
import { Separator } from "@/components/ui/separator";
import { capitalize } from "@/lib/utils";
import { Quote } from "lucide-react";
import { Card } from "@/components/ui/card";
import { WordHeader } from "@/components/word-header";
import { WordImages } from "@/components/word-images";
import { WordResponse } from "@/types/api";
import { auth } from "@/lib/auth";
import {
  getWordVotes,
  hasUserVotedWord,
  hasUserSavedWord,
} from "@/lib/db/queries";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getWordWithLimits } from "@/lib/word-service";

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
  const forwardedFor = headersList.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0] : "127.0.0.1";
  const userId = session?.user?.id || null;

  try {
    // Use the word service directly
    const result = await getWordWithLimits(
      paramWord,
      userId,
      ip,
      process.env.NEXT_PUBLIC_SITE_URL!
    );

    // Handle the different result types
    switch (result.type) {
      case "success": {
        // Get vote / save metadata
        let votes = 0,
          hasVoted = false,
          isSaved = false;
        try {
          [votes, hasVoted, isSaved] = await Promise.all([
            getWordVotes(result.data!.id),
            session?.user?.id
              ? hasUserVotedWord(session.user.id, result.data!.id)
              : false,
            session?.user?.id
              ? hasUserSavedWord(session.user.id, result.data!.id)
              : false,
          ]);
        } catch (e) {
          console.error("Failed to fetch word metadata:", e);
        }

        return (
          <div className="min-h-screen relative">
            <div className="grid grid-cols-1 md:grid-cols-[1fr,auto]">
              {/* Word content */}
              <div className="py-14 md:py-20 px-8 lg:pl-14 lg:pr-12">
                <div className="max-w-3xl mx-auto">
                  <WordHeader
                    word={result.data!.word}
                    votes={votes}
                    hasVoted={hasVoted}
                    isSaved={isSaved}
                    definitions={result.data!.details.definitions.map(
                      (d) => d.text
                    )}
                  />

                  {result.data!.details.definitions.length > 0 && (
                    <Separator className="mb-8" />
                  )}

                  <WordContent details={result.data!.details} />
                </div>
              </div>
              {/* Images on the right */}
              <WordImages word={result.data!.word} />
            </div>
          </div>
        );
      }

      case "limit_reached":
      case "not_found":
        if (result.redirect) {
          // For limit_reached, we need to include the usage data
          if (result.type === "limit_reached" && result.usage) {
            const url = new URL(result.redirect.url);
            url.searchParams.set("usage", JSON.stringify(result.usage));
            return redirect(url.toString());
          }
          return redirect(result.redirect.url);
        }
        throw new Error("No redirect URL provided");

      default:
        throw new Error("Unexpected result type");
    }
  } catch (error: any) {
    if (
      typeof error?.digest === "string" &&
      error.digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

    console.error("Error fetching word:", error);
    throw error;
  }
}

function WordContent({ details }: { details: WordResponse["details"] }) {
  return (
    <section className="mb-12">
      <h2 className="mb-6 text-2xl font-semibold text-foreground/85">
        Definitions
      </h2>

      <div className="space-y-12">
        {details.definitions.map((def, index) => (
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
                      {def.examples.map((example, i) => (
                        <Card key={i} className="group relative">
                          <div className="p-4">
                            <div className="absolute -left-2 -top-2 text-4xl text-muted-foreground opacity-10 select-none"></div>
                            <p className="text-foreground/80 relative z-10 break-words">
                              {example}
                            </p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
