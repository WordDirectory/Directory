"use client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { FaGoogle } from "react-icons/fa6";
import {
  loginSchema,
  signupSchema,
  type LoginValues,
  type SignupValues,
} from "@/lib/validation/auth-validation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import Link from "next/link";

export function AuthForm({ mode }: { mode: "signup" | "login" }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<LoginValues | SignupValues>({
    resolver: zodResolver(mode === "signup" ? signupSchema : loginSchema),
    defaultValues: {
      email: "",
      password: "",
      ...(mode === "signup" ? { name: "" } : {}),
    },
  });

  const onSubmit = async (values: LoginValues | SignupValues) => {
    try {
      setIsLoading(true);
      setFormError(null);
      if (mode === "signup") {
        const signupValues = values as SignupValues;
        // Extract name from email (everything before @)
        const name = signupValues.email
          .split("@")[0]
          .toLowerCase()
          // Replace special characters and numbers with spaces
          .replace(/[^a-z]/g, " ")
          // Capitalize first letter of each word
          .replace(/\b\w/g, (c) => c.toUpperCase())
          // Remove extra spaces
          .trim();

        const { error } = await authClient.signUp.email({
          email: signupValues.email,
          password: signupValues.password,
          name,
        });

        if (error) {
          throw new Error(error.message);
        }
      } else {
        const loginValues = values as LoginValues;
        const { error } = await authClient.signIn.email({
          email: loginValues.email,
          password: loginValues.password,
        });

        if (error) {
          throw new Error(error.message);
        }
      }
    } catch (error) {
      console.error("Something went wrong", error);
      setFormError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-2">
        <CardTitle className="text-xl font-bold">
          {mode === "signup" ? "Sign Up" : "Login"}
        </CardTitle>
        <CardDescription>
          {mode === "signup"
            ? "Create an account to get an even better experience"
            : "Login to an existing account"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {formError && (
              <div className="text-sm font-medium text-destructive">
                {formError}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-0.5 h-4 w-4 animate-spin" />
                  {mode === "signup" ? "Signing up..." : "Logging in..."}
                </>
              ) : mode === "signup" ? (
                "Sign Up"
              ) : (
                "Login"
              )}
            </Button>

            <div className="text-sm pt-1 text-muted-foreground">
              {mode === "signup" ? (
                <>
                  Already have an account?{" "}
                  <Link
                    href="/auth/login"
                    className="text-primary hover:underline"
                  >
                    Log in
                  </Link>
                </>
              ) : (
                <>
                  Don't have an account?{" "}
                  <Link
                    href="/auth/signup"
                    className="text-primary hover:underline"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </form>
        </Form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <SocialProviders />
      </CardContent>
    </Card>
  );
}

function SocialProviders() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await authClient.signIn.social({
        provider: "google",
      });
    } catch (error) {
      toast.error("Error signing in with Google", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-2">
      <Button
        variant="outline"
        className="w-full"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="mr-0.5 h-4 w-4 animate-spin" />
        ) : (
          <FaGoogle className="mr-0.5 h-4 w-4" />
        )}
        Google
      </Button>
    </div>
  );
}
