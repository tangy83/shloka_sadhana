/**
 * Quest System Types
 * Shloka Sadhana - Phase 2A: Engagement Core
 *
 * Daily quest system to drive engagement with progressive difficulty
 */

/**
 * Quest types based on user experience level
 */
export type QuestType =
  | 'practice_once' // Complete 1 practice session
  | 'practice_duration' // Practice for X minutes
  | 'complete_sessions' // Complete X sessions in a day
  | 'practice_with_sankalp' // Practice with intention set
  | 'complete_mala' // Complete X malas
  | 'practice_specific_shloka'; // Practice a specific deity/shloka

/**
 * Quest difficulty levels
 */
export type QuestDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

/**
 * Quest status
 */
export type QuestStatus = 'active' | 'completed' | 'expired' | 'abandoned';

/**
 * Main Quest interface
 */
export interface Quest {
  id: string; // UUID
  type: QuestType;
  difficulty: QuestDifficulty;
  name: string; // Display name (e.g., "First Steps")
  description: string; // User-facing description
  target: number; // Goal value (e.g., 1 practice, 600 seconds, 2 sessions)
  progress: number; // Current progress toward target
  xpReward: number; // XP awarded on completion
  status: QuestStatus;
  startedAt: string; // ISO timestamp
  expiresAt: string; // ISO timestamp (midnight local time)
  completedAt?: string; // ISO timestamp (if completed)
}

/**
 * Quest progress update payload
 */
export interface QuestProgressUpdate {
  practiceCompleted: boolean; // Did user complete a practice?
  duration: number; // Practice duration in seconds
  malaCount: number; // Number of malas completed
  hasSankalp: boolean; // Was sankalp (intention) set?
  shlokaId?: string; // Which shloka was practiced
}

/**
 * Quest reward
 */
export interface QuestReward {
  xp: number; // XP points earned
  badge?: string; // Optional badge ID (e.g., 'quest_streak_7')
  message: string; // Celebration message
}

/**
 * Quest history entry
 */
export interface CompletedQuest {
  questId: string;
  type: QuestType;
  difficulty: QuestDifficulty;
  completedAt: string; // ISO timestamp
  xpEarned: number;
  completionTime: number; // Minutes taken to complete
}

/**
 * Quest statistics
 */
export interface QuestStats {
  totalCompleted: number; // All-time quests completed
  questStreak: number; // Consecutive days with quest completion
  longestQuestStreak: number; // Best ever streak
  totalXP: number; // Total XP earned from quests
  completionRate: number; // Percentage (0-100)
  favoriteQuestType: QuestType | null; // Most completed type
}

/**
 * Quest generation config
 */
export interface QuestGenerationConfig {
  userLevel: QuestDifficulty;
  totalPractices: number; // User's practice count
  currentStreak: number; // User's current streak
  preferredDeity?: string; // From user preferences
}
