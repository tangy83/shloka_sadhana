/**
 * Hindu Calendar Utilities
 * Shloka Sadhana - Moon phase and Paksha calculations
 *
 * Provides functions for calculating lunar phases, Tithi, and auspicious days
 * Note: These are simplified calculations. Precise Hindu calendar calculations
 * require astronomical ephemeris data and are location-dependent.
 */

import type { MoonPhase } from '@/types';

/**
 * Lunar month duration in days (synodic month)
 */
const LUNAR_MONTH_DAYS = 29.53058867;

/**
 * Known new moon reference date (Unix timestamp)
 * January 20, 2026 at 00:00:00 UTC
 */
const REFERENCE_NEW_MOON = new Date('2026-01-20T00:00:00Z').getTime();

/**
 * Convert Date input to Date object
 */
const toDate = (date: Date | string): Date => {
  if (date instanceof Date) {
    return date;
  }
  return new Date(date);
};

/**
 * Calculate Tithi number (day of lunar month, 0-29)
 * @param date Date to calculate for
 * @returns Tithi number (0 = new moon, 14-15 = full moon)
 */
export const calculateTithiNumber = (date: Date | string): number => {
  const dateObj = toDate(date);
  const timestamp = dateObj.getTime();

  // Calculate days since reference new moon
  const daysSinceNewMoon = (timestamp - REFERENCE_NEW_MOON) / (1000 * 60 * 60 * 24);

  // Calculate position in current lunar month
  const lunarDay = daysSinceNewMoon % LUNAR_MONTH_DAYS;

  // Return tithi number (0-29)
  return Math.floor(lunarDay);
};

/**
 * Get Paksha name based on tithi
 * @param tithiNumber Tithi number (0-29)
 * @returns Paksha name
 */
export const getPakshaName = (tithiNumber: number): string => {
  if (tithiNumber === 0) {
    return 'Amavasya'; // New moon
  }

  if (tithiNumber >= 14 && tithiNumber <= 15) {
    return 'Purnima'; // Full moon
  }

  if (tithiNumber > 0 && tithiNumber < 14) {
    return 'Shukla Paksha'; // Waxing moon
  }

  return 'Krishna Paksha'; // Waning moon
};

/**
 * Get moon phase emoji based on tithi
 * @param tithiNumber Tithi number (0-29)
 * @returns Moon phase emoji
 */
export const getMoonPhaseEmoji = (tithiNumber: number): string => {
  if (tithiNumber === 0) {
    return '🌑'; // New moon
  }

  if (tithiNumber >= 1 && tithiNumber <= 6) {
    return '🌒'; // Waxing crescent
  }

  if (tithiNumber === 7) {
    return '🌓'; // First quarter
  }

  if (tithiNumber >= 8 && tithiNumber <= 13) {
    return '🌔'; // Waxing gibbous
  }

  if (tithiNumber >= 14 && tithiNumber <= 15) {
    return '🌕'; // Full moon
  }

  if (tithiNumber >= 16 && tithiNumber <= 21) {
    return '🌖'; // Waning gibbous
  }

  if (tithiNumber === 22) {
    return '🌗'; // Last quarter
  }

  // tithiNumber >= 23 && tithiNumber <= 29
  return '🌘'; // Waning crescent
};

/**
 * Get moon phase description based on Paksha
 * @param pakshaName Paksha name
 * @returns Description
 */
const getMoonPhaseDescription = (pakshaName: string): string => {
  switch (pakshaName) {
    case 'Amavasya':
      return 'New moon — a time for introspection and new beginnings';
    case 'Purnima':
      return 'Full moon — a time for completion and celebration';
    case 'Shukla Paksha':
      return 'Waxing moon — ideal for growth, learning, and starting new practices';
    case 'Krishna Paksha':
      return 'Waning moon — ideal for reflection, release, and inner work';
    default:
      return 'Auspicious time for spiritual practice';
  }
};

/**
 * Get complete moon phase information
 * @param date Date to calculate for
 * @returns MoonPhase object
 */
export const getMoonPhase = (date: Date | string): MoonPhase => {
  const tithiNumber = calculateTithiNumber(date);
  const pakshaName = getPakshaName(tithiNumber);
  const phaseEmoji = getMoonPhaseEmoji(tithiNumber);

  let name: string;
  if (pakshaName === 'Amavasya') {
    name = 'Amavasya (New Moon)';
  } else if (pakshaName === 'Purnima') {
    name = 'Purnima (Full Moon)';
  } else {
    name = `${pakshaName} (${tithiNumber < 15 ? 'Waxing' : 'Waning'})`;
  }

  return {
    phase: phaseEmoji,
    name,
    desc: getMoonPhaseDescription(pakshaName),
  };
};

/**
 * Check if a day is auspicious for spiritual practice
 * @param date Date to check
 * @returns True if auspicious
 */
export const isAuspiciousDay = (date: Date | string): boolean => {
  const tithiNumber = calculateTithiNumber(date);

  // Purnima (full moon) - very auspicious
  if (tithiNumber >= 14 && tithiNumber <= 15) {
    return true;
  }

  // Ekadashi (11th day) - both Shukla and Krishna paksha
  // Shukla Ekadashi: day 11, Krishna Ekadashi: day 26
  if (tithiNumber === 11 || tithiNumber === 26) {
    return true;
  }

  // Chaturdashi (14th day before Amavasya) - Shiva's day
  if (tithiNumber === 28) {
    return true;
  }

  // Pratipada (1st day after new moon) - new beginnings
  if (tithiNumber === 1) {
    return true;
  }

  // Amavasya (new moon) - traditionally not auspicious for starting,
  // but good for certain spiritual practices
  // We'll return false for simplicity (most people prefer waxing moon)
  if (tithiNumber === 0) {
    return false;
  }

  // Shukla Paksha (waxing) days 2-10, 12-13 - generally auspicious
  if (tithiNumber >= 2 && tithiNumber <= 13 && tithiNumber !== 11) {
    return true;
  }

  // Krishna Paksha (waning) - less auspicious for starting new practices
  // Days 16-25, 27, 29 - not generally recommended for starting
  return false;
};
