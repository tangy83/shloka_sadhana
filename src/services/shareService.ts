/**
 * Share Service
 * Shloka Sadhana - Phase 2A Week 16: Social Sharing
 *
 * Native share integration for achievements, quests, and milestones
 */

import { Share, Platform } from 'react-native';
import { Achievement } from '@/types/achievements';
import { Quest } from '@/types/quests';
import { analyticsService } from './analytics';
import { AnalyticsEvents } from '@/constants/AnalyticsEvents';

/**
 * Shareable content types
 */
export type ShareableType = 'achievement' | 'quest' | 'streak' | 'practice_milestone';

/**
 * Share content data
 */
export interface ShareContent {
  type: ShareableType;
  title: string;
  message: string;
  imageUri?: string; // Local file path to generated image
  url?: string; // Deep link or web URL
}

/**
 * Share result
 */
export interface ShareResult {
  success: boolean;
  platform?: string; // Which platform user selected
  dismissed?: boolean; // User dismissed without sharing
}

/**
 * Share Service Class
 */
class ShareService {
  /**
   * Share achievement unlock
   */
  async shareAchievement(
    achievement: Achievement,
    userStats: { userName?: string; currentStreak: number; totalPractices: number },
    imageUri?: string
  ): Promise<ShareResult> {
    const content: ShareContent = {
      type: 'achievement',
      title: `🏆 Achievement Unlocked: ${achievement.name}`,
      message: this.buildAchievementMessage(achievement, userStats),
      imageUri,
      url: 'shlokasadhana://app', // Deep link (will be updated in Week 18 for referrals)
    };

    return this.share(content, 'achievement');
  }

  /**
   * Share quest completion
   */
  async shareQuest(
    quest: Quest,
    userStats: { userName?: string; questStreak: number },
    imageUri?: string
  ): Promise<ShareResult> {
    const content: ShareContent = {
      type: 'quest',
      title: `✅ Quest Complete: ${quest.name}`,
      message: this.buildQuestMessage(quest, userStats),
      imageUri,
      url: 'shlokasadhana://app',
    };

    return this.share(content, 'quest');
  }

  /**
   * Share streak milestone
   */
  async shareStreak(
    streakDays: number,
    totalPractices: number,
    userName?: string,
    imageUri?: string
  ): Promise<ShareResult> {
    const content: ShareContent = {
      type: 'streak',
      title: `🔥 ${streakDays} Day Streak!`,
      message: this.buildStreakMessage(streakDays, totalPractices, userName),
      imageUri,
      url: 'shlokasadhana://app',
    };

    return this.share(content, 'streak');
  }

  /**
   * Share practice milestone
   */
  async sharePracticeMilestone(
    milestone: number,
    userName?: string,
    imageUri?: string
  ): Promise<ShareResult> {
    const content: ShareContent = {
      type: 'practice_milestone',
      title: `🎯 ${milestone} Practices Complete!`,
      message: this.buildPracticeMilestoneMessage(milestone, userName),
      imageUri,
      url: 'shlokasadhana://app',
    };

    return this.share(content, 'practice_milestone');
  }

  /**
   * Core share function using React Native Share API
   */
  private async share(content: ShareContent, eventType: string): Promise<ShareResult> {
    try {
      // Track share initiated
      analyticsService.trackEvent(AnalyticsEvents.SHARE_INITIATED, {
        share_type: content.type,
        has_image: !!content.imageUri,
      });

      // Build share options
      const shareOptions: any = {
        title: content.title,
        message: this.buildShareMessage(content),
      };

      // Add URL for iOS (appears as link)
      if (Platform.OS === 'ios' && content.url) {
        shareOptions.url = content.url;
      }

      // Add image if available (requires react-native-share for images)
      // For now, we'll use basic Share API without images
      // TODO: Install react-native-share for image sharing

      const result = await Share.share(shareOptions, {
        dialogTitle: content.title,
        subject: content.title, // For email
      });

      // Handle result
      if (result.action === Share.sharedAction) {
        // Shared successfully
        const platform = result.activityType || 'unknown';

        analyticsService.trackEvent(AnalyticsEvents.SHARE_COMPLETED, {
          share_type: content.type,
          platform,
        });

        return {
          success: true,
          platform,
        };
      } else if (result.action === Share.dismissedAction) {
        // User dismissed
        analyticsService.trackEvent(AnalyticsEvents.SHARE_CANCELLED, {
          share_type: content.type,
        });

        return {
          success: false,
          dismissed: true,
        };
      }

      return { success: false };
    } catch (error) {
      console.error('[ShareService] Error sharing:', error);

      analyticsService.trackEvent(AnalyticsEvents.ERROR_OCCURRED, {
        error_category: 'share',
        error_message: error instanceof Error ? error.message : 'Unknown error',
      });

      return { success: false };
    }
  }

  /**
   * Build share message with branding
   */
  private buildShareMessage(content: ShareContent): string {
    let message = content.message;

    // Add app branding
    message += '\n\n📱 Practice with me on Shloka Sadhana';

    // Add URL if available (Android doesn't support separate URL field)
    if (Platform.OS === 'android' && content.url) {
      message += `\n${content.url}`;
    }

    return message;
  }

  /**
   * Build achievement share message
   */
  private buildAchievementMessage(
    achievement: Achievement,
    userStats: { userName?: string; currentStreak: number; totalPractices: number }
  ): string {
    const userName = userStats.userName || 'I';

    let message = `${achievement.icon} ${userName} just unlocked: ${achievement.name}!\n\n`;
    message += `"${achievement.description}"\n\n`;

    // Add rarity badge
    const rarityEmoji = {
      common: '⭐',
      rare: '💎',
      epic: '👑',
      legendary: '🏆',
    };
    message += `${rarityEmoji[achievement.rarity]} ${achievement.rarity.toUpperCase()} Achievement\n`;
    message += `+${achievement.xpReward} XP\n\n`;

    // Add user stats
    message += `🔥 Current Streak: ${userStats.currentStreak} days\n`;
    message += `🎯 Total Practices: ${userStats.totalPractices}`;

    return message;
  }

  /**
   * Build quest share message
   */
  private buildQuestMessage(
    quest: Quest,
    userStats: { userName?: string; questStreak: number }
  ): string {
    const userName = userStats.userName || 'I';

    let message = `✅ ${userName} completed today's quest!\n\n`;
    message += `🎯 ${quest.name}\n`;
    message += `"${quest.description}"\n\n`;
    message += `⚡ Difficulty: ${quest.difficulty.toUpperCase()}\n`;
    message += `+${quest.xpReward} XP\n\n`;
    message += `🔥 Quest Streak: ${userStats.questStreak} days`;

    return message;
  }

  /**
   * Build streak share message
   */
  private buildStreakMessage(
    streakDays: number,
    totalPractices: number,
    userName?: string
  ): string {
    const name = userName || 'I';

    let message = `🔥 ${name} reached a ${streakDays}-day practice streak!\n\n`;

    // Add motivational message based on streak
    if (streakDays >= 365) {
      message += `🏆 A full year of daily practice - incredible dedication!\n\n`;
    } else if (streakDays >= 100) {
      message += `👑 100+ days of devotion - unstoppable!\n\n`;
    } else if (streakDays >= 30) {
      message += `💪 One month strong - building lasting habits!\n\n`;
    } else if (streakDays >= 7) {
      message += `⭐ One week of daily practice - great start!\n\n`;
    }

    message += `🎯 Total Practices: ${totalPractices}\n`;
    message += `📿 Daily Shloka Practice`;

    return message;
  }

  /**
   * Build practice milestone share message
   */
  private buildPracticeMilestoneMessage(milestone: number, userName?: string): string {
    const name = userName || 'I';

    let message = `🎯 ${name} completed ${milestone} practice sessions!\n\n`;

    // Add milestone-specific message
    if (milestone >= 1000) {
      message += `🏆 1000+ practices - truly legendary!\n`;
    } else if (milestone >= 500) {
      message += `👑 500 practices - master practitioner!\n`;
    } else if (milestone >= 100) {
      message += `💎 100 practices - committed devotee!\n`;
    } else if (milestone >= 50) {
      message += `⭐ 50 practices - dedicated sadhak!\n`;
    }

    message += `\n📿 Building a spiritual practice, one day at a time`;

    return message;
  }

  /**
   * Check if sharing is available on device
   */
  async isShareAvailable(): Promise<boolean> {
    try {
      // Share is always available on iOS and Android
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get share button text based on platform
   */
  getShareButtonText(): string {
    if (Platform.OS === 'ios') {
      return 'Share Achievement';
    }
    return 'Share';
  }
}

// Export singleton instance
export const shareService = new ShareService();

// Export class for testing
export { ShareService };
