/**
 * AsyncStorage Keys
 * Shloka Sadhana
 *
 * All keys are prefixed with @shloka_sadhana: to avoid conflicts with other apps
 */

export const STORAGE_KEYS = {
  // Core practice data
  STREAK: '@shloka_sadhana:streak',
  SESSIONS: '@shloka_sadhana:sessions',
  TODAY_SANKALP: '@shloka_sadhana:today_sankalp',
  GOAL: '@shloka_sadhana:practice_goal',

  // App settings
  SETTINGS: '@shloka_sadhana:settings',
  THEME: '@shloka_sadhana:theme',
  FONT_SIZE: '@shloka_sadhana:font_size',
  USER_LOCATION: '@shloka_sadhana:user_location', // V3 Feature #4

  // Onboarding & first-time experience
  ONBOARDING_COMPLETE: '@shloka_sadhana:onboarding_complete',
  SANKALP_EXPLANATION_SEEN: '@shloka_sadhana:sankalp_explanation_seen',
  STREAK_RECOVERY_LAST_SHOWN: '@shloka_sadhana:streak_recovery_last_shown',

  // Phase 2A Week 18: Referral program
  PENDING_REFERRAL_CODE: '@shloka_sadhana:pending_referral_code',

  // Wisdom teachings unlock status
  WISDOM_UNLOCKED: '@shloka_sadhana:wisdom_unlocked',

  // Future: Cloud sync status
  LAST_SYNC: '@shloka_sadhana:last_sync',
  SYNC_ENABLED: '@shloka_sadhana:sync_enabled',
} as const;

// Type-safe keys
export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
