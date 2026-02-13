/**
 * Referral Service
 * Shloka Sadhana - Phase 2A Week 18: Referral Program
 *
 * Manages referral codes, tracking, and rewards
 */

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {
  ReferralCode,
  Referral,
  UserReferralData,
  ReferralReward,
  ReferralStats,
  ReferralLeaderboardEntry,
  ReferralLink,
  REFERRAL_REWARD_THRESHOLDS,
  ReferralStatus,
} from '@/types/referrals';
import { useAchievementStore } from '@/stores/useAchievementStore';
import { useQuestStore } from '@/stores/useQuestStore';

class ReferralService {
  /**
   * Generate unique referral code for user
   * Format: FIRSTNAME + last 4 chars of userId (e.g., PRIYA2024)
   */
  generateReferralCode(displayName: string, userId: string): string {
    // Extract first name (before first space)
    const firstName = displayName.split(' ')[0].toUpperCase();

    // Get last 4 characters of userId
    const suffix = userId.slice(-4).toUpperCase();

    return `${firstName}${suffix}`;
  }

  /**
   * Create referral code for user
   * Called during onboarding or first app launch
   */
  async createReferralCode(userId: string, displayName: string): Promise<string> {
    try {
      const code = this.generateReferralCode(displayName, userId);

      // Check if code already exists (collision handling)
      const existingCode = await firestore()
        .collection('referrals')
        .doc(code)
        .get();

      if (existingCode.exists) {
        // Collision - add random number
        const randomSuffix = Math.floor(Math.random() * 100);
        const newCode = `${code}${randomSuffix}`;
        return this.createReferralCode(userId, newCode); // Recursive with modified name
      }

      // Create referral code document
      const referralCode: ReferralCode = {
        code,
        userId,
        createdAt: new Date().toISOString(),
        usageCount: 0,
      };

      await firestore().collection('referrals').doc(code).set(referralCode);

      // Initialize user's referral data
      const userReferralData: UserReferralData = {
        referralCode: code,
        referredBy: null,
        totalReferrals: 0,
        successfulReferrals: 0,
        pendingReferrals: 0,
        xpEarned: 0,
        referredUsers: [],
        lastReferralAt: null,
      };

      await firestore()
        .collection('users')
        .doc(userId)
        .set({ referral: userReferralData }, { merge: true });

      console.log('[ReferralService] Referral code created:', code);
      return code;
    } catch (error) {
      console.error('[ReferralService] Error creating referral code:', error);
      throw error;
    }
  }

  /**
   * Get user's referral code
   */
  async getUserReferralCode(userId: string): Promise<string | null> {
    try {
      const userDoc = await firestore().collection('users').doc(userId).get();

      if (!userDoc.exists) {
        return null;
      }

      return userDoc.data()?.referral?.referralCode || null;
    } catch (error) {
      console.error('[ReferralService] Error getting referral code:', error);
      return null;
    }
  }

  /**
   * Validate referral code exists
   */
  async validateReferralCode(code: string): Promise<boolean> {
    try {
      const codeDoc = await firestore().collection('referrals').doc(code).get();

      return codeDoc.exists;
    } catch (error) {
      console.error('[ReferralService] Error validating code:', error);
      return false;
    }
  }

  /**
   * Get referrer userId from code
   */
  async getReferrerFromCode(code: string): Promise<string | null> {
    try {
      const codeDoc = await firestore().collection('referrals').doc(code).get();

      if (!codeDoc.exists) {
        return null;
      }

      return codeDoc.data()?.userId || null;
    } catch (error) {
      console.error('[ReferralService] Error getting referrer:', error);
      return null;
    }
  }

  /**
   * Record referral relationship
   * Called when new user signs up with referral code
   */
  async recordReferral(referralCode: string, newUserId: string): Promise<void> {
    try {
      // Validate code
      const isValid = await this.validateReferralCode(referralCode);
      if (!isValid) {
        throw new Error('Invalid referral code');
      }

      // Get referrer userId
      const referrerId = await this.getReferrerFromCode(referralCode);
      if (!referrerId) {
        throw new Error('Referrer not found');
      }

      // Prevent self-referral
      if (referrerId === newUserId) {
        throw new Error('Cannot use your own referral code');
      }

      // Create referral document
      const referral: Referral = {
        id: `${referrerId}_${newUserId}`,
        referrerId,
        refereeId: newUserId,
        referralCode,
        status: 'pending',
        signedUpAt: new Date().toISOString(),
        firstPracticeCompletedAt: null,
        rewardsAwarded: false,
        createdAt: new Date().toISOString(),
      };

      await firestore()
        .collection('referralRelationships')
        .doc(referral.id)
        .set(referral);

      // Update referrer's stats
      await firestore()
        .collection('users')
        .doc(referrerId)
        .update({
          'referral.totalReferrals': firestore.FieldValue.increment(1),
          'referral.pendingReferrals': firestore.FieldValue.increment(1),
          'referral.referredUsers': firestore.FieldValue.arrayUnion(newUserId),
          'referral.lastReferralAt': new Date().toISOString(),
        });

      // Increment code usage count
      await firestore()
        .collection('referrals')
        .doc(referralCode)
        .update({
          usageCount: firestore.FieldValue.increment(1),
        });

      // Store in new user's profile
      await firestore()
        .collection('users')
        .doc(newUserId)
        .update({
          'referral.referredBy': referrerId,
        });

      console.log('[ReferralService] Referral recorded:', referral.id);
    } catch (error) {
      console.error('[ReferralService] Error recording referral:', error);
      throw error;
    }
  }

  /**
   * Award referral rewards after referee completes first practice
   */
  async awardReferralRewards(refereeId: string): Promise<void> {
    try {
      // Get referee's referral data
      const refereeDoc = await firestore().collection('users').doc(refereeId).get();

      if (!refereeDoc.exists) {
        console.log('[ReferralService] Referee document not found');
        return;
      }

      const referredBy = refereeDoc.data()?.referral?.referredBy;

      if (!referredBy) {
        console.log('[ReferralService] No referrer found for referee');
        return;
      }

      // Find referral relationship
      const referralId = `${referredBy}_${refereeId}`;
      const referralDoc = await firestore()
        .collection('referralRelationships')
        .doc(referralId)
        .get();

      if (!referralDoc.exists) {
        console.log('[ReferralService] Referral relationship not found');
        return;
      }

      const referral = referralDoc.data() as Referral;

      // Check if already awarded
      if (referral.rewardsAwarded) {
        console.log('[ReferralService] Rewards already awarded');
        return;
      }

      // Award referee (new user)
      await this.awardRefereeReward(refereeId);

      // Award referrer
      await this.awardReferrerReward(referredBy);

      // Update referral status
      await firestore()
        .collection('referralRelationships')
        .doc(referralId)
        .update({
          status: 'completed',
          firstPracticeCompletedAt: new Date().toISOString(),
          rewardsAwarded: true,
        });

      // Update referrer's stats
      await firestore()
        .collection('users')
        .doc(referredBy)
        .update({
          'referral.successfulReferrals': firestore.FieldValue.increment(1),
          'referral.pendingReferrals': firestore.FieldValue.increment(-1),
        });

      console.log('[ReferralService] Referral rewards awarded');
    } catch (error) {
      console.error('[ReferralService] Error awarding rewards:', error);
      throw error;
    }
  }

  /**
   * Award reward to referee (new user who completed first practice)
   */
  private async awardRefereeReward(refereeId: string): Promise<void> {
    try {
      // Award XP
      await useQuestStore.getState().addXP(REFERRAL_REWARD_THRESHOLDS.REFEREE_SIGNUP.xp);

      // Unlock badge
      await useAchievementStore
        .getState()
        .unlockAchievement(REFERRAL_REWARD_THRESHOLDS.REFEREE_SIGNUP.badge);

      console.log('[ReferralService] Referee reward awarded:', refereeId);
    } catch (error) {
      console.error('[ReferralService] Error awarding referee reward:', error);
    }
  }

  /**
   * Award reward to referrer
   */
  private async awardReferrerReward(referrerId: string): Promise<void> {
    try {
      // Award XP for each successful referral
      const xpReward = REFERRAL_REWARD_THRESHOLDS.REFERRER_FIRST.xp;

      await firestore()
        .collection('users')
        .doc(referrerId)
        .update({
          'referral.xpEarned': firestore.FieldValue.increment(xpReward),
        });

      // Check for badge milestones
      const referrerDoc = await firestore().collection('users').doc(referrerId).get();
      const successfulReferrals = referrerDoc.data()?.referral?.successfulReferrals || 0;

      // Unlock badges at milestones
      if (successfulReferrals === REFERRAL_REWARD_THRESHOLDS.REFERRER_GUIDE.count) {
        await useAchievementStore
          .getState()
          .unlockAchievement(REFERRAL_REWARD_THRESHOLDS.REFERRER_GUIDE.badge);
      } else if (successfulReferrals === REFERRAL_REWARD_THRESHOLDS.REFERRER_TEACHER.count) {
        await useAchievementStore
          .getState()
          .unlockAchievement(REFERRAL_REWARD_THRESHOLDS.REFERRER_TEACHER.badge);
      } else if (successfulReferrals === REFERRAL_REWARD_THRESHOLDS.REFERRER_GURU.count) {
        await useAchievementStore
          .getState()
          .unlockAchievement(REFERRAL_REWARD_THRESHOLDS.REFERRER_GURU.badge);
      }

      console.log('[ReferralService] Referrer reward awarded:', referrerId);
    } catch (error) {
      console.error('[ReferralService] Error awarding referrer reward:', error);
    }
  }

  /**
   * Get user's referral data
   */
  async getUserReferralData(userId: string): Promise<UserReferralData | null> {
    try {
      const userDoc = await firestore().collection('users').doc(userId).get();

      if (!userDoc.exists) {
        return null;
      }

      return userDoc.data()?.referral || null;
    } catch (error) {
      console.error('[ReferralService] Error getting referral data:', error);
      return null;
    }
  }

  /**
   * Get referral link for sharing
   */
  getReferralLink(code: string): ReferralLink {
    const url = `https://shlokasadhana.app/invite/${code}`;
    const shareText = `Join me on Shloka Sadhana! Use my code ${code} to start your spiritual practice journey. ${url}`;

    return {
      url,
      code,
      shareText,
    };
  }

  /**
   * Get referral leaderboard (top 10)
   */
  async getReferralLeaderboard(limit: number = 10): Promise<ReferralLeaderboardEntry[]> {
    try {
      const usersSnapshot = await firestore()
        .collection('users')
        .orderBy('referral.successfulReferrals', 'desc')
        .limit(limit)
        .get();

      const leaderboard: ReferralLeaderboardEntry[] = [];
      let rank = 1;

      for (const doc of usersSnapshot.docs) {
        const data = doc.data();
        const referralData = data.referral as UserReferralData;

        // Get public profile for display name and photo
        const profileDoc = await firestore()
          .collection('publicProfiles')
          .doc(doc.id)
          .get();

        const profile = profileDoc.data();

        leaderboard.push({
          userId: doc.id,
          displayName: profile?.displayName || 'Anonymous',
          photoURL: profile?.photoURL || null,
          successfulReferrals: referralData?.successfulReferrals || 0,
          rank,
          xpEarned: referralData?.xpEarned || 0,
        });

        rank++;
      }

      return leaderboard;
    } catch (error) {
      console.error('[ReferralService] Error getting leaderboard:', error);
      return [];
    }
  }

  /**
   * Get user's pending referrals (signed up but not practiced)
   */
  async getPendingReferrals(userId: string): Promise<Referral[]> {
    try {
      const referralsSnapshot = await firestore()
        .collection('referralRelationships')
        .where('referrerId', '==', userId)
        .where('status', '==', 'pending')
        .orderBy('signedUpAt', 'desc')
        .get();

      const referrals: Referral[] = [];

      for (const doc of referralsSnapshot.docs) {
        referrals.push(doc.data() as Referral);
      }

      return referrals;
    } catch (error) {
      console.error('[ReferralService] Error getting pending referrals:', error);
      return [];
    }
  }

  /**
   * Check for expired referrals (signed up >30 days ago, never practiced)
   * Called periodically via Cloud Function
   */
  async expireOldPendingReferrals(): Promise<void> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const expiredSnapshot = await firestore()
        .collection('referralRelationships')
        .where('status', '==', 'pending')
        .where('signedUpAt', '<', thirtyDaysAgo.toISOString())
        .get();

      const batch = firestore().batch();

      expiredSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          status: 'expired',
        });

        // Decrement pending count for referrer
        const referral = doc.data() as Referral;
        const referrerRef = firestore().collection('users').doc(referral.referrerId);
        batch.update(referrerRef, {
          'referral.pendingReferrals': firestore.FieldValue.increment(-1),
        });
      });

      await batch.commit();

      console.log(`[ReferralService] Expired ${expiredSnapshot.size} old pending referrals`);
    } catch (error) {
      console.error('[ReferralService] Error expiring old referrals:', error);
    }
  }
}

export const referralService = new ReferralService();
