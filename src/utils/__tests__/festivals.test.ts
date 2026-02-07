/**
 * Festivals Utility Tests
 * Shloka Sadhana - V3 Feature #3
 *
 * Tests for festival data loading and filtering
 * Following TDD approach - RED phase
 */

import {
  getAllFestivals,
  getUpcomingFestivals,
  getPastFestivals,
  getFestivalsInRange,
  getFestivalByName,
} from '../festivals';

describe('festivals', () => {
  const TODAY = '2026-02-07';
  const YESTERDAY = '2026-02-06';
  const NEXT_WEEK = '2026-02-14';
  const LAST_MONTH = '2026-01-07';
  const NEXT_YEAR = '2027-02-07';

  describe('getAllFestivals', () => {
    it('should load all festivals from JSON', () => {
      const festivals = getAllFestivals();

      expect(festivals).toBeDefined();
      expect(Array.isArray(festivals)).toBe(true);
      expect(festivals.length).toBeGreaterThan(0);
    });

    it('should have required fields for each festival', () => {
      const festivals = getAllFestivals();
      const festival = festivals[0];

      expect(festival).toHaveProperty('name');
      expect(festival).toHaveProperty('date');
      expect(festival).toHaveProperty('category');
      expect(festival).toHaveProperty('deity_association');
      expect(festival).toHaveProperty('description');
    });

    it('should have dates in ISO format (YYYY-MM-DD)', () => {
      const festivals = getAllFestivals();
      const festival = festivals[0];

      expect(festival.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('getUpcomingFestivals', () => {
    it('should return festivals with dates >= today', () => {
      const upcoming = getUpcomingFestivals(TODAY);

      upcoming.forEach(festival => {
        expect(festival.date >= TODAY).toBe(true);
      });
    });

    it('should be sorted by date (earliest first)', () => {
      const upcoming = getUpcomingFestivals(TODAY);

      for (let i = 1; i < upcoming.length; i++) {
        expect(upcoming[i].date >= upcoming[i - 1].date).toBe(true);
      }
    });

    it('should limit results when limit parameter provided', () => {
      const upcoming = getUpcomingFestivals(TODAY, 5);

      expect(upcoming.length).toBeLessThanOrEqual(5);
    });

    it('should return empty array if no upcoming festivals', () => {
      const upcoming = getUpcomingFestivals('2030-12-31');

      expect(Array.isArray(upcoming)).toBe(true);
      expect(upcoming.length).toBe(0);
    });
  });

  describe('getPastFestivals', () => {
    it('should return festivals with dates < today', () => {
      const past = getPastFestivals(TODAY);

      past.forEach(festival => {
        expect(festival.date < TODAY).toBe(true);
      });
    });

    it('should be sorted by date (most recent first)', () => {
      const past = getPastFestivals(TODAY);

      for (let i = 1; i < past.length; i++) {
        expect(past[i].date <= past[i - 1].date).toBe(true);
      }
    });

    it('should limit results when limit parameter provided', () => {
      const past = getPastFestivals(TODAY, 10);

      expect(past.length).toBeLessThanOrEqual(10);
    });

    it('should return empty array if no past festivals', () => {
      const past = getPastFestivals('2020-01-01');

      expect(Array.isArray(past)).toBe(true);
      expect(past.length).toBe(0);
    });
  });

  describe('getFestivalsInRange', () => {
    it('should return festivals within date range (inclusive)', () => {
      const ranged = getFestivalsInRange(YESTERDAY, NEXT_WEEK);

      ranged.forEach(festival => {
        expect(festival.date >= YESTERDAY).toBe(true);
        expect(festival.date <= NEXT_WEEK).toBe(true);
      });
    });

    it('should be sorted by date (earliest first)', () => {
      const ranged = getFestivalsInRange(LAST_MONTH, NEXT_WEEK);

      for (let i = 1; i < ranged.length; i++) {
        expect(ranged[i].date >= ranged[i - 1].date).toBe(true);
      }
    });

    it('should return empty array if no festivals in range', () => {
      const ranged = getFestivalsInRange('2030-01-01', '2030-01-31');

      expect(Array.isArray(ranged)).toBe(true);
      expect(ranged.length).toBe(0);
    });

    it('should handle single-day range', () => {
      const ranged = getFestivalsInRange(TODAY, TODAY);

      expect(Array.isArray(ranged)).toBe(true);
      // Should only include festivals on TODAY (if any)
      ranged.forEach(festival => {
        expect(festival.date).toBe(TODAY);
      });
    });
  });

  describe('getFestivalByName', () => {
    it('should find festival by exact name match', () => {
      const festival = getFestivalByName('Diwali (Deepavali)');

      expect(festival).toBeDefined();
      expect(festival?.name).toBe('Diwali (Deepavali)');
    });

    it('should return null if festival not found', () => {
      const festival = getFestivalByName('NonexistentFestival123');

      expect(festival).toBeNull();
    });

    it('should be case-sensitive', () => {
      const festival = getFestivalByName('diwali (deepavali)');

      expect(festival).toBeNull();
    });
  });

  describe('Rolling Window Logic (Past 3 months + Next 12 months)', () => {
    it('should include festivals from 3 months ago', () => {
      const threeMonthsAgo = '2025-11-07'; // 3 months before 2026-02-07
      const inRange = getFestivalsInRange(threeMonthsAgo, NEXT_YEAR);

      expect(inRange.length).toBeGreaterThan(0);
    });

    it('should include festivals up to 12 months ahead', () => {
      const twelveMonthsAhead = '2027-02-07'; // 12 months after 2026-02-07
      const inRange = getFestivalsInRange(TODAY, twelveMonthsAhead);

      expect(inRange.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle leap year dates correctly', () => {
      const leapDay = '2028-02-29';
      const ranged = getFestivalsInRange(leapDay, leapDay);

      expect(Array.isArray(ranged)).toBe(true);
    });

    it('should handle year boundaries', () => {
      const endOfYear = '2025-12-31';
      const startOfYear = '2026-01-01';
      const ranged = getFestivalsInRange(endOfYear, startOfYear);

      expect(Array.isArray(ranged)).toBe(true);
    });

    it('should handle reversed date range gracefully', () => {
      // Start date after end date
      const ranged = getFestivalsInRange(NEXT_WEEK, YESTERDAY);

      expect(Array.isArray(ranged)).toBe(true);
      expect(ranged.length).toBe(0);
    });
  });
});
