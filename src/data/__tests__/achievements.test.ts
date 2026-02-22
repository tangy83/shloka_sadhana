/**
 * Achievement Data Tests
 * Shloka Sadhana — Achievement definitions
 */

import { ACHIEVEMENTS, Achievement } from '../achievements';

describe('ACHIEVEMENTS', () => {
  it('should contain exactly 8 achievements', () => {
    expect(ACHIEVEMENTS).toHaveLength(8);
  });

  it('should have unique ids across all achievements', () => {
    const ids = ACHIEVEMENTS.map((a) => a.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ACHIEVEMENTS.length);
  });

  it('should have non-empty title on every achievement', () => {
    ACHIEVEMENTS.forEach((a) => {
      expect(a.title).toBeTruthy();
      expect(typeof a.title).toBe('string');
    });
  });

  it('should have non-empty description on every achievement', () => {
    ACHIEVEMENTS.forEach((a) => {
      expect(a.description).toBeTruthy();
      expect(typeof a.description).toBe('string');
    });
  });

  it('should have non-empty icon on every achievement', () => {
    ACHIEVEMENTS.forEach((a) => {
      expect(a.icon).toBeTruthy();
      expect(typeof a.icon).toBe('string');
    });
  });

  it('should have valid unlockCondition type on every achievement', () => {
    const validTypes: Achievement['unlockCondition']['type'][] = ['practices', 'streak', 'malas'];
    ACHIEVEMENTS.forEach((a) => {
      expect(validTypes).toContain(a.unlockCondition.type);
    });
  });

  it('should have positive unlockCondition.value on every achievement', () => {
    ACHIEVEMENTS.forEach((a) => {
      expect(a.unlockCondition.value).toBeGreaterThan(0);
    });
  });

  it('should have positive xpReward on every achievement', () => {
    ACHIEVEMENTS.forEach((a) => {
      expect(a.xpReward).toBeGreaterThan(0);
    });
  });

  it('should include a "first_practice" achievement', () => {
    const firstPractice = ACHIEVEMENTS.find((a) => a.id === 'first_practice');
    expect(firstPractice).toBeDefined();
  });

  it('"first_practice" should have the lowest practices threshold (1)', () => {
    const firstPractice = ACHIEVEMENTS.find((a) => a.id === 'first_practice');
    expect(firstPractice?.unlockCondition.type).toBe('practices');
    expect(firstPractice?.unlockCondition.value).toBe(1);
  });

  it('should include "streak" type achievements', () => {
    const streakAchievements = ACHIEVEMENTS.filter((a) => a.unlockCondition.type === 'streak');
    expect(streakAchievements.length).toBeGreaterThan(0);
  });

  it('should include "malas" type achievements', () => {
    const malasAchievements = ACHIEVEMENTS.filter((a) => a.unlockCondition.type === 'malas');
    expect(malasAchievements.length).toBeGreaterThan(0);
  });

  it('should include "practices" type achievements', () => {
    const practicesAchievements = ACHIEVEMENTS.filter((a) => a.unlockCondition.type === 'practices');
    expect(practicesAchievements.length).toBeGreaterThan(0);
  });

  it('should have xpReward that generally increases with difficulty', () => {
    // Verify at least that "first_practice" (easy) has lower XP than a high-threshold achievement
    const firstPractice = ACHIEVEMENTS.find((a) => a.id === 'first_practice')!;
    const streak100 = ACHIEVEMENTS.find((a) => a.id === 'streak_100')!;
    expect(firstPractice.xpReward).toBeLessThan(streak100.xpReward);
  });
});
