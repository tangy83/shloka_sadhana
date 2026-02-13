/**
 * User Store
 * Shloka Sadhana - State Management
 *
 * Manages user data, streak, and statistics
 * Replaces useState from HomeScreen and useStreak/useStats hooks
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { asyncStoragePersist } from './middleware/storage';
import { getItem, setItem } from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants/StorageKeys';
import { StreakData } from '@/types';
import { loadPracticeHistory, getPracticeStats } from '@/utils/practiceStorage';
import { firestoreService } from '@/services/firestore';
import { authService } from '@/services/auth';
import { CachedFeed, FeedConfig, DEFAULT_FEED_CONFIG } from '@/types/feed';
import { feedService } from '@/services/feedService';
import { useQuestStore } from './useQuestStore';
import { useAchievementStore } from './useAchievementStore';

export interface UserState {
  // Streak data
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  totalPractices: number;

  // Stats
  totalMinutes: number;
  favoriteShlokaId: string | null;

  // User preferences (from onboarding)
  onboardingComplete: boolean;
  preferences: {
    experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
    dailyTime?: '5-10' | '10-20' | '20+' | 'flexible';
    preferredDeity?: string;
  };

  // Recently practiced (for quick access)
  recentlyPracticedShlokas: Array<{
    id: string;
    name: string;
    lastPracticed: string;
  }>;

  // Smart notifications - practice time tracking
  practiceTimeHistory: string[]; // Array of ISO timestamps of completed practices
  bestPracticeTime: string | null; // HH:MM format (e.g., "07:30")

  // Feed caching - Phase 2A Week 14
  cachedFeed: CachedFeed | null;
  feedLastUpdated: string | null; // ISO timestamp of last feed generation

  // Actions - Streak management
  updateStreak: (completedDate: string) => Promise<void>;
  incrementPracticeCount: () => void;
  loadStreakData: () => Promise<void>;
  saveStreakData: () => Promise<void>;

  // Actions - Stats management
  addMinutes: (minutes: number) => void;
  setFavoriteShloka: (shlokaId: string) => void;
  loadStats: () => Promise<void>;

  // Actions - User preferences
  setOnboardingComplete: (complete: boolean) => Promise<void>;
  setPreferences: (prefs: Partial<UserState['preferences']>) => Promise<void>;

  // Actions - Recently practiced
  addRecentlyPracticed: (shlokaId: string, shlokaName: string) => void;

  // Actions - Smart notifications
  recordPracticeTime: (completedTime: string) => void;
  calculateBestPracticeTime: () => string | null;

  // Actions - Data loading
  loadUserData: () => Promise<void>;
  resetUserData: () => Promise<void>;

  // Actions - Cloud Sync (P0 #50)
  syncToCloud: () => Promise<void>;
  loadFromCloud: () => Promise<void>;

  // Actions - Feed Management (Phase 2A Week 14)
  refreshFeed: (config?: FeedConfig) => Promise<void>;
  shouldRefreshFeed: () => boolean;
}

/**
 * User Store
 *
 * Central store for user data, streak, and statistics
 *
 * @example
 * ```tsx
 * const {
 *   currentStreak,
 *   totalPractices,
 *   updateStreak
 * } = useUserStore();
 * ```
 */
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentStreak: 0,
      longestStreak: 0,
      lastCompletedDate: null,
      totalPractices: 0,
      totalMinutes: 0,
      favoriteShlokaId: null,
      onboardingComplete: false,
      preferences: {},
      recentlyPracticedShlokas: [],
      practiceTimeHistory: [],
      bestPracticeTime: null,
      cachedFeed: null,
      feedLastUpdated: null,

      // Streak management
      updateStreak: async (completedDate: string) => {
        const state = get();
        const completedDay = new Date(completedDate).toDateString();
        const lastDay = state.lastCompletedDate
          ? new Date(state.lastCompletedDate).toDateString()
          : null;

        // Check if already practiced today
        if (lastDay === completedDay) {
          return; // Already counted for today
        }

        // Check if yesterday
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();

        let newStreak = 1;
        if (lastDay === yesterdayStr) {
          // Continue streak
          newStreak = state.currentStreak + 1;
        }

        const newLongestStreak = Math.max(state.longestStreak, newStreak);

        set({
          currentStreak: newStreak,
          longestStreak: newLongestStreak,
          lastCompletedDate: completedDate,
          totalPractices: state.totalPractices + 1,
        });

        await get().saveStreakData();
      },

      incrementPracticeCount: () => {
        set((state) => ({
          totalPractices: state.totalPractices + 1,
        }));
        get().saveStreakData();
      },

      loadStreakData: async () => {
        try {
          const streakData = await getItem<StreakData>(STORAGE_KEYS.STREAK);
          if (streakData) {
            set({
              currentStreak: streakData.currentStreak || 0,
              longestStreak: streakData.longestStreak || 0,
              lastCompletedDate: streakData.lastCompletedDate || null,
              totalPractices: streakData.totalPractices || 0,
            });
          }
        } catch (error) {
          console.error('[UserStore] Error loading streak data:', error);
        }
      },

      saveStreakData: async () => {
        const state = get();
        const streakData: StreakData = {
          currentStreak: state.currentStreak,
          longestStreak: state.longestStreak,
          lastCompletedDate: state.lastCompletedDate,
          totalPractices: state.totalPractices,
        };

        try {
          await setItem(STORAGE_KEYS.STREAK, streakData);
        } catch (error) {
          console.error('[UserStore] Error saving streak data:', error);
        }
      },

      // Stats management
      addMinutes: (minutes: number) => {
        set((state) => ({
          totalMinutes: state.totalMinutes + minutes,
        }));
      },

      setFavoriteShloka: (shlokaId: string) => {
        set({ favoriteShlokaId: shlokaId });
      },

      loadStats: async () => {
        try {
          const history = await loadPracticeHistory();
          const stats = getPracticeStats(history);

          set({
            totalMinutes: stats.totalMinutes || 0,
            favoriteShlokaId: stats.favoriteShlokaId || null,
          });
        } catch (error) {
          console.error('[UserStore] Error loading stats:', error);
        }
      },

      // User preferences
      setOnboardingComplete: async (complete: boolean) => {
        set({ onboardingComplete: complete });
        try {
          await setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, complete);
        } catch (error) {
          console.error('[UserStore] Error saving onboarding status:', error);
        }
      },

      setPreferences: async (prefs: Partial<UserState['preferences']>) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...prefs,
          },
        }));
      },

      // Recently practiced
      addRecentlyPracticed: (shlokaId: string, shlokaName: string) => {
        set((state) => {
          const recentShlokas = state.recentlyPracticedShlokas.filter(
            (s) => s.id !== shlokaId
          );

          return {
            recentlyPracticedShlokas: [
              { id: shlokaId, name: shlokaName, lastPracticed: new Date().toISOString() },
              ...recentShlokas,
            ].slice(0, 5), // Keep only last 5
          };
        });
      },

      // Smart notifications - practice time tracking
      recordPracticeTime: (completedTime: string) => {
        set((state) => {
          const newHistory = [...state.practiceTimeHistory, completedTime];

          // Keep only last 14 days of practice times (for pattern detection)
          const fourteenDaysAgo = new Date();
          fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

          const recentHistory = newHistory.filter((timestamp) => {
            return new Date(timestamp) > fourteenDaysAgo;
          });

          return {
            practiceTimeHistory: recentHistory,
          };
        });

        // Recalculate best practice time
        const bestTime = get().calculateBestPracticeTime();
        if (bestTime) {
          set({ bestPracticeTime: bestTime });
        }
      },

      calculateBestPracticeTime: () => {
        const state = get();

        if (state.practiceTimeHistory.length < 3) {
          // Need at least 3 practices to establish a pattern
          return null;
        }

        // Count practice frequency by hour
        const hourCounts: Record<number, number> = {};

        state.practiceTimeHistory.forEach((timestamp) => {
          const date = new Date(timestamp);
          const hour = date.getHours();
          hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });

        // Find most common hour
        let maxCount = 0;
        let bestHour = 7; // Default to 7 AM if no clear pattern

        Object.entries(hourCounts).forEach(([hour, count]) => {
          if (count > maxCount) {
            maxCount = count;
            bestHour = parseInt(hour, 10);
          }
        });

        // Format as HH:MM (always at :00 minutes)
        const formattedHour = bestHour.toString().padStart(2, '0');
        return `${formattedHour}:00`;
      },

      // Data loading
      loadUserData: async () => {
        await get().loadStreakData();
        await get().loadStats();

        // Load onboarding status
        try {
          const onboardingComplete = await getItem<boolean>(
            STORAGE_KEYS.ONBOARDING_COMPLETE
          );
          if (onboardingComplete !== null) {
            set({ onboardingComplete });
          }
        } catch (error) {
          console.error('[UserStore] Error loading onboarding status:', error);
        }
      },

      resetUserData: async () => {
        set({
          currentStreak: 0,
          longestStreak: 0,
          lastCompletedDate: null,
          totalPractices: 0,
          totalMinutes: 0,
          favoriteShlokaId: null,
          recentlyPracticedShlokas: [],
          practiceTimeHistory: [],
          bestPracticeTime: null,
        });
        await get().saveStreakData();
      },

      // Cloud Sync - P0 #50
      /**
       * Sync local data to cloud
       * Uploads all user data to Firestore
       */
      syncToCloud: async () => {
        const user = authService.getCurrentUser();
        if (!user) {
          console.log('[UserStore] Cannot sync - not authenticated');
          return;
        }

        try {
          const state = get();

          console.log('[UserStore] Syncing data to cloud...');

          // Load practice history from storage
          const practices = await loadPracticeHistory();

          // Sync all data to Firestore
          await firestoreService.syncAllData(user.uid, {
            practices,
            streak: {
              currentStreak: state.currentStreak,
              longestStreak: state.longestStreak,
              lastCompletedDate: state.lastCompletedDate,
              totalPractices: state.totalPractices,
              totalMinutes: state.totalMinutes,
            },
            settings: {
              notificationsEnabled: false, // Will be synced by useSettingsStore
              notificationTime: '07:00',
            },
            preferences: state.preferences,
            recentlyPracticed: state.recentlyPracticedShlokas,
          });

          console.log('[UserStore] Data synced to cloud successfully');
        } catch (error) {
          console.error('[UserStore] Cloud sync error:', error);
          // Don't throw - sync failures should be non-blocking
        }
      },

      /**
       * Load data from cloud and merge with local
       * Downloads user data from Firestore on sign-in
       */
      loadFromCloud: async () => {
        const user = authService.getCurrentUser();
        if (!user) {
          console.log('[UserStore] Cannot load - not authenticated');
          return;
        }

        try {
          console.log('[UserStore] Loading data from cloud...');

          // Check if user has cloud data
          const hasData = await firestoreService.hasCloudData(user.uid);
          if (!hasData) {
            console.log('[UserStore] No cloud data found - first time sign-in');
            // Upload local data to cloud
            await get().syncToCloud();
            return;
          }

          // Load all data from cloud
          const cloudData = await firestoreService.loadAllData(user.uid);

          // Merge cloud data with local (prefer cloud for most fields)
          const state = get();

          set({
            // Streak: use cloud if available, otherwise keep local
            currentStreak: cloudData.streak?.currentStreak ?? state.currentStreak,
            longestStreak: Math.max(
              cloudData.streak?.longestStreak ?? 0,
              state.longestStreak
            ),
            lastCompletedDate:
              cloudData.streak?.lastCompletedDate ?? state.lastCompletedDate,
            totalPractices: Math.max(
              cloudData.streak?.totalPractices ?? 0,
              state.totalPractices
            ),
            totalMinutes: Math.max(
              cloudData.streak?.totalMinutes ?? 0,
              state.totalMinutes
            ),

            // Preferences: prefer cloud
            preferences: cloudData.preferences ?? state.preferences,

            // Recently practiced: prefer cloud
            recentlyPracticedShlokas:
              cloudData.recentlyPracticed ?? state.recentlyPracticedShlokas,
          });

          // Save merged data back to local storage
          await get().saveStreakData();

          console.log('[UserStore] Data loaded from cloud and merged');
        } catch (error) {
          console.error('[UserStore] Cloud load error:', error);
          // Don't throw - load failures should be non-blocking
        }
      },

      // Feed Management - Phase 2A Week 14
      /**
       * Refresh personalized home feed
       * Generates new feed based on current user context
       */
      refreshFeed: async (config: FeedConfig = DEFAULT_FEED_CONFIG) => {
        try {
          const state = get();

          // Get quest data
          const questState = useQuestStore.getState();
          const hasActiveQuest = questState.currentQuest !== null;
          const completedQuestToday = await questState.loadQuestData().then(() => {
            // Check if quest completed today
            const quest = useQuestStore.getState().currentQuest;
            if (!quest) return false;
            if (quest.status !== 'completed') return false;
            const completedDate = new Date(quest.completedAt || '');
            const today = new Date().toDateString();
            return completedDate.toDateString() === today;
          }).catch(() => false);

          const questProgress = questState.currentQuest
            ? questState.currentQuest.progress / questState.currentQuest.target
            : 0;

          // Get achievement data
          const achievementState = useAchievementStore.getState();
          const nearCompleteAchievements = achievementState.stats.totalAchievements
            ? achievementState.unlockedAchievements.length
            : 0;

          // Build feed context
          const context = feedService.buildFeedContext({
            userId: state.currentStreak.toString(), // Placeholder - will use auth userId
            experienceLevel: state.preferences.experienceLevel,
            preferredDeity: state.preferences.preferredDeity,
            dailyTime: state.preferences.dailyTime,
            currentStreak: state.currentStreak,
            totalPractices: state.totalPractices,
            lastPracticedDate: state.lastCompletedDate,
            recentlyPracticed: state.recentlyPracticedShlokas.map((s) => s.id),
            hasActiveQuest,
            completedQuestToday,
            questProgress,
            nearCompleteAchievements,
            // Social/group features (Week 16+)
            hasFriends: false,
            newFriendActivity: false,
            hasGroups: false,
            activeGroupChallenge: false,
            // Calendar context (will be populated from calendar utils)
            isEkadashi: false,
            isFestival: false,
          });

          // Generate feed
          const sections = feedService.generatePersonalizedFeed(context, config);

          // Cache feed
          const cachedFeed: CachedFeed = {
            sections,
            generatedAt: new Date().toISOString(),
            context,
            config,
          };

          set({
            cachedFeed,
            feedLastUpdated: new Date().toISOString(),
          });

          console.log('[UserStore] Feed refreshed with', sections.length, 'sections');
        } catch (error) {
          console.error('[UserStore] Error refreshing feed:', error);
        }
      },

      /**
       * Check if feed should be refreshed
       * Based on last update time and refresh interval
       */
      shouldRefreshFeed: () => {
        const state = get();

        if (!state.cachedFeed || !state.feedLastUpdated) {
          return true; // No cached feed
        }

        const config = state.cachedFeed.config || DEFAULT_FEED_CONFIG;
        return feedService.shouldRefreshFeed(state.feedLastUpdated, config);
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => asyncStoragePersist),
    }
  )
);
