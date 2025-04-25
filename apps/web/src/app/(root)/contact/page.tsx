import { Metadata } from "next";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { FaXTwitter, FaGithub } from "react-icons/fa6";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact Us | Word Directory",
  description: "Get in touch with Word Directory - We're here to help",
};

export default function ContactPage() {
  return (
    <main className="relative w-full overflow-hidden 8">
      <div className="container mx-auto max-w-4xl py-20">
        <header className="mb-12 space-y-4">
          <h1 className="text-4xl font-bold">Get in Touch</h1>
        </header>

        <section className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Email Us</h2>
            <p>
              Got questions, suggestions, or just wanna chat? Hit us up at{" "}
              <Button variant="link" className="px-0 font-medium" asChild>
                <a href="mailto:hi@worddirectory.app">hi@worddirectory.app</a>
              </Button>
            </p>
            <p className="text-muted-foreground">
              We try to respond within 24 hours, but sometimes we're busy adding new words
              to make this dictionary even more awesome.
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Social Media</h2>
            <p>Find us on these platforms if email ain't your thing:</p>
            
            <div className="flex gap-6">
              <Link
                href="https://x.com/WordDirectory"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <FaXTwitter size={24} />
                <span>X</span>
              </Link>
              
              <Link
                href="https://github.com/WordDirectory/Directory"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <FaGithub size={24} />
                <span>GitHub</span>
              </Link>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Contributing</h2>
            <p>
              Want to help make this dictionary even better? Our GitHub repo is open source
              and we're always looking for contributors. Whether you're fixing typos or
              adding new words, we'd love your help!
            </p>
            <Button asChild>
              <Link
                href="https://github.com/WordDirectory/Directory"
                target="_blank"
                rel="noopener noreferrer"
              >
                Check out our GitHub
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
} 