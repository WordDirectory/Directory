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
                alt="Word Directory Logo"
                width={28}
                height={28}
              />
              <h3 className="font-bold text-lg">Word Directory</h3>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              A dictionary that actually makes sense.{" "}
              <span className="font-medium">
                No more looking up words to understand other words.
              </span>
            </p>
          </div>

          {/* Company links */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <nav className="flex flex-col gap-2">
              <Link
                href="/about"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
              >
                About
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

          {/* Connect links with icons */}
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="flex gap-4">
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

        {/* Updated copyright */}
        <div className="mt-6 pt-6 text-center md:text-left">
          <p className="text-sm text-muted-foreground">
            &copy; Word Directory. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
