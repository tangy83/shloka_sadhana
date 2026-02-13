/**
 * Activity Service
 * Shloka Sadhana - Phase 2A Week 17: Friend Activity Feed
 *
 * Manages activity feed operations: post activities, fetch feed, add reactions
 */

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { friendService } from './friendService';
import {
  ActivityItem,
  ActivityFeedItem,
  ActivityType,
  ActivityMetadata,
  ReactionType,
  ActivityFilterOptions,
} from '@/types/activityFeed';
import { analyticsService } from './analytics';

/**
 * Activity Service Class
 */
class ActivityService {
  /**
   * Post a practice activity
   */
  async postPracticeActivity(
    shlokaName: string,
    duration: number,
    malaCount: number
  ): Promise<string> {
    const metadata: ActivityMetadata = {
      shlokaName,
      duration,
      malaCount,
    };

    return this.postActivity('practice', metadata);
  }

  /**
   * Post an achievement unlock activity
   */
  async postAchievementActivity(
    achievementId: string,
    achievementName: string,
    achievementIcon: string,
    xpEarned: number
  ): Promise<string> {
    const metadata: ActivityMetadata = {
      achievementId,
      achievementName,
      achievementIcon,
      xpEarned,
    };

    return this.postActivity('achievement', metadata);
  }

  /**
   * Post a quest completion activity
   */
  async postQuestActivity(
    questName: string,
    questDifficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  ): Promise<string> {
    const metadata: ActivityMetadata = {
      questName,
      questDifficulty,
    };

    return this.postActivity('quest', metadata);
  }

  /**
   * Post a milestone activity
   */
  async postMilestoneActivity(
    milestoneType: 'practices' | 'malas' | 'minutes' | 'days',
    milestoneValue: number
  ): Promise<string> {
    const metadata: ActivityMetadata = {
      milestoneType,
      milestoneValue,
    };

    return this.postActivity('milestone', metadata);
  }

  /**
   * Post a streak milestone activity
   */
  async postStreakActivity(streakDays: number): Promise<string> {
    const metadata: ActivityMetadata = {
      streakDays,
    };

    return this.postActivity('streak', metadata);
  }

  /**
   * Core method to post an activity
   */
  private async postActivity(
    type: ActivityType,
    metadata: ActivityMetadata
  ): Promise<string> {
    const user = auth().currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }

    try {
      // Get user profile for denormalization
      const profile = await friendService.getUserProfile(user.uid);
      if (!profile) {
        throw new Error('User profile not found');
      }

      // Create activity
      const activityRef = firestore().collection('activityFeed').doc();
      const activity: ActivityItem = {
        id: activityRef.id,
        userId: user.uid,
        userDisplayName: profile.displayName,
        userPhotoURL: profile.photoURL,
        type,
        metadata,
        createdAt: new Date().toISOString(),
        reactions: {},
      };

      // Write to main activity feed
      await activityRef.set(activity);

      // Denormalize to friends' feeds (for faster queries)
      await this.denormalizeToFriendFeeds(activity);

      // Track analytics
      analyticsService.trackEvent('activity_posted', {
        activity_type: type,
        has_metadata: Object.keys(metadata).length > 0,
      });

      console.log(`[ActivityService] Posted ${type} activity:`, activityRef.id);
      return activityRef.id;
    } catch (error) {
      console.error('[ActivityService] Error posting activity:', error);
      throw error;
    }
  }

  /**
   * Denormalize activity to friends' feeds
   * This allows fast queries without joining collections
   */
  private async denormalizeToFriendFeeds(activity: ActivityItem): Promise<void> {
    try {
      // Get user's friends
      const friends = await friendService.getFriends(activity.userId);

      if (friends.length === 0) {
        console.log('[ActivityService] No friends to denormalize to');
        return;
      }

      // Batch write to friends' feeds
      const batch = firestore().batch();

      friends.forEach((friend) => {
        const feedItemRef = firestore()
          .collection('users')
          .doc(friend.userId)
          .collection('friendActivities')
          .doc(activity.id);

        const feedItem: ActivityFeedItem = {
          ...activity,
          fromFriendId: activity.userId,
          isFriend: true,
        };

        batch.set(feedItemRef, feedItem);
      });

      await batch.commit();

      console.log(
        `[ActivityService] Denormalized activity to ${friends.length} friend feeds`
      );
    } catch (error) {
      console.error('[ActivityService] Error denormalizing to friend feeds:', error);
      // Don't throw - denormalization failure shouldn't break activity posting
    }
  }

  /**
   * Get activity feed for current user
   * Returns activities from all friends, sorted by most recent
   */
  async getActivityFeed(options?: ActivityFilterOptions): Promise<ActivityFeedItem[]> {
    const user = auth().currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }

    try {
      const limit = options?.limit || 50;

      // Query user's friend activities (denormalized collection)
      let query = firestore()
        .collection('users')
        .doc(user.uid)
        .collection('friendActivities')
        .orderBy('createdAt', 'desc')
        .limit(limit);

      // Apply filters if provided
      if (options?.types && options.types.length > 0) {
        query = query.where('type', 'in', options.types);
      }

      if (options?.startDate) {
        query = query.where('createdAt', '>=', options.startDate);
      }

      if (options?.endDate) {
        query = query.where('createdAt', '<=', options.endDate);
      }

      const snapshot = await query.get();

      const activities: ActivityFeedItem[] = [];
      snapshot.forEach((doc) => {
        activities.push(doc.data() as ActivityFeedItem);
      });

      console.log(`[ActivityService] Fetched ${activities.length} activities`);
      return activities;
    } catch (error) {
      console.error('[ActivityService] Error fetching activity feed:', error);
      throw error;
    }
  }

  /**
   * Get activities for a specific user (for profile view)
   */
  async getUserActivities(
    userId: string,
    limit: number = 20
  ): Promise<ActivityItem[]> {
    try {
      const snapshot = await firestore()
        .collection('activityFeed')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      const activities: ActivityItem[] = [];
      snapshot.forEach((doc) => {
        activities.push(doc.data() as ActivityItem);
      });

      return activities;
    } catch (error) {
      console.error('[ActivityService] Error fetching user activities:', error);
      throw error;
    }
  }

  /**
   * Add reaction to an activity
   */
  async addReaction(
    activityId: string,
    reaction: ReactionType
  ): Promise<void> {
    const user = auth().currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }

    try {
      // Update reaction in main activity feed
      const activityRef = firestore().collection('activityFeed').doc(activityId);

      await activityRef.update({
        [`reactions.${user.uid}`]: reaction,
      });

      // Also update in user's friend feed (denormalized)
      const feedItemRef = firestore()
        .collection('users')
        .doc(user.uid)
        .collection('friendActivities')
        .doc(activityId);

      await feedItemRef.update({
        [`reactions.${user.uid}`]: reaction,
      });

      // Track analytics
      analyticsService.trackEvent('activity_reaction_added', {
        activity_id: activityId,
        reaction_type: reaction,
      });

      console.log(`[ActivityService] Added ${reaction} reaction to activity ${activityId}`);
    } catch (error) {
      console.error('[ActivityService] Error adding reaction:', error);
      throw error;
    }
  }

  /**
   * Remove reaction from an activity
   */
  async removeReaction(activityId: string): Promise<void> {
    const user = auth().currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }

    try {
      // Remove from main activity feed
      const activityRef = firestore().collection('activityFeed').doc(activityId);

      await activityRef.update({
        [`reactions.${user.uid}`]: firestore.FieldValue.delete(),
      });

      // Remove from user's friend feed
      const feedItemRef = firestore()
        .collection('users')
        .doc(user.uid)
        .collection('friendActivities')
        .doc(activityId);

      await feedItemRef.update({
        [`reactions.${user.uid}`]: firestore.FieldValue.delete(),
      });

      // Track analytics
      analyticsService.trackEvent('activity_reaction_removed', {
        activity_id: activityId,
      });

      console.log(`[ActivityService] Removed reaction from activity ${activityId}`);
    } catch (error) {
      console.error('[ActivityService] Error removing reaction:', error);
      throw error;
    }
  }

  /**
   * Listen to activity feed updates (real-time)
   * Returns unsubscribe function
   */
  onActivityFeedChange(
    callback: (activities: ActivityFeedItem[]) => void
  ): () => void {
    const user = auth().currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }

    const unsubscribe = firestore()
      .collection('users')
      .doc(user.uid)
      .collection('friendActivities')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .onSnapshot(
        (snapshot) => {
          const activities: ActivityFeedItem[] = [];
          snapshot.forEach((doc) => {
            activities.push(doc.data() as ActivityFeedItem);
          });
          callback(activities);
        },
        (error) => {
          console.error('[ActivityService] Error in feed listener:', error);
        }
      );

    return unsubscribe;
  }

  /**
   * Clean up old activities (for maintenance)
   * Call this periodically or via Cloud Function
   */
  async cleanupOldActivities(daysToKeep: number = 30): Promise<void> {
    const user = auth().currentUser;
    if (!user) return;

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      const cutoffISO = cutoffDate.toISOString();

      const snapshot = await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('friendActivities')
        .where('createdAt', '<', cutoffISO)
        .get();

      if (snapshot.empty) {
        console.log('[ActivityService] No old activities to clean up');
        return;
      }

      // Batch delete old activities
      const batch = firestore().batch();
      snapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      console.log(`[ActivityService] Cleaned up ${snapshot.size} old activities`);
    } catch (error) {
      console.error('[ActivityService] Error cleaning up old activities:', error);
    }
  }
}

// Export singleton instance
export const activityService = new ActivityService();

// Export class for testing
export { ActivityService };
