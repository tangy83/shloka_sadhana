/**
 * Group Types
 * Shloka Sadhana - Phase 2A Week 17: Group System
 *
 * Types for group practice and challenges
 */

/**
 * Group Privacy Settings
 */
export type GroupPrivacy = 'public' | 'private';

/**
 * Group Member Role
 */
export type GroupRole = 'admin' | 'member';

/**
 * Group Member
 */
export interface GroupMember {
  userId: string;
  displayName: string;
  photoURL: string | null;
  role: GroupRole;
  joinedAt: string; // ISO timestamp
  stats: {
    practices: number; // Total practices in this group
    malas: number;
    minutes: number;
  };
  isActive: boolean; // Has practiced in last 7 days
}

/**
 * Group
 */
export interface Group {
  id: string;
  name: string;
  description: string;
  iconUrl: string | null;
  privacy: GroupPrivacy;
  createdBy: string; // User ID
  createdAt: string; // ISO timestamp
  memberCount: number;
  stats: {
    totalPractices: number;
    totalMalas: number;
    totalMinutes: number;
  };
  activeChallenge: {
    id: string;
    endsAt: string;
  } | null;
}

/**
 * Group Invite
 */
export interface GroupInvite {
  id: string;
  groupId: string;
  groupName: string; // Denormalized for display
  fromUserId: string;
  fromUserName: string; // Denormalized for display
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string; // ISO timestamp
  respondedAt: string | null;
}

/**
 * Group Stats (for analytics)
 */
export interface GroupStats {
  totalGroups: number;
  groupsAsAdmin: number;
  groupsAsMember: number;
  totalGroupPractices: number;
  mostActiveGroup: {
    groupId: string;
    groupName: string;
    practiceCount: number;
  } | null;
}

/**
 * Group Discovery Item
 * Extended group with membership status
 */
export interface GroupDiscoveryItem extends Group {
  isMember: boolean;
  hasPendingInvite: boolean;
  memberSince?: string; // ISO timestamp if member
}

/**
 * Group Creation Data
 */
export interface CreateGroupData {
  name: string;
  description: string;
  privacy: GroupPrivacy;
  iconUrl?: string | null;
}

/**
 * Group Update Data
 */
export interface UpdateGroupData {
  name?: string;
  description?: string;
  privacy?: GroupPrivacy;
  iconUrl?: string | null;
}
