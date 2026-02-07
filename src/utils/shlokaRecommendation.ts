/**
 * Shloka Recommendation Utility
 * Shloka Sadhana - V3 Feature #6
 *
 * Intelligent shloka recommendation based on:
 * - Day of week (deity associations)
 * - Special days (Ekadashi, festivals)
 * - User practice history
 */

import { getAllShlokas } from '@/data/shlokas';
import { Shloka } from '@/types';
import { checkIfEkadashi } from './ekadashiCalendar';

/**
 * Recommendation reason type
 */
export type RecommendationReason = string;

/**
 * Shloka recommendation with reason
 */
export interface ShlokaRecommendation {
  shloka: Shloka;
  reason: RecommendationReason;
}

/**
 * Deity associations for each day of the week
 * Based on Hindu tradition
 */
const WEEKDAY_DEITIES: Record<number, { deity: string; reason: string }> = {
  0: { deity: 'surya', reason: 'Sunday is dedicated to Lord Surya (Sun God)' }, // Sunday
  1: { deity: 'shiva', reason: 'Monday is sacred to Lord Shiva' }, // Monday
  2: { deity: 'ganesha', reason: 'Tuesday is auspicious for Lord Ganesha and Hanuman' }, // Tuesday
  3: { deity: 'ganesha', reason: 'Wednesday is dedicated to Lord Ganesha' }, // Wednesday
  4: { deity: 'vishnu', reason: 'Thursday is sacred to Lord Vishnu and Brihaspati (Jupiter)' }, // Thursday
  5: { deity: 'durga', reason: 'Friday is auspicious for Goddess Durga and Lakshmi' }, // Friday
  6: { deity: 'hanuman', reason: 'Saturday is dedicated to Lord Hanuman and Shani (Saturn)' }, // Saturday
};

/**
 * Simple seeded pseudo-random number generator
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

/**
 * Convert ISO date string to day number
 */
function dateToDayNumber(dateStr: string): number {
  const date = new Date(dateStr + 'T00:00:00Z');
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date format: ${dateStr}. Expected YYYY-MM-DD`);
  }
  return Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
}

/**
 * Get day of week from ISO date string (0 = Sunday)
 */
function getDayOfWeek(dateStr: string): number {
  const date = new Date(dateStr + 'T00:00:00Z');
  return date.getUTCDay();
}

/**
 * Find shlokas matching a deity (case-insensitive partial match)
 */
function findShlokasByDeity(deity: string): Shloka[] {
  const shlokas = getAllShlokas();
  const lowerDeity = deity.toLowerCase();

  return shlokas.filter(shloka =>
    shloka.deity.toLowerCase().includes(lowerDeity) ||
    shloka.name.toLowerCase().includes(lowerDeity)
  );
}

/**
 * Get daily recommendation based on date (deity day, festivals, etc.)
 *
 * @param date - ISO date string (YYYY-MM-DD)
 * @returns ShlokaRecommendation with shloka and reason
 */
export function getDailyRecommendation(date: string): ShlokaRecommendation {
  const shlokas = getAllShlokas();

  if (shlokas.length === 0) {
    throw new Error('No shlokas available');
  }

  // Check if it's Ekadashi
  const isEkadashi = checkIfEkadashi(date);
  if (isEkadashi) {
    const vishnuShlokas = findShlokasByDeity('vishnu');
    if (vishnuShlokas.length === 0) {
      vishnuShlokas.push(...findShlokasByDeity('narayana'));
    }

    if (vishnuShlokas.length > 0) {
      // Use date as seed for deterministic selection
      const dayNumber = dateToDayNumber(date);
      const randomValue = seededRandom(dayNumber);
      const index = Math.floor(randomValue * vishnuShlokas.length);

      return {
        shloka: vishnuShlokas[index],
        reason: 'Today is Ekadashi, a sacred day dedicated to Lord Vishnu. Chanting Vishnu mantras on Ekadashi brings immense spiritual benefits.',
      };
    }
  }

  // Get day of week and associated deity
  const dayOfWeek = getDayOfWeek(date);
  const { deity, reason: dayReason } = WEEKDAY_DEITIES[dayOfWeek];

  // Find shlokas for this deity
  let deityShlokas = findShlokasByDeity(deity);

  // Fallback to all shlokas if none found for deity
  if (deityShlokas.length === 0) {
    deityShlokas = shlokas;
  }

  // Use date as seed for deterministic selection
  const dayNumber = dateToDayNumber(date);
  const randomValue = seededRandom(dayNumber);
  const index = Math.floor(randomValue * deityShlokas.length);

  return {
    shloka: deityShlokas[index],
    reason: dayReason,
  };
}

/**
 * Get personalized recommendation based on user's practice history
 *
 * @param date - ISO date string (YYYY-MM-DD)
 * @param practiceHistory - Array of shloka IDs user has practiced
 * @returns ShlokaRecommendation with shloka and reason
 */
export function getRecommendationForUser(
  date: string,
  practiceHistory: string[]
): ShlokaRecommendation {
  const shlokas = getAllShlokas();

  if (shlokas.length === 0) {
    throw new Error('No shlokas available');
  }

  // Start with daily recommendation (deity-based, festival-aware)
  const dailyRec = getDailyRecommendation(date);

  // If user hasn't practiced this shloka yet, recommend it
  if (!practiceHistory.includes(dailyRec.shloka.id)) {
    return dailyRec;
  }

  // Find shlokas user hasn't practiced yet
  const unpracticed = shlokas.filter(
    shloka => !practiceHistory.includes(shloka.id)
  );

  if (unpracticed.length > 0) {
    // Use date as seed to pick from unpracticed
    const dayNumber = dateToDayNumber(date);
    const randomValue = seededRandom(dayNumber + practiceHistory.length);
    const index = Math.floor(randomValue * unpracticed.length);

    return {
      shloka: unpracticed[index],
      reason: 'Expand your practice with this beautiful prayer you haven\'t tried yet.',
    };
  }

  // User has practiced everything - recommend based on least recent
  // For now, just return daily recommendation
  return {
    ...dailyRec,
    reason: dailyRec.reason + ' (You\'ve practiced this before - time to revisit!)',
  };
}
