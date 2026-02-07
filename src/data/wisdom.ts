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

/*
 * Legacy quotes array removed - now using JSON import
 * Old quotes kept below for reference only (commented out)
 */
/* const legacyQuotes: WisdomQuote[] = [
  {
    id: 'bhagavad-gita-2-47',
    text: 'You have the right to perform your prescribed duty, but you are not entitled to the fruits of action. Never consider yourself the cause of the results of your activities, and never be attached to not doing your duty.',
    text_sanskrit: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥',
    meaning: 'This verse teaches the principle of Nishkama Karma - performing one\'s duty without attachment to results. It emphasizes action over outcome, encouraging dedication to dharma while remaining detached from success or failure.',
    author: 'Lord Krishna',
    source: 'Bhagavad Gita 2:47',
    source_chapter: 'Chapter 2: Sankhya Yoga',
    category: 'karma',
    tags: ['duty', 'detachment', 'karma-yoga', 'action'],
    context: 'Krishna instructs Arjuna on the battlefield, teaching him the essence of selfless action.',
    practical_application: 'Focus on your efforts and responsibilities rather than worrying about outcomes. Do your best work without being anxious about results.',
  },
  {
    id: 'bhagavad-gita-6-5',
    text: 'One must elevate, not degrade, oneself by one\'s own mind. The mind alone is one\'s friend as well as one\'s enemy.',
    meaning: 'The mind can be our greatest ally or our worst enemy. Through self-discipline and positive thinking, we can elevate ourselves spiritually.',
    author: 'Lord Krishna',
    source: 'Bhagavad Gita 6:5',
    category: 'wisdom',
  },
  {
    id: 'bhagavad-gita-12-13',
    text: 'One who is not envious but is a kind friend to all living entities, who does not think himself a proprietor and is free from false ego, who is equal in both happiness and distress, who is tolerant, always satisfied, self-controlled, and engaged in devotional service with determination, his mind and intelligence fixed on Me—such a devotee of Mine is very dear to Me.',
    meaning: 'Krishna describes the qualities of a true devotee: compassion, humility, equanimity, tolerance, contentment, and unwavering devotion.',
    author: 'Lord Krishna',
    source: 'Bhagavad Gita 12:13-14',
    category: 'devotion',
  },
  {
    id: 'upanishad-1',
    text: 'From the unreal lead me to the real. From darkness lead me to light. From death lead me to immortality.',
    meaning: 'A profound prayer seeking divine guidance from illusion to truth, ignorance to knowledge, and mortality to eternal consciousness.',
    author: 'Ancient Sage',
    source: 'Brihadaranyaka Upanishad',
    category: 'wisdom',
  },
  {
    id: 'yoga-sutra-1',
    text: 'Yoga is the cessation of the modifications of the mind.',
    meaning: 'Yoga is achieved when the fluctuations of the mind are stilled, allowing us to rest in our true nature.',
    author: 'Patanjali',
    source: 'Yoga Sutras 1.2',
    category: 'meditation',
  },
  {
    id: 'ramayana-1',
    text: 'Truth is the foundation of all virtues.',
    meaning: 'Truthfulness is the cornerstone of dharma. All other virtues stem from and are supported by truth.',
    author: 'Lord Rama',
    source: 'Ramayana',
    category: 'dharma',
  },
  {
    id: 'bhagavad-gita-18-66',
    text: 'Abandon all varieties of religion and just surrender unto Me. I shall deliver you from all sinful reactions. Do not fear.',
    meaning: 'Krishna\'s ultimate teaching: complete surrender to the Divine brings liberation from all karmic bonds and fears.',
    author: 'Lord Krishna',
    source: 'Bhagavad Gita 18:66',
    category: 'devotion',
  },
  {
    id: 'buddha-quote',
    text: 'Hatred does not cease by hatred, but only by love; this is the eternal rule.',
    meaning: 'Animosity cannot be overcome with more animosity. Only love and compassion can break the cycle of hatred.',
    author: 'Buddha',
    source: 'Dhammapada',
    category: 'compassion',
  },
  {
    id: 'vivekananda-1',
    text: 'Arise, awake, and stop not until the goal is reached.',
    meaning: 'A call to action and perseverance. Wake up to your spiritual potential and pursue your highest goals with unwavering determination.',
    author: 'Swami Vivekananda',
    source: 'Katha Upanishad',
    category: 'wisdom',
  },
  {
    id: 'bhagavad-gita-4-7',
    text: 'Whenever there is a decline in righteousness and an increase in unrighteousness, O Arjuna, at that time I manifest myself on earth.',
    meaning: 'God takes form whenever dharma declines, to restore balance and guide humanity back to righteousness.',
    author: 'Lord Krishna',
    source: 'Bhagavad Gita 4:7',
    category: 'dharma',
  },
]; */

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
