import { Hero } from "@/components/landing/hero";
import { DifferenceSection } from "@/components/landing/difference";
import { ImagesSection } from "@/components/landing/images";
import { PronunciationSection } from "@/components/landing/pronunciation";
import { AISection } from "@/components/landing/ai";
import { CTA } from "@/components/landing/cta";

export default function Home() {
  return (
    <div className="flex flex-col gap-40 pt-20 md:py-24 lg:py-32">
      <Hero />
      <DifferenceSection />
      <ImagesSection />
      <PronunciationSection />
      <AISection />
      <CTA />
    </div>
  );
}
