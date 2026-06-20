import { dictionary as DEFAULT_DICTIONARY } from './dictionary';
import { GoogleGenAI } from "@google/genai";
import { updateWorkerLargeDictionary, updateWorkerCustomDictionary } from './workerService';

const STORAGE_CUSTOM_DICT_KEY = 'atomic_custom_dictionary';
const STORAGE_MIN_LEN_KEY = 'atomic_min_word_length';
const STORAGE_ANALYTICS_KEY = 'atomic_dict_analytics';

// --- Stable module-level Sets (built once, never rebuilt on lookups) ---

/** Default dictionary as a Set — built once at module load time. */
const defaultDictionarySet: Set<string> = new Set(DEFAULT_DICTIONARY);

/** Large CDN Scrabble dictionary (~270k words), populated after async load. */
let largeDictionarySet: Set<string> = new Set();

/** In-memory cache for the custom dictionary. null = not yet loaded from localStorage. */
let customDictionaryCache: string[] | null = null;
/** Set view of customDictionaryCache for O(1) lookups. */
let customDictionarySet: Set<string> | null = null;

/** Invalidate the custom dictionary cache (call after import or reset). */
const invalidateCustomDictionaryCache = () => {
  customDictionaryCache = null;
  customDictionarySet = null;
};

/** Load and cache the custom dictionary from localStorage (once per session or after invalidation). */
const loadCustomDictionaryCache = (): { arr: string[]; set: Set<string> } => {
  if (customDictionaryCache !== null && customDictionarySet !== null) {
    return { arr: customDictionaryCache, set: customDictionarySet };
  }
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_DICT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        customDictionaryCache = parsed as string[];
        customDictionarySet = new Set(customDictionaryCache);
        return { arr: customDictionaryCache, set: customDictionarySet };
      }
    }
  } catch (e) {
    console.error("Error reading custom dictionary, fallback to default", e);
  }
  // No custom dict — cache the default so we don't re-parse localStorage repeatedly
  customDictionaryCache = DEFAULT_DICTIONARY;
  customDictionarySet = defaultDictionarySet;
  return { arr: customDictionaryCache, set: customDictionarySet };
};

let dictionaryLoadStatus: "idle" | "loading" | "loaded" | "failed" = "idle";
let dictionaryUrlsAttemptedCount = 0;

// Callbacks for dictionary updates (for hot levels re-solving)
type DictionaryUpdateCallback = (wordCount: number) => void;
const dictionaryListeners: Set<DictionaryUpdateCallback> = new Set();

export const subscribeToDictionaryUpdates = (cb: DictionaryUpdateCallback) => {
  dictionaryListeners.add(cb);
  if (dictionaryLoadStatus === "loaded") {
    cb(largeDictionarySet.size);
  }
  return () => {
    dictionaryListeners.delete(cb);
  };
};

const notifyDictionaryListeners = (count: number) => {
  dictionaryListeners.forEach(listener => {
    try {
      listener(count);
    } catch (e) {
      console.error("Error in dictionary listener callback:", e);
    }
  });
};

// Heuristics cache for verified custom words
const positiveAIWordCache = new Set<string>();

/**
 * Direct links to production Scrabble / SOWPODS / high-quality English dictionaries
 * Github Raw CDN permits dynamic CORS fetches directly inside the browser sandbox!
 */
const PRODUCTION_DICTIONARY_URLS = [
  "https://raw.githubusercontent.com/raun/Scrabble/master/words.txt", // ~270,000 words (ideal Scrabble dictionary)
  "https://raw.githubusercontent.com/redbo/scrabble/master/dictionary.txt", // ~267,000 SOWPODS words
  "https://raw.githubusercontent.com/eneko/github-scrabble/master/dictionary.txt", // Standard English Lexicon
];

/**
 * Safe Lazy Initialization for Gemini AI Confidence check
 */
const getAiForValidation = (): GoogleGenAI | null => {
  const apiKey = (typeof process !== 'undefined' && process.env)
    ? (process.env.GEMINI_API_KEY || process.env.API_KEY)
    : undefined;

  if (apiKey) {
    try {
      return new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    } catch (e) {
      console.warn("Could not initiate GoogleGenAI for validation:", e);
    }
  }
  return null;
};

/**
 * Asynchronous non-blocking background dictionary loader.
 * Triggers at startup, trying multiple sources till success.
 */
export const startBackgroundDictionaryLoad = async () => {
  if (dictionaryLoadStatus === "loading" || dictionaryLoadStatus === "loaded") return;
  
  dictionaryLoadStatus = "loading";
  
  for (const url of PRODUCTION_DICTIONARY_URLS) {
    dictionaryUrlsAttemptedCount++;
    try {
      console.log(`[DictionaryService] Initiating fetch for production wordlist from: ${url}`);
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP Error Status: ${response.status}`);
      
      const text = await response.text();
      // Split by any newline format
      const words = text.split(/\r?\n/);
      
      const parsedSet = new Set<string>();
      for (const w of words) {
        const trimmed = w.trim().toUpperCase().replace(/[^A-Z]/g, '');
        if (trimmed.length >= 2) {
          parsedSet.add(trimmed);
        }
      }

      if (parsedSet.size > 10000) {
        largeDictionarySet = parsedSet;
        dictionaryLoadStatus = "loaded";
        console.log(`[DictionaryService] Successfully loaded comprehensive offline dictionary with ${largeDictionarySet.size} global words.`);
        // Push to the solver worker so it can use the full dictionary off-thread
        updateWorkerLargeDictionary(Array.from(largeDictionarySet));
        notifyDictionaryListeners(largeDictionarySet.size);
        return;
      }
    } catch (e) {
      console.warn(`[DictionaryService] Failed to load from CDN source ${dictionaryUrlsAttemptedCount}:`, e);
    }
  }
  
  dictionaryLoadStatus = "failed";
  console.log("[DictionaryService] Background CDN fetch failed, standard localized dictionary remains active.");
};

/**
 * Retrieve active baseline dictionary loaded locally, including custom overrides stored in browser.
 * Returns a cached result — no localStorage read on repeated calls.
 */
export const getActiveDictionary = (): string[] => {
  return loadCustomDictionaryCache().arr;
};

/**
 * Check if word list includes the test word, incorporating large dictionaries.
 * Uses stable module-level Sets — O(1) per lookup, no allocations.
 */
export const isWordInAnyDictionary = (w: string): boolean => {
  const word = w.toUpperCase().trim();
  if (!word) return false;

  // 1. Fastest: check the large CDN set first (270k+), already a Set<string>
  if (largeDictionarySet.has(word)) return true;

  // 2. Check stable default set (built once at module load)
  if (defaultDictionarySet.has(word)) return true;

  // 3. Check custom dictionary set (cached, built once per session)
  const { set: customSet } = loadCustomDictionaryCache();
  if (customSet !== defaultDictionarySet && customSet.has(word)) return true;

  // 4. Check AI-verified word cache
  if (positiveAIWordCache.has(word)) return true;

  return false;
};

/**
 * Import a new custom local list from user paste (supports CSV, TXT, JSON)
 */
export const importCustomDictionary = (rawText: string): { success: boolean; count: number; message: string } => {
  let words: string[] = [];
  const trimmed = rawText.trim();
  
  // JSON array uploader
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        words = parsed.map(String);
      }
    } catch (e) {
      // Ignored, proceed to other formats
    }
  }
  
  // CSV, semicolon, comma or space delimited
  if (words.length === 0) {
    words = rawText.split(/[,\n;\r\t]+/)
      .map(w => w.trim())
      .filter(w => w.length > 0);
  }
  
  const cleanedWords = Array.from(
    new Set(
      words
        .map(w => w.toUpperCase().replace(/[^A-Z]/g, ''))
        .filter(w => w.length >= 2)
    )
  );
  
  if (cleanedWords.length === 0) {
    return { success: false, count: 0, message: "No valid English words of at least 2 letters found in input." };
  }
  
  try {
    localStorage.setItem(STORAGE_CUSTOM_DICT_KEY, JSON.stringify(cleanedWords));
    // Invalidate in-memory caches so next lookup re-reads the new list
    invalidateCustomDictionaryCache();
    positiveAIWordCache.clear();
    // Sync custom dict to the solver worker
    updateWorkerCustomDictionary(cleanedWords);
    return {
      success: true,
      count: cleanedWords.length,
      message: `Successfully loaded offline dictionary with ${cleanedWords.length} words.`
    };
  } catch (e) {
    return { success: false, count: 0, message: "Storage quota exceeded! List is too large." };
  }
};

/**
 * Clear user overrides and return to the default dictionary pool
 */
export const resetDictionaryToDefault = () => {
  localStorage.removeItem(STORAGE_CUSTOM_DICT_KEY);
  invalidateCustomDictionaryCache();
  positiveAIWordCache.clear();
};

/**
 * Check if the trial word is spelling-compliant using candidate letters (checks anagram constraints)
 */
export const canWordBeFormed = (word: string, master: string): boolean => {
  const masterWord = master.toUpperCase().trim();
  const wordToTest = word.toUpperCase().trim();
  
  if (!masterWord || !wordToTest) return false;
  
  const masterFreq: Record<string, number> = {};
  for (const char of masterWord) {
    masterFreq[char] = (masterFreq[char] || 0) + 1;
  }
  
  const wordFreq: Record<string, number> = {};
  for (const char of wordToTest) {
    wordFreq[char] = (wordFreq[char] || 0) + 1;
    if (!masterFreq[char] || wordFreq[char] > masterFreq[char]) {
      return false;
    }
  }
  return true;
};

/**
 * Check if word exists inside standard localized dictionary
 */
export const isWordInDictionary = (w: string): boolean => {
  return isWordInAnyDictionary(w);
};

/**
 * Tests a single word against a pre-built master frequency map.
 * Extracted so we can reuse it across multiple Set iterations without closure overhead.
 */
const testWordAgainstFreq = (
  word: string,
  masterFreq: Record<string, number>,
  minLength: number,
  maxLength: number,
  masterWord: string
): boolean => {
  if (word.length < minLength || word.length > maxLength || word === masterWord) return false;
  const wordFreq: Record<string, number> = {};
  for (const char of word) {
    wordFreq[char] = (wordFreq[char] || 0) + 1;
    if (!masterFreq[char] || wordFreq[char] > masterFreq[char]) return false;
  }
  return true;
};

/**
 * High-Performance offline solver which parses through the loaded dictionary index.
 * Evaluates words against the master character set using stable module-level Sets —
 * no new Set construction, no spreading 270k arrays on every call.
 */
export const solveAnagrams = (master: string, minLength: number = 3): string[] => {
  const masterWord = master.toUpperCase().trim();
  const masterFreq: Record<string, number> = {};
  for (const char of masterWord) {
    masterFreq[char] = (masterFreq[char] || 0) + 1;
  }

  const maxLength = masterWord.length;
  const resultSet = new Set<string>(); // deduplicate across dictionary sources

  // Iterate each stable Set directly — no spreading, no allocations
  const { set: customSet } = loadCustomDictionaryCache();

  for (const word of defaultDictionarySet) {
    if (testWordAgainstFreq(word, masterFreq, minLength, maxLength, masterWord)) {
      resultSet.add(word);
    }
  }

  // Only iterate custom dict if it's actually different from the default
  if (customSet !== defaultDictionarySet) {
    for (const word of customSet) {
      if (testWordAgainstFreq(word, masterFreq, minLength, maxLength, masterWord)) {
        resultSet.add(word);
      }
    }
  }

  // Large CDN dictionary (may be empty before load completes — that's fine)
  for (const word of largeDictionarySet) {
    if (testWordAgainstFreq(word, masterFreq, minLength, maxLength, masterWord)) {
      resultSet.add(word);
    }
  }

  return Array.from(resultSet).sort((a, b) => b.length - a.length || a.localeCompare(b));
};

export const getMinWordLength = (): number => {
  const saved = localStorage.getItem(STORAGE_MIN_LEN_KEY);
  return saved ? parseInt(saved, 10) : 3;
};

export const setMinWordLength = (len: number) => {
  if (len === 2 || len === 3 || len === 4) {
    localStorage.setItem(STORAGE_MIN_LEN_KEY, len.toString());
  }
};

/**
 * Live validation check using the Google Gemini model. Uses generative intelligence
 * to quickly determine if an obscure word is indeed a valid English word.
 */
export const validateWordWithAI = async (word: string): Promise<boolean> => {
  const ai = getAiForValidation();
  if (!ai) return false;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Is the word "${word.toUpperCase()}" a legitimate, real, accepted Scrabble-style English word? Answer only in one word: YES or NO.`
    });
    const parsedText = response.text ? response.text.toUpperCase().trim() : "";
    if (parsedText.includes("YES")) {
      positiveAIWordCache.add(word.toUpperCase());
      return true;
    }
    return false;
  } catch (e) {
    console.error("AI word validation failed", e);
    return false;
  }
};

/**
 * Dictionary Confidence System validation engine.
 * Strips plural cases, past tense endings, checks standard Scrabble variants, and offers Gemini fallbacks.
 */
export interface ConfidenceValidationResult {
  valid: boolean;
  reason: string;
  source: string;
}

export const checkWordWithConfidenceSystem = async (
  word: string,
  master: string,
  minWordLen: number,
  allowAIFallback: boolean = false
): Promise<ConfidenceValidationResult> => {
  const testWord = word.toUpperCase().trim();
  
  // 1. Minimum length constraint
  if (testWord.length < minWordLen) {
    return { valid: false, reason: `Word is too short (Minimum is ${minWordLen} letters)`, source: "Constraint Engine" };
  }
  
  // 2. Anagram match check
  if (!canWordBeFormed(testWord, master)) {
    return { valid: false, reason: "Cannot be formed from current letters", source: "Character Frequency Matrix" };
  }

  // 3. Exact matching in loaded dictionaries
  if (isWordInAnyDictionary(testWord)) {
    return { valid: true, reason: "Accepted", source: "Production Dictionary" };
  }

  // 4. Heuristic singular/plural variations check
  // Regular plural endings: "-S" (CATS -> CAT)
  if (testWord.endsWith("S") && testWord.length > 2) {
    const singular = testWord.slice(0, -1);
    if (isWordInAnyDictionary(singular)) {
      positiveAIWordCache.add(testWord);
      return { valid: true, reason: `Accepted (Plural form of ${singular})`, source: "Plural Heuristics" };
    }
  }

  // Double plurals ending in "-ES" (BOXES -> BOX)
  if (testWord.endsWith("ES") && testWord.length > 3) {
    const singular = testWord.slice(0, -2);
    if (isWordInAnyDictionary(singular)) {
      positiveAIWordCache.add(testWord);
      return { valid: true, reason: `Accepted (Multiple variant: ${singular})`, source: "Plural Heuristics" };
    }
  }

  // Plurals ending in "-IES" (FLIES -> FLY)
  if (testWord.endsWith("IES") && testWord.length > 4) {
    const singular = testWord.slice(0, -3) + "Y";
    if (isWordInAnyDictionary(singular)) {
      positiveAIWordCache.add(testWord);
      return { valid: true, reason: `Accepted (Modern plural: ${singular})`, source: "Plural Heuristics" };
    }
  }

  // 5. Heuristic verb conjugation variations check
  // Past tense ending in "-ED" (PLAYED -> PLAY or BAKED -> BAKE)
  if (testWord.endsWith("ED") && testWord.length > 3) {
    const stem1 = testWord.slice(0, -1); // e.g. BAKED -> BAKE
    const stem2 = testWord.slice(0, -2); // e.g. PLAYED -> PLAY
    if (isWordInAnyDictionary(stem1)) {
      positiveAIWordCache.add(testWord);
      return { valid: true, reason: `Accepted (Verb past form: ${stem1})`, source: "Verb Stem Heuristics" };
    }
    if (isWordInAnyDictionary(stem2)) {
      positiveAIWordCache.add(testWord);
      return { valid: true, reason: `Accepted (Verb past form: ${stem2})`, source: "Verb Stem Heuristics" };
    }
  }

  // Participle ending in "-ING" (PLAYING -> PLAY or BAKING -> BAKE)
  if (testWord.endsWith("ING") && testWord.length > 4) {
    const stem1 = testWord.slice(0, -3); // e.g. PLAYING -> PLAY
    const stem2 = testWord.slice(0, -3) + "E"; // e.g. BAKING -> BAKE
    if (isWordInAnyDictionary(stem1)) {
      positiveAIWordCache.add(testWord);
      return { valid: true, reason: `Accepted (Verb continuous: ${stem1})`, source: "Verb Stem Heuristics" };
    }
    if (isWordInAnyDictionary(stem2)) {
      positiveAIWordCache.add(testWord);
      return { valid: true, reason: `Accepted (Verb continuous: ${stem2})`, source: "Verb Stem Heuristics" };
    }
  }

  // 6. Search alternative online/AI sources using active Gemini
  if (allowAIFallback) {
    const isValidByAI = await validateWordWithAI(testWord);
    if (isValidByAI) {
      return { valid: true, reason: "Accepted (Validated by Gemini source)", source: "Gemini AI Fallback" };
    }
  }

  // No source can justify this word
  return { valid: false, reason: "Not found in dictionary", source: "Confidence Exhaustion" };
};

/**
 * Local Analytics structure tracker
 */
export interface DictionaryAnalytics {
  rejectedWords: Record<string, { count: number; lastReason: string; source: string }>;
  userComplaints: Record<string, { count: number; timestamp: number }>;
  attemptedWords: Record<string, number>;
}

export const getAnalytics = (): DictionaryAnalytics => {
  try {
    const saved = localStorage.getItem(STORAGE_ANALYTICS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Failed to read dictionary analytics", e);
  }
  return { rejectedWords: {}, userComplaints: {}, attemptedWords: {} };
};

/** In-memory analytics buffer — flushed to localStorage at most once per 2 seconds. */
let analyticsBuffer: DictionaryAnalytics | null = null;
let analyticsFlushTimer: ReturnType<typeof setTimeout> | null = null;

const flushAnalytics = () => {
  if (!analyticsBuffer) return;
  try {
    localStorage.setItem(STORAGE_ANALYTICS_KEY, JSON.stringify(analyticsBuffer));
  } catch (e) {
    console.error("Failed to save dictionary analytics", e);
  }
  analyticsFlushTimer = null;
};

export const saveAnalytics = (analytics: DictionaryAnalytics) => {
  analyticsBuffer = analytics;
  if (!analyticsFlushTimer) {
    analyticsFlushTimer = setTimeout(flushAnalytics, 2000);
  }
};

/**
 * Log word attempt
 */
export const logWordAttempt = (word: string, isValid: boolean, reason: string = "", source: string = "") => {
  const norm = word.toUpperCase().trim();
  if (!norm) return;
  const analytics = getAnalytics();
  analytics.attemptedWords[norm] = (analytics.attemptedWords[norm] || 0) + 1;
  if (!isValid) {
    const current = analytics.rejectedWords[norm] || { count: 0, lastReason: "", source: "" };
    analytics.rejectedWords[norm] = { count: current.count + 1, lastReason: reason, source: source || "Default Constraint" };
  }
  saveAnalytics(analytics);
};

/**
 * Log user complaint for a word that was rejected
 */
export const logUserComplaint = (word: string) => {
  const norm = word.toUpperCase().trim();
  if (!norm) return;
  const analytics = getAnalytics();
  const current = analytics.userComplaints[norm] || { count: 0, timestamp: 0 };
  analytics.userComplaints[norm] = { count: current.count + 1, timestamp: Date.now() };
  saveAnalytics(analytics);
  console.log(`[Analytics] Received complaint for "${norm}". Complaint count is now ${analytics.userComplaints[norm].count}`);
};

/**
 * Clear analytics log
 */
export const clearAnalytics = () => {
  const analytics: DictionaryAnalytics = { rejectedWords: {}, userComplaints: {}, attemptedWords: {} };
  saveAnalytics(analytics);
};

/**
 * Determine loaded dictionary size metric
 */
export const getLoadedDictionarySize = (): number => {
  return getActiveDictionary().length + largeDictionarySet.size;
};
