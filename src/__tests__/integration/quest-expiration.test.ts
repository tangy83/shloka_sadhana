/**
 * Quest Expiration Integration Tests
 * Tests daily quest lifecycle: preservation, expiration, and regeneration
 */

import { useQuestStore } from '@/stores/useQuestStore';
import { questService } from '@/services/questService';

// Mock all external dependencies the quest store imports
jest.mock('@/services/questService');
jest.mock('@/utils/questStorage', () => ({
  saveCurrentQuest: jest.fn(() => Promise.resolve()),
  loadCurrentQuest: jest.fn(() => Promise.resolve(null)),
  clearCurrentQuest: jest.fn(() => Promise.resolve()),
  saveCompletedQuest: jest.fn(() => Promise.resolve()),
  loadCompletedQuests: jest.fn(() => Promise.resolve([])),
  getQuestStats: jest.fn(() => Promise.resolve({
    totalCompleted: 0,
    questStreak: 0,
    longestQuestStreak: 0,
    totalXP: 0,
    completionRate: 0,
    favoriteQuestType: null,
  })),
  saveQuestStats: jest.fn(() => Promise.resolve()),
  hasCompletedQuestToday: jest.fn(() => Promise.resolve(false)),
}));
jest.mock('@/services/firestore', () => ({
  firestoreService: {
    syncQuestData: jest.fn(() => Promise.resolve()),
    loadQuestData: jest.fn(() => Promise.resolve(null)),
  },
}));
jest.mock('@/services/activityService', () => ({
  activityService: {
    postQuestActivity: jest.fn(() => Promise.resolve()),
  },
}));
jest.mock('@react-native-firebase/auth', () => {
  const mockAuthInstance = { currentUser: null };
  const mockAuthFn = jest.fn(() => mockAuthInstance);
  return { __esModule: true, default: mockAuthFn };
});

const mockQS = questService as jest.Mocked<typeof questService>;

const TODAY = new Date().toISOString().split('T')[0];
const YESTERDAY = new Date(Date.now() - 86400000).toISOString().split('T')[0];

const ACTIVE_QUEST: any = {
  id: 'quest-today',
  type: 'practice_once',
  name: 'First Steps',
  description: 'Practice any shloka today',
  target: 1,
  progress: 0,
  status: 'active',
  difficulty: 'beginner',
  xpReward: 10,
  expiresAt: TODAY + 'T23:59:59.000Z',
  startedAt: TODAY + 'T00:00:00.000Z',
};

const EXPIRED_QUEST: any = {
  ...ACTIVE_QUEST,
  id: 'quest-yesterday',
  status: 'active',
  expiresAt: YESTERDAY + 'T23:59:59.000Z',
  startedAt: YESTERDAY + 'T00:00:00.000Z',
};

const COMPLETED_QUEST: any = {
  ...ACTIVE_QUEST,
  progress: 1,
  status: 'completed',
  completedAt: TODAY + 'T08:00:00.000Z',
};

function resetQuestStore() {
  useQuestStore.setState({
    currentQuest: null,
    isQuestLoading: false,
    showCompletionModal: false,
    lastReward: null,
    lastCompletedQuest: null,
    stats: {
      totalCompleted: 0,
      questStreak: 0,
      longestQuestStreak: 0,
      totalXP: 0,
      completionRate: 0,
      favoriteQuestType: null,
    },
  });
}

describe('Quest Expiration — Same-day Quest Preservation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetQuestStore();
    mockQS.isQuestExpired.mockReturnValue(false);
  });

  it('should preserve existing quest when it has not expired', async () => {
    useQuestStore.setState({ currentQuest: ACTIVE_QUEST });

    await useQuestStore.getState().resetQuestIfExpired();

    // Quest should remain unchanged — not expired so expireQuestIfNeeded not called
    expect(useQuestStore.getState().currentQuest?.id).toBe('quest-today');
    expect(mockQS.expireQuestIfNeeded).not.toHaveBeenCalled();
  });

  it('should not clear quest when already active today', async () => {
    useQuestStore.setState({ currentQuest: ACTIVE_QUEST });

    await useQuestStore.getState().resetQuestIfExpired();

    // Quest should still be set (not cleared)
    expect(useQuestStore.getState().currentQuest).not.toBeNull();
    expect(useQuestStore.getState().currentQuest?.status).toBe('active');
  });
});

describe('Quest Expiration — Next-day Quest Expiration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetQuestStore();
    mockQS.isQuestExpired.mockReturnValue(true);
    mockQS.expireQuestIfNeeded.mockReturnValue({ ...EXPIRED_QUEST, status: 'expired' });
  });

  it('should detect an expired quest', async () => {
    useQuestStore.setState({ currentQuest: EXPIRED_QUEST });

    await useQuestStore.getState().resetQuestIfExpired();

    expect(mockQS.isQuestExpired).toHaveBeenCalledWith(EXPIRED_QUEST);
    expect(mockQS.expireQuestIfNeeded).toHaveBeenCalledWith(EXPIRED_QUEST);
  });

  it('should clear the expired quest from state', async () => {
    useQuestStore.setState({ currentQuest: EXPIRED_QUEST });

    await useQuestStore.getState().resetQuestIfExpired();

    // Store sets currentQuest to null after clearing an expired quest
    expect(useQuestStore.getState().currentQuest).toBeNull();
  });

  it('should handle no current quest gracefully', async () => {
    useQuestStore.setState({ currentQuest: null });

    await expect(useQuestStore.getState().resetQuestIfExpired()).resolves.not.toThrow();
  });
});

describe('Quest Expiration — Completed Quest Lifecycle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetQuestStore();
    mockQS.isQuestExpired.mockReturnValue(false);
  });

  it('should preserve completed quest on same day', async () => {
    useQuestStore.setState({ currentQuest: COMPLETED_QUEST });

    await useQuestStore.getState().resetQuestIfExpired();

    // Not expired, so expireQuestIfNeeded should not be called
    expect(mockQS.expireQuestIfNeeded).not.toHaveBeenCalled();
    expect(useQuestStore.getState().currentQuest?.status).toBe('completed');
  });

  it('should show completion modal when quest completes', async () => {
    mockQS.updateQuestProgress.mockReturnValue({
      quest: COMPLETED_QUEST,
      isCompleted: true,
      reward: { xp: 10, message: 'Great start! Your spiritual journey begins' },
    });
    mockQS.isQuestExpired.mockReturnValue(false);

    useQuestStore.setState({ currentQuest: ACTIVE_QUEST });

    await useQuestStore.getState().updateProgress({
      practiceCompleted: true,
      duration: 0,
      malaCount: 0,
      hasSankalp: false,
    });

    expect(useQuestStore.getState().showCompletionModal).toBe(true);
  });
});

describe('Quest Expiration — New Quest Generation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetQuestStore();
  });

  it('should generate new quest with correct config', async () => {
    const newQuest = { ...ACTIVE_QUEST, id: 'quest-new' };
    mockQS.generateDailyQuest.mockReturnValue(newQuest);

    const config: any = {
      userLevel: 'beginner',
      currentStreak: 5,
      totalPractices: 20,
      preferredDeity: 'Shiva',
    };

    await useQuestStore.getState().generateNewQuest(config);

    expect(mockQS.generateDailyQuest).toHaveBeenCalledWith(config);
    expect(useQuestStore.getState().currentQuest?.id).toBe('quest-new');
  });

  it('should reset progress when generating new quest', async () => {
    // Set a completed quest before generating new one
    useQuestStore.setState({ currentQuest: COMPLETED_QUEST });
    const newQuest = { ...ACTIVE_QUEST, id: 'quest-fresh', progress: 0 };
    mockQS.generateDailyQuest.mockReturnValue(newQuest);

    await useQuestStore.getState().generateNewQuest({ userLevel: 'beginner', currentStreak: 0, totalPractices: 0 } as any);

    // New quest starts at 0 progress
    expect(useQuestStore.getState().currentQuest?.progress).toBe(0);
  });
});
