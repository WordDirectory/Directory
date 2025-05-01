"use client";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export async function upgrade() {
  const { error } = await authClient.subscription.upgrade({
    plan: "plus",
    successUrl: "/settings",
    cancelUrl: "/settings",
  });

  if (error) {
    throw new Error(error.message, { cause: error });
  }
}

export function UpgradeButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      await upgrade();
    } catch (error) {
      if (error instanceof Error) {
        const betterAuthError = error.cause as {
          message: string;
          status: number;
          statusText: string;
        };
        if (betterAuthError.statusText === "UNAUTHORIZED") {
          router.push("/auth/login?message=Let's log in first so we know where to send the pro features to!");
          return;
        }
      }
      toast.error("Failed to upgrade", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleUpgrade}
      className="bg-primary hover:bg-primary/90 w-full"
      disabled={isLoading}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Upgrading...
        </div>
      ) : (
        "Upgrade now"
      )}
    </Button>
  );
}
