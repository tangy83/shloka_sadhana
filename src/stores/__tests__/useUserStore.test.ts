/**
 * User Store Tests
 * Tests for streak logic, stats calculation, preferences, and recently practiced tracking
 */

import { useUserStore } from '@/stores/useUserStore';
import * as practiceStorage from '@/utils/practiceStorage';
import * as storage from '@/utils/storage';

// Mock dependencies
jest.mock('@/utils/practiceStorage');
jest.mock('@/utils/storage');
jest.mock('@/services/firestore', () => ({
  firestoreService: {
    saveUserData: jest.fn(() => Promise.resolve()),
    loadUserData: jest.fn(() => Promise.resolve(null)),
    syncPracticeHistory: jest.fn(() => Promise.resolve()),
  },
}));
jest.mock('@/services/auth', () => ({
  authService: {
    getCurrentUser: jest.fn(() => null),
    isSignedIn: jest.fn(() => false),
  },
}));
jest.mock('@/services/feedService', () => ({
  feedService: {
    generateFeed: jest.fn(() => Promise.resolve({ sections: [] })),
  },
}));
jest.mock('@/stores/useQuestStore', () => ({
  useQuestStore: {
    getState: jest.fn(() => ({ stats: { totalCompleted: 0 } })),
  },
}));
jest.mock('@/stores/useAchievementStore', () => ({
  useAchievementStore: {
    getState: jest.fn(() => ({ stats: { totalUnlocked: 0 } })),
  },
}));

const mockPracticeStorage = practiceStorage as jest.Mocked<typeof practiceStorage>;
const mockStorage = storage as jest.Mocked<typeof storage>;

// Helper: Reset store to initial state
function resetUserStore() {
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
  });
}

describe('useUserStore — Streak Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetUserStore();
    mockStorage.setItem.mockResolvedValue(undefined);
    mockStorage.getItem.mockResolvedValue(null);
  });

  it('should start with streak of 0', () => {
    const state = useUserStore.getState();
    expect(state.currentStreak).toBe(0);
    expect(state.longestStreak).toBe(0);
    expect(state.lastCompletedDate).toBeNull();
  });

  it('should increment streak from 0 to 1 on first practice', async () => {
    const today = new Date().toISOString();
    await useUserStore.getState().updateStreak(today);

    const state = useUserStore.getState();
    expect(state.currentStreak).toBe(1);
    expect(state.totalPractices).toBe(1);
    expect(state.lastCompletedDate).toBe(today);
  });

  it('should NOT increment streak if already practiced today', async () => {
    const today = new Date().toISOString();

    // First practice
    await useUserStore.getState().updateStreak(today);
    expect(useUserStore.getState().currentStreak).toBe(1);
    expect(useUserStore.getState().totalPractices).toBe(1);

    // Second practice same day
    await useUserStore.getState().updateStreak(today);
    expect(useUserStore.getState().currentStreak).toBe(1); // unchanged
    expect(useUserStore.getState().totalPractices).toBe(1); // unchanged
  });

  it('should extend streak when practicing consecutive days', async () => {
    // Simulate yesterday's practice by setting state directly
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    useUserStore.setState({
      currentStreak: 5,
      lastCompletedDate: yesterday.toISOString(),
    });

    const today = new Date().toISOString();
    await useUserStore.getState().updateStreak(today);

    const state = useUserStore.getState();
    expect(state.currentStreak).toBe(6);
    expect(state.totalPractices).toBe(1); // increments by 1
  });

  it('should reset streak to 1 if more than one day is skipped', async () => {
    // Simulate practice 2 days ago (skipped yesterday)
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    useUserStore.setState({
      currentStreak: 10,
      longestStreak: 10,
      lastCompletedDate: twoDaysAgo.toISOString(),
    });

    const today = new Date().toISOString();
    await useUserStore.getState().updateStreak(today);

    const state = useUserStore.getState();
    expect(state.currentStreak).toBe(1); // Reset
  });

  it('should update longestStreak when current streak exceeds it', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    useUserStore.setState({
      currentStreak: 9,
      longestStreak: 9,
      lastCompletedDate: yesterday.toISOString(),
    });

    const today = new Date().toISOString();
    await useUserStore.getState().updateStreak(today);

    const state = useUserStore.getState();
    expect(state.currentStreak).toBe(10);
    expect(state.longestStreak).toBe(10);
  });

  it('should NOT update longestStreak when current streak is shorter', async () => {
    // User has a longest streak of 50 but broke the current streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    useUserStore.setState({
      currentStreak: 4,
      longestStreak: 50,
      lastCompletedDate: yesterday.toISOString(),
    });

    const today = new Date().toISOString();
    await useUserStore.getState().updateStreak(today);

    const state = useUserStore.getState();
    expect(state.currentStreak).toBe(5);
    expect(state.longestStreak).toBe(50); // unchanged
  });

  it('should persist streak data to storage after update', async () => {
    const today = new Date().toISOString();
    await useUserStore.getState().updateStreak(today);

    expect(mockStorage.setItem).toHaveBeenCalledWith(
      expect.stringContaining('streak'),
      expect.objectContaining({ currentStreak: 1 })
    );
  });
});

describe('useUserStore — loadStreakData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetUserStore();
  });

  it('should load streak data from storage', async () => {
    const savedData = {
      currentStreak: 7,
      longestStreak: 15,
      lastCompletedDate: '2026-02-15T10:00:00.000Z',
      totalPractices: 42,
    };
    mockStorage.getItem.mockResolvedValue(savedData);

    await useUserStore.getState().loadStreakData();

    const state = useUserStore.getState();
    expect(state.currentStreak).toBe(7);
    expect(state.longestStreak).toBe(15);
    expect(state.totalPractices).toBe(42);
  });

  it('should handle missing storage gracefully (no crash)', async () => {
    mockStorage.getItem.mockResolvedValue(null);

    await expect(useUserStore.getState().loadStreakData()).resolves.not.toThrow();
    expect(useUserStore.getState().currentStreak).toBe(0); // unchanged
  });

  it('should handle storage errors gracefully', async () => {
    mockStorage.getItem.mockRejectedValue(new Error('Storage unavailable'));

    await expect(useUserStore.getState().loadStreakData()).resolves.not.toThrow();
  });
});

describe('useUserStore — loadStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetUserStore();
  });

  it('should calculate stats from practice history', async () => {
    const mockHistory = [
      { id: '1', duration: 10, shlokaId: 'gayatri', malaCount: 1 },
      { id: '2', duration: 20, shlokaId: 'hanuman', malaCount: 2 },
      { id: '3', duration: 15, shlokaId: 'gayatri', malaCount: 1 },
    ];
    const mockStats = {
      totalPractices: 3,
      totalMinutes: 45,
      favoriteShlokaId: 'gayatri',
      lastPracticeDate: '2026-02-15',
    };

    mockPracticeStorage.loadPracticeHistory.mockResolvedValue(mockHistory as any);
    mockPracticeStorage.getPracticeStats.mockReturnValue(mockStats as any);

    await useUserStore.getState().loadStats();

    const state = useUserStore.getState();
    expect(state.totalMinutes).toBe(45);
    expect(state.favoriteShlokaId).toBe('gayatri');
  });

  it('should handle empty practice history', async () => {
    mockPracticeStorage.loadPracticeHistory.mockResolvedValue([]);
    mockPracticeStorage.getPracticeStats.mockReturnValue({
      totalPractices: 0,
      totalMinutes: 0,
      favoriteShlokaId: null,
      lastPracticeDate: null,
    } as any);

    await useUserStore.getState().loadStats();

    expect(useUserStore.getState().totalMinutes).toBe(0);
    expect(useUserStore.getState().favoriteShlokaId).toBeNull();
  });
});

describe('useUserStore — Recently Practiced', () => {
  beforeEach(() => {
    resetUserStore();
  });

  it('should add a shloka to recently practiced list', () => {
    useUserStore.getState().addRecentlyPracticed('gayatri', 'Gayatri Mantra');

    const { recentlyPracticedShlokas } = useUserStore.getState();
    expect(recentlyPracticedShlokas).toHaveLength(1);
    expect(recentlyPracticedShlokas[0].id).toBe('gayatri');
    expect(recentlyPracticedShlokas[0].name).toBe('Gayatri Mantra');
  });

  it('should move existing shloka to front instead of duplicating', () => {
    useUserStore.getState().addRecentlyPracticed('gayatri', 'Gayatri Mantra');
    useUserStore.getState().addRecentlyPracticed('hanuman', 'Hanuman Chalisa');
    useUserStore.getState().addRecentlyPracticed('gayatri', 'Gayatri Mantra'); // Again

    const { recentlyPracticedShlokas } = useUserStore.getState();
    // Should have 2 items, no duplicates
    expect(recentlyPracticedShlokas).toHaveLength(2);
    expect(recentlyPracticedShlokas[0].id).toBe('gayatri'); // moved to front
  });

  it('should keep only 5 most recently practiced shlokas', () => {
    const shlokas = ['a', 'b', 'c', 'd', 'e', 'f'];
    shlokas.forEach((id) => useUserStore.getState().addRecentlyPracticed(id, `Shloka ${id}`));

    const { recentlyPracticedShlokas } = useUserStore.getState();
    expect(recentlyPracticedShlokas.length).toBeLessThanOrEqual(5);
    expect(recentlyPracticedShlokas[0].id).toBe('f'); // most recent first
  });
});

describe('useUserStore — recordPracticeTime', () => {
  beforeEach(() => {
    resetUserStore();
  });

  it('should add practice timestamp to history', () => {
    const timestamp = '2026-02-17T07:30:00.000Z';
    useUserStore.getState().recordPracticeTime(timestamp);

    const { practiceTimeHistory } = useUserStore.getState();
    expect(practiceTimeHistory).toContain(timestamp);
  });

  it('should keep rolling window of last 14 entries', () => {
    // Add 15 timestamps
    for (let i = 0; i < 15; i++) {
      useUserStore.getState().recordPracticeTime(`2026-02-${String(i + 1).padStart(2, '0')}T07:00:00.000Z`);
    }

    const { practiceTimeHistory } = useUserStore.getState();
    expect(practiceTimeHistory.length).toBeLessThanOrEqual(14);
  });
});

describe('useUserStore — Preferences', () => {
  beforeEach(() => {
    resetUserStore();
    mockStorage.setItem.mockResolvedValue(undefined);
  });

  it('should update preferences', async () => {
    await useUserStore.getState().setPreferences({ experienceLevel: 'intermediate', preferredDeity: 'Shiva' });

    const { preferences } = useUserStore.getState();
    expect(preferences.experienceLevel).toBe('intermediate');
    expect(preferences.preferredDeity).toBe('Shiva');
  });

  it('should merge preferences (not replace)', async () => {
    useUserStore.setState({ preferences: { experienceLevel: 'beginner', dailyTime: '5-10' } });

    await useUserStore.getState().setPreferences({ preferredDeity: 'Ganesha' });

    const { preferences } = useUserStore.getState();
    expect(preferences.experienceLevel).toBe('beginner'); // preserved
    expect(preferences.dailyTime).toBe('5-10'); // preserved
    expect(preferences.preferredDeity).toBe('Ganesha'); // added
  });

  it('should set onboarding complete and persist it', async () => {
    await useUserStore.getState().setOnboardingComplete(true);

    expect(useUserStore.getState().onboardingComplete).toBe(true);
    expect(mockStorage.setItem).toHaveBeenCalledWith(
      expect.stringContaining('onboarding'),
      true
    );
  });
});
