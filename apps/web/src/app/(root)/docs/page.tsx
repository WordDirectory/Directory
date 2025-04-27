import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaChrome } from "react-icons/fa6";

export default function DocsPage() {
  return (
    <div className="space-y-12">
      <header className="space-y-4">
        <h1 className="text-4xl font-bold">Getting started</h1>
        <p className="text-xl text-muted-foreground">
          WordDirectory explains words like a friend would - no complex terms,
          just simple human explanations for everyday words, slang, and tricky
          terms.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Quick start</h2>
        <p>There are two ways to use WordDirectory:</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
          <div className="space-y-3">
            <h3 className="text-lg font-medium">1. Use the website</h3>
            <p className="text-muted-foreground">
              Just type any word in the search bar and hit enter. That's it. No
              sign up or anything, just definitions that make sense.
            </p>
            <Button asChild className="mt-1">
              <Link href="/">Try it now</Link>
            </Button>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-medium">2. Install the extension</h3>
            <p className="text-muted-foreground">
              Just highlight a word on any page, right-click and get its
              definition. Or search "word definition" to get it right away.
            </p>
            <Button asChild>
              <Link
                href="https://chromewebstore.google.com/detail/worddirectory/nmbecimflkmecigpnnflifohoghhgdah"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 mt-1"
              >
                <FaChrome size={20} />
                <span>Get the extension</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">What makes us different</h2>
        <div className="space-y-6">
          <p className="text-muted-foreground">
            Most dictionary sites give you technical definitions that make you
            look up even more words just to understand the first one. That's
            bullshit. Here's how we do things differently:
          </p>

          <ul className="list-disc pl-6 space-y-3">
            <li>
              <span className="font-medium">Human explanations</span>
              <p className="text-muted-foreground mt-1">
                We explain words like you'd explain them to a friend - in plain
                language that actually makes sense.
              </p>
            </li>

            <li>
              <span className="font-medium">Hear it spoken naturally</span>
              <p className="text-muted-foreground mt-1">
                Using ElevenLabs AI, you hear words pronounced by a real human
                voice, not some robotic text-to-speech.
              </p>
            </li>

            <li>
              <span className="font-medium">Context matters</span>
              <p className="text-muted-foreground mt-1">
                Words mean different things in different situations. We give you
                real examples of how words are actually used today.
              </p>
            </li>

            <li>
              <span className="font-medium">Modern & relevant</span>
              <p className="text-muted-foreground mt-1">
                We keep up with how language actually evolves - including slang,
                internet terms, and new meanings for old words.
              </p>
            </li>
          </ul>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">What words we cover</h2>

        <div className="space-y-2">
          <p>We focus on words people actually need explained:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Everyday words that might confuse non-native speakers</li>
            <li>Slang and internet terms ("yeet", "sus", "fomo")</li>
            <li>
              Complex words explained simply ("gaslighting", "procrastinate")
            </li>
            <li>Words with multiple meanings that need context</li>
            <li>Even "inappropriate" words - we don't censor</li>
          </ul>
        </div>

        <div className="mt-6 space-y-2">
          <p>We don't waste time on:</p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Names of people or places (that's what Google Maps is for)</li>
            <li>Brand names (just Google it)</li>
          </ul>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Coming soon</h2>
        <div className="space-y-2">
          <p className="mt-4">
            Check out our{" "}
            <Link
              href="/roadmap"
              className="underline hover:text-foreground/70"
            >
              roadmap
            </Link>{" "}
            to see what else is coming.
          </p>
        </div>
      </section>

      <Separator />

      <section>
        <h2 className="text-2xl font-semibold mb-4">Still have questions?</h2>
        <p>
          Check out our{" "}
          <Link href="/faq" className="underline hover:text-foreground/70">
            FAQ
          </Link>{" "}
          or{" "}
          <Link href="/contact" className="underline hover:text-foreground/70">
            get in touch
          </Link>{" "}
          if you need help with anything.
        </p>
      </section>
    </div>
  );
}
