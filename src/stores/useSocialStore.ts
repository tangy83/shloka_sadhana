/**
 * Social Store
 * Shloka Sadhana - Phase 2A Week 16: Friend System
 *
 * Zustand store for friend state management with cloud sync
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { asyncStoragePersist } from './middleware/storage';
import { friendService } from '@/services/friendService';
import auth from '@react-native-firebase/auth';
import {
  Friend,
  FriendRequest,
  FriendSearchResult,
  SocialStats,
  UserProfile,
} from '@/types/social';

/**
 * Social State Interface
 */
interface SocialState {
  // Friends
  friends: Friend[];
  friendsLoading: boolean;

  // Friend Requests
  incomingRequests: FriendRequest[];
  outgoingRequests: FriendRequest[];
  requestsLoading: boolean;

  // Social Stats
  stats: SocialStats;

  // Search
  searchResults: FriendSearchResult[];
  searchLoading: boolean;

  // User Profile
  userProfile: UserProfile | null;

  // Last sync
  lastSyncedAt: string | null;

  // Actions - Friends
  loadFriends: () => Promise<void>;
  refreshFriends: () => Promise<void>;
  removeFriend: (friendUserId: string) => Promise<void>;

  // Actions - Requests
  loadRequests: () => Promise<void>;
  sendFriendRequest: (toUserId: string) => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  declineFriendRequest: (requestId: string) => Promise<void>;
  cancelFriendRequest: (requestId: string) => Promise<void>;

  // Actions - Search
  searchUsers: (query: string) => Promise<void>;
  clearSearch: () => void;

  // Actions - Stats
  loadSocialStats: () => Promise<void>;

  // Actions - Profile
  createOrUpdateProfile: (data: {
    displayName: string;
    photoURL?: string | null;
    currentStreak?: number;
    totalPractices?: number;
    totalMinutes?: number;
    favoriteDeity?: string;
  }) => Promise<void>;
  loadUserProfile: () => Promise<void>;

  // Actions - Sync
  syncToCloud: () => Promise<void>;
  loadFromCloud: () => Promise<void>;

  // Actions - Reset
  reset: () => void;
}

/**
 * Initial State
 */
const initialState = {
  friends: [],
  friendsLoading: false,
  incomingRequests: [],
  outgoingRequests: [],
  requestsLoading: false,
  stats: {
    friendCount: 0,
    pendingRequests: 0,
    sentRequests: 0,
  },
  searchResults: [],
  searchLoading: false,
  userProfile: null,
  lastSyncedAt: null,
};

/**
 * Social Store
 */
export const useSocialStore = create<SocialState>()(
  persist(
    (set, get) => ({
      ...initialState,

      /**
       * Load friends list
       */
      loadFriends: async () => {
        const user = auth().currentUser;
        if (!user) {
          console.log('[SocialStore] No authenticated user');
          return;
        }

        try {
          set({ friendsLoading: true });

          const friends = await friendService.getFriends(user.uid);

          set({
            friends,
            friendsLoading: false,
          });

          console.log(`[SocialStore] Loaded ${friends.length} friends`);
        } catch (error) {
          console.error('[SocialStore] Error loading friends:', error);
          set({ friendsLoading: false });
          throw error;
        }
      },

      /**
       * Refresh friends (force reload)
       */
      refreshFriends: async () => {
        const user = auth().currentUser;
        if (!user) return;

        try {
          const friends = await friendService.getFriends(user.uid);
          set({ friends, lastSyncedAt: new Date().toISOString() });
          console.log('[SocialStore] Friends refreshed');
        } catch (error) {
          console.error('[SocialStore] Error refreshing friends:', error);
          throw error;
        }
      },

      /**
       * Remove friend (unfriend)
       */
      removeFriend: async (friendUserId: string) => {
        const user = auth().currentUser;
        if (!user) return;

        try {
          await friendService.removeFriend(user.uid, friendUserId);

          // Remove from local state
          set((state) => ({
            friends: state.friends.filter((f) => f.userId !== friendUserId),
            stats: {
              ...state.stats,
              friendCount: Math.max(0, state.stats.friendCount - 1),
            },
          }));

          console.log('[SocialStore] Friend removed');
        } catch (error) {
          console.error('[SocialStore] Error removing friend:', error);
          throw error;
        }
      },

      /**
       * Load friend requests (incoming and outgoing)
       */
      loadRequests: async () => {
        const user = auth().currentUser;
        if (!user) return;

        try {
          set({ requestsLoading: true });

          const [incoming, outgoing] = await Promise.all([
            friendService.getIncomingRequests(user.uid),
            friendService.getOutgoingRequests(user.uid),
          ]);

          set({
            incomingRequests: incoming,
            outgoingRequests: outgoing,
            requestsLoading: false,
          });

          console.log(
            `[SocialStore] Loaded ${incoming.length} incoming, ${outgoing.length} outgoing requests`
          );
        } catch (error) {
          console.error('[SocialStore] Error loading requests:', error);
          set({ requestsLoading: false });
          throw error;
        }
      },

      /**
       * Send friend request
       */
      sendFriendRequest: async (toUserId: string) => {
        const user = auth().currentUser;
        if (!user) return;

        try {
          const requestId = await friendService.sendFriendRequest(user.uid, toUserId);

          // Reload requests to get updated list
          await get().loadRequests();

          // Update stats
          set((state) => ({
            stats: {
              ...state.stats,
              sentRequests: state.stats.sentRequests + 1,
            },
          }));

          console.log('[SocialStore] Friend request sent');
          return requestId;
        } catch (error) {
          console.error('[SocialStore] Error sending friend request:', error);
          throw error;
        }
      },

      /**
       * Accept friend request
       */
      acceptFriendRequest: async (requestId: string) => {
        const user = auth().currentUser;
        if (!user) return;

        try {
          await friendService.acceptFriendRequest(requestId, user.uid);

          // Reload friends and requests
          await Promise.all([get().loadFriends(), get().loadRequests()]);

          // Update stats
          set((state) => ({
            stats: {
              friendCount: state.stats.friendCount + 1,
              pendingRequests: Math.max(0, state.stats.pendingRequests - 1),
              sentRequests: state.stats.sentRequests,
            },
          }));

          console.log('[SocialStore] Friend request accepted');
        } catch (error) {
          console.error('[SocialStore] Error accepting friend request:', error);
          throw error;
        }
      },

      /**
       * Decline friend request
       */
      declineFriendRequest: async (requestId: string) => {
        const user = auth().currentUser;
        if (!user) return;

        try {
          await friendService.declineFriendRequest(requestId, user.uid);

          // Remove from local state
          set((state) => ({
            incomingRequests: state.incomingRequests.filter((r) => r.id !== requestId),
            stats: {
              ...state.stats,
              pendingRequests: Math.max(0, state.stats.pendingRequests - 1),
            },
          }));

          console.log('[SocialStore] Friend request declined');
        } catch (error) {
          console.error('[SocialStore] Error declining friend request:', error);
          throw error;
        }
      },

      /**
       * Cancel friend request
       */
      cancelFriendRequest: async (requestId: string) => {
        const user = auth().currentUser;
        if (!user) return;

        try {
          await friendService.cancelFriendRequest(requestId, user.uid);

          // Remove from local state
          set((state) => ({
            outgoingRequests: state.outgoingRequests.filter((r) => r.id !== requestId),
            stats: {
              ...state.stats,
              sentRequests: Math.max(0, state.stats.sentRequests - 1),
            },
          }));

          console.log('[SocialStore] Friend request cancelled');
        } catch (error) {
          console.error('[SocialStore] Error cancelling friend request:', error);
          throw error;
        }
      },

      /**
       * Search users by display name
       */
      searchUsers: async (query: string) => {
        const user = auth().currentUser;
        if (!user) return;

        if (!query || query.trim().length < 2) {
          set({ searchResults: [] });
          return;
        }

        try {
          set({ searchLoading: true });

          const results = await friendService.searchUsers(query, user.uid);

          set({
            searchResults: results,
            searchLoading: false,
          });

          console.log(`[SocialStore] Search found ${results.length} users`);
        } catch (error) {
          console.error('[SocialStore] Error searching users:', error);
          set({ searchLoading: false });
          throw error;
        }
      },

      /**
       * Clear search results
       */
      clearSearch: () => {
        set({ searchResults: [], searchLoading: false });
      },

      /**
       * Load social stats
       */
      loadSocialStats: async () => {
        const user = auth().currentUser;
        if (!user) return;

        try {
          const stats = await friendService.getSocialStats(user.uid);
          set({ stats });
          console.log('[SocialStore] Social stats loaded');
        } catch (error) {
          console.error('[SocialStore] Error loading social stats:', error);
          throw error;
        }
      },

      /**
       * Create or update user profile
       */
      createOrUpdateProfile: async (data) => {
        const user = auth().currentUser;
        if (!user) {
          throw new Error('No authenticated user');
        }

        try {
          await friendService.createOrUpdateProfile(user.uid, data);

          // Reload profile
          await get().loadUserProfile();

          console.log('[SocialStore] Profile created/updated');
        } catch (error) {
          console.error('[SocialStore] Error creating/updating profile:', error);
          throw error;
        }
      },

      /**
       * Load user profile
       */
      loadUserProfile: async () => {
        const user = auth().currentUser;
        if (!user) return;

        try {
          const profile = await friendService.getUserProfile(user.uid);
          set({ userProfile: profile });
          console.log('[SocialStore] User profile loaded');
        } catch (error) {
          console.error('[SocialStore] Error loading user profile:', error);
          throw error;
        }
      },

      /**
       * Sync to cloud (backup local data)
       */
      syncToCloud: async () => {
        const user = auth().currentUser;
        if (!user) return;

        try {
          // Social data is already stored in Firestore
          // This method ensures profile is up-to-date
          const { userProfile } = get();

          if (userProfile) {
            await friendService.createOrUpdateProfile(user.uid, {
              displayName: userProfile.displayName,
              photoURL: userProfile.photoURL,
              currentStreak: userProfile.currentStreak,
              totalPractices: userProfile.totalPractices,
              totalMinutes: userProfile.totalMinutes,
              favoriteDeity: userProfile.favoriteDeity,
            });
          }

          set({ lastSyncedAt: new Date().toISOString() });
          console.log('[SocialStore] Synced to cloud');
        } catch (error) {
          console.error('[SocialStore] Error syncing to cloud:', error);
          throw error;
        }
      },

      /**
       * Load from cloud (restore data)
       */
      loadFromCloud: async () => {
        const user = auth().currentUser;
        if (!user) return;

        try {
          // Load all social data
          await Promise.all([
            get().loadUserProfile(),
            get().loadFriends(),
            get().loadRequests(),
            get().loadSocialStats(),
          ]);

          set({ lastSyncedAt: new Date().toISOString() });
          console.log('[SocialStore] Loaded from cloud');
        } catch (error) {
          console.error('[SocialStore] Error loading from cloud:', error);
          throw error;
        }
      },

      /**
       * Reset store (on sign out)
       */
      reset: () => {
        set(initialState);
        console.log('[SocialStore] Store reset');
      },
    }),
    {
      name: 'social-storage',
      storage: asyncStoragePersist,
      // Don't persist loading states
      partialize: (state) => ({
        friends: state.friends,
        incomingRequests: state.incomingRequests,
        outgoingRequests: state.outgoingRequests,
        stats: state.stats,
        userProfile: state.userProfile,
        lastSyncedAt: state.lastSyncedAt,
      }),
    }
  )
);
