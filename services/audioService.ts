/**
 * Web Audio API retro-inspired audio synthesis engine for Atomic Words
 */

// Global sound configurations
let sfxEnabled = true;
let musicEnabled = false;

let audioCtx: AudioContext | null = null;
let musicInterval: any = null;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

export const setSfxEnabled = (enabled: boolean) => {
  sfxEnabled = enabled;
};

export const setMusicEnabled = (enabled: boolean) => {
  musicEnabled = enabled;
  if (enabled) {
    playBackgroundMusic();
  } else {
    stopBackgroundMusic();
  }
};

/**
 * Play a synthesized sound effect
 */
export const playSound = (type: 'tap' | 'success' | 'error' | 'levelUp' | 'click' | 'hint') => {
  if (!sfxEnabled) return;
  
  try {
    initAudio();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'tap') {
      // Crisp atomic high-pop click
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);
      gainNode.gain.setValueAtTime(0.12, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } 
    else if (type === 'click') {
      // Soft navigation tick
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.06);
      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
      osc.start(now);
      osc.stop(now + 0.06);
    }
    else if (type === 'success') {
      // Satisfying sci-fi double chime
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } 
    else if (type === 'error') {
      // Deep reactor buzz
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(90, now + 0.25);
      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } 
    else if (type === 'hint') {
      // Mystical electronic sweep
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, now);
      osc.frequency.exponentialRampToValueAtTime(500, now + 0.2);
      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    }
    else if (type === 'levelUp') {
      // Glorious atomic triumph arpeggio!
      const duration = 0.5;
      osc.type = 'triangle';
      const notes = [440, 554, 659, 880, 1109];
      notes.forEach((freq, index) => {
        osc.frequency.setValueAtTime(freq, now + (index * 0.08));
      });
      gainNode.gain.setValueAtTime(0.18, now);
      gainNode.gain.linearRampToValueAtTime(0.18, now + 0.3);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
      osc.start(now);
      osc.stop(now + duration);
    }
  } catch (e) {
    console.warn("Audio Context blocked or unsupported in this container:", e);
  }
};

/**
 * Play an offline cosmic chiptune melody
 */
export const playBackgroundMusic = () => {
  if (!musicEnabled) return;
  try {
    initAudio();
    if (!audioCtx) return;
    
    stopBackgroundMusic(); // clear previous loop
    
    let noteIndex = 0;
    // Fun spacey background chord progression (Pentatonic scale for absolute harmony)
    const notes = [
      261.63, 293.66, 329.63, 392.00, 440.00, // C4 D4 E4 G4 A4
      523.25, 587.33, 659.25, 783.99, 880.00  // C5 D5 E5 G5 A5
    ];
    // Gentle 8-note cosmic sequence
    const pattern = [2, 4, 3, 5, 4, 7, 6, 8, 5, 3, 4, 2, 0, 1, 3, 2];

    musicInterval = setInterval(() => {
      if (!musicEnabled || !audioCtx) return;
      
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.type = 'sine';
      const noteFreq = notes[pattern[noteIndex % pattern.length]];
      osc.frequency.setValueAtTime(noteFreq, now);
      
      // Extremely gentle ambient envelope
      gainNode.gain.setValueAtTime(0.04, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      
      osc.start(now);
      osc.stop(now + 0.55);
      
      noteIndex++;
    }, 600); // Quiet notes repeating every 600ms
  } catch (e) {
    console.warn(e);
  }
};

export const stopBackgroundMusic = () => {
  if (musicInterval) {
    clearInterval(musicInterval);
    musicInterval = null;
  }
};
