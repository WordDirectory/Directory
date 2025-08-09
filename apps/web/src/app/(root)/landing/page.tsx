import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronRight } from "lucide-react";

export default function RoastLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            Words explained{" "}
            <span className="text-red-600"> terribly</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Because looking up one word <em>should</em> mean looking up twenty
            more. We explain words how you'd confuse them to an enemy.
          </p>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto mb-16">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search for a word to get confused about..."
                className="pl-12 pr-16 py-4 text-lg rounded-full border-2 border-red-200 focus:border-red-400 dark:border-red-800 dark:focus:border-red-600"
              />
              <Button
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full bg-red-500 hover:bg-red-600"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-red-100 dark:border-red-900">
              <div className="text-red-500 text-4xl mb-4">😵‍💫</div>
              <h3 className="font-semibold mb-2 text-red-700 dark:text-red-400">
                Unnecessarily Complicated
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Definitions that make zero sense and require a PhD to understand
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-red-100 dark:border-red-900">
              <div className="text-red-500 text-4xl mb-4">🗣️</div>
              <h3 className="font-semibold mb-2 text-red-700 dark:text-red-400">
                Mispronounced Audio
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Text-to-speech that probably gets everything wrong
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-red-100 dark:border-red-900">
              <div className="text-red-500 text-4xl mb-4">🐌</div>
              <h3 className="font-semibold mb-2 text-red-700 dark:text-red-400">
                Super Slow
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Unresponsive design that'll test your patience
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-red-100 dark:border-red-900">
              <div className="text-red-500 text-4xl mb-4">🌚</div>
              <h3 className="font-semibold mb-2 text-red-700 dark:text-red-400">
                Darker Mode
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Somehow darker than your understanding after reading our
                definitions
              </p>
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="bg-red-50 dark:bg-red-950/20 rounded-2xl p-8 mb-16 border border-red-200 dark:border-red-900">
            <h2 className="text-3xl font-bold mb-6 text-red-700 dark:text-red-400">
              Why choose us?
            </h2>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="flex items-start gap-3">
                <div className="text-red-500 text-xl">❌</div>
                <p className="text-gray-700 dark:text-gray-300">
                  We're like every other definition site - but with less
                  human-readable definitions
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-red-500 text-xl">🤯</div>
                <p className="text-gray-700 dark:text-gray-300">
                  Perfect for when you want to understand words less than when
                  you started
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-red-500 text-xl">😵</div>
                <p className="text-gray-700 dark:text-gray-300">
                  Great for confusing yourself and others in conversations
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-red-500 text-xl">🎭</div>
                <p className="text-gray-700 dark:text-gray-300">
                  Ideal for making simple concepts unnecessarily complex
                </p>
              </div>
            </div>
          </div>

          {/* Guarantee */}
          <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Our Guarantee</h2>
            <p className="text-lg">
              You'll leave more confused than when you arrived, or your
              confusion back!*
            </p>
            <p className="text-sm mt-2 opacity-75">
              *Confusion refunds not actually available because we're also
              confused about our refund policy
            </p>
          </div>

          {/* CTA */}
          <div className="mt-16">
            <Button
              size="lg"
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 text-lg rounded-full"
            >
              Start Getting Confused
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
