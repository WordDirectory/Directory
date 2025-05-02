import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing | WordDirectory",
  description:
    "Simple, transparent pricing for WordDirectory - Words explained simply",
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
