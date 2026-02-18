/**
 * FeedService Tests
 * Shloka Sadhana - Phase 2A: Engagement Core
 *
 * Tests for feed generation, section scoring, and context building
 */

import { feedService, FeedService } from '@/services/feedService';
import {
  FeedContext,
  FeedConfig,
  DEFAULT_FEED_CONFIG,
  FEED_BASE_SCORES,
} from '@/types/feed';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Build a minimal valid FeedContext with sensible defaults */
function makeContext(overrides: Partial<FeedContext> = {}): FeedContext {
  return {
    userId: 'user-123',
    currentStreak: 0,
    totalPractices: 0,
    lastPracticedDate: null,
    recentlyPracticed: [],
    hasActiveQuest: false,
    completedQuestToday: false,
    nearCompleteAchievements: 0,
    currentHour: 10, // 10 AM — standard morning, no special boost
    ...overrides,
  };
}

/** Returns a timestamp string N minutes in the past */
function minutesAgo(n: number): string {
  return new Date(Date.now() - n * 60 * 1000).toISOString();
}

/** Returns a timestamp string N hours in the past */
function hoursAgo(n: number): string {
  return new Date(Date.now() - n * 60 * 60 * 1000).toISOString();
}

// ─── generatePersonalizedFeed ─────────────────────────────────────────────────

describe('feedService.generatePersonalizedFeed — always-included sections', () => {
  it('always includes verse_of_day, hindu_calendar, and daily_wisdom', () => {
    const feed = feedService.generatePersonalizedFeed(makeContext());
    const types = feed.map((s) => s.type);
    expect(types).toContain('verse_of_day');
    expect(types).toContain('hindu_calendar');
    expect(types).toContain('daily_wisdom');
  });

  it('always includes resume_practice', () => {
    const feed = feedService.generatePersonalizedFeed(makeContext());
    const types = feed.map((s) => s.type);
    expect(types).toContain('resume_practice');
  });

  it('always includes recommended_shloka', () => {
    const feed = feedService.generatePersonalizedFeed(makeContext());
    const types = feed.map((s) => s.type);
    expect(types).toContain('recommended_shloka');
  });

  it('returns an array of FeedSection objects with required fields', () => {
    const feed = feedService.generatePersonalizedFeed(makeContext());
    expect(feed.length).toBeGreaterThan(0);
    feed.forEach((section) => {
      expect(section).toHaveProperty('id');
      expect(section).toHaveProperty('type');
      expect(section).toHaveProperty('score');
      expect(section).toHaveProperty('timestamp');
      expect(typeof section.id).toBe('string');
      expect(typeof section.score).toBe('number');
    });
  });

  it('returns sections sorted by score descending', () => {
    const feed = feedService.generatePersonalizedFeed(makeContext());
    for (let i = 1; i < feed.length; i++) {
      expect(feed[i - 1].score).toBeGreaterThanOrEqual(feed[i].score);
    }
  });
});

describe('feedService.generatePersonalizedFeed — conditional sections', () => {
  it('includes daily_quest when hasActiveQuest=true', () => {
    const feed = feedService.generatePersonalizedFeed(makeContext({ hasActiveQuest: true }));
    expect(feed.map((s) => s.type)).toContain('daily_quest');
  });

  it('excludes daily_quest when hasActiveQuest=false', () => {
    const feed = feedService.generatePersonalizedFeed(makeContext({ hasActiveQuest: false }));
    expect(feed.map((s) => s.type)).not.toContain('daily_quest');
  });

  it('includes streak_recovery when streak=0 and lastPracticedDate is within 24h', () => {
    const context = makeContext({
      currentStreak: 0,
      lastPracticedDate: hoursAgo(2),
    });
    const feed = feedService.generatePersonalizedFeed(context);
    expect(feed.map((s) => s.type)).toContain('streak_recovery');
  });

  it('excludes streak_recovery when lastPracticedDate is more than 24h ago', () => {
    const context = makeContext({
      currentStreak: 0,
      lastPracticedDate: hoursAgo(25),
    });
    const feed = feedService.generatePersonalizedFeed(context);
    expect(feed.map((s) => s.type)).not.toContain('streak_recovery');
  });

  it('excludes streak_recovery when streak > 0 (streak not broken)', () => {
    const context = makeContext({
      currentStreak: 5,
      lastPracticedDate: hoursAgo(1),
    });
    const feed = feedService.generatePersonalizedFeed(context);
    expect(feed.map((s) => s.type)).not.toContain('streak_recovery');
  });

  it('excludes streak_recovery when lastPracticedDate is null', () => {
    const context = makeContext({
      currentStreak: 0,
      lastPracticedDate: null,
    });
    const feed = feedService.generatePersonalizedFeed(context);
    expect(feed.map((s) => s.type)).not.toContain('streak_recovery');
  });

  it('includes achievement_progress when nearCompleteAchievements > 0', () => {
    const feed = feedService.generatePersonalizedFeed(
      makeContext({ nearCompleteAchievements: 1 })
    );
    expect(feed.map((s) => s.type)).toContain('achievement_progress');
  });

  it('excludes achievement_progress when nearCompleteAchievements = 0', () => {
    const feed = feedService.generatePersonalizedFeed(
      makeContext({ nearCompleteAchievements: 0 })
    );
    expect(feed.map((s) => s.type)).not.toContain('achievement_progress');
  });

  it('includes recently_practiced when recentlyPracticed array is non-empty', () => {
    const feed = feedService.generatePersonalizedFeed(
      makeContext({ recentlyPracticed: ['shloka-1', 'shloka-2'] })
    );
    expect(feed.map((s) => s.type)).toContain('recently_practiced');
  });

  it('excludes recently_practiced when recentlyPracticed array is empty', () => {
    const feed = feedService.generatePersonalizedFeed(
      makeContext({ recentlyPracticed: [] })
    );
    expect(feed.map((s) => s.type)).not.toContain('recently_practiced');
  });

  it('includes friend_activity when hasFriends=true and newFriendActivity=true', () => {
    const feed = feedService.generatePersonalizedFeed(
      makeContext({ hasFriends: true, newFriendActivity: true })
    );
    expect(feed.map((s) => s.type)).toContain('friend_activity');
  });

  it('excludes friend_activity when hasFriends=false', () => {
    const feed = feedService.generatePersonalizedFeed(
      makeContext({ hasFriends: false, newFriendActivity: true })
    );
    expect(feed.map((s) => s.type)).not.toContain('friend_activity');
  });

  it('excludes friend_activity when newFriendActivity=false', () => {
    const feed = feedService.generatePersonalizedFeed(
      makeContext({ hasFriends: true, newFriendActivity: false })
    );
    expect(feed.map((s) => s.type)).not.toContain('friend_activity');
  });

  it('includes group_challenge when hasGroups=true and activeGroupChallenge=true', () => {
    const feed = feedService.generatePersonalizedFeed(
      makeContext({ hasGroups: true, activeGroupChallenge: true })
    );
    expect(feed.map((s) => s.type)).toContain('group_challenge');
  });

  it('excludes group_challenge when hasGroups=false', () => {
    const feed = feedService.generatePersonalizedFeed(
      makeContext({ hasGroups: false, activeGroupChallenge: true })
    );
    expect(feed.map((s) => s.type)).not.toContain('group_challenge');
  });
});

describe('feedService.generatePersonalizedFeed — config limits', () => {
  it('respects maxSections config', () => {
    const context = makeContext({
      hasActiveQuest: true,
      nearCompleteAchievements: 3,
      recentlyPracticed: ['s1'],
      hasFriends: true,
      newFriendActivity: true,
      hasGroups: true,
      activeGroupChallenge: true,
    });
    const config: FeedConfig = { ...DEFAULT_FEED_CONFIG, maxSections: 3 };
    const feed = feedService.generatePersonalizedFeed(context, config);
    expect(feed.length).toBeLessThanOrEqual(3);
  });

  it('excludes sections below minScore threshold', () => {
    // daily_wisdom has base score 35; set minScore to 40 to exclude it
    const config: FeedConfig = { ...DEFAULT_FEED_CONFIG, minScore: 40 };
    const feed = feedService.generatePersonalizedFeed(makeContext(), config);
    feed.forEach((section) => {
      expect(section.score).toBeGreaterThanOrEqual(40);
    });
  });

  it('uses DEFAULT_FEED_CONFIG when no config is provided', () => {
    const feed = feedService.generatePersonalizedFeed(makeContext());
    expect(feed.length).toBeLessThanOrEqual(DEFAULT_FEED_CONFIG.maxSections);
  });
});

// ─── Score boosts ──────────────────────────────────────────────────────────────

describe('feedService.generatePersonalizedFeed — score boosts', () => {
  it('daily_quest gets boost when quest not completed today', () => {
    const withBoost = feedService.generatePersonalizedFeed(
      makeContext({ hasActiveQuest: true, completedQuestToday: false })
    );
    const withoutBoost = feedService.generatePersonalizedFeed(
      makeContext({ hasActiveQuest: true, completedQuestToday: true })
    );

    const questWithBoost = withBoost.find((s) => s.type === 'daily_quest');
    const questWithoutBoost = withoutBoost.find((s) => s.type === 'daily_quest');

    expect(questWithBoost!.score).toBeGreaterThan(questWithoutBoost!.score);
  });

  it('daily_quest gets near-completion boost when questProgress >= 0.7', () => {
    const nearComplete = feedService.generatePersonalizedFeed(
      makeContext({ hasActiveQuest: true, completedQuestToday: true, questProgress: 0.8 })
    );
    const notNearComplete = feedService.generatePersonalizedFeed(
      makeContext({ hasActiveQuest: true, completedQuestToday: true, questProgress: 0.3 })
    );

    const questNear = nearComplete.find((s) => s.type === 'daily_quest');
    const questFar = notNearComplete.find((s) => s.type === 'daily_quest');

    expect(questNear!.score).toBeGreaterThan(questFar!.score);
  });

  it('recommended_shloka gets Brahma Muhurta boost between 4-6 AM', () => {
    const brahmaMuhurta = feedService.generatePersonalizedFeed(makeContext({ currentHour: 5 }));
    const midday = feedService.generatePersonalizedFeed(makeContext({ currentHour: 14 }));

    const shlokaBrahma = brahmaMuhurta.find((s) => s.type === 'recommended_shloka');
    const shlokaMidday = midday.find((s) => s.type === 'recommended_shloka');

    expect(shlokaBrahma!.score).toBeGreaterThan(shlokaMidday!.score);
  });

  it('recommended_shloka gets morning boost between 6-12', () => {
    const morning = feedService.generatePersonalizedFeed(makeContext({ currentHour: 8 }));
    const afternoon = feedService.generatePersonalizedFeed(makeContext({ currentHour: 14 }));

    const shlokaMorning = morning.find((s) => s.type === 'recommended_shloka');
    const shlokaAfternoon = afternoon.find((s) => s.type === 'recommended_shloka');

    expect(shlokaMorning!.score).toBeGreaterThan(shlokaAfternoon!.score);
  });

  it('recommended_shloka gets evening boost between 17-19', () => {
    const evening = feedService.generatePersonalizedFeed(makeContext({ currentHour: 18 }));
    const afternoon = feedService.generatePersonalizedFeed(makeContext({ currentHour: 14 }));

    const shlokaEvening = evening.find((s) => s.type === 'recommended_shloka');
    const shlokaAfternoon = afternoon.find((s) => s.type === 'recommended_shloka');

    expect(shlokaEvening!.score).toBeGreaterThan(shlokaAfternoon!.score);
  });

  it('recommended_shloka gets deity match boost when preferredDeity is set', () => {
    const withDeity = feedService.generatePersonalizedFeed(
      makeContext({ preferredDeity: 'Vishnu', currentHour: 14 })
    );
    const withoutDeity = feedService.generatePersonalizedFeed(
      makeContext({ currentHour: 14 })
    );

    const withDeitySection = withDeity.find((s) => s.type === 'recommended_shloka');
    const withoutDeitySection = withoutDeity.find((s) => s.type === 'recommended_shloka');

    expect(withDeitySection!.score).toBeGreaterThan(withoutDeitySection!.score);
  });

  it('recommended_shloka gets Ekadashi boost when isEkadashi=true', () => {
    const ekadashi = feedService.generatePersonalizedFeed(
      makeContext({ isEkadashi: true, currentHour: 14 })
    );
    const normal = feedService.generatePersonalizedFeed(
      makeContext({ isEkadashi: false, currentHour: 14 })
    );

    const ekadashiSection = ekadashi.find((s) => s.type === 'recommended_shloka');
    const normalSection = normal.find((s) => s.type === 'recommended_shloka');

    expect(ekadashiSection!.score).toBeGreaterThan(normalSection!.score);
  });

  it('recommended_shloka gets festival boost when isFestival=true', () => {
    const festival = feedService.generatePersonalizedFeed(
      makeContext({ isFestival: true, currentHour: 14 })
    );
    const normal = feedService.generatePersonalizedFeed(
      makeContext({ isFestival: false, currentHour: 14 })
    );

    const festivalSection = festival.find((s) => s.type === 'recommended_shloka');
    const normalSection = normal.find((s) => s.type === 'recommended_shloka');

    expect(festivalSection!.score).toBeGreaterThan(normalSection!.score);
  });

  it('achievement_progress gets larger boost when 3+ near-complete achievements', () => {
    const many = feedService.generatePersonalizedFeed(
      makeContext({ nearCompleteAchievements: 3 })
    );
    const few = feedService.generatePersonalizedFeed(
      makeContext({ nearCompleteAchievements: 1 })
    );

    const manySection = many.find((s) => s.type === 'achievement_progress');
    const fewSection = few.find((s) => s.type === 'achievement_progress');

    expect(manySection!.score).toBeGreaterThan(fewSection!.score);
  });

  it('recently_practiced gets boost when currentStreak >= 7', () => {
    const highStreak = feedService.generatePersonalizedFeed(
      makeContext({ currentStreak: 7, recentlyPracticed: ['shloka-1'] })
    );
    const lowStreak = feedService.generatePersonalizedFeed(
      makeContext({ currentStreak: 3, recentlyPracticed: ['shloka-1'] })
    );

    const highSection = highStreak.find((s) => s.type === 'recently_practiced');
    const lowSection = lowStreak.find((s) => s.type === 'recently_practiced');

    expect(highSection!.score).toBeGreaterThan(lowSection!.score);
  });
});

// ─── Section data ──────────────────────────────────────────────────────────────

describe('feedService.generatePersonalizedFeed — section data', () => {
  it('recommended_shloka section.data contains context fields', () => {
    const context = makeContext({
      preferredDeity: 'Shiva',
      currentHour: 8,
      isEkadashi: true,
      isFestival: false,
    });
    const feed = feedService.generatePersonalizedFeed(context);
    const section = feed.find((s) => s.type === 'recommended_shloka');

    expect(section!.data).toEqual({
      preferredDeity: 'Shiva',
      currentHour: 8,
      isEkadashi: true,
      isFestival: false,
    });
  });

  it('recently_practiced section.data contains shlokaIds', () => {
    const ids = ['shloka-1', 'shloka-2'];
    const feed = feedService.generatePersonalizedFeed(
      makeContext({ recentlyPracticed: ids })
    );
    const section = feed.find((s) => s.type === 'recently_practiced');

    expect(section!.data).toEqual({ shlokaIds: ids });
  });

  it('achievement_progress section.data contains count', () => {
    const feed = feedService.generatePersonalizedFeed(
      makeContext({ nearCompleteAchievements: 2 })
    );
    const section = feed.find((s) => s.type === 'achievement_progress');

    expect(section!.data).toEqual({ count: 2 });
  });

  it('daily_quest section.data contains completed and progress', () => {
    const feed = feedService.generatePersonalizedFeed(
      makeContext({ hasActiveQuest: true, completedQuestToday: false, questProgress: 0.5 })
    );
    const section = feed.find((s) => s.type === 'daily_quest');

    expect(section!.data).toEqual({ completed: false, progress: 0.5 });
  });

  it('static sections have null data', () => {
    const feed = feedService.generatePersonalizedFeed(makeContext());
    const staticTypes = ['verse_of_day', 'hindu_calendar', 'daily_wisdom', 'resume_practice'];

    staticTypes.forEach((type) => {
      const section = feed.find((s) => s.type === type);
      if (section) {
        expect(section.data).toBeNull();
      }
    });
  });
});

// ─── Base score integrity ──────────────────────────────────────────────────────

describe('feedService.generatePersonalizedFeed — base score integrity', () => {
  it('resume_practice section score equals base score (no boosts)', () => {
    const feed = feedService.generatePersonalizedFeed(makeContext());
    const section = feed.find((s) => s.type === 'resume_practice');
    expect(section!.score).toBe(FEED_BASE_SCORES['resume_practice']);
  });

  it('verse_of_day section score equals base score (no boosts)', () => {
    const feed = feedService.generatePersonalizedFeed(makeContext());
    const section = feed.find((s) => s.type === 'verse_of_day');
    expect(section!.score).toBe(FEED_BASE_SCORES['verse_of_day']);
  });

  it('hindu_calendar section score equals base score (no boosts)', () => {
    const feed = feedService.generatePersonalizedFeed(makeContext());
    const section = feed.find((s) => s.type === 'hindu_calendar');
    expect(section!.score).toBe(FEED_BASE_SCORES['hindu_calendar']);
  });

  it('daily_wisdom section score equals base score (no boosts)', () => {
    const feed = feedService.generatePersonalizedFeed(makeContext());
    const section = feed.find((s) => s.type === 'daily_wisdom');
    expect(section!.score).toBe(FEED_BASE_SCORES['daily_wisdom']);
  });
});

// ─── shouldRefreshFeed ─────────────────────────────────────────────────────────

describe('feedService.shouldRefreshFeed', () => {
  it('returns true when lastGeneratedAt is null', () => {
    expect(feedService.shouldRefreshFeed(null)).toBe(true);
  });

  it('returns false when feed was generated less than refreshInterval minutes ago', () => {
    const recentlyGenerated = minutesAgo(5);
    const config: FeedConfig = { ...DEFAULT_FEED_CONFIG, refreshInterval: 30 };
    expect(feedService.shouldRefreshFeed(recentlyGenerated, config)).toBe(false);
  });

  it('returns true when feed was generated more than refreshInterval minutes ago', () => {
    const longAgo = minutesAgo(60);
    const config: FeedConfig = { ...DEFAULT_FEED_CONFIG, refreshInterval: 30 };
    expect(feedService.shouldRefreshFeed(longAgo, config)).toBe(true);
  });

  it('returns true when feed was generated exactly at refreshInterval boundary', () => {
    // slightly over, so should refresh
    const atBoundary = minutesAgo(31);
    const config: FeedConfig = { ...DEFAULT_FEED_CONFIG, refreshInterval: 30 };
    expect(feedService.shouldRefreshFeed(atBoundary, config)).toBe(true);
  });

  it('uses DEFAULT_FEED_CONFIG when no config is provided', () => {
    const recentlyGenerated = minutesAgo(5);
    // With 30-min default interval, 5 minutes ago should NOT need refresh
    expect(feedService.shouldRefreshFeed(recentlyGenerated)).toBe(false);
  });

  it('uses custom refreshInterval from config', () => {
    const tenMinutesAgo = minutesAgo(10);
    const shortConfig: FeedConfig = { ...DEFAULT_FEED_CONFIG, refreshInterval: 5 };
    const longConfig: FeedConfig = { ...DEFAULT_FEED_CONFIG, refreshInterval: 30 };

    expect(feedService.shouldRefreshFeed(tenMinutesAgo, shortConfig)).toBe(true);
    expect(feedService.shouldRefreshFeed(tenMinutesAgo, longConfig)).toBe(false);
  });
});

// ─── buildFeedContext ──────────────────────────────────────────────────────────

describe('feedService.buildFeedContext', () => {
  it('returns a FeedContext with correct userId', () => {
    const context = feedService.buildFeedContext({
      userId: 'user-abc',
      currentStreak: 5,
      totalPractices: 20,
      lastPracticedDate: null,
      recentlyPracticed: [],
      hasActiveQuest: false,
      completedQuestToday: false,
      nearCompleteAchievements: 0,
    });

    expect(context.userId).toBe('user-abc');
  });

  it('maps all required fields correctly', () => {
    const input = {
      userId: 'user-xyz',
      currentStreak: 7,
      totalPractices: 100,
      lastPracticedDate: '2026-02-17T10:00:00.000Z',
      recentlyPracticed: ['shloka-1', 'shloka-2'],
      hasActiveQuest: true,
      completedQuestToday: true,
      questProgress: 0.9,
      nearCompleteAchievements: 2,
    };
    const context = feedService.buildFeedContext(input);

    expect(context.currentStreak).toBe(7);
    expect(context.totalPractices).toBe(100);
    expect(context.lastPracticedDate).toBe('2026-02-17T10:00:00.000Z');
    expect(context.recentlyPracticed).toEqual(['shloka-1', 'shloka-2']);
    expect(context.hasActiveQuest).toBe(true);
    expect(context.completedQuestToday).toBe(true);
    expect(context.questProgress).toBe(0.9);
    expect(context.nearCompleteAchievements).toBe(2);
  });

  it('maps optional profile fields correctly', () => {
    const context = feedService.buildFeedContext({
      userId: 'user-1',
      currentStreak: 0,
      totalPractices: 0,
      lastPracticedDate: null,
      recentlyPracticed: [],
      hasActiveQuest: false,
      completedQuestToday: false,
      nearCompleteAchievements: 0,
      experienceLevel: 'intermediate',
      preferredDeity: 'Ganesha',
      dailyTime: '10-20',
    });

    expect(context.experienceLevel).toBe('intermediate');
    expect(context.preferredDeity).toBe('Ganesha');
    expect(context.dailyTime).toBe('10-20');
  });

  it('maps social fields correctly', () => {
    const context = feedService.buildFeedContext({
      userId: 'user-1',
      currentStreak: 0,
      totalPractices: 0,
      lastPracticedDate: null,
      recentlyPracticed: [],
      hasActiveQuest: false,
      completedQuestToday: false,
      nearCompleteAchievements: 0,
      hasFriends: true,
      newFriendActivity: true,
      hasGroups: true,
      activeGroupChallenge: true,
    });

    expect(context.hasFriends).toBe(true);
    expect(context.newFriendActivity).toBe(true);
    expect(context.hasGroups).toBe(true);
    expect(context.activeGroupChallenge).toBe(true);
  });

  it('maps calendar fields correctly', () => {
    const context = feedService.buildFeedContext({
      userId: 'user-1',
      currentStreak: 0,
      totalPractices: 0,
      lastPracticedDate: null,
      recentlyPracticed: [],
      hasActiveQuest: false,
      completedQuestToday: false,
      nearCompleteAchievements: 0,
      isEkadashi: true,
      isFestival: true,
    });

    expect(context.isEkadashi).toBe(true);
    expect(context.isFestival).toBe(true);
  });

  it('sets currentHour to a valid hour (0-23)', () => {
    const context = feedService.buildFeedContext({
      userId: 'user-1',
      currentStreak: 0,
      totalPractices: 0,
      lastPracticedDate: null,
      recentlyPracticed: [],
      hasActiveQuest: false,
      completedQuestToday: false,
      nearCompleteAchievements: 0,
    });

    expect(context.currentHour).toBeGreaterThanOrEqual(0);
    expect(context.currentHour).toBeLessThanOrEqual(23);
  });
});

// ─── FeedService class export ──────────────────────────────────────────────────

describe('FeedService class export', () => {
  it('exports FeedService class that can be instantiated independently', () => {
    const instance = new FeedService();
    expect(instance).toBeInstanceOf(FeedService);
  });

  it('feedService singleton is an instance of FeedService', () => {
    expect(feedService).toBeInstanceOf(FeedService);
  });

  it('independently created instance produces same output as singleton', () => {
    const instance = new FeedService();
    const context = makeContext();
    const singletonFeed = feedService.generatePersonalizedFeed(context);
    const instanceFeed = instance.generatePersonalizedFeed(context);

    expect(instanceFeed.map((s) => s.type)).toEqual(singletonFeed.map((s) => s.type));
  });
});
