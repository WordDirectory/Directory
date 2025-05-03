import { Metadata } from "next";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { FaGithub } from "react-icons/fa6";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us | Word Directory",
  description: "Learn about Word Directory - Making definitions human-readable",
};

export default function AboutPage() {
  return (
    <main className="relative w-full overflow-hidden px-8">
      <div className="container mx-auto max-w-4xl py-12 md:py-20">
        <header className="mb-12 space-y-4">
          <h1 className="text-4xl font-bold">About Word Directory</h1>
          <p className="text-xl text-muted-foreground">
            Making definitions actually make sense
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">The problem we're solving</h2>
          <p>
            You know that annoying moment when you look up a word's definition
            and it's filled with other complex words you don't know? So you end
            up in this endless loop of looking up definitions of definitions?
          </p>
          <p>Yeah, that shit's annoying as fuck.</p>
        </section>

        <Separator className="my-12" />

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Our solution</h2>
          <p>
            We explain words how you'd explain them to a friend. No bullshit, no
            complex terms, just straight-up human explanations.
          </p>
          <div className="mt-6 space-y-2">
            <p className="font-medium">Instead of:</p>
            <p className="text-muted-foreground">
              ❌ "Hello is when you greet someone"
            </p>
            <p className="font-medium mt-4">We do:</p>
            <p className="text-muted-foreground">
              ✅ "Hello is basically when you meet someone and you want to let
              them know you see them or want to talk to them"
            </p>
          </div>
        </section>

        <Separator className="my-12" />

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">What words we include</h2>
          <div className="space-y-2">
            <p>We focus on words that people actually need explained:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Everyday words that might confuse non-native speakers</li>
              <li>Slang and internet terms ("yeet", "sus", "fomo")</li>
              <li>
                Complex words explained simply ("gaslighting", "procrastinate")
              </li>
              <li>Words with multiple meanings that need context</li>
              <li>
                Even "inappropriate" words - we don't censor. If people use it,
                we explain it
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="mt-6">We don't waste time on:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                Names of people or places (that's what Google Maps is for)
              </li>
              <li>Brand names (just Google it)</li>
              <li>Super technical terms only specialists use</li>
            </ul>
          </div>
        </section>

        <Separator className="my-12" />

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Our promise</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <h3 className="font-medium">🆓 Free Forever</h3>
              <p className="text-muted-foreground">
                Knowledge should be accessible. The core dictionary will always
                be free (we might add cool AI features later and make those
                paid, but the basics stay free).
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">💯 100% human readable</h3>
              <p className="text-muted-foreground">
                Every definition is written like a human would explain it. No
                dictionary buzzwords, ever.
              </p>
            </div>
          </div>
        </section>

        <Separator className="my-12" />

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Who's behind this?</h2>
          <p>
            Hey! I'm Maze, and I built this because I was tired of looking up
            words and ending up more confused than when I started.
          </p>
          <p>
            I'm not a linguistics professor or a dictionary expert. I'm just
            someone who:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Gets annoyed when simple things are made complicated</li>
            <li>
              Thinks dictionaries should be written by actual humans for actual
              humans
            </li>
            <li>
              Has strong opinions about keeping knowledge free and accessible
            </li>
          </ul>
          <p className="mt-4">
            This isn't some corporate project with a team of experts and a fancy
            mission statement. It's just me, building the dictionary I wish
            existed, and sharing it with anyone who's also tired of dictionary
            sites that make you feel dumb for not knowing a word.
          </p>
        </section>

        <Separator className="my-12" />

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Want to help?</h2>
          <p>
            We're open source and always looking for people to help make this
            dictionary even better. Whether you're fixing typos or adding new
            words, we'd love your help!
          </p>
          <div className="flex gap-4 mt-4">
            <Button asChild>
              <Link
                href="https://github.com/WordDirectory/Directory"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <FaGithub size={20} />
                <span>Check out our GitHub</span>
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/contact">Get in Touch</Link>
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
