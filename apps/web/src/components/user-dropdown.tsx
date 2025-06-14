"use client";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { authClient, useSession } from "@/lib/auth-client";
import {
  LogIn,
  LogOut,
  Settings,
  CreditCard,
  Sun,
  Moon,
  Bookmark,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { getFirstLetter, getLetterColor } from "@/lib/utils";
import { useEffect, useState } from "react";
import { upgrade } from "./upgrade-button";

export function UserDropdown() {
  const { data: session } = useSession();
  const [isPlus, setIsPlus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const getSubscriptions = async () => {
      // Reset isPlus first
      setIsPlus(false);

      // Only fetch subscriptions if user is logged in
      if (!session?.user?.id) {
        return;
      }

      const { data: subscriptions } = await authClient.subscription.list();

      if (subscriptions) {
        const activeSubscription = subscriptions.find(
          (sub) =>
            sub.status === "active" ||
            sub.status === "trialing" ||
            sub.status === "past_due"
        );

        if (activeSubscription) {
          setIsPlus(true);
        }
      }
    };

    getSubscriptions();
  }, [session]); // Add session as dependency

  const handleSignOut = async () => {
    try {
      const { error } = await authClient.signOut();

      if (error) {
        throw new Error(error.message);
      }
      if (!pathname.includes("words/")) {
        router.push("/");
      }
    } catch (error) {
      toast.error("Error signing out", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handleBillingPortal = async () => {
    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
      });

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No portal URL received");
      }
    } catch (error) {
      toast.error("Error opening billing portal", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      await upgrade();
    } catch (error) {
      toast.error("Failed to upgrade", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative">
          <Avatar className="h-8 w-8 cursor-pointer">
            <AvatarImage
              src={session?.user?.image || undefined}
              alt="User avatar"
            />
            <AvatarFallback
              className={`text-white ${session?.user?.email ? getLetterColor(session?.user?.email) : "bg-gray-500"}`}
            >
              {getFirstLetter(session?.user?.email || "U")}
            </AvatarFallback>
          </Avatar>
          {isPlus && (
            <Badge className="absolute -bottom-1 -right-1 p-0.5 px-1 text-[0.5rem] bg-background text-foreground pointer-events-none">
              Plus
            </Badge>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-40 -mr-2" align="end">
        <>
          {session && (
            <>
              <DropdownMenuItem onClick={() => router.push("/user/saved")}>
                <Bookmark className="h-4 w-4" />
                Saved words
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <Settings className="h-4 w-4" />
                Settings
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={isPlus ? handleBillingPortal : handleUpgrade}
                disabled={isLoading}
              >
                {isPlus ? (
                  <>
                    <CreditCard className="h-4 w-4" />
                    Billing
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    Upgrade
                  </>
                )}
              </DropdownMenuItem>

              <ThemeItem />

              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                className="focus:bg-red-500/10 focus:text-red-500"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </>
          )}
          {!session && (
            <>
              <ThemeItem />
              <DropdownMenuItem onClick={() => router.push("/auth/signup")}>
                <LogIn className="h-4 w-4" />
                Sign in
              </DropdownMenuItem>
            </>
          )}
        </>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ThemeItem() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenuItem
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
      Theme
    </DropdownMenuItem>
  );
}
