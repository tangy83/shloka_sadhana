/**
 * Firestore Service
 * Shloka Sadhana - P0 #50 (Days 51-54)
 *
 * Cloud backup service for syncing user data to Firestore
 * Syncs: practices, streak, settings, preferences
 */

import firestore from '@react-native-firebase/firestore';
import { CompletedPractice } from '@/types';
import { Quest, CompletedQuest, QuestStats } from '@/types/quests';
import { Achievement, UnlockedAchievement, AchievementStats } from '@/types/achievements';

/**
 * Streak data interface
 */
export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  totalPractices: number;
  totalMinutes: number;
}

/**
 * Settings data interface
 */
export interface SettingsData {
  notificationsEnabled: boolean;
  notificationTime: string;
  theme?: 'dark' | 'light' | 'system';
}

/**
 * User preferences interface
 */
export interface UserPreferences {
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  dailyTime?: '5-10' | '10-20' | '20+' | 'flexible';
  preferredDeity?: string;
}

/**
 * Recently practiced shloka interface
 */
export interface RecentlyPracticed {
  id: string;
  name: string;
  lastPracticed: string;
}

/**
 * Firestore Service Class
 * Handles all cloud sync operations
 */
class FirestoreService {
  /**
   * Get user document reference
   * All user data stored under /users/{userId}
   */
  private getUserRef(userId: string) {
    return firestore().collection('users').doc(userId);
  }

  /**
   * Get practices subcollection reference
   * Practices stored under /users/{userId}/practices/{practiceId}
   */
  private getPracticesRef(userId: string) {
    return this.getUserRef(userId).collection('practices');
  }

  // ===================
  // PRACTICE HISTORY
  // ===================

  /**
   * Sync practice history to cloud
   * Uploads all local practices to Firestore
   * @param userId - Firebase user ID
   * @param practices - Array of completed practices
   */
  async syncPracticeHistory(
    userId: string,
    practices: CompletedPractice[]
  ): Promise<void> {
    try {
      console.log(`[Firestore] Syncing ${practices.length} practices for user ${userId}`);

      // Use batch write for efficiency (up to 500 operations)
      const batch = firestore().batch();

      practices.forEach((practice) => {
        const practiceRef = this.getPracticesRef(userId).doc(practice.id);
        batch.set(practiceRef, practice, { merge: true });
      });

      await batch.commit();
      console.log('[Firestore] Practice history synced successfully');
    } catch (error) {
      console.error('[Firestore] Error syncing practice history:', error);
      throw error;
    }
  }

  /**
   * Load practice history from cloud
   * Downloads all practices for user
   * @param userId - Firebase user ID
   * @returns Array of completed practices
   */
  async loadPracticeHistory(userId: string): Promise<CompletedPractice[]> {
    try {
      console.log(`[Firestore] Loading practice history for user ${userId}`);

      const snapshot = await this.getPracticesRef(userId)
        .orderBy('timestamp', 'desc') // Most recent first
        .get();

      const practices: CompletedPractice[] = [];
      snapshot.forEach((doc) => {
        practices.push(doc.data() as CompletedPractice);
      });

      console.log(`[Firestore] Loaded ${practices.length} practices from cloud`);
      return practices;
    } catch (error) {
      console.error('[Firestore] Error loading practice history:', error);
      throw error;
    }
  }

  /**
   * Sync single practice to cloud
   * Used for immediate sync after completing practice
   * @param userId - Firebase user ID
   * @param practice - Completed practice to sync
   */
  async syncSinglePractice(
    userId: string,
    practice: CompletedPractice
  ): Promise<void> {
    try {
      const practiceRef = this.getPracticesRef(userId).doc(practice.id);
      await practiceRef.set(practice, { merge: true });
      console.log(`[Firestore] Practice ${practice.id} synced`);
    } catch (error) {
      console.error('[Firestore] Error syncing single practice:', error);
      // Don't throw - background sync should be non-blocking
    }
  }

  // ===================
  // STREAK DATA
  // ===================

  /**
   * Sync streak data to cloud
   * Updates user document with current streak
   * @param userId - Firebase user ID
   * @param streakData - Streak information
   */
  async syncStreak(userId: string, streakData: StreakData): Promise<void> {
    try {
      const userRef = this.getUserRef(userId);
      await userRef.set({ streak: streakData }, { merge: true });
      console.log('[Firestore] Streak synced:', streakData);
    } catch (error) {
      console.error('[Firestore] Error syncing streak:', error);
      throw error;
    }
  }

  /**
   * Load streak data from cloud
   * @param userId - Firebase user ID
   * @returns Streak data or null if not found
   */
  async loadStreak(userId: string): Promise<StreakData | null> {
    try {
      const userRef = this.getUserRef(userId);
      const doc = await userRef.get();

      if (doc.exists && doc.data()?.streak) {
        const streak = doc.data()!.streak as StreakData;
        console.log('[Firestore] Streak loaded from cloud:', streak);
        return streak;
      }

      console.log('[Firestore] No streak data in cloud');
      return null;
    } catch (error) {
      console.error('[Firestore] Error loading streak:', error);
      throw error;
    }
  }

  // ===================
  // SETTINGS
  // ===================

  /**
   * Sync settings to cloud
   * @param userId - Firebase user ID
   * @param settings - App settings
   */
  async syncSettings(userId: string, settings: SettingsData): Promise<void> {
    try {
      const userRef = this.getUserRef(userId);
      await userRef.set({ settings }, { merge: true });
      console.log('[Firestore] Settings synced:', settings);
    } catch (error) {
      console.error('[Firestore] Error syncing settings:', error);
      throw error;
    }
  }

  /**
   * Load settings from cloud
   * @param userId - Firebase user ID
   * @returns Settings or null if not found
   */
  async loadSettings(userId: string): Promise<SettingsData | null> {
    try {
      const userRef = this.getUserRef(userId);
      const doc = await userRef.get();

      if (doc.exists && doc.data()?.settings) {
        const settings = doc.data()!.settings as SettingsData;
        console.log('[Firestore] Settings loaded from cloud:', settings);
        return settings;
      }

      console.log('[Firestore] No settings data in cloud');
      return null;
    } catch (error) {
      console.error('[Firestore] Error loading settings:', error);
      throw error;
    }
  }

  // ===================
  // USER PREFERENCES
  // ===================

  /**
   * Sync user preferences to cloud
   * @param userId - Firebase user ID
   * @param preferences - User preferences from onboarding
   */
  async syncPreferences(
    userId: string,
    preferences: UserPreferences
  ): Promise<void> {
    try {
      const userRef = this.getUserRef(userId);
      await userRef.set({ preferences }, { merge: true });
      console.log('[Firestore] Preferences synced:', preferences);
    } catch (error) {
      console.error('[Firestore] Error syncing preferences:', error);
      throw error;
    }
  }

  /**
   * Load user preferences from cloud
   * @param userId - Firebase user ID
   * @returns Preferences or null if not found
   */
  async loadPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const userRef = this.getUserRef(userId);
      const doc = await userRef.get();

      if (doc.exists && doc.data()?.preferences) {
        const preferences = doc.data()!.preferences as UserPreferences;
        console.log('[Firestore] Preferences loaded from cloud:', preferences);
        return preferences;
      }

      console.log('[Firestore] No preferences data in cloud');
      return null;
    } catch (error) {
      console.error('[Firestore] Error loading preferences:', error);
      throw error;
    }
  }

  // ===================
  // RECENTLY PRACTICED
  // ===================

  /**
   * Sync recently practiced shlokas to cloud
   * @param userId - Firebase user ID
   * @param recentlyPracticed - Array of recently practiced shlokas
   */
  async syncRecentlyPracticed(
    userId: string,
    recentlyPracticed: RecentlyPracticed[]
  ): Promise<void> {
    try {
      const userRef = this.getUserRef(userId);
      await userRef.set({ recentlyPracticed }, { merge: true });
      console.log('[Firestore] Recently practiced synced');
    } catch (error) {
      console.error('[Firestore] Error syncing recently practiced:', error);
      // Don't throw - this is non-critical data
    }
  }

  /**
   * Load recently practiced shlokas from cloud
   * @param userId - Firebase user ID
   * @returns Array of recently practiced shlokas
   */
  async loadRecentlyPracticed(userId: string): Promise<RecentlyPracticed[]> {
    try {
      const userRef = this.getUserRef(userId);
      const doc = await userRef.get();

      if (doc.exists && doc.data()?.recentlyPracticed) {
        return doc.data()!.recentlyPracticed as RecentlyPracticed[];
      }

      return [];
    } catch (error) {
      console.error('[Firestore] Error loading recently practiced:', error);
      return [];
    }
  }

  // ===================
  // REAL-TIME LISTENERS
  // ===================

  /**
   * Listen to streak changes in real-time
   * Useful for multi-device sync
   * @param userId - Firebase user ID
   * @param callback - Function called when streak changes
   * @returns Unsubscribe function
   */
  onStreakChange(userId: string, callback: (streak: StreakData) => void) {
    const userRef = this.getUserRef(userId);

    return userRef.onSnapshot(
      (snapshot) => {
        if (snapshot.exists && snapshot.data()?.streak) {
          const streak = snapshot.data()!.streak as StreakData;
          callback(streak);
        }
      },
      (error) => {
        console.error('[Firestore] Streak listener error:', error);
      }
    );
  }

  /**
   * Listen to new practices in real-time
   * @param userId - Firebase user ID
   * @param callback - Function called when new practice added
   * @returns Unsubscribe function
   */
  onNewPractice(userId: string, callback: (practice: CompletedPractice) => void) {
    const practicesRef = this.getPracticesRef(userId);

    return practicesRef
      .orderBy('timestamp', 'desc')
      .limit(1)
      .onSnapshot(
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const practice = change.doc.data() as CompletedPractice;
              callback(practice);
            }
          });
        },
        (error) => {
          console.error('[Firestore] Practice listener error:', error);
        }
      );
  }

  // ===================
  // BULK OPERATIONS
  // ===================

  /**
   * Sync all user data to cloud at once
   * Used on sign-in to upload local data
   * @param userId - Firebase user ID
   * @param data - All user data
   */
  async syncAllData(
    userId: string,
    data: {
      practices: CompletedPractice[];
      streak: StreakData;
      settings: SettingsData;
      preferences?: UserPreferences;
      recentlyPracticed?: RecentlyPracticed[];
    }
  ): Promise<void> {
    try {
      console.log('[Firestore] Syncing all user data...');

      // Sync in parallel for speed
      await Promise.all([
        this.syncPracticeHistory(userId, data.practices),
        this.syncStreak(userId, data.streak),
        this.syncSettings(userId, data.settings),
        data.preferences && this.syncPreferences(userId, data.preferences),
        data.recentlyPracticed &&
          this.syncRecentlyPracticed(userId, data.recentlyPracticed),
      ]);

      console.log('[Firestore] All data synced successfully');
    } catch (error) {
      console.error('[Firestore] Error syncing all data:', error);
      throw error;
    }
  }

  /**
   * Load all user data from cloud at once
   * Used on sign-in to download cloud data
   * @param userId - Firebase user ID
   * @returns All user data
   */
  async loadAllData(userId: string): Promise<{
    practices: CompletedPractice[];
    streak: StreakData | null;
    settings: SettingsData | null;
    preferences: UserPreferences | null;
    recentlyPracticed: RecentlyPracticed[];
  }> {
    try {
      console.log('[Firestore] Loading all user data...');

      // Load in parallel for speed
      const [practices, streak, settings, preferences, recentlyPracticed] =
        await Promise.all([
          this.loadPracticeHistory(userId),
          this.loadStreak(userId),
          this.loadSettings(userId),
          this.loadPreferences(userId),
          this.loadRecentlyPracticed(userId),
        ]);

      console.log('[Firestore] All data loaded successfully');

      return {
        practices,
        streak,
        settings,
        preferences,
        recentlyPracticed,
      };
    } catch (error) {
      console.error('[Firestore] Error loading all data:', error);
      throw error;
    }
  }

  // ===================
  // QUEST DATA - Phase 2A Week 13
  // ===================

  /**
   * Sync quest data to cloud
   * Syncs current quest, completed quests, and stats
   * @param userId - Firebase user ID
   * @param questData - Quest state from useQuestStore
   */
  async syncQuestData(
    userId: string,
    questData: {
      currentQuest: Quest | null;
      completedQuests: CompletedQuest[];
      stats: QuestStats;
    }
  ): Promise<void> {
    try {
      const userRef = this.getUserRef(userId);
      await userRef.set(
        {
          quests: {
            currentQuest: questData.currentQuest,
            completedQuestsCount: questData.completedQuests.length,
            stats: questData.stats,
            lastUpdated: firestore.FieldValue.serverTimestamp(),
          },
        },
        { merge: true }
      );

      // Sync completed quests to subcollection
      if (questData.completedQuests.length > 0) {
        const batch = firestore().batch();
        const questsRef = userRef.collection('completedQuests');

        questData.completedQuests.forEach((quest) => {
          const questRef = questsRef.doc(quest.questId);
          batch.set(questRef, quest, { merge: true });
        });

        await batch.commit();
      }

      console.log('[Firestore] Quest data synced');
    } catch (error) {
      console.error('[Firestore] Error syncing quest data:', error);
      // Don't throw - background sync should be non-blocking
    }
  }

  /**
   * Load quest data from cloud
   * @param userId - Firebase user ID
   * @returns Quest data or null if not found
   */
  async loadQuestData(userId: string): Promise<{
    currentQuest: Quest | null;
    completedQuests: CompletedQuest[];
    stats: QuestStats;
  } | null> {
    try {
      const userRef = this.getUserRef(userId);
      const doc = await userRef.get();

      if (doc.exists && doc.data()?.quests) {
        const questsData = doc.data()!.quests;

        // Load completed quests from subcollection
        const completedSnapshot = await userRef
          .collection('completedQuests')
          .orderBy('completedAt', 'desc')
          .get();

        const completedQuests: CompletedQuest[] = [];
        completedSnapshot.forEach((questDoc) => {
          completedQuests.push(questDoc.data() as CompletedQuest);
        });

        console.log('[Firestore] Quest data loaded from cloud');
        return {
          currentQuest: questsData.currentQuest || null,
          completedQuests,
          stats: questsData.stats || {
            totalCompleted: 0,
            questStreak: 0,
            longestQuestStreak: 0,
            totalXP: 0,
          },
        };
      }

      console.log('[Firestore] No quest data in cloud');
      return null;
    } catch (error) {
      console.error('[Firestore] Error loading quest data:', error);
      throw error;
    }
  }

  /**
   * Sync single completed quest to cloud
   * Used for immediate sync after quest completion
   * @param userId - Firebase user ID
   * @param completedQuest - Completed quest
   */
  async syncCompletedQuest(
    userId: string,
    completedQuest: CompletedQuest
  ): Promise<void> {
    try {
      const userRef = this.getUserRef(userId);
      const questRef = userRef.collection('completedQuests').doc(completedQuest.questId);

      await questRef.set(completedQuest, { merge: true });
      console.log(`[Firestore] Completed quest ${completedQuest.questId} synced`);
    } catch (error) {
      console.error('[Firestore] Error syncing completed quest:', error);
      // Don't throw - background sync should be non-blocking
    }
  }

  // ===================
  // ACHIEVEMENT DATA - Phase 2A Week 13
  // ===================

  /**
   * Sync achievement data to cloud
   * Syncs unlocked achievements and stats
   * @param userId - Firebase user ID
   * @param achievementData - Achievement state from useAchievementStore
   */
  async syncAchievements(
    userId: string,
    achievementData: {
      unlockedAchievements: UnlockedAchievement[];
      stats: AchievementStats;
    }
  ): Promise<void> {
    try {
      const userRef = this.getUserRef(userId);

      // Sync stats to main user document
      await userRef.set(
        {
          achievements: {
            unlockedCount: achievementData.unlockedAchievements.length,
            stats: achievementData.stats,
            lastUpdated: firestore.FieldValue.serverTimestamp(),
          },
        },
        { merge: true }
      );

      // Sync unlocked achievements to subcollection
      if (achievementData.unlockedAchievements.length > 0) {
        const batch = firestore().batch();
        const achievementsRef = userRef.collection('unlockedAchievements');

        achievementData.unlockedAchievements.forEach((unlocked) => {
          const achievementRef = achievementsRef.doc(unlocked.achievementId);
          batch.set(achievementRef, unlocked, { merge: true });
        });

        await batch.commit();
      }

      console.log('[Firestore] Achievement data synced');
    } catch (error) {
      console.error('[Firestore] Error syncing achievements:', error);
      // Don't throw - background sync should be non-blocking
    }
  }

  /**
   * Load achievement data from cloud
   * @param userId - Firebase user ID
   * @returns Achievement data or null if not found
   */
  async loadAchievements(userId: string): Promise<{
    unlockedAchievements: UnlockedAchievement[];
    stats: AchievementStats;
  } | null> {
    try {
      const userRef = this.getUserRef(userId);
      const doc = await userRef.get();

      if (doc.exists && doc.data()?.achievements) {
        const achievementsData = doc.data()!.achievements;

        // Load unlocked achievements from subcollection
        const unlockedSnapshot = await userRef
          .collection('unlockedAchievements')
          .orderBy('unlockedAt', 'desc')
          .get();

        const unlockedAchievements: UnlockedAchievement[] = [];
        unlockedSnapshot.forEach((achDoc) => {
          unlockedAchievements.push(achDoc.data() as UnlockedAchievement);
        });

        console.log('[Firestore] Achievement data loaded from cloud');
        return {
          unlockedAchievements,
          stats: achievementsData.stats || {
            totalUnlocked: 0,
            totalAchievements: 0,
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
        };
      }

      console.log('[Firestore] No achievement data in cloud');
      return null;
    } catch (error) {
      console.error('[Firestore] Error loading achievements:', error);
      throw error;
    }
  }

  /**
   * Sync single unlocked achievement to cloud
   * Used for immediate sync after achievement unlock
   * @param userId - Firebase user ID
   * @param unlockedAchievement - Unlocked achievement
   */
  async syncUnlockedAchievement(
    userId: string,
    unlockedAchievement: UnlockedAchievement
  ): Promise<void> {
    try {
      const userRef = this.getUserRef(userId);
      const achievementRef = userRef
        .collection('unlockedAchievements')
        .doc(unlockedAchievement.achievementId);

      await achievementRef.set(unlockedAchievement, { merge: true });
      console.log(`[Firestore] Unlocked achievement ${unlockedAchievement.achievementId} synced`);
    } catch (error) {
      console.error('[Firestore] Error syncing unlocked achievement:', error);
      // Don't throw - background sync should be non-blocking
    }
  }

  // ===================
  // UTILITIES
  // ===================

  /**
   * Check if user document exists
   * @param userId - Firebase user ID
   * @returns True if user has cloud data
   */
  async hasCloudData(userId: string): Promise<boolean> {
    try {
      const userRef = this.getUserRef(userId);
      const doc = await userRef.get();
      return doc.exists;
    } catch (error) {
      console.error('[Firestore] Error checking cloud data:', error);
      return false;
    }
  }

  /**
   * Delete all user data from cloud
   * Used for account deletion
   * @param userId - Firebase user ID
   */
  async deleteAllUserData(userId: string): Promise<void> {
    try {
      console.log('[Firestore] Deleting all user data...');

      // Delete user document (cascade deletes subcollections in Firestore)
      const userRef = this.getUserRef(userId);
      await userRef.delete();

      // Also delete practices subcollection manually (safer)
      const practicesSnapshot = await this.getPracticesRef(userId).get();
      const batch = firestore().batch();

      practicesSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      console.log('[Firestore] All user data deleted');
    } catch (error) {
      console.error('[Firestore] Error deleting user data:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const firestoreService = new FirestoreService();
