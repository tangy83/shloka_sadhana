/**
 * Date Utilities
 * Shloka Sadhana - Date formatting, parsing, and manipulation
 *
 * All dates are stored in ISO format (YYYY-MM-DD) for consistency
 * Uses date-fns for reliable date operations
 */

import {
  format,
  isValid,
  differenceInDays,
  addDays as addDaysFns,
  subDays,
  startOfDay,
  endOfDay,
  isToday as isTodayFns,
  isYesterday as isYesterdayFns,
  isSameDay as isSameDayFns,
} from 'date-fns';

/**
 * Date or date string input type
 */
type DateInput = Date | string;

/**
 * Convert DateInput to Date object
 */
const toDate = (date: DateInput): Date => {
  if (date instanceof Date) {
    return date;
  }
  return new Date(date);
};

/**
 * Get today's date in ISO format (YYYY-MM-DD)
 * @returns Today's date string
 */
export const getToday = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};

/** Alias for getToday – today in ISO format (YYYY-MM-DD). Used by useStreak and tests. */
export const getTodayISO = getToday;

/**
 * Format date to string
 * @param date Date object or string
 * @param formatStr Format string (default: 'yyyy-MM-dd')
 * @returns Formatted date string
 */
export const formatDate = (
  date: DateInput,
  formatStr: string = 'yyyy-MM-dd'
): string => {
  try {
    const dateObj = toDate(date);
    if (!isValid(dateObj)) {
      return '';
    }
    return format(dateObj, formatStr);
  } catch {
    return '';
  }
};

/**
 * Parse date string to Date object
 * @param dateStr Date string
 * @returns Date object or null if invalid
 */
export const parseDate = (dateStr: string): Date | null => {
  try {
    const date = new Date(dateStr);
    if (!isValid(date)) {
      return null;
    }
    return date;
  } catch {
    return null;
  }
};

/**
 * Check if two dates are the same day
 * @param date1 First date
 * @param date2 Second date
 * @returns True if same day
 */
export const isSameDay = (date1: DateInput, date2: DateInput): boolean => {
  try {
    return isSameDayFns(toDate(date1), toDate(date2));
  } catch {
    return false;
  }
};

/**
 * Check if date is today
 * @param date Date to check
 * @returns True if today
 */
export const isToday = (date: DateInput): boolean => {
  try {
    return isTodayFns(toDate(date));
  } catch {
    return false;
  }
};

/**
 * Check if date is yesterday
 * @param date Date to check
 * @returns True if yesterday
 */
export const isYesterday = (date: DateInput): boolean => {
  try {
    return isYesterdayFns(toDate(date));
  } catch {
    return false;
  }
};

/**
 * Get number of days between two dates
 * @param startDate Start date
 * @param endDate End date
 * @returns Number of days (positive if endDate is after startDate)
 */
export const getDaysBetween = (
  startDate: DateInput,
  endDate: DateInput
): number => {
  try {
    return differenceInDays(toDate(endDate), toDate(startDate));
  } catch {
    return 0;
  }
};

/**
 * Add days to a date
 * @param date Date
 * @param days Number of days to add
 * @returns New date
 */
export const addDays = (date: DateInput, days: number): Date => {
  return addDaysFns(toDate(date), days);
};

/**
 * Subtract days from a date
 * @param date Date
 * @param days Number of days to subtract
 * @returns New date
 */
export const subtractDays = (date: DateInput, days: number): Date => {
  return subDays(toDate(date), days);
};

/**
 * Get start of day (00:00:00.000)
 * @param date Date
 * @returns Date at start of day
 */
export const getStartOfDay = (date: DateInput): Date => {
  return startOfDay(toDate(date));
};

/**
 * Get end of day (23:59:59.999)
 * @param date Date
 * @returns Date at end of day
 */
export const getEndOfDay = (date: DateInput): Date => {
  return endOfDay(toDate(date));
};

/**
 * Format time ago string (e.g., "5 minutes ago", "2 days ago")
 * @param date Date
 * @returns Time ago string
 */
export const formatTimeAgo = (date: DateInput): string => {
  try {
    const dateObj = toDate(date);
    const now = new Date();
    const diffInMs = now.getTime() - dateObj.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    // Just now (< 1 minute)
    if (diffInMinutes < 1) {
      return 'just now';
    }

    // Minutes ago (< 1 hour)
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    }

    // Hours ago (< 1 day)
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    }

    // Yesterday
    if (isYesterdayFns(dateObj)) {
      return 'yesterday';
    }

    // Days ago (< 7 days)
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    }

    // Older dates: format as date
    return format(dateObj, 'MMM dd, yyyy');
  } catch {
    return '';
  }
};

/**
 * Check if value is a valid date
 * @param value Value to check
 * @returns True if valid date
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isValidDate = (value: any): boolean => {
  if (!value) {
    return false;
  }

  // Reject numbers (timestamps should be explicitly converted to Date)
  if (typeof value === 'number') {
    return false;
  }

  try {
    const date = value instanceof Date ? value : new Date(value);
    return isValid(date);
  } catch {
    return false;
  }
};
