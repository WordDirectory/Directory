import { Metadata } from "next";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Privacy Policy | Word Directory",
  description: "Privacy Policy for Word Directory - Words explained simply",
};

export default function PrivacyPage() {
  return (
    <main className="relative w-full overflow-hidden px-8">
      <div className="container mx-auto max-w-4xl py-12 md:py-20">
        <header className="mb-12 space-y-4">
          <h1 className="text-4xl font-bold">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: April 2025</p>
        </header>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">1. Introduction</h2>
          <p>
            Your privacy matters to us. This policy explains how Word Directory
            and our service providers handle any information when you use our
            service.
          </p>
          <p>
            We keep this shit simple - we collect minimal data and we're
            straight up about what happens with it.
          </p>
        </section>

        <Separator className="my-12" />

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">2. Information Collection</h2>
          <p>
            Word Directory itself does not directly collect or store any
            personal information.
          </p>

          <p className="mt-4">
            However, our hosting provider (Vercel) automatically collects and
            processes:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <span className="font-medium">Server Logs:</span> Basic server
              logs including IP addresses and request information
            </li>
            <li>
              <span className="font-medium">Analytics Data:</span> Through
              Vercel Analytics, which collects anonymous usage data like pages
              visited and performance metrics
            </li>
          </ul>
          <p className="mt-4">
            We use Vercel as our hosting platform, and their analytics are
            privacy-focused and GDPR-compliant. We don't add any additional
            tracking or data collection beyond what Vercel provides by default.
          </p>
        </section>

        <Separator className="my-12" />

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">3. How Information Is Used</h2>
          <p>The information collected by Vercel is used to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Ensure the website runs properly and securely</li>
            <li>Understand basic usage patterns to improve the service</li>
            <li>Protect against abuse or security threats</li>
          </ul>
          <p className="mt-4">
            We specifically chose Vercel because they take a privacy-first
            approach to hosting and analytics.
          </p>
        </section>

        <Separator className="my-12" />

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">4. Data Security</h2>
          <p>
            Since we don't directly collect or store any personal data, our
            security focus is on maintaining a secure hosting environment
            through Vercel.
          </p>
          <p>
            Vercel handles all data processing in compliance with GDPR and other
            privacy regulations.
          </p>
        </section>

        <Separator className="my-12" />

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">5. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Use our service without any direct data collection from us</li>
            <li>
              Understand what data Vercel collects as our hosting provider
            </li>
            <li>Contact Vercel directly about their data practices</li>
            <li>File a complaint if you think something's not right</li>
          </ul>
        </section>

        <Separator className="my-12" />

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">6. Changes to This Policy</h2>
          <p>
            We might update this policy sometimes. When we do, we'll update the
            date at the top of this page and let you know if it's anything
            major.
          </p>
        </section>

        <Separator className="my-12" />

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">7. Contact Us</h2>
          <p>Questions about privacy? Hit us up at hi@worddirectory.app</p>
        </section>
      </div>
    </main>
  );
}
