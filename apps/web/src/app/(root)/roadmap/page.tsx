import { Metadata } from "next";
import { Badge } from "@/components/ui/badge";

const roadmapItems: {
  title: string;
  description: string;
  status: string;
}[] = [
  {
    title: "Add 150.000 words",
    description:
      "Expect 150.000 words soon. Current count is around 20.000 but they're not live yet.",
    status: "In progress",
  },
  {
    title: "Chrome Extension",
    description:
      "Building a Chrome extension and getting it out to the public.",
    status: "In review",
  },
  {
    title: "Scaling up",
    description: "As we add more words, we'll need to handle things a little differently",
    status: "Not started",
  },
  {
    title: "API",
    description: "An API to get definitions for a word, finding words, etc.",
    status: "Not started",
  },
];

export const metadata: Metadata = {
  title: "Roadmap | Word Directory",
  description:
    "See what's coming next for Word Directory - Making definitions human-readable",
};

export default function RoadmapPage() {
  return (
    <main className="relative w-full overflow-hidden px-4">
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
                      <Badge variant={item.status === "Completed" ? "default" : "secondary"}>
                        {item.status}
                      </Badge>
                    </div>
                    <p className="text-foreground/70">{item.description}</p>
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
