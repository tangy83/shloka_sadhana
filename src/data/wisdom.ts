/**
 * Wisdom Quotes Data
 * Shloka Sadhana - Spiritual Wisdom Database
 *
 * Collection of spiritual quotes from Hindu scriptures and sages
 */

import wisdomQuotesData from './wisdom_quotes.json';

export interface WisdomQuote {
  id: string;
  text: string;
  text_sanskrit?: string;
  meaning: string;
  author: string;
  source: string;
  source_chapter?: string;
  category: 'dharma' | 'karma' | 'devotion' | 'meditation' | 'wisdom' | 'compassion';
  tags?: string[];
  context?: string;
  practical_application?: string;
}

/**
 * Collection of wisdom quotes from Hindu scriptures
 * Imported from wisdom_quotes.json (100 quotes)
 */
export const wisdomQuotes: WisdomQuote[] = wisdomQuotesData as WisdomQuote[];

/**
 * Get all wisdom quotes
 */
export const getAllWisdomQuotes = (): WisdomQuote[] => {
  return wisdomQuotes;
};

/**
 * Get a random wisdom quote
 */
export const getRandomWisdomQuote = (): WisdomQuote => {
  const randomIndex = Math.floor(Math.random() * wisdomQuotes.length);
  return wisdomQuotes[randomIndex];
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
 * Get wisdom quote of the day (deterministic based on date)
 * Same quote for everyone on the same day
 *
 * @param date - ISO date string (YYYY-MM-DD)
 * @returns WisdomQuote for the day
 */
export const getDailyWisdomQuote = (date: string): WisdomQuote => {
  if (wisdomQuotes.length === 0) {
    throw new Error('No wisdom quotes available');
  }

  // Use date as seed for deterministic selection
  const dayNumber = dateToDayNumber(date);
  const randomValue = seededRandom(dayNumber);
  const index = Math.floor(randomValue * wisdomQuotes.length);

  return wisdomQuotes[index];
};

/**
 * Get wisdom quotes by category
 */
export const getWisdomQuotesByCategory = (category: WisdomQuote['category']): WisdomQuote[] => {
  return wisdomQuotes.filter((quote) => quote.category === category);
};

/**
 * Get wisdom quote by ID
 */
export const getWisdomQuoteById = (id: string): WisdomQuote | undefined => {
  return wisdomQuotes.find((quote) => quote.id === id);
};
