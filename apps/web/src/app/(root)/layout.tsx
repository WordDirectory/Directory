import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

/**
 * Provides the main application layout with a header, footer, and a flexible content area.
 *
 * Renders the {@link Header} at the top, the {@link Footer} at the bottom, and displays the given {@link children} in a vertically expanding container between them.
 *
 * @param children - The content to display between the header and footer.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex flex-col">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
