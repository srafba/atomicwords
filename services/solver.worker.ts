/**
 * solver.worker.ts
 * Runs the O(N×M) anagram solver off the main thread so it never blocks the UI.
 * Vite module worker — imported with `?worker` suffix.
 */
import { dictionary as DEFAULT_DICTIONARY } from './dictionary';

// Stable Sets that live in the worker thread
const defaultSet = new Set<string>(DEFAULT_DICTIONARY);
let largeSet = new Set<string>();
let customSet = new Set<string>();

// ---- helpers ----

const buildMasterFreq = (master: string): Record<string, number> => {
  const freq: Record<string, number> = {};
  for (const ch of master) freq[ch] = (freq[ch] || 0) + 1;
  return freq;
};

const isSpellable = (
  word: string,
  masterFreq: Record<string, number>,
  minLen: number,
  maxLen: number,
  master: string
): boolean => {
  if (word.length < minLen || word.length > maxLen || word === master) return false;
  const freq: Record<string, number> = {};
  for (const ch of word) {
    freq[ch] = (freq[ch] || 0) + 1;
    if (!masterFreq[ch] || freq[ch] > masterFreq[ch]) return false;
  }
  return true;
};

const solve = (master: string, minLength: number): string[] => {
  const masterWord = master.toUpperCase().trim();
  const masterFreq = buildMasterFreq(masterWord);
  const maxLen = masterWord.length;
  const results = new Set<string>();

  for (const w of defaultSet) {
    if (isSpellable(w, masterFreq, minLength, maxLen, masterWord)) results.add(w);
  }
  for (const w of customSet) {
    if (isSpellable(w, masterFreq, minLength, maxLen, masterWord)) results.add(w);
  }
  for (const w of largeSet) {
    if (isSpellable(w, masterFreq, minLength, maxLen, masterWord)) results.add(w);
  }

  return Array.from(results).sort((a, b) => b.length - a.length || a.localeCompare(b));
};

// ---- message handler ----

self.onmessage = (e: MessageEvent) => {
  const { type } = e.data;

  if (type === 'UPDATE_LARGE') {
    largeSet = new Set<string>(e.data.words as string[]);
    self.postMessage({ type: 'LARGE_READY', size: largeSet.size });
    return;
  }

  if (type === 'UPDATE_CUSTOM') {
    customSet = new Set<string>(e.data.words as string[]);
    self.postMessage({ type: 'CUSTOM_READY' });
    return;
  }

  if (type === 'SOLVE') {
    const { id, master, minLength } = e.data as { id: string; master: string; minLength: number };
    const words = solve(master, minLength);
    self.postMessage({ type: 'RESULT', id, words });
    return;
  }
};
