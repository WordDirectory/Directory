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

export type APIError = {
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
