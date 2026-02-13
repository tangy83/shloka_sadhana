/**
 * Activity Feed Types
 * Shloka Sadhana - Phase 2A Week 17: Friend Activity Feed
 *
 * Types for friend activity feed system
 */

/**
 * Activity Types
 * Different types of activities that can be posted to feed
 */
export type ActivityType =
  | 'practice'           // Completed practice session
  | 'achievement'        // Achievement unlocked
  | 'quest'             // Quest completed
  | 'milestone'         // Milestone reached (10th practice, 100th mala, etc.)
  | 'streak';           // Streak milestone (7, 30, 100 days)

/**
 * Activity Reaction Types
 * Users can react to friend activities
 */
export type ReactionType = 'celebrate' | 'fire';

/**
 * Activity Metadata
 * Type-specific data for each activity type
 */
export interface ActivityMetadata {
  // Practice activity
  shlokaName?: string;
  duration?: number;           // Duration in seconds
  malaCount?: number;

  // Achievement activity
  achievementId?: string;
  achievementName?: string;
  achievementIcon?: string;
  xpEarned?: number;

  // Quest activity
  questName?: string;
  questDifficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';

  // Milestone activity
  milestoneType?: 'practices' | 'malas' | 'minutes' | 'days';
  milestoneValue?: number;     // e.g., 100 practices, 108 malas

  // Streak activity
  streakDays?: number;
}

/**
 * Activity Item
 * Single activity in the feed
 */
export interface ActivityItem {
  id: string;
  userId: string;              // User who performed the activity
  userDisplayName: string;     // Denormalized for display
  userPhotoURL: string | null; // Denormalized for display
  type: ActivityType;
  metadata: ActivityMetadata;
  createdAt: string;           // ISO timestamp
  reactions: {
    [userId: string]: ReactionType;
  };
}

/**
 * Activity Feed Item with Friendship Info
 * Extended activity with friendship context
 */
export interface ActivityFeedItem extends ActivityItem {
  fromFriendId: string;        // Which friend posted this (for feed display)
  isFriend: boolean;           // Is this user still a friend?
}

/**
 * Activity Statistics
 * Summary stats for activity feed
 */
export interface ActivityStats {
  totalActivities: number;
  activitiesToday: number;
  recentReactions: number;     // Reactions received in last 7 days
}

/**
 * Activity Filter Options
 */
export interface ActivityFilterOptions {
  types?: ActivityType[];      // Filter by activity type
  friendIds?: string[];        // Filter by specific friends
  startDate?: string;          // ISO timestamp
  endDate?: string;            // ISO timestamp
  limit?: number;              // Max activities to return (default: 50)
}
