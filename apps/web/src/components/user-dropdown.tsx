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
import { LogIn, LogOut, Moon, Settings, Sun, CreditCard } from "lucide-react";
import { Badge } from "./ui/badge";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { getFirstLetter } from "@/lib/utils";
import { useEffect, useState } from "react";

export function UserDropdown() {
  const { data: session } = useSession();
  const [isPlus, setIsPlus] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const getSubscriptions = async () => {
      const { data: subscriptions } = await authClient.subscription.list();

      if (subscriptions) {
        const activeSubscription = subscriptions.find(
          (sub) => sub.status === "active" || sub.status === "trialing"
        );

        if (activeSubscription) {
          setIsPlus(true);
        }
      }
    };

    getSubscriptions();
  }, []);

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative">
          <Avatar className="h-8 w-8 cursor-pointer">
            <AvatarImage src={session?.user?.image || ""} alt="User avatar" />
            <AvatarFallback className="">
              {getFirstLetter(session?.user?.name || "U")}
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
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <Settings className="h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <ThemeItem />
              {isPlus && (
                <DropdownMenuItem onClick={handleBillingPortal}>
                  <CreditCard className="h-4 w-4" />
                  Billing
                </DropdownMenuItem>
              )}
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
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all" />
      ) : (
        <Moon className="h-4 w-4 rotate-0 scale-100 transition-all" />
      )}
      {theme === "light" ? "Light" : "Dark"} theme
    </DropdownMenuItem>
  );
}
