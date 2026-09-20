/**
 * Festivals Utility
 * Shloka Sadhana - V3 Feature #3
 *
 * Utility functions for loading and filtering Hindu festival data
 */

import festivalsData from '@/data/festivals.json';

/**
 * Festival interface matching the JSON structure
 */
export interface Festival {
  name: string;
  date: string; // ISO format YYYY-MM-DD
  category: string;
  deity_association: string;
  description: string;
  recommended_shlokas?: string[];
  fasting_guidelines?: string;
  regional_variations?: string;
}

/**
 * Type for the festivals JSON data structure
 */
interface FestivalsData {
  metadata: {
    title: string;
    coverage: string;
    total_festivals: number;
  };
  festivals: Festival[];
}

/**
 * Load all festivals from JSON data
 * @returns Array of all festivals
 */
export function getAllFestivals(): Festival[] {
  const data = festivalsData as FestivalsData;
  return data.festivals;
}

/**
 * Get upcoming festivals (dates >= today)
 * @param today - Reference date in ISO format (YYYY-MM-DD)
 * @param limit - Optional limit on number of results
 * @returns Array of upcoming festivals, sorted by date (earliest first)
 */
export function getUpcomingFestivals(today: string, limit?: number): Festival[] {
  const allFestivals = getAllFestivals();

  const upcoming = allFestivals
    .filter(festival => festival.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (limit) {
    return upcoming.slice(0, limit);
  }

  return upcoming;
}

/**
 * Get past festivals (dates < today)
 * @param today - Reference date in ISO format (YYYY-MM-DD)
 * @param limit - Optional limit on number of results
 * @returns Array of past festivals, sorted by date (most recent first)
 */
export function getPastFestivals(today: string, limit?: number): Festival[] {
  const allFestivals = getAllFestivals();

  const past = allFestivals
    .filter(festival => festival.date < today)
    .sort((a, b) => b.date.localeCompare(a.date)); // Reverse sort for most recent first

  if (limit) {
    return past.slice(0, limit);
  }

  return past;
}

/**
 * Get festivals within a date range (inclusive)
 * @param startDate - Start date in ISO format (YYYY-MM-DD)
 * @param endDate - End date in ISO format (YYYY-MM-DD)
 * @returns Array of festivals in range, sorted by date (earliest first)
 */
export function getFestivalsInRange(startDate: string, endDate: string): Festival[] {
  const allFestivals = getAllFestivals();

  return allFestivals
    .filter(festival => festival.date >= startDate && festival.date <= endDate)
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Find a festival by exact name match
 * @param name - Festival name (case-sensitive)
 * @returns Festival object if found, null otherwise
 */
export function getFestivalByName(name: string): Festival | null {
  const allFestivals = getAllFestivals();
  const found = allFestivals.find(festival => festival.name === name);

  return found || null;
}

/**
 * Find a festival by exact name AND date.
 *
 * Festival names repeat across the dataset's multi-year span (e.g. Karva Chauth
 * occurs in 2025, 2026 and 2027), so name alone is ambiguous. Use this — not
 * getFestivalByName — whenever a specific occurrence is meant.
 *
 * @param name - Festival name (case-sensitive)
 * @param date - Occurrence date in ISO format (YYYY-MM-DD)
 * @returns Festival object if found, null otherwise
 */
export function getFestivalByNameAndDate(name: string, date: string): Festival | null {
  const allFestivals = getAllFestivals();
  const found = allFestivals.find(
    festival => festival.name === name && festival.date === date
  );

  return found || null;
}
