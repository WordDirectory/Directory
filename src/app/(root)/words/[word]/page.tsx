import { Separator } from "@/components/ui/separator";
import { getWord } from "@/lib/utils";
import { TWord } from "@/types/word";

interface WordPageProps {
  params: Promise<{
    word: string;
  }>;
}

export default async function WordPage({ params }: WordPageProps) {
  const { word: paramWord } = await params;
  const { word, details } = await getWord(paramWord);

  return (
    <div className="mx-auto max-w-3xl py-16 px-6">
      <WordHeader word={word} details={details} />
      <Separator className="mb-8" />
      {details.definitions.length > 1 && (
        <WordContent word={word} details={details} />
      )}
    </div>
  );
}

function WordHeader({ word, details }: { word: string; details: TWord }) {
  return (
    <>
      <div className="mb-8 flex items-center gap-8">
        {details.definitions.length === 1 && details.definitions[0].image && (
          <img
            src={details.definitions[0].image}
            alt={`Illustration for ${word}`}
            width={80}
            height={80}
            className="h-20 w-20 object-contain"
          />
        )}
        <h1 className="text-5xl font-bold tracking-tight text-foreground/85 md:text-7xl">
          {word}
        </h1>
      </div>

      {details.definitions.length === 1 && (
        <div className="mb-6">
          <p className="text-foreground/70 mb-6">
            {details.definitions[0].text}
          </p>
        </div>
      )}

      <div className="mb-8 text-xl text-muted-foreground">
        /{details.pronunciation}/
      </div>

      {details.definitions.length === 1 && details.examples.length > 0 && (
        <>
          <Separator className="mb-8" />
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground/85">
              Examples
            </h2>
            <div className="rounded-lg bg-muted p-4 text-muted-foreground space-y-3">
              {details.examples.map((example, i) => (
                <p key={i}>
                  "<em>{example}</em>"
                </p>
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

      <div className="space-y-6">
        {details.definitions.map((def, index) => (
          <div key={index}>
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

            {details.examples.length > 0 && (
              <div className="mt-2 rounded-lg bg-muted p-3 text-muted-foreground">
                {details.examples.map((example, i) => (
                  <p key={i}>
                    "<em>{example}</em>"
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
