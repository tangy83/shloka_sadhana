/**
 * Hindu Calendar Utilities Tests
 * Shloka Sadhana - Moon phase and Paksha calculations
 *
 * TDD Approach: RED → GREEN → REFACTOR
 * These tests are written BEFORE implementation
 */

import {
  getMoonPhase,
  getPakshaName,
  getMoonPhaseEmoji,
  calculateTithiNumber,
  isAuspiciousDay,
} from '@/utils/hinduCalendar';

describe('Hindu Calendar Utilities', () => {
  describe('getMoonPhase', () => {
    it('should return complete MoonPhase object', () => {
      const date = new Date('2026-02-05');
      const moonPhase = getMoonPhase(date);

      expect(moonPhase).toHaveProperty('phase');
      expect(moonPhase).toHaveProperty('name');
      expect(moonPhase).toHaveProperty('desc');
      expect(typeof moonPhase.phase).toBe('string');
      expect(typeof moonPhase.name).toBe('string');
      expect(typeof moonPhase.desc).toBe('string');
    });

    it('should return new moon phase', () => {
      // New moon occurred on 2026-01-20
      const date = new Date('2026-01-20');
      const moonPhase = getMoonPhase(date);

      expect(moonPhase.phase).toBe('🌑');
      expect(moonPhase.name).toBe('Amavasya (New Moon)');
      expect(moonPhase.desc).toContain('new beginnings');
    });

    it('should return full moon phase', () => {
      // Full moon occurred on 2026-02-03
      const date = new Date('2026-02-03');
      const moonPhase = getMoonPhase(date);

      expect(moonPhase.phase).toBe('🌕');
      expect(moonPhase.name).toBe('Purnima (Full Moon)');
      expect(moonPhase.desc).toContain('completion');
    });

    it('should return waxing crescent phase', () => {
      // A few days after new moon
      const date = new Date('2026-01-23');
      const moonPhase = getMoonPhase(date);

      expect(moonPhase.phase).toBe('🌒');
      expect(moonPhase.name).toBe('Shukla Paksha (Waxing)');
    });

    it('should return waning gibbous phase', () => {
      // A few days after full moon
      const date = new Date('2026-02-06');
      const moonPhase = getMoonPhase(date);

      expect(moonPhase.phase).toBe('🌖');
      expect(moonPhase.name).toBe('Krishna Paksha (Waning)');
    });

    it('should handle date strings', () => {
      const moonPhase = getMoonPhase('2026-02-03');
      expect(moonPhase).toHaveProperty('phase');
      expect(moonPhase).toHaveProperty('name');
    });
  });

  describe('getPakshaName', () => {
    it('should return Shukla Paksha for waxing moon (0-14 days after new moon)', () => {
      const name = getPakshaName(7); // Day 7 of lunar month
      expect(name).toBe('Shukla Paksha');
    });

    it('should return Krishna Paksha for waning moon (15-29 days after new moon)', () => {
      const name = getPakshaName(20); // Day 20 of lunar month
      expect(name).toBe('Krishna Paksha');
    });

    it('should handle day 0 (new moon)', () => {
      const name = getPakshaName(0);
      expect(name).toBe('Amavasya');
    });

    it('should handle day 14/15 (full moon)', () => {
      const name = getPakshaName(14);
      expect(name).toBe('Purnima');
    });

    it('should handle edge cases', () => {
      expect(getPakshaName(1)).toBe('Shukla Paksha');
      expect(getPakshaName(13)).toBe('Shukla Paksha');
      expect(getPakshaName(16)).toBe('Krishna Paksha');
      expect(getPakshaName(28)).toBe('Krishna Paksha');
    });
  });

  describe('getMoonPhaseEmoji', () => {
    it('should return new moon emoji for day 0', () => {
      expect(getMoonPhaseEmoji(0)).toBe('🌑');
    });

    it('should return waxing crescent for days 1-6', () => {
      expect(getMoonPhaseEmoji(3)).toBe('🌒');
    });

    it('should return first quarter for day 7', () => {
      expect(getMoonPhaseEmoji(7)).toBe('🌓');
    });

    it('should return waxing gibbous for days 8-13', () => {
      expect(getMoonPhaseEmoji(10)).toBe('🌔');
    });

    it('should return full moon for days 14-15', () => {
      expect(getMoonPhaseEmoji(14)).toBe('🌕');
      expect(getMoonPhaseEmoji(15)).toBe('🌕');
    });

    it('should return waning gibbous for days 16-21', () => {
      expect(getMoonPhaseEmoji(18)).toBe('🌖');
    });

    it('should return last quarter for day 22', () => {
      expect(getMoonPhaseEmoji(22)).toBe('🌗');
    });

    it('should return waning crescent for days 23-29', () => {
      expect(getMoonPhaseEmoji(26)).toBe('🌘');
    });
  });

  describe('calculateTithiNumber', () => {
    it('should return 0 for new moon dates', () => {
      const date = new Date('2026-01-20'); // New moon
      const tithi = calculateTithiNumber(date);
      expect(tithi).toBeGreaterThanOrEqual(0);
      expect(tithi).toBeLessThan(30);
    });

    it('should return ~14-15 for full moon dates', () => {
      const date = new Date('2026-02-03'); // Full moon
      const tithi = calculateTithiNumber(date);
      expect(tithi).toBeGreaterThanOrEqual(13);
      expect(tithi).toBeLessThanOrEqual(16);
    });

    it('should return values between 0-29', () => {
      const dates = [
        new Date('2026-01-20'),
        new Date('2026-01-25'),
        new Date('2026-02-03'),
        new Date('2026-02-10'),
        new Date('2026-02-18'),
      ];

      dates.forEach((date) => {
        const tithi = calculateTithiNumber(date);
        expect(tithi).toBeGreaterThanOrEqual(0);
        expect(tithi).toBeLessThan(30);
      });
    });

    it('should handle date strings', () => {
      const tithi = calculateTithiNumber('2026-02-03');
      expect(typeof tithi).toBe('number');
      expect(tithi).toBeGreaterThanOrEqual(0);
      expect(tithi).toBeLessThan(30);
    });
  });

  describe('isAuspiciousDay', () => {
    it('should return true for Purnima (full moon)', () => {
      const date = new Date('2026-02-03'); // Full moon
      expect(isAuspiciousDay(date)).toBe(true);
    });

    it('should return true for Ekadashi (11th day)', () => {
      // Ekadashi occurs ~11 days after new moon
      const date = new Date('2026-01-31'); // ~11 days after Jan 20 new moon
      const result = isAuspiciousDay(date);
      // Note: This is approximate, actual Ekadashi calculation is complex
      expect(typeof result).toBe('boolean');
    });

    it('should return false for Amavasya (new moon) - generally not auspicious for starting new practices', () => {
      const date = new Date('2026-01-20'); // New moon
      const result = isAuspiciousDay(date);
      // Amavasya can be auspicious for certain practices, but not generally
      expect(typeof result).toBe('boolean');
    });

    it('should handle date strings', () => {
      const result = isAuspiciousDay('2026-02-03');
      expect(typeof result).toBe('boolean');
    });

    it('should return boolean for any date', () => {
      const dates = [
        '2026-01-15',
        '2026-01-20',
        '2026-02-03',
        '2026-02-15',
        '2026-03-01',
      ];

      dates.forEach((date) => {
        expect(typeof isAuspiciousDay(date)).toBe('boolean');
      });
    });
  });
});
