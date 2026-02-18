/**
 * Cloud Sync Integration Tests
 * Tests Firebase sync: load from cloud, merge logic, error handling
 */

import { useUserStore } from '@/stores/useUserStore';
import { firestoreService } from '@/services/firestore';
import { authService } from '@/services/auth';

jest.mock('@/services/firestore', () => ({
  firestoreService: {
    hasCloudData: jest.fn(),
    loadAllData: jest.fn(),
    syncAllData: jest.fn(),
  },
}));
jest.mock('@/services/auth', () => ({
  authService: {
    getCurrentUser: jest.fn(),
    isSignedIn: jest.fn(() => false),
  },
}));
jest.mock('@/utils/storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));
jest.mock('@/utils/practiceStorage', () => ({
  loadPracticeHistory: jest.fn(() => Promise.resolve([])),
  getPracticeStats: jest.fn(() => ({
    totalPractices: 0,
    totalMinutes: 0,
    favoriteShlokaId: null,
    lastPracticeDate: null,
  })),
}));
jest.mock('@/services/feedService', () => ({
  feedService: {
    buildFeedContext: jest.fn(() => ({})),
    generatePersonalizedFeed: jest.fn(() => []),
    shouldRefreshFeed: jest.fn(() => false),
  },
}));
jest.mock('@/stores/useQuestStore', () => ({
  useQuestStore: {
    getState: jest.fn(() => ({
      currentQuest: null,
      loadQuestData: jest.fn(() => Promise.resolve()),
      stats: { totalAchievements: 0 },
    })),
  },
}));
jest.mock('@/stores/useAchievementStore', () => ({
  useAchievementStore: {
    getState: jest.fn(() => ({
      stats: { totalAchievements: 0 },
      unlockedAchievements: [],
    })),
  },
}));

const mockFS = firestoreService as jest.Mocked<typeof firestoreService>;
const mockAuth = authService as jest.Mocked<typeof authService>;

const MOCK_USER = { uid: 'test-uid', email: 'test@example.com' } as any;

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
  } as any);
}

describe('Cloud Sync — loadFromCloud', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetUserStore();
    mockAuth.getCurrentUser.mockReturnValue(MOCK_USER);
  });

  it('should load streak data from cloud', async () => {
    mockFS.hasCloudData.mockResolvedValue(true);
    mockFS.loadAllData.mockResolvedValue({
      streak: {
        currentStreak: 10,
        longestStreak: 15,
        lastCompletedDate: '2026-02-16',
        totalPractices: 100,
        totalMinutes: 500,
      },
      practices: [],
      settings: {},
      preferences: {},
    } as any);

    await useUserStore.getState().loadFromCloud();

    expect(useUserStore.getState().currentStreak).toBe(10);
    expect(useUserStore.getState().longestStreak).toBe(15);
    expect(useUserStore.getState().totalPractices).toBe(100);
  });

  it('should prefer cloud streak when cloud is higher than local', async () => {
    useUserStore.setState({ currentStreak: 3, longestStreak: 5 } as any);

    mockFS.hasCloudData.mockResolvedValue(true);
    mockFS.loadAllData.mockResolvedValue({
      streak: {
        currentStreak: 10,
        longestStreak: 20,
        lastCompletedDate: '2026-02-16',
        totalPractices: 50,
        totalMinutes: 300,
      },
      practices: [],
      settings: {},
      preferences: {},
    } as any);

    await useUserStore.getState().loadFromCloud();

    expect(useUserStore.getState().currentStreak).toBe(10);
    expect(useUserStore.getState().longestStreak).toBe(20);
  });

  it('should keep local longest streak when local is higher', async () => {
    useUserStore.setState({ currentStreak: 5, longestStreak: 30 } as any);

    mockFS.hasCloudData.mockResolvedValue(true);
    mockFS.loadAllData.mockResolvedValue({
      streak: {
        currentStreak: 5,
        longestStreak: 15, // lower than local 30
        lastCompletedDate: '2026-02-16',
        totalPractices: 50,
        totalMinutes: 300,
      },
      practices: [],
      settings: {},
      preferences: {},
    } as any);

    await useUserStore.getState().loadFromCloud();

    // longestStreak should be Math.max(cloud=15, local=30) = 30
    expect(useUserStore.getState().longestStreak).toBe(30);
  });

  it('should upload local data on first-time sign-in (no cloud data)', async () => {
    useUserStore.setState({ currentStreak: 5, totalPractices: 10 } as any);
    mockFS.hasCloudData.mockResolvedValue(false);
    mockFS.syncAllData.mockResolvedValue(undefined);

    await useUserStore.getState().loadFromCloud();

    // First time: should sync local data up to cloud
    expect(mockFS.syncAllData).toHaveBeenCalled();
    // Local data should be preserved (syncToCloud does not clear local)
    expect(useUserStore.getState().currentStreak).toBe(5);
  });

  it('should not run if user is not authenticated', async () => {
    mockAuth.getCurrentUser.mockReturnValue(null);

    await useUserStore.getState().loadFromCloud();

    expect(mockFS.hasCloudData).not.toHaveBeenCalled();
  });
});

describe('Cloud Sync — syncToCloud', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetUserStore();
    mockAuth.getCurrentUser.mockReturnValue(MOCK_USER);
    mockFS.syncAllData.mockResolvedValue(undefined);
  });

  it('should sync local data to Firestore', async () => {
    useUserStore.setState({
      currentStreak: 7,
      longestStreak: 10,
      totalPractices: 50,
      totalMinutes: 250,
    } as any);

    await useUserStore.getState().syncToCloud();

    expect(mockFS.syncAllData).toHaveBeenCalledWith(
      'test-uid',
      expect.objectContaining({
        streak: expect.objectContaining({
          currentStreak: 7,
          longestStreak: 10,
        }),
      })
    );
  });

  it('should not throw on sync failure — sync is non-blocking', async () => {
    mockFS.syncAllData.mockRejectedValue(new Error('Network error'));

    // syncToCloud should not re-throw — sync failures are non-blocking
    await expect(useUserStore.getState().syncToCloud()).resolves.not.toThrow();

    // Local data should be preserved
    expect(useUserStore.getState().currentStreak).toBe(0);
  });

  it('should not run if user is not authenticated', async () => {
    mockAuth.getCurrentUser.mockReturnValue(null);

    await useUserStore.getState().syncToCloud();

    expect(mockFS.syncAllData).not.toHaveBeenCalled();
  });
});
