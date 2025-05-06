// Basic lemmatizer implementation
// This is a simplified version that handles common word forms

const verbEndings = ['s', 'es', 'ed', 'ing'];
const nounEndings = ['s', 'es'];

function removeEnding(word: string, ending: string): string {
  if (word.endsWith(ending)) {
    return word.slice(0, -ending.length);
  }
  return word;
}

function getLemmas(word: string, type: 'verb' | 'noun'): string[] {
  const endings = type === 'verb' ? verbEndings : nounEndings;
  const lemmas = new Set<string>();
  
  // Add original word
  lemmas.add(word);
  
  // Try removing each ending
  for (const ending of endings) {
    if (word.endsWith(ending)) {
      const base = removeEnding(word, ending);
      if (base.length > 2) { // Only add if resulting word is long enough
        lemmas.add(base);
      }
    }
  }
  
  return Array.from(lemmas);
}

export function only_lemmas(word: string, type: 'verb' | 'noun'): string[] {
  return getLemmas(word.toLowerCase(), type);
}

export default {
  only_lemmas
}; 