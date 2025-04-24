export type TWordDefinition = {
  text: string;
  image?: string; // Optional URL to an image illustrating the definition
  examples: string[];
};

export type TWord = {
  definitions: Array<TWordDefinition>;
};

export type TDictionary = Record<string, TWord>;
