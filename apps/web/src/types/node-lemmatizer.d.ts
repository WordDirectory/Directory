declare module 'node-lemmatizer' {
  function only_lemmas(word: string, pos?: 'verb' | 'noun' | 'adj' | 'adv'): string[];
  export default { only_lemmas };
} 