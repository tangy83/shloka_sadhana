/**
 * Group Store
 * Shloka Sadhana - Phase 2A Week 17: Group System
 *
 * Zustand store for group state management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Group,
  GroupMember,
  GroupInvite,
  GroupDiscoveryItem,
  GroupStats,
  CreateGroupData,
} from '@/types/groups';
import { groupService } from '@/services/groupService';
import { CompletedPractice } from '@/types/practice';
import { asyncStoragePersist } from './middleware/storage';
import auth from '@react-native-firebase/auth';

interface GroupState {
  // My Groups
  myGroups: Group[];
  myGroupsLoading: boolean;

  // Group Invites
  groupInvites: GroupInvite[];
  invitesLoading: boolean;

  // Discovery
  publicGroups: GroupDiscoveryItem[];
  discoveryLoading: boolean;

  // Stats
  groupStats: GroupStats;

  // Actions
  loadMyGroups: () => Promise<void>;
  loadGroupInvites: () => Promise<void>;
  loadPublicGroups: () => Promise<void>;
  createGroup: (data: CreateGroupData) => Promise<Group>;
  joinGroup: (groupId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  inviteToGroup: (groupId: string, friendId: string) => Promise<void>;
  acceptInvite: (inviteId: string) => Promise<void>;
  declineInvite: (inviteId: string) => Promise<void>;
  updateGroupStatsAfterPractice: (practice: CompletedPractice) => Promise<void>;
  refreshStats: () => Promise<void>;
  reset: () => void;
}

export const useGroupStore = create<GroupState>()(
  persist(
    (set, get) => ({
      // Initial state
      myGroups: [],
      myGroupsLoading: false,
      groupInvites: [],
      invitesLoading: false,
      publicGroups: [],
      discoveryLoading: false,
      groupStats: {
        totalGroups: 0,
        groupsAsAdmin: 0,
        groupsAsMember: 0,
        totalGroupPractices: 0,
        mostActiveGroup: null,
      },

      /**
       * Load user's groups
       */
      loadMyGroups: async () => {
        const user = auth().currentUser;
        if (!user) {
          console.log('[GroupStore] No authenticated user, skipping load');
          return;
        }

        set({ myGroupsLoading: true });

        try {
          const groups = await groupService.getUserGroups(user.uid);

          set({
            myGroups: groups,
            myGroupsLoading: false,
          });

          console.log('[GroupStore] Loaded my groups:', groups.length);
        } catch (error) {
          console.error('[GroupStore] Error loading my groups:', error);
          set({ myGroupsLoading: false });
        }
      },

      /**
       * Load group invites
       */
      loadGroupInvites: async () => {
        const user = auth().currentUser;
        if (!user) {
          console.log('[GroupStore] No authenticated user, skipping load');
          return;
        }

        set({ invitesLoading: true });

        try {
          const invites = await groupService.getPendingInvites(user.uid);

          set({
            groupInvites: invites,
            invitesLoading: false,
          });

          console.log('[GroupStore] Loaded group invites:', invites.length);
        } catch (error) {
          console.error('[GroupStore] Error loading invites:', error);
          set({ invitesLoading: false });
        }
      },

      /**
       * Load public groups for discovery
       */
      loadPublicGroups: async () => {
        const user = auth().currentUser;
        if (!user) {
          console.log('[GroupStore] No authenticated user, skipping load');
          return;
        }

        set({ discoveryLoading: true });

        try {
          const groups = await groupService.discoverPublicGroups(user.uid);

          set({
            publicGroups: groups,
            discoveryLoading: false,
          });

          console.log('[GroupStore] Loaded public groups:', groups.length);
        } catch (error) {
          console.error('[GroupStore] Error loading public groups:', error);
          set({ discoveryLoading: false });
        }
      },

      /**
       * Create a new group
       */
      createGroup: async (data: CreateGroupData) => {
        try {
          const group = await groupService.createGroup(data);

          // Add to my groups
          set({
            myGroups: [group, ...get().myGroups],
          });

          // Refresh stats
          await get().refreshStats();

          console.log('[GroupStore] Group created:', group.id);
          return group;
        } catch (error) {
          console.error('[GroupStore] Error creating group:', error);
          throw error;
        }
      },

      /**
       * Join a public group
       */
      joinGroup: async (groupId: string) => {
        try {
          await groupService.joinGroup(groupId);

          // Reload groups
          await get().loadMyGroups();
          await get().loadPublicGroups();
          await get().refreshStats();

          console.log('[GroupStore] Joined group:', groupId);
        } catch (error) {
          console.error('[GroupStore] Error joining group:', error);
          throw error;
        }
      },

      /**
       * Leave a group
       */
      leaveGroup: async (groupId: string) => {
        try {
          await groupService.leaveGroup(groupId);

          // Remove from my groups
          set({
            myGroups: get().myGroups.filter((g) => g.id !== groupId),
          });

          // Refresh stats
          await get().refreshStats();

          console.log('[GroupStore] Left group:', groupId);
        } catch (error) {
          console.error('[GroupStore] Error leaving group:', error);
          throw error;
        }
      },

      /**
       * Invite friend to group
       */
      inviteToGroup: async (groupId: string, friendId: string) => {
        try {
          await groupService.inviteToGroup(groupId, friendId);

          console.log('[GroupStore] Invite sent to group:', groupId);
        } catch (error) {
          console.error('[GroupStore] Error inviting to group:', error);
          throw error;
        }
      },

      /**
       * Accept group invite
       */
      acceptInvite: async (inviteId: string) => {
        try {
          await groupService.acceptGroupInvite(inviteId);

          // Remove from invites
          set({
            groupInvites: get().groupInvites.filter((i) => i.id !== inviteId),
          });

          // Reload groups
          await get().loadMyGroups();
          await get().refreshStats();

          console.log('[GroupStore] Invite accepted:', inviteId);
        } catch (error) {
          console.error('[GroupStore] Error accepting invite:', error);
          throw error;
        }
      },

      /**
       * Decline group invite
       */
      declineInvite: async (inviteId: string) => {
        try {
          await groupService.declineGroupInvite(inviteId);

          // Remove from invites
          set({
            groupInvites: get().groupInvites.filter((i) => i.id !== inviteId),
          });

          console.log('[GroupStore] Invite declined:', inviteId);
        } catch (error) {
          console.error('[GroupStore] Error declining invite:', error);
          throw error;
        }
      },

      /**
       * Update group stats after practice completion
       * Called from PracticeScreen after completing practice
       */
      updateGroupStatsAfterPractice: async (practice: CompletedPractice) => {
        const user = auth().currentUser;
        if (!user) {
          return;
        }

        const { myGroups } = get();

        if (myGroups.length === 0) {
          return;
        }

        try {
          // Update stats for all user's groups (non-blocking)
          for (const group of myGroups) {
            groupService
              .updateGroupStats(group.id, user.uid, practice)
              .catch((error) => {
                console.error('[GroupStore] Error updating group stats:', error);
                // Non-blocking - don't interrupt practice flow
              });
          }

          console.log('[GroupStore] Group stats update triggered');
        } catch (error) {
          console.error('[GroupStore] Error in updateGroupStatsAfterPractice:', error);
          // Non-blocking
        }
      },

      /**
       * Refresh group statistics
       */
      refreshStats: async () => {
        const user = auth().currentUser;
        if (!user) {
          return;
        }

        try {
          const stats = await groupService.getUserGroupStats(user.uid);

          set({ groupStats: stats });

          console.log('[GroupStore] Group stats refreshed');
        } catch (error) {
          console.error('[GroupStore] Error refreshing stats:', error);
        }
      },

      /**
       * Reset store (on sign out)
       */
      reset: () => {
        set({
          myGroups: [],
          myGroupsLoading: false,
          groupInvites: [],
          invitesLoading: false,
          publicGroups: [],
          discoveryLoading: false,
          groupStats: {
            totalGroups: 0,
            groupsAsAdmin: 0,
            groupsAsMember: 0,
            totalGroupPractices: 0,
            mostActiveGroup: null,
          },
        });
      },
    }),
    {
      name: 'group-storage',
      storage: asyncStoragePersist,
      // Only persist essential state
      partialize: (state) => ({
        myGroups: state.myGroups,
        groupStats: state.groupStats,
      }),
    }
  )
);

/**
 * Helper: Get group count
 */
export const getGroupCount = (): number => {
  return useGroupStore.getState().myGroups.length;
};

/**
 * Helper: Get pending invites count
 */
export const getPendingInvitesCount = (): number => {
  return useGroupStore.getState().groupInvites.length;
};

/**
 * Helper: Check if user is in group
 */
export const isInGroup = (groupId: string): boolean => {
  return useGroupStore.getState().myGroups.some((g) => g.id === groupId);
};
