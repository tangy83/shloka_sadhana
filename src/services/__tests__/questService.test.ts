/**
 * Quest Service Unit Tests
 * Shloka Sadhana - Phase 2A Week 13-14
 *
 * Tests for quest generation, progress tracking, and XP calculation
 */

import { questService } from '../questService';
import { QuestType, QuestStatus } from '@/types/quests';
import type { UserData } from '@/types';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock Firestore
jest.mock('@react-native-firebase/firestore', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        set: jest.fn(),
        get: jest.fn(),
        update: jest.fn(),
      })),
    })),
  })),
}));

// Mock auth
jest.mock('@react-native-firebase/auth', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    currentUser: { uid: 'test-user-123' },
  })),
}));

describe('questService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateDailyQuest', () => {
    it('should generate beginner quest for new users (<7 practices)', () => {
      const userData: Partial<UserData> = {
        experienceLevel: 'beginner',
        totalPractices: 3,
        preferences: {
          experienceLevel: 'beginner',
          dailyTime: '5-10',
          preferredDeity: undefined,
        },
      };

      const quest = questService.generateDailyQuest(userData as UserData);

      expect(quest.type).toBe(QuestType.PRACTICE_ONCE);
      expect(quest.target).toBe(1);
      expect(quest.xpReward).toBe(10);
      expect(quest.status).toBe(QuestStatus.ACTIVE);
    });

    it('should generate intermediate quest for users with 7-30 practices', () => {
      const userData: Partial<UserData> = {
        experienceLevel: 'intermediate',
        totalPractices: 15,
        preferences: {
          experienceLevel: 'intermediate',
          dailyTime: '10-20',
          preferredDeity: undefined,
        },
      };

      const quest = questService.generateDailyQuest(userData as UserData);

      expect(quest.type).toBe(QuestType.PRACTICE_DURATION);
      expect(quest.target).toBe(600); // 10 minutes in seconds
      expect(quest.xpReward).toBe(20);
      expect(quest.status).toBe(QuestStatus.ACTIVE);
    });

    it('should generate advanced quest for experienced users (30+ practices)', () => {
      const userData: Partial<UserData> = {
        experienceLevel: 'advanced',
        totalPractices: 45,
        preferences: {
          experienceLevel: 'advanced',
          dailyTime: '20+',
          preferredDeity: 'Shiva',
        },
      };

      const quest = questService.generateDailyQuest(userData as UserData);

      expect(quest.type).toBe(QuestType.COMPLETE_SESSIONS);
      expect(quest.target).toBe(2);
      expect(quest.xpReward).toBe(30);
      expect(quest.status).toBe(QuestStatus.ACTIVE);
    });

    it('should generate mala-based quest for very experienced users', () => {
      const userData: Partial<UserData> = {
        experienceLevel: 'advanced',
        totalPractices: 100,
        preferences: {
          experienceLevel: 'advanced',
          dailyTime: '20+',
          preferredDeity: 'Vishnu',
        },
      };

      const quest = questService.generateDailyQuest(userData as UserData);

      // Should sometimes generate mala quests for experienced users
      if (quest.type === QuestType.COMPLETE_MALAS) {
        expect(quest.target).toBeGreaterThanOrEqual(1);
        expect(quest.xpReward).toBeGreaterThanOrEqual(25);
      }
    });

    it('should generate unique quest ID', () => {
      const userData: Partial<UserData> = {
        experienceLevel: 'beginner',
        totalPractices: 1,
        preferences: {
          experienceLevel: 'beginner',
          dailyTime: '5-10',
          preferredDeity: undefined,
        },
      };

      const quest1 = questService.generateDailyQuest(userData as UserData);
      const quest2 = questService.generateDailyQuest(userData as UserData);

      expect(quest1.id).not.toBe(quest2.id);
    });
  });

  describe('updateQuestProgress', () => {
    it('should update progress for PRACTICE_ONCE quest', () => {
      const quest = questService.generateDailyQuest({
        experienceLevel: 'beginner',
        totalPractices: 1,
      } as UserData);

      const result = questService.updateQuestProgress(quest, {
        practiceCompleted: true,
        duration: 120,
        malaCount: 0,
        hasSankalp: false,
      });

      expect(result.updatedQuest.progress).toBe(1);
      expect(result.completed).toBe(true);
      expect(result.xpEarned).toBe(quest.xpReward);
    });

    it('should update progress for PRACTICE_DURATION quest', () => {
      const quest = {
        id: 'test-quest',
        type: QuestType.PRACTICE_DURATION,
        target: 600, // 10 minutes
        progress: 300, // Already 5 minutes
        xpReward: 20,
        status: QuestStatus.ACTIVE,
        startedAt: new Date().toISOString(),
      };

      const result = questService.updateQuestProgress(quest, {
        practiceCompleted: true,
        duration: 400, // 6 minutes 40 seconds
        malaCount: 0,
        hasSankalp: false,
      });

      expect(result.updatedQuest.progress).toBe(700); // 300 + 400
      expect(result.completed).toBe(true); // Exceeds 600 target
      expect(result.xpEarned).toBe(20);
    });

    it('should NOT complete quest if target not reached', () => {
      const quest = {
        id: 'test-quest',
        type: QuestType.PRACTICE_DURATION,
        target: 600,
        progress: 200,
        xpReward: 20,
        status: QuestStatus.ACTIVE,
        startedAt: new Date().toISOString(),
      };

      const result = questService.updateQuestProgress(quest, {
        practiceCompleted: true,
        duration: 300, // Total = 500, still under 600
        malaCount: 0,
        hasSankalp: false,
      });

      expect(result.updatedQuest.progress).toBe(500);
      expect(result.completed).toBe(false);
      expect(result.xpEarned).toBe(0);
    });

    it('should update progress for COMPLETE_SESSIONS quest', () => {
      const quest = {
        id: 'test-quest',
        type: QuestType.COMPLETE_SESSIONS,
        target: 2,
        progress: 1,
        xpReward: 30,
        status: QuestStatus.ACTIVE,
        startedAt: new Date().toISOString(),
      };

      const result = questService.updateQuestProgress(quest, {
        practiceCompleted: true,
        duration: 300,
        malaCount: 0,
        hasSankalp: false,
      });

      expect(result.updatedQuest.progress).toBe(2);
      expect(result.completed).toBe(true);
      expect(result.xpEarned).toBe(30);
    });

    it('should update progress for COMPLETE_MALAS quest', () => {
      const quest = {
        id: 'test-quest',
        type: QuestType.COMPLETE_MALAS,
        target: 3,
        progress: 1,
        xpReward: 40,
        status: QuestStatus.ACTIVE,
        startedAt: new Date().toISOString(),
      };

      const result = questService.updateQuestProgress(quest, {
        practiceCompleted: true,
        duration: 600,
        malaCount: 2,
        hasSankalp: false,
      });

      expect(result.updatedQuest.progress).toBe(3); // 1 + 2
      expect(result.completed).toBe(true);
      expect(result.xpEarned).toBe(40);
    });

    it('should award bonus XP for WITH_SANKALP quest', () => {
      const quest = {
        id: 'test-quest',
        type: QuestType.WITH_SANKALP,
        target: 1,
        progress: 0,
        xpReward: 50,
        status: QuestStatus.ACTIVE,
        startedAt: new Date().toISOString(),
      };

      const result = questService.updateQuestProgress(quest, {
        practiceCompleted: true,
        duration: 300,
        malaCount: 0,
        hasSankalp: true,
      });

      expect(result.updatedQuest.progress).toBe(1);
      expect(result.completed).toBe(true);
      expect(result.xpEarned).toBe(50);
    });

    it('should NOT update WITH_SANKALP quest if no sankalp set', () => {
      const quest = {
        id: 'test-quest',
        type: QuestType.WITH_SANKALP,
        target: 1,
        progress: 0,
        xpReward: 50,
        status: QuestStatus.ACTIVE,
        startedAt: new Date().toISOString(),
      };

      const result = questService.updateQuestProgress(quest, {
        practiceCompleted: true,
        duration: 300,
        malaCount: 0,
        hasSankalp: false, // No sankalp
      });

      expect(result.updatedQuest.progress).toBe(0);
      expect(result.completed).toBe(false);
      expect(result.xpEarned).toBe(0);
    });
  });

  describe('calculateQuestStreak', () => {
    it('should calculate quest streak correctly for consecutive days', () => {
      const completedDates = [
        '2026-02-07T10:00:00.000Z',
        '2026-02-08T10:00:00.000Z',
        '2026-02-09T10:00:00.000Z',
        '2026-02-10T10:00:00.000Z', // Today
      ];

      const streak = questService.calculateQuestStreak(completedDates);

      expect(streak).toBe(4);
    });

    it('should reset streak if quest missed a day', () => {
      const completedDates = [
        '2026-02-05T10:00:00.000Z',
        '2026-02-06T10:00:00.000Z',
        // Missed 2026-02-07
        '2026-02-08T10:00:00.000Z',
        '2026-02-09T10:00:00.000Z',
        '2026-02-10T10:00:00.000Z', // Today
      ];

      const streak = questService.calculateQuestStreak(completedDates);

      expect(streak).toBe(3); // Only counts from 02-08 onwards
    });

    it('should return 0 for empty completed dates', () => {
      const streak = questService.calculateQuestStreak([]);

      expect(streak).toBe(0);
    });

    it('should return 1 for single quest completion today', () => {
      const today = new Date().toISOString();
      const streak = questService.calculateQuestStreak([today]);

      expect(streak).toBe(1);
    });
  });

  describe('getTotalXP', () => {
    it('should sum all XP from completed quests', () => {
      const completedQuests = [
        { id: '1', xpReward: 10, status: QuestStatus.COMPLETED },
        { id: '2', xpReward: 20, status: QuestStatus.COMPLETED },
        { id: '3', xpReward: 30, status: QuestStatus.COMPLETED },
      ];

      const totalXP = questService.getTotalXP(completedQuests as any[]);

      expect(totalXP).toBe(60);
    });

    it('should return 0 for empty quest history', () => {
      const totalXP = questService.getTotalXP([]);

      expect(totalXP).toBe(0);
    });

    it('should only count COMPLETED quests', () => {
      const quests = [
        { id: '1', xpReward: 10, status: QuestStatus.COMPLETED },
        { id: '2', xpReward: 20, status: QuestStatus.ACTIVE }, // Not completed
        { id: '3', xpReward: 30, status: QuestStatus.COMPLETED },
      ];

      const totalXP = questService.getTotalXP(quests as any[]);

      expect(totalXP).toBe(40); // Only 10 + 30
    });
  });
});
