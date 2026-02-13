/**
 * Group Service
 * Shloka Sadhana - Phase 2A Week 17: Group System
 *
 * Manages group operations: create, join, leave, invite, stats
 */

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { friendService } from './friendService';
import {
  Group,
  GroupMember,
  GroupInvite,
  GroupDiscoveryItem,
  GroupStats,
  CreateGroupData,
  UpdateGroupData,
  GroupRole,
} from '@/types/groups';
import { CompletedPractice } from '@/types/practice';
import { analyticsService } from './analytics';

/**
 * Group Service Class
 */
class GroupService {
  /**
   * Create a new group
   */
  async createGroup(data: CreateGroupData): Promise<Group> {
    const user = auth().currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }

    try {
      // Generate group ID
      const groupRef = firestore().collection('groups').doc();

      // Get user profile for denormalization
      const profile = await friendService.getUserProfile(user.uid);
      if (!profile) {
        throw new Error('User profile not found');
      }

      const group: Group = {
        id: groupRef.id,
        name: data.name,
        description: data.description,
        iconUrl: data.iconUrl || null,
        privacy: data.privacy,
        createdBy: user.uid,
        createdAt: new Date().toISOString(),
        memberCount: 1,
        stats: {
          totalPractices: 0,
          totalMalas: 0,
          totalMinutes: 0,
        },
        activeChallenge: null,
      };

      // Create group document
      await groupRef.set(group);

      // Add creator as admin member
      const memberRef = groupRef.collection('members').doc(user.uid);
      const member: GroupMember = {
        userId: user.uid,
        displayName: profile.displayName,
        photoURL: profile.photoURL,
        role: 'admin',
        joinedAt: new Date().toISOString(),
        stats: {
          practices: 0,
          malas: 0,
          minutes: 0,
        },
        isActive: false,
      };

      await memberRef.set(member);

      // Track analytics
      analyticsService.trackEvent('group_created', {
        group_id: group.id,
        privacy: group.privacy,
      });

      console.log('[GroupService] Group created:', group.id);
      return group;
    } catch (error) {
      console.error('[GroupService] Error creating group:', error);
      throw error;
    }
  }

  /**
   * Get group by ID
   */
  async getGroup(groupId: string): Promise<Group | null> {
    try {
      const doc = await firestore().collection('groups').doc(groupId).get();

      if (!doc.exists) {
        return null;
      }

      return doc.data() as Group;
    } catch (error) {
      console.error('[GroupService] Error getting group:', error);
      throw error;
    }
  }

  /**
   * Get groups user is member of
   */
  async getUserGroups(userId: string): Promise<Group[]> {
    try {
      // Query all groups where user is a member
      const groupsSnapshot = await firestore()
        .collectionGroup('members')
        .where('userId', '==', userId)
        .get();

      const groupIds = groupsSnapshot.docs.map((doc) => doc.ref.parent.parent!.id);

      if (groupIds.length === 0) {
        return [];
      }

      // Fetch full group data
      const groups: Group[] = [];
      for (const groupId of groupIds) {
        const group = await this.getGroup(groupId);
        if (group) {
          groups.push(group);
        }
      }

      // Sort by most recent first
      groups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return groups;
    } catch (error) {
      console.error('[GroupService] Error getting user groups:', error);
      throw error;
    }
  }

  /**
   * Get group members
   */
  async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    try {
      const snapshot = await firestore()
        .collection('groups')
        .doc(groupId)
        .collection('members')
        .get();

      const members: GroupMember[] = [];
      snapshot.forEach((doc) => {
        members.push(doc.data() as GroupMember);
      });

      // Sort: admins first, then by join date
      members.sort((a, b) => {
        if (a.role === 'admin' && b.role !== 'admin') return -1;
        if (a.role !== 'admin' && b.role === 'admin') return 1;
        return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
      });

      return members;
    } catch (error) {
      console.error('[GroupService] Error getting group members:', error);
      throw error;
    }
  }

  /**
   * Check if user is member of group
   */
  async isGroupMember(groupId: string, userId: string): Promise<boolean> {
    try {
      const doc = await firestore()
        .collection('groups')
        .doc(groupId)
        .collection('members')
        .doc(userId)
        .get();

      return doc.exists;
    } catch (error) {
      console.error('[GroupService] Error checking group membership:', error);
      return false;
    }
  }

  /**
   * Get user's role in group
   */
  async getUserRole(groupId: string, userId: string): Promise<GroupRole | null> {
    try {
      const doc = await firestore()
        .collection('groups')
        .doc(groupId)
        .collection('members')
        .doc(userId)
        .get();

      if (!doc.exists) {
        return null;
      }

      const member = doc.data() as GroupMember;
      return member.role;
    } catch (error) {
      console.error('[GroupService] Error getting user role:', error);
      return null;
    }
  }

  /**
   * Join a public group
   */
  async joinGroup(groupId: string): Promise<void> {
    const user = auth().currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }

    try {
      // Get group
      const group = await this.getGroup(groupId);
      if (!group) {
        throw new Error('Group not found');
      }

      // Check if group is public
      if (group.privacy !== 'public') {
        throw new Error('Cannot join private group without invite');
      }

      // Check if already member
      const isMember = await this.isGroupMember(groupId, user.uid);
      if (isMember) {
        throw new Error('Already a member of this group');
      }

      // Get user profile
      const profile = await friendService.getUserProfile(user.uid);
      if (!profile) {
        throw new Error('User profile not found');
      }

      // Add member
      const memberRef = firestore()
        .collection('groups')
        .doc(groupId)
        .collection('members')
        .doc(user.uid);

      const member: GroupMember = {
        userId: user.uid,
        displayName: profile.displayName,
        photoURL: profile.photoURL,
        role: 'member',
        joinedAt: new Date().toISOString(),
        stats: {
          practices: 0,
          malas: 0,
          minutes: 0,
        },
        isActive: false,
      };

      await memberRef.set(member);

      // Increment member count
      await firestore()
        .collection('groups')
        .doc(groupId)
        .update({
          memberCount: firestore.FieldValue.increment(1),
        });

      // Track analytics
      analyticsService.trackEvent('group_joined', {
        group_id: groupId,
        join_method: 'public',
      });

      console.log('[GroupService] Joined group:', groupId);
    } catch (error) {
      console.error('[GroupService] Error joining group:', error);
      throw error;
    }
  }

  /**
   * Leave a group
   */
  async leaveGroup(groupId: string): Promise<void> {
    const user = auth().currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }

    try {
      // Check if user is group creator
      const group = await this.getGroup(groupId);
      if (!group) {
        throw new Error('Group not found');
      }

      if (group.createdBy === user.uid) {
        throw new Error('Group creator cannot leave. Transfer ownership or delete the group.');
      }

      // Remove member
      await firestore()
        .collection('groups')
        .doc(groupId)
        .collection('members')
        .doc(user.uid)
        .delete();

      // Decrement member count
      await firestore()
        .collection('groups')
        .doc(groupId)
        .update({
          memberCount: firestore.FieldValue.increment(-1),
        });

      // Track analytics
      analyticsService.trackEvent('group_left', {
        group_id: groupId,
      });

      console.log('[GroupService] Left group:', groupId);
    } catch (error) {
      console.error('[GroupService] Error leaving group:', error);
      throw error;
    }
  }

  /**
   * Invite friend to group
   */
  async inviteToGroup(groupId: string, friendId: string): Promise<void> {
    const user = auth().currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }

    try {
      // Check if user is member of group
      const isMember = await this.isGroupMember(groupId, user.uid);
      if (!isMember) {
        throw new Error('You must be a member to invite others');
      }

      // Check if friend is already member
      const friendIsMember = await this.isGroupMember(groupId, friendId);
      if (friendIsMember) {
        throw new Error('User is already a member');
      }

      // Check for existing pending invite
      const existingInvite = await firestore()
        .collection('groupInvites')
        .where('groupId', '==', groupId)
        .where('toUserId', '==', friendId)
        .where('status', '==', 'pending')
        .get();

      if (!existingInvite.empty) {
        throw new Error('Invite already sent');
      }

      // Get group and user profiles
      const group = await this.getGroup(groupId);
      if (!group) {
        throw new Error('Group not found');
      }

      const userProfile = await friendService.getUserProfile(user.uid);
      if (!userProfile) {
        throw new Error('User profile not found');
      }

      // Create invite
      const inviteRef = firestore().collection('groupInvites').doc();
      const invite: GroupInvite = {
        id: inviteRef.id,
        groupId,
        groupName: group.name,
        fromUserId: user.uid,
        fromUserName: userProfile.displayName,
        toUserId: friendId,
        status: 'pending',
        createdAt: new Date().toISOString(),
        respondedAt: null,
      };

      await inviteRef.set(invite);

      // Track analytics
      analyticsService.trackEvent('group_invite_sent', {
        group_id: groupId,
      });

      console.log('[GroupService] Group invite sent:', inviteRef.id);
    } catch (error) {
      console.error('[GroupService] Error inviting to group:', error);
      throw error;
    }
  }

  /**
   * Get pending group invites for user
   */
  async getPendingInvites(userId: string): Promise<GroupInvite[]> {
    try {
      const snapshot = await firestore()
        .collection('groupInvites')
        .where('toUserId', '==', userId)
        .where('status', '==', 'pending')
        .orderBy('createdAt', 'desc')
        .get();

      const invites: GroupInvite[] = [];
      snapshot.forEach((doc) => {
        invites.push(doc.data() as GroupInvite);
      });

      return invites;
    } catch (error) {
      console.error('[GroupService] Error getting pending invites:', error);
      throw error;
    }
  }

  /**
   * Accept group invite
   */
  async acceptGroupInvite(inviteId: string): Promise<void> {
    const user = auth().currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }

    try {
      const inviteDoc = await firestore()
        .collection('groupInvites')
        .doc(inviteId)
        .get();

      if (!inviteDoc.exists) {
        throw new Error('Invite not found');
      }

      const invite = inviteDoc.data() as GroupInvite;

      // Verify invite is for current user
      if (invite.toUserId !== user.uid) {
        throw new Error('Invalid invite');
      }

      // Check if already member
      const isMember = await this.isGroupMember(invite.groupId, user.uid);
      if (isMember) {
        throw new Error('Already a member');
      }

      // Get user profile
      const profile = await friendService.getUserProfile(user.uid);
      if (!profile) {
        throw new Error('User profile not found');
      }

      // Add as member
      const memberRef = firestore()
        .collection('groups')
        .doc(invite.groupId)
        .collection('members')
        .doc(user.uid);

      const member: GroupMember = {
        userId: user.uid,
        displayName: profile.displayName,
        photoURL: profile.photoURL,
        role: 'member',
        joinedAt: new Date().toISOString(),
        stats: {
          practices: 0,
          malas: 0,
          minutes: 0,
        },
        isActive: false,
      };

      await memberRef.set(member);

      // Increment member count
      await firestore()
        .collection('groups')
        .doc(invite.groupId)
        .update({
          memberCount: firestore.FieldValue.increment(1),
        });

      // Update invite status
      await firestore()
        .collection('groupInvites')
        .doc(inviteId)
        .update({
          status: 'accepted',
          respondedAt: new Date().toISOString(),
        });

      // Track analytics
      analyticsService.trackEvent('group_joined', {
        group_id: invite.groupId,
        join_method: 'invite',
      });

      console.log('[GroupService] Group invite accepted:', inviteId);
    } catch (error) {
      console.error('[GroupService] Error accepting invite:', error);
      throw error;
    }
  }

  /**
   * Decline group invite
   */
  async declineGroupInvite(inviteId: string): Promise<void> {
    const user = auth().currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }

    try {
      const inviteDoc = await firestore()
        .collection('groupInvites')
        .doc(inviteId)
        .get();

      if (!inviteDoc.exists) {
        throw new Error('Invite not found');
      }

      const invite = inviteDoc.data() as GroupInvite;

      // Verify invite is for current user
      if (invite.toUserId !== user.uid) {
        throw new Error('Invalid invite');
      }

      // Update invite status
      await firestore()
        .collection('groupInvites')
        .doc(inviteId)
        .update({
          status: 'rejected',
          respondedAt: new Date().toISOString(),
        });

      console.log('[GroupService] Group invite declined:', inviteId);
    } catch (error) {
      console.error('[GroupService] Error declining invite:', error);
      throw error;
    }
  }

  /**
   * Discover public groups
   */
  async discoverPublicGroups(userId: string): Promise<GroupDiscoveryItem[]> {
    try {
      const snapshot = await firestore()
        .collection('groups')
        .where('privacy', '==', 'public')
        .orderBy('memberCount', 'desc')
        .limit(20)
        .get();

      const groups: Group[] = [];
      snapshot.forEach((doc) => {
        groups.push(doc.data() as Group);
      });

      // Get membership status for each group
      const discoveryItems: GroupDiscoveryItem[] = [];
      for (const group of groups) {
        const isMember = await this.isGroupMember(group.id, userId);
        const memberDoc = await firestore()
          .collection('groups')
          .doc(group.id)
          .collection('members')
          .doc(userId)
          .get();

        const memberSince = memberDoc.exists
          ? (memberDoc.data() as GroupMember).joinedAt
          : undefined;

        // Check for pending invite
        const pendingInvite = await firestore()
          .collection('groupInvites')
          .where('groupId', '==', group.id)
          .where('toUserId', '==', userId)
          .where('status', '==', 'pending')
          .get();

        discoveryItems.push({
          ...group,
          isMember,
          hasPendingInvite: !pendingInvite.empty,
          memberSince,
        });
      }

      return discoveryItems;
    } catch (error) {
      console.error('[GroupService] Error discovering groups:', error);
      throw error;
    }
  }

  /**
   * Update group practice stats after user completes practice
   */
  async updateGroupStats(groupId: string, userId: string, practice: CompletedPractice): Promise<void> {
    try {
      // Check if user is member
      const isMember = await this.isGroupMember(groupId, userId);
      if (!isMember) {
        return;
      }

      const minutes = Math.floor(practice.duration / 60);

      // Update group stats
      await firestore()
        .collection('groups')
        .doc(groupId)
        .update({
          'stats.totalPractices': firestore.FieldValue.increment(1),
          'stats.totalMalas': firestore.FieldValue.increment(practice.malaCount),
          'stats.totalMinutes': firestore.FieldValue.increment(minutes),
        });

      // Update member stats
      await firestore()
        .collection('groups')
        .doc(groupId)
        .collection('members')
        .doc(userId)
        .update({
          'stats.practices': firestore.FieldValue.increment(1),
          'stats.malas': firestore.FieldValue.increment(practice.malaCount),
          'stats.minutes': firestore.FieldValue.increment(minutes),
          isActive: true,
        });

      console.log('[GroupService] Group stats updated for:', groupId);
    } catch (error) {
      console.error('[GroupService] Error updating group stats:', error);
      // Don't throw - stat updates shouldn't break practice flow
    }
  }

  /**
   * Get group stats for user
   */
  async getUserGroupStats(userId: string): Promise<GroupStats> {
    try {
      const groups = await this.getUserGroups(userId);

      let totalGroupPractices = 0;
      let groupsAsAdmin = 0;
      let groupsAsMember = 0;
      let mostActiveGroup: GroupStats['mostActiveGroup'] = null;

      for (const group of groups) {
        const memberDoc = await firestore()
          .collection('groups')
          .doc(group.id)
          .collection('members')
          .doc(userId)
          .get();

        if (memberDoc.exists) {
          const member = memberDoc.data() as GroupMember;
          totalGroupPractices += member.stats.practices;

          if (member.role === 'admin') {
            groupsAsAdmin++;
          } else {
            groupsAsMember++;
          }

          // Track most active group
          if (!mostActiveGroup || member.stats.practices > mostActiveGroup.practiceCount) {
            mostActiveGroup = {
              groupId: group.id,
              groupName: group.name,
              practiceCount: member.stats.practices,
            };
          }
        }
      }

      return {
        totalGroups: groups.length,
        groupsAsAdmin,
        groupsAsMember,
        totalGroupPractices,
        mostActiveGroup,
      };
    } catch (error) {
      console.error('[GroupService] Error getting group stats:', error);
      return {
        totalGroups: 0,
        groupsAsAdmin: 0,
        groupsAsMember: 0,
        totalGroupPractices: 0,
        mostActiveGroup: null,
      };
    }
  }

  /**
   * Update group details (admin only)
   */
  async updateGroup(groupId: string, data: UpdateGroupData): Promise<void> {
    const user = auth().currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }

    try {
      // Check if user is admin
      const role = await this.getUserRole(groupId, user.uid);
      if (role !== 'admin') {
        throw new Error('Only admins can update group');
      }

      // Update group
      await firestore().collection('groups').doc(groupId).update(data);

      console.log('[GroupService] Group updated:', groupId);
    } catch (error) {
      console.error('[GroupService] Error updating group:', error);
      throw error;
    }
  }

  /**
   * Delete group (creator only)
   */
  async deleteGroup(groupId: string): Promise<void> {
    const user = auth().currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }

    try {
      // Check if user is creator
      const group = await this.getGroup(groupId);
      if (!group) {
        throw new Error('Group not found');
      }

      if (group.createdBy !== user.uid) {
        throw new Error('Only group creator can delete group');
      }

      // Delete all members
      const membersSnapshot = await firestore()
        .collection('groups')
        .doc(groupId)
        .collection('members')
        .get();

      const batch = firestore().batch();
      membersSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // Delete group
      batch.delete(firestore().collection('groups').doc(groupId));

      await batch.commit();

      // Track analytics
      analyticsService.trackEvent('group_deleted', {
        group_id: groupId,
      });

      console.log('[GroupService] Group deleted:', groupId);
    } catch (error) {
      console.error('[GroupService] Error deleting group:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const groupService = new GroupService();

// Export class for testing
export { GroupService };
