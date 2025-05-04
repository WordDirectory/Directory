"use client";

import { useSession } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { capitalize } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SavedWordsResponse {
  words: string[];
  totalCount: number;
}

export default function SavedWordsPage() {
  const { data: session, isPending: isSessionLoading } = useSession();
  const [savedWords, setSavedWords] = useState<SavedWordsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 50;

  useEffect(() => {
    if (!session) return;

    async function fetchSavedWords() {
      try {
        setIsLoading(true);
        const offset = (page - 1) * limit;
        const response = await fetch(
          `/api/words/saved?limit=${limit}&offset=${offset}`
        );
        if (!response.ok) throw new Error("Failed to fetch saved words");
        const data = await response.json();
        setSavedWords(data);
      } catch (error) {
        console.error("Error fetching saved words:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSavedWords();
  }, [session, page]);

  if (isSessionLoading) {
    return (
      <main className="relative w-full overflow-hidden px-8 py-12 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </main>
    );
  }

  if (!session) {
    return (
      <main className="relative w-full overflow-hidden px-8">
        <div className="container mx-auto max-w-4xl py-12 md:py-20">
          <div className="flex flex-col items-center justify-center gap-6 text-center">
            <h1 className="text-4xl font-bold">Sign in required</h1>
            <p className="text-xl text-muted-foreground">
              Please sign in to view your saved words
            </p>
            <Button asChild>
              <Link href="/auth/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative w-full overflow-hidden px-8">
      <div className="container mx-auto max-w-4xl py-12 md:py-20">
        <header className="mb-8 space-y-4">
          <h1 className="text-4xl font-bold">Saved Words</h1>
          {savedWords && (
            <p className="text-xl text-muted-foreground">
              You have saved {savedWords.totalCount} word
              {savedWords.totalCount !== 1 ? "s" : ""}
            </p>
          )}
        </header>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : savedWords?.words.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-6 py-12 text-center">
            <p className="text-xl text-muted-foreground">
              You haven't saved any words yet
            </p>
            <Button asChild>
              <Link href="/">Start exploring words</Link>
            </Button>
          </div>
        ) : (
          <section className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {savedWords?.words.map((word) => (
                <Link key={word} href={`/words/${encodeURIComponent(word)}`}>
                  <Card className="transition-colors hover:bg-muted/50">
                    <CardContent className="p-4">
                      <h2 className="text-lg font-medium">
                        {capitalize(word)}
                      </h2>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {savedWords && savedWords.totalCount > limit && (
              <div className="flex justify-center gap-2 pt-6">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={page * limit >= savedWords.totalCount}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
