/**
 * Ekadashi Calendar Utility
 * Shloka Sadhana - V3 Feature #10
 *
 * Loads and processes Ekadashi dates from JSON data
 */

import ekadashiData from '@/data/ekadashi.json';

/**
 * Ekadashi type (flattened from JSON structure)
 */
export interface Ekadashi {
  serial: number;
  name: string;
  name_hindi: string;
  date: string; // ISO format: YYYY-MM-DD
  day?: string;
  paksha: string;
  deity: string;
  significance: string;
  benefits: string;
  vrat_katha: string;
}

/**
 * Get all Ekadashis from JSON data (flattened and sorted)
 */
export function getAllEkadashis(): Ekadashi[] {
  const ekadashis: Ekadashi[] = [];

  // Flatten month-based structure into single array
  for (const month of ekadashiData.months) {
    for (const ekadashi of month.ekadashis) {
      ekadashis.push(ekadashi);
    }
  }

  // Sort by date (earliest first)
  ekadashis.sort((a, b) => a.date.localeCompare(b.date));

  return ekadashis;
}

/**
 * Get upcoming Ekadashis from a given date
 * @param today - Reference date in ISO format (YYYY-MM-DD)
 * @param limit - Maximum number of results (default: 12)
 */
export function getUpcomingEkadashis(today: string, limit: number = 12): Ekadashi[] {
  const allEkadashis = getAllEkadashis();

  // Filter dates >= today
  const upcoming = allEkadashis.filter(ekadashi => ekadashi.date >= today);

  // Sort by date (earliest first) - already sorted, but ensure
  upcoming.sort((a, b) => a.date.localeCompare(b.date));

  // Limit results
  return upcoming.slice(0, limit);
}

/**
 * Check if a given date is an Ekadashi
 * @param date - Date in ISO format (YYYY-MM-DD)
 */
export function checkIfEkadashi(date: string): boolean {
  const allEkadashis = getAllEkadashis();
  return allEkadashis.some(ekadashi => ekadashi.date === date);
}

/**
 * Get Ekadashi details for a specific date
 * @param date - Date in ISO format (YYYY-MM-DD)
 * @returns Ekadashi object or null if not an Ekadashi date
 */
export function getEkadashiByDate(date: string): Ekadashi | null {
  const allEkadashis = getAllEkadashis();
  const ekadashi = allEkadashis.find(e => e.date === date);
  return ekadashi || null;
}

/**
 * Get the next Ekadashi from a given date
 * @param today - Reference date in ISO format (YYYY-MM-DD)
 * @returns Next Ekadashi (throws if none found)
 */
export function getNextEkadashi(today: string): Ekadashi {
  const allEkadashis = getAllEkadashis();

  // Find first Ekadashi with date > today
  const next = allEkadashis.find(ekadashi => ekadashi.date > today);

  if (!next) {
    throw new Error(`No Ekadashi found after ${today}`);
  }

  return next;
}
