import { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

const roadmapItems: {
  title: string;
  description: string;
  status: {
    text: string;
    type: "complete" | "pending" | "default" | "info";
  };
}[] = [
  {
    title: "Chrome Extension",
    description:
      "Right-click any word on any webpage to get its definition or search '[word] definition' to get a definition. [Get it here](https://chromewebstore.google.com/detail/worddirectory/nmbecimflkmecigpnnflifohoghhgdah)",
    status: {
      text: "Completed",
      type: "complete",
    },
  },
  {
    title: "Add 150.000 words",
    description: "WordDirectory now has 150.000 words!",
    status: {
      text: "Completed",
      type: "complete",
    },
  },
  {
    title: "Scaling up",
    description:
      "As we add more words, we'll need to handle things a little differently",
    status: {
      text: "Completed",
      type: "complete",
    },
  },
  {
    title: "Community feedback",
    description:
      "See a definition that sucks? Now you can suggest better ones and vote on other people's suggestions.",
    status: {
      text: "Completed",
      type: "complete",
    },
  },
  {
    title: "Word of the day",
    description: "Learn a new word every day.",
    status: {
      text: "Not started",
      type: "default",
    },
  },
  {
    title: "Public API",
    description:
      "Want to use our definitions in your app? Now you can. Check the [API docs](https://worddirectory.app/docs/developers/api-routes)",
    status: {
      text: "Completed",
      type: "complete",
    },
  },
  {
    title: "AI integration",
    description:
      "Using AI to explain words in different ways and support more languages.",
    status: {
      text: "In beta",
      type: "info",
    },
  },
  {
    title: "Word images",
    description:
      "Added pictures for words. Makes it way easier to understand what stuff actually looks like.",
    status: {
      text: "Completed",
      type: "complete",
    },
  },
  {
    title: "Share images",
    description:
      "Found a cool word? Share it with a link or image. No more screenshots.",
    status: {
      text: "Completed",
      type: "complete",
    },
  },
  {
    title: "MCP Server",
    description:
      "Building an MCP server so AI tools like Claude can tap directly into our dictionary.",
    status: {
      text: "In progress",
      type: "pending",
    },
  },
  {
    title: "Dictionary Rebuild",
    description:
      "Complete rebuild of our dictionary (dataset) to make definitions better and add new features. Big update, but worth it.",
    status: {
      text: "In progress",
      type: "pending",
    },
  },
  {
    title: "Text-to-Speech Performance",
    description:
      "Making the pronunciation feature way faster. No more waiting around to hear how words sound.",
    status: {
      text: "Not started",
      type: "default",
    },
  },
  {
    title: "Twitter bot",
    description: "Tweet '@WordDirectoryBot [word]' and get a definition back.",
    status: {
      text: "Not started",
      type: "default",
    },
  },
  {
    title: "Native Desktop App",
    description:
      "A proper app for Windows and Mac. Quick access to definitions right from your desktop.",
    status: {
      text: "Not started",
      type: "default",
    },
  },
  {
    title: "Raycast Extension",
    description:
      "For you keyboard nerds - look up words without touching your mouse. Works with Raycast.",
    status: {
      text: "In review",
      type: "pending",
    },
  },
  {
    title: "Multiple Languages",
    description:
      "Adding Spanish, French, German, and more. Same simple definitions, just in different languages.",
    status: {
      text: "Not started",
      type: "default",
    },
  },
  {
    title: "YouGlish Integration",
    description:
      "See how words are used in real YouTube videos. Great for hearing how native speakers actually say things.",
    status: {
      text: "In beta",
      type: "info",
    },
  },
];

export const metadata: Metadata = {
  title: "Roadmap | Word Directory",
  description:
    "See what's coming next for Word Directory - Making definitions human-readable",
  openGraph: {
    title: "What's next for WordDirectory",
    description:
      "See what's coming next for Word Directory - Making definitions human-readable",
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
    description:
      "See what's coming next for Word Directory - Making definitions human-readable",
    images: ["https://worddirectory.app/og/roadmap.png"],
  },
};

export default function RoadmapPage() {
  return (
    <main className="relative w-full overflow-hidden px-8">
      <div className="container mx-auto max-w-4xl py-12 md:py-20">
        <header className="mb-12 space-y-4">
          <h1 className="text-4xl font-bold">Roadmap</h1>
          <p className="text-xl text-muted-foreground">
            What's coming next for Word Directory (last updated: May 6, 2025)
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
                      <Badge
                        className={cn("shadow-none", {
                          "!bg-green-500 text-white":
                            item.status.type === "complete",
                          "!bg-yellow-500 text-white":
                            item.status.type === "pending",
                          "!bg-blue-500 text-white":
                            item.status.type === "info",
                          "!bg-foreground/5 text-accent-foreground":
                            item.status.type === "default",
                        })}
                      >
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
