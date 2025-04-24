import { Separator } from "@/components/ui/separator";
import { capitalize, getWord } from "@/lib/utils";
import { TWord } from "@/types/word";
import { Quote } from "lucide-react";
import { FaQuoteLeft } from "react-icons/fa6";
import { Card, CardContent } from "@/components/ui/card";
import { WordNotFound } from "@/components/word-not-found";
import { WordAudioButton } from "@/components/word-audio-button";

interface WordPageProps {
  params: Promise<{
    word: string;
  }>;
}

export default async function WordPage({ params }: WordPageProps) {
  const { word: paramWord } = await params;

  try {
    const { word, details } = await getWord(paramWord);

    return (
      <div className="mx-auto max-w-3xl py-16 px-6">
        <WordHeader word={word} details={details} />
        {details.definitions.length > 1 && (
          <>
            <Separator className="mb-8" />
            <WordContent word={word} details={details} />
          </>
        )}
      </div>
    );
  } catch (error) {
    return <WordNotFound word={paramWord} />;
  }
}

function WordHeader({ word, details }: { word: string; details: TWord }) {
  return (
    <>
      <div className="mb-8 flex items-center gap-4">
        {details.definitions.length === 1 && details.definitions[0].image && (
          <img
            src={details.definitions[0].image}
            alt={`Illustration for ${word}`}
            width={80}
            height={80}
            className="h-20 w-20 object-contain"
          />
        )}
        <div className="flex items-center gap-4">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-foreground/85 break-words hyphens-auto max-w-full">
            {capitalize(word)}
          </h1>
          <WordAudioButton word={word} />
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
                {details.definitions[0].examples.map((example, i) => (
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
          </>
        )}
    </>
  );
}

function WordContent({ word, details }: { word: string; details: TWord }) {
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
                {def.image && (
                  <img
                    src={def.image}
                    alt={`Illustration for ${word}`}
                    width={100}
                    height={100}
                    className="mb-6 rounded-lg"
                  />
                )}
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
        ))}
      </div>
    </section>
  );
}
