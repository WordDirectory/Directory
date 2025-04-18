export type TWordDefinition = {
  text: string;
  image?: string; // Optional URL to an image illustrating the definition
};

export type TWord = {
  definitions: Array<TWordDefinition>;
  examples: string[];
  pronunciation: string;
};

export type TDictionary = Record<string, TWord>;
