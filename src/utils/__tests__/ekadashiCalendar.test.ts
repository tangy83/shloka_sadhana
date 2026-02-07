/**
 * Ekadashi Calendar Utility Tests
 * Shloka Sadhana - V3 Feature #10
 *
 * Tests for Ekadashi date calculations and data loading
 * Following TDD approach - RED phase
 */

import {
  getAllEkadashis,
  getUpcomingEkadashis,
  checkIfEkadashi,
  getEkadashiByDate,
  getNextEkadashi,
} from '../ekadashiCalendar';

describe('ekadashiCalendar', () => {
  const TODAY = '2026-02-07';
  const EKADASHI_DATE = '2026-02-13'; // Vijaya Ekadashi
  const NON_EKADASHI_DATE = '2026-02-15';

  describe('getAllEkadashis', () => {
    it('should load all Ekadashis from JSON', () => {
      const ekadashis = getAllEkadashis();

      expect(ekadashis).toBeDefined();
      expect(Array.isArray(ekadashis)).toBe(true);
      expect(ekadashis.length).toBeGreaterThan(0);
    });

    it('should have required fields for each Ekadashi', () => {
      const ekadashis = getAllEkadashis();
      const ekadashi = ekadashis[0];

      expect(ekadashi).toHaveProperty('serial');
      expect(ekadashi).toHaveProperty('name');
      expect(ekadashi).toHaveProperty('name_hindi');
      expect(ekadashi).toHaveProperty('date');
      expect(ekadashi).toHaveProperty('paksha');
      expect(ekadashi).toHaveProperty('deity');
      expect(ekadashi).toHaveProperty('significance');
      expect(ekadashi).toHaveProperty('benefits');
      expect(ekadashi).toHaveProperty('vrat_katha');
    });

    it('should have dates in ISO format (YYYY-MM-DD)', () => {
      const ekadashis = getAllEkadashis();
      const ekadashi = ekadashis[0];

      expect(ekadashi.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should be sorted by date (earliest first)', () => {
      const ekadashis = getAllEkadashis();

      for (let i = 1; i < ekadashis.length; i++) {
        expect(ekadashis[i].date >= ekadashis[i - 1].date).toBe(true);
      }
    });
  });

  describe('getUpcomingEkadashis', () => {
    it('should return Ekadashis with dates >= today', () => {
      const upcoming = getUpcomingEkadashis(TODAY);

      upcoming.forEach(ekadashi => {
        expect(ekadashi.date >= TODAY).toBe(true);
      });
    });

    it('should be sorted by date (earliest first)', () => {
      const upcoming = getUpcomingEkadashis(TODAY);

      for (let i = 1; i < upcoming.length; i++) {
        expect(upcoming[i].date >= upcoming[i - 1].date).toBe(true);
      }
    });

    it('should limit results when limit parameter provided', () => {
      const upcoming = getUpcomingEkadashis(TODAY, 5);

      expect(upcoming.length).toBeLessThanOrEqual(5);
    });

    it('should return default 12 upcoming Ekadashis if no limit', () => {
      const upcoming = getUpcomingEkadashis(TODAY);

      expect(upcoming.length).toBe(12);
    });

    it('should return empty array if no upcoming Ekadashis', () => {
      const upcoming = getUpcomingEkadashis('2030-12-31');

      expect(Array.isArray(upcoming)).toBe(true);
      expect(upcoming.length).toBe(0);
    });
  });

  describe('checkIfEkadashi', () => {
    it('should return true for Ekadashi dates', () => {
      const isEkadashi = checkIfEkadashi(EKADASHI_DATE);

      expect(isEkadashi).toBe(true);
    });

    it('should return false for non-Ekadashi dates', () => {
      const isEkadashi = checkIfEkadashi(NON_EKADASHI_DATE);

      expect(isEkadashi).toBe(false);
    });

    it('should handle edge cases (year boundaries)', () => {
      const isEkadashi = checkIfEkadashi('2026-01-01');

      expect(typeof isEkadashi).toBe('boolean');
    });
  });

  describe('getEkadashiByDate', () => {
    it('should return Ekadashi for a given date', () => {
      const ekadashi = getEkadashiByDate(EKADASHI_DATE);

      expect(ekadashi).toBeDefined();
      expect(ekadashi?.name).toBe('Vijaya Ekadashi');
      expect(ekadashi?.date).toBe(EKADASHI_DATE);
    });

    it('should return null for non-Ekadashi dates', () => {
      const ekadashi = getEkadashiByDate(NON_EKADASHI_DATE);

      expect(ekadashi).toBeNull();
    });

    it('should include full vrat_katha (story)', () => {
      const ekadashi = getEkadashiByDate(EKADASHI_DATE);

      expect(ekadashi?.vrat_katha).toBeDefined();
      expect(ekadashi?.vrat_katha.length).toBeGreaterThan(100); // Story should be substantial
    });
  });

  describe('getNextEkadashi', () => {
    it('should return the next upcoming Ekadashi from today', () => {
      const next = getNextEkadashi(TODAY);

      expect(next).toBeDefined();
      expect(next.date > TODAY).toBe(true);
    });

    it('should return the immediate next Ekadashi', () => {
      const next = getNextEkadashi('2026-02-01');

      expect(next.name).toBe('Vijaya Ekadashi');
      expect(next.date).toBe('2026-02-13');
    });

    it('should work when today is Ekadashi', () => {
      const next = getNextEkadashi(EKADASHI_DATE);

      // Should return the NEXT Ekadashi, not today's
      expect(next.date > EKADASHI_DATE).toBe(true);
    });
  });

  describe('Data Validation', () => {
    it('should have unique serial numbers', () => {
      const ekadashis = getAllEkadashis();
      const serials = ekadashis.map(e => e.serial);
      const uniqueSerials = new Set(serials);

      expect(uniqueSerials.size).toBe(serials.length);
    });

    it('should have valid paksha values', () => {
      const ekadashis = getAllEkadashis();
      const validPaksha = ['Shukla', 'Krishna', 'Adhik Maas'];

      ekadashis.forEach(ekadashi => {
        const hasPaksha = validPaksha.some(valid =>
          ekadashi.paksha.includes(valid)
        );
        expect(hasPaksha).toBe(true);
      });
    });

    it('should have Lord Vishnu/Narayana as deity', () => {
      const ekadashis = getAllEkadashis();

      ekadashis.forEach(ekadashi => {
        // Deity should be Vishnu or Narayana (same deity, different names)
        const isValidDeity = ekadashi.deity.includes('Vishnu') ||
                            ekadashi.deity.includes('Narayana');
        expect(isValidDeity).toBe(true);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle leap year dates correctly', () => {
      const ekadashi = getEkadashiByDate('2028-02-29');

      expect(ekadashi).toBeDefined(); // Should not throw
    });

    it('should handle year boundaries', () => {
      const upcoming = getUpcomingEkadashis('2026-12-31', 3);

      expect(Array.isArray(upcoming)).toBe(true);
    });

    it('should return empty array if no data available for future dates', () => {
      const upcoming = getUpcomingEkadashis('2030-01-01');

      expect(upcoming).toEqual([]);
    });
  });
});
