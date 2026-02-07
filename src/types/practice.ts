/**
 * Practice Types
 * Shloka Sadhana - Practice Session & History Types
 */

/**
 * Active practice session state
 */
export interface PracticeSession {
  isActive: boolean;
  startTime: string; // ISO string
  pausedTime: string | null; // ISO string when paused
  elapsedSeconds: number;
  malaCount: number;
  selectedShlokaId: string | null;
  sankalp: string | null;
}

/**
 * Completed practice record
 */
export interface CompletedPractice {
  id: string;
  date: string; // ISO string
  duration: number; // Total seconds
  malaCount: number;
  shlokaId: string | null;
  shlokaName: string | null;
  sankalp: string | null;
  offering: string | null;
  notes: string | null;
}

/**
 * Practice statistics
 */
export interface PracticeStats {
  totalPractices: number;
  totalMinutes: number;
  totalMalas: number;
  favoriteShlokaId: string | null;
  lastPracticeDate: string | null; // ISO string
}

/**
 * Goal type (daily or weekly)
 */
export type GoalType = 'daily' | 'weekly';

/**
 * Practice goal configuration
 */
export interface PracticeGoal {
  id: string;
  type: GoalType;
  targetSessions: number; // Number of sessions to complete
  currentProgress: number; // Current count of sessions
  startDate: string; // ISO string - when goal period started
  isActive: boolean;
}

/**
 * Goal progress summary
 */
export interface GoalProgress {
  goal: PracticeGoal | null;
  progressPercentage: number; // 0-100
  remainingSessions: number;
  isCompleted: boolean;
}
