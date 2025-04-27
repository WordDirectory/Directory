import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function DocsPage() {
  return (
    <div className="space-y-12">
      <header className="space-y-4">
        <h1 className="text-4xl font-bold">API Routes</h1>
        <p className="text-xl text-muted-foreground">
          WordDirectory provides a simple REST API for accessing word
          definitions and audio pronunciations. All endpoints are rate-limited
          and return JSON responses (except audio).
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Base URL</h2>
        <p className="text-muted-foreground">
          All API routes are served from:{" "}
          <code className="bg-muted px-2 py-1 rounded">
            https://worddirectory.app/api
          </code>
        </p>
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Rate Limiting</h2>
        <p className="text-muted-foreground">
          All endpoints are rate-limited based on IP address. If you exceed the
          limit, you'll receive a 429 response with a Retry-After header. Audio
          endpoints have stricter rate limits.
        </p>
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Endpoints</h2>

        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-xl font-medium">Get Word Definition</h3>
            <div className="space-y-6">
              <div className="space-y-4">
                <p>
                  <code className="bg-muted px-2 py-1 rounded">
                    GET /words/{"{word}"}
                  </code>
                </p>
                <p className="text-muted-foreground">
                  Get the definition and details for a specific word.
                </p>
              </div>

              <div className="space-y-4">
                <p className="font-medium">Query Parameters:</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>
                    <code>fallback</code> - URL to redirect to if word isn't
                    found
                  </li>
                  <li>
                    <code>next</code> - URL to redirect to if word is found
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <p className="font-medium">Response Codes:</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>200 - Word found</li>
                  <li>404 - Word not found</li>
                  <li>429 - Rate limit exceeded</li>
                  <li>500 - Server error</li>
                </ul>
              </div>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="space-y-4">
            <h3 className="text-xl font-medium">Get Word Audio</h3>
            <div className="space-y-6">
              <div className="space-y-4">
                <p>
                  <code className="bg-muted px-2 py-1 rounded">
                    GET /words/{"{word}"}/audio
                  </code>
                </p>
                <p className="text-muted-foreground">
                  Get the audio pronunciation of a word using ElevenLabs AI.
                </p>
              </div>

              <div className="space-y-4">
                <p className="font-medium">Response:</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Returns audio/mpeg data</li>
                  <li>Cached for 1 year</li>
                </ul>
              </div>

              <div className="space-y-4">
                <p className="font-medium">Response Codes:</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>200 - Audio generated successfully</li>
                  <li>404 - Word not found</li>
                  <li>429 - Rate limit exceeded</li>
                  <li>500 - Server error</li>
                </ul>
              </div>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="space-y-4">
            <h3 className="text-xl font-medium">Search Words</h3>
            <div className="space-y-6">
              <div className="space-y-4">
                <p>
                  <code className="bg-muted px-2 py-1 rounded">
                    GET /words/search
                  </code>
                </p>
                <p className="text-muted-foreground">
                  Search for words in the dictionary.
                </p>
              </div>

              <div className="space-y-4">
                <p className="font-medium">Query Parameters:</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>
                    <code>q</code> - Search query
                  </li>
                  <li>
                    <code>limit</code> - Maximum results (default: 50, max: 100)
                  </li>
                  <li>
                    <code>offset</code> - Pagination offset (default: 0)
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="space-y-4">
            <h3 className="text-xl font-medium">Random Words</h3>
            <div className="space-y-6">
              <div className="space-y-4">
                <p>
                  <code className="bg-muted px-2 py-1 rounded">
                    GET /words/random
                  </code>
                </p>
                <p className="text-muted-foreground">
                  Get a list of random words from the dictionary.
                </p>
              </div>

              <div className="space-y-4">
                <p className="font-medium">Query Parameters:</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>
                    <code>limit</code> - Number of words (default: 50, max: 100)
                  </li>
                </ul>
              </div>

              <div className="mt-4">
                <p className="text-muted-foreground">
                  Results are cached for 1 year for performance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      <section>
        <h2 className="text-2xl font-semibold mb-4">Need help?</h2>
        <p>
          If you need help or have questions about the API, please{" "}
          <Link href="/contact" className="underline hover:text-foreground/70">
            get in touch
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
