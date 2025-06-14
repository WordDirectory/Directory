export const AI_INITIAL_MESSAGE_KEY = "ai-initial-message";
export const DEFAULT_INITIAL_MESSAGE = 'Explain the word "{word}"';

export const HEAR_EXAMPLES_BEHAVIOR_KEY = "hear-examples-behavior";
export const HEAR_EXAMPLES_BEHAVIORS = ["hear-examples", "youglish"] as const;
export type HearExamplesBehavior = (typeof HEAR_EXAMPLES_BEHAVIORS)[number];
export const DEFAULT_HEAR_EXAMPLES_BEHAVIOR: HearExamplesBehavior =
  "hear-examples";

export const SHOW_IMAGES_KEY = "show-images";

export const SMART_IMAGE_OPEN_KEY = "smart-image-open";
export const SMART_IMAGE_OPEN_OPTIONS = ["smart", "always"] as const;
export type SmartImageOpenBehavior = (typeof SMART_IMAGE_OPEN_OPTIONS)[number];
export const DEFAULT_SMART_IMAGE_OPEN: SmartImageOpenBehavior = "smart";

export const SHOW_RANDOM_WORDS_KEY = "show-random-words";
export const DEFAULT_SHOW_RANDOM_WORDS = true;
