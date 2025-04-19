import { Metadata } from "next";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Privacy Policy | Word Directory",
  description: "Privacy Policy for Word Directory - Words explained simply",
};

export default function PrivacyPage() {
  return (
    <main className="relative w-full overflow-hidden px-4">
      <div className="container mx-auto max-w-4xl py-20">
        <header className="mb-12 space-y-4">
          <h1 className="text-4xl font-bold">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: April 2025</p>
        </header>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">1. Introduction</h2>
          <p>
            Your privacy matters to us. This policy explains how Word Directory
            collects, uses, and protects any information when you use our
            service.
          </p>
          <p>
            We keep this shit simple - we collect minimal data and we're
            straight up about what we do with it.
          </p>
        </section>

        <Separator className="my-12" />

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">2. Information We Collect</h2>
          <p>We collect the following information:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <span className="font-medium">Usage Data:</span> Basic analytics
              about how you use the site (pages visited, time spent)
            </li>
            <li>
              <span className="font-medium">Technical Data:</span> Your IP
              address, browser type, and device info
            </li>
            <li>
              <span className="font-medium">Cookies:</span> Small files stored
              on your device to remember your preferences
            </li>
          </ul>
          <p className="mt-4">
            That's it. We don't ask for your life story or sell your data to
            sketchy third parties.
          </p>
        </section>

        <Separator className="my-12" />

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">
            3. How We Use Your Information
          </h2>
          <p>We use your information to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Make the website work properly</li>
            <li>Understand how people use our service</li>
            <li>Improve our definitions and user experience</li>
            <li>Protect against abuse or misuse of our service</li>
          </ul>
          <p className="mt-4">
            We use Vercel Analytics to track basic usage stats. It's
            privacy-focused and doesn't track personal info.
          </p>
        </section>

        <Separator className="my-12" />

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">4. Data Security</h2>
          <p>
            We take reasonable steps to protect your information. However, no
            internet transmission is 100% secure, so we can't guarantee absolute
            security.
          </p>
          <p>
            We don't store sensitive data, and we keep only what we need to run
            the service.
          </p>
        </section>

        <Separator className="my-12" />

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">5. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Know what data we have about you</li>
            <li>Ask us to delete your data</li>
            <li>Opt out of analytics</li>
            <li>File a complaint if you think we're fucking up</li>
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
          <p>
            Questions about your privacy? Hit us up at hi@worddirectory.app
          </p>
        </section>
      </div>
    </main>
  );
}
