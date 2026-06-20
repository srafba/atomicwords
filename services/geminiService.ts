import { GoogleGenAI, Type } from "@google/genai";
import { getRandomLevel, solveAtomicLevel, WordLevel } from "./wordLevels";

// Lazy-initialized Gemini configuration
let aiInstance: GoogleGenAI | null = null;

const getAi = (): GoogleGenAI | null => {
  if (aiInstance) return aiInstance;
  
  // Accept standard environment keys
  const apiKey = (typeof process !== 'undefined' && process.env) 
    ? (process.env.GEMINI_API_KEY || process.env.API_KEY)
    : undefined;

  if (apiKey) {
    try {
      aiInstance = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      return aiInstance;
    } catch (e) {
      console.warn("Could not initiate GoogleGenAI:", e);
    }
  }
  return null;
};

/**
 * Generate a dynamic thematic level from Gemini
 * If offline or key not provided, gracefully falls back to a gorgeous local offline level
 */
export const generateGameLevel = async (customTheme?: string): Promise<WordLevel> => {
  const ai = getAi();
  if (!ai) {
    console.log("No API key detected, serving high-fidelity offline thematic level.");
    return getRandomLevel();
  }

  const theme = customTheme || ["Atoms", "Quantum physics", "Energy particles", "Star fusion", "Catalysts", "Molecular gravity", "Cosmic dust"][Math.floor(Math.random() * 7)];
  
  try {
    const prompt = `
      You are the Atomic AI level builder for "Atomic Words".
      Your mission is to generate a beautiful, playable word level based on the theme: "${theme}".

      Instructions:
      1. Choose one interesting, highly-recognizable English master word of 7 to 11 letters related to the theme or atomic science (e.g., QUANTUM, COVALENT, FUSION, SCIENTIFIC).
      2. Provide an educational, highly engaging 1-sentence scientific fun fact or connection about how this word fits the atom/quantum/energy theme.
      
      Return ONLY a direct JSON object conforming EXACTLY to the schema. Do not output markdown wrapping, comments, or extra text.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            masterWord: {
              type: Type.STRING,
              description: "A single solid English word in CAPITAL letters. E.g., 'MOLECULAR'"
            },
            theme: {
              type: Type.STRING,
              description: "Short descriptive sub-theme, e.g. 'Thermodynamics'"
            },
            funFact: {
              type: Type.STRING,
              description: "Engaging 1-sentence fun fact about this word's link to chemistry or physics."
            }
          },
          required: ["masterWord", "theme", "funFact"]
        }
      }
    });

    if (response.text) {
      const parsed = JSON.parse(response.text.trim());
      const masterWord = parsed.masterWord.toUpperCase().replace(/[^A-Z]/g, '');
      
      if (masterWord && masterWord.length >= 6) {
        // Automatically solve it locally with our 1,500-word vocabulary to guarantee
        // the client has a 100% accurate, cheat-proof, instantly verifiable array of subwords!
        const subWords = await solveAtomicLevel(masterWord);
        
        // If our solver finds too few words, we fallback to ensure excellent gameplay
        if (subWords.length >= 8) {
          return {
            masterWord,
            theme: parsed.theme || theme,
            subWords,
            funFact: parsed.funFact
          };
        }
      }
    }
  } catch (error) {
    console.error("Gemini levels builder failed or timed out, fallback to local database", error);
  }

  return getRandomLevel();
};

/**
 * Fetch a beautiful scientific definition / capsule for a word
 */
export const getWordScienceCapsule = async (word: string, masterWord: string): Promise<string> => {
  const ai = getAi();
  if (!ai) {
    return `Formed from letters of ${masterWord}! Great wordplay!`;
  }

  try {
    const prompt = `Give a short, ultra-friendly, 1-sentence definition or chemistry/physics twist for the word "${word.toUpperCase()}" (which was formed from the letters of "${masterWord.toUpperCase()}"). Keep it under 15 words.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    if (response.text) {
      return response.text.trim();
    }
  } catch (e) {
    // Fail silently with generic greeting
  }
  return `Spelled elegantly using letters from "${masterWord}"`;
};
