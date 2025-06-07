import { Hero } from "@/components/landing/hero";
import { DifferenceSection } from "@/components/landing/difference";
import { ImagesSection } from "@/components/landing/images";
import { PronunciationSection } from "@/components/landing/pronunciation";
import { AISection } from "@/components/landing/ai";

export default function Home() {
  return (
    <div className="flex flex-col gap-40 py-20 md:py-24 lg:py-32">
      <Hero />
      <DifferenceSection />
      <ImagesSection />
      <PronunciationSection />
      <AISection />
    </div>
  );
}
