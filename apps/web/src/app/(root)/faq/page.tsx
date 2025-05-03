import { Metadata } from "next";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "FAQ | Word Directory",
  description:
    "Frequently asked questions about Word Directory - from how our definitions are created to our commitment to keeping the service free forever.",
  openGraph: {
    title: "Frequently Asked Questions | Word Directory",
    description:
      "Common questions about Word Directory - from how our definitions are created to our commitment to keeping the service free forever.",
    url: "https://worddirectory.app/faq",
    siteName: "WordDirectory",
    images: [
      {
        url: "https://worddirectory.app/og/faq.png",
        width: 1200,
        height: 630,
        alt: "Word Directory FAQ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Frequently Asked Questions | Word Directory",
    description:
      "Common questions about Word Directory - from how our definitions are created to our commitment to keeping the service free forever.",
    images: ["https://worddirectory.app/og/faq.png"],
  },
};

const faqs = [
  {
    question: "Will Word Directory always be free?",
    answer:
      "Yes, the site itself is free forever and all the words. We won't ever charge to view definitions or make some 'premium word' nonsense. We might add MORE features on top though that we might charge for but that's totally up to you to use those features. We're talking being able to define entire sentences, follow-up questions with AI, etc. Just things that improve the experience but the basics stay free forever.",
  },
  {
    question: "What types of words do you include?",
    answer:
      "We focus on words people actually need explained: everyday stuff that might confuse non-native speakers, internet slang (like 'yeet' and 'sus'), complex words explained simply, and words with multiple meanings. We even include 'inappropriate' words because fuck censorship - if people use it, we explain it. We don't waste time on names of people or places (that's what Google Maps is for) or brand names (just Google it)",
  },
  {
    question: "Do you collect or sell user data?",
    answer:
      "Respectfully, we don't give a shit about your data nor tracking you. We use basic Vercel analytics to see our page views (gotta know when we're beating dictionary.com), and that's about it. No tracking your searches, no selling data to advertisers, none of that bullshit. We're here to explain words, not spy on people.",
  },
  {
    question: "Can I use your definitions elsewhere?",
    answer:
      "Use them however you want - they're not copyrighted. Just don't do anything illegal with them because that's on you, not us. We're focused on explaining words, not policing how people use them.",
  },
  {
    question: "How often do you add new words?",
    answer:
      "We're adding words all the time, especially the ones people actually use and ask for. We're also planning a feature where people like you can request words to be added and the community can vote on them.",
  },
];

export default function FAQPage() {
  return (
    <main className="relative w-full overflow-hidden px-8">
      <div className="container mx-auto max-w-4xl py-12 md:py-20">
        <header className="mb-12 space-y-4">
          <h1 className="text-4xl font-bold">FAQ</h1>
          <p className="text-xl text-muted-foreground">
            Commonly asked questions about Word Directory
          </p>
        </header>

        <section className="space-y-12">
          {faqs.map((faq, index) => (
            <div key={index}>
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">{faq.question}</h2>
                <p className="text-foreground/70">{faq.answer}</p>
              </div>
              {index !== faqs.length - 1 && <Separator className="mt-12" />}
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
