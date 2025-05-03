import { Metadata } from "next";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Terms of Service | Word Directory",
  description: "Terms of Service for Word Directory - Words explained simply",
};

export default function TermsPage() {
  return (
    <main className="relative w-full overflow-hidden px-8">
      <div className="container mx-auto max-w-4xl py-12 md:py-20">
        <header className="mb-12 space-y-4">
          <h1 className="text-4xl font-bold">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: April 2025</p>
        </header>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">1. Introduction</h2>
          <p>
            Welcome to Word Directory. By accessing our website at
            worddirectory.app, you agree to these terms of service. Please read
            them carefully.
          </p>
          <p>
            Word Directory is a free service that provides simple,
            human-readable definitions for words. Our goal is to make word
            definitions accessible and easy to understand.
          </p>
        </section>

        <Separator className="my-12" />

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">2. Using Our Service</h2>
          <p>
            Our service is provided "as is" without any warranties. While we
            strive for accuracy in our definitions and examples, we cannot
            guarantee that all content is 100% accurate. Some definitions or
            examples may contain errors, and we strongly recommend verifying any
            important information from authoritative sources.
          </p>
          <p>
            You may use our service for personal, non-commercial purposes. You
            may not:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Scrape or mass download our definitions</li>
            <li>Redistribute our content without permission</li>
            <li>Use our service for any illegal purposes</li>
            <li>Attempt to disrupt or damage our service</li>
          </ul>
        </section>

        <Separator className="my-12" />

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">3. Content and Copyright</h2>
          <p>
            All content on Word Directory, including but not limited to
            definitions, examples, and website design, is protected by
            copyright. You may not copy, modify, or distribute our content
            without explicit permission.
          </p>
          <p>
            While our definitions are written in simple language, they are
            original works and may not be reproduced without authorization.
          </p>
        </section>

        <Separator className="my-12" />

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">4. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will
            notify users of any significant changes by updating the "Last
            updated" date at the top of this page.
          </p>
          <p>
            Your continued use of Word Directory after changes are made
            constitutes acceptance of those changes.
          </p>
        </section>

        <Separator className="my-12" />

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">5. Contact Us</h2>
          <p>
            If you have any questions about these terms, please contact us at
            hi@worddirectory.app
          </p>
        </section>
      </div>
    </main>
  );
}
