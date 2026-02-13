/**
 * Achievement Service
 * Shloka Sadhana - Phase 2A: Engagement Core
 *
 * Manages achievement definitions, checking, and unlocking across 6 categories
 */

import {
  Achievement,
  AchievementCategory,
  AchievementRarity,
  AchievementCheckResult,
  AchievementProgress,
  ACHIEVEMENT_MILESTONES,
} from '@/types/achievements';
import { PracticeStats } from '@/types/practice';
import { QuestStats } from '@/types/quests';

/**
 * Complete achievement definitions
 * 30+ achievements across 6 categories
 */
export const ACHIEVEMENTS: Achievement[] = [
  // STREAK CATEGORY (7 achievements)
  {
    id: 'streak_7',
    category: 'streak',
    name: '7 Day Devotee',
    description: 'Practice for 7 consecutive days',
    icon: '🔥',
    target: 7,
    xpReward: 50,
    rarity: 'common',
  },
  {
    id: 'streak_14',
    category: 'streak',
    name: 'Fortnight Faithful',
    description: 'Practice for 14 consecutive days',
    icon: '🔥',
    target: 14,
    xpReward: 100,
    rarity: 'common',
  },
  {
    id: 'streak_21',
    category: 'streak',
    name: 'Three Week Warrior',
    description: 'Practice for 21 consecutive days',
    icon: '🔥',
    target: 21,
    xpReward: 150,
    rarity: 'rare',
  },
  {
    id: 'streak_30',
    category: 'streak',
    name: 'Monthly Master',
    description: 'Practice for 30 consecutive days',
    icon: '🔥',
    target: 30,
    xpReward: 250,
    rarity: 'rare',
  },
  {
    id: 'streak_50',
    category: 'streak',
    name: 'Unwavering Spirit',
    description: 'Practice for 50 consecutive days',
    icon: '🔥',
    target: 50,
    xpReward: 400,
    rarity: 'epic',
  },
  {
    id: 'streak_100',
    category: 'streak',
    name: 'Century of Devotion',
    description: 'Practice for 100 consecutive days',
    icon: '🔥',
    target: 100,
    xpReward: 1000,
    rarity: 'epic',
  },
  {
    id: 'streak_365',
    category: 'streak',
    name: 'Year-Long Sadhak',
    description: 'Practice for 365 consecutive days',
    icon: '🏆',
    target: 365,
    xpReward: 5000,
    rarity: 'legendary',
    isSecret: true,
  },

  // PRACTICE CATEGORY (7 achievements)
  {
    id: 'practice_10',
    category: 'practice',
    name: 'Getting Started',
    description: 'Complete 10 practice sessions',
    icon: '🙏',
    target: 10,
    xpReward: 30,
    rarity: 'common',
  },
  {
    id: 'practice_25',
    category: 'practice',
    name: 'Consistent Practitioner',
    description: 'Complete 25 practice sessions',
    icon: '🙏',
    target: 25,
    xpReward: 75,
    rarity: 'common',
  },
  {
    id: 'practice_50',
    category: 'practice',
    name: 'Dedicated Devotee',
    description: 'Complete 50 practice sessions',
    icon: '🙏',
    target: 50,
    xpReward: 150,
    rarity: 'rare',
  },
  {
    id: 'practice_100',
    category: 'practice',
    name: 'Centurion',
    description: 'Complete 100 practice sessions',
    icon: '💯',
    target: 100,
    xpReward: 300,
    rarity: 'rare',
  },
  {
    id: 'practice_250',
    category: 'practice',
    name: 'Spiritual Athlete',
    description: 'Complete 250 practice sessions',
    icon: '⚡',
    target: 250,
    xpReward: 750,
    rarity: 'epic',
  },
  {
    id: 'practice_500',
    category: 'practice',
    name: 'Master of Practice',
    description: 'Complete 500 practice sessions',
    icon: '🌟',
    target: 500,
    xpReward: 1500,
    rarity: 'epic',
  },
  {
    id: 'practice_1000',
    category: 'practice',
    name: 'Thousand Sessions',
    description: 'Complete 1000 practice sessions',
    icon: '👑',
    target: 1000,
    xpReward: 3000,
    rarity: 'legendary',
    isSecret: true,
  },

  // MALA CATEGORY (7 achievements)
  {
    id: 'mala_1',
    category: 'mala',
    name: 'First Mala',
    description: 'Complete your first mala (108 beads)',
    icon: '📿',
    target: 1,
    xpReward: 20,
    rarity: 'common',
  },
  {
    id: 'mala_10',
    category: 'mala',
    name: 'Mala Enthusiast',
    description: 'Complete 10 malas',
    icon: '📿',
    target: 10,
    xpReward: 100,
    rarity: 'common',
  },
  {
    id: 'mala_50',
    category: 'mala',
    name: 'Mala Devotee',
    description: 'Complete 50 malas',
    icon: '📿',
    target: 50,
    xpReward: 250,
    rarity: 'rare',
  },
  {
    id: 'mala_108',
    category: 'mala',
    name: 'Mala Master',
    description: 'Complete 108 malas',
    icon: '🔮',
    target: 108,
    xpReward: 500,
    rarity: 'rare',
  },
  {
    id: 'mala_500',
    category: 'mala',
    name: 'Mantra Maven',
    description: 'Complete 500 malas',
    icon: '💎',
    target: 500,
    xpReward: 1200,
    rarity: 'epic',
  },
  {
    id: 'mala_1000',
    category: 'mala',
    name: 'Thousand Malas',
    description: 'Complete 1000 malas',
    icon: '✨',
    target: 1000,
    xpReward: 2500,
    rarity: 'epic',
  },
  {
    id: 'mala_1080',
    category: 'mala',
    name: 'Mala Legend',
    description: 'Complete 1080 malas (10x sacred 108)',
    icon: '🌌',
    target: 1080,
    xpReward: 5000,
    rarity: 'legendary',
    isSecret: true,
  },

  // QUEST CATEGORY (6 achievements)
  {
    id: 'quest_7',
    category: 'quest',
    name: 'Quest Beginner',
    description: 'Complete 7 daily quests',
    icon: '⭐',
    target: 7,
    xpReward: 70,
    rarity: 'common',
  },
  {
    id: 'quest_14',
    category: 'quest',
    name: 'Quest Enthusiast',
    description: 'Complete 14 daily quests',
    icon: '⭐',
    target: 14,
    xpReward: 140,
    rarity: 'common',
  },
  {
    id: 'quest_30',
    category: 'quest',
    name: 'Quest Champion',
    description: 'Complete 30 daily quests',
    icon: '🌟',
    target: 30,
    xpReward: 300,
    rarity: 'rare',
  },
  {
    id: 'quest_50',
    category: 'quest',
    name: 'Quest Master',
    description: 'Complete 50 daily quests',
    icon: '💫',
    target: 50,
    xpReward: 500,
    rarity: 'epic',
  },
  {
    id: 'quest_100',
    category: 'quest',
    name: 'Quest Legend',
    description: 'Complete 100 daily quests',
    icon: '🏅',
    target: 100,
    xpReward: 1000,
    rarity: 'epic',
  },
  {
    id: 'quest_365',
    category: 'quest',
    name: 'Daily Discipline',
    description: 'Complete 365 daily quests',
    icon: '👑',
    target: 365,
    xpReward: 3650,
    rarity: 'legendary',
    isSecret: true,
  },

  // SOCIAL CATEGORY (5 achievements) - Will unlock in Week 16
  {
    id: 'social_1',
    category: 'social',
    name: 'First Friend',
    description: 'Connect with your first spiritual companion',
    icon: '👥',
    target: 1,
    xpReward: 25,
    rarity: 'common',
  },
  {
    id: 'social_5',
    category: 'social',
    name: 'Community Builder',
    description: 'Connect with 5 friends',
    icon: '👥',
    target: 5,
    xpReward: 100,
    rarity: 'rare',
  },
  {
    id: 'social_20',
    category: 'social',
    name: 'Social Butterfly',
    description: 'Connect with 20 friends',
    icon: '🦋',
    target: 20,
    xpReward: 300,
    rarity: 'epic',
  },
  {
    id: 'social_50',
    category: 'social',
    name: 'Spiritual Network',
    description: 'Connect with 50 friends',
    icon: '🌐',
    target: 50,
    xpReward: 750,
    rarity: 'legendary',
  },
  {
    id: 'social_share_10',
    category: 'social',
    name: 'Inspiration Spreader',
    description: 'Share 10 achievements',
    icon: '📢',
    target: 10,
    xpReward: 200,
    rarity: 'rare',
  },

  // GROUP CATEGORY (3 achievements) - Will unlock in Week 17-18
  {
    id: 'group_join_1',
    category: 'group',
    name: 'Group Novice',
    description: 'Join your first practice group',
    icon: '🏘️',
    target: 1,
    xpReward: 50,
    rarity: 'common',
  },
  {
    id: 'group_join_5',
    category: 'group',
    name: 'Group Enthusiast',
    description: 'Join 5 practice groups',
    icon: '🏘️',
    target: 5,
    xpReward: 250,
    rarity: 'rare',
  },
  {
    id: 'group_challenge_win',
    category: 'group',
    name: 'Challenge Victor',
    description: 'Win your first group challenge',
    icon: '🏆',
    target: 1,
    xpReward: 300,
    rarity: 'epic',
  },
];

/**
 * Achievement Service Class
 */
class AchievementService {
  /**
   * Check all achievements against user stats
   * Returns newly unlocked achievements and near-completion progress
   */
  checkAchievements(
    userStats: {
      practiceStats: PracticeStats;
      questStats: QuestStats;
      socialStats?: { friendCount: number; sharesCount: number };
      groupStats?: { groupsJoined: number; challengesWon: number };
    },
    unlockedAchievementIds: string[]
  ): AchievementCheckResult {
    const newlyUnlocked: Achievement[] = [];
    const nearCompletion: AchievementProgress[] = [];

    ACHIEVEMENTS.forEach((achievement) => {
      // Skip if already unlocked
      if (unlockedAchievementIds.includes(achievement.id)) {
        return;
      }

      // Get current progress for this achievement
      const progress = this.getAchievementProgress(achievement, userStats);

      // Check if unlocked
      if (progress >= achievement.target) {
        newlyUnlocked.push(achievement);
      }
      // Check if near completion (≤3 away)
      else if (achievement.target - progress <= 3 && progress > 0) {
        nearCompletion.push({
          achievementId: achievement.id,
          progress,
          target: achievement.target,
          isUnlocked: false,
          percentComplete: Math.round((progress / achievement.target) * 100),
        });
      }
    });

    // Calculate total XP earned
    const totalXPEarned = newlyUnlocked.reduce((sum, a) => sum + a.xpReward, 0);

    return {
      newlyUnlocked,
      nearCompletion,
      totalXPEarned,
    };
  }

  /**
   * Get current progress for an achievement
   */
  private getAchievementProgress(
    achievement: Achievement,
    userStats: {
      practiceStats: PracticeStats;
      questStats: QuestStats;
      socialStats?: { friendCount: number; sharesCount: number };
      groupStats?: { groupsJoined: number; challengesWon: number };
    }
  ): number {
    const { practiceStats, questStats, socialStats, groupStats } = userStats;

    switch (achievement.category) {
      case 'streak':
        return practiceStats.currentStreak || 0;

      case 'practice':
        return practiceStats.totalPractices || 0;

      case 'mala':
        return practiceStats.totalMalas || 0;

      case 'quest':
        return questStats.totalCompleted || 0;

      case 'social':
        if (achievement.id.includes('share')) {
          return socialStats?.sharesCount || 0;
        }
        return socialStats?.friendCount || 0;

      case 'group':
        if (achievement.id.includes('win')) {
          return groupStats?.challengesWon || 0;
        }
        return groupStats?.groupsJoined || 0;

      default:
        return 0;
    }
  }

  /**
   * Get achievement by ID
   */
  getAchievementById(id: string): Achievement | undefined {
    return ACHIEVEMENTS.find((a) => a.id === id);
  }

  /**
   * Get achievements by category
   */
  getAchievementsByCategory(category: AchievementCategory): Achievement[] {
    return ACHIEVEMENTS.filter((a) => a.category === category);
  }

  /**
   * Get all unlockable achievements (non-secret or already unlocked secrets)
   */
  getUnlockableAchievements(unlockedIds: string[]): Achievement[] {
    return ACHIEVEMENTS.filter(
      (a) => !a.isSecret || unlockedIds.includes(a.id)
    );
  }

  /**
   * Get rarity display name
   */
  getRarityDisplayName(rarity: AchievementRarity): string {
    const names: Record<AchievementRarity, string> = {
      common: 'Common',
      rare: 'Rare',
      epic: 'Epic',
      legendary: 'Legendary',
    };
    return names[rarity];
  }

  /**
   * Get rarity color
   */
  getRarityColor(rarity: AchievementRarity): string {
    const colors: Record<AchievementRarity, string> = {
      common: '#4CAF50', // Green
      rare: '#2196F3', // Blue
      epic: '#9C27B0', // Purple
      legendary: '#FF9800', // Orange/Gold
    };
    return colors[rarity];
  }
}

// Export singleton instance
export const achievementService = new AchievementService();

// Export class for testing
export { AchievementService };
