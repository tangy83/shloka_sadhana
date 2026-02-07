/**
 * Verse of the Day Utility Tests
 * Shloka Sadhana - V3 Feature #5
 *
 * Tests for daily verse selection algorithm
 * Following TDD approach - RED phase
 */

import { getVerseOfTheDay } from '../verseOfTheDay';
import { getAllShlokas } from '@/data/shlokas';

describe('verseOfTheDay', () => {
  const TODAY = '2026-02-07';
  const TOMORROW = '2026-02-08';

  describe('getVerseOfTheDay', () => {
    it('should return a verse for a given date', () => {
      const verse = getVerseOfTheDay(TODAY);

      expect(verse).toBeDefined();
      expect(verse.sanskrit).toBeDefined();
      expect(verse.transliteration).toBeDefined();
      expect(verse.meaning).toBeDefined();
    });

    it('should include shloka metadata', () => {
      const verse = getVerseOfTheDay(TODAY);

      expect(verse.shlokaName).toBeDefined();
      expect(verse.deity).toBeDefined();
      expect(verse.shlokaId).toBeDefined();
    });

    it('should return the same verse for the same date', () => {
      const verse1 = getVerseOfTheDay(TODAY);
      const verse2 = getVerseOfTheDay(TODAY);

      expect(verse1.shlokaId).toBe(verse2.shlokaId);
      expect(verse1.sectionId).toBe(verse2.sectionId);
    });

    it('should return different verses for different dates', () => {
      const verse1 = getVerseOfTheDay(TODAY);
      const verse2 = getVerseOfTheDay(TOMORROW);

      // Should be different (statistically very likely with 20+ shlokas)
      const isDifferent =
        verse1.shlokaId !== verse2.shlokaId ||
        verse1.sectionId !== verse2.sectionId;

      expect(isDifferent).toBe(true);
    });

    it('should cycle through all available verses over time', () => {
      const shlokas = getAllShlokas();
      const totalSections = shlokas.reduce(
        (sum, shloka) => sum + shloka.sections.length,
        0
      );

      const verses = new Set<string>();

      // Generate verses for 100 days
      for (let i = 0; i < 100; i++) {
        const date = new Date('2026-01-01');
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];

        const verse = getVerseOfTheDay(dateStr);
        verses.add(`${verse.shlokaId}:${verse.sectionId}`);
      }

      // Should cover many different verses
      expect(verses.size).toBeGreaterThan(20);
      expect(verses.size).toBeLessThanOrEqual(totalSections);
    });

    it('should handle leap year dates', () => {
      const verse = getVerseOfTheDay('2028-02-29');

      expect(verse).toBeDefined();
      expect(verse.sanskrit).toBeDefined();
    });

    it('should handle year boundaries', () => {
      const verse1 = getVerseOfTheDay('2025-12-31');
      const verse2 = getVerseOfTheDay('2026-01-01');

      expect(verse1).toBeDefined();
      expect(verse2).toBeDefined();
    });

    it('should use deterministic selection (seed-based)', () => {
      // Same date should always return same verse, even across sessions
      const verse1 = getVerseOfTheDay('2026-05-15');
      const verse2 = getVerseOfTheDay('2026-05-15');

      expect(verse1.shlokaId).toBe(verse2.shlokaId);
      expect(verse1.sectionId).toBe(verse2.sectionId);
      expect(verse1.sanskrit).toBe(verse2.sanskrit);
    });

    it('should include optional hindi translation if available', () => {
      const verse = getVerseOfTheDay(TODAY);

      // Hindi is optional, but if present should be string
      if (verse.hindi) {
        expect(typeof verse.hindi).toBe('string');
        expect(verse.hindi.length).toBeGreaterThan(0);
      }
    });

    it('should select from shlokas with multiple sections', () => {
      const verses = [];

      // Generate 50 verses
      for (let i = 0; i < 50; i++) {
        const date = new Date('2026-01-01');
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];

        verses.push(getVerseOfTheDay(dateStr));
      }

      // Should include verses from different sections of the same shloka
      const sectionCounts = new Map<string, number>();
      verses.forEach(verse => {
        const count = sectionCounts.get(verse.shlokaId) || 0;
        sectionCounts.set(verse.shlokaId, count + 1);
      });

      // At least one shloka should appear multiple times (different sections)
      const maxCount = Math.max(...sectionCounts.values());
      expect(maxCount).toBeGreaterThan(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle dates far in the future', () => {
      const verse = getVerseOfTheDay('2030-12-31');

      expect(verse).toBeDefined();
      expect(verse.sanskrit).toBeDefined();
    });

    it('should handle dates far in the past', () => {
      const verse = getVerseOfTheDay('2020-01-01');

      expect(verse).toBeDefined();
      expect(verse.sanskrit).toBeDefined();
    });

    it('should handle invalid date format gracefully', () => {
      // Should default to today or throw meaningful error
      expect(() => {
        getVerseOfTheDay('invalid-date');
      }).toThrow();
    });
  });
});
