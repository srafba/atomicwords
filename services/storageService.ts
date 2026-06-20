import { LeaderboardEntry, User, Language } from "../types";

const CURRENT_USER_KEY = 'atomic_current_session';
const USERS_DB_KEY = 'atomic_users_db'; // Simulates a database
const SCORES_KEY = 'atomic_scores';

// --- Auth & User Management ---

const getUsersDB = (): User[] => {
  const data = localStorage.getItem(USERS_DB_KEY);
  return data ? JSON.parse(data) : [];
};

const saveUsersDB = (users: User[]) => {
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
};

export const registerUser = (username: string, email: string, password: string): { success: boolean; message?: string; user?: User } => {
  const users = getUsersDB();
  
  if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    return { success: false, message: "Username already taken." };
  }
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, message: "Email already registered." };
  }

  // Define default unlocked items (Basic items are free)
  const defaultInventory = [
    // Hair Styles
    'hair_bald', 'hair_short', 'hair_spiky', 'hair_long', 'hair_bob',
    // Hair Colors
    'hcolor_black', 'hcolor_brown', 'hcolor_blonde', 'hcolor_red', 'hcolor_gray',
    // Tops
    'top_tshirt', 'top_shirt', 'top_hoodie',
    // Top Colors
    'tcolor_blue', 'tcolor_red', 'tcolor_black', 'tcolor_white', 'tcolor_green',
    // Bottoms
    'bot_shorts', 'bot_pants', 'bot_skirt',
    // Bottom Colors
    'bcolor_jeans', 'bcolor_black', 'bcolor_khaki',
    // Beards
    'beard_none', 'beard_stubble', 'beard_full', 'beard_mustache',
    // Accessories (Basic glasses are free)
    'acc_none', 'acc_glasses' 
  ];

  const newUser: User = {
    id: crypto.randomUUID(),
    username,
    email,
    password, 
    lastUsernameChange: Date.now(),
    coins: 100, // Sign up bonus
    inventory: defaultInventory,
    avatar: {
        skinTone: '#f5d0b0',
        hairStyle: 'short',
        hairColor: '#4a3000',
        topType: 'tshirt',
        topColor: '#3b82f6',
        bottomType: 'shorts',
        bottomColor: '#1f2937',
        beard: 'none',
        accessory: 'none'
    },
    settings: {
      sfxVolume: 50,
      musicVolume: 50,
      communications: true,
      language: Language.ENGLISH
    }
  };

  users.push(newUser);
  saveUsersDB(users);
  saveSession(newUser);
  return { success: true, user: newUser };
};

export const createGuestUser = (username: string): User => {
  const defaultInventory = [
    // Hair Styles
    'hair_bald', 'hair_short', 'hair_spiky', 'hair_long', 'hair_bob',
    // Hair Colors
    'hcolor_black', 'hcolor_brown', 'hcolor_blonde', 'hcolor_red', 'hcolor_gray',
    // Tops
    'top_tshirt', 'top_shirt', 'top_hoodie',
    // Top Colors
    'tcolor_blue', 'tcolor_red', 'tcolor_black', 'tcolor_white', 'tcolor_green',
    // Bottoms
    'bot_shorts', 'bot_pants', 'bot_skirt',
    // Bottom Colors
    'bcolor_jeans', 'bcolor_black', 'bcolor_khaki',
    // Beards
    'beard_none', 'beard_stubble', 'beard_full', 'beard_mustache',
    // Accessories (Basic glasses are free)
    'acc_none', 'acc_glasses' 
  ];

  const guestUser: User = {
    id: crypto.randomUUID(),
    username,
    email: `${username.toLowerCase()}@guest.atomicwords.io`,
    password: 'guest-no-password',
    lastUsernameChange: Date.now(),
    coins: 100,
    inventory: defaultInventory,
    avatar: {
      skinTone: '#f5d0b0',
      hairStyle: 'short',
      hairColor: '#4a3000',
      topType: 'tshirt',
      topColor: '#3b82f6',
      bottomType: 'shorts',
      bottomColor: '#1f2937',
      beard: 'none',
      accessory: 'none'
    },
    settings: {
      sfxVolume: 50,
      musicVolume: 50,
      communications: true,
      language: Language.ENGLISH
    }
  };

  const users = getUsersDB();
  users.push(guestUser);
  saveUsersDB(users);
  saveSession(guestUser);
  return guestUser;
};

export const loginUser = (username: string, password: string): { success: boolean; message?: string; user?: User } => {
  const users = getUsersDB();
  // Allow login by username OR email
  const user = users.find(u => 
    u.username.toLowerCase() === username.toLowerCase() || 
    u.email.toLowerCase() === username.toLowerCase()
  );

  if (!user || user.password !== password) {
    return { success: false, message: "Invalid credentials." };
  }

  saveSession(user);
  return { success: true, user };
};

export const requestPasswordReset = (email: string): { success: boolean; message: string } => {
  const users = getUsersDB();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (user) {
    return { success: true, message: `Reset link sent to ${email}` };
  } else {
    return { success: false, message: "Email not found." };
  }
};

export const updateUserProfile = (updatedUser: User): { success: boolean; message?: string } => {
  const users = getUsersDB();
  const index = users.findIndex(u => u.id === updatedUser.id);
  
  if (index === -1) return { success: false, message: "User not found." };

  // Check username uniqueness if changed
  if (users[index].username.toLowerCase() !== updatedUser.username.toLowerCase()) {
      const exists = users.some(u => u.id !== updatedUser.id && u.username.toLowerCase() === updatedUser.username.toLowerCase());
      if (exists) return { success: false, message: "Username taken." };
  }

  users[index] = updatedUser;
  saveUsersDB(users);
  saveSession(updatedUser);
  return { success: true };
};

// --- Session Management ---

export const saveSession = (user: User) => {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
};

export const getSession = (): User | null => {
  const data = localStorage.getItem(CURRENT_USER_KEY);
  return data ? JSON.parse(data) : null;
};

export const clearSession = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

// --- Scores ---

export const saveScore = (entry: LeaderboardEntry) => {
  const scores = getScores();
  scores.push(entry);
  scores.sort((a, b) => b.score - a.score);
  const topScores = scores.slice(0, 20);
  localStorage.setItem(SCORES_KEY, JSON.stringify(topScores));
};

export const getScores = (): LeaderboardEntry[] => {
  const data = localStorage.getItem(SCORES_KEY);
  return data ? JSON.parse(data) : [];
};