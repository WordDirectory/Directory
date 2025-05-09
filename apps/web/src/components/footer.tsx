import Link from "next/link";
import { FaGithub, FaXTwitter } from "react-icons/fa6";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-background text-foreground border-t">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Description section with title */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/logo.png"
                alt="WordDirectory Logo"
                width={28}
                height={28}
              />
              <h3 className="font-bold text-lg">WordDirectory</h3>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              Words explained like a friend would - no complex terms, just
              simple human explanations for everyday words, slang, and tricky
              terms.
            </p>
          </div>

          {/* Quick Start */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <nav className="flex flex-col gap-2">
              <Link
                href="/about"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
              >
                About
              </Link>
              <Link
                href="https://chromewebstore.google.com/detail/worddirectory/nmbecimflkmecigpnnflifohoghhgdah"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
                target="_blank"
                rel="noopener noreferrer"
              >
                Install extension
              </Link>
              <Link
                href="/pricing"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
              >
                Pricing
              </Link>
              <Link
                href="/docs"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
              >
                Documentation
              </Link>
              <Link
                href="/roadmap"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
              >
                Roadmap
              </Link>
            </nav>
          </div>

          {/* Support & Legal */}
          <div>
            <h4 className="font-semibold mb-4">Support & Legal</h4>
            <nav className="flex flex-col gap-2">
              <Link
                href="/faq"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
              >
                FAQ
              </Link>
              <Link
                href="/contact"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
              >
                Contact
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
              >
                Terms
              </Link>
            </nav>
          </div>
        </div>

        {/* Social and copyright */}
        <div className="mt-8 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground order-2 md:order-1">
            &copy; WordDirectory. All rights reserved.
          </p>
          <div className="flex gap-4 order-1 md:order-2">
            <Link
              href="https://github.com/WordDirectory/Directory"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <FaGithub size={24} />
            </Link>
            <Link
              href="https://x.com/WordDirectory"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <FaXTwitter size={24} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
