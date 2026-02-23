/**
 * TypeScript Type Definitions
 * Shloka Sadhana - Spiritual Practice Companion
 */

// ============================================================================
// Core Data Models
// ============================================================================

/**
 * Streak tracking data stored in AsyncStorage
 */
export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null; // ISO date (YYYY-MM-DD)
  totalPractices: number;
}

/**
 * Individual practice session
 */
export interface PracticeSession {
  id: string; // UUID
  date: string; // ISO date (YYYY-MM-DD)
  timestamp: number; // Unix timestamp (milliseconds)
  duration: number; // seconds
  count: number; // mala count
  shlokaId?: string; // ID of shloka practiced (optional)
  sankalp?: string; // Intention before practice (optional)
  offering?: string; // Dedication after practice (optional)
  reflection?: string; // Journal after practice (optional)
  completed: boolean; // Session completed successfully (min 60 seconds)
}

/**
 * Shloka (prayer/mantra) definition
 */
export interface Shloka {
  id: string;
  name: string; // Full name (e.g., "Vishnu Sahasranam")
  shortName: string; // Short name (e.g., "Sahasranam")
  deity: string; // Associated deity (e.g., "Lord Vishnu")
  category?: string; // Category (e.g., "Mantra", "Stotra", "Chalisa") - V3 Feature #8
  description: string; // Brief description
  benefits: string; // Spiritual benefits
  duration: string; // Typical duration (e.g., "30-45 minutes")
  bestTime: string; // Best time to practice (e.g., "Morning")
  youtubeUrl: string; // YouTube link for learning
  audioUrl?: string; // Audio pronunciation URL (optional)
  sections: ShlokaSection[]; // Verses with meanings
}

/**
 * Individual verse/section of a shloka
 */
export interface ShlokaSection {
  id: number;
  sanskrit: string; // Sanskrit text (Devanagari)
  transliteration: string; // Romanized Sanskrit (IAST or Harvard-Kyoto)
  meaning: string; // English translation/meaning
  hindi?: string; // Hindi translation/meaning (optional) - V3 Feature #8
}

/**
 * Wisdom teaching unlocked by streak milestones
 */
export interface WisdomTeaching {
  days: number; // Streak milestone to unlock (e.g., 7, 21, 40, 108)
  title: string; // Teaching title
  text: string; // Teaching content
  unlocked: boolean; // Unlocked status (calculated from streak)
}

/**
 * Anonymous satsang reflection from community
 */
export interface SatsangReflection {
  id: number;
  text: string; // Reflection content
  time: string; // Time/date shared (e.g., "2 days ago")
  location: string; // General location (e.g., "India", "USA")
}

/**
 * Moon phase information (Hindu calendar)
 */
export interface MoonPhase {
  phase: string; // Moon emoji (e.g., "🌕", "🌑")
  name: string; // Paksha name (e.g., "Shukla Paksha", "Krishna Paksha")
  desc: string; // Description (e.g., "Waxing moon — ideal for new beginnings")
}

/**
 * Paanchang (Hindu calendar) data for a specific date
 */
export interface PaanchangData {
  date: string; // ISO date (YYYY-MM-DD)
  tithi: string; // Lunar day (e.g., "Pratipada", "Ekadashi")
  tithiNumber: number; // Tithi number (1-15 for Shukla/Krishna Paksha)
  nakshatra: string; // Lunar mansion (e.g., "Ashwini", "Rohini")
  paksha: 'Shukla' | 'Krishna'; // Lunar fortnight (waxing/waning)
  hinduMonth: string; // Hindu month (e.g., "Chaitra", "Vaishakha")
  weekday: string; // Sanskrit weekday (e.g., "Somvar", "Guruvar")
  weekdayEnglish: string; // English weekday (e.g., "Monday", "Thursday")
  isEkadashi: boolean; // Is it Ekadashi (11th Tithi)?
  ekadasiName?: string; // Special Ekadashi name (e.g., "Nirjala", "Mokshada")
}

/**
 * Muhurat (auspicious time) information
 */
export interface MuhuratData {
  date: string; // ISO date (YYYY-MM-DD)
  sunrise: string; // HH:MM format (24-hour)
  sunset: string; // HH:MM format (24-hour)
  brahmaMuhurta: {
    start: string; // HH:MM format (24-hour)
    end: string; // HH:MM format (24-hour)
  };
  abhijitMuhurat?: {
    start: string; // HH:MM format (24-hour)
    end: string; // HH:MM format (24-hour)
  };
  rahuKaal?: {
    start: string; // HH:MM format (24-hour)
    end: string; // HH:MM format (24-hour)
  };
}

/**
 * Location data for Paanchang calculations
 */
export interface LocationData {
  latitude: number;
  longitude: number;
  timezone: string; // IANA timezone (e.g., "Asia/Kolkata")
}

/**
 * Hindu festival/vrat information
 */
export interface Festival {
  id: string; // Unique festival ID
  name: string; // Festival name
  date: string; // ISO date (YYYY-MM-DD)
  type: 'festival' | 'vrat' | 'ekadashi' | 'celebration' | 'puja'; // Festival type
  description: string; // Description and significance
}

/**
 * Festival with days remaining (for upcoming festivals)
 */
export interface FestivalWithCountdown extends Festival {
  daysRemaining: number; // Days until festival
}

/**
 * Local user profile — stored in AsyncStorage only, no cloud
 */
export interface UserProfile {
  displayName: string; // e.g. "Priya" — shown in home greeting
  avatarEmoji: string; // e.g. "🙏" — shown alongside name
}

/**
 * App settings stored in AsyncStorage
 */
export interface AppSettings {
  notificationsEnabled: boolean;
  notificationTime: string; // HH:MM format (24-hour)
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  theme: 'dark' | 'light'; // Future: light theme support
}

// ============================================================================
// Navigation Types (React Navigation)
// ============================================================================

/**
 * Root stack param list for type-safe navigation
 */
export type RootStackParamList = {
  Home: undefined;
  Library: undefined;
  ShlokaDetail: { shlokaId: string };
  Practice: { shlokaId?: string; shlokaName?: string };
  Satsang: undefined;
  Wisdom: undefined;
  Settings: undefined;
  FestivalsList: undefined; // V3 Feature #3
  SessionHistory: undefined;
};

/**
 * Bottom tab param list
 */
export type BottomTabParamList = {
  Home: undefined;
  Library: undefined;
  Satsang: undefined;
  Wisdom: undefined;
};

// ============================================================================
// Helper Types
// ============================================================================

/**
 * Loading state for async operations
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Error with message
 */
export interface AppError {
  message: string;
  code?: string;
  timestamp: number;
}

/**
 * Generic async state
 */
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: AppError | null;
}
