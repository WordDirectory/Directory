"use client";

import { useState } from "react";
import {
  Plus,
  Minus,
  Save,
  BookOpen,
  Loader2,
  Sparkles,
  Edit3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { APIError, ValidationError } from "@/types/api";

interface Example {
  id: string;
  text: string;
}

interface Definition {
  id: string;
  text: string;
  examples: Example[];
}

interface WordForm {
  word: string;
  definitions: Definition[];
}

interface GeneratedDefinition {
  text: string;
  examples: string[];
}

interface GenerateResponse {
  word: string;
  definitions: GeneratedDefinition[];
  source: string;
  merged: boolean;
  existingCount: number;
}

export default function AdminPage() {
  const [word, setWord] = useState("");
  const [form, setForm] = useState<WordForm>({
    word: "",
    definitions: [],
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerate = async () => {
    if (!word.trim()) {
      toast.error("Please enter a word to generate definitions");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/admin/generate-word", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ word: word.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        const error = data as APIError | ValidationError;

        if (error.code === "VALIDATION_ERROR") {
          const validationError = error as ValidationError;
          Object.entries(validationError.errors).forEach(
            ([field, messages]) => {
              messages.forEach((message) => {
                toast.error(`${field}: ${message}`);
              });
            }
          );
          return;
        }

        toast.error("Failed to generate definitions", {
          description: error.message || "An unexpected error occurred",
        });
        return;
      }

      const generateResponse = data.data as GenerateResponse;

      // Convert generated data to form format
      const formDefinitions: Definition[] = generateResponse.definitions.map(
        (def, index) => ({
          id: `gen-${index}`,
          text: def.text,
          examples: def.examples.map((ex, exIndex) => ({
            id: `ex-${index}-${exIndex}`,
            text: ex,
          })),
        })
      );

      setForm({
        word: generateResponse.word,
        definitions: formDefinitions,
      });

      setHasGenerated(true);

      if (generateResponse.merged) {
        toast.success("Definitions generated and merged!", {
          description: `AI merged ${generateResponse.existingCount} existing definitions with new ones for "${generateResponse.word}"`,
        });
      } else {
        toast.success("Definitions generated!", {
          description: `AI created ${formDefinitions.length} definitions for "${generateResponse.word}"`,
        });
      }
    } catch (error) {
      console.error("Error generating word:", error);
      toast.error("Network error", {
        description: "Please check your connection and try again",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const addDefinition = () => {
    const newDefinition: Definition = {
      id: Date.now().toString(),
      text: "",
      examples: [{ id: Date.now().toString(), text: "" }],
    };
    setForm((prev) => ({
      ...prev,
      definitions: [...prev.definitions, newDefinition],
    }));
  };

  const removeDefinition = (definitionId: string) => {
    if (form.definitions.length === 1) return;
    setForm((prev) => ({
      ...prev,
      definitions: prev.definitions.filter((def) => def.id !== definitionId),
    }));
  };

  const updateDefinition = (definitionId: string, text: string) => {
    setForm((prev) => ({
      ...prev,
      definitions: prev.definitions.map((def) =>
        def.id === definitionId ? { ...def, text } : def
      ),
    }));
  };

  const addExample = (definitionId: string) => {
    const newExample: Example = {
      id: Date.now().toString(),
      text: "",
    };
    setForm((prev) => ({
      ...prev,
      definitions: prev.definitions.map((def) =>
        def.id === definitionId
          ? { ...def, examples: [...def.examples, newExample] }
          : def
      ),
    }));
  };

  const removeExample = (definitionId: string, exampleId: string) => {
    setForm((prev) => ({
      ...prev,
      definitions: prev.definitions.map((def) =>
        def.id === definitionId
          ? {
              ...def,
              examples: def.examples.filter((ex) => ex.id !== exampleId),
            }
          : def
      ),
    }));
  };

  const updateExample = (
    definitionId: string,
    exampleId: string,
    text: string
  ) => {
    setForm((prev) => ({
      ...prev,
      definitions: prev.definitions.map((def) =>
        def.id === definitionId
          ? {
              ...def,
              examples: def.examples.map((ex) =>
                ex.id === exampleId ? { ...ex, text } : ex
              ),
            }
          : def
      ),
    }));
  };

  const handleSave = async () => {
    if (!isFormValid()) {
      toast.error("Please fill out all fields");
      return;
    }

    setIsSaving(true);

    try {
      // Transform form data to match API schema
      const requestData = {
        word: form.word.trim(),
        definitions: form.definitions.map((def) => ({
          text: def.text.trim(),
          examples: def.examples.map((ex) => ex.text.trim()),
        })),
      };

      const response = await fetch("/admin/add-word", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        const error = data as APIError | ValidationError;

        if (error.code === "VALIDATION_ERROR") {
          const validationError = error as ValidationError;
          Object.entries(validationError.errors).forEach(
            ([field, messages]) => {
              messages.forEach((message) => {
                toast.error(`${field}: ${message}`);
              });
            }
          );
          return;
        }

        toast.error("Failed to add word", {
          description: error.message || "An unexpected error occurred",
        });
        return;
      }

      const responseData = data.data;

      toast.success("Word saved successfully!", {
        description: `"${form.word}" has been saved to the dictionary`,
      });

      // Reset everything
      setWord("");
      setForm({
        word: "",
        definitions: [],
      });
      setHasGenerated(false);
    } catch (error) {
      console.error("Error adding word:", error);
      toast.error("Network error", {
        description: "Please check your connection and try again",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid = () => {
    return (
      form.word.trim() !== "" &&
      form.definitions.length > 0 &&
      form.definitions.every((def) => def.text.trim() !== "") &&
      form.definitions.every((def) =>
        def.examples.every((ex) => ex.text.trim() !== "")
      )
    );
  };

  const handleReset = () => {
    setWord("");
    setForm({
      word: "",
      definitions: [],
    });
    setHasGenerated(false);
  };

  return (
    <main className="relative w-full overflow-hidden px-8">
      <div className="container mx-auto max-w-4xl py-12 md:py-20">
        <header className="mb-12 space-y-4">
          <div className="flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">AI Word Generator</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Enter a word and let AI create human-friendly definitions and
            examples.
          </p>
        </header>

        <div className="space-y-8">
          {/* Word Input & Generate */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Word to Define
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="word">Enter any word</Label>
                  <div className="flex gap-3">
                    <Input
                      id="word"
                      placeholder="e.g., serendipity, procrastinate, ubiquitous..."
                      value={word}
                      onChange={(e) => setWord(e.target.value)}
                      className="text-lg"
                      disabled={isGenerating}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !isGenerating) {
                          handleGenerate();
                        }
                      }}
                    />
                    <Button
                      onClick={handleGenerate}
                      disabled={!word.trim() || isGenerating}
                      className="gap-2 min-w-[140px]"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Generate
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                {hasGenerated && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="h-4 w-4" />
                    AI-generated definitions ready! You can edit them below
                    before saving.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Generated Definitions (only show after generation) */}
          {hasGenerated && form.definitions.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Edit3 className="h-5 w-5" />
                    Generated Definitions ({form.definitions.length})
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      onClick={addDefinition}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      disabled={isSaving}
                    >
                      <Plus className="h-4 w-4" />
                      Add Definition
                    </Button>
                    <Button
                      onClick={handleReset}
                      variant="ghost"
                      size="sm"
                      disabled={isSaving}
                    >
                      Start Over
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                {form.definitions.map((definition, defIndex) => (
                  <div key={definition.id} className="space-y-6">
                    {defIndex > 0 && <Separator />}

                    {/* Definition Header */}
                    <div className="flex items-start gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                        {defIndex + 1}
                      </div>
                      <div className="flex-1 space-y-4">
                        {/* Definition Text */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor={`definition-${definition.id}`}>
                              Definition {defIndex + 1}
                            </Label>
                            {form.definitions.length > 1 && (
                              <Button
                                onClick={() => removeDefinition(definition.id)}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                disabled={isSaving}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <Textarea
                            id={`definition-${definition.id}`}
                            placeholder="Write a clear, human-readable definition..."
                            value={definition.text}
                            onChange={(e) =>
                              updateDefinition(definition.id, e.target.value)
                            }
                            className="min-h-[80px]"
                            disabled={isSaving}
                          />
                        </div>

                        {/* Examples */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium text-muted-foreground">
                              Usage Examples ({definition.examples.length})
                            </Label>
                            <Button
                              onClick={() => addExample(definition.id)}
                              variant="outline"
                              size="sm"
                              className="gap-2"
                              disabled={isSaving}
                            >
                              <Plus className="h-3 w-3" />
                              Add Example
                            </Button>
                          </div>

                          <div className="grid gap-3 md:grid-cols-2">
                            {definition.examples.map((example, exIndex) => (
                              <div
                                key={example.id}
                                className="relative rounded-lg border bg-muted/30 p-4"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <Label
                                      htmlFor={`example-${example.id}`}
                                      className="text-xs text-muted-foreground"
                                    >
                                      Example {exIndex + 1}
                                    </Label>
                                    <Textarea
                                      id={`example-${example.id}`}
                                      placeholder="Show how this word is used in a sentence..."
                                      value={example.text}
                                      onChange={(e) =>
                                        updateExample(
                                          definition.id,
                                          example.id,
                                          e.target.value
                                        )
                                      }
                                      className="mt-1 min-h-[60px] border-0 bg-transparent p-0 focus-visible:ring-0"
                                      disabled={isSaving}
                                    />
                                  </div>
                                  {definition.examples.length > 1 && (
                                    <Button
                                      onClick={() =>
                                        removeExample(definition.id, example.id)
                                      }
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                      disabled={isSaving}
                                    >
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Save Section (only show after generation) */}
          {hasGenerated && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Ready to save?</p>
                    <p className="text-sm text-muted-foreground">
                      Review and edit the definitions before saving to the
                      dictionary.
                    </p>
                  </div>
                  <Button
                    onClick={handleSave}
                    disabled={!isFormValid() || isSaving}
                    size="lg"
                    className="gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Word
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
