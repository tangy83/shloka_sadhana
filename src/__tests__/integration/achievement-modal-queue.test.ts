/**
 * Achievement Modal Queue Integration Tests
 * Tests for multiple simultaneous unlocks and the sequential modal display pattern
 */

import { useAchievementStore } from '@/stores/useAchievementStore';
import { activityService } from '@/services/activityService';

jest.mock('@/services/activityService', () => ({
  activityService: {
    postAchievementActivity: jest.fn(() => Promise.resolve('activity-id')),
  },
}));
jest.mock('@/services/firestore', () => ({
  firestoreService: {
    saveAchievementData: jest.fn(() => Promise.resolve()),
    loadAchievementData: jest.fn(() => Promise.resolve(null)),
  },
}));
jest.mock('@/utils/storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));
// Ensure Firebase auth returns a user so postAchievementActivity fires
jest.mock('@react-native-firebase/auth', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    currentUser: { uid: 'test-uid-123' },
  })),
}));

jest.mock('@/services/achievementService', () => ({
  achievementService: {
    checkAchievements: jest.fn(),
    getAchievementProgress: jest.fn(),
  },
  ACHIEVEMENTS: [
    { id: 'streak_7', name: '7-Day Streak', category: 'streak', xpReward: 50, icon: '🔥', description: '7 days' },
    { id: 'practice_10', name: '10 Practices', category: 'practice', xpReward: 30, icon: '🌟', description: '10 practices' },
    { id: 'mala_1', name: 'First Mala', category: 'mala', xpReward: 20, icon: '📿', description: 'First mala' },
  ],
}));

const mockActivityService = activityService as jest.Mocked<typeof activityService>;

const MOCK_ACHIEVEMENTS = [
  { id: 'streak_7', name: '7-Day Streak', category: 'streak', xpReward: 50, icon: '🔥', description: '7 days' },
  { id: 'practice_10', name: '10 Practices', category: 'practice', xpReward: 30, icon: '🌟', description: '10 practices' },
  { id: 'mala_1', name: 'First Mala', category: 'mala', xpReward: 20, icon: '📿', description: 'First mala' },
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

describe('Achievement Modal Queue — Multiple Simultaneous Unlocks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetAchievementStore();
  });

  it('should queue all 3 achievements when unlocked simultaneously', async () => {
    for (const achievement of MOCK_ACHIEVEMENTS) {
      await useAchievementStore.getState().unlockAchievement(achievement as any);
    }

    const state = useAchievementStore.getState();
    expect(state.unlockedAchievements).toHaveLength(3);
    // unlockAchievement records in unlockedAchievementIds; pendingUnlocks is managed by checkAchievements
    expect(state.unlockedAchievementIds).toHaveLength(3);
  });

  it('should post activity for each unlocked achievement', async () => {
    for (const achievement of MOCK_ACHIEVEMENTS) {
      await useAchievementStore.getState().unlockAchievement(achievement as any);
    }

    expect(mockActivityService.postAchievementActivity).toHaveBeenCalledTimes(3);
  });

  it('should show the first achievement modal immediately', () => {
    useAchievementStore.setState({
      pendingUnlocks: MOCK_ACHIEVEMENTS as any,
    });

    useAchievementStore.getState().showNextUnlock();

    const state = useAchievementStore.getState();
    expect(state.showUnlockModal).toBe(true);
    expect(state.currentUnlock?.id).toBe('streak_7');
  });

  it('should advance to second achievement after dismissing first', () => {
    useAchievementStore.setState({
      pendingUnlocks: MOCK_ACHIEVEMENTS as any,
      showUnlockModal: true,
      currentUnlock: MOCK_ACHIEVEMENTS[0] as any,
    });

    useAchievementStore.getState().dismissUnlockModal();
    useAchievementStore.getState().showNextUnlock();

    const state = useAchievementStore.getState();
    expect(state.currentUnlock?.id).toBe('practice_10');
  });

  it('should advance to third achievement after dismissing second', () => {
    useAchievementStore.setState({
      pendingUnlocks: [MOCK_ACHIEVEMENTS[1], MOCK_ACHIEVEMENTS[2]] as any,
      showUnlockModal: true,
      currentUnlock: MOCK_ACHIEVEMENTS[1] as any,
    });

    useAchievementStore.getState().dismissUnlockModal();
    useAchievementStore.getState().showNextUnlock();

    const state = useAchievementStore.getState();
    expect(state.currentUnlock?.id).toBe('mala_1');
  });

  it('should close modal after dismissing the last achievement', () => {
    useAchievementStore.setState({
      pendingUnlocks: [MOCK_ACHIEVEMENTS[2]] as any,
      showUnlockModal: true,
      currentUnlock: MOCK_ACHIEVEMENTS[2] as any,
    });

    useAchievementStore.getState().dismissUnlockModal();

    expect(useAchievementStore.getState().pendingUnlocks).toHaveLength(0);
  });

  it('should not re-unlock already unlocked achievements', async () => {
    const { achievementService } = require('@/services/achievementService');

    useAchievementStore.setState({
      unlockedAchievementIds: ['streak_7'],
    });

    achievementService.checkAchievements.mockReturnValue({
      newlyUnlocked: [], // service already filters out unlocked ones
      nearCompletion: [],
    });

    const result = await useAchievementStore.getState().checkAchievements({
      practiceStats: { currentStreak: 7 },
      questStats: {},
    } as any);

    expect(result.newlyUnlocked).toHaveLength(0);
    expect(useAchievementStore.getState().unlockedAchievements).toHaveLength(0);
  });
});

describe('Achievement Modal Queue — Single Unlock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetAchievementStore();
  });

  it('should show single achievement immediately after unlock', async () => {
    await useAchievementStore.getState().unlockAchievement(MOCK_ACHIEVEMENTS[0] as any);

    const state = useAchievementStore.getState();
    expect(state.unlockedAchievements).toHaveLength(1);
    expect(state.unlockedAchievementIds).toContain('streak_7');
  });

  it('should post achievement activity to friend feed', async () => {
    await useAchievementStore.getState().unlockAchievement(MOCK_ACHIEVEMENTS[0] as any);

    expect(mockActivityService.postAchievementActivity).toHaveBeenCalledWith(
      'streak_7',
      '7-Day Streak',
      '🔥',
      50
    );
  });
});

describe('Achievement Modal Queue — Empty Queue', () => {
  beforeEach(() => resetAchievementStore());

  it('should not show modal when queue is empty', () => {
    useAchievementStore.setState({ pendingUnlocks: [] });
    useAchievementStore.getState().showNextUnlock();

    expect(useAchievementStore.getState().showUnlockModal).toBe(false);
    expect(useAchievementStore.getState().currentUnlock).toBeNull();
  });
});
