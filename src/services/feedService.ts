/**
 * Feed Service
 * Shloka Sadhana - Phase 2A: Engagement Core
 *
 * Generates personalized home feed using relevance scoring algorithm
 */

import {
  FeedSection,
  FeedSectionType,
  FeedContext,
  FeedConfig,
  FeedSectionBoost,
  FEED_BASE_SCORES,
  DEFAULT_FEED_CONFIG,
} from '@/types/feed';

/**
 * Feed Service Class
 * Handles feed generation and section scoring
 */
class FeedService {
  /**
   * Generate personalized feed for user
   * Returns sorted array of feed sections based on relevance scores
   */
  generatePersonalizedFeed(
    context: FeedContext,
    config: FeedConfig = DEFAULT_FEED_CONFIG
  ): FeedSection[] {
    const sections: FeedSection[] = [];

    // Generate all applicable sections
    const sectionTypes = this.getApplicableSections(context);

    sectionTypes.forEach((type) => {
      const section = this.createFeedSection(type, context, config);
      if (section && section.score >= config.minScore) {
        sections.push(section);
      }
    });

    // Sort by score (descending)
    sections.sort((a, b) => b.score - a.score);

    // Limit to maxSections
    return sections.slice(0, config.maxSections);
  }

  /**
   * Get applicable section types for current context
   * Some sections only appear under certain conditions
   */
  private getApplicableSections(context: FeedContext): FeedSectionType[] {
    const sections: FeedSectionType[] = [
      'verse_of_day',
      'hindu_calendar',
      'daily_wisdom',
    ];

    // Resume practice (if session exists - will be checked in component)
    sections.push('resume_practice');

    // Daily quest (always show if active quest exists)
    if (context.hasActiveQuest) {
      sections.push('daily_quest');
    }

    // Streak recovery (if streak broken <24h ago)
    if (
      context.currentStreak === 0 &&
      context.lastPracticedDate &&
      this.isWithinLast24Hours(context.lastPracticedDate)
    ) {
      sections.push('streak_recovery');
    }

    // Achievement progress (if any near-complete)
    if (context.nearCompleteAchievements > 0) {
      sections.push('achievement_progress');
    }

    // Recommended shloka (always show)
    sections.push('recommended_shloka');

    // Recently practiced (if any history)
    if (context.recentlyPracticed && context.recentlyPracticed.length > 0) {
      sections.push('recently_practiced');
    }

    // Friend activity (Week 16+)
    if (context.hasFriends && context.newFriendActivity) {
      sections.push('friend_activity');
    }

    // Group challenge (Week 17+)
    if (context.hasGroups && context.activeGroupChallenge) {
      sections.push('group_challenge');
    }

    return sections;
  }

  /**
   * Create feed section with calculated score
   */
  private createFeedSection(
    type: FeedSectionType,
    context: FeedContext,
    config: FeedConfig
  ): FeedSection | null {
    const baseScore = FEED_BASE_SCORES[type];
    const boosts = this.calculateSectionBoosts(type, context);

    // Apply boosts
    let score = baseScore;
    boosts.forEach((boost) => {
      score += boost.score;
    });

    // Don't show sections with negative final score
    if (score < 0) {
      return null;
    }

    return {
      id: `${type}_${Date.now()}`,
      type,
      score,
      data: this.getSectionData(type, context),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Calculate score boosts for a section based on context
   * This is the core personalization algorithm
   */
  private calculateSectionBoosts(
    type: FeedSectionType,
    context: FeedContext
  ): FeedSectionBoost[] {
    const boosts: FeedSectionBoost[] = [];

    switch (type) {
      case 'daily_quest':
        // Boost if not completed today
        if (!context.completedQuestToday) {
          boosts.push({
            condition: 'quest_incomplete',
            score: 30,
            reason: "You haven't completed your quest today",
          });
        }

        // Boost if close to completion
        if (context.questProgress && context.questProgress >= 0.7) {
          boosts.push({
            condition: 'quest_near_complete',
            score: 20,
            reason: 'Almost done with your quest!',
          });
        }
        break;

      case 'streak_recovery':
        // High priority if long streak was broken
        if (context.currentStreak === 0) {
          // Check previous streak (would need to be passed in context)
          boosts.push({
            condition: 'streak_broken',
            score: 40,
            reason: 'Your streak was broken - start a new one!',
          });
        }
        break;

      case 'achievement_progress':
        // Boost based on how many achievements are near complete
        const nearCount = context.nearCompleteAchievements;
        if (nearCount >= 3) {
          boosts.push({
            condition: 'many_near_achievements',
            score: 40,
            reason: `${nearCount} achievements almost unlocked!`,
          });
        } else if (nearCount > 0) {
          boosts.push({
            condition: 'some_near_achievements',
            score: 20,
            reason: `${nearCount} achievement${nearCount > 1 ? 's' : ''} close to unlock`,
          });
        }
        break;

      case 'recommended_shloka':
        // Boost if preferred deity matches (would need deity info in context)
        if (context.preferredDeity) {
          boosts.push({
            condition: 'deity_match',
            score: 20,
            reason: 'Matches your preferred deity',
          });
        }

        // Boost based on time of day
        const hour = context.currentHour;
        if (hour >= 4 && hour < 6) {
          // Brahma Muhurta
          boosts.push({
            condition: 'brahma_muhurta',
            score: 30,
            reason: 'Perfect time for morning practice',
          });
        } else if (hour >= 6 && hour < 12) {
          // Morning
          boosts.push({
            condition: 'morning',
            score: 15,
            reason: 'Good for morning practice',
          });
        } else if (hour >= 17 && hour < 19) {
          // Evening
          boosts.push({
            condition: 'evening',
            score: 15,
            reason: 'Perfect for evening practice',
          });
        }

        // Boost if special day
        if (context.isEkadashi) {
          boosts.push({
            condition: 'ekadashi',
            score: 25,
            reason: "Today's Ekadashi - auspicious for practice",
          });
        }
        if (context.isFestival) {
          boosts.push({
            condition: 'festival',
            score: 20,
            reason: 'Special festival recommendation',
          });
        }
        break;

      case 'recently_practiced':
        // Boost if user practices frequently
        if (context.currentStreak >= 7) {
          boosts.push({
            condition: 'active_practitioner',
            score: 15,
            reason: 'Quick access to favorites',
          });
        }
        break;

      case 'friend_activity':
        // Boost if new activity
        if (context.newFriendActivity) {
          boosts.push({
            condition: 'new_activity',
            score: 25,
            reason: 'Friends have new updates',
          });
        }
        break;

      case 'group_challenge':
        // Boost if active challenge
        if (context.activeGroupChallenge) {
          boosts.push({
            condition: 'active_challenge',
            score: 30,
            reason: 'Group challenge in progress',
          });
        }
        break;

      // Static sections get no boosts (use base score only)
      case 'verse_of_day':
      case 'hindu_calendar':
      case 'daily_wisdom':
      case 'resume_practice':
        break;
    }

    return boosts;
  }

  /**
   * Get section-specific data
   * This can be expanded per section type
   */
  private getSectionData(type: FeedSectionType, context: FeedContext): any {
    switch (type) {
      case 'recommended_shloka':
        return {
          preferredDeity: context.preferredDeity,
          currentHour: context.currentHour,
          isEkadashi: context.isEkadashi,
          isFestival: context.isFestival,
        };

      case 'recently_practiced':
        return {
          shlokaIds: context.recentlyPracticed,
        };

      case 'achievement_progress':
        return {
          count: context.nearCompleteAchievements,
        };

      case 'daily_quest':
        return {
          completed: context.completedQuestToday,
          progress: context.questProgress,
        };

      default:
        return null;
    }
  }

  /**
   * Check if date is within last 24 hours
   */
  private isWithinLast24Hours(dateString: string): boolean {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours < 24;
  }

  /**
   * Check if feed should be refreshed
   * Based on last generation time and refresh interval
   */
  shouldRefreshFeed(
    lastGeneratedAt: string | null,
    config: FeedConfig = DEFAULT_FEED_CONFIG
  ): boolean {
    if (!lastGeneratedAt) return true;

    const lastGenerated = new Date(lastGeneratedAt);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastGenerated.getTime()) / (1000 * 60);

    return diffMinutes >= config.refreshInterval;
  }

  /**
   * Build feed context from user stores
   * Helper function to gather all necessary context
   */
  buildFeedContext(userData: {
    userId: string;
    experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
    preferredDeity?: string;
    dailyTime?: '5-10' | '10-20' | '20+' | 'flexible';
    currentStreak: number;
    totalPractices: number;
    lastPracticedDate: string | null;
    recentlyPracticed: string[];
    hasActiveQuest: boolean;
    completedQuestToday: boolean;
    questProgress?: number;
    nearCompleteAchievements: number;
    hasFriends?: boolean;
    newFriendActivity?: boolean;
    hasGroups?: boolean;
    activeGroupChallenge?: boolean;
    isEkadashi?: boolean;
    isFestival?: boolean;
  }): FeedContext {
    return {
      userId: userData.userId,
      experienceLevel: userData.experienceLevel,
      preferredDeity: userData.preferredDeity,
      dailyTime: userData.dailyTime,
      currentStreak: userData.currentStreak,
      totalPractices: userData.totalPractices,
      lastPracticedDate: userData.lastPracticedDate,
      recentlyPracticed: userData.recentlyPracticed,
      hasActiveQuest: userData.hasActiveQuest,
      completedQuestToday: userData.completedQuestToday,
      questProgress: userData.questProgress,
      nearCompleteAchievements: userData.nearCompleteAchievements,
      hasFriends: userData.hasFriends,
      newFriendActivity: userData.newFriendActivity,
      hasGroups: userData.hasGroups,
      activeGroupChallenge: userData.activeGroupChallenge,
      currentHour: new Date().getHours(),
      isEkadashi: userData.isEkadashi,
      isFestival: userData.isFestival,
    };
  }
}

// Export singleton instance
export const feedService = new FeedService();

// Export class for testing
export { FeedService };
