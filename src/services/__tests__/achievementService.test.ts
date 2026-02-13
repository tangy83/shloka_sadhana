/**
 * Achievement Service Unit Tests
 * Shloka Sadhana - Phase 2A Week 13-14
 *
 * Tests for achievement checking, unlocking, and progress tracking
 */

import { achievementService } from '../achievementService';
import { AchievementCategory } from '@/types/achievements';
import type { UserData, CompletedPractice } from '@/types';

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

describe('achievementService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkStreakAchievements', () => {
    it('should unlock 7-day streak achievement', () => {
      const userData: Partial<UserData> = {
        currentStreak: 7,
        unlockedAchievements: [],
      };

      const newAchievements = achievementService.checkStreakAchievements(
        userData as UserData
      );

      expect(newAchievements).toHaveLength(1);
      expect(newAchievements[0].id).toBe('streak_7');
      expect(newAchievements[0].category).toBe(AchievementCategory.STREAK);
      expect(newAchievements[0].xpReward).toBe(50);
    });

    it('should unlock 30-day streak achievement', () => {
      const userData: Partial<UserData> = {
        currentStreak: 30,
        unlockedAchievements: ['streak_7'],
      };

      const newAchievements = achievementService.checkStreakAchievements(
        userData as UserData
      );

      expect(newAchievements).toHaveLength(1);
      expect(newAchievements[0].id).toBe('streak_30');
      expect(newAchievements[0].xpReward).toBe(100);
    });

    it('should unlock 100-day streak achievement', () => {
      const userData: Partial<UserData> = {
        currentStreak: 100,
        unlockedAchievements: ['streak_7', 'streak_30'],
      };

      const newAchievements = achievementService.checkStreakAchievements(
        userData as UserData
      );

      expect(newAchievements).toHaveLength(1);
      expect(newAchievements[0].id).toBe('streak_100');
      expect(newAchievements[0].xpReward).toBe(300);
    });

    it('should unlock 365-day streak achievement (year)', () => {
      const userData: Partial<UserData> = {
        currentStreak: 365,
        unlockedAchievements: ['streak_7', 'streak_30', 'streak_100'],
      };

      const newAchievements = achievementService.checkStreakAchievements(
        userData as UserData
      );

      expect(newAchievements).toHaveLength(1);
      expect(newAchievements[0].id).toBe('streak_365');
      expect(newAchievements[0].name).toContain('Year');
    });

    it('should NOT unlock already unlocked achievements', () => {
      const userData: Partial<UserData> = {
        currentStreak: 30,
        unlockedAchievements: ['streak_7', 'streak_30'], // Already unlocked
      };

      const newAchievements = achievementService.checkStreakAchievements(
        userData as UserData
      );

      expect(newAchievements).toHaveLength(0);
    });
  });

  describe('checkPracticeAchievements', () => {
    it('should unlock 10 practices achievement', () => {
      const userData: Partial<UserData> = {
        totalPractices: 10,
        unlockedAchievements: [],
      };

      const newAchievements = achievementService.checkPracticeAchievements(
        userData as UserData
      );

      expect(newAchievements).toHaveLength(1);
      expect(newAchievements[0].id).toBe('practice_10');
      expect(newAchievements[0].category).toBe(AchievementCategory.PRACTICE);
    });

    it('should unlock 50 practices achievement', () => {
      const userData: Partial<UserData> = {
        totalPractices: 50,
        unlockedAchievements: ['practice_10'],
      };

      const newAchievements = achievementService.checkPracticeAchievements(
        userData as UserData
      );

      expect(newAchievements).toHaveLength(1);
      expect(newAchievements[0].id).toBe('practice_50');
    });

    it('should unlock 100 practices achievement', () => {
      const userData: Partial<UserData> = {
        totalPractices: 100,
        unlockedAchievements: ['practice_10', 'practice_50'],
      };

      const newAchievements = achievementService.checkPracticeAchievements(
        userData as UserData
      );

      expect(newAchievements).toHaveLength(1);
      expect(newAchievements[0].id).toBe('practice_100');
    });

    it('should unlock 500 practices achievement', () => {
      const userData: Partial<UserData> = {
        totalPractices: 500,
        unlockedAchievements: ['practice_10', 'practice_50', 'practice_100'],
      };

      const newAchievements = achievementService.checkPracticeAchievements(
        userData as UserData
      );

      expect(newAchievements).toHaveLength(1);
      expect(newAchievements[0].id).toBe('practice_500');
      expect(newAchievements[0].xpReward).toBeGreaterThanOrEqual(200);
    });
  });

  describe('checkMalaAchievements', () => {
    it('should unlock first mala achievement', () => {
      const totalMalas = 1;
      const unlockedAchievements: string[] = [];

      const newAchievements = achievementService.checkMalaAchievements(
        totalMalas,
        unlockedAchievements
      );

      expect(newAchievements).toHaveLength(1);
      expect(newAchievements[0].id).toBe('mala_1');
      expect(newAchievements[0].category).toBe(AchievementCategory.MALA);
    });

    it('should unlock 10 malas achievement', () => {
      const totalMalas = 10;
      const unlockedAchievements = ['mala_1'];

      const newAchievements = achievementService.checkMalaAchievements(
        totalMalas,
        unlockedAchievements
      );

      expect(newAchievements).toHaveLength(1);
      expect(newAchievements[0].id).toBe('mala_10');
    });

    it('should unlock 50 malas achievement', () => {
      const totalMalas = 50;
      const unlockedAchievements = ['mala_1', 'mala_10'];

      const newAchievements = achievementService.checkMalaAchievements(
        totalMalas,
        unlockedAchievements
      );

      expect(newAchievements).toHaveLength(1);
      expect(newAchievements[0].id).toBe('mala_50');
    });

    it('should unlock 108 malas achievement (sacred number)', () => {
      const totalMalas = 108;
      const unlockedAchievements = ['mala_1', 'mala_10', 'mala_50'];

      const newAchievements = achievementService.checkMalaAchievements(
        totalMalas,
        unlockedAchievements
      );

      expect(newAchievements).toHaveLength(1);
      expect(newAchievements[0].id).toBe('mala_108');
      expect(newAchievements[0].name).toContain('108');
    });
  });

  describe('getAchievementProgress', () => {
    it('should calculate progress for streak achievements', () => {
      const achievementId = 'streak_30';
      const userData: Partial<UserData> = {
        currentStreak: 15,
      };

      const progress = achievementService.getAchievementProgress(
        achievementId,
        userData as UserData
      );

      expect(progress).toEqual({
        current: 15,
        target: 30,
        percentage: 50,
      });
    });

    it('should calculate progress for practice achievements', () => {
      const achievementId = 'practice_100';
      const userData: Partial<UserData> = {
        totalPractices: 75,
      };

      const progress = achievementService.getAchievementProgress(
        achievementId,
        userData as UserData
      );

      expect(progress).toEqual({
        current: 75,
        target: 100,
        percentage: 75,
      });
    });

    it('should return 100% for completed achievements', () => {
      const achievementId = 'practice_50';
      const userData: Partial<UserData> = {
        totalPractices: 60,
      };

      const progress = achievementService.getAchievementProgress(
        achievementId,
        userData as UserData
      );

      expect(progress.percentage).toBe(100);
    });

    it('should calculate progress for quest achievements', () => {
      const achievementId = 'quest_30';
      const completedQuests = 20;

      const progress = achievementService.getAchievementProgress(
        achievementId,
        { completedQuests } as any
      );

      expect(progress).toEqual({
        current: 20,
        target: 30,
        percentage: Math.floor((20 / 30) * 100),
      });
    });
  });

  describe('getNearCompleteAchievements', () => {
    it('should return achievements that are ≤3 away from completion', () => {
      const userData: Partial<UserData> = {
        currentStreak: 27, // 3 away from streak_30
        totalPractices: 98, // 2 away from practice_100
        unlockedAchievements: ['streak_7'],
      };

      const nearComplete = achievementService.getNearCompleteAchievements(
        userData as UserData,
        3
      );

      expect(nearComplete.length).toBeGreaterThan(0);

      const streakAchievement = nearComplete.find((a) => a.id === 'streak_30');
      expect(streakAchievement).toBeDefined();
      expect(streakAchievement?.remaining).toBe(3);

      const practiceAchievement = nearComplete.find((a) => a.id === 'practice_100');
      expect(practiceAchievement).toBeDefined();
      expect(practiceAchievement?.remaining).toBe(2);
    });

    it('should NOT return already unlocked achievements', () => {
      const userData: Partial<UserData> = {
        currentStreak: 30,
        unlockedAchievements: ['streak_7', 'streak_30'], // streak_30 already unlocked
      };

      const nearComplete = achievementService.getNearCompleteAchievements(
        userData as UserData,
        3
      );

      const streak30 = nearComplete.find((a) => a.id === 'streak_30');
      expect(streak30).toBeUndefined();
    });

    it('should NOT return achievements that are >threshold away', () => {
      const userData: Partial<UserData> = {
        currentStreak: 20, // 10 away from streak_30
        unlockedAchievements: ['streak_7'],
      };

      const nearComplete = achievementService.getNearCompleteAchievements(
        userData as UserData,
        3
      );

      const streak30 = nearComplete.find((a) => a.id === 'streak_30');
      expect(streak30).toBeUndefined(); // 10 > 3 threshold
    });
  });
});
