/**
 * Analytics Events
 * Shloka Sadhana - Event Tracking Constants
 *
 * Centralized event names for Firebase Analytics
 * Follows Firebase naming conventions (lowercase with underscores)
 */

/**
 * Analytics Events
 *
 * All event names used throughout the app for tracking user behavior
 */
export const AnalyticsEvents = {
  // ====================
  // Practice Flow Events
  // ====================
  PRACTICE_STARTED: 'practice_started',
  PRACTICE_COMPLETED: 'practice_completed',
  PRACTICE_PAUSED: 'practice_paused',
  PRACTICE_RESUMED: 'practice_resumed',
  PRACTICE_CANCELLED: 'practice_cancelled',
  SANKALP_SET: 'sankalp_set',
  SANKALP_SKIPPED: 'sankalp_skipped',
  OFFERING_MADE: 'offering_made',
  OFFERING_SKIPPED: 'offering_skipped',

  // ====================
  // Content Discovery Events
  // ====================
  SHLOKA_VIEWED: 'shloka_viewed',
  SHLOKA_SELECTED: 'shloka_selected',
  SHLOKA_PLAYED: 'shloka_audio_played',
  LIBRARY_SEARCHED: 'library_searched',
  LIBRARY_FILTERED: 'library_filtered',

  // ====================
  // Engagement Events
  // ====================
  STREAK_ACHIEVED: 'streak_achieved',
  STREAK_LOST: 'streak_lost',
  MALA_COMPLETED: 'mala_completed',
  MALA_INCREMENTED: 'mala_incremented',
  MILESTONE_REACHED: 'milestone_reached',

  // ====================
  // Quest Events - Phase 2A
  // ====================
  QUEST_STARTED: 'quest_started',
  QUEST_COMPLETED: 'quest_completed',
  QUEST_ABANDONED: 'quest_abandoned',
  QUEST_PROGRESS_UPDATED: 'quest_progress_updated',
  QUEST_EXPIRED: 'quest_expired',

  // ====================
  // Achievement Events - Phase 2A
  // ====================
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  ACHIEVEMENT_PROGRESS_VIEWED: 'achievement_progress_viewed',
  ACHIEVEMENT_NEAR_COMPLETION: 'achievement_near_completion',

  // ====================
  // Social Sharing Events - Phase 2A Week 16
  // ====================
  SHARE_INITIATED: 'share_initiated',
  SHARE_COMPLETED: 'share_completed',
  SHARE_CANCELLED: 'share_cancelled',

  // ====================
  // Onboarding Events
  // ====================
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_STEP_COMPLETED: 'onboarding_step_completed',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  ONBOARDING_SKIPPED: 'onboarding_skipped',

  // ====================
  // Settings Events
  // ====================
  NOTIFICATION_ENABLED: 'notification_enabled',
  NOTIFICATION_DISABLED: 'notification_disabled',
  NOTIFICATION_TIME_CHANGED: 'notification_time_changed',
  HAPTICS_TOGGLED: 'haptics_toggled',
  SOUND_TOGGLED: 'sound_toggled',
  THEME_CHANGED: 'theme_changed',
  DATA_CLEARED: 'data_cleared',

  // ====================
  // Navigation Events
  // ====================
  SCREEN_VIEWED: 'screen_viewed',
  TAB_CHANGED: 'tab_changed',

  // ====================
  // Error Events
  // ====================
  ERROR_OCCURRED: 'error_occurred',
  CRASH_REPORTED: 'crash_reported',

  // ====================
  // App Lifecycle Events
  // ====================
  APP_OPENED: 'app_opened',
  APP_BACKGROUNDED: 'app_backgrounded',
  APP_FOREGROUNDED: 'app_foregrounded',
} as const;

/**
 * Event property keys
 *
 * Standardized keys for event properties to ensure consistency
 */
export const AnalyticsProperties = {
  // Practice properties
  SHLOKA_ID: 'shloka_id',
  SHLOKA_NAME: 'shloka_name',
  DURATION_SECONDS: 'duration_seconds',
  MALA_COUNT: 'mala_count',
  HAS_SANKALP: 'has_sankalp',
  HAS_OFFERING: 'has_offering',

  // Streak properties
  CURRENT_STREAK: 'current_streak',
  LONGEST_STREAK: 'longest_streak',
  STREAK_DAYS: 'streak_days',

  // Content properties
  SEARCH_QUERY: 'search_query',
  FILTER_TYPE: 'filter_type',
  FILTER_VALUE: 'filter_value',
  RESULTS_COUNT: 'results_count',

  // Onboarding properties
  STEP_NUMBER: 'step_number',
  EXPERIENCE_LEVEL: 'experience_level',
  DAILY_TIME: 'daily_time',
  PREFERRED_DEITY: 'preferred_deity',

  // Settings properties
  NOTIFICATION_TIME: 'notification_time',
  HAPTICS_ENABLED: 'haptics_enabled',
  SOUND_ENABLED: 'sound_enabled',
  THEME_MODE: 'theme_mode',

  // Error properties
  ERROR_MESSAGE: 'error_message',
  ERROR_CODE: 'error_code',
  ERROR_CATEGORY: 'error_category',
  SCREEN_NAME: 'screen_name',

  // Quest properties - Phase 2A
  QUEST_ID: 'quest_id',
  QUEST_TYPE: 'quest_type',
  QUEST_DIFFICULTY: 'quest_difficulty',
  QUEST_TARGET: 'quest_target',
  QUEST_PROGRESS: 'quest_progress',
  QUEST_XP: 'quest_xp',

  // Achievement properties - Phase 2A
  ACHIEVEMENT_ID: 'achievement_id',
  ACHIEVEMENT_NAME: 'achievement_name',
  ACHIEVEMENT_CATEGORY: 'achievement_category',
  ACHIEVEMENT_RARITY: 'achievement_rarity',
  ACHIEVEMENT_XP: 'achievement_xp',
} as const;

/**
 * Type for event names (for type safety)
 */
export type AnalyticsEventName =
  (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];

/**
 * Type for property keys (for type safety)
 */
export type AnalyticsPropertyKey =
  (typeof AnalyticsProperties)[keyof typeof AnalyticsProperties];
