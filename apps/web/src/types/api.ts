import { InferSelectModel } from "drizzle-orm";
import { words, definitions, examples } from "@/lib/db/schema";

// Basic types from our schema
type Word = InferSelectModel<typeof words>;
type Definition = InferSelectModel<typeof definitions>;
type Example = InferSelectModel<typeof examples>;

// The shape we return from our API
export type WordResponse = {
  word: string;
  details: {
    definitions: Array<{
      text: string;
      examples: string[];
    }>;
  };
};

export type SearchWordsResponse = {
  words: string[];
  totalCount: number;
};

export type AIUsageResponse = {
  current: number;
  limit: number;
  plan: "free" | "plus";
  nextReset: string;
};

// Base API error type
export type APIErrorBase = {
  message: string;
  status: number;
};

// Specific error types
export type AIError = APIErrorBase & {
  code: "AUTH_REQUIRED" | "SUBSCRIPTION_LIMIT_REACHED" | "RATE_LIMIT_EXCEEDED";
  usage?: AIUsageResponse;
};

export type WordError = APIErrorBase & {
  code: "WORD_NOT_FOUND" | "INVALID_WORD";
};

export type ValidationError = APIErrorBase & {
  code: "VALIDATION_ERROR";
  errors: Record<string, string[]>;
};

// Union type for all possible API errors
export type APIError = AIError | WordError | ValidationError;

// Helper type for our internal use
export type WordWithRelations = Word & {
  definitions: Array<
    Definition & {
      examples: Example[];
    }
  >;
};
