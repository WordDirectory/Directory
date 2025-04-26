import { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

const roadmapItems: {
  title: string;
  description: string;
  status: {
    text: string;
    complete: boolean;
  };
}[] = [
  {
    title: "Chrome Extension", 
    description:
      "Our Chrome extension is now live! [Get it here](https://chromewebstore.google.com/detail/worddirectory/nmbecimflkmecigpnnflifohoghhgdah)",
    status: {
      text: "Published",
      complete: true
    },
  },
  {
    title: "Add 150.000 words",
    description:
      "Expect 150.000 words soon. Current count is around 70.000 but they're not live yet. Estimated completion date: May 4th, 2025.",
    status: {
      text: "In progress",
      complete: false
    },
  },
  {
    title: "Scaling up",
    description: "As we add more words, we'll need to handle things a little differently",
    status: {
      text: "Completed",
      complete: true
    },
  },
  {
    title: "Community feedback",
    description: "Allow users to suggest changes to definitions and vote on them. This will help improve the quality of our definitions through the community.",
    status: {
      text: "Not started",
      complete: false
    },
  },
  {
    title: "Word of the day",
    description: "Daily featured words with their definitions, delivered through the website and social media. Will include weekly, monthly, and yearly special features.",
    status: {
      text: "Not started",
      complete: false
    },
  },
  {
    title: "Public API",
    description: "A public API to get definitions for a word, finding words, etc.",
    status: {
      text: "In progress",
      complete: false
    },
  },
  {
    title: "AI integration",
    description: "Advanced features powered by AI including sentence definitions and multi-language support.",
    status: {
      text: "Not started",
      complete: false
    },
  },
  {
    title: "Twitter bot",
    description: "A Twitter bot that responds with definitions when mentioned. Just tweet '@WordDirectoryBot [word]' and get an instant definition.",
    status: {
      text: "Not started",
      complete: false
    },
  },
];

export const metadata: Metadata = {
  title: "Roadmap | Word Directory",
  description:
    "See what's coming next for Word Directory - Making definitions human-readable",
  openGraph: {
    title: "What's next for WordDirectory",
    description: "See what's coming next for Word Directory - Making definitions human-readable",
    url: "https://worddirectory.app/roadmap",
    siteName: "WordDirectory",
    images: [
      {
        url: "https://worddirectory.app/og/roadmap.png",
        width: 1200,
        height: 630,
        alt: "What's next for WordDirectory",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "What's next for WordDirectory",
    description: "See what's coming next for Word Directory - Making definitions human-readable",
    images: ["https://worddirectory.app/og/roadmap.png"],
  },
};

export default function RoadmapPage() {
  return (
    <main className="relative w-full overflow-hidden px-8">
      <div className="container mx-auto max-w-4xl py-20">
        <header className="mb-12 space-y-4">
          <h1 className="text-4xl font-bold">Roadmap</h1>
          <p className="text-xl text-muted-foreground">
            What's coming next for Word Directory (last updated: April 25, 2025)
          </p>
        </header>

        <section className="mb-12">
          <div className="space-y-6">
            {roadmapItems.map((item, index) => (
              <div key={index} className="relative">
                <div className="flex items-start gap-2">
                  <span className="text-lg font-medium text-muted-foreground select-none leading-[1.5]">
                    {index + 1}.
                  </span>
                  <div className="flex-1 pt-[2px]">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{item.title}</h3>
                      <Badge className={cn(
                        "shadow-none",
                        item.status.complete ? "!bg-green-500" : "!bg-foreground/5 text-accent-foreground"
                      )}>
                        {item.status.text}
                      </Badge>
                    </div>
                    <div className="text-foreground/70">
                      <ReactMarkdown
                        components={{
                          a: ({ className, children, ...props }) => (
                            <a
                              className={cn(
                                "text-blue-500 hover:underline",
                                className
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              {...props}
                            >
                              {children}
                            </a>
                          ),
                        }}
                      >
                        {item.description}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
