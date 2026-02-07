/**
 * Paanchang Service Tests
 * Shloka Sadhana - Hindu Calendar System
 *
 * Tests for Paanchang (Hindu calendar) calculations
 */

import {
  getPaanchangForDate,
  getTithiName,
  getNakshatraName,
  getHinduMonth,
  getSanskritWeekday,
  isEkadashi,
  getEkadasiName,
} from '../paanchang';

describe('Paanchang Service', () => {
  describe('getTithiName', () => {
    it('should return correct Tithi name for number 1', () => {
      expect(getTithiName(1)).toBe('Pratipada');
    });

    it('should return correct Tithi name for number 11 (Ekadashi)', () => {
      expect(getTithiName(11)).toBe('Ekadashi');
    });

    it('should return correct Tithi name for number 15 (Purnima/Amavasya)', () => {
      expect(getTithiName(15)).toBe('Purnima');
    });

    it('should handle invalid Tithi numbers gracefully', () => {
      expect(getTithiName(0)).toBe('Unknown');
      expect(getTithiName(16)).toBe('Unknown');
      expect(getTithiName(-1)).toBe('Unknown');
    });
  });

  describe('getNakshatraName', () => {
    it('should return correct Nakshatra name for number 1', () => {
      expect(getNakshatraName(1)).toBe('Ashwini');
    });

    it('should return correct Nakshatra name for number 14', () => {
      expect(getNakshatraName(14)).toBe('Chitra');
    });

    it('should return correct Nakshatra name for number 27', () => {
      expect(getNakshatraName(27)).toBe('Revati');
    });

    it('should handle invalid Nakshatra numbers gracefully', () => {
      expect(getNakshatraName(0)).toBe('Unknown');
      expect(getNakshatraName(28)).toBe('Unknown');
      expect(getNakshatraName(-1)).toBe('Unknown');
    });
  });

  describe('getHinduMonth', () => {
    it('should return correct month name for number 1', () => {
      expect(getHinduMonth(1)).toBe('Chaitra');
    });

    it('should return correct month name for number 6', () => {
      expect(getHinduMonth(6)).toBe('Bhadrapada');
    });

    it('should return correct month name for number 12', () => {
      expect(getHinduMonth(12)).toBe('Phalguna');
    });

    it('should handle invalid month numbers gracefully', () => {
      expect(getHinduMonth(0)).toBe('Unknown');
      expect(getHinduMonth(13)).toBe('Unknown');
      expect(getHinduMonth(-1)).toBe('Unknown');
    });
  });

  describe('getSanskritWeekday', () => {
    it('should return Ravivar for Sunday (0)', () => {
      expect(getSanskritWeekday(0)).toBe('Ravivar');
    });

    it('should return Somvar for Monday (1)', () => {
      expect(getSanskritWeekday(1)).toBe('Somvar');
    });

    it('should return Guruvar for Thursday (4)', () => {
      expect(getSanskritWeekday(4)).toBe('Guruvar');
    });

    it('should return Shanivar for Saturday (6)', () => {
      expect(getSanskritWeekday(6)).toBe('Shanivar');
    });

    it('should handle invalid weekday numbers gracefully', () => {
      expect(getSanskritWeekday(-1)).toBe('Unknown');
      expect(getSanskritWeekday(7)).toBe('Unknown');
    });
  });

  describe('isEkadashi', () => {
    it('should return true for Tithi 11', () => {
      expect(isEkadashi(11)).toBe(true);
    });

    it('should return false for other Tithis', () => {
      expect(isEkadashi(1)).toBe(false);
      expect(isEkadashi(5)).toBe(false);
      expect(isEkadashi(10)).toBe(false);
      expect(isEkadashi(12)).toBe(false);
      expect(isEkadashi(15)).toBe(false);
    });
  });

  describe('getEkadasiName', () => {
    it('should return Ekadashi name based on month and paksha', () => {
      // Chaitra Shukla Ekadashi
      const name1 = getEkadasiName(1, 'Shukla');
      expect(name1).toBeTruthy();
      expect(typeof name1).toBe('string');

      // Kartika Krishna Ekadashi
      const name2 = getEkadasiName(8, 'Krishna');
      expect(name2).toBeTruthy();
      expect(typeof name2).toBe('string');
    });

    it('should return null for invalid combinations', () => {
      expect(getEkadasiName(0, 'Shukla')).toBeNull();
      expect(getEkadasiName(13, 'Krishna')).toBeNull();
    });
  });

  describe('getPaanchangForDate', () => {
    it('should return Paanchang data for a valid date', () => {
      const date = '2024-01-15';
      const paanchang = getPaanchangForDate(date);

      expect(paanchang).toBeDefined();
      expect(paanchang.date).toBe(date);
      expect(paanchang.tithi).toBeTruthy();
      expect(paanchang.tithiNumber).toBeGreaterThanOrEqual(1);
      expect(paanchang.tithiNumber).toBeLessThanOrEqual(15);
      expect(paanchang.nakshatra).toBeTruthy();
      expect(['Shukla', 'Krishna']).toContain(paanchang.paksha);
      expect(paanchang.hinduMonth).toBeTruthy();
      expect(paanchang.weekday).toBeTruthy();
      expect(paanchang.weekdayEnglish).toBeTruthy();
      expect(typeof paanchang.isEkadashi).toBe('boolean');
    });

    it('should correctly identify Ekadashi days', () => {
      const date = '2024-01-15';
      const paanchang = getPaanchangForDate(date);

      if (paanchang.isEkadashi) {
        expect(paanchang.tithiNumber).toBe(11);
        expect(paanchang.tithi).toBe('Ekadashi');
        expect(paanchang.ekadasiName).toBeTruthy();
      }
    });

    it('should return consistent data for the same date', () => {
      const date = '2024-03-15';
      const paanchang1 = getPaanchangForDate(date);
      const paanchang2 = getPaanchangForDate(date);

      expect(paanchang1).toEqual(paanchang2);
    });

    it('should return different data for different dates', () => {
      const paanchang1 = getPaanchangForDate('2024-01-15');
      const paanchang2 = getPaanchangForDate('2024-02-15');

      // At least one field should be different
      const isDifferent =
        paanchang1.tithi !== paanchang2.tithi ||
        paanchang1.nakshatra !== paanchang2.nakshatra ||
        paanchang1.paksha !== paanchang2.paksha;

      expect(isDifferent).toBe(true);
    });

    it('should handle today\'s date', () => {
      const today = new Date().toISOString().split('T')[0];
      const paanchang = getPaanchangForDate(today);

      expect(paanchang).toBeDefined();
      expect(paanchang.date).toBe(today);
    });

    it('should handle past dates', () => {
      const pastDate = '2023-06-15';
      const paanchang = getPaanchangForDate(pastDate);

      expect(paanchang).toBeDefined();
      expect(paanchang.date).toBe(pastDate);
    });

    it('should handle future dates', () => {
      const futureDate = '2025-12-15';
      const paanchang = getPaanchangForDate(futureDate);

      expect(paanchang).toBeDefined();
      expect(paanchang.date).toBe(futureDate);
    });

    it('should include correct weekday information', () => {
      // Known date: 2024-01-01 is Monday
      const paanchang = getPaanchangForDate('2024-01-01');

      expect(paanchang.weekdayEnglish).toBe('Monday');
      expect(paanchang.weekday).toBe('Somvar');
    });

    it('should validate Tithi and Nakshatra are within valid ranges', () => {
      const dates = ['2024-01-15', '2024-06-15', '2024-12-15'];

      dates.forEach((date) => {
        const paanchang = getPaanchangForDate(date);

        expect(paanchang.tithiNumber).toBeGreaterThanOrEqual(1);
        expect(paanchang.tithiNumber).toBeLessThanOrEqual(15);
        expect(paanchang.tithi).not.toBe('Unknown');
        expect(paanchang.nakshatra).not.toBe('Unknown');
      });
    });
  });

  describe('Paanchang Data Structure', () => {
    it('should return data matching PaanchangData interface', () => {
      const paanchang = getPaanchangForDate('2024-01-15');

      // Check all required fields exist
      expect(paanchang).toHaveProperty('date');
      expect(paanchang).toHaveProperty('tithi');
      expect(paanchang).toHaveProperty('tithiNumber');
      expect(paanchang).toHaveProperty('nakshatra');
      expect(paanchang).toHaveProperty('paksha');
      expect(paanchang).toHaveProperty('hinduMonth');
      expect(paanchang).toHaveProperty('weekday');
      expect(paanchang).toHaveProperty('weekdayEnglish');
      expect(paanchang).toHaveProperty('isEkadashi');

      // Check types
      expect(typeof paanchang.date).toBe('string');
      expect(typeof paanchang.tithi).toBe('string');
      expect(typeof paanchang.tithiNumber).toBe('number');
      expect(typeof paanchang.nakshatra).toBe('string');
      expect(typeof paanchang.paksha).toBe('string');
      expect(typeof paanchang.hinduMonth).toBe('string');
      expect(typeof paanchang.weekday).toBe('string');
      expect(typeof paanchang.weekdayEnglish).toBe('string');
      expect(typeof paanchang.isEkadashi).toBe('boolean');
    });

    it('should include ekadasiName only when isEkadashi is true', () => {
      const dates = ['2024-01-15', '2024-02-15', '2024-03-15', '2024-04-15'];

      dates.forEach((date) => {
        const paanchang = getPaanchangForDate(date);

        if (paanchang.isEkadashi) {
          expect(paanchang.ekadasiName).toBeTruthy();
          expect(typeof paanchang.ekadasiName).toBe('string');
        }
      });
    });
  });
});
