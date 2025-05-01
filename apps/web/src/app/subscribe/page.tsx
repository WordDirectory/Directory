"use client";
import { useEffect, useState } from "react";
import { upgrade } from "@/components/upgrade-button";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function SubscribePage() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const startUpgrade = async () => {
      try {
        await upgrade();
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Something went wrong"
        );
        // If there's an error, wait 2 seconds and redirect to settings
        setTimeout(() => {
          router.push("/settings");
        }, 2000);
      }
    };

    startUpgrade();
  }, [router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-destructive">{error}</p>
          <p className="text-muted-foreground text-sm">
            Redirecting to settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
