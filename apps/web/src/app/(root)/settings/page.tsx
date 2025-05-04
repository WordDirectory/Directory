"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useSession } from "@/lib/auth-client";
import { getFirstLetter } from "@/lib/utils";
import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  profileFormSchema,
  ProfileFormValues,
} from "@/lib/validation/auth-validation";

const AI_INITIAL_MESSAGE_KEY = "ai-initial-message";
const DEFAULT_INITIAL_MESSAGE = 'Explain the word "{word}"';

export default function SettingsPage() {
  const { data: session, isPending } = useSession();
  const [isSaving, setIsSaving] = useState(false);
  const [initialMessage, setInitialMessage] = useState(DEFAULT_INITIAL_MESSAGE);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    values: {
      name: session?.user?.name || "",
    },
  });

  useEffect(() => {
    // Load initial message from localStorage
    const savedMessage = localStorage.getItem(AI_INITIAL_MESSAGE_KEY);
    if (savedMessage) {
      setInitialMessage(savedMessage);
    }
  }, []);

  const handleSaveMessage = () => {
    localStorage.setItem(AI_INITIAL_MESSAGE_KEY, initialMessage);
    toast.success("Initial message saved!");
  };

  const handleResetMessage = () => {
    setInitialMessage(DEFAULT_INITIAL_MESSAGE);
    localStorage.setItem(AI_INITIAL_MESSAGE_KEY, DEFAULT_INITIAL_MESSAGE);
    toast.success("Initial message reset to default!");
  };

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsSaving(true);
      const { error } = await authClient.updateUser({ name: data.name });
      if (error) throw error;
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isPending) {
    return (
      <main className="relative w-full overflow-hidden px-8 py-12 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </main>
    );
  }

  return (
    <main className="relative w-full overflow-hidden">
      <div className="flex flex-col gap-12">
        <section className="flex flex-col gap-8">
          <h1 className="text-4xl font-bold">General</h1>
          <div className="flex flex-row items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={session?.user?.image || ""} alt="User avatar" />
              <AvatarFallback className="text-xl">
                {getFirstLetter(session?.user?.name || "U")}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold">{session?.user?.name}</h2>
              <p className="text-base text-muted-foreground">
                {session?.user?.email}
              </p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
            </form>
          </Form>
        </section>

        <section className="flex flex-col gap-8 border-t pt-8">
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-semibold">Initial AI Message</h2>
            <p className="text-sm text-muted-foreground">
              Customize the initial message that appears when you click "Ask AI"
              in the search. Use {"{word}"} as a placeholder - it will be
              replaced with the word you searched for.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="initial-message">Message Template</Label>
            <Input
              id="initial-message"
              value={initialMessage}
              onChange={(e) => setInitialMessage(e.target.value)}
              placeholder='Example: "Tell me about the word {word}"'
            />
            <p className="text-xs text-muted-foreground">
              Example: If you type "Tell me about {`{word}`}" and click "Ask AI"
              for the word "happy", the initial message will be "Tell me about
              happy"
            </p>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSaveMessage}>Save Message</Button>
            <Button variant="outline" onClick={handleResetMessage}>
              Reset to Default
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
