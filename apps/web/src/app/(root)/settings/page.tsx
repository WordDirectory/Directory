"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useSession } from "@/lib/auth-client";
import { getFirstLetter, getLetterColor } from "@/lib/utils";
import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DeleteAccountDialog } from "@/components/delete-account-dialog";
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
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  AI_INITIAL_MESSAGE_KEY,
  DEFAULT_INITIAL_MESSAGE,
  SHOW_IMAGES_KEY,
  HEAR_EXAMPLES_BEHAVIOR_KEY,
  HEAR_EXAMPLES_BEHAVIORS,
  DEFAULT_HEAR_EXAMPLES_BEHAVIOR,
  SHOW_RANDOM_WORDS_KEY,
  DEFAULT_SHOW_RANDOM_WORDS,
  type HearExamplesBehavior,
} from "@/lib/settings";

export default function SettingsPage() {
  const { data: session, isPending } = useSession();
  const [isSaving, setIsSaving] = useState(false);
  const [initialMessage, setInitialMessage] = useState(DEFAULT_INITIAL_MESSAGE);
  const [savedInitialMessage, setSavedInitialMessage] = useState(
    DEFAULT_INITIAL_MESSAGE
  );
  const [showImages, setShowImages] = useState(false);
  const [savedShowImages, setSavedShowImages] = useState(false);
  const [isSavingImages, setIsSavingImages] = useState(false);
  const [hearExamplesBehavior, setHearExamplesBehavior] =
    useState<HearExamplesBehavior>(DEFAULT_HEAR_EXAMPLES_BEHAVIOR);
  const [savedHearExamplesBehavior, setSavedHearExamplesBehavior] =
    useState<HearExamplesBehavior>(DEFAULT_HEAR_EXAMPLES_BEHAVIOR);
  const [isSavingHearExamples, setIsSavingHearExamples] = useState(false);
  const [showRandomWords, setShowRandomWords] = useState(
    DEFAULT_SHOW_RANDOM_WORDS
  );
  const [savedShowRandomWords, setSavedShowRandomWords] = useState(
    DEFAULT_SHOW_RANDOM_WORDS
  );
  const [isSavingRandomWords, setIsSavingRandomWords] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
      setSavedInitialMessage(savedMessage);
    }

    // Load image preference from localStorage
    const savedImagePref = localStorage.getItem(SHOW_IMAGES_KEY);
    if (savedImagePref) {
      setShowImages(savedImagePref === "true");
      setSavedShowImages(savedImagePref === "true");
    }

    // Load hear examples behavior from localStorage
    const savedHearExamplesBehavior = localStorage.getItem(
      HEAR_EXAMPLES_BEHAVIOR_KEY
    );
    if (
      savedHearExamplesBehavior &&
      HEAR_EXAMPLES_BEHAVIORS.includes(
        savedHearExamplesBehavior as HearExamplesBehavior
      )
    ) {
      setHearExamplesBehavior(
        savedHearExamplesBehavior as HearExamplesBehavior
      );
      setSavedHearExamplesBehavior(
        savedHearExamplesBehavior as HearExamplesBehavior
      );
    }

    // Load random words preference from localStorage
    const savedRandomWordsPref = localStorage.getItem(SHOW_RANDOM_WORDS_KEY);
    if (savedRandomWordsPref) {
      setShowRandomWords(savedRandomWordsPref === "true");
      setSavedShowRandomWords(savedRandomWordsPref === "true");
    }
  }, []);

  const handleSaveMessage = () => {
    localStorage.setItem(AI_INITIAL_MESSAGE_KEY, initialMessage);
    setSavedInitialMessage(initialMessage);
    toast.success("Initial message saved!");
  };

  const handleResetMessage = () => {
    setInitialMessage(DEFAULT_INITIAL_MESSAGE);
    setSavedInitialMessage(DEFAULT_INITIAL_MESSAGE);
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
      <div className="flex flex-col gap-12 px-0.5">
        <section className="flex flex-col gap-8">
          <h1 className="text-4xl font-bold">General</h1>
          <div className="flex flex-row items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={session?.user?.image || undefined}
                alt="User avatar"
              />
              <AvatarFallback
                className={`text-[2.5rem] text-white ${session?.user?.email ? getLetterColor(session?.user?.email) : "bg-gray-500"}`}
              >
                {getFirstLetter(session?.user?.email || "U")}
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
              <Button
                type="submit"
                disabled={
                  isSaving || form.watch("name") === (session?.user?.name || "")
                }
              >
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
          <div className="flex flex-col gap-3">
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
            <Button
              onClick={handleSaveMessage}
              disabled={initialMessage === savedInitialMessage}
            >
              Save Message
            </Button>
            <Button variant="outline" onClick={handleResetMessage}>
              Reset to Default
            </Button>
          </div>
        </section>

        <section className="flex flex-col gap-8 border-t pt-8">
          <div className="flex flex-col gap-3">
            <h2 className="text-2xl font-semibold">Hear Examples</h2>
            <p className="text-sm text-muted-foreground">
              Choose what happens when you click the "Hear examples" button on
              word pages. This controls whether you see our built-in
              pronunciation examples or get redirected to YouGlish.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Label className="text-sm font-medium">Default Behavior</Label>
            <RadioGroup
              value={hearExamplesBehavior}
              onValueChange={(value) =>
                setHearExamplesBehavior(value as HearExamplesBehavior)
              }
              className="gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hear-examples" id="hear-examples" />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="hear-examples"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Hear examples
                  </Label>
                  <p className="text-[13px] text-muted-foreground">
                    Listen to the word right on WordDirectory. This is not
                    powered by YouGlish so expect less words to work with this.
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="youglish" id="youglish" />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="youglish"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    YouGlish
                  </Label>
                  <p className="text-[13px] text-muted-foreground">
                    Opens YouGlish in a new tab to show real YouTube videos with
                    the word being pronounced. More examples but requires
                    leaving WordDirectory.
                  </p>
                </div>
              </div>
            </RadioGroup>

            <Button
              className="w-fit"
              onClick={async () => {
                try {
                  setIsSavingHearExamples(true);
                  localStorage.setItem(
                    HEAR_EXAMPLES_BEHAVIOR_KEY,
                    hearExamplesBehavior
                  );
                  setSavedHearExamplesBehavior(hearExamplesBehavior);
                  toast.success("Hear examples preference saved!");
                } catch (error) {
                  toast.error("Failed to save hear examples preference");
                } finally {
                  setIsSavingHearExamples(false);
                }
              }}
              disabled={
                isSavingHearExamples ||
                hearExamplesBehavior === savedHearExamplesBehavior
              }
            >
              {isSavingHearExamples ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        </section>

        <section className="flex flex-col gap-8 border-t pt-8">
          <div className="flex flex-col gap-3">
            <h2 className="text-2xl font-semibold">Word Images</h2>
            <p className="text-sm text-muted-foreground">
              Configure how images are displayed when looking up word
              definitions. These settings only apply to desktop devices - on
              mobile, images are always accessed via the images button.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                className="rounded"
                id="show-images"
                checked={showImages}
                onCheckedChange={(checked) => {
                  setShowImages(checked as boolean);
                }}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="show-images"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Show word images automatically
                </Label>
                <p className="text-[13px] text-muted-foreground">
                  When enabled, the images panel will automatically open when
                  you visit a word page (desktop only)
                </p>
              </div>
            </div>

            <Button
              className="w-fit"
              onClick={async () => {
                try {
                  setIsSavingImages(true);
                  localStorage.setItem(SHOW_IMAGES_KEY, showImages.toString());
                  setSavedShowImages(showImages);
                  toast.success("Image preferences saved!");
                } catch (error) {
                  toast.error("Failed to save image preferences");
                } finally {
                  setIsSavingImages(false);
                }
              }}
              disabled={isSavingImages || showImages === savedShowImages}
            >
              {isSavingImages ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        </section>

        <section className="flex flex-col gap-8 border-t pt-8">
          <div className="flex flex-col gap-3">
            <h2 className="text-2xl font-semibold">Search behavior</h2>
            <p className="text-sm text-muted-foreground">
              Configure how the search dropdown behaves when there's no search
              query.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                className="rounded"
                id="show-random-words"
                checked={showRandomWords}
                onCheckedChange={(checked) => {
                  setShowRandomWords(checked as boolean);
                }}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="show-random-words"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Show random words when search is empty
                </Label>
                <p className="text-[13px] text-muted-foreground">
                  When enabled, the search dropdown will show random words when
                  you haven't typed anything. When disabled, the dropdown will
                  be empty until you start typing.
                </p>
              </div>
            </div>

            <Button
              className="w-fit"
              onClick={async () => {
                try {
                  setIsSavingRandomWords(true);
                  localStorage.setItem(
                    SHOW_RANDOM_WORDS_KEY,
                    showRandomWords.toString()
                  );
                  setSavedShowRandomWords(showRandomWords);
                  toast.success("Random words preference saved!");
                } catch (error) {
                  toast.error("Failed to save random words preference");
                } finally {
                  setIsSavingRandomWords(false);
                }
              }}
              disabled={
                isSavingRandomWords || showRandomWords === savedShowRandomWords
              }
            >
              {isSavingRandomWords ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        </section>

        <section className="flex flex-col gap-5 border-t pt-8">
          <div className="flex flex-col gap-3">
            <h2 className="text-2xl font-semibold text-destructive">
              Delete Account
            </h2>
            <p className="text-sm text-muted-foreground">
              This will permanently delete your account, profile data, and
              remove all your information from our servers.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Button
              variant="destructive"
              className="w-fit"
              onClick={() => setShowDeleteDialog(true)}
            >
              Delete Account
            </Button>
          </div>
        </section>
      </div>

      <DeleteAccountDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        userEmail={session?.user?.email}
      />
    </main>
  );
}
