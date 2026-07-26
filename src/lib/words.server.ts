import { WORD_STRING } from "../data/words";

// Cache the Set in globalThis so that Next.js HMR in development 
// doesn't recreate it on every API request.
const globalForWords = globalThis as unknown as {
  __WORDS_SET: Set<string> | undefined;
};

if (!globalForWords.__WORDS_SET) {
  globalForWords.__WORDS_SET = new Set(WORD_STRING.split(","));
}

export function getWordSet(): Set<string> {
  return globalForWords.__WORDS_SET!;
}
