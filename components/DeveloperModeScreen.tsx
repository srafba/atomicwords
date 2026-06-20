import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, Database, Upload, Trash2, Check, RefreshCw, 
  AlertCircle, FileText, Info, BarChart3, AlertOctagon, Terminal, Play, ShieldAlert, Sparkles, FileJson
} from 'lucide-react';
import { 
  getActiveDictionary, 
  importCustomDictionary, 
  resetDictionaryToDefault, 
  getMinWordLength, 
  setMinWordLength, 
  solveAnagrams, 
  canWordBeFormed,
  getAnalytics,
  clearAnalytics,
  getLoadedDictionarySize
} from '../services/dictionaryService';
import { WordLevel } from '../services/wordLevels';

interface DeveloperModeScreenProps {
  level: WordLevel | null;
  foundWords: string[];
  roundId: string;
  onBack: () => void;
  onRefreshLevel: () => void;
  playSound: (type: 'click' | 'success' | 'error') => void;
}

export const DeveloperModeScreen: React.FC<DeveloperModeScreenProps> = ({
  level,
  foundWords,
  roundId,
  onBack,
  onRefreshLevel,
  playSound
}) => {
  const [activeDictSize, setActiveDictSize] = useState(0);
  const [customInput, setCustomInput] = useState('');
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [minWordLen, setMinWordLenConfig] = useState(3);
  const [viewTab, setViewTab] = useState<'diagnostics' | 'import' | 'analytics'>('diagnostics');
  const [localAnalytics, setLocalAnalytics] = useState(getAnalytics());
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load current stats
  useEffect(() => {
    setActiveDictSize(getLoadedDictionarySize());
    setMinWordLenConfig(getMinWordLength());
    setLocalAnalytics(getAnalytics());
  }, []);

  const handleImportText = (text: string, sourceName: string) => {
    const res = importCustomDictionary(text);
    if (res.success) {
      playSound('success');
      setImportStatus({ 
        success: true, 
        message: `Parsed ${res.count} custom words from "${sourceName}". Applied successfully!` 
      });
      setActiveDictSize(getLoadedDictionarySize());
      onRefreshLevel();
    } else {
      playSound('error');
      setImportStatus({ success: false, message: res.message });
    }
  };

  const handleTextareaImport = () => {
    if (!customInput.trim()) {
      playSound('error');
      setImportStatus({ success: false, message: "Please paste word list inputs first!" });
      return;
    }
    handleImportText(customInput, "Manual Text Input");
  };

  const handleResetToDefault = () => {
    playSound('click');
    resetDictionaryToDefault();
    setActiveDictSize(getLoadedDictionarySize());
    setCustomInput('');
    setImportStatus({ 
      success: true, 
      message: "Restored optimal system original English dictionary pool." 
    });
    onRefreshLevel();
  };

  const handleMinLenChange = (len: number) => {
    playSound('click');
    setMinWordLength(len);
    setMinWordLenConfig(len);
    onRefreshLevel();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleImportText(content, file.name);
    };
    reader.onerror = () => {
      playSound('error');
      setImportStatus({ success: false, message: "Error reading uploaded file. Trial aborted." });
    };
    reader.readAsText(file);
  };

  const handleClearLogs = () => {
    playSound('click');
    clearAnalytics();
    setLocalAnalytics(getAnalytics());
    setImportStatus({ success: true, message: "Developer analytics metrics reset successfully!" });
  };

  const currentMaster = level ? level.masterWord.toUpperCase() : "NONE";
  const solverSubwords = level ? solveAnagrams(level.masterWord, minWordLen) : [];
  const missingWords = solverSubwords.filter(w => !foundWords.includes(w.toUpperCase()));

  // Categorize analytics targets
  const attemptsArray = Object.entries(localAnalytics.attemptedWords).sort((a, b) => b[1] - a[1]);
  const rejectionsArray = Object.entries(localAnalytics.rejectedWords).sort((a, b) => b[1].count - a[1].count);
  const complaintsArray = Object.entries(localAnalytics.userComplaints).sort((a, b) => b[1].count - a[1].count);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 rounded-3xl p-5 shadow-xl select-none relative overflow-hidden"
      id="dev-tools-viewport"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-200/50 dark:border-slate-800/60 pb-3 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { playSound('click'); onBack(); }}
            className="p-2 bg-white dark:bg-slate-900 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors shadow-sm"
            id="dev-back-btn"
          >
            <ArrowLeft size={15} />
          </button>
          <div className="flex items-center gap-1.5">
            <Database className="text-blue-500 animate-pulse" size={17} />
            <h2 className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white">Developer Sandbox</h2>
          </div>
        </div>
        <div className="text-[10px] bg-blue-500/10 text-blue-650 dark:text-blue-400 font-extrabold uppercase px-2.5 py-1 rounded-full border border-blue-500/15">
          DICT STATUS: ONLINE
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-200/50 dark:bg-slate-900/50 p-1 rounded-xl mb-4 shrink-0 border border-slate-200/30 dark:border-white/5">
        <button
          onClick={() => { playSound('click'); setViewTab('diagnostics'); }}
          className={`flex-1 py-1.5 text-[9px] uppercase font-black transition-all rounded-lg flex items-center justify-center gap-1 ${viewTab === 'diagnostics' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <Terminal size={11} /> Diagnostics
        </button>
        <button
          onClick={() => { playSound('click'); setViewTab('import'); }}
          className={`flex-1 py-1.5 text-[9px] uppercase font-black transition-all rounded-lg flex items-center justify-center gap-1 ${viewTab === 'import' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <Upload size={11} /> Update Lexicon
        </button>
        <button
          onClick={() => { playSound('click'); setViewTab('analytics'); }}
          className={`flex-1 py-1.5 text-[9px] uppercase font-black transition-all rounded-lg flex items-center justify-center gap-1 ${viewTab === 'analytics' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <BarChart3 size={11} /> User Feedback
        </button>
      </div>

      {/* Main Tab Viewport */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
        {viewTab === 'diagnostics' && (
          <div className="space-y-4">
            
            {/* Live Solver Panel */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/40 dark:border-slate-800/80 shadow-inner space-y-3">
              <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400">
                <span>Active Word Metrics</span>
                <span className="font-mono">MIN LENGTH: {minWordLen}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100 dark:border-slate-850">
                <div>
                  <span className="text-[8px] uppercase font-bold text-slate-400 block tracking-wider">Current Play Word</span>
                  <p className="text-base font-black tracking-widest text-slate-900 dark:text-white uppercase">{currentMaster}</p>
                </div>
                <div>
                  <span className="text-[8px] uppercase font-bold text-slate-400 block tracking-wider">Indexed Dictionary Size</span>
                  <p className="text-base font-black text-blue-500 font-mono">{activeDictSize.toLocaleString()} words</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="bg-emerald-500/5 p-2 rounded-xl border border-emerald-500/10">
                  <span className="text-[8px] uppercase font-black text-emerald-500 block">Accepted</span>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{foundWords.length}</span>
                </div>
                <div className="bg-amber-500/5 p-2 rounded-xl border border-amber-500/10">
                  <span className="text-[8px] uppercase font-black text-amber-500 block">Remaining Anagrams</span>
                  <span className="text-xs font-black text-amber-600 dark:text-amber-400">{missingWords.length}</span>
                </div>
                <div className="bg-blue-500/5 p-2 rounded-xl border border-blue-500/10">
                  <span className="text-[8px] uppercase font-black text-blue-550 block">Solved Potential</span>
                  <span className="text-xs font-black text-blue-600 dark:text-blue-400">{solverSubwords.length}</span>
                </div>
              </div>
            </div>

            {/* Trial Diagnostics */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/40 dark:border-slate-800/80 shadow-sm space-y-3">
              <span className="text-[10px] uppercase font-black text-slate-400 block">Round Solver Anagram List</span>
              
              <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-left border-collapse text-[9px] font-mono">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-950 text-slate-500 uppercase border-b border-slate-100 dark:border-slate-800 font-black">
                      <th className="p-2">Anagram Attempt</th>
                      <th className="p-2 text-right">Solver Verdict</th>
                    </tr>
                  </thead>
                  <tbody>
                    {solverSubwords.map((w, idx) => {
                      const isFound = foundWords.includes(w.toUpperCase());
                      return (
                        <tr key={idx} className="border-b last:border-0 border-slate-50 dark:border-slate-850">
                          <td className="p-2 font-black uppercase text-slate-800 dark:text-slate-200">{w}</td>
                          <td className="p-2 text-right">
                            {isFound ? (
                              <span className="text-emerald-500 font-extrabold bg-emerald-500/10 px-1.5 py-0.5 rounded">ACCEPTED</span>
                            ) : (
                              <span className="text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">REMAINING</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {solverSubwords.length === 0 && (
                      <tr>
                        <td colSpan={2} className="p-4 text-center text-slate-400 italic">No subwords solvable for this level in dictionary. Try updating configurations.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Configurable Minimum Word length */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/40 dark:border-slate-800/80 shadow-sm space-y-3">
              <span className="text-[10px] uppercase font-black text-slate-400 block">Gameplay Minimum Word Letters</span>
              <div className="grid grid-cols-3 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-black/[0.02]">
                {[2, 3, 4].map((len) => (
                  <button
                    key={len}
                    onClick={() => handleMinLenChange(len)}
                    className={`py-1.5 text-xs font-black transition-all rounded-lg ${minWordLen === len ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {len} Letters
                  </button>
                ))}
              </div>
              <p className="text-[9px] text-slate-400 leading-relaxed font-semibold">
                Changing minimum constraints dynamically updates the offline level solutions pool. Choose 2 Letters to accept very short words (am, an, as, at, in, etc.) safely.
              </p>
            </div>
          </div>
        )}

        {viewTab === 'import' && (
          <div className="space-y-4">
            
            {/* Dynamic File Uploader */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/40 dark:border-slate-800/80 shadow-sm space-y-3">
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-black text-[10px] uppercase tracking-wider">
                <Upload size={14} />
                <span>Upload External Lexicon Files</span>
              </div>
              <p className="text-[9px] text-slate-400 leading-relaxed font-semibold">
                Import custom dictionaries directly without code modifications. Support formats include <strong className="text-slate-600 dark:text-slate-300">.TXT</strong>, <strong className="text-slate-600 dark:text-slate-300">.CSV</strong>, and <strong className="text-slate-600 dark:text-slate-300">.JSON</strong> arrays.
              </p>

              {/* Graphical File uploader box */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-900/30 py-6 rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
              >
                <div className="p-3 bg-slate-100 dark:bg-slate-950 rounded-full text-slate-400 group-hover:text-blue-500 transition-colors">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-700 dark:text-slate-300">Choose custom dictionary file</p>
                  <p className="text-[8px] text-slate-400 font-semibold mt-0.5">Drag & drop or browse from machine</p>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload}
                  accept=".txt,.csv,.json"
                  className="hidden" 
                />
              </div>

              {/* Separator */}
              <div className="relative flex items-center justify-center py-2.5">
                <hr className="w-full border-slate-100 dark:border-slate-800" />
                <span className="absolute bg-white dark:bg-slate-950 px-2.5 text-[8px] uppercase font-black text-slate-400">OR PASTE COMPACT COPIOUS LISTS</span>
              </div>

              {/* Paste Inputs Area */}
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Example CSV structure:&#10;AM, AN, AS, AT, GO, IF, IN, IS, IT, ME, MY, OF, ON, OR, SO, TO, WE..."
                rows={5}
                className="w-full text-[10px] font-mono p-3 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200"
              />

              <div className="flex gap-2">
                <button
                  onClick={handleTextareaImport}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[9px] tracking-wider rounded-xl transition-all flex items-center justify-center gap-1 shadow-sm"
                >
                  <Upload size={11} /> Validate & Apply
                </button>
                <button
                  onClick={handleResetToDefault}
                  className="px-3 border border-red-500/10 bg-red-500/5 hover:bg-red-500/10 text-red-500 rounded-xl transition-all flex items-center justify-center"
                  title="Remove Custom Pool & Recover Original"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {importStatus && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-xl border flex items-start gap-2 text-[9px] uppercase font-black ${importStatus.success ? 'bg-emerald-550/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-450' : 'bg-red-550/10 border-red-500/20 text-red-600 dark:text-red-450'}`}
                >
                  {importStatus.success ? <Check size={13} className="shrink-0 mt-0.5" /> : <AlertCircle size={13} className="shrink-0 mt-0.5" />}
                  <span>{importStatus.message}</span>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {viewTab === 'analytics' && (
          <div className="space-y-4">
            
            {/* Analytics Dashboard Grid */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/40 dark:border-slate-800/80 shadow-sm space-y-3">
              <div className="flex justify-between items-center pb-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[10px] uppercase font-black text-slate-400 block">Lexicon Submission Feedback</span>
                <button
                  onClick={handleClearLogs}
                  className="text-[8px] bg-red-500/10 text-red-600 hover:bg-red-500/15 font-black uppercase tracking-widest px-2.5 py-1 rounded-md"
                >
                  Reset Diagnostics Logging
                </button>
              </div>

              {/* Grid split */}
              <div className="space-y-4 pt-1">
                {/* 1. Complaints */}
                <div>
                  <span className="text-[9px] uppercase font-black text-orange-500 flex items-center gap-1 mb-1.5 leading-none">
                    <AlertOctagon size={11} /> Unfair Rejections Complaints ({complaintsArray.length})
                  </span>
                  <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-xl text-[9px] font-mono max-h-28 overflow-y-auto border border-black/[0.02]">
                    {complaintsArray.length === 0 ? (
                      <p className="text-slate-400 italic text-center py-2">No user disputes reported yet.</p>
                    ) : (
                      complaintsArray.map(([w, info], idx) => (
                        <div key={idx} className="flex justify-between items-center bg-orange-500/5 px-2 py-1 rounded mb-1 last:mb-0 border border-orange-500/10">
                          <span className="font-extrabold text-orange-600 uppercase">{w}</span>
                          <span className="text-slate-400">{info.count} complaints logged</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 2. Most Rejected */}
                <div>
                  <span className="text-[9px] uppercase font-black text-red-500 flex items-center gap-1 mb-1.5 leading-none">
                    <ShieldAlert size={11} /> Frequently Blocked / Rejected Spells ({rejectionsArray.length})
                  </span>
                  <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-xl text-[9px] font-mono max-h-32 overflow-y-auto border border-black/[0.02]">
                    {rejectionsArray.length === 0 ? (
                      <p className="text-slate-400 italic text-center py-2">No rejections recorded yet.</p>
                    ) : (
                      rejectionsArray.map(([w, r], idx) => (
                        <div key={idx} className="bg-red-500/5 p-2 rounded mb-1 last:mb-0 border border-red-500/10 flex flex-col gap-0.5">
                          <div className="flex justify-between items-center font-extrabold">
                            <span className="text-red-600 uppercase">{w}</span>
                            <span className="text-slate-400">{r.count} checks</span>
                          </div>
                          <div className="text-[8px] text-slate-450 uppercase font-black tracking-wide flex justify-between">
                            <span>Reason: {r.lastReason}</span>
                            <span className="text-[7px] text-slate-400 bg-slate-200 dark:bg-slate-800 px-1 rounded">{r.source}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 3. Global Attempt Frequencies */}
                <div>
                  <span className="text-[9px] uppercase font-black text-blue-500 flex items-center gap-1 mb-1.5 leading-none">
                    <Sparkles size={11} /> All Spells Attempted Frequency ({attemptsArray.length})
                  </span>
                  <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-xl text-[9px] font-mono max-h-24 overflow-y-auto border border-black/[0.02]">
                    {attemptsArray.length === 0 ? (
                      <p className="text-slate-400 italic text-center py-2">No spelling entries registered.</p>
                    ) : (
                      attemptsArray.map(([w, count], idx) => (
                        <div key={idx} className="flex justify-between items-center bg-blue-500/5 px-2 py-0.5 rounded mb-1 last:mb-0">
                          <span className="font-extrabold text-blue-600 uppercase">{w}</span>
                          <span className="text-slate-400">{count} attempts</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
