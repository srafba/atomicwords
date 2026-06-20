export interface UserSettings {
  sfxVolume: number;
  musicVolume: number;
  communications: boolean;
  language: Language;
}

export enum Language {
  ENGLISH = 'ENGLISH',
  SPANISH = 'SPANISH',
  FRENCH = 'FRENCH',
  CHINESE = 'CHINESE',
  TAGALOG = 'TAGALOG',
  VIETNAMESE = 'VIETNAMESE',
  PIRATE = 'PIRATE'
}

export interface AvatarConfig {
  skinTone: string;
  hairStyle: 'bald' | 'short' | 'spiky' | 'long' | 'bob';
  hairColor: string;
  topType: 'tshirt' | 'shirt' | 'suit' | 'hoodie';
  topColor: string;
  bottomType: 'shorts' | 'pants' | 'skirt';
  bottomColor: string;
  beard: 'none' | 'stubble' | 'full' | 'mustache';
  accessory: 'none' | 'glasses' | 'sunglasses' | 'hat' | 'crown' | 'eyepatch';
}

export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  lastUsernameChange: number;
  coins: number;
  avatar: AvatarConfig;
  inventory: string[]; // List of item IDs owned
  settings: UserSettings;
}

export interface LeaderboardEntry {
  username: string;
  score: number;
  date: string;
  difficulty: Difficulty;
}

export enum Difficulty {
  BEGINNER = 'Beginner', // 4x4
  NORMAL = 'Normal',     // 5x5
  HARD = 'Hard',         // 6x6
  EXPERT = 'Expert'      // 7x7
}

export interface GridCell {
  id: string;
  char: string;
  x: number;
  y: number;
}

export interface GameConfig {
  gridSize: number; 
  timeLimit: number; 
}

export interface GameData {
  grid: string[][];
  validWords: string[];
}

export enum GameStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  FINISHED = 'FINISHED'
}