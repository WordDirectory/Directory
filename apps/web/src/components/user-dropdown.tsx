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
import { LogIn, LogOut, Moon, Settings, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getFirstLetter } from "@/lib/utils";

export function UserDropdown() {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const { error } = await authClient.signOut();

      if (error) {
        throw new Error(error.message);
      }
      router.push("/");
    } catch (error) {
      toast.error("Error signing out", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarImage src={session?.user?.image || ""} alt="User avatar" />
          <AvatarFallback className="">
            {getFirstLetter(session?.user?.name || "U")}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-40 -mr-2" align="end">
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
        {!session && (
          <DropdownMenuItem onClick={() => router.push("/auth/signup")}>
            <LogIn className="h-4 w-4" />
            Sign in
          </DropdownMenuItem>
        )}
        {session && (
          <>
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <Settings className="h-4 w-4" />
              Settings
            </DropdownMenuItem>
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
