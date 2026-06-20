import React, { useState, useEffect, useRef } from 'react';
import { User, Difficulty, Language, AvatarConfig } from './types';
import * as GeminiService from './services/geminiService';
import * as StorageService from './services/storageService';
import * as AudioService from './services/audioService';
import { WordLevel } from './services/wordLevels';
import AtomicBackground from './components/AtomicBackground';
import Avatar from './components/Avatar';
import { Logo } from './components/Logo';
import { CustomizeScreen } from './components/CustomizeScreen';
import { ShopScreen } from './components/ShopScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { HowToPlayScreen } from './components/HowToPlayScreen';
import { DeveloperModeScreen } from './components/DeveloperModeScreen';
import { solveAnagramsAsync } from './services/workerService';
import {
  getMinWordLength,
  canWordBeFormed, 
  isWordInDictionary,
  startBackgroundDictionaryLoad,
  subscribeToDictionaryUpdates,
  logWordAttempt,
  logUserComplaint,
  checkWordWithConfidenceSystem,
  getLoadedDictionarySize
} from './services/dictionaryService';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, Play, Settings, ShoppingBag, BookOpen, AlertTriangle, 
  Coins, Sparkles, Check, Shuffle, Sparkle, Loader,
  Volume2, VolumeX, Lock, User as UserIcon, X, Globe, Atom
} from 'lucide-react';

// --- Multilingual Translations (Stripped of Labs & Reactors) ---
const TRANSLATIONS = {
  [Language.ENGLISH]: {
    name: "English",
    coins: "Coins",
    play: "Play Game",
    settings: "Settings",
    customize: "Custom Avatar",
    shop: "Shop",
    welcome: "Hello, Scriptor",
    player: "Player",
    score: "Total Score",
    levelComplete: "Puzzle Finished!",
    foundWords: "Found Words",
    menu: "Quit",
    retry: "Restart",
    playAgain: "Play Again",
    music: "Music",
    sfx: "Sounds",
    language: "Language"
  },
  [Language.SPANISH]: { name: "Español", coins: "Monedas", play: "Jugar Juez", settings: "Controles", customize: "Ajustar Traje", shop: "Tienda", welcome: "Bienvenido", player: "Jugador", score: "Puntos", levelComplete: "Nivel Completado", foundWords: "Palabras Encontradas", menu: "Salir", retry: "Reiniciar", playAgain: "Nueva Partida", music: "Música", sfx: "Sonidos", language: "Idioma" },
  [Language.FRENCH]: { name: "Français", coins: "Pièces", play: "Jouer", settings: "Options", customize: "Mon Avatar", shop: "Boutique", welcome: "Bonjour", player: "Joueur", score: "Score", levelComplete: "Niveau Réussi", foundWords: "Mots Trouvés", menu: "Quitter", retry: "Recharger", playAgain: "Rejouer", music: "Musique", sfx: "Effets", language: "Langue" },
  [Language.CHINESE]: { name: "中文", coins: "金币", play: "开始游戏", settings: "设置", customize: "自定义头像", shop: "商店", welcome: "你好，词法家", player: "玩家", score: "积分", levelComplete: "通关成功", foundWords: "已找到单词", menu: "退出", retry: "重试", playAgain: "再次游戏", music: "音乐", sfx: "音效", language: "语言" },
  [Language.TAGALOG]: { name: "Tagalog", coins: "Barya", play: "Umpisa", settings: "Settings", customize: "Ayusin", shop: "Tindahan", welcome: "Mabuhay", player: "Manlalaro", score: "Puntos", levelComplete: "Tapos na", foundWords: "Nahanap na Salita", menu: "Umalis", retry: "Ulitin", playAgain: "Laro Ulit", music: "Musika", sfx: "Tunog", language: "Wika" },
  [Language.VIETNAMESE]: { name: "Tiếng Việt", coins: "Xu", play: "Chơi Ngay", settings: "Thiết lập", customize: "Trang Phục", shop: "Cửa Hàng", welcome: "Chào chuyên gia", player: "Kỹ sư", score: "Nhạc", levelComplete: "Bền vững", foundWords: "Từ tìm thấy", menu: "Dừng", retry: "Nạp lại", playAgain: "Thử Thách", music: "Nhạc", sfx: "Hiệu ứng", language: "Ngôn ngữ" },
  [Language.PIRATE]: {
    name: "Pirate",
    coins: "Booty",
    play: "Rig & Sail",
    settings: "Quartermaster",
    customize: "Tailor Rigging",
    shop: "Plunder Cove",
    welcome: "Ahoy, Scriptor",
    player: "Matey",
    score: "Gold Bounty",
    levelComplete: "Loot Harvested",
    foundWords: "Scrawlings Found",
    menu: "Flee Port",
    retry: "Try Yer Luck",
    playAgain: "Voyage Anew",
    music: "Sea Shanties",
    sfx: "Cannons",
    language: "Lingo Speak"
  }
};

// --- Standard Login Sub-component ---
interface LoginProps {
  onLogin: (u: User) => void;
  playSound: (type: 'click' | 'success') => void;
}

const LoginScreen: React.FC<LoginProps> = ({ onLogin, playSound }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = username.trim();
    if (!trimmed) {
      setError("Please choose a player name!");
      return;
    }

    if (trimmed.length < 2) {
      setError("Player name must be at least 2 letters!");
      return;
    }

    if (trimmed.length > 15) {
      setError("Player name must be under 15 letters!");
      return;
    }

    playSound('success');
    const guestUser = StorageService.createGuestUser(trimmed);
    onLogin(guestUser);
  };

  const handleQuickPlay = () => {
    playSound('success');
    const rdNum = Math.floor(1000 + Math.random() * 9000);
    const guestUser = StorageService.createGuestUser(`Player_${rdNum}`);
    onLogin(guestUser);
  };

  return (
    <div className="flex flex-col items-center justify-between p-6 h-full select-none" id="login-container-panel">
      {/* Dynamic responsive centered logo in a safe padded area */}
      <div className="py-4 w-full flex justify-center">
        <Logo size="lg" />
      </div>

      <div className="w-full max-w-xs flex flex-col gap-4 mb-4">
        {/* Profile Creation Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full bg-white/60 dark:bg-black/30 backdrop-blur-md p-5 rounded-[28px] border border-black/5 dark:border-white/10 shadow-xl"
        >
          <div className="text-center mb-4">
            <h3 className="font-sans font-black text-xs text-slate-400 dark:text-slate-400 uppercase tracking-widest leading-none mb-1">
              CHOOSE PLAYER TAG
            </h3>
            <p className="text-[10px] text-slate-500 font-medium">
              Enter your nick & start spelling
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="relative">
              <UserIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                maxLength={15}
                placeholder="Player Nickname" 
                value={username} 
                onChange={e => setUsername(e.target.value)}
                className="w-full py-3.5 pl-10 pr-4 bg-slate-100/80 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-600/40 focus:outline-none placeholder-slate-450"
              />
            </div>

            {error && (
              <p className="text-[9px] text-red-500 dark:text-red-400 font-extrabold uppercase bg-red-500/10 text-center py-2 rounded-xl border border-red-500/10">
                ⚠️ {error}
              </p>
            )}

            <button 
              type="submit" 
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black uppercase text-xs tracking-widest rounded-xl shadow-md transition-all active:scale-95"
            >
              CREATE PLAYER TAG
            </button>
          </form>

          {/* Quick Play Alternative */}
          <div className="relative flex py-3 items-center">
            <div className="flex-grow border-t border-black/10 dark:border-white/10"></div>
            <span className="flex-shrink mx-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Or Anonymously</span>
            <div className="flex-grow border-t border-black/10 dark:border-white/10"></div>
          </div>

          <button 
            onClick={handleQuickPlay}
            type="button" 
            className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black uppercase text-xs tracking-widest rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Sparkle size={12} className="animate-pulse" /> QUICK PLAY
          </button>
        </motion.div>
      </div>

      <span className="text-[10px] text-slate-400 font-semibold tracking-wider pb-2">
        ATOMIC WORDS © {new Date().getFullYear()}
      </span>
    </div>
  );
};

// --- In-Game Play Interface ---
interface PlayProps {
  user: User;
  difficulty: Difficulty;
  onExit: () => void;
  onAddCoins: (coins: number) => void;
  playSound: (type: 'tap' | 'success' | 'error' | 'click' | 'levelUp' | 'hint') => void;
  level: WordLevel | null;
  setLevel: React.Dispatch<React.SetStateAction<WordLevel | null>>;
  foundWords: string[];
  setFoundWords: React.Dispatch<React.SetStateAction<string[]>>;
  roundId: string;
  setRoundId: React.Dispatch<React.SetStateAction<string>>;
}

const GamePlayScreen: React.FC<PlayProps> = ({ 
  user, 
  difficulty, 
  onExit, 
  onAddCoins, 
  playSound,
  level,
  setLevel,
  foundWords,
  setFoundWords,
  roundId,
  setRoundId
}) => {
  const language = user.settings.language || Language.ENGLISH;
  const t = TRANSLATIONS[language];

  const [isLoading, setIsLoading] = useState(true);
  
  // Game states
  const [tiles, setTiles] = useState<{ id: string; char: string; used: boolean }[]>([]);
  const [spelling, setSpelling] = useState<{ tileId: string; char: string }[]>([]);
  const [score, setScore] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90); // 90 seconds Timer
  const [gameEnded, setGameEnded] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Hints
  const [hintMessage, setHintMessage] = useState<string | null>(null);

  // Word Definition / Trivia from Gemini
  const [capsuleWord, setCapsuleWord] = useState('');
  const [scienceCapsule, setScienceCapsule] = useState('');
  const [capsuleLoading, setCapsuleLoading] = useState(false);
  // Cache capsule responses per word so clicking an already-fetched word chip is instant
  const capsuleCache = useRef<Map<string, string>>(new Map());

  // Debounced game-progress localStorage write — batches saves to at most once per 800ms
  const progressSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveProgressDebounced = (progress: object) => {
    if (progressSaveTimer.current) clearTimeout(progressSaveTimer.current);
    progressSaveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem('atomic_active_game_progress', JSON.stringify(progress));
      } catch (_) {}
    }, 800);
  };

  const [isValidatingWord, setIsValidatingWord] = useState(false);

  // Dynamic game alerts overlay (replacing ugly window.alerts)
  const [gameAlert, setGameAlert] = useState<{ text: string; type: 'success' | 'info' | 'error'; word?: string } | null>(null);

  const showGameAlert = (text: string, type: 'success' | 'info' | 'error', word?: string) => {
    setGameAlert({ text, type, word });
    const duration = text.includes("MASTER") || word ? 5000 : 3000;
    setTimeout(() => {
      setGameAlert(prev => prev?.text === text ? null : prev);
    }, duration);
  };

  // Level setup
  useEffect(() => {
    setIsLoading(true);
    setFoundWords([]);
    setSpelling([]);
    setScore(0);
    setCoinsEarned(0);
    setTimeLeft(90);
    setGameEnded(false);
    setCapsuleWord('');
    setScienceCapsule('');

    let themeChoice = "";
    if (difficulty === Difficulty.BEGINNER) themeChoice = "Basic friendly terms";
    else if (difficulty === Difficulty.HARD) themeChoice = "Cosmic stellar vocabulary";
    else if (difficulty === Difficulty.EXPERT) themeChoice = "Adventure and literature words";

    GeminiService.generateGameLevel(themeChoice).then(gameLevel => {
      setLevel(gameLevel);
      
      const newRoundId = "rnd_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now();
      setRoundId(newRoundId);

      // Save initial state to local storage (debounced)
      saveProgressDebounced({
        roundId: newRoundId,
        masterWord: gameLevel.masterWord,
        foundWords: [],
        score: 0,
        timeLeft: 90,
        coinsEarned: 0
      });

      // Split master word into distinct interactive tiles
      const formattedTiles = gameLevel.masterWord.split('').map((char, index) => ({
        id: `tile-${index}-${char}`,
        char,
        used: false
      }));
      
      setTiles(formattedTiles.sort(() => Math.random() - 0.5));
      setIsLoading(false);
    });
  }, [difficulty]);

  // Game timer countdown loop
  useEffect(() => {
    if (isLoading || gameEnded) return;

    if (timeLeft <= 0) {
      handleFinishReactor();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoading, timeLeft, gameEnded]);

  // Handle tile tapping
  const handleTapTile = (tile: { id: string; char: string; used: boolean }) => {
    if (tile.used) return;
    
    playSound('tap');
    
    setTiles(prev => prev.map(t => t.id === tile.id ? { ...t, used: true } : t));
    setSpelling(prev => [...prev, { tileId: tile.id, char: tile.char }]);
  };

  // Handle retraction
  const handleRetractLetter = (letter: { tileId: string; char: string }) => {
    playSound('click');
    setTiles(prev => prev.map(t => t.id === letter.tileId ? { ...t, used: false } : t));
    setSpelling(prev => prev.filter(item => item.tileId !== letter.tileId));
  };

  // Clear spelling action
  const handleClearSpelling = () => {
    playSound('click');
    setTiles(prev => prev.map(t => ({ ...t, used: false })));
    setSpelling([]);
  };

  // Shuffle letter tiles visualization order
  const handleShuffleTiles = () => {
    playSound('click');
    setTiles(prev => [...prev].sort(() => Math.random() - 0.5));
  };

  // NOTE: The foundWords safeguard useEffect was removed — canWordBeFormed is already
  // checked at submit time in handleSubmitSpelling, so re-checking on every state update
  // was redundant O(N) work per word found.

  // Submit Spelled Trial
  const handleSubmitSpelling = async () => {
    if (isValidatingWord) return;

    const word = spelling.map(item => item.char).join('').toUpperCase();
    const minWordLen = getMinWordLength();
    
    if (word.length < minWordLen) {
      playSound('error');
      showGameAlert(`Words must be at least ${minWordLen} letters long!`, 'error');
      return;
    }

    if (!level) return;

    // Has not already been found
    if (foundWords.includes(word)) {
      playSound('error');
      showGameAlert(`"${word}" has already been discovered!`, 'info');
      // Automatically empty spelling tray
      setTiles(prev => prev.map(t => ({ ...t, used: false })));
      setSpelling([]);
      return;
    }

    setIsValidatingWord(true);

    try {
      const check = await checkWordWithConfidenceSystem(word, level.masterWord, minWordLen);
      logWordAttempt(word, check.valid, check.reason, check.source);

      if (!check.valid) {
        playSound('error');
        showGameAlert(`"${word}" rejected: ${check.reason}`, 'error', word);
        // Automatically empty spelling tray
        setTiles(prev => prev.map(t => ({ ...t, used: false })));
        setSpelling([]);
        setIsValidatingWord(false);
        return;
      }
    } catch (e) {
      console.error("Confidence checking error, fallback to basic dictionary search", e);
      const isOk = level.subWords.includes(word) || isWordInDictionary(word);
      logWordAttempt(word, isOk, isOk ? "Accepted" : "Heuristics and dictionaries exhausted", "Local Fallback Check");
      if (!isOk) {
        playSound('error');
        showGameAlert(`"${word}" is not a valid word!`, 'error', word);
        setTiles(prev => prev.map(t => ({ ...t, used: false })));
        setSpelling([]);
        setIsValidatingWord(false);
        return;
      }
    }

    setIsValidatingWord(false);

    // Accepted spelling!
    playSound('success');
    
    let pts = word.length * 100;
    let cReward = Math.max(1, Math.floor(word.length / 2));
    
    // Complete master word bonus
    if (word === level.masterWord) {
      pts += 1000;
      cReward += 20;
      showGameAlert(`✨ MASTER WORD COMPLETED! You spelled "${word}"! +1,000 Pts!`, 'success');
    } else {
      showGameAlert(`Valid word: "${word}"! +${pts} Pts!`, 'success');
    }

    const updatedScore = score + pts;
    const updatedCoinsEarned = coinsEarned + cReward;
    const updatedFoundWords = [word, ...foundWords];

    setScore(updatedScore);
    setCoinsEarned(updatedCoinsEarned);
    setFoundWords(updatedFoundWords);

    // Save progress update (debounced — batches rapid word finds into one write)
    saveProgressDebounced({
      roundId,
      masterWord: level.masterWord,
      foundWords: updatedFoundWords,
      score: updatedScore,
      timeLeft,
      coinsEarned: updatedCoinsEarned
    });

    // Launch word info from Gemini (served from cache if already fetched)
    setCapsuleWord(word);
    const cached = capsuleCache.current.get(word);
    if (cached) {
      setScienceCapsule(cached);
      setCapsuleLoading(false);
    } else {
      setScienceCapsule('');
      setCapsuleLoading(true);
      GeminiService.getWordScienceCapsule(word, level.masterWord).then(capsuleText => {
        capsuleCache.current.set(word, capsuleText);
        setScienceCapsule(capsuleText);
        setCapsuleLoading(false);
      }).catch(() => {
        setCapsuleLoading(false);
      });
    }

    // Automatically empty spelling tray
    setTiles(prev => prev.map(t => ({ ...t, used: false })));
    setSpelling([]);
  };

  // User Dispute live validation check
  const handleReportMissingWord = async (wordToReport: string) => {
    if (!wordToReport || !level) return;
    playSound('click');
    showGameAlert(`AI Oracle analyzing "${wordToReport}"...`, 'info');
    
    try {
      const isValidByAI = await checkWordWithConfidenceSystem(wordToReport, level.masterWord, getMinWordLength(), true);
      logWordAttempt(wordToReport, isValidByAI.valid, isValidByAI.reason, isValidByAI.source);
      
      if (isValidByAI.valid) {
        playSound('success');
        
        let pts = wordToReport.length * 105; // Slightly enhanced reward for reporting brilliant words!
        let cReward = Math.max(2, Math.floor(wordToReport.length / 2) + 1);
        
        if (wordToReport === level.masterWord) {
          pts += 1000;
          cReward += 20;
          showGameAlert(`✨ APPROVED! "${wordToReport}" is indeed a master word! +1,000 Pts!`, 'success');
        } else {
          showGameAlert(`✨ APPROVED! "${wordToReport}" accepted! +${pts} Pts!`, 'success');
        }
        
        const updatedScore = score + pts;
        const updatedCoinsEarned = coinsEarned + cReward;
        const updatedFoundWords = [wordToReport, ...foundWords];
        
        setScore(updatedScore);
        setCoinsEarned(updatedCoinsEarned);
        setFoundWords(updatedFoundWords);
        
        // Save progress update (debounced)
        saveProgressDebounced({
          roundId,
          masterWord: level.masterWord,
          foundWords: updatedFoundWords,
          score: updatedScore,
          timeLeft,
          coinsEarned: updatedCoinsEarned
        });
        
        // Launch word info from Gemini (served from cache if already fetched)
        setCapsuleWord(wordToReport);
        const cachedReport = capsuleCache.current.get(wordToReport);
        if (cachedReport) {
          setScienceCapsule(cachedReport);
          setCapsuleLoading(false);
        } else {
          setScienceCapsule('');
          setCapsuleLoading(true);
          GeminiService.getWordScienceCapsule(wordToReport, level.masterWord).then(capsuleText => {
            capsuleCache.current.set(wordToReport, capsuleText);
            setScienceCapsule(capsuleText);
            setCapsuleLoading(false);
          }).catch(() => {
            setCapsuleLoading(false);
          });
        }
        
      } else {
        logUserComplaint(wordToReport);
        playSound('error');
        showGameAlert(`"${wordToReport}" rejected: Not a legitimate English word or anagram.`, 'error');
      }
    } catch (e) {
      console.error(e);
      playSound('error');
      showGameAlert("AI system is currently busy. Try again soon.", 'error');
    }
  };

  // Trigger AI Hint Decoder
  const handleTriggerAIHint = () => {
    if (user.coins < 25) {
      playSound('error');
      showGameAlert("Spend 25 coins to get a word hint!", 'error');
      return;
    }
    
    if (!level) return;

    const unsolved = level.subWords.filter(w => !foundWords.includes(w));
    
    if (unsolved.length === 0) {
      playSound('success');
      setHintMessage("Perfect Score! You discovered all possible words!");
      return;
    }

    onAddCoins(-25);
    playSound('hint');

    const targetHint = unsolved[Math.floor(Math.random() * unsolved.length)];
    const mask = targetHint.slice(1).replace(/./g, ' _');
    
    setHintMessage(`Word clue: Starts with "${targetHint[0]}" (${targetHint[0]}${mask})`);
    
    setTimeout(() => {
      setHintMessage(null);
    }, 6000);
  };

  const handleFinishReactor = () => {
    playSound('levelUp');
    setGameEnded(true);
    
    const savedScoresObj = {
      username: user.username,
      score: score,
      date: new Date().toLocaleDateString(),
      difficulty: difficulty
    };
    StorageService.saveScore(savedScoresObj);
    onAddCoins(coinsEarned); 
  };

  if (isLoading || !level) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500" id="game-loading-panel">
        <Loader className="animate-spin text-blue-500 mb-4" size={38} />
        <p className="text-xs uppercase font-black tracking-wider animate-pulse">
          Entering puzzle level...
        </p>
      </div>
    );
  }

  // Calculate percentage progress bar
  const totalSubwordsCount = level.subWords.length;
  const currentDiscoveredPercentage = Math.min(100, Math.floor((foundWords.length / Math.max(1, totalSubwordsCount)) * 100));

  return (
    <div className="flex flex-col h-full bg-transparent p-4 relative text-slate-900 dark:text-white select-none overflow-hidden" id="active-game-viewport">
      
      {/* Dynamic Game Feedback Toast */}
      <AnimatePresence>
        {gameAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`absolute top-20 left-4 right-4 z-50 p-3.5 rounded-2xl border text-center text-[10px] font-black uppercase tracking-wider shadow-lg flex flex-col items-center justify-center gap-2 ${
              gameAlert.type === 'success' 
                ? 'bg-emerald-500 border-emerald-400 text-white' 
                : gameAlert.type === 'error'
                  ? 'bg-red-500 border-red-400 text-white'
                  : 'bg-indigo-600 border-indigo-500 text-white'
            }`}
          >
            <span>{gameAlert.text}</span>
            {gameAlert.word && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleReportMissingWord(gameAlert.word!);
                }}
                className="px-3.5 py-1 bg-white/20 hover:bg-white/30 text-[9px] uppercase font-black text-white rounded-lg border border-white/20 active:scale-95 transition-all cursor-pointer"
              >
                📢 Report Word as Legitimate
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Hud */}
      <div className="flex items-center justify-between bg-white/40 dark:bg-slate-900/60 backdrop-blur px-3.5 py-2.5 rounded-2xl border border-black/[0.03] dark:border-white/10 shrink-0">
        <button 
          onClick={() => { playSound('click'); setShowExitConfirm(true); }}
          className="text-[10px] font-black uppercase text-red-500 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-xl transition-colors shrink-0"
        >
          {t.menu}
        </button>

        <div className="flex items-center gap-3">
          {/* Timer */}
          <div className="text-right">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Time Left</span>
            <span className={`font-mono text-xs font-black ${timeLeft < 15 ? 'text-red-500 animate-pulse font-extrabold text-sm' : 'text-slate-800 dark:text-white'}`}>
              {timeLeft}s
            </span>
          </div>

          {/* Score */}
          <div className="text-right">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Score</span>
            <span className="font-mono text-xs font-black text-blue-600 dark:text-blue-400">
              {score}
            </span>
          </div>
        </div>
      </div>

      {/* Target Word Core / Progress */}
      <div className="bg-white/60 dark:bg-black/40 backdrop-blur px-4 py-3.5 rounded-3xl border border-black/[0.03] dark:border-white/5 mt-2.5 text-center flex flex-col items-center shrink-0">
        <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest bg-blue-500/10 dark:bg-blue-500/5 px-2.5 py-0.5 rounded-full border border-blue-500/10">
          <Sparkles size={10} /> {level.theme}
        </div>

        {/* Master Word with elegant display spacing */}
        <h2 className="text-2xl xs:text-3xl font-black uppercase tracking-wider text-slate-900 dark:text-white mt-2 mb-1 text-center font-sans">
          {level.masterWord.split('').map((char, index) => (
            <span key={index} className="inline-block px-0.5">{char}</span>
          ))}
        </h2>

        {/* Subwords counter indicators */}
        <div className="flex justify-between items-center w-full mt-2 px-1">
          <div className="text-left">
            <span className="text-[9px] font-bold text-slate-400 block uppercase">Words Found</span>
            <span className="font-extrabold text-xs text-slate-800 dark:text-white font-mono">
              {foundWords.length} / {totalSubwordsCount}
            </span>
          </div>

          <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-2.5 py-0.5 rounded-lg text-[10px] font-black border border-yellow-500/10">
            <Coins size={9} /> +{coinsEarned}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2.5 overflow-hidden p-[1px]">
          <div 
            className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-300" 
            style={{ width: `${currentDiscoveredPercentage}%` }}
          />
        </div>
      </div>

      {/* Spelled Words / Scrollable list */}
      <div className="flex-1 overflow-hidden flex flex-col mt-2.5 bg-white/30 dark:bg-black/15 rounded-3xl p-3.5 border border-black/[0.02]">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Found Words</span>

        {foundWords.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 px-4">
            <Atom className="animate-spin-slow text-slate-400 mb-1.5" size={24} />
            <p className="text-xs font-black uppercase tracking-wider">No words found yet</p>
            <p className="text-[10px] mt-0.5 text-slate-400 leading-normal">Combine letters from the master word to compile smaller ones!</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto flex flex-wrap gap-1 content-start pr-0.5 scrollbar-hide">
            {foundWords.map((word) => (
              <button 
                key={word} 
                onClick={() => {
                  playSound('click');
                  setCapsuleWord(word);
                  const cachedChip = capsuleCache.current.get(word);
                  if (cachedChip) {
                    setScienceCapsule(cachedChip);
                    setCapsuleLoading(false);
                  } else {
                    setScienceCapsule('');
                    setCapsuleLoading(true);
                    GeminiService.getWordScienceCapsule(word, level.masterWord).then(capsuleText => {
                      capsuleCache.current.set(word, capsuleText);
                      setScienceCapsule(capsuleText);
                      setCapsuleLoading(false);
                    });
                  }
                }}
                className="px-2.5 py-1 bg-blue-500/5 hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black rounded-lg uppercase tracking-wider transition-all flex items-center gap-1"
              >
                {word}
                <span className="text-[8px] bg-blue-500/10 text-blue-500 dark:text-blue-300 font-mono px-1 rounded">+{word.length * 100}</span>
              </button>
            ))}
          </div>
        )}

        {/* Definition Clue / Gemini Info box */}
        {capsuleWord && (
          <div className="mt-2.5 bg-blue-500/5 dark:bg-slate-950/40 p-2.5 rounded-xl border border-blue-500/10 text-[11px] leading-relaxed shrink-0 flex items-start gap-1.5 relative">
            <button 
              onClick={() => setCapsuleWord('')} 
              className="absolute top-1.5 right-1.5 p-0.5 bg-black/5 rounded-full hover:bg-black/10 dark:text-white text-slate-400"
            >
              <X size={8} />
            </button>
            <div className="w-4 h-4 rounded-full bg-blue-500/15 shrink-0 flex items-center justify-center text-blue-500 mt-0.5">
              <Sparkles size={8} />
            </div>
            <div className="pr-4">
              <strong className="text-blue-600 dark:text-blue-400 uppercase block mb-0.5">{capsuleWord}</strong>
              {capsuleLoading ? (
                <span className="animate-pulse text-slate-400 block text-[9px]">Analyzing dictionary...</span>
              ) : (
                <span className="text-slate-600 dark:text-slate-300">{scienceCapsule || `Nice word! Keep spelling anagrams from ${level.masterWord}`}</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Letter Taps / Word Spelling Input Plate */}
      <div className="shrink-0 mt-2.5 flex flex-col items-center">
        
        {/* Spelling Tray */}
        <div className="h-11 w-full flex items-center justify-center border-b border-dashed border-black/10 dark:border-white/10 px-2 relative mb-1.5 bg-black/[0.01] rounded-xl">
          {spelling.length === 0 ? (
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center animate-pulse">
              Select key tiles below
            </span>
          ) : (
            <div className="flex gap-1 overflow-x-auto scrollbar-hide py-0.5">
              {spelling.map((item, idx) => (
                <button
                  key={`${item.tileId}-${idx}`}
                  onClick={() => handleRetractLetter(item)}
                  className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-lg text-xs font-black uppercase hover:scale-95 transition-all shadow-sm active:scale-90 select-none"
                  title="Remove Letter"
                >
                  {item.char}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Controls block */}
        <div className="flex justify-between items-center w-full gap-2 px-1 mb-2.5">
          <button
            onClick={handleClearSpelling}
            disabled={spelling.length === 0}
            className={`flex-1 py-2 text-[10px] font-black uppercase border rounded-lg transition-all ${spelling.length > 0 ? 'border-red-500 text-red-500 bg-red-500/5 active:scale-95' : 'opacity-40 border-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            Clear
          </button>
          <button
            onClick={handleShuffleTiles}
            className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
            title="Shuffle Tiles"
          >
            <Shuffle size={12} />
          </button>
          <button
            onClick={handleSubmitSpelling}
            disabled={spelling.length < 3}
            className={`flex-[1.5] py-2 text-[10px] font-black uppercase rounded-lg shadow-sm transition-all flex items-center justify-center gap-1 ${spelling.length >= 3 ? 'bg-gradient-to-r from-emerald-500 to-green-400 text-slate-900 active:scale-95' : 'opacity-40 bg-slate-100 text-slate-400 cursor-not-allowed'}`}
          >
            <Check size={10} strokeWidth={3} /> Formulate
          </button>
        </div>

        {/* Individual letter tiles of the word */}
        <div className="w-full bg-slate-100/60 dark:bg-black/30 rounded-3xl p-2 border border-black/[0.03] flex flex-wrap justify-center gap-1.5 mb-2">
          {tiles.map(tile => (
            <button
               key={tile.id}
               onClick={() => handleTapTile(tile)}
               disabled={tile.used}
               className={`w-9 h-9 rounded-full text-sm font-black uppercase flex items-center justify-center border transition-all ${tile.used ? 'opacity-20 border-transparent bg-slate-200 dark:bg-slate-800 text-slate-500 scale-95 cursor-not-allowed' : 'border-white bg-white dark:bg-slate-800 text-slate-800 dark:text-white active:scale-90 active:bg-blue-500/10 shadow-sm'}`}
            >
              {tile.char}
            </button>
          ))}
        </div>

        {/* Hint bar */}
        <div className="w-full flex justify-between items-center px-1">
          <button
            onClick={handleTriggerAIHint}
            className="text-[9px] font-black uppercase tracking-wider text-yellow-600 dark:text-yellow-400 hover:opacity-85 flex items-center gap-1 bg-yellow-500/10 px-2.5 py-1 rounded-full border border-yellow-500/10"
            id="hint-ai-btn"
          >
            <Sparkles size={10} className="text-yellow-500" /> Word Hint (-25 Coins)
          </button>

          <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">
            {difficulty.toUpperCase()}
          </span>
        </div>
      </div>

      {/* AI Clue Banner */}
      <AnimatePresence>
        {hintMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="absolute bottom-16 left-5 right-5 bg-slate-950 text-white dark:bg-white dark:text-slate-950 px-3.5 py-2.5 border border-yellow-500/30 rounded-xl text-[10px] text-center font-black uppercase tracking-wider shadow-xl z-40"
          >
            💡 {hintMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quit Confirm Modal */}
      <AnimatePresence>
        {showExitConfirm && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 rounded-3xl">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-xs bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 text-center shadow-lg"
              id="exit-game-dialog"
            >
              <div className="w-10 h-10 bg-red-100 dark:bg-red-950/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertTriangle size={20} />
              </div>
              <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm mb-1">Exit game?</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4 leading-normal">
                Quitting the stage active session means all compiled points and scores won't be saved on your stats list. Are you sure?
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => { playSound('click'); setShowExitConfirm(false); }}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold rounded-lg text-xs uppercase"
                >
                  Stay
                </button>
                <button 
                  onClick={() => { playSound('click'); onExit(); }}
                  className="flex-1 py-2 bg-red-600 text-white font-black rounded-lg text-xs uppercase shadow-sm"
                >
                  Quit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Finished Summary Report Card Overlay */}
      <AnimatePresence>
        {gameEnded && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 rounded-3xl">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="w-full max-w-xs bg-white dark:bg-slate-900 rounded-2xl p-5 text-center border border-slate-100 dark:border-slate-800 shadow-xl space-y-4"
              id="game-victory-report"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 text-black rounded-full flex items-center justify-center mx-auto border-2 border-white shadow-md">
                <Trophy size={20} />
              </div>

              <div>
                <h3 className="text-base font-black uppercase text-slate-900 dark:text-white tracking-tight">{t.levelComplete}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Stage Solved Successfully</p>
              </div>

              <div className="bg-slate-100/50 dark:bg-slate-950/40 p-3 border border-slate-100 dark:border-slate-800 rounded-xl space-y-1.5 text-left text-xs">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 uppercase font-black">Score</span>
                  <span className="font-mono font-black text-blue-600 dark:text-blue-400 text-xs">{score}</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 uppercase font-black">Words Found</span>
                  <span className="font-mono font-black text-slate-800 dark:text-white text-xs">{foundWords.length} Words</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 uppercase font-black">Coins Earned</span>
                  <span className="font-mono font-black text-emerald-500 text-xs flex items-center gap-0.5">
                    <Coins size={10} /> +{coinsEarned}
                  </span>
                </div>
              </div>

              {/* Trivia Block */}
              <div className="bg-blue-500/5 p-3 border border-blue-500/10 rounded-xl text-left text-[11px] text-slate-600 dark:text-slate-300 leading-normal">
                📘 <strong>Word Trivia:</strong> {level.funFact || "Anagram games expand lexical paths in vocabulary building."}
              </div>

              <button 
                onClick={() => { playSound('click'); onExit(); }}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black uppercase tracking-wider text-xs rounded-xl shadow-md transition-all"
                id="reactor-dismiss-btn"
              >
                Back to Menu
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

// --- App Root Viewport ---
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'HOME' | 'GAME' | 'SETTINGS' | 'CUSTOMIZE' | 'SHOP' | 'HOW_TO' | 'DEV_MODE'>('HOME');
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.NORMAL);
  const [darkMode, setDarkMode] = useState(true);

  // Sound Config
  const [soundOn, setSoundOn] = useState(true);
  const [musicOn, setMusicOn] = useState(false);

  // Active game level state shared with Developer Mode Sandbox
  const [level, setLevel] = useState<WordLevel | null>(null);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [roundId, setRoundId] = useState<string>('');
  const [totalDictionarySize, setTotalDictionarySize] = useState(getLoadedDictionarySize());

  // Re-solves the level on settings changes (dictionary import, min-length toggle).
  // Runs the solver in the Web Worker — never blocks the UI thread.
  const handleForceSolveLevel = () => {
    if (!level) return;
    const minLen = getMinWordLength();
    solveAnagramsAsync(level.masterWord, minLen).then(updatedSub => {
      setLevel(prev => prev ? { ...prev, subWords: updatedSub } : null);
    });
  };

  // Init App Settings
  useEffect(() => {
    const saved = StorageService.getSession();
    if (saved) {
      setUser(saved);
      setDarkMode(saved.settings?.musicVolume !== 100); // map from settings or default
    } else {
      // Check system theme preference automatically
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(systemPrefersDark);
    }

    // Start background Scrabble dictionary load (270,000+ words!)
    startBackgroundDictionaryLoad();

    // Subscribe to dynamic dictionary index updates
    const unsubscribe = subscribeToDictionaryUpdates((count) => {
      setTotalDictionarySize(count);
      // Automatically re-solve when complete list is bound
      handleForceSolveLevel();
    });

    // Listen to media query changes dynamically
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const savedSettings = StorageService.getSession();
      if (!savedSettings) {
        setDarkMode(e.matches);
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      unsubscribe();
    };
  }, []);

  // Update sound state inside audio service
  useEffect(() => {
    AudioService.setSfxEnabled(soundOn);
  }, [soundOn]);

  useEffect(() => {
    AudioService.setMusicEnabled(musicOn);
    return () => {
      AudioService.stopBackgroundMusic();
    };
  }, [musicOn]);

  const playSfx = (type: any) => {
    AudioService.playSound(type);
  };

  const handleAddCoins = (c: number) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      coins: Math.max(0, user.coins + c)
    };
    StorageService.updateUserProfile(updatedUser);
    setUser(updatedUser);
  };

  const language = user?.settings?.language || Language.ENGLISH;
  const t = TRANSLATIONS[language];

  return (
    <div className={`min-h-screen transition-colors duration-500 flex items-center justify-center p-0 md:p-6 ${darkMode ? 'dark bg-slate-950 text-white' : 'bg-blue-50 text-slate-900'}`}>
      
      {/* Background wallpaper */}
      <AtomicBackground darkMode={darkMode} />

      {/* --- DESKTOP RULER --- */}
      <div className="absolute top-6 left-6 hidden xl:flex items-center gap-2 select-none">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow">
          <Sparkle size={14} className="text-white animate-spin-slow" />
        </div>
        <span className="text-xs uppercase font-black tracking-widest text-slate-400">Atomic Words</span>
      </div>

      {/* --- PHONE EMBED CONTAINER FRAME (Flawless mobile centered size) --- */}
      <div 
        className="w-full h-screen md:h-[720px] md:max-w-md bg-white/50 dark:bg-slate-900/60 md:rounded-[40px] md:border-8 md:border-slate-800/80 shadow-2xl relative overflow-hidden backdrop-blur-md flex flex-col items-stretch"
        id="applet-viewport-frame"
      >
        <AnimatePresence mode="wait">
          {!user ? (
            <LoginScreen onLogin={setUser} playSound={playSfx} />
          ) : view === 'HOME' ? (
            <motion.div 
              key="home-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col h-full justify-between p-5 relative select-none overflow-hidden"
              id="main-home-menu"
            >
              
              {/* --- TOP: Profile Header & Atomic Words Logo --- */}
              <div className="space-y-4 shrink-0">
                {/* Profile Header */}
                <div className="flex items-center justify-between mt-1 shrink-0 bg-white/45 dark:bg-slate-950/30 backdrop-blur-md p-3 rounded-2xl border border-black/[0.03] dark:border-white/5 shadow-inner">
                  <div className="flex items-center gap-2.5">
                    {/* Avatar rendering inside frame (Padded properly so nothing cuts off) */}
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-white/50 overflow-hidden flex items-center justify-center relative shrink-0">
                      <Avatar config={user.avatar} className="w-[105%] h-[105%] object-cover translate-y-[2%]" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase leading-none tracking-tight">
                        {user.username}
                      </h4>
                      <span className="text-[8px] uppercase font-black text-slate-400 tracking-wider">
                        {t.player}
                      </span>
                    </div>
                  </div>

                  {/* Wallet Balance */}
                  <button 
                    onClick={() => { playSfx('click'); setView('SHOP'); }}
                    className="flex items-center gap-1 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full hover:bg-yellow-500/20 transition-all shrink-0"
                  >
                    <Coins size={11} className="text-yellow-500 animate-spin-slow" />
                    <span className="font-extrabold text-xs text-yellow-600 dark:text-yellow-400 font-mono">
                      {user.coins}
                    </span>
                  </button>
                </div>

                {/* Logo / Branding */}
                <div className="flex flex-col items-center justify-center gap-1 w-full text-center shrink-0">
                  <Logo size="lg" />
                  <p className="text-[9px] text-blue-600 dark:text-blue-450 uppercase font-black tracking-[4px] bg-blue-500/5 px-3.5 py-1 rounded-full border border-blue-500/10 mt-1">
                    Anagram Word Puzzle
                  </p>
                </div>
              </div>

              {/* --- MIDDLE: Play, Avatar, Shop, How To Play --- */}
              <div className="space-y-2.5 my-auto shrink-0">
                {/* 1. PLAY BUTTON */}
                <button 
                  onClick={() => { playSfx('click'); setView('GAME'); }}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl hover:scale-[1.01] transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  id="home-play-btn"
                >
                  <Play size={14} fill="white" /> {t.play}
                </button>

                {/* 2. AVATAR & 3. SHOP Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {/* AVATAR BUTTON */}
                  <button 
                    onClick={() => { playSfx('click'); setView('CUSTOMIZE'); }}
                    className="py-3 bg-white hover:bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-white/10 text-slate-800 dark:text-slate-200 font-extrabold text-[11px] uppercase tracking-wider rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5"
                    id="home-customize-btn"
                  >
                    <UserIcon size={12} /> {t.customize}
                  </button>

                  {/* SHOP BUTTON */}
                  <button 
                    onClick={() => { playSfx('click'); setView('SHOP'); }}
                    className="py-3 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 hover:from-yellow-500/20 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 font-extrabold text-[11px] uppercase tracking-wider rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5"
                    id="home-shop-btn"
                  >
                    <ShoppingBag size={12} /> {t.shop}
                  </button>
                </div>

                {/* 4. HOW TO PLAY BUTTON */}
                <button 
                  onClick={() => { playSfx('click'); setView('HOW_TO'); }}
                  className="w-full py-3 bg-white hover:bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-white/10 text-slate-800 dark:text-slate-200 rounded-xl font-extrabold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95"
                  id="home-howto-btn"
                >
                  <BookOpen size={12} /> How to Play
                </button>
              </div>

              {/* --- BOTTOM: Settings, Difficulty Slider, Audio toggles --- */}
              <div className="space-y-3.5 mt-auto pt-4 border-t border-slate-200/45 dark:border-white/5 shrink-0 flex flex-col">
                {/* SETTINGS BUTTON */}
                <button 
                  onClick={() => { playSfx('click'); setView('SETTINGS'); }}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/20 border border-slate-205/30 dark:border-white/5 text-slate-700 dark:text-slate-300 rounded-xl font-extrabold text-[11px] uppercase flex items-center justify-center gap-1.5 transition-all active:scale-95"
                  id="home-settings-btn"
                >
                  <Settings size={12} /> {t.settings}
                </button>

                {/* Game Difficulty & Audio Line */}
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase font-black text-slate-400">Game Difficulty</span>
                  <div className="flex bg-slate-100 dark:bg-black/35 p-0.5 rounded-lg border border-black/[0.03]">
                    {Object.values(Difficulty).map(d => (
                      <button
                        key={d}
                        onClick={() => { playSfx('click'); setDifficulty(d); }}
                        className={`px-2 py-0.5 text-[8px] font-black uppercase rounded transition-all ${difficulty === d ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm font-black' : 'text-slate-400'}`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sound Controls */}
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-[9px] uppercase font-black text-slate-400">Audio Setup</span>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => { playSfx('click'); setSoundOn(!soundOn); }}
                      className="p-1.5 bg-black/5 dark:bg-white/5 rounded-full text-slate-500 dark:text-slate-400 active:scale-90 transition-transform"
                      title="Toggle Sounds"
                    >
                      {soundOn ? <Volume2 size={12} /> : <VolumeX size={12} className="text-red-500" />}
                    </button>
                    
                    <button
                      onClick={() => { playSfx('click'); setView('SETTINGS'); }}
                      className="flex items-center gap-1 px-2.5 py-1 bg-black/5 dark:bg-white/5 rounded-full text-[8px] font-black uppercase text-slate-500 hover:bg-black/10 transition-colors"
                    >
                      <Globe size={9} /> {TRANSLATIONS[language].name}
                    </button>
                  </div>
                </div>
              </div>

            </motion.div>
          ) : view === 'GAME' ? (
            <GamePlayScreen 
              user={user} 
              difficulty={difficulty} 
              onExit={() => setView('HOME')} 
              onAddCoins={handleAddCoins}
              playSound={playSfx}
              level={level}
              setLevel={setLevel}
              foundWords={foundWords}
              setFoundWords={setFoundWords}
              roundId={roundId}
              setRoundId={setRoundId}
            />
          ) : view === 'CUSTOMIZE' ? (
            <CustomizeScreen 
              user={user} 
              onUpdateUser={setUser} 
              onBack={() => setView('HOME')} 
              playSound={playSfx}
            />
          ) : view === 'SHOP' ? (
            <ShopScreen 
              user={user} 
              onUpdateUser={setUser} 
              onBack={() => setView('HOME')} 
              playSound={playSfx}
            />
          ) : view === 'SETTINGS' ? (
            <SettingsScreen 
              user={user} 
              onUpdateUser={setUser} 
              onBack={() => setView('HOME')} 
              playSound={playSfx}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              onOpenDeveloperMode={() => setView('DEV_MODE')}
            />
          ) : view === 'DEV_MODE' ? (
            <DeveloperModeScreen 
              level={level}
              foundWords={foundWords}
              roundId={roundId}
              onBack={() => setView('SETTINGS')}
              onRefreshLevel={handleForceSolveLevel}
              playSound={playSfx}
            />
          ) : (
            <HowToPlayScreen 
              language={language}
              onBack={() => setView('HOME')} 
              playSound={playSfx}
            />
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
