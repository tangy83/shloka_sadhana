/**
 * Friend Service
 * Shloka Sadhana - Phase 2A Week 16: Friend System
 *
 * Manages friend operations: search, requests, accept/decline
 */

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {
  UserProfile,
  FriendRequest,
  Friendship,
  Friend,
  FriendSearchResult,
  SocialStats,
  DEFAULT_PRIVACY_SETTINGS,
} from '@/types/social';
import { analyticsService } from './analytics';
import { AnalyticsEvents } from '@/constants/AnalyticsEvents';

/**
 * Friend Service Class
 */
class FriendService {
  /**
   * Create or update public profile
   * Called on first sign-in or when updating profile
   */
  async createOrUpdateProfile(
    userId: string,
    data: {
      displayName: string;
      photoURL?: string | null;
      currentStreak?: number;
      totalPractices?: number;
      totalMinutes?: number;
      favoriteDeity?: string;
    }
  ): Promise<void> {
    try {
      const profileRef = firestore().collection('publicProfiles').doc(userId);
      const existingProfile = await profileRef.get();

      const profileData: Partial<UserProfile> = {
        id: userId,
        displayName: data.displayName,
        photoURL: data.photoURL || null,
        currentStreak: data.currentStreak ?? 0,
        totalPractices: data.totalPractices ?? 0,
        totalMinutes: data.totalMinutes ?? 0,
        favoriteDeity: data.favoriteDeity,
        updatedAt: new Date().toISOString(),
      };

      if (!existingProfile.exists) {
        // First time creating profile
        profileData.privacySettings = DEFAULT_PRIVACY_SETTINGS;
        profileData.createdAt = new Date().toISOString();
      }

      await profileRef.set(profileData, { merge: true });
      console.log('[FriendService] Profile created/updated');
    } catch (error) {
      console.error('[FriendService] Error creating/updating profile:', error);
      throw error;
    }
  }

  /**
   * Search for users by display name
   */
  async searchUsers(query: string, currentUserId: string): Promise<FriendSearchResult[]> {
    try {
      if (!query || query.trim().length < 2) {
        return []; // Require at least 2 characters
      }

      const queryLower = query.toLowerCase();

      // Firestore doesn't support case-insensitive search natively
      // We'll fetch all profiles and filter client-side (for MVP)
      // For production, use Algolia or similar search service
      const snapshot = await firestore()
        .collection('publicProfiles')
        .where('privacySettings.allowFriendRequests', '==', true)
        .limit(50) // Limit to prevent large downloads
        .get();

      const profiles: UserProfile[] = [];
      snapshot.forEach((doc) => {
        const profile = doc.data() as UserProfile;
        // Filter out current user and do case-insensitive name match
        if (
          profile.id !== currentUserId &&
          profile.displayName.toLowerCase().includes(queryLower)
        ) {
          profiles.push(profile);
        }
      });

      // Get friendship status for each profile
      const results: FriendSearchResult[] = [];
      for (const profile of profiles) {
        const status = await this.getFriendshipStatus(currentUserId, profile.id);
        results.push({
          profile,
          ...status,
        });
      }

      // Track search analytics
      analyticsService.trackEvent('user_search', {
        query,
        results_count: results.length,
      });

      return results.slice(0, 20); // Return top 20 results
    } catch (error) {
      console.error('[FriendService] Error searching users:', error);
      throw error;
    }
  }

  /**
   * Get friendship status between two users
   */
  private async getFriendshipStatus(
    userId1: string,
    userId2: string
  ): Promise<Omit<FriendSearchResult, 'profile'>> {
    try {
      // Check if friendship exists
      const friendshipId = this.getFriendshipId(userId1, userId2);
      const friendshipDoc = await firestore()
        .collection('friendships')
        .doc(friendshipId)
        .get();

      if (friendshipDoc.exists) {
        return { friendshipStatus: 'friends' };
      }

      // Check for pending requests
      const sentRequest = await firestore()
        .collection('friendRequests')
        .where('fromUserId', '==', userId1)
        .where('toUserId', '==', userId2)
        .where('status', '==', 'pending')
        .limit(1)
        .get();

      if (!sentRequest.empty) {
        return {
          friendshipStatus: 'request_sent',
          requestId: sentRequest.docs[0].id,
        };
      }

      const receivedRequest = await firestore()
        .collection('friendRequests')
        .where('fromUserId', '==', userId2)
        .where('toUserId', '==', userId1)
        .where('status', '==', 'pending')
        .limit(1)
        .get();

      if (!receivedRequest.empty) {
        return {
          friendshipStatus: 'request_received',
          requestId: receivedRequest.docs[0].id,
        };
      }

      return { friendshipStatus: 'none' };
    } catch (error) {
      console.error('[FriendService] Error getting friendship status:', error);
      return { friendshipStatus: 'none' };
    }
  }

  /**
   * Send friend request
   */
  async sendFriendRequest(fromUserId: string, toUserId: string): Promise<string> {
    try {
      // Prevent sending request to self
      if (fromUserId === toUserId) {
        throw new Error('Cannot send friend request to yourself');
      }

      // Check if request already exists
      const existingRequest = await firestore()
        .collection('friendRequests')
        .where('fromUserId', '==', fromUserId)
        .where('toUserId', '==', toUserId)
        .where('status', '==', 'pending')
        .limit(1)
        .get();

      if (!existingRequest.empty) {
        throw new Error('Friend request already sent');
      }

      // Check if already friends
      const friendshipId = this.getFriendshipId(fromUserId, toUserId);
      const friendship = await firestore().collection('friendships').doc(friendshipId).get();

      if (friendship.exists) {
        throw new Error('Already friends');
      }

      // Get sender profile for denormalization
      const senderProfile = await this.getUserProfile(fromUserId);
      if (!senderProfile) {
        throw new Error('Sender profile not found');
      }

      // Create friend request
      const requestRef = firestore().collection('friendRequests').doc();
      const request: FriendRequest = {
        id: requestRef.id,
        fromUserId,
        fromUserProfile: senderProfile,
        toUserId,
        status: 'pending',
        createdAt: new Date().toISOString(),
        respondedAt: null,
      };

      await requestRef.set(request);

      // Track analytics
      analyticsService.trackEvent('friend_request_sent', {
        to_user_id: toUserId,
      });

      console.log('[FriendService] Friend request sent');
      return request.id;
    } catch (error) {
      console.error('[FriendService] Error sending friend request:', error);
      throw error;
    }
  }

  /**
   * Accept friend request
   */
  async acceptFriendRequest(requestId: string, userId: string): Promise<void> {
    try {
      const requestRef = firestore().collection('friendRequests').doc(requestId);
      const requestDoc = await requestRef.get();

      if (!requestDoc.exists) {
        throw new Error('Friend request not found');
      }

      const request = requestDoc.data() as FriendRequest;

      // Verify user is the recipient
      if (request.toUserId !== userId) {
        throw new Error('Unauthorized to accept this request');
      }

      if (request.status !== 'pending') {
        throw new Error('Request already responded to');
      }

      // Update request status
      await requestRef.update({
        status: 'accepted',
        respondedAt: new Date().toISOString(),
      });

      // Create friendship
      const friendshipId = this.getFriendshipId(request.fromUserId, request.toUserId);
      const friendship: Friendship = {
        id: friendshipId,
        users: this.sortUserIds(request.fromUserId, request.toUserId),
        status: 'active',
        createdAt: new Date().toISOString(),
        lastInteraction: null,
      };

      await firestore().collection('friendships').doc(friendshipId).set(friendship);

      // Track analytics
      analyticsService.trackEvent('friend_request_accepted', {
        from_user_id: request.fromUserId,
      });

      console.log('[FriendService] Friend request accepted');
    } catch (error) {
      console.error('[FriendService] Error accepting friend request:', error);
      throw error;
    }
  }

  /**
   * Decline friend request
   */
  async declineFriendRequest(requestId: string, userId: string): Promise<void> {
    try {
      const requestRef = firestore().collection('friendRequests').doc(requestId);
      const requestDoc = await requestRef.get();

      if (!requestDoc.exists) {
        throw new Error('Friend request not found');
      }

      const request = requestDoc.data() as FriendRequest;

      // Verify user is the recipient
      if (request.toUserId !== userId) {
        throw new Error('Unauthorized to decline this request');
      }

      // Update request status
      await requestRef.update({
        status: 'rejected',
        respondedAt: new Date().toISOString(),
      });

      // Track analytics
      analyticsService.trackEvent('friend_request_declined', {
        from_user_id: request.fromUserId,
      });

      console.log('[FriendService] Friend request declined');
    } catch (error) {
      console.error('[FriendService] Error declining friend request:', error);
      throw error;
    }
  }

  /**
   * Cancel sent friend request
   */
  async cancelFriendRequest(requestId: string, userId: string): Promise<void> {
    try {
      const requestRef = firestore().collection('friendRequests').doc(requestId);
      const requestDoc = await requestRef.get();

      if (!requestDoc.exists) {
        throw new Error('Friend request not found');
      }

      const request = requestDoc.data() as FriendRequest;

      // Verify user is the sender
      if (request.fromUserId !== userId) {
        throw new Error('Unauthorized to cancel this request');
      }

      // Delete request
      await requestRef.delete();

      console.log('[FriendService] Friend request cancelled');
    } catch (error) {
      console.error('[FriendService] Error cancelling friend request:', error);
      throw error;
    }
  }

  /**
   * Remove friend (unfriend)
   */
  async removeFriend(userId: string, friendUserId: string): Promise<void> {
    try {
      const friendshipId = this.getFriendshipId(userId, friendUserId);
      await firestore().collection('friendships').doc(friendshipId).delete();

      // Track analytics
      analyticsService.trackEvent('friend_removed', {
        friend_user_id: friendUserId,
      });

      console.log('[FriendService] Friend removed');
    } catch (error) {
      console.error('[FriendService] Error removing friend:', error);
      throw error;
    }
  }

  /**
   * Get all friends for a user
   */
  async getFriends(userId: string): Promise<Friend[]> {
    try {
      const friendships = await firestore()
        .collection('friendships')
        .where('users', 'array-contains', userId)
        .where('status', '==', 'active')
        .get();

      const friends: Friend[] = [];

      for (const doc of friendships.docs) {
        const friendship = doc.data() as Friendship;

        // Get the other user's ID
        const friendUserId = friendship.users.find((id) => id !== userId);
        if (!friendUserId) continue;

        // Get friend's profile
        const profile = await this.getUserProfile(friendUserId);
        if (!profile) continue;

        friends.push({
          userId: friendUserId,
          profile,
          friendship,
          isFriend: true,
        });
      }

      return friends;
    } catch (error) {
      console.error('[FriendService] Error getting friends:', error);
      throw error;
    }
  }

  /**
   * Get incoming friend requests
   */
  async getIncomingRequests(userId: string): Promise<FriendRequest[]> {
    try {
      const snapshot = await firestore()
        .collection('friendRequests')
        .where('toUserId', '==', userId)
        .where('status', '==', 'pending')
        .orderBy('createdAt', 'desc')
        .get();

      const requests: FriendRequest[] = [];
      snapshot.forEach((doc) => {
        requests.push(doc.data() as FriendRequest);
      });

      return requests;
    } catch (error) {
      console.error('[FriendService] Error getting incoming requests:', error);
      throw error;
    }
  }

  /**
   * Get outgoing friend requests
   */
  async getOutgoingRequests(userId: string): Promise<FriendRequest[]> {
    try {
      const snapshot = await firestore()
        .collection('friendRequests')
        .where('fromUserId', '==', userId)
        .where('status', '==', 'pending')
        .orderBy('createdAt', 'desc')
        .get();

      const requests: FriendRequest[] = [];
      snapshot.forEach((doc) => {
        requests.push(doc.data() as FriendRequest);
      });

      return requests;
    } catch (error) {
      console.error('[FriendService] Error getting outgoing requests:', error);
      throw error;
    }
  }

  /**
   * Get social stats for user
   */
  async getSocialStats(userId: string): Promise<SocialStats> {
    try {
      const [friends, incomingRequests, outgoingRequests] = await Promise.all([
        this.getFriends(userId),
        this.getIncomingRequests(userId),
        this.getOutgoingRequests(userId),
      ]);

      return {
        friendCount: friends.length,
        pendingRequests: incomingRequests.length,
        sentRequests: outgoingRequests.length,
      };
    } catch (error) {
      console.error('[FriendService] Error getting social stats:', error);
      return {
        friendCount: 0,
        pendingRequests: 0,
        sentRequests: 0,
      };
    }
  }

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const doc = await firestore().collection('publicProfiles').doc(userId).get();

      if (doc.exists) {
        return doc.data() as UserProfile;
      }

      return null;
    } catch (error) {
      console.error('[FriendService] Error getting user profile:', error);
      return null;
    }
  }

  /**
   * Update privacy settings
   */
  async updatePrivacySettings(
    userId: string,
    settings: Partial<typeof DEFAULT_PRIVACY_SETTINGS>
  ): Promise<void> {
    try {
      await firestore()
        .collection('publicProfiles')
        .doc(userId)
        .update({
          privacySettings: settings,
          updatedAt: new Date().toISOString(),
        });

      console.log('[FriendService] Privacy settings updated');
    } catch (error) {
      console.error('[FriendService] Error updating privacy settings:', error);
      throw error;
    }
  }

  /**
   * Helper: Generate friendship ID (deterministic, alphabetically sorted)
   */
  private getFriendshipId(userId1: string, userId2: string): string {
    return this.sortUserIds(userId1, userId2).join('_');
  }

  /**
   * Helper: Sort user IDs alphabetically
   */
  private sortUserIds(userId1: string, userId2: string): [string, string] {
    return userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];
  }
}

// Export singleton instance
export const friendService = new FriendService();

// Export class for testing
export { FriendService };
