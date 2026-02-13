/**
 * Quest Store
 * Shloka Sadhana - Phase 2A: Engagement Core
 *
 * Zustand store for quest state management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Quest,
  QuestProgressUpdate,
  QuestReward,
  QuestStats,
  CompletedQuest,
  QuestGenerationConfig,
} from '@/types/quests';
import { questService } from '@/services/questService';
import {
  saveCurrentQuest,
  loadCurrentQuest,
  clearCurrentQuest,
  saveCompletedQuest,
  loadCompletedQuests,
  getQuestStats,
  saveQuestStats,
  hasCompletedQuestToday,
} from '@/utils/questStorage';
import { asyncStoragePersist } from './middleware/storage';
import { firestoreService } from '@/services/firestore';
import { activityService } from '@/services/activityService';
import auth from '@react-native-firebase/auth';

interface QuestState {
  // Current quest
  currentQuest: Quest | null;
  isQuestLoading: boolean;

  // Quest stats
  stats: QuestStats;

  // Completion state
  showCompletionModal: boolean;
  lastCompletedQuest: Quest | null;
  lastReward: QuestReward | null;

  // Actions
  initializeQuest: () => Promise<void>;
  generateNewQuest: (config: QuestGenerationConfig) => Promise<void>;
  updateProgress: (update: QuestProgressUpdate) => Promise<boolean>;
  completeQuest: () => Promise<void>;
  abandonQuest: () => Promise<void>;
  loadQuestData: () => Promise<void>;
  refreshStats: () => Promise<void>;
  setShowCompletionModal: (show: boolean) => void;
  resetQuestIfExpired: () => Promise<void>;

  // Cloud sync - Phase 2A Week 13
  syncToCloud: () => Promise<void>;
  loadFromCloud: () => Promise<void>;
}

export const useQuestStore = create<QuestState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentQuest: null,
      isQuestLoading: false,
      stats: {
        totalCompleted: 0,
        questStreak: 0,
        longestQuestStreak: 0,
        totalXP: 0,
        completionRate: 0,
        favoriteQuestType: null,
      },
      showCompletionModal: false,
      lastCompletedQuest: null,
      lastReward: null,

      /**
       * Initialize quest system
       * Called on app start
       */
      initializeQuest: async () => {
        set({ isQuestLoading: true });

        try {
          // Load existing quest
          const savedQuest = await loadCurrentQuest();

          if (savedQuest) {
            // Check if quest expired
            if (questService.isQuestExpired(savedQuest)) {
              // Mark as expired and generate new quest
              await clearCurrentQuest();
              set({ currentQuest: null });
            } else {
              set({ currentQuest: savedQuest });
            }
          }

          // Load stats
          await get().refreshStats();
        } catch (error) {
          console.error('[QuestStore] Error initializing quest:', error);
        } finally {
          set({ isQuestLoading: false });
        }
      },

      /**
       * Generate a new daily quest
       */
      generateNewQuest: async (config: QuestGenerationConfig) => {
        try {
          // Generate quest
          const newQuest = questService.generateDailyQuest(config);

          // Save to storage
          await saveCurrentQuest(newQuest);

          // Update state
          set({ currentQuest: newQuest });

          console.log('[QuestStore] New quest generated:', newQuest.name);
        } catch (error) {
          console.error('[QuestStore] Error generating quest:', error);
        }
      },

      /**
       * Update quest progress
       * Called after practice completion
       */
      updateProgress: async (update: QuestProgressUpdate): Promise<boolean> => {
        const { currentQuest } = get();

        if (!currentQuest) {
          console.warn('[QuestStore] No active quest to update');
          return false;
        }

        try {
          // Update progress via service
          const { quest: updatedQuest, isCompleted, reward } =
            questService.updateQuestProgress(currentQuest, update);

          // Save updated quest
          await saveCurrentQuest(updatedQuest);

          // Update state
          set({ currentQuest: updatedQuest });

          // If quest completed, trigger completion flow
          if (isCompleted && reward) {
            await get().completeQuest();
            return true;
          }

          return false;
        } catch (error) {
          console.error('[QuestStore] Error updating progress:', error);
          return false;
        }
      },

      /**
       * Complete quest (called when target reached)
       */
      completeQuest: async () => {
        const { currentQuest } = get();

        if (!currentQuest || currentQuest.status !== 'completed') {
          console.warn('[QuestStore] Cannot complete quest:', currentQuest?.status);
          return;
        }

        try {
          // Create completed quest record
          const completedQuest: CompletedQuest = {
            questId: currentQuest.id,
            type: currentQuest.type,
            difficulty: currentQuest.difficulty,
            completedAt: currentQuest.completedAt!,
            xpEarned: currentQuest.xpReward,
            completionTime: Math.floor(
              (new Date(currentQuest.completedAt!).getTime() -
                new Date(currentQuest.startedAt).getTime()) /
                (1000 * 60)
            ), // Minutes
          };

          // Save to history
          await saveCompletedQuest(completedQuest);

          // Create reward
          const reward: QuestReward = {
            xp: currentQuest.xpReward,
            message: questService['getCompletionMessage'](currentQuest),
          };

          // Update state
          set({
            lastCompletedQuest: currentQuest,
            lastReward: reward,
            showCompletionModal: true,
          });

          // Refresh stats
          await get().refreshStats();

          // Sync to cloud (if authenticated)
          await get().syncToCloud();

          // Phase 2A Week 17: Post quest activity to friend feeds (non-blocking)
          if (auth().currentUser) {
            activityService
              .postQuestActivity(currentQuest.name, currentQuest.difficulty)
              .catch((error) => {
                console.error('[QuestStore] Error posting quest activity:', error);
                // Non-blocking - don't interrupt completion flow
              });
          }

          console.log('[QuestStore] Quest completed:', currentQuest.name);
        } catch (error) {
          console.error('[QuestStore] Error completing quest:', error);
        }
      },

      /**
       * Abandon current quest
       */
      abandonQuest: async () => {
        try {
          await clearCurrentQuest();
          set({ currentQuest: null });

          console.log('[QuestStore] Quest abandoned');
        } catch (error) {
          console.error('[QuestStore] Error abandoning quest:', error);
        }
      },

      /**
       * Load quest data from storage
       */
      loadQuestData: async () => {
        set({ isQuestLoading: true });

        try {
          const currentQuest = await loadCurrentQuest();
          const stats = await getQuestStats();

          set({
            currentQuest,
            stats,
          });
        } catch (error) {
          console.error('[QuestStore] Error loading quest data:', error);
        } finally {
          set({ isQuestLoading: false });
        }
      },

      /**
       * Refresh quest statistics
       */
      refreshStats: async () => {
        try {
          const stats = await getQuestStats();

          // Save to cache
          await saveQuestStats(stats);

          // Update state
          set({ stats });
        } catch (error) {
          console.error('[QuestStore] Error refreshing stats:', error);
        }
      },

      /**
       * Set completion modal visibility
       */
      setShowCompletionModal: (show: boolean) => {
        set({ showCompletionModal: show });

        // Clear last completed quest when modal dismissed
        if (!show) {
          set({ lastCompletedQuest: null, lastReward: null });
        }
      },

      /**
       * Reset quest if expired (called on app open)
       */
      resetQuestIfExpired: async () => {
        const { currentQuest } = get();

        if (!currentQuest) return;

        // Check if expired
        if (questService.isQuestExpired(currentQuest)) {
          // Mark as expired
          const expiredQuest = questService.expireQuestIfNeeded(currentQuest);

          if (expiredQuest.status === 'expired') {
            // Clear from storage
            await clearCurrentQuest();

            // Update state
            set({ currentQuest: null });

            console.log('[QuestStore] Quest expired and reset');
          }
        }
      },

      /**
       * Sync quest data to cloud
       * Phase 2A Week 13: Firestore integration
       */
      syncToCloud: async () => {
        const user = auth().currentUser;
        if (!user) {
          console.log('[QuestStore] No authenticated user, skipping cloud sync');
          return;
        }

        try {
          const { currentQuest, stats } = get();
          const completedQuests = await loadCompletedQuests();

          await firestoreService.syncQuestData(user.uid, {
            currentQuest,
            completedQuests,
            stats,
          });

          console.log('[QuestStore] Quest data synced to cloud');
        } catch (error) {
          console.error('[QuestStore] Error syncing to cloud:', error);
        }
      },

      /**
       * Load quest data from cloud
       * Phase 2A Week 13: Firestore integration
       */
      loadFromCloud: async () => {
        const user = auth().currentUser;
        if (!user) {
          console.log('[QuestStore] No authenticated user, skipping cloud load');
          return;
        }

        try {
          const cloudData = await firestoreService.loadQuestData(user.uid);

          if (cloudData) {
            // Merge with local data (cloud takes precedence)
            set({
              currentQuest: cloudData.currentQuest,
              stats: cloudData.stats,
            });

            // Save to local storage
            if (cloudData.currentQuest) {
              await saveCurrentQuest(cloudData.currentQuest);
            }
            await saveQuestStats(cloudData.stats);

            console.log('[QuestStore] Quest data loaded from cloud');
          }
        } catch (error) {
          console.error('[QuestStore] Error loading from cloud:', error);
        }
      },
    }),
    {
      name: 'quest-storage',
      storage: asyncStoragePersist,
      // Only persist essential state (not modals, loading states)
      partialize: (state) => ({
        currentQuest: state.currentQuest,
        stats: state.stats,
      }),
    }
  )
);

/**
 * Helper: Check if quest completed today
 */
export const hasCompletedQuestTodayHelper = async (): Promise<boolean> => {
  return await hasCompletedQuestToday();
};

/**
 * Helper: Get quest progress percentage
 */
export const getQuestProgressPercentage = (quest: Quest | null): number => {
  if (!quest) return 0;
  return questService.getProgressPercentage(quest);
};

/**
 * Helper: Add XP to user's total (for future gamification integration)
 */
export const addXP = (xp: number) => {
  const currentStats = useQuestStore.getState().stats;
  const updatedStats: QuestStats = {
    ...currentStats,
    totalXP: currentStats.totalXP + xp,
  };

  useQuestStore.setState({ stats: updatedStats });
  saveQuestStats(updatedStats);
};
