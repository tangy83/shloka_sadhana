/**
 * Sankalp Examples
 * Shloka Sadhana - V3 Feature #1
 *
 * Predefined sankalp (intention) examples organized by category
 * to help users set meaningful intentions for their practice
 */

export interface SankalpCategory {
  name: string;
  examples: string[];
}

/**
 * Categorized sankalp examples for user inspiration
 * Following existing pattern: UPPER_SNAKE_CASE for constants
 */
export const SANKALP_EXAMPLES: Record<string, SankalpCategory> = {
  PERSONAL: {
    name: 'Personal',
    examples: [
      'For my spiritual growth and inner peace',
      'For strength and courage to face today\'s challenges',
      'For clarity and wisdom in my decisions',
      'For healing and self-compassion',
    ],
  },
  FAMILY: {
    name: 'Family',
    examples: [
      'For the health and happiness of my family',
      'For my parents\' well-being and long life',
      'For love and harmony in my home',
      'For the success of my children',
    ],
  },
  UNIVERSAL: {
    name: 'Universal',
    examples: [
      'For world peace and the welfare of all beings',
      'For the end of suffering for all living creatures',
      'For compassion and understanding among all people',
      'For the healing of our planet',
    ],
  },
  SPIRITUAL: {
    name: 'Spiritual',
    examples: [
      'As an offering to the Divine',
      'For deeper connection with the Supreme',
      'For spiritual awakening and enlightenment',
      'For devotion and surrender to the divine will',
    ],
  },
} as const;

/**
 * Help text explaining what a sankalp is
 * Displayed to users, especially first-time users
 */
export const SANKALP_HELP_TEXT = {
  SHORT: 'A sankalp is a heartfelt intention you set before practice.',
  FULL: 'A sankalp is a heartfelt intention you set before practice. It dedicates your practice to a person, cause, or your own spiritual growth. You can skip if you prefer.',
} as const;

/**
 * Get all sankalp examples as a flat array (for search, etc.)
 */
export function getAllSankalpExamples(): string[] {
  return Object.values(SANKALP_EXAMPLES).flatMap(category => category.examples);
}

/**
 * Get sankalp examples by category key
 */
export function getSankalpExamplesByCategory(
  categoryKey: keyof typeof SANKALP_EXAMPLES
): string[] {
  return SANKALP_EXAMPLES[categoryKey]?.examples || [];
}
