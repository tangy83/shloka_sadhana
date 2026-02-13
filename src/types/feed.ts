/**
 * Feed Types
 * Shloka Sadhana - Phase 2A: Engagement Core
 *
 * Type definitions for personalized home feed system
 */

/**
 * Feed Section Types
 * Different types of content that can appear in the home feed
 */
export type FeedSectionType =
  | 'resume_practice'
  | 'daily_quest'
  | 'streak_recovery'
  | 'achievement_progress'
  | 'recommended_shloka'
  | 'friend_activity'
  | 'group_challenge'
  | 'recently_practiced'
  | 'verse_of_day'
  | 'hindu_calendar'
  | 'daily_wisdom';

/**
 * Base score for each section type (before personalization)
 */
export const FEED_BASE_SCORES: Record<FeedSectionType, number> = {
  resume_practice: 100,
  daily_quest: 95,
  streak_recovery: 90,
  achievement_progress: 80,
  recommended_shloka: 70,
  friend_activity: 60,
  group_challenge: 55,
  recently_practiced: 50,
  verse_of_day: 45,
  hindu_calendar: 40,
  daily_wisdom: 35,
};

/**
 * Feed Section
 * Represents a single section in the personalized feed
 */
export interface FeedSection {
  id: string;
  type: FeedSectionType;
  score: number; // Calculated relevance score
  data?: any; // Section-specific data
  timestamp: string; // When this section was generated
}

/**
 * User Context for Feed Personalization
 * Information used to calculate section scores
 */
export interface FeedContext {
  // User profile
  userId: string;
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  preferredDeity?: string;
  dailyTime?: '5-10' | '10-20' | '20+' | 'flexible';

  // Practice behavior
  currentStreak: number;
  totalPractices: number;
  lastPracticedDate: string | null;
  recentlyPracticed: string[]; // Shloka IDs

  // Quest state
  hasActiveQuest: boolean;
  completedQuestToday: boolean;
  questProgress?: number;

  // Achievement state
  nearCompleteAchievements: number; // Count of achievements ≤3 away

  // Social state (Week 16+)
  hasFriends?: boolean;
  newFriendActivity?: boolean;

  // Group state (Week 17+)
  hasGroups?: boolean;
  activeGroupChallenge?: boolean;

  // Time context
  currentHour: number;
  isEkadashi?: boolean;
  isFestival?: boolean;
}

/**
 * Feed Configuration
 * Settings for feed generation
 */
export interface FeedConfig {
  maxSections: number; // Maximum sections to show (default: 8-10)
  minScore: number; // Minimum score threshold (default: 30)
  refreshInterval: number; // Minutes until feed refresh (default: 30)
  enablePersonalization: boolean; // Use scoring algorithm (default: true)
}

/**
 * Cached Feed
 * Stored in useUserStore for performance
 */
export interface CachedFeed {
  sections: FeedSection[];
  generatedAt: string;
  context: FeedContext;
  config: FeedConfig;
}

/**
 * Feed Section Boost
 * Additional score adjustments based on conditions
 */
export interface FeedSectionBoost {
  condition: string; // Description of boost condition
  score: number; // Score adjustment (+/- points)
  reason: string; // User-facing explanation
}

/**
 * Default feed configuration
 */
export const DEFAULT_FEED_CONFIG: FeedConfig = {
  maxSections: 10,
  minScore: 30,
  refreshInterval: 30, // minutes
  enablePersonalization: true,
};
