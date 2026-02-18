/**
 * ML Recommendation Service
 * Shloka Sadhana - Phase 2A: Engagement Core
 *
 * ML-inspired recommendation engine with 5-factor scoring algorithm
 * Learns from user behavior and optimizes for time-of-day, experience, and preferences
 */

import { Shloka } from '@/types/shloka';
import { shlokas } from '@/data/shlokas';

/**
 * Recommendation Context
 * User context for generating recommendations
 */
export interface RecommendationContext {
  // User profile
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  preferredDeity?: string;
  dailyTime?: '5-10' | '10-20' | '20+' | 'flexible';

  // Practice history
  recentlyPracticed: string[]; // Shloka IDs practiced in last 14 days
  totalPractices: number;

  // Time context
  currentHour: number; // 0-23
  currentDay: string; // ISO date string

  // Calendar context
  isEkadashi: boolean;
  isFestival: boolean;
  festivalDeity?: string; // Which deity is being celebrated today
}

/**
 * Shloka Score
 * Calculated relevance score with breakdown
 */
export interface ShlokaScore {
  shloka: Shloka;
  totalScore: number;
  breakdown: {
    timeOfDay: number; // 0-1
    recency: number; // 0-1
    difficulty: number; // 0-1
    deityPreference: number; // 0-1
    contextual: number; // 0-1
  };
  reason: string; // User-facing explanation
}

/**
 * Time of Day Mapping
 * Maps hours to preferred shloka types
 */
const TIME_OF_DAY_PREFERENCES: Record<
  string,
  {
    deities: string[];
    types: string[];
    description: string;
  }
> = {
  brahma_muhurta: {
    // 4:00 AM - 6:00 AM
    deities: ['Gayatri', 'Surya', 'Brahma'],
    types: ['mantra', 'prayer'],
    description: 'Brahma Muhurta - perfect for meditation',
  },
  morning: {
    // 6:00 AM - 12:00 PM
    deities: ['Surya', 'Ganesha', 'Lakshmi'],
    types: ['mantra', 'stotra', 'prayer'],
    description: 'Morning practice',
  },
  afternoon: {
    // 12:00 PM - 4:00 PM
    deities: ['Vishnu', 'Hanuman'],
    types: ['short_mantra'], // Shorter practices for busy afternoon
    description: 'Midday practice',
  },
  evening: {
    // 4:00 PM - 7:00 PM
    deities: ['Shiva', 'Devi', 'Krishna'],
    types: ['stotra', 'chalisa', 'bhajan'],
    description: 'Evening devotion',
  },
  night: {
    // 7:00 PM - 10:00 PM
    deities: ['Vishnu', 'Shiva', 'Devi'],
    types: ['prayer', 'meditation'],
    description: 'Night practice',
  },
};

/**
 * Get time period from hour
 */
function getTimePeriod(hour: number): keyof typeof TIME_OF_DAY_PREFERENCES {
  if (hour >= 4 && hour < 6) return 'brahma_muhurta';
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 16) return 'afternoon';
  if (hour >= 16 && hour < 19) return 'evening';
  return 'night';
}

/**
 * ML Recommendation Service Class
 */
class MLRecommendationService {
  /**
   * Get personalized shloka recommendation
   * Uses 5-factor scoring algorithm
   */
  getRecommendation(context: RecommendationContext): ShlokaScore {
    // Calculate scores for all shlokas
    const scoredShlokas = shlokas.map((shloka) => this.scoreShloka(shloka, context));

    // Sort by total score (descending)
    scoredShlokas.sort((a, b) => b.totalScore - a.totalScore);

    // Return top recommendation
    return scoredShlokas[0];
  }

  /**
   * Get top N recommendations
   */
  getTopRecommendations(context: RecommendationContext, count: number = 3): ShlokaScore[] {
    const scoredShlokas = shlokas.map((shloka) => this.scoreShloka(shloka, context));
    scoredShlokas.sort((a, b) => b.totalScore - a.totalScore);
    return scoredShlokas.slice(0, count);
  }

  /**
   * Score a shloka based on all factors
   * Returns weighted score (0-1)
   */
  private scoreShloka(shloka: Shloka, context: RecommendationContext): ShlokaScore {
    // Calculate individual factor scores (0-1)
    const timeOfDayScore = this.calculateTimeOfDayScore(shloka, context);
    const recencyScore = this.calculateRecencyScore(shloka, context);
    const difficultyScore = this.calculateDifficultyScore(shloka, context);
    const deityScore = this.calculateDeityScore(shloka, context);
    const contextualScore = this.calculateContextualScore(shloka, context);

    // Weighted combination
    const WEIGHTS = {
      timeOfDay: 0.30, // 30% - Time appropriateness
      recency: 0.25, // 25% - Avoid recent repeats
      difficulty: 0.20, // 20% - Match experience level
      deity: 0.15, // 15% - Preference match
      contextual: 0.10, // 10% - Special occasions
    };

    const totalScore =
      timeOfDayScore * WEIGHTS.timeOfDay +
      recencyScore * WEIGHTS.recency +
      difficultyScore * WEIGHTS.difficulty +
      deityScore * WEIGHTS.deity +
      contextualScore * WEIGHTS.contextual;

    // Generate explanation
    const reason = this.generateReason({
      timeOfDay: timeOfDayScore,
      recency: recencyScore,
      difficulty: difficultyScore,
      deity: deityScore,
      contextual: contextualScore,
    }, context);

    return {
      shloka,
      totalScore,
      breakdown: {
        timeOfDay: timeOfDayScore,
        recency: recencyScore,
        difficulty: difficultyScore,
        deityPreference: deityScore,
        contextual: contextualScore,
      },
      reason,
    };
  }

  /**
   * Factor 1: Time of Day Score (30%)
   * Higher score if shloka matches current time preferences
   */
  private calculateTimeOfDayScore(shloka: Shloka, context: RecommendationContext): number {
    const timePeriod = getTimePeriod(context.currentHour);
    const preferences = TIME_OF_DAY_PREFERENCES[timePeriod];

    let score = 0.5; // Base score

    // Check if deity matches time preference
    if (preferences.deities.includes(shloka.deity)) {
      score += 0.3;
    }

    // Brahma Muhurta boost (4-6 AM)
    if (timePeriod === 'brahma_muhurta') {
      score += 0.2; // Extra boost for practicing at auspicious time
    }

    // Duration consideration (afternoon = shorter)
    if (timePeriod === 'afternoon' && shloka.estimatedDuration <= 10) {
      score += 0.2; // Prefer shorter shlokas in afternoon
    }

    return Math.min(score, 1.0); // Cap at 1.0
  }

  /**
   * Factor 2: Recency Score (25%)
   * Higher score if NOT practiced recently (avoid repetition)
   */
  private calculateRecencyScore(shloka: Shloka, context: RecommendationContext): number {
    const recentlyPracticed = context.recentlyPracticed;

    // If never practiced, high score
    if (!recentlyPracticed.includes(shloka.id)) {
      return 1.0;
    }

    // Find how recently practiced (position in array, 0 = most recent)
    const index = recentlyPracticed.indexOf(shloka.id);

    // Score based on how far back (farther = higher score)
    // Most recent (index 0) = 0.1, least recent (index 13) = 0.9
    const score = 0.1 + (index / 14) * 0.8;

    return score;
  }

  /**
   * Factor 3: Difficulty Score (20%)
   * Higher score if difficulty matches experience level
   */
  private calculateDifficultyScore(shloka: Shloka, context: RecommendationContext): number {
    if (!context.experienceLevel) return 0.5; // Default if no preference

    const { experienceLevel } = context;

    // Duration-based difficulty mapping
    const difficulty = this.estimateDifficulty(shloka);

    // Perfect match
    if (difficulty === experienceLevel) {
      return 1.0;
    }

    // Adjacent level (beginner→intermediate or intermediate→advanced)
    if (
      (difficulty === 'beginner' && experienceLevel === 'intermediate') ||
      (difficulty === 'intermediate' && experienceLevel === 'beginner') ||
      (difficulty === 'intermediate' && experienceLevel === 'advanced') ||
      (difficulty === 'advanced' && experienceLevel === 'intermediate')
    ) {
      return 0.6;
    }

    // Opposite ends (beginner→advanced or advanced→beginner)
    return 0.3;
  }

  /**
   * Estimate shloka difficulty based on duration
   */
  private estimateDifficulty(shloka: Shloka): 'beginner' | 'intermediate' | 'advanced' {
    if (shloka.estimatedDuration <= 10) return 'beginner';
    if (shloka.estimatedDuration <= 20) return 'intermediate';
    return 'advanced';
  }

  /**
   * Factor 4: Deity Preference Score (15%)
   * Higher score if matches preferred deity
   */
  private calculateDeityScore(shloka: Shloka, context: RecommendationContext): number {
    if (!context.preferredDeity) return 0.5; // Default if no preference

    // Perfect match
    if (shloka.deity === context.preferredDeity) {
      return 1.0;
    }

    // Related deities (same family/tradition)
    const relatedDeities: Record<string, string[]> = {
      Shiva: ['Parvati', 'Ganesha', 'Kartikeya'],
      Vishnu: ['Lakshmi', 'Krishna', 'Rama', 'Hanuman'],
      Devi: ['Lakshmi', 'Saraswati', 'Durga', 'Kali'],
      Ganesha: ['Shiva', 'Parvati'],
    };

    const related = relatedDeities[context.preferredDeity] || [];
    if (related.includes(shloka.deity)) {
      return 0.7; // Partial match for related deities
    }

    return 0.4; // Lower score for unrelated deity
  }

  /**
   * Factor 5: Contextual Score (10%)
   * Higher score for special occasions (Ekadashi, festivals)
   */
  private calculateContextualScore(shloka: Shloka, context: RecommendationContext): number {
    let score = 0.5; // Base score

    // Ekadashi boost for Vishnu-related shlokas
    if (context.isEkadashi) {
      const vishnuDeities = ['Vishnu', 'Krishna', 'Rama', 'Hanuman', 'Lakshmi'];
      if (vishnuDeities.includes(shloka.deity)) {
        score += 0.4;
      }
    }

    // Festival boost for matching deity
    if (context.isFestival && context.festivalDeity === shloka.deity) {
      score += 0.5;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Generate user-facing explanation for recommendation
   * Picks the highest-scoring factor as primary reason
   */
  private generateReason(
    scores: {
      timeOfDay: number;
      recency: number;
      difficulty: number;
      deity: number;
      contextual: number;
    },
    context: RecommendationContext
  ): string {
    // Find highest scoring factor
    const factors = [
      { name: 'timeOfDay', score: scores.timeOfDay },
      { name: 'recency', score: scores.recency },
      { name: 'difficulty', score: scores.difficulty },
      { name: 'deity', score: scores.deity },
      { name: 'contextual', score: scores.contextual },
    ];

    factors.sort((a, b) => b.score - a.score);
    const topFactor = factors[0].name;

    // Generate explanation based on top factor
    switch (topFactor) {
      case 'timeOfDay':
        const timePeriod = getTimePeriod(context.currentHour);
        return TIME_OF_DAY_PREFERENCES[timePeriod].description;

      case 'recency':
        return 'A new shloka to explore';

      case 'difficulty':
        return `Matches your ${context.experienceLevel} level`;

      case 'deity':
        return `Dedicated to ${context.preferredDeity}`;

      case 'contextual':
        if (context.isEkadashi) return "Perfect for today's Ekadashi";
        if (context.isFestival) return 'Special for the festival';
        return 'Recommended for you';

      default:
        return 'Recommended for you';
    }
  }
}

// Export singleton instance
export const mlRecommendationService = new MLRecommendationService();

// Export class for testing
export { MLRecommendationService };
