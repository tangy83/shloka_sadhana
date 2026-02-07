/**
 * Verse of the Day Utility
 * Shloka Sadhana - V3 Feature #5
 *
 * Deterministic daily verse selection algorithm
 */

import { getAllShlokas } from '@/data/shlokas';
import { ShlokaSection } from '@/types';

/**
 * Verse of the Day data structure
 */
export interface VerseOfTheDay extends ShlokaSection {
  shlokaId: string;
  shlokaName: string;
  deity: string;
  category?: string;
  sectionId: number;
}

/**
 * Simple seeded pseudo-random number generator
 * Uses date as seed for deterministic selection
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

/**
 * Convert ISO date string to day number (days since epoch)
 */
function dateToDayNumber(dateStr: string): number {
  const date = new Date(dateStr + 'T00:00:00Z');
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date format: ${dateStr}. Expected YYYY-MM-DD`);
  }
  return Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
}

/**
 * Get the Verse of the Day for a given date
 * Uses deterministic algorithm so same date always returns same verse
 *
 * @param date - ISO date string (YYYY-MM-DD)
 * @returns VerseOfTheDay object with verse content and metadata
 */
export function getVerseOfTheDay(date: string): VerseOfTheDay {
  const shlokas = getAllShlokas();

  // Flatten all sections across all shlokas
  const allSections: {
    section: ShlokaSection;
    shlokaId: string;
    shlokaName: string;
    deity: string;
    category?: string;
  }[] = [];

  shlokas.forEach(shloka => {
    shloka.sections.forEach(section => {
      allSections.push({
        section,
        shlokaId: shloka.id,
        shlokaName: shloka.name,
        deity: shloka.deity,
        category: shloka.category,
      });
    });
  });

  if (allSections.length === 0) {
    throw new Error('No shlokas available');
  }

  // Use date as seed for deterministic selection
  const dayNumber = dateToDayNumber(date);
  const randomValue = seededRandom(dayNumber);
  const index = Math.floor(randomValue * allSections.length);

  const selected = allSections[index];

  return {
    ...selected.section,
    shlokaId: selected.shlokaId,
    shlokaName: selected.shlokaName,
    deity: selected.deity,
    category: selected.category,
    sectionId: selected.section.id,
  };
}
