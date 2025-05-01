"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { Eye, EyeOff, Loader2, Moon, Sun } from "lucide-react";
import { FaGoogle } from "react-icons/fa6";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Suspense, useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import {
  loginSchema,
  signupSchema,
  type LoginValues,
  type SignupValues,
} from "@/lib/validation/auth-validation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { upgrade } from "./upgrade-button";
import { useSearchParams } from "next/navigation";

interface AuthLayoutProps {
  mode: "login" | "signup";
}

function AuthLayoutInner({ mode }: AuthLayoutProps) {
  const { theme, setTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const shouldSubscribe = searchParams.get("shouldSubscribe") === "true";

  const form = useForm<LoginValues | SignupValues>({
    resolver: zodResolver(mode === "signup" ? signupSchema : loginSchema),
    defaultValues: {
      email: "",
      password: "",
      ...(mode === "signup" ? { confirmPassword: "" } : {}),
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

        if (shouldSubscribe) {
          await upgrade();
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

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: shouldSubscribe ? "/subscribe" : undefined, // Let it use the default callback if not subscribing
      });
      if (error) throw error;
    } catch (error) {
      toast.error("Error signing in with Google", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-dvh">
      <header className="absolute top-0 left-0 right-0 bg-transparent p-6 flex justify-between items-center z-10">
        <Link href="/" className="flex items-center space-x-3">
          <Image
            src="/logo.png"
            alt="WordDirectory Logo"
            width={32}
            height={32}
          />
          <h2 className="text-lg font-bold">WordDirectory</h2>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="hover:bg-primary/10"
        >
          {theme === "light" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </header>

      <div className="flex flex-1">
        {/* Left side - Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <h1 className="text-3xl font-bold mb-8">
              {mode === "signup" ? "Create an account" : "Welcome back"}
            </h1>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
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

                {mode === "signup" && (
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
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
                )}

                {formError && (
                  <div className="text-sm font-medium text-destructive">
                    {formError}
                  </div>
                )}

                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-0.5 h-4 w-4 animate-spin" />
                      {mode === "signup" ? "Signing up..." : "Logging in..."}
                    </>
                  ) : mode === "signup" ? (
                    "Sign Up"
                  ) : (
                    "Log In"
                  )}
                </Button>
              </form>
            </Form>

            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6">
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

            <div className="text-sm mt-6 text-center text-muted-foreground">
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
          </div>
        </div>

        {/* Right side - Image */}
        <div className="flex-1 relative hidden lg:block">
          <img
            src={theme === "dark" ? "/signup-dark.png" : "/signup-light.png"}
            alt={`${mode === "signup" ? "Signup" : "Login"} illustration`}
            className="object-cover w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}

export function AuthLayout(props: AuthLayoutProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <AuthLayoutInner {...props} />
    </Suspense>
  );
}
