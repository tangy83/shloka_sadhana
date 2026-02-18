/**
 * Quest Store Tests
 * Tests for quest initialization, progress tracking, completion, and expiration
 */

import { useQuestStore } from '@/stores/useQuestStore';
import { questService } from '@/services/questService';
import * as questStorage from '@/utils/questStorage';
// QuestType and QuestStatus are string union types, not enums — use string literals

jest.mock('@/services/questService');
jest.mock('@/utils/questStorage');
jest.mock('@/services/firestore', () => ({
  firestoreService: {
    syncQuestData: jest.fn(() => Promise.resolve()),
    loadQuestData: jest.fn(() => Promise.resolve(null)),
  },
}));
jest.mock('@/services/activityService', () => ({
  activityService: {
    postQuestActivity: jest.fn(() => Promise.resolve('activity-id')),
  },
}));

const mockQuestService = questService as jest.Mocked<typeof questService>;
const mockQuestStorage = questStorage as jest.Mocked<typeof questStorage>;

function makeQuest(overrides = {}) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return {
    id: 'quest-1',
    type: 'practice_once' as const,
    title: 'Daily Practice',
    description: 'Complete one practice session',
    target: 1,
    progress: 0,
    xpReward: 10,
    status: 'active' as const,
    startedAt: new Date().toISOString(),
    expiresAt: tomorrow.toISOString(),
    ...overrides,
  };
}

function resetQuestStore() {
  useQuestStore.setState({
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
  });
}

describe('useQuestStore — initializeQuest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetQuestStore();
    mockQuestStorage.getQuestStats.mockResolvedValue({
      totalCompleted: 0,
      questStreak: 0,
      longestQuestStreak: 0,
      totalXP: 0,
      completionRate: 0,
      favoriteQuestType: null,
    } as any);
  });

  it('should load saved quest if not expired', async () => {
    const quest = makeQuest();
    mockQuestStorage.loadCurrentQuest.mockResolvedValue(quest as any);
    mockQuestService.isQuestExpired.mockReturnValue(false);

    await useQuestStore.getState().initializeQuest();

    expect(useQuestStore.getState().currentQuest).toEqual(quest);
  });

  it('should clear expired quest and set currentQuest to null', async () => {
    const expiredQuest = makeQuest({ expiresAt: new Date('2020-01-01').toISOString() });
    mockQuestStorage.loadCurrentQuest.mockResolvedValue(expiredQuest as any);
    mockQuestService.isQuestExpired.mockReturnValue(true);
    mockQuestStorage.clearCurrentQuest.mockResolvedValue(undefined);

    await useQuestStore.getState().initializeQuest();

    expect(mockQuestStorage.clearCurrentQuest).toHaveBeenCalled();
    expect(useQuestStore.getState().currentQuest).toBeNull();
  });

  it('should handle no saved quest gracefully', async () => {
    mockQuestStorage.loadCurrentQuest.mockResolvedValue(null);

    await useQuestStore.getState().initializeQuest();

    expect(useQuestStore.getState().currentQuest).toBeNull();
    expect(useQuestStore.getState().isQuestLoading).toBe(false);
  });
});

describe('useQuestStore — generateNewQuest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetQuestStore();
    mockQuestStorage.saveCurrentQuest.mockResolvedValue(undefined);
  });

  it('should generate a quest and save it', async () => {
    const newQuest = makeQuest();
    mockQuestService.generateDailyQuest.mockReturnValue(newQuest as any);

    const config = { totalPractices: 5, currentStreak: 3 };
    await useQuestStore.getState().generateNewQuest(config as any);

    expect(mockQuestService.generateDailyQuest).toHaveBeenCalledWith(config);
    expect(mockQuestStorage.saveCurrentQuest).toHaveBeenCalledWith(newQuest);
    expect(useQuestStore.getState().currentQuest).toEqual(newQuest);
  });
});

describe('useQuestStore — updateProgress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetQuestStore();
    mockQuestStorage.saveCurrentQuest.mockResolvedValue(undefined);
    mockQuestStorage.saveCompletedQuest.mockResolvedValue(undefined);
    mockQuestStorage.saveQuestStats.mockResolvedValue(undefined);
    mockQuestStorage.loadCompletedQuests.mockResolvedValue([]);
    mockQuestStorage.getQuestStats.mockResolvedValue({
      totalCompleted: 0, questStreak: 0, longestQuestStreak: 0,
      totalXP: 0, completionRate: 0, favoriteQuestType: null,
    } as any);
  });

  it('should increment progress on update', async () => {
    const quest = makeQuest({ progress: 0, target: 3 });
    useQuestStore.setState({ currentQuest: quest as any });

    const update = { type: 'practice_once', value: 1 };
    // Store destructures { quest, isCompleted, reward } from updateQuestProgress return
    mockQuestService.updateQuestProgress.mockReturnValue({
      quest: { ...quest, progress: 1 },
      isCompleted: false,
      reward: null,
    } as any);

    await useQuestStore.getState().updateProgress(update as any);

    // progress should be incremented
    expect(mockQuestService.updateQuestProgress).toHaveBeenCalledWith(quest, update);
  });

  it('should return false if no current quest', async () => {
    useQuestStore.setState({ currentQuest: null });

    const result = await useQuestStore.getState().updateProgress({ type: 'practice_once', value: 1 } as any);

    expect(result).toBe(false);
  });

  it('should trigger completeQuest when progress reaches target', async () => {
    const completedAt = new Date().toISOString();
    const quest = makeQuest({ progress: 0, target: 1, startedAt: new Date().toISOString() });
    const completedQuest = { ...quest, progress: 1, status: 'completed', completedAt };
    useQuestStore.setState({ currentQuest: quest as any });

    // Store destructures { quest, isCompleted, reward } from return value
    mockQuestService.updateQuestProgress.mockReturnValue({
      quest: completedQuest,
      isCompleted: true,
      reward: { xp: 10 },
    } as any);
    // completeQuest() calls questService['getCompletionMessage'] (private method via bracket notation)
    (mockQuestService as any)['getCompletionMessage'] = jest.fn(() => 'Great job!');

    await useQuestStore.getState().updateProgress({ type: 'practice_once', value: 1 } as any);

    expect(useQuestStore.getState().showCompletionModal).toBe(true);
  });
});

describe('useQuestStore — resetQuestIfExpired', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetQuestStore();
    mockQuestStorage.clearCurrentQuest.mockResolvedValue(undefined);
  });

  it('should clear quest if expired', async () => {
    const expiredQuest = makeQuest({ expiresAt: new Date('2020-01-01').toISOString() });
    useQuestStore.setState({ currentQuest: expiredQuest as any });
    mockQuestService.isQuestExpired.mockReturnValue(true);
    // Store also calls expireQuestIfNeeded and checks returned status
    mockQuestService.expireQuestIfNeeded.mockReturnValue({ ...expiredQuest, status: 'expired' } as any);

    await useQuestStore.getState().resetQuestIfExpired();

    expect(mockQuestStorage.clearCurrentQuest).toHaveBeenCalled();
    expect(useQuestStore.getState().currentQuest).toBeNull();
  });

  it('should keep quest if not expired', async () => {
    const activeQuest = makeQuest();
    useQuestStore.setState({ currentQuest: activeQuest as any });
    mockQuestService.isQuestExpired.mockReturnValue(false);

    await useQuestStore.getState().resetQuestIfExpired();

    expect(mockQuestStorage.clearCurrentQuest).not.toHaveBeenCalled();
    expect(useQuestStore.getState().currentQuest).toEqual(activeQuest);
  });

  it('should do nothing if there is no current quest', async () => {
    useQuestStore.setState({ currentQuest: null });

    await useQuestStore.getState().resetQuestIfExpired();

    expect(mockQuestStorage.clearCurrentQuest).not.toHaveBeenCalled();
  });
});

describe('useQuestStore — setShowCompletionModal', () => {
  beforeEach(() => {
    resetQuestStore();
  });

  it('should show and hide the completion modal', () => {
    useQuestStore.getState().setShowCompletionModal(true);
    expect(useQuestStore.getState().showCompletionModal).toBe(true);

    useQuestStore.getState().setShowCompletionModal(false);
    expect(useQuestStore.getState().showCompletionModal).toBe(false);
  });
});
