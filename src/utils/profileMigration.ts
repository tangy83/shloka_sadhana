/**
 * Profile Migration Utility
 * Shloka Sadhana - Phase 2A Week 16: Friend System
 *
 * Migrates existing users to the new social profile system
 */

import auth from '@react-native-firebase/auth';
import { friendService } from '@/services/friendService';
import { useUserStore } from '@/stores/useUserStore';
import { analyticsService } from '@/services/analytics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MIGRATION_KEY = 'social_profile_migrated';

/**
 * Check if user has been migrated to social profile
 */
export const hasProfileMigrated = async (): Promise<boolean> => {
  try {
    const migrated = await AsyncStorage.getItem(MIGRATION_KEY);
    return migrated === 'true';
  } catch (error) {
    console.error('[ProfileMigration] Error checking migration status:', error);
    return false;
  }
};

/**
 * Mark user as migrated
 */
const markAsMigrated = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(MIGRATION_KEY, 'true');
  } catch (error) {
    console.error('[ProfileMigration] Error marking as migrated:', error);
  }
};

/**
 * Migrate existing user to social profile system
 *
 * Called when:
 * - User signs in for the first time after social features launch
 * - User signs up (create profile immediately)
 *
 * @param forceUpdate - Force update even if already migrated (for re-syncing stats)
 */
export const migrateUserToSocialProfile = async (forceUpdate: boolean = false): Promise<void> => {
  const user = auth().currentUser;

  if (!user) {
    console.log('[ProfileMigration] No authenticated user, skipping migration');
    return;
  }

  // Check if already migrated (unless forcing update)
  if (!forceUpdate) {
    const migrated = await hasProfileMigrated();
    if (migrated) {
      console.log('[ProfileMigration] User already migrated, skipping');
      return;
    }
  }

  try {
    console.log('[ProfileMigration] Starting profile migration for user:', user.uid);

    // Get current user stats from Zustand store
    const userState = useUserStore.getState();
    const {
      currentStreak,
      totalPractices,
      totalMinutes,
      preferences,
    } = userState;

    // Prepare profile data
    const profileData = {
      displayName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
      photoURL: user.photoURL || null,
      currentStreak: currentStreak || 0,
      totalPractices: totalPractices || 0,
      totalMinutes: totalMinutes || 0,
      favoriteDeity: preferences?.preferredDeity,
    };

    // Create or update public profile
    await friendService.createOrUpdateProfile(user.uid, profileData);

    // Mark as migrated
    await markAsMigrated();

    // Track migration completion
    analyticsService.trackEvent('social_profile_migrated', {
      had_previous_data: totalPractices > 0,
      streak: currentStreak,
      total_practices: totalPractices,
    });

    console.log('[ProfileMigration] Profile migration completed successfully');
  } catch (error) {
    console.error('[ProfileMigration] Error during migration:', error);

    // Track migration failure
    analyticsService.trackEvent('social_profile_migration_failed', {
      error_message: error instanceof Error ? error.message : 'Unknown error',
    });

    throw error;
  }
};

/**
 * Update user's public profile with latest stats
 *
 * Called after:
 * - Completing a practice
 * - Achieving a streak milestone
 * - Updating profile settings
 */
export const syncProfileStats = async (): Promise<void> => {
  const user = auth().currentUser;

  if (!user) {
    return;
  }

  try {
    const userState = useUserStore.getState();
    const {
      currentStreak,
      totalPractices,
      totalMinutes,
      preferences,
    } = userState;

    await friendService.createOrUpdateProfile(user.uid, {
      displayName: user.displayName || 'Anonymous',
      photoURL: user.photoURL,
      currentStreak,
      totalPractices,
      totalMinutes,
      favoriteDeity: preferences?.preferredDeity,
    });

    console.log('[ProfileMigration] Profile stats synced');
  } catch (error) {
    console.error('[ProfileMigration] Error syncing profile stats:', error);
    // Don't throw - sync failures shouldn't break the app
  }
};

/**
 * Reset migration state (for testing)
 */
export const resetMigration = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(MIGRATION_KEY);
    console.log('[ProfileMigration] Migration state reset');
  } catch (error) {
    console.error('[ProfileMigration] Error resetting migration:', error);
  }
};
