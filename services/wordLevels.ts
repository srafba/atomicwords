/**
 * Offline Word Level Data and Solver for Atomic Words
 */

import { solveAnagrams, getMinWordLength } from "./dictionaryService";

export interface WordLevel {
  masterWord: string;
  theme: string;
  subWords: string[]; // List of valid words that can be spelled from the master word
  funFact?: string;   // Atomic/scientific fun fact about the word
}

// Complete pre-solved offline levels with rich scientific and atomic themes!
export const OFFLINE_LEVELS: WordLevel[] = [
  {
    masterWord: "RADIOACTIVE",
    theme: "Nuclear Chemistry",
    subWords: [
      "ACTIVE", "ACTOR", "ADORE", "ADVICE", "AORTA", "AVOID", "CARVE", "CAVIAR", "CODER", "CRAVE", "CRATE",
      "DAIRY", "DECOR", "DIVA", "DRIVE", "DRCV", "IVORY", "RADIO", "RIDER", "RIVAL", "REACT", "TRICE", "VOICE", "VOTER",
      "ACID", "ACRE", "AIDE", "AVID", "CARD", "CARE", "CART", "CAVE", "CODE", "CORD", "CORE", "COTE", "COVE", "DARE",
      "DART", "DATE", "DEAR", "DIET", "DIRT", "DIVE", "DOCK", "DOME", "DOPE", "DOSE", "DOTS", "DRAB", "DRAG", "DRIP",
      "EDIT", "IDEA", "IORE", "OTIC", "RACK", "RAGE", "RAID", "RAIN", "RATE", "READ", "RETRO", "RIDE", "RIOT", "RITE", 
      "ROAD", "RODE", "VETO", "VICE", "VIDE", "VOID", "VOTE",
      "ACT", "ARC", "ART", "ATE", "CAD", "CAT", "COD", "COE", "COT", "DEV", "DIE", "DIR", "DOC", "DOT", "EAR", "EAT",
      "ERA", "ICE", "ION", "OAR", "OAT", "ODE", "ORE", "RAD", "RAT", "RED", "RET", "RID", "ROT", "TAR", "TEA", "TIE", 
      "TOE", "VAC", "VAT", "VIA"
    ],
    funFact: "Radioactive decay is the process by which an unstable atomic nucleus loses energy by radiation."
  },
  {
    masterWord: "CHEMISTRY",
    theme: "Molecular Science",
    subWords: [
      "CHIME", "CHIME", "CRIME", "CYSTIC", "ETHIC", "HYPES", "MERCY", "MERIT", "MIGHT", "MISTY", "MYSTIC", "RHYME", 
      "SHIRE", "SHIRT", "SIGHT", "SMITH", "SPICE", "SPIRE", "THEIR", "TIMER", "WRITE", "YEAST",
      "CITY", "CRTE", "HEIR", "HELM", "HEM", "HIS", "ITS", "MET", "MITE", "REST", "RICH", "RISE", "RITE", "SEMI",
      "SHIM", "SHIT", "SHY", "SITE", "STEM", "STIR", "THEM", "THIS", "TIME", "TREY", "TRIM", "YET", "YMC",
      "CRY", "HER", "HIM", "HIS", "ITS", "MET", "RIM", "SHE", "SHY", "THE", "TRY", "WET", "YES", "YET",
      "HE", "HI", "IS", "IT", "ME", "MY", "RE", "WE"
    ],
    funFact: "Chemistry is often called the 'central science' because it connects physics with other natural sciences."
  },
  {
    masterWord: "MOLECULE",
    theme: "State of Matter",
    subWords: [
      "CELL", "CULL", "MOLL", "MULE", "MULL", "OMEM", "YELL",
      "CLUE", "LICE", "LIME", "LOME", "MULL", "YULE",
      "CELL", "COAL", "COLE", "CULL", "ELM", "EMU", "ILL", "LUM", "MEL", "MIL", "OLE", "CUM",
      "CUE", "ELM", "EMU", "ICE", "ILL", "LEI", "LIE", "OIL", "MEL"
    ],
    funFact: "A water molecule is composed of two hydrogen atoms and one oxygen atom covalent bounded."
  },
  {
    masterWord: "CATALYST",
    theme: "Chemical Reaction",
    subWords: [
      "ALTAR", "ATLAS", "CLASS", "CLAST", "SALLY", "SALTS", "TALLY", "VISTA", "YEAST",
      "ALAS", "ALTS", "AYES", "CAST", "CLAY", "CYST", "LACY", "LAST", "LATS", "LAVA", "LAYS", "SALT", "SLAT", "SLAY", "STAY", "TALL",
      "ACT", "ALL", "ALT", "ASS", "CAT", "LAY", "SAD", "SAT", "SAY", "SLY", "STY", "TRY"
    ],
    funFact: "A catalyst increases the rate of a chemical reaction without itself undergoing any permanent chemical change."
  },
  {
    masterWord: "GENERATOR",
    theme: "Energy & Power",
    subWords: [
      "GARNER", "GENTRY", "GEAR", "GOAT", "GONE", "GORE", "GRATE", "GREAT", "GROAN", "NEGRO", "ORATE", "OTTER", "RANGER", "RATER", "REAR", "ROGER", "ROTATOR", "ROTOR", "TENOR", "TERRA", "TONER", "TORTE", "TREAT", "TREND",
      "AGE", "ARE", "ART", "EAR", "EAT", "EGO", "ERA", "ERR", "GEL", "GEM", "GEN", "GET", "GIG", "GIN", "GOT", "NET", "NOR", "NOT", "OAR", "OAT", "ONE", "ORE", "ORN", "RAG", "RAN", "RAT", "RED", "REG", "RET", "ROD", "ROE", "ROT", "TAG", "TAR", "TEA", "TEN", "TOE", "TON", "TOR", "TOY"
    ],
    funFact: "Electric generators convert mechanical energy into electrical energy inside modern power plants."
  },
  {
    masterWord: "LABORATORY",
    theme: "Scientific Space",
    subWords: [
      "ABORT", "ACTOR", "BOOTY", "BROTH", "COBALT", "LOBBY", "ORATOR", "TABOO", "TROLLEY",
      "ALTO", "BABY", "BALD", "BART", "BOAT", "BOLA", "BOOR", "BOOT", "BORA", "BORT", "BOY", "BRAY", "COAL", "COAT", "COLA", "COLT", "COOL", "COOT", "CORY", "CRAB", "CRAY", "CYST", "LACY", "LOBBY", "LOOT", "LORA", "LORY", "OART", "ORAL", "ROOT", "ROTA", "ROTO", "TABBY", "TARO", "TOLL", "TORY", "TRAY", "TROY",
      "ALB", "ALT", "ART", "BAP", "BAR", "BAT", "BAY", "BOA", "BOB", "COO", "COT", "LAB", "LAY", "LOB", "LOO", "OAR", "OAT", "ORB", "ORT", "RAT", "RAY", "ROB", "ROT", "RYE", "TAB", "TAR", "TOY", "TRY"
    ],
    funFact: "The word laboratory comes from the Latin 'labor' meaning 'work' or 'toil'."
  },
  {
    masterWord: "SCIENTIFIC",
    theme: "Research Systems",
    subWords: [
      "CITENS", "CLIFT", "FIEST", "FINITE", "INFINE", "FLINT", "SCENT", "SINEW", "SITIN", "TINEA", "WISER",
      "CENT", "CIEL", "CINE", "FEIN", "FICE", "FIND", "FINE", "FINI", "FINS", "FIST", "FITS", "NICE", "NITE", "SCIN", "SECT", "SENT", "SICE", "SIFT", "SINE", "SINS", "SITE", "SITS", "TENS", "TICE", "TIES", "TIME", "TINE", "TINS",
      "EFF", "ELF", "FEN", "FIE", "FIN", "FIT", "ICE", "IFS", "ITS", "NET", "NIL", "NIT", "SEC", "SEN", "SIC", "SIN", "SIT", "TEN", "TIC", "TIE", "TIN"
    ],
    funFact: "The scientific method relies on empirical documentation, testing, and questioning."
  },
  {
    masterWord: "ELECTRONIC",
    theme: "Quantum Circuits",
    subWords: [
      "CLIENT", "ELECTION", "LECTURE", "NECTAR", "NOTICE", "RETIRE", "TENOR", "TIGER", "TONER", "TRICE",
      "CEIL", "CELT", "CENT", "CINE", "CION", "CLON", "CLOT", "COIL", "COIN", "COLE", "COLT", "CONE", "CONI", "COOT", "CORE", "CORN", "COTE", "EEL", "EER", "EIRE", "LICE", "LIEN", "LIER", "LIME", "LINE", "LINO", "LION", "LIRE", "LITE", "LOCO", "LONE", "LOON", "LORE", "NICE", "NITE", "NOEL", "OINT", "ONCE", "ONTO", "REEL", "RIOT", "RILE", "RITE", "ROLE", "ROTE", "ROTI", "ROTO", "TEEN", "TELE", "TENOR", "TIRE", "TOCO", "TOIL", "TOLE", "TOLL", "TONE", "TOON", "TORE", "TORI", "TORO", "TRIO",
      "CON", "COT", "EEL", "ELM", "ION", "LET", "LIE", "LIT", "LOO", "NET", "NIL", "NOT", "ONE", "ORE", "REC", "RET", "ROE", "ROT", "TEE", "TEN", "TIC", "TIE", "TIL", "TIN", "TOE", "TON", "TOR"
    ],
    funFact: "Electronics directs electrical currents through gas, vacuum, or semiconductor devices."
  }
];

/// Clean, fast solver using our newly added offline English dictionary
export function solveAtomicLevel(master: string): string[] {
  // Respect the active configured minimum word length
  const minLength = getMinWordLength();
  return solveAnagrams(master, minLength);
}

/**
 * Get a random scientific/atomic themed WordLevel, fully populated with the active dictionary
 */
export function getRandomLevel(): WordLevel {
  const base = OFFLINE_LEVELS[Math.floor(Math.random() * OFFLINE_LEVELS.length)];
  const generatedSubwords = solveAtomicLevel(base.masterWord);
  
  // Combine pre-solved and dynamically decoded dictionary words
  const minLength = getMinWordLength();
  const subWordsSet = new Set([
    ...base.subWords.filter(w => w.length >= minLength), 
    ...generatedSubwords
  ]);
  
  return {
    ...base,
    subWords: Array.from(subWordsSet).sort((a, b) => b.length - a.length || a.localeCompare(b))
  };
}
