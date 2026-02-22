/**
 * Quest Data Tests
 * Shloka Sadhana — Quest definitions & getTodayQuest()
 */

import { QUESTS, getTodayQuest, Quest } from '../quests';

describe('QUESTS', () => {
  it('should contain exactly 5 quests', () => {
    expect(QUESTS).toHaveLength(5);
  });

  it('should have unique ids across all quests', () => {
    const ids = QUESTS.map((q) => q.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(QUESTS.length);
  });

  it('should have valid type on every quest', () => {
    const validTypes: Quest['type'][] = ['practices', 'malas', 'streak_days'];
    QUESTS.forEach((q) => {
      expect(validTypes).toContain(q.type);
    });
  });

  it('should have positive target on every quest', () => {
    QUESTS.forEach((q) => {
      expect(q.target).toBeGreaterThan(0);
    });
  });

  it('should have positive xpReward on every quest', () => {
    QUESTS.forEach((q) => {
      expect(q.xpReward).toBeGreaterThan(0);
    });
  });

  it('should have non-empty title on every quest', () => {
    QUESTS.forEach((q) => {
      expect(q.title).toBeTruthy();
      expect(typeof q.title).toBe('string');
    });
  });

  it('should have non-empty description on every quest', () => {
    QUESTS.forEach((q) => {
      expect(q.description).toBeTruthy();
      expect(typeof q.description).toBe('string');
    });
  });

  it('should include a "practices" type quest', () => {
    const practiceQuests = QUESTS.filter((q) => q.type === 'practices');
    expect(practiceQuests.length).toBeGreaterThan(0);
  });

  it('should include a "malas" type quest', () => {
    const malaQuests = QUESTS.filter((q) => q.type === 'malas');
    expect(malaQuests.length).toBeGreaterThan(0);
  });

  it('should include a "streak_days" type quest', () => {
    const streakQuests = QUESTS.filter((q) => q.type === 'streak_days');
    expect(streakQuests.length).toBeGreaterThan(0);
  });
});

describe('getTodayQuest', () => {
  it('should return a valid quest', () => {
    const quest = getTodayQuest();
    expect(quest).toBeDefined();
    expect(quest.id).toBeTruthy();
    expect(quest.title).toBeTruthy();
    expect(quest.target).toBeGreaterThan(0);
    expect(quest.xpReward).toBeGreaterThan(0);
  });

  it('should return a quest from the QUESTS array', () => {
    const quest = getTodayQuest();
    const questIds = QUESTS.map((q) => q.id);
    expect(questIds).toContain(quest.id);
  });

  it('should be deterministic when called multiple times on the same day', () => {
    const quest1 = getTodayQuest();
    const quest2 = getTodayQuest();
    expect(quest1.id).toBe(quest2.id);
  });

  it('should return different quests for different days', () => {
    // By inspecting the rotation logic: dayOfYear % QUESTS.length
    // Different days will map to different indices (unless periodicity wraps)
    // Test that the function at least returns all unique quest ids over N consecutive days
    const originalDateNow = Date.now;
    const ids = new Set<string>();

    // Simulate 5 consecutive days
    for (let d = 0; d < QUESTS.length; d++) {
      // Offset each call by one day (86400000 ms)
      const dayOffset = d * 86_400_000;
      Date.now = () => originalDateNow() + dayOffset;
      ids.add(getTodayQuest().id);
    }

    Date.now = originalDateNow;

    // All 5 quests should have appeared over 5 days
    expect(ids.size).toBe(QUESTS.length);
  });
});
