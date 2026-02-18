/**
 * Streak Logic Integration Tests
 * Tests for all day boundary edge cases in streak calculation
 */

import { useUserStore } from '@/stores/useUserStore';

jest.mock('@/utils/storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));
jest.mock('@/utils/practiceStorage', () => ({
  loadPracticeHistory: jest.fn(() => Promise.resolve([])),
  getPracticeStats: jest.fn(() => ({ totalPractices: 0, totalMinutes: 0, favoriteShlokaId: null, lastPracticeDate: null })),
}));
jest.mock('@/services/firestore', () => ({
  firestoreService: { saveUserData: jest.fn(() => Promise.resolve()), loadUserData: jest.fn(() => Promise.resolve(null)) },
}));
jest.mock('@/services/auth', () => ({
  authService: { getCurrentUser: jest.fn(() => null), isSignedIn: jest.fn(() => false) },
}));
jest.mock('@/services/feedService', () => ({
  feedService: { generateFeed: jest.fn(() => Promise.resolve({ sections: [] })) },
}));
jest.mock('@/stores/useQuestStore', () => ({
  useQuestStore: { getState: jest.fn(() => ({ stats: { totalCompleted: 0 } })) },
}));
jest.mock('@/stores/useAchievementStore', () => ({
  useAchievementStore: { getState: jest.fn(() => ({ stats: { totalUnlocked: 0 } })) },
}));

function resetStreak(overrides = {}) {
  useUserStore.setState({
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
    ...overrides,
  });
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

describe('Streak — First Practice', () => {
  beforeEach(() => resetStreak());

  it('should create a streak of 1 on very first practice', async () => {
    await useUserStore.getState().updateStreak(new Date().toISOString());

    expect(useUserStore.getState().currentStreak).toBe(1);
    expect(useUserStore.getState().longestStreak).toBe(1);
    expect(useUserStore.getState().totalPractices).toBe(1);
  });

  it('should record lastCompletedDate after first practice', async () => {
    const now = new Date().toISOString();
    await useUserStore.getState().updateStreak(now);

    expect(useUserStore.getState().lastCompletedDate).toBe(now);
  });
});

describe('Streak — Same Day (Already Practiced Today)', () => {
  beforeEach(() => resetStreak());

  it('should NOT increment streak if already practiced today', async () => {
    // First practice today
    const today = new Date().toISOString();
    await useUserStore.getState().updateStreak(today);
    expect(useUserStore.getState().currentStreak).toBe(1);
    expect(useUserStore.getState().totalPractices).toBe(1);

    // Second practice same day (e.g., morning and evening)
    await useUserStore.getState().updateStreak(today);
    expect(useUserStore.getState().currentStreak).toBe(1); // unchanged
    expect(useUserStore.getState().totalPractices).toBe(1); // unchanged
  });
});

describe('Streak — Consecutive Days', () => {
  beforeEach(() => resetStreak());

  it('should increment streak when practicing the next day', async () => {
    useUserStore.setState({
      currentStreak: 5,
      longestStreak: 5,
      lastCompletedDate: daysAgo(1), // yesterday
      totalPractices: 5,
    });

    await useUserStore.getState().updateStreak(new Date().toISOString());

    expect(useUserStore.getState().currentStreak).toBe(6);
    expect(useUserStore.getState().totalPractices).toBe(6);
  });

  it('should update longestStreak when current streak exceeds it', async () => {
    useUserStore.setState({
      currentStreak: 10,
      longestStreak: 10,
      lastCompletedDate: daysAgo(1),
    });

    await useUserStore.getState().updateStreak(new Date().toISOString());

    expect(useUserStore.getState().currentStreak).toBe(11);
    expect(useUserStore.getState().longestStreak).toBe(11);
  });

  it('should NOT update longestStreak when current streak is shorter than best', async () => {
    useUserStore.setState({
      currentStreak: 4,
      longestStreak: 30, // previous best
      lastCompletedDate: daysAgo(1),
    });

    await useUserStore.getState().updateStreak(new Date().toISOString());

    expect(useUserStore.getState().currentStreak).toBe(5);
    expect(useUserStore.getState().longestStreak).toBe(30); // preserved
  });
});

describe('Streak — Broken Streak (Skipped Day)', () => {
  beforeEach(() => resetStreak());

  it('should reset streak to 1 when a day is skipped', async () => {
    useUserStore.setState({
      currentStreak: 15,
      longestStreak: 15,
      lastCompletedDate: daysAgo(2), // 2 days ago (skipped yesterday)
    });

    await useUserStore.getState().updateStreak(new Date().toISOString());

    expect(useUserStore.getState().currentStreak).toBe(1);
  });

  it('should reset streak to 1 when many days are skipped', async () => {
    useUserStore.setState({
      currentStreak: 100,
      longestStreak: 100,
      lastCompletedDate: daysAgo(30),
    });

    await useUserStore.getState().updateStreak(new Date().toISOString());

    expect(useUserStore.getState().currentStreak).toBe(1);
  });

  it('should preserve longestStreak even after breaking current streak', async () => {
    useUserStore.setState({
      currentStreak: 50,
      longestStreak: 50,
      lastCompletedDate: daysAgo(5),
    });

    await useUserStore.getState().updateStreak(new Date().toISOString());

    expect(useUserStore.getState().currentStreak).toBe(1);
    expect(useUserStore.getState().longestStreak).toBe(50); // preserved
  });

  it('should increment totalPractices even when streak resets', async () => {
    useUserStore.setState({
      currentStreak: 10,
      longestStreak: 10,
      lastCompletedDate: daysAgo(5),
      totalPractices: 25,
    });

    await useUserStore.getState().updateStreak(new Date().toISOString());

    expect(useUserStore.getState().totalPractices).toBe(26);
  });
});

describe('Streak — Edge Cases', () => {
  beforeEach(() => resetStreak());

  it('should handle null lastCompletedDate (first ever practice)', async () => {
    useUserStore.setState({ lastCompletedDate: null, currentStreak: 0 });

    await useUserStore.getState().updateStreak(new Date().toISOString());

    expect(useUserStore.getState().currentStreak).toBe(1);
  });

  it('should handle the boundary between end of one day and start of next', async () => {
    // Practice at 11:58 PM one day
    const d = new Date();
    d.setHours(23, 58, 0, 0);
    d.setDate(d.getDate() - 1);
    useUserStore.setState({
      currentStreak: 3,
      lastCompletedDate: d.toISOString(),
    });

    // Practice at 12:01 AM next day
    const nextDay = new Date();
    nextDay.setHours(0, 1, 0, 0);

    await useUserStore.getState().updateStreak(nextDay.toISOString());

    expect(useUserStore.getState().currentStreak).toBe(4);
  });

  it('should handle practicing at exactly midnight', async () => {
    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);

    await useUserStore.getState().updateStreak(midnight.toISOString());

    expect(useUserStore.getState().currentStreak).toBe(1);
  });
});

describe('Streak — saveStreakData is called', () => {
  beforeEach(() => {
    resetStreak();
  });

  it('should call setItem after updating streak', async () => {
    const { setItem } = require('@/utils/storage');

    await useUserStore.getState().updateStreak(new Date().toISOString());

    expect(setItem).toHaveBeenCalledWith(
      expect.stringContaining('streak'),
      expect.objectContaining({ currentStreak: 1 })
    );
  });
});
