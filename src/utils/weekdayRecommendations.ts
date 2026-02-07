/**
 * Weekday Recommendations Service
 * Shloka Sadhana - Weekday-based Deity/Mantra Recommendations
 *
 * Provides deity and mantra recommendations based on the day of the week
 * according to Hindu tradition.
 */

/**
 * Weekday recommendation data
 */
export interface WeekdayRecommendation {
  weekday: string; // English weekday name
  sanskritWeekday: string; // Sanskrit weekday name
  deity: string; // Deity key (e.g., 'Surya', 'Chandra')
  deityName: string; // Full deity name
  color: string; // Auspicious color for the day
  benefits: string; // Benefits of worshiping on this day
  recommendedMantras: string[]; // Array of recommended shloka IDs
}

/**
 * Weekday to deity mapping
 * Based on Hindu tradition (Navagraha - Nine Planets)
 */
const WEEKDAY_DEITY_MAP: Record<number, string> = {
  0: 'Surya', // Sunday - Sun
  1: 'Chandra', // Monday - Moon
  2: 'Mangal', // Tuesday - Mars
  3: 'Budh', // Wednesday - Mercury
  4: 'Guru', // Thursday - Jupiter
  5: 'Shukra', // Friday - Venus
  6: 'Shani', // Saturday - Saturn
};

/**
 * Detailed weekday recommendations
 */
const WEEKDAY_RECOMMENDATIONS: Record<number, WeekdayRecommendation> = {
  0: {
    // Sunday
    weekday: 'Sunday',
    sanskritWeekday: 'Ravivar',
    deity: 'Surya',
    deityName: 'Lord Surya (Sun God)',
    color: 'Red',
    benefits:
      'Worshiping Lord Surya on Sunday brings vitality, confidence, success in leadership, and removes obstacles.',
    recommendedMantras: ['gayatri-mantra', 'surya-mantra'],
  },
  1: {
    // Monday
    weekday: 'Monday',
    sanskritWeekday: 'Somvar',
    deity: 'Chandra',
    deityName: 'Lord Chandra (Moon God)',
    color: 'White',
    benefits:
      'Worshiping Lord Chandra (Moon) on Monday brings peace of mind, emotional balance, and mental clarity.',
    recommendedMantras: ['om-namah-shivaya', 'chandra-mantra'],
  },
  2: {
    // Tuesday
    weekday: 'Tuesday',
    sanskritWeekday: 'Mangalvar',
    deity: 'Mangal',
    deityName: 'Lord Mangal (Mars)',
    color: 'Red',
    benefits:
      'Worshiping Lord Mangal (Mars) on Tuesday brings courage, strength, victory over enemies, and removes obstacles.',
    recommendedMantras: ['hanuman-chalisa', 'mangal-mantra'],
  },
  3: {
    // Wednesday
    weekday: 'Wednesday',
    sanskritWeekday: 'Budhvar',
    deity: 'Budh',
    deityName: 'Lord Budh (Mercury)',
    color: 'Green',
    benefits:
      'Worshiping Lord Budh (Mercury) on Wednesday brings intelligence, communication skills, and success in education.',
    recommendedMantras: ['gayatri-mantra', 'budh-mantra'],
  },
  4: {
    // Thursday
    weekday: 'Thursday',
    sanskritWeekday: 'Guruvar',
    deity: 'Guru',
    deityName: 'Lord Guru (Jupiter)',
    color: 'Yellow',
    benefits:
      'Worshiping Lord Guru (Jupiter) on Thursday brings wisdom, prosperity, knowledge, and spiritual growth.',
    recommendedMantras: ['vishnu-sahasranamam', 'guru-mantra'],
  },
  5: {
    // Friday
    weekday: 'Friday',
    sanskritWeekday: 'Shukravar',
    deity: 'Shukra',
    deityName: 'Lord Shukra (Venus)',
    color: 'White',
    benefits:
      'Worshiping Lord Shukra (Venus) on Friday brings love, beauty, harmony, wealth, and artistic abilities.',
    recommendedMantras: ['lakshmi-mantra', 'shukra-mantra'],
  },
  6: {
    // Saturday
    weekday: 'Saturday',
    sanskritWeekday: 'Shanivar',
    deity: 'Shani',
    deityName: 'Lord Shani (Saturn)',
    color: 'Black',
    benefits:
      'Worshiping Lord Shani (Saturn) on Saturday brings discipline, patience, removes karmic obstacles, and provides protection.',
    recommendedMantras: ['hanuman-chalisa', 'shani-mantra'],
  },
};

/**
 * Get the deity associated with a weekday
 * @param weekday - Day of week (0-6, where 0 = Sunday)
 * @returns Deity name
 */
export const getWeekdayDeity = (weekday: number): string => {
  if (weekday >= 0 && weekday <= 6) {
    return WEEKDAY_DEITY_MAP[weekday];
  }
  return 'Unknown';
};

/**
 * Get recommendation for a specific weekday
 * @param weekday - Day of week (0-6, where 0 = Sunday)
 * @returns Weekday recommendation or null
 */
export const getWeekdayRecommendation = (
  weekday: number
): WeekdayRecommendation | null => {
  if (weekday >= 0 && weekday <= 6) {
    return WEEKDAY_RECOMMENDATIONS[weekday];
  }
  return null;
};

/**
 * Get recommended shloka IDs for a specific weekday
 * @param weekday - Day of week (0-6, where 0 = Sunday)
 * @returns Array of shloka IDs
 */
export const getRecommendedShlokas = (weekday: number): string[] => {
  const recommendation = getWeekdayRecommendation(weekday);
  return recommendation?.recommendedMantras || [];
};

/**
 * Get recommendation for today
 * @returns Today's weekday recommendation
 */
export const getTodayRecommendation = (): WeekdayRecommendation | null => {
  const today = new Date();
  return getWeekdayRecommendation(today.getDay());
};

/**
 * Get recommendation for a specific date
 * @param date - ISO date string (YYYY-MM-DD)
 * @returns Weekday recommendation for the date
 */
export const getRecommendationForDate = (
  date: string
): WeekdayRecommendation | null => {
  const dateObj = new Date(date + 'T12:00:00Z'); // Use noon UTC to avoid timezone issues
  return getWeekdayRecommendation(dateObj.getDay());
};
