/**
 * Achievement Store
 * Shloka Sadhana - Phase 2A: Engagement Core
 *
 * Zustand store for achievement state management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Achievement,
  UnlockedAchievement,
  AchievementProgress,
  AchievementStats,
  AchievementCheckResult,
} from '@/types/achievements';
import { achievementService, ACHIEVEMENTS } from '@/services/achievementService';
import { asyncStoragePersist } from './middleware/storage';
import { getItem, setItem } from '@/utils/storage';
import { firestoreService } from '@/services/firestore';
import { activityService } from '@/services/activityService';
import auth from '@react-native-firebase/auth';

// Storage keys
const UNLOCKED_ACHIEVEMENTS_KEY = 'unlocked_achievements';
const ACHIEVEMENT_STATS_KEY = 'achievement_stats';

interface AchievementState {
  // Unlocked achievements
  unlockedAchievements: UnlockedAchievement[];
  unlockedAchievementIds: string[];

  // Achievement stats
  stats: AchievementStats;

  // UI state
  showUnlockModal: boolean;
  pendingUnlocks: Achievement[]; // Achievements waiting to be shown in modal
  currentUnlock: Achievement | null; // Currently displayed achievement

  // Actions
  checkAchievements: (userStats: {
    practiceStats: any;
    questStats: any;
    socialStats?: any;
    groupStats?: any;
  }) => Promise<AchievementCheckResult>;
  unlockAchievement: (achievement: Achievement) => Promise<void>;
  showNextUnlock: () => void;
  dismissUnlockModal: () => void;
  getAchievementProgress: (achievementId: string, userStats: any) => AchievementProgress | null;
  getNearCompletion: (userStats: any) => AchievementProgress[];
  loadAchievementData: () => Promise<void>;
  refreshStats: () => Promise<void>;

  // Cloud sync - Phase 2A Week 13
  syncToCloud: () => Promise<void>;
  loadFromCloud: () => Promise<void>;
}

export const useAchievementStore = create<AchievementState>()(
  persist(
    (set, get) => ({
      // Initial state
      unlockedAchievements: [],
      unlockedAchievementIds: [],
      stats: {
        totalUnlocked: 0,
        totalAchievements: ACHIEVEMENTS.length,
        completionPercentage: 0,
        totalXPFromAchievements: 0,
        unlockedByCategory: {
          streak: 0,
          practice: 0,
          mala: 0,
          quest: 0,
          social: 0,
          group: 0,
        },
        rarestAchievement: null,
      },
      showUnlockModal: false,
      pendingUnlocks: [],
      currentUnlock: null,

      /**
       * Check achievements against user stats
       * Returns newly unlocked achievements
       */
      checkAchievements: async (userStats) => {
        const { unlockedAchievementIds } = get();

        try {
          // Check all achievements
          const result = achievementService.checkAchievements(
            userStats,
            unlockedAchievementIds
          );

          // If new achievements unlocked, queue them
          if (result.newlyUnlocked.length > 0) {
            console.log(
              `[AchievementStore] ${result.newlyUnlocked.length} new achievements unlocked!`
            );

            // Add to pending unlocks
            set({
              pendingUnlocks: [...get().pendingUnlocks, ...result.newlyUnlocked],
            });

            // Unlock each achievement
            for (const achievement of result.newlyUnlocked) {
              await get().unlockAchievement(achievement);
            }

            // Show first unlock modal
            if (!get().showUnlockModal) {
              get().showNextUnlock();
            }
          }

          return result;
        } catch (error) {
          console.error('[AchievementStore] Error checking achievements:', error);
          return {
            newlyUnlocked: [],
            nearCompletion: [],
            totalXPEarned: 0,
          };
        }
      },

      /**
       * Unlock an achievement
       */
      unlockAchievement: async (achievement: Achievement) => {
        const { unlockedAchievements, unlockedAchievementIds } = get();

        // Check if already unlocked
        if (unlockedAchievementIds.includes(achievement.id)) {
          console.warn('[AchievementStore] Achievement already unlocked:', achievement.id);
          return;
        }

        try {
          // Create unlocked achievement record
          const unlockedAchievement: UnlockedAchievement = {
            achievementId: achievement.id,
            achievement,
            unlockedAt: new Date().toISOString(),
            xpEarned: achievement.xpReward,
            celebrationShown: false,
          };

          // Add to unlocked list
          const updatedUnlocked = [...unlockedAchievements, unlockedAchievement];
          const updatedIds = [...unlockedAchievementIds, achievement.id];

          // Update state
          set({
            unlockedAchievements: updatedUnlocked,
            unlockedAchievementIds: updatedIds,
          });

          // Persist to storage
          await setItem(UNLOCKED_ACHIEVEMENTS_KEY, updatedUnlocked);

          // Refresh stats
          await get().refreshStats();

          // Sync to cloud (if authenticated)
          await get().syncToCloud();

          // Phase 2A Week 17: Post achievement activity to friend feeds (non-blocking)
          if (auth().currentUser) {
            activityService
              .postAchievementActivity(
                achievement.id,
                achievement.name,
                achievement.icon,
                achievement.xpReward
              )
              .catch((error) => {
                console.error('[AchievementStore] Error posting achievement activity:', error);
                // Non-blocking - don't interrupt unlock flow
              });
          }

          console.log('[AchievementStore] Achievement unlocked:', achievement.name);
        } catch (error) {
          console.error('[AchievementStore] Error unlocking achievement:', error);
        }
      },

      /**
       * Show next achievement unlock modal
       */
      showNextUnlock: () => {
        const { pendingUnlocks } = get();

        if (pendingUnlocks.length === 0) {
          set({ showUnlockModal: false, currentUnlock: null });
          return;
        }

        // Get first pending unlock
        const nextUnlock = pendingUnlocks[0];

        // Update state
        set({
          showUnlockModal: true,
          currentUnlock: nextUnlock,
          pendingUnlocks: pendingUnlocks.slice(1), // Remove first
        });
      },

      /**
       * Dismiss unlock modal and show next
       */
      dismissUnlockModal: () => {
        const { currentUnlock, unlockedAchievements } = get();

        // Mark current unlock as shown
        if (currentUnlock) {
          const updated = unlockedAchievements.map((a) =>
            a.achievementId === currentUnlock.id
              ? { ...a, celebrationShown: true }
              : a
          );

          set({ unlockedAchievements: updated });
          setItem(UNLOCKED_ACHIEVEMENTS_KEY, updated);
        }

        // Show next unlock or close modal
        get().showNextUnlock();
      },

      /**
       * Get progress for a specific achievement
       */
      getAchievementProgress: (achievementId: string, userStats: any) => {
        const achievement = achievementService.getAchievementById(achievementId);
        if (!achievement) return null;

        const { unlockedAchievementIds } = get();

        // If already unlocked
        if (unlockedAchievementIds.includes(achievementId)) {
          return {
            achievementId,
            progress: achievement.target,
            target: achievement.target,
            isUnlocked: true,
            percentComplete: 100,
            unlockedAt: get().unlockedAchievements.find(
              (a) => a.achievementId === achievementId
            )?.unlockedAt,
          };
        }

        // Calculate current progress
        const progress = achievementService['getAchievementProgress'](
          achievement,
          userStats
        );

        return {
          achievementId,
          progress,
          target: achievement.target,
          isUnlocked: false,
          percentComplete: Math.round((progress / achievement.target) * 100),
        };
      },

      /**
       * Get achievements near completion (≤3 away)
       */
      getNearCompletion: (userStats: any) => {
        const { unlockedAchievementIds } = get();

        const result = achievementService.checkAchievements(
          userStats,
          unlockedAchievementIds
        );

        return result.nearCompletion;
      },

      /**
       * Load achievement data from storage
       */
      loadAchievementData: async () => {
        try {
          const unlocked = await getItem<UnlockedAchievement[]>(
            UNLOCKED_ACHIEVEMENTS_KEY
          );
          const stats = await getItem<AchievementStats>(ACHIEVEMENT_STATS_KEY);

          if (unlocked) {
            set({
              unlockedAchievements: unlocked,
              unlockedAchievementIds: unlocked.map((a) => a.achievementId),
            });
          }

          if (stats) {
            set({ stats });
          }
        } catch (error) {
          console.error('[AchievementStore] Error loading data:', error);
        }
      },

      /**
       * Refresh achievement statistics
       */
      refreshStats: async () => {
        const { unlockedAchievements } = get();

        try {
          // Calculate stats
          const totalUnlocked = unlockedAchievements.length;
          const totalAchievements = ACHIEVEMENTS.length;
          const completionPercentage = Math.round(
            (totalUnlocked / totalAchievements) * 100
          );
          const totalXPFromAchievements = unlockedAchievements.reduce(
            (sum, a) => sum + a.xpEarned,
            0
          );

          // Count by category
          const unlockedByCategory = {
            streak: 0,
            practice: 0,
            mala: 0,
            quest: 0,
            social: 0,
            group: 0,
          };

          unlockedAchievements.forEach((unlocked) => {
            const category = unlocked.achievement.category;
            unlockedByCategory[category]++;
          });

          // Find rarest achievement
          let rarestAchievement: Achievement | null = null;
          const rarityOrder = ['legendary', 'epic', 'rare', 'common'];

          for (const rarity of rarityOrder) {
            const found = unlockedAchievements.find(
              (a) => a.achievement.rarity === rarity
            );
            if (found) {
              rarestAchievement = found.achievement;
              break;
            }
          }

          const stats: AchievementStats = {
            totalUnlocked,
            totalAchievements,
            completionPercentage,
            totalXPFromAchievements,
            unlockedByCategory,
            rarestAchievement,
          };

          // Save to storage
          await setItem(ACHIEVEMENT_STATS_KEY, stats);

          // Update state
          set({ stats });
        } catch (error) {
          console.error('[AchievementStore] Error refreshing stats:', error);
        }
      },

      /**
       * Sync achievement data to cloud
       * Phase 2A Week 13: Firestore integration
       */
      syncToCloud: async () => {
        const user = auth().currentUser;
        if (!user) {
          console.log('[AchievementStore] No authenticated user, skipping cloud sync');
          return;
        }

        try {
          const { unlockedAchievements, stats } = get();

          await firestoreService.syncAchievements(user.uid, {
            unlockedAchievements,
            stats,
          });

          console.log('[AchievementStore] Achievement data synced to cloud');
        } catch (error) {
          console.error('[AchievementStore] Error syncing to cloud:', error);
        }
      },

      /**
       * Load achievement data from cloud
       * Phase 2A Week 13: Firestore integration
       */
      loadFromCloud: async () => {
        const user = auth().currentUser;
        if (!user) {
          console.log('[AchievementStore] No authenticated user, skipping cloud load');
          return;
        }

        try {
          const cloudData = await firestoreService.loadAchievements(user.uid);

          if (cloudData) {
            // Merge with local data (cloud takes precedence)
            set({
              unlockedAchievements: cloudData.unlockedAchievements,
              unlockedAchievementIds: cloudData.unlockedAchievements.map(
                (a) => a.achievementId
              ),
              stats: cloudData.stats,
            });

            // Save to local storage
            await setItem(UNLOCKED_ACHIEVEMENTS_KEY, cloudData.unlockedAchievements);
            await setItem(ACHIEVEMENT_STATS_KEY, cloudData.stats);

            console.log('[AchievementStore] Achievement data loaded from cloud');
          }
        } catch (error) {
          console.error('[AchievementStore] Error loading from cloud:', error);
        }
      },
    }),
    {
      name: 'achievement-storage',
      storage: asyncStoragePersist,
      // Only persist essential state
      partialize: (state) => ({
        unlockedAchievements: state.unlockedAchievements,
        unlockedAchievementIds: state.unlockedAchievementIds,
        stats: state.stats,
      }),
    }
  )
);

/**
 * Helper: Check if achievement is unlocked
 */
export const isAchievementUnlocked = (achievementId: string): boolean => {
  return useAchievementStore.getState().unlockedAchievementIds.includes(achievementId);
};

/**
 * Helper: Get all unlocked achievements
 */
export const getUnlockedAchievements = (): UnlockedAchievement[] => {
  return useAchievementStore.getState().unlockedAchievements;
};

/**
 * Helper: Get achievement stats
 */
export const getAchievementStats = (): AchievementStats => {
  return useAchievementStore.getState().stats;
};
