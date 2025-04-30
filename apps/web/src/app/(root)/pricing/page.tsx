import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing | WordDirectory",
  description:
    "Simple, transparent pricing for WordDirectory - Words explained simply",
};

const plans = [
  {
    name: "Free",
    description: "For people who are just starting out",
    price: "$0",
    interval: "Forever free",
    href: "/",
    buttonText: "Get started",
    buttonVariant: "default" as const,
    features: [
      "Unlimited word lookups",
      "Human-readable definitions",
      "10 AI requests per month",
    ],
  },
  {
    name: "Plus",
    description: "For power users who want more",
    price: "$1",
    interval: "per month",
    href: "/settings",
    buttonText: "Upgrade now",
    buttonVariant: "primary" as const,
    features: [
      "Everything in Free",
      "1,000 AI requests per month",
      "Support development",
    ],
  },
] as const;

const faqs = [
  {
    question: "Will the free plan always be free?",
    answer:
      "Yes! The core features of WordDirectory will always be free. We might add premium AI features in the future, but the basic dictionary will stay free forever.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Absolutely. No commitments or hidden terms. You can cancel your Plus subscription anytime and return to the free plan.",
  },
  {
    question: "What are AI requests?",
    answer:
      "AI requests let you ask follow-up questions about words, get more examples, or dive deeper into meanings. Plus users get 1,000 requests per month.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "Yes. If you're not satisfied with Plus for any reason within your first 7 days, we'll provide a full refund. No questions asked.",
  },
] as const;

export default function PricingPage() {
  return (
    <main className="relative w-full overflow-hidden px-8">
      <div className="container mx-auto max-w-4xl py-20">
        <header className="mb-12 space-y-4 text-center">
          <h1 className="text-4xl font-bold">Simple, transparent pricing</h1>
          <p className="text-xl text-muted-foreground">
            Clear and straightforward, just like our definitions.
          </p>
        </header>

        <div className="grid gap-8 md:grid-cols-2">
          {plans.map((plan) => (
            <div key={plan.name} className="rounded-lg border bg-card p-8">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <p className="text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mt-4">
                <div className="text-4xl font-bold">{plan.price}</div>
                <p className="text-sm text-muted-foreground">{plan.interval}</p>
              </div>

              <div className="mt-5 space-y-4">
                <ul className="space-y-3 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                asChild
                className={cn("mt-5 w-full", {
                  "bg-primary hover:bg-primary/90":
                    plan.buttonVariant === "primary",
                })}
              >
                <Link href={plan.href}>{plan.buttonText}</Link>
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-16 space-y-8">
          <h2 className="text-2xl font-semibold text-center">
            Frequently asked questions
          </h2>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={`item-${index + 1}`}
                value={`item-${index + 1}`}
              >
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </main>
  );
}
