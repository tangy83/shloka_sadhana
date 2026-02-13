/**
 * Social Types
 * Shloka Sadhana - Phase 2A Week 16: Friend System
 *
 * Type definitions for social features (friends, profiles)
 */

/**
 * Privacy Settings
 * Controls what information is visible to friends
 */
export interface PrivacySettings {
  showStreak: boolean; // Show current streak to friends
  showPractices: boolean; // Show total practices to friends
  allowFriendRequests: boolean; // Allow receiving friend requests
}

/**
 * User Profile (Public)
 * Visible to all users for friend discovery
 */
export interface UserProfile {
  id: string; // Firebase User ID
  displayName: string;
  photoURL: string | null;

  // Public stats (respects privacy settings)
  currentStreak: number;
  totalPractices: number;
  totalMinutes: number;

  // Preferences
  favoriteDeity?: string;

  // Privacy
  privacySettings: PrivacySettings;

  // Metadata
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

/**
 * Friend Request Status
 */
export type FriendRequestStatus = 'pending' | 'accepted' | 'rejected';

/**
 * Friend Request
 * Sent when user wants to connect with another user
 */
export interface FriendRequest {
  id: string; // Request ID
  fromUserId: string; // Who sent the request
  fromUserProfile: UserProfile; // Denormalized for display
  toUserId: string; // Who receives the request
  status: FriendRequestStatus;
  createdAt: string; // ISO timestamp
  respondedAt: string | null; // ISO timestamp of accept/reject
}

/**
 * Friendship Status
 */
export type FriendshipStatus = 'active' | 'blocked';

/**
 * Friendship
 * Created when friend request is accepted
 */
export interface Friendship {
  id: string; // Friendship ID
  users: [string, string]; // Both user IDs (alphabetically sorted)
  status: FriendshipStatus;
  createdAt: string; // ISO timestamp
  lastInteraction: string | null; // Last time they interacted (Week 17: activity feed)
}

/**
 * Friend
 * Combined user profile + friendship info for display
 */
export interface Friend {
  userId: string;
  profile: UserProfile;
  friendship: Friendship;
  isFriend: boolean; // Always true for Friend type
}

/**
 * Friend Search Result
 * User profile with friendship status
 */
export interface FriendSearchResult {
  profile: UserProfile;
  friendshipStatus: 'none' | 'request_sent' | 'request_received' | 'friends';
  requestId?: string; // If request_sent or request_received
}

/**
 * Social Stats
 * Summary statistics for user's social connections
 */
export interface SocialStats {
  friendCount: number;
  pendingRequests: number; // Incoming requests awaiting response
  sentRequests: number; // Outgoing requests awaiting response
}

/**
 * Default privacy settings
 */
export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  showStreak: true,
  showPractices: true,
  allowFriendRequests: true,
};
