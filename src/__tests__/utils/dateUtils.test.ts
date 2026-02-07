/**
 * Date Utilities Tests
 * Shloka Sadhana - Date formatting and manipulation
 *
 * TDD Approach: RED → GREEN → REFACTOR
 * These tests are written BEFORE implementation
 */

import {
  getToday,
  formatDate,
  parseDate,
  isSameDay,
  isToday,
  isYesterday,
  getDaysBetween,
  addDays,
  subtractDays,
  getStartOfDay,
  getEndOfDay,
  formatTimeAgo,
  isValidDate,
} from '@/utils/dateUtils';

describe('Date Utilities', () => {
  describe('getToday', () => {
    it('should return today\'s date in ISO format (YYYY-MM-DD)', () => {
      const today = getToday();

      // Should match ISO date format
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      // Should be today's date
      const now = new Date();
      const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      expect(today).toBe(expected);
    });
  });

  describe('formatDate', () => {
    it('should format date to ISO string (YYYY-MM-DD)', () => {
      const date = new Date('2026-02-05T10:30:00');
      expect(formatDate(date)).toBe('2026-02-05');
    });

    it('should format date with custom format', () => {
      const date = new Date('2026-02-05T10:30:00');
      expect(formatDate(date, 'MMM dd, yyyy')).toBe('Feb 05, 2026');
    });

    it('should handle different formats', () => {
      const date = new Date('2026-12-25T10:30:00');
      expect(formatDate(date, 'MMMM dd, yyyy')).toBe('December 25, 2026');
      expect(formatDate(date, 'dd/MM/yyyy')).toBe('25/12/2026');
      expect(formatDate(date, 'yyyy')).toBe('2026');
    });
  });

  describe('parseDate', () => {
    it('should parse ISO date string to Date object', () => {
      const dateStr = '2026-02-05';
      const date = parseDate(dateStr);

      expect(date).toBeInstanceOf(Date);
      expect(date?.getFullYear()).toBe(2026);
      expect(date?.getMonth()).toBe(1); // 0-indexed (February = 1)
      expect(date?.getDate()).toBe(5);
    });

    it('should handle invalid date strings', () => {
      const invalidDate = parseDate('invalid-date');
      expect(invalidDate).toBeNull();
    });

    it('should parse various date formats', () => {
      expect(parseDate('2026-02-05')).toBeInstanceOf(Date);
      expect(parseDate('2026/02/05')).toBeInstanceOf(Date);
      expect(parseDate('Feb 5, 2026')).toBeInstanceOf(Date);
    });
  });

  describe('isSameDay', () => {
    it('should return true for same day', () => {
      const date1 = new Date('2026-02-05T10:00:00');
      const date2 = new Date('2026-02-05T15:30:00');

      expect(isSameDay(date1, date2)).toBe(true);
    });

    it('should return false for different days', () => {
      const date1 = new Date('2026-02-05T10:00:00');
      const date2 = new Date('2026-02-06T10:00:00');

      expect(isSameDay(date1, date2)).toBe(false);
    });

    it('should handle date strings', () => {
      expect(isSameDay('2026-02-05', '2026-02-05')).toBe(true);
      expect(isSameDay('2026-02-05', '2026-02-06')).toBe(false);
    });
  });

  describe('isToday', () => {
    it('should return true for today\'s date', () => {
      const today = new Date();
      expect(isToday(today)).toBe(true);
    });

    it('should return false for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(yesterday)).toBe(false);
    });

    it('should return false for tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isToday(tomorrow)).toBe(false);
    });

    it('should handle date strings', () => {
      const todayStr = getToday();
      expect(isToday(todayStr)).toBe(true);
    });
  });

  describe('isYesterday', () => {
    it('should return true for yesterday\'s date', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isYesterday(yesterday)).toBe(true);
    });

    it('should return false for today', () => {
      const today = new Date();
      expect(isYesterday(today)).toBe(false);
    });

    it('should return false for 2 days ago', () => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      expect(isYesterday(twoDaysAgo)).toBe(false);
    });

    it('should handle date strings', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = formatDate(yesterday);
      expect(isYesterday(yesterdayStr)).toBe(true);
    });
  });

  describe('getDaysBetween', () => {
    it('should return 0 for same day', () => {
      const date = new Date('2026-02-05');
      expect(getDaysBetween(date, date)).toBe(0);
    });

    it('should return positive number for future dates', () => {
      const start = new Date('2026-02-05');
      const end = new Date('2026-02-10');
      expect(getDaysBetween(start, end)).toBe(5);
    });

    it('should return negative number for past dates', () => {
      const start = new Date('2026-02-10');
      const end = new Date('2026-02-05');
      expect(getDaysBetween(start, end)).toBe(-5);
    });

    it('should handle date strings', () => {
      expect(getDaysBetween('2026-02-05', '2026-02-10')).toBe(5);
    });

    it('should handle dates spanning months', () => {
      expect(getDaysBetween('2026-01-25', '2026-02-05')).toBe(11);
    });

    it('should handle dates spanning years', () => {
      expect(getDaysBetween('2025-12-25', '2026-01-05')).toBe(11);
    });
  });

  describe('addDays', () => {
    it('should add days to a date', () => {
      const date = new Date('2026-02-05');
      const result = addDays(date, 5);

      expect(formatDate(result)).toBe('2026-02-10');
    });

    it('should handle negative days (subtract)', () => {
      const date = new Date('2026-02-05');
      const result = addDays(date, -5);

      expect(formatDate(result)).toBe('2026-01-31');
    });

    it('should handle date strings', () => {
      const result = addDays('2026-02-05', 5);
      expect(formatDate(result)).toBe('2026-02-10');
    });

    it('should handle month boundaries', () => {
      const date = new Date('2026-01-30');
      const result = addDays(date, 5);

      expect(formatDate(result)).toBe('2026-02-04');
    });
  });

  describe('subtractDays', () => {
    it('should subtract days from a date', () => {
      const date = new Date('2026-02-10');
      const result = subtractDays(date, 5);

      expect(formatDate(result)).toBe('2026-02-05');
    });

    it('should handle date strings', () => {
      const result = subtractDays('2026-02-10', 5);
      expect(formatDate(result)).toBe('2026-02-05');
    });

    it('should handle month boundaries', () => {
      const date = new Date('2026-02-05');
      const result = subtractDays(date, 10);

      expect(formatDate(result)).toBe('2026-01-26');
    });
  });

  describe('getStartOfDay', () => {
    it('should return date at 00:00:00.000', () => {
      const date = new Date('2026-02-05T15:30:45.123');
      const start = getStartOfDay(date);

      expect(start.getHours()).toBe(0);
      expect(start.getMinutes()).toBe(0);
      expect(start.getSeconds()).toBe(0);
      expect(start.getMilliseconds()).toBe(0);
      expect(formatDate(start)).toBe('2026-02-05');
    });

    it('should handle date strings', () => {
      const start = getStartOfDay('2026-02-05');
      expect(start.getHours()).toBe(0);
    });
  });

  describe('getEndOfDay', () => {
    it('should return date at 23:59:59.999', () => {
      const date = new Date('2026-02-05T10:30:00');
      const end = getEndOfDay(date);

      expect(end.getHours()).toBe(23);
      expect(end.getMinutes()).toBe(59);
      expect(end.getSeconds()).toBe(59);
      expect(end.getMilliseconds()).toBe(999);
      expect(formatDate(end)).toBe('2026-02-05');
    });

    it('should handle date strings', () => {
      const end = getEndOfDay('2026-02-05');
      expect(end.getHours()).toBe(23);
    });
  });

  describe('formatTimeAgo', () => {
    it('should return "just now" for current time', () => {
      const now = new Date();
      expect(formatTimeAgo(now)).toBe('just now');
    });

    it('should return "X minutes ago"', () => {
      const date = new Date();
      date.setMinutes(date.getMinutes() - 5);
      expect(formatTimeAgo(date)).toBe('5 minutes ago');
    });

    it('should return "X hours ago"', () => {
      const date = new Date();
      date.setHours(date.getHours() - 3);
      expect(formatTimeAgo(date)).toBe('3 hours ago');
    });

    it('should return "yesterday" for yesterday', () => {
      const date = new Date();
      date.setDate(date.getDate() - 1);
      expect(formatTimeAgo(date)).toBe('yesterday');
    });

    it('should return "X days ago"', () => {
      const date = new Date();
      date.setDate(date.getDate() - 5);
      expect(formatTimeAgo(date)).toBe('5 days ago');
    });

    it('should return formatted date for old dates', () => {
      const date = new Date('2025-01-15');
      const result = formatTimeAgo(date);
      expect(result).toMatch(/Jan 15, 2025/);
    });
  });

  describe('isValidDate', () => {
    it('should return true for valid Date objects', () => {
      expect(isValidDate(new Date())).toBe(true);
      expect(isValidDate(new Date('2026-02-05'))).toBe(true);
    });

    it('should return true for valid date strings', () => {
      expect(isValidDate('2026-02-05')).toBe(true);
      expect(isValidDate('Feb 5, 2026')).toBe(true);
    });

    it('should return false for invalid dates', () => {
      expect(isValidDate('invalid-date')).toBe(false);
      expect(isValidDate(new Date('invalid'))).toBe(false);
      expect(isValidDate('')).toBe(false);
    });

    it('should return false for non-date values', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(isValidDate(null as any)).toBe(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(isValidDate(undefined as any)).toBe(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(isValidDate(123 as any)).toBe(false);
    });
  });
});
