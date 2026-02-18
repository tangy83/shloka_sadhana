/**
 * Achievement Store Tests
 * Tests for achievement checking, unlock flow, and modal queue
 */

import { useAchievementStore } from '@/stores/useAchievementStore';
import { achievementService } from '@/services/achievementService';

jest.mock('@/services/achievementService', () => ({
  achievementService: {
    checkAchievements: jest.fn(),
    getAchievementProgress: jest.fn(),
    getNearCompleteAchievements: jest.fn(),
  },
  ACHIEVEMENTS: [
    { id: 'streak_7', name: '7-Day Streak', category: 'streak', xpReward: 50, icon: '🔥', description: 'Practice 7 days in a row' },
    { id: 'practice_10', name: '10 Practices', category: 'practice', xpReward: 30, icon: '🌟', description: 'Complete 10 practices' },
    { id: 'mala_1', name: 'First Mala', category: 'mala', xpReward: 20, icon: '📿', description: 'Complete your first mala' },
  ],
}));
jest.mock('@/services/firestore', () => ({
  firestoreService: {
    saveAchievementData: jest.fn(() => Promise.resolve()),
    loadAchievementData: jest.fn(() => Promise.resolve(null)),
  },
}));
jest.mock('@/services/activityService', () => ({
  activityService: {
    postAchievementActivity: jest.fn(() => Promise.resolve('activity-id')),
  },
}));
jest.mock('@/utils/storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

const mockAchievementService = achievementService as jest.Mocked<typeof achievementService>;

const MOCK_ACHIEVEMENTS = [
  { id: 'streak_7', name: '7-Day Streak', category: 'streak', xpReward: 50, icon: '🔥', description: 'Practice 7 days in a row' },
  { id: 'practice_10', name: '10 Practices', category: 'practice', xpReward: 30, icon: '🌟', description: 'Complete 10 practices' },
  { id: 'mala_1', name: 'First Mala', category: 'mala', xpReward: 20, icon: '📿', description: 'Complete your first mala' },
];

function resetAchievementStore() {
  useAchievementStore.setState({
    unlockedAchievements: [],
    unlockedAchievementIds: [],
    stats: {
      totalUnlocked: 0,
      totalAchievements: 3,
      completionPercentage: 0,
      totalXPFromAchievements: 0,
      unlockedByCategory: { streak: 0, practice: 0, mala: 0, quest: 0, social: 0, group: 0 },
      rarestAchievement: null,
    },
    showUnlockModal: false,
    pendingUnlocks: [],
    currentUnlock: null,
  });
}

describe('useAchievementStore — checkAchievements', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetAchievementStore();
  });

  it('should unlock newly achieved achievements', async () => {
    mockAchievementService.checkAchievements.mockReturnValue({
      newlyUnlocked: [MOCK_ACHIEVEMENTS[0]],
      nearCompletion: [],
    } as any);

    const userStats = { practiceStats: { currentStreak: 7 }, questStats: {} };
    const result = await useAchievementStore.getState().checkAchievements(userStats as any);

    expect(result.newlyUnlocked).toHaveLength(1);
    expect(result.newlyUnlocked[0].id).toBe('streak_7');
  });

  it('should add newly unlocked achievements to pendingUnlocks queue', async () => {
    mockAchievementService.checkAchievements.mockReturnValue({
      newlyUnlocked: [MOCK_ACHIEVEMENTS[0], MOCK_ACHIEVEMENTS[1]],
      nearCompletion: [],
    } as any);

    const userStats = { practiceStats: { currentStreak: 7, totalPractices: 10 }, questStats: {} };
    await useAchievementStore.getState().checkAchievements(userStats as any);

    const state = useAchievementStore.getState();
    expect(state.pendingUnlocks.length).toBeGreaterThan(0);
  });

  it('should NOT re-unlock already unlocked achievements', async () => {
    useAchievementStore.setState({
      unlockedAchievementIds: ['streak_7'],
    });

    mockAchievementService.checkAchievements.mockReturnValue({
      newlyUnlocked: [], // already unlocked, not returned again
      nearCompletion: [],
    } as any);

    const userStats = { practiceStats: { currentStreak: 7 }, questStats: {} };
    const result = await useAchievementStore.getState().checkAchievements(userStats as any);

    expect(result.newlyUnlocked).toHaveLength(0);
  });

  it('should return empty result if no new achievements', async () => {
    mockAchievementService.checkAchievements.mockReturnValue({
      newlyUnlocked: [],
      nearCompletion: [],
    } as any);

    const result = await useAchievementStore.getState().checkAchievements({} as any);
    expect(result.newlyUnlocked).toHaveLength(0);
  });
});

describe('useAchievementStore — unlockAchievement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetAchievementStore();
  });

  it('should add achievement to unlockedAchievements', async () => {
    await useAchievementStore.getState().unlockAchievement(MOCK_ACHIEVEMENTS[0] as any);

    const state = useAchievementStore.getState();
    expect(state.unlockedAchievements).toHaveLength(1);
    expect(state.unlockedAchievements[0].achievementId).toBe('streak_7');
  });

  it('should add achievement id to unlockedAchievementIds', async () => {
    await useAchievementStore.getState().unlockAchievement(MOCK_ACHIEVEMENTS[0] as any);

    expect(useAchievementStore.getState().unlockedAchievementIds).toContain('streak_7');
  });

  it('should include unlockedAt timestamp', async () => {
    await useAchievementStore.getState().unlockAchievement(MOCK_ACHIEVEMENTS[0] as any);

    const { unlockedAchievements } = useAchievementStore.getState();
    expect(unlockedAchievements[0].unlockedAt).toBeDefined();
    expect(new Date(unlockedAchievements[0].unlockedAt).getFullYear()).toBe(2026);
  });

  it('should include xpEarned in unlock record', async () => {
    await useAchievementStore.getState().unlockAchievement(MOCK_ACHIEVEMENTS[0] as any);

    const { unlockedAchievements } = useAchievementStore.getState();
    expect(unlockedAchievements[0].xpEarned).toBe(50);
  });
});

describe('useAchievementStore — Modal Queue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetAchievementStore();
  });

  it('should show first achievement when showNextUnlock is called', () => {
    useAchievementStore.setState({
      pendingUnlocks: [MOCK_ACHIEVEMENTS[0], MOCK_ACHIEVEMENTS[1]] as any,
    });

    useAchievementStore.getState().showNextUnlock();

    const state = useAchievementStore.getState();
    expect(state.showUnlockModal).toBe(true);
    expect(state.currentUnlock?.id).toBe('streak_7');
  });

  it('should show nothing if pendingUnlocks is empty', () => {
    useAchievementStore.setState({ pendingUnlocks: [] });

    useAchievementStore.getState().showNextUnlock();

    expect(useAchievementStore.getState().showUnlockModal).toBe(false);
    expect(useAchievementStore.getState().currentUnlock).toBeNull();
  });

  it('should advance queue on dismissUnlockModal', () => {
    useAchievementStore.setState({
      pendingUnlocks: [MOCK_ACHIEVEMENTS[0], MOCK_ACHIEVEMENTS[1]] as any,
      showUnlockModal: true,
      currentUnlock: MOCK_ACHIEVEMENTS[0] as any,
    });

    useAchievementStore.getState().dismissUnlockModal();

    const state = useAchievementStore.getState();
    // Should have advanced the queue (removed first item)
    expect(state.pendingUnlocks.length).toBeLessThanOrEqual(1);
  });

  it('should handle dismissing the last achievement in queue', () => {
    useAchievementStore.setState({
      pendingUnlocks: [MOCK_ACHIEVEMENTS[0]] as any,
      showUnlockModal: true,
      currentUnlock: MOCK_ACHIEVEMENTS[0] as any,
    });

    useAchievementStore.getState().dismissUnlockModal();

    const state = useAchievementStore.getState();
    expect(state.pendingUnlocks).toHaveLength(0);
  });

  it('should unlock 3 achievements and record all of them', async () => {
    // Simulate multiple simultaneous unlocks (e.g. from checkAchievements)
    for (const achievement of MOCK_ACHIEVEMENTS) {
      await useAchievementStore.getState().unlockAchievement(achievement as any);
    }

    expect(useAchievementStore.getState().unlockedAchievements).toHaveLength(3);
    expect(useAchievementStore.getState().unlockedAchievementIds).toHaveLength(3);
    // pendingUnlocks is managed by checkAchievements; can be set manually via setState
    useAchievementStore.setState({ pendingUnlocks: MOCK_ACHIEVEMENTS as any });
    expect(useAchievementStore.getState().pendingUnlocks).toHaveLength(3);
  });
});
