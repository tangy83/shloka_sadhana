/**
 * Practice Session Integration Tests
 * End-to-end test of the full practice completion chain:
 * start → mala increments → complete → streak/quest/achievement/activity updates
 */

import { useUserStore } from '@/stores/useUserStore';
import { usePracticeStore } from '@/stores/usePracticeStore';
import { useQuestStore } from '@/stores/useQuestStore';
import { useAchievementStore } from '@/stores/useAchievementStore';
import { useGroupStore } from '@/stores/useGroupStore';
import * as practiceStorage from '@/utils/practiceStorage';
import * as storage from '@/utils/storage';

// ── Mocks ──────────────────────────────────────────────────────────────────
jest.mock('@/utils/practiceStorage');
jest.mock('@/utils/storage');
jest.mock('@/services/activityService', () => ({
  activityService: {
    postPracticeActivity: jest.fn(() => Promise.resolve('activity-id')),
    postAchievementActivity: jest.fn(() => Promise.resolve('activity-id')),
    postQuestActivity: jest.fn(() => Promise.resolve('activity-id')),
  },
}));
jest.mock('@/services/firestore', () => ({
  firestoreService: {
    saveUserData: jest.fn(() => Promise.resolve()),
    syncPracticeHistory: jest.fn(() => Promise.resolve()),
    saveQuestData: jest.fn(() => Promise.resolve()),
    saveAchievementData: jest.fn(() => Promise.resolve()),
    loadUserData: jest.fn(() => Promise.resolve(null)),
  },
}));
jest.mock('@/services/auth', () => ({
  authService: { getCurrentUser: jest.fn(() => null), isSignedIn: jest.fn(() => false) },
}));
jest.mock('@/services/questService', () => ({
  questService: {
    generateDailyQuest: jest.fn(),
    isQuestExpired: jest.fn(() => false),
    isQuestComplete: jest.fn(() => false),
    updateQuestProgress: jest.fn((quest: any, update: any) => ({
      ...quest,
      progress: quest.progress + update.value,
    })),
    calculateReward: jest.fn(() => ({ xp: 10, type: 'xp' })),
  },
}));
jest.mock('@/services/achievementService', () => ({
  achievementService: {
    checkAchievements: jest.fn(() => ({ newlyUnlocked: [], nearCompletion: [] })),
  },
  ACHIEVEMENTS: [],
}));
jest.mock('@/services/feedService', () => ({
  feedService: { generateFeed: jest.fn(() => Promise.resolve({ sections: [] })) },
}));
jest.mock('@/services/groupService', () => ({
  groupService: { updateGroupStats: jest.fn(() => Promise.resolve()) },
}));
jest.mock('@/stores/useQuestStore', () => {
  const actual = jest.requireActual('@/stores/useQuestStore');
  return actual;
});
jest.mock('@/stores/useAchievementStore', () => {
  const actual = jest.requireActual('@/stores/useAchievementStore');
  return actual;
});

const mockPracticeStorage = practiceStorage as jest.Mocked<typeof practiceStorage>;
const mockStorage = storage as jest.Mocked<typeof storage>;

// ── Helpers ────────────────────────────────────────────────────────────────
function resetAllStores() {
  useUserStore.setState({
    currentStreak: 0, longestStreak: 0, lastCompletedDate: null,
    totalPractices: 0, totalMinutes: 0, favoriteShlokaId: null,
    onboardingComplete: false, preferences: {}, recentlyPracticedShlokas: [],
    practiceTimeHistory: [], bestPracticeTime: null, cachedFeed: null, feedLastUpdated: null,
  });
  usePracticeStore.setState({
    malaCount: 0, sankalp: '', offering: '', sessionStartTime: null,
    selectedShlokaId: null, selectedShlokaName: null,
    showSankalpModal: false, showOfferingModal: false, hasShownSankalp: false,
  });
  useQuestStore.setState({
    currentQuest: null, isQuestLoading: false,
    stats: { totalCompleted: 0, questStreak: 0, longestQuestStreak: 0, totalXP: 0, completionRate: 0, favoriteQuestType: null },
    showCompletionModal: false, lastCompletedQuest: null, lastReward: null,
  });
  useAchievementStore.setState({
    unlockedAchievements: [], unlockedAchievementIds: [],
    stats: {
      totalUnlocked: 0, totalAchievements: 0, completionPercentage: 0,
      totalXPFromAchievements: 0,
      unlockedByCategory: { streak: 0, practice: 0, mala: 0, quest: 0, social: 0, group: 0 },
      rarestAchievement: null,
    },
    showUnlockModal: false, pendingUnlocks: [], currentUnlock: null,
  });
  useGroupStore.setState({
    myGroups: [], myGroupsLoading: false, groupInvites: [], invitesLoading: false,
    publicGroups: [], discoveryLoading: false,
    groupStats: { totalGroups: 0, groupsAsAdmin: 0, groupsAsMember: 0, totalGroupPractices: 0, mostActiveGroup: null },
  });
}

// ── Tests ──────────────────────────────────────────────────────────────────
describe('Practice Session — Full Completion Chain', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetAllStores();
    mockPracticeStorage.saveActivePractice.mockResolvedValue(undefined);
    mockPracticeStorage.clearActivePractice.mockResolvedValue(undefined);
    mockPracticeStorage.savePracticeToHistory.mockResolvedValue(undefined);
    mockPracticeStorage.loadPracticeHistory.mockResolvedValue([]);
    mockPracticeStorage.getPracticeStats.mockReturnValue({
      totalPractices: 1, totalMinutes: 15, favoriteShlokaId: 'gayatri', lastPracticeDate: null,
    } as any);
    mockStorage.setItem.mockResolvedValue(undefined);
    mockStorage.getItem.mockResolvedValue(null);
  });

  it('should start session and set sessionStartTime', () => {
    const { startSession } = usePracticeStore.getState();
    startSession('gayatri', 'Gayatri Mantra');

    const state = usePracticeStore.getState();
    expect(state.sessionStartTime).not.toBeNull();
    expect(state.selectedShlokaId).toBe('gayatri');
    expect(state.malaCount).toBe(0);
  });

  it('should accumulate mala counts during session', () => {
    // Give the store a sessionStartTime so saveSessionToStorage fires correctly
    usePracticeStore.setState({ sessionStartTime: new Date().toISOString() });

    const { incrementMala } = usePracticeStore.getState();
    incrementMala();
    incrementMala();
    incrementMala();

    expect(usePracticeStore.getState().malaCount).toBe(3);
  });

  it('should save practice to history on endSession', async () => {
    usePracticeStore.setState({
      sessionStartTime: new Date().toISOString(),
      malaCount: 2,
      selectedShlokaId: 'gayatri',
      selectedShlokaName: 'Gayatri Mantra',
      sankalp: 'Peace',
    });

    await usePracticeStore.getState().endSession();

    expect(mockPracticeStorage.savePracticeToHistory).toHaveBeenCalledWith(
      expect.objectContaining({
        malaCount: 2,
        shlokaId: 'gayatri',
        shlokaName: 'Gayatri Mantra',
        sankalp: 'Peace',
      })
    );
  });

  it('should update user streak after practice completion', async () => {
    // Start and end practice
    const now = new Date().toISOString();
    usePracticeStore.setState({ sessionStartTime: now });
    await usePracticeStore.getState().endSession();

    // Then call updateStreak (which PracticeScreen does after endSession)
    await useUserStore.getState().updateStreak(now);

    const { currentStreak, totalPractices } = useUserStore.getState();
    expect(currentStreak).toBe(1);
    expect(totalPractices).toBe(1);
  });

  it('should reset practice store state after session ends', async () => {
    usePracticeStore.setState({
      sessionStartTime: new Date().toISOString(),
      malaCount: 5,
      sankalp: 'For all beings',
      selectedShlokaId: 'gayatri',
    });

    await usePracticeStore.getState().endSession();

    const state = usePracticeStore.getState();
    expect(state.malaCount).toBe(0);
    expect(state.sankalp).toBe('');
    expect(state.sessionStartTime).toBeNull();
  });

  it('should persist cleared active practice after session ends', async () => {
    usePracticeStore.setState({ sessionStartTime: new Date().toISOString() });

    await usePracticeStore.getState().endSession();

    expect(mockPracticeStorage.clearActivePractice).toHaveBeenCalled();
  });
});

describe('Practice Session — Multi-day Streak Continuity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetAllStores();
    mockStorage.setItem.mockResolvedValue(undefined);
  });

  it('should build consecutive day streak when practicing each day', async () => {
    // The streak logic checks: if lastCompletedDate === yesterday (relative to TODAY),
    // then streak continues. We must simulate that exact pattern.
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const today = new Date();

    // First practice (starting streak from 0 or first practice)
    await useUserStore.getState().updateStreak(today.toISOString());
    expect(useUserStore.getState().currentStreak).toBe(1);
    expect(useUserStore.getState().lastCompletedDate).toBe(today.toISOString());

    // Simulate: the lastCompletedDate was yesterday (user practiced yesterday)
    useUserStore.setState({ lastCompletedDate: yesterday.toISOString(), currentStreak: 1 });
    // Practice today extends the streak
    const today2 = new Date();
    await useUserStore.getState().updateStreak(today2.toISOString());
    expect(useUserStore.getState().currentStreak).toBe(2);

    // Another day: streak already counted for today (same toDateString)
    await useUserStore.getState().updateStreak(new Date().toISOString());
    expect(useUserStore.getState().currentStreak).toBe(2); // no change, already practiced today
  });
});

describe('Practice Session — Quest Progress Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetAllStores();
    mockPracticeStorage.saveActivePractice.mockResolvedValue(undefined);
    mockPracticeStorage.clearActivePractice.mockResolvedValue(undefined);
    mockPracticeStorage.savePracticeToHistory.mockResolvedValue(undefined);
    mockStorage.setItem.mockResolvedValue(undefined);
  });

  it('should track practice_once quest type progress', async () => {
    const { questService: mockQS } = require('@/services/questService');
    const completedAt = new Date().toISOString();
    const quest = {
      id: 'q-1',
      type: 'practice_once',
      name: 'Daily Practice',
      difficulty: 'beginner',
      target: 1,
      progress: 0,
      status: 'active',
      xpReward: 10,
      startedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    };

    useQuestStore.setState({ currentQuest: quest as any });

    const updatedQuest = { ...quest, progress: 1, status: 'completed', completedAt };
    // Store destructures { quest, isCompleted, reward } from return value
    mockQS.updateQuestProgress.mockReturnValue({
      quest: updatedQuest,
      isCompleted: true,
      reward: { xp: 10 },
    });
    // completeQuest() calls questService['getCompletionMessage'] via bracket notation
    mockQS['getCompletionMessage'] = jest.fn(() => 'Great job!');

    const completed = await useQuestStore.getState().updateProgress({
      type: 'practice_once' as any,
      value: 1,
    } as any);

    expect(completed).toBe(true);
  });
});
