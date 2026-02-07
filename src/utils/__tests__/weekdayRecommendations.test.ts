/**
 * Weekday Recommendations Tests
 * Shloka Sadhana - Weekday-based Deity/Mantra Recommendations
 *
 * Tests for weekday-based mantra recommendations
 */

import {
  getWeekdayDeity,
  getWeekdayRecommendation,
  getRecommendedShlokas,
} from '../weekdayRecommendations';

describe('Weekday Recommendations', () => {
  describe('getWeekdayDeity', () => {
    it('should return Sun for Sunday (0)', () => {
      expect(getWeekdayDeity(0)).toBe('Surya');
    });

    it('should return Moon for Monday (1)', () => {
      expect(getWeekdayDeity(1)).toBe('Chandra');
    });

    it('should return Mars for Tuesday (2)', () => {
      expect(getWeekdayDeity(2)).toBe('Mangal');
    });

    it('should return Mercury for Wednesday (3)', () => {
      expect(getWeekdayDeity(3)).toBe('Budh');
    });

    it('should return Jupiter for Thursday (4)', () => {
      expect(getWeekdayDeity(4)).toBe('Guru');
    });

    it('should return Venus for Friday (5)', () => {
      expect(getWeekdayDeity(5)).toBe('Shukra');
    });

    it('should return Saturn for Saturday (6)', () => {
      expect(getWeekdayDeity(6)).toBe('Shani');
    });

    it('should handle invalid weekday numbers gracefully', () => {
      expect(getWeekdayDeity(-1)).toBe('Unknown');
      expect(getWeekdayDeity(7)).toBe('Unknown');
      expect(getWeekdayDeity(10)).toBe('Unknown');
    });
  });

  describe('getWeekdayRecommendation', () => {
    it('should return recommendation for Sunday', () => {
      const rec = getWeekdayRecommendation(0);
      expect(rec).toBeDefined();
      expect(rec?.weekday).toBe('Sunday');
      expect(rec?.sanskritWeekday).toBe('Ravivar');
      expect(rec?.deity).toBe('Surya');
      expect(rec?.deityName).toBe('Lord Surya (Sun God)');
      expect(rec?.color).toBeTruthy();
      expect(rec?.benefits).toBeTruthy();
      expect(rec?.recommendedMantras).toBeDefined();
      expect(Array.isArray(rec?.recommendedMantras)).toBe(true);
    });

    it('should return recommendation for Monday', () => {
      const rec = getWeekdayRecommendation(1);
      expect(rec).toBeDefined();
      expect(rec?.weekday).toBe('Monday');
      expect(rec?.sanskritWeekday).toBe('Somvar');
      expect(rec?.deity).toBe('Chandra');
      expect(rec?.deityName).toBe('Lord Chandra (Moon God)');
    });

    it('should return recommendation for Thursday', () => {
      const rec = getWeekdayRecommendation(4);
      expect(rec).toBeDefined();
      expect(rec?.weekday).toBe('Thursday');
      expect(rec?.sanskritWeekday).toBe('Guruvar');
      expect(rec?.deity).toBe('Guru');
      expect(rec?.deityName).toBe('Lord Guru (Jupiter)');
    });

    it('should return all 7 weekday recommendations', () => {
      for (let i = 0; i < 7; i++) {
        const rec = getWeekdayRecommendation(i);
        expect(rec).toBeDefined();
        expect(rec?.weekday).toBeTruthy();
        expect(rec?.deity).toBeTruthy();
      }
    });

    it('should return null for invalid weekday', () => {
      expect(getWeekdayRecommendation(-1)).toBeNull();
      expect(getWeekdayRecommendation(7)).toBeNull();
      expect(getWeekdayRecommendation(100)).toBeNull();
    });

    it('should include color information for each day', () => {
      const colors = [
        getWeekdayRecommendation(0)?.color,
        getWeekdayRecommendation(1)?.color,
        getWeekdayRecommendation(2)?.color,
        getWeekdayRecommendation(3)?.color,
        getWeekdayRecommendation(4)?.color,
        getWeekdayRecommendation(5)?.color,
        getWeekdayRecommendation(6)?.color,
      ];

      colors.forEach((color) => {
        expect(color).toBeTruthy();
        expect(typeof color).toBe('string');
      });
    });

    it('should include benefits for each day', () => {
      for (let i = 0; i < 7; i++) {
        const rec = getWeekdayRecommendation(i);
        expect(rec?.benefits).toBeTruthy();
        expect(typeof rec?.benefits).toBe('string');
      }
    });
  });

  describe('getRecommendedShlokas', () => {
    it('should return array of recommended shloka IDs for Sunday', () => {
      const shlokas = getRecommendedShlokas(0);
      expect(Array.isArray(shlokas)).toBe(true);
      expect(shlokas.length).toBeGreaterThan(0);
    });

    it('should return array of recommended shloka IDs for Monday', () => {
      const shlokas = getRecommendedShlokas(1);
      expect(Array.isArray(shlokas)).toBe(true);
      expect(shlokas.length).toBeGreaterThan(0);
    });

    it('should return array for all weekdays', () => {
      for (let i = 0; i < 7; i++) {
        const shlokas = getRecommendedShlokas(i);
        expect(Array.isArray(shlokas)).toBe(true);
      }
    });

    it('should return empty array for invalid weekday', () => {
      expect(getRecommendedShlokas(-1)).toEqual([]);
      expect(getRecommendedShlokas(7)).toEqual([]);
      expect(getRecommendedShlokas(100)).toEqual([]);
    });

    it('should return string IDs', () => {
      const shlokas = getRecommendedShlokas(0);
      shlokas.forEach((id) => {
        expect(typeof id).toBe('string');
      });
    });
  });

  describe('Weekday Recommendation Structure', () => {
    it('should have consistent structure for all weekdays', () => {
      for (let i = 0; i < 7; i++) {
        const rec = getWeekdayRecommendation(i);

        expect(rec).toHaveProperty('weekday');
        expect(rec).toHaveProperty('sanskritWeekday');
        expect(rec).toHaveProperty('deity');
        expect(rec).toHaveProperty('deityName');
        expect(rec).toHaveProperty('color');
        expect(rec).toHaveProperty('benefits');
        expect(rec).toHaveProperty('recommendedMantras');

        // Type checks
        expect(typeof rec?.weekday).toBe('string');
        expect(typeof rec?.sanskritWeekday).toBe('string');
        expect(typeof rec?.deity).toBe('string');
        expect(typeof rec?.deityName).toBe('string');
        expect(typeof rec?.color).toBe('string');
        expect(typeof rec?.benefits).toBe('string');
        expect(Array.isArray(rec?.recommendedMantras)).toBe(true);
      }
    });
  });

  describe('Integration with Date', () => {
    it('should get recommendation for today', () => {
      const today = new Date();
      const weekday = today.getDay();
      const rec = getWeekdayRecommendation(weekday);

      expect(rec).toBeDefined();
      expect(rec?.weekday).toBeTruthy();
    });

    it('should handle specific dates correctly', () => {
      // January 1, 2024 is Monday
      const monday = new Date('2024-01-01');
      const rec = getWeekdayRecommendation(monday.getDay());

      expect(rec?.weekday).toBe('Monday');
      expect(rec?.deity).toBe('Chandra');
    });
  });
});
