import { InferSelectModel } from "drizzle-orm";
import { words, definitions, examples } from "@/lib/db/schema";

// Basic types from our schema
type Word = InferSelectModel<typeof words>;
type Definition = InferSelectModel<typeof definitions>;
type Example = InferSelectModel<typeof examples>;

// The shape we return from our API
export type WordResponse = {
  id: string;
  word: string;
  details: {
    definitions: Array<{
      text: string;
      examples: string[];
    }>;
  };
};

export type WordSocialResponse = {
  votes: number;
  hasVoted: boolean;
  isSaved: boolean;
  hasReported: boolean;
};

export type SearchWordsResponse = {
  words: string[];
  totalCount: number;
};

// Response type for AI usage data
export type AIUsageResponse = {
  current: number;
  limit: number;
  plan: "free" | "plus";
  nextReset: string;
};

// Response type for word lookup usage data
export type WordUsageResponse = {
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
  code:
    | "AUTH_REQUIRED"
    | "SUBSCRIPTION_LIMIT_REACHED"
    | "RATE_LIMIT_EXCEEDED"
    | "INTERNAL_SERVER_ERROR"
    | "ALREADY_VOTED"
    | "UNSPLASH_API_ERROR"
    | "AI_GENERATION_ERROR";
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
export type APIError =
  | AIError
  | WordError
  | ValidationError
  | {
      code: "FEEDBACK_ERROR";
      message: string;
      status: number;
    }
  | {
      code: "WORD_ALREADY_EXISTS";
      message: string;
      status: number;
    };

// Helper type for our internal use
export type WordWithRelations = Word & {
  definitions: Array<
    Definition & {
      examples: Example[];
    }
  >;
};

export type WordFeedback = {
  id: string;
  message: string;
  status: "pending" | "reviewed" | "resolved";
  createdAt: string;
  user: {
    name: string;
  };
};

export type WordFeedbackResponse = {
  feedback: WordFeedback[];
};
