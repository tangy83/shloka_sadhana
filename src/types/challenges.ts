/**
 * Challenge Types
 * Shloka Sadhana - Phase 2A Week 18: Group Challenges
 *
 * Types for group practice challenges and leaderboards
 */

/**
 * Challenge Types
 * Different competitive formats for group challenges
 */
export type ChallengeType =
  | 'practices'    // Total practice sessions
  | 'malas'        // Total mala completions
  | 'minutes'      // Total practice minutes
  | 'consistency'; // Highest streak during challenge period

/**
 * Challenge Status
 */
export type ChallengeStatus = 'active' | 'completed' | 'cancelled';

/**
 * Challenge Duration Preset
 */
export type ChallengeDuration = 7 | 14 | 30; // Days

/**
 * Challenge
 */
export interface Challenge {
  id: string;
  groupId: string;
  groupName: string; // Denormalized for display
  type: ChallengeType;
  goal: number; // Target to reach (e.g., 100 practices, 1000 malas)
  duration: ChallengeDuration; // In days
  startedAt: string; // ISO timestamp
  endsAt: string; // ISO timestamp
  status: ChallengeStatus;
  createdBy: string; // User ID
  createdByName: string; // Denormalized
  participantCount: number;
  winners: string[]; // User IDs of top 3
  createdAt: string; // ISO timestamp
  completedAt: string | null; // When challenge ended
}

/**
 * Challenge Leaderboard Entry
 */
export interface ChallengeLeaderboardEntry {
  userId: string;
  displayName: string; // Denormalized
  photoURL: string | null; // Denormalized
  score: number; // Practices, malas, minutes, or streak depending on type
  rank: number; // Position in leaderboard (1-based)
  lastUpdated: string; // ISO timestamp
  isCurrentUser: boolean; // Highlight current user
}

/**
 * Challenge Progress
 * User's progress in a challenge
 */
export interface ChallengeProgress {
  challengeId: string;
  userId: string;
  score: number;
  rank: number;
  percentToGoal: number; // 0-100
  isWinner: boolean; // Top 3
}

/**
 * Challenge Stats
 * Summary statistics for challenges
 */
export interface ChallengeStats {
  totalChallenges: number;
  activeChallenges: number;
  completedChallenges: number;
  challengesWon: number; // First place finishes
  totalWins: number; // Any top-3 finish
  mostRecentWin: {
    challengeId: string;
    challengeName: string;
    rank: number;
    completedAt: string;
  } | null;
}

/**
 * Challenge Creation Data
 */
export interface CreateChallengeData {
  type: ChallengeType;
  goal: number;
  duration: ChallengeDuration;
}

/**
 * Challenge Filter Options
 */
export interface ChallengeFilterOptions {
  status?: ChallengeStatus;
  groupId?: string;
  limit?: number;
}

/**
 * Challenge Notification
 * For winner announcements and updates
 */
export interface ChallengeNotification {
  id: string;
  challengeId: string;
  challengeName: string;
  type: 'started' | 'completed' | 'winner_announced';
  message: string;
  createdAt: string;
  read: boolean;
}
