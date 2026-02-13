/**
 * Referral Types
 * Shloka Sadhana - Phase 2A Week 18: Referral Program
 *
 * Types for referral system with rewards for both referrer and referee
 */

/**
 * Referral Code
 * Unique code for each user to invite others
 */
export interface ReferralCode {
  code: string;
  userId: string;
  createdAt: string;
  usageCount: number;
}

/**
 * Referral Relationship
 * Tracks who referred whom
 */
export interface Referral {
  id: string;
  referrerId: string; // User who sent the invite
  refereeId: string; // User who signed up with code
  referralCode: string;
  status: ReferralStatus;
  signedUpAt: string;
  firstPracticeCompletedAt: string | null;
  rewardsAwarded: boolean;
  createdAt: string;
}

/**
 * Referral Status
 */
export type ReferralStatus =
  | 'pending' // Signed up but not practiced
  | 'completed' // Completed first practice, rewards awarded
  | 'expired'; // Never completed first practice after 30 days

/**
 * User Referral Data
 * Stored in user's document
 */
export interface UserReferralData {
  referralCode: string; // User's unique code
  referredBy: string | null; // Who referred this user (userId)
  totalReferrals: number; // Total people who signed up with code
  successfulReferrals: number; // People who completed first practice
  pendingReferrals: number; // Signed up but not practiced
  xpEarned: number; // Total XP from referrals
  referredUsers: string[]; // List of referee userIds
  lastReferralAt: string | null; // When last referral signed up
}

/**
 * Referral Reward
 */
export interface ReferralReward {
  type: 'xp' | 'badge';
  value: number | string; // XP amount or badge ID
  awardedTo: 'referrer' | 'referee';
  awardedAt: string;
}

/**
 * Referral Stats
 * For leaderboard and analytics
 */
export interface ReferralStats {
  userId: string;
  displayName: string;
  photoURL: string | null;
  totalReferrals: number;
  successfulReferrals: number;
  rank: number;
  xpEarned: number;
}

/**
 * Referral Leaderboard Entry
 */
export interface ReferralLeaderboardEntry {
  userId: string;
  displayName: string;
  photoURL: string | null;
  successfulReferrals: number;
  rank: number;
  xpEarned: number;
}

/**
 * Referral Reward Thresholds
 */
export const REFERRAL_REWARD_THRESHOLDS = {
  // Referee rewards (new user)
  REFEREE_SIGNUP: {
    xp: 50,
    badge: 'welcomed_by_community',
  },

  // Referrer rewards
  REFERRER_FIRST: {
    xp: 50,
    count: 1,
  },
  REFERRER_GUIDE: {
    badge: 'spiritual_guide',
    count: 5,
  },
  REFERRER_TEACHER: {
    badge: 'spiritual_teacher',
    count: 10,
  },
  REFERRER_GURU: {
    badge: 'spiritual_guru',
    count: 25,
  },
};

/**
 * Referral Link
 */
export interface ReferralLink {
  url: string; // Deep link: shlokasadhana.app/invite/{code}
  code: string;
  shareText: string;
}
