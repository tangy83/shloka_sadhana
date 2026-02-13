/**
 * Challenge Service
 * Shloka Sadhana - Phase 2A Week 18: Group Challenges
 *
 * Manages group challenges: create, update leaderboard, determine winners
 */

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { groupService } from './groupService';
import { friendService } from './friendService';
import {
  Challenge,
  ChallengeLeaderboardEntry,
  ChallengeProgress,
  ChallengeStats,
  CreateChallengeData,
  ChallengeType,
  ChallengeStatus,
  ChallengeDuration,
} from '@/types/challenges';
import { CompletedPractice } from '@/types/practice';
import { analyticsService } from './analytics';

/**
 * Challenge Service Class
 */
class ChallengeService {
  /**
   * Create a new challenge (admin only)
   */
  async createChallenge(groupId: string, data: CreateChallengeData): Promise<Challenge> {
    const user = auth().currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }

    try {
      // Verify user is admin
      const role = await groupService.getUserRole(groupId, user.uid);
      if (role !== 'admin') {
        throw new Error('Only group admins can create challenges');
      }

      // Get group info
      const group = await groupService.getGroup(groupId);
      if (!group) {
        throw new Error('Group not found');
      }

      // Get user profile
      const profile = await friendService.getUserProfile(user.uid);
      if (!profile) {
        throw new Error('User profile not found');
      }

      // Calculate end date
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + data.duration);

      // Create challenge
      const challengeRef = firestore()
        .collection('groups')
        .doc(groupId)
        .collection('challenges')
        .doc();

      const challenge: Challenge = {
        id: challengeRef.id,
        groupId,
        groupName: group.name,
        type: data.type,
        goal: data.goal,
        duration: data.duration,
        startedAt: startDate.toISOString(),
        endsAt: endDate.toISOString(),
        status: 'active',
        createdBy: user.uid,
        createdByName: profile.displayName,
        participantCount: 0,
        winners: [],
        createdAt: new Date().toISOString(),
        completedAt: null,
      };

      await challengeRef.set(challenge);

      // Update group's active challenge
      await firestore()
        .collection('groups')
        .doc(groupId)
        .update({
          activeChallenge: {
            id: challenge.id,
            endsAt: challenge.endsAt,
          },
        });

      // Track analytics
      analyticsService.trackEvent('challenge_created', {
        challenge_id: challenge.id,
        challenge_type: challenge.type,
        duration_days: challenge.duration,
        goal: challenge.goal,
      });

      console.log('[ChallengeService] Challenge created:', challenge.id);
      return challenge;
    } catch (error) {
      console.error('[ChallengeService] Error creating challenge:', error);
      throw error;
    }
  }

  /**
   * Get challenge by ID
   */
  async getChallenge(groupId: string, challengeId: string): Promise<Challenge | null> {
    try {
      const doc = await firestore()
        .collection('groups')
        .doc(groupId)
        .collection('challenges')
        .doc(challengeId)
        .get();

      if (!doc.exists) {
        return null;
      }

      return doc.data() as Challenge;
    } catch (error) {
      console.error('[ChallengeService] Error getting challenge:', error);
      throw error;
    }
  }

  /**
   * Get active challenge for group
   */
  async getActiveChallenge(groupId: string): Promise<Challenge | null> {
    try {
      const snapshot = await firestore()
        .collection('groups')
        .doc(groupId)
        .collection('challenges')
        .where('status', '==', 'active')
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      return snapshot.docs[0].data() as Challenge;
    } catch (error) {
      console.error('[ChallengeService] Error getting active challenge:', error);
      throw error;
    }
  }

  /**
   * Get challenge history for group
   */
  async getChallengeHistory(
    groupId: string,
    limit: number = 10
  ): Promise<Challenge[]> {
    try {
      const snapshot = await firestore()
        .collection('groups')
        .doc(groupId)
        .collection('challenges')
        .where('status', 'in', ['completed', 'cancelled'])
        .orderBy('completedAt', 'desc')
        .limit(limit)
        .get();

      const challenges: Challenge[] = [];
      snapshot.forEach((doc) => {
        challenges.push(doc.data() as Challenge);
      });

      return challenges;
    } catch (error) {
      console.error('[ChallengeService] Error getting challenge history:', error);
      throw error;
    }
  }

  /**
   * Update challenge progress after practice
   */
  async updateChallengeProgress(
    groupId: string,
    challengeId: string,
    userId: string,
    practice: CompletedPractice
  ): Promise<void> {
    try {
      const challenge = await this.getChallenge(groupId, challengeId);
      if (!challenge || challenge.status !== 'active') {
        return;
      }

      // Calculate score increment based on challenge type
      let scoreIncrement = 0;
      switch (challenge.type) {
        case 'practices':
          scoreIncrement = 1;
          break;
        case 'malas':
          scoreIncrement = practice.malaCount;
          break;
        case 'minutes':
          scoreIncrement = Math.floor(practice.duration / 60);
          break;
        case 'consistency':
          // For consistency challenges, we track streak separately
          // This will be handled in a streak calculation
          return;
        default:
          return;
      }

      // Get user profile
      const profile = await friendService.getUserProfile(userId);
      if (!profile) {
        return;
      }

      // Update leaderboard entry
      const leaderboardRef = firestore()
        .collection('groups')
        .doc(groupId)
        .collection('challenges')
        .doc(challengeId)
        .collection('leaderboard')
        .doc(userId);

      const existingDoc = await leaderboardRef.get();

      if (existingDoc.exists) {
        // Increment existing score
        await leaderboardRef.update({
          score: firestore.FieldValue.increment(scoreIncrement),
          lastUpdated: new Date().toISOString(),
        });
      } else {
        // Create new leaderboard entry
        const entry: ChallengeLeaderboardEntry = {
          userId,
          displayName: profile.displayName,
          photoURL: profile.photoURL,
          score: scoreIncrement,
          rank: 0, // Will be recalculated
          lastUpdated: new Date().toISOString(),
          isCurrentUser: false,
        };

        await leaderboardRef.set(entry);

        // Increment participant count
        await firestore()
          .collection('groups')
          .doc(groupId)
          .collection('challenges')
          .doc(challengeId)
          .update({
            participantCount: firestore.FieldValue.increment(1),
          });
      }

      // Recalculate ranks
      await this.recalculateRanks(groupId, challengeId);

      console.log('[ChallengeService] Challenge progress updated:', challengeId);
    } catch (error) {
      console.error('[ChallengeService] Error updating challenge progress:', error);
      // Don't throw - progress updates shouldn't break practice flow
    }
  }

  /**
   * Recalculate leaderboard ranks
   */
  private async recalculateRanks(groupId: string, challengeId: string): Promise<void> {
    try {
      const snapshot = await firestore()
        .collection('groups')
        .doc(groupId)
        .collection('challenges')
        .doc(challengeId)
        .collection('leaderboard')
        .orderBy('score', 'desc')
        .get();

      const batch = firestore().batch();
      let rank = 1;

      snapshot.forEach((doc) => {
        batch.update(doc.ref, { rank });
        rank++;
      });

      await batch.commit();
    } catch (error) {
      console.error('[ChallengeService] Error recalculating ranks:', error);
    }
  }

  /**
   * Get challenge leaderboard
   */
  async getLeaderboard(
    groupId: string,
    challengeId: string,
    limit: number = 50
  ): Promise<ChallengeLeaderboardEntry[]> {
    try {
      const user = auth().currentUser;

      const snapshot = await firestore()
        .collection('groups')
        .doc(groupId)
        .collection('challenges')
        .doc(challengeId)
        .collection('leaderboard')
        .orderBy('score', 'desc')
        .limit(limit)
        .get();

      const entries: ChallengeLeaderboardEntry[] = [];
      snapshot.forEach((doc) => {
        const entry = doc.data() as ChallengeLeaderboardEntry;
        entry.isCurrentUser = user ? entry.userId === user.uid : false;
        entries.push(entry);
      });

      return entries;
    } catch (error) {
      console.error('[ChallengeService] Error getting leaderboard:', error);
      throw error;
    }
  }

  /**
   * Get user's progress in challenge
   */
  async getUserProgress(
    groupId: string,
    challengeId: string,
    userId: string
  ): Promise<ChallengeProgress | null> {
    try {
      const [challenge, leaderboardDoc] = await Promise.all([
        this.getChallenge(groupId, challengeId),
        firestore()
          .collection('groups')
          .doc(groupId)
          .collection('challenges')
          .doc(challengeId)
          .collection('leaderboard')
          .doc(userId)
          .get(),
      ]);

      if (!challenge) {
        return null;
      }

      if (!leaderboardDoc.exists) {
        return {
          challengeId,
          userId,
          score: 0,
          rank: 0,
          percentToGoal: 0,
          isWinner: false,
        };
      }

      const entry = leaderboardDoc.data() as ChallengeLeaderboardEntry;

      return {
        challengeId,
        userId,
        score: entry.score,
        rank: entry.rank,
        percentToGoal: Math.min(Math.round((entry.score / challenge.goal) * 100), 100),
        isWinner: entry.rank <= 3 && challenge.status === 'completed',
      };
    } catch (error) {
      console.error('[ChallengeService] Error getting user progress:', error);
      return null;
    }
  }

  /**
   * Check for completed challenges and announce winners
   * Should be called periodically or via Cloud Function
   */
  async checkCompletedChallenges(): Promise<void> {
    try {
      const now = new Date();

      // Find all active challenges that have ended
      const expiredSnapshot = await firestore()
        .collectionGroup('challenges')
        .where('status', '==', 'active')
        .where('endsAt', '<', now.toISOString())
        .get();

      for (const doc of expiredSnapshot.docs) {
        const challenge = doc.data() as Challenge;

        // Get top 3 from leaderboard
        const leaderboard = await this.getLeaderboard(
          challenge.groupId,
          challenge.id,
          3
        );

        const winners = leaderboard.map((entry) => entry.userId);

        // Update challenge status
        await doc.ref.update({
          status: 'completed',
          completedAt: new Date().toISOString(),
          winners,
        });

        // Clear group's active challenge
        await firestore()
          .collection('groups')
          .doc(challenge.groupId)
          .update({
            activeChallenge: null,
          });

        // Award achievements to winners (integration with achievement system)
        // This would unlock "Challenge Winner" badge for top 3

        // Track analytics
        analyticsService.trackEvent('challenge_completed', {
          challenge_id: challenge.id,
          challenge_type: challenge.type,
          winner_count: winners.length,
          participant_count: challenge.participantCount,
        });

        console.log('[ChallengeService] Challenge completed:', challenge.id);
      }
    } catch (error) {
      console.error('[ChallengeService] Error checking completed challenges:', error);
    }
  }

  /**
   * Cancel a challenge (admin only)
   */
  async cancelChallenge(groupId: string, challengeId: string): Promise<void> {
    const user = auth().currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }

    try {
      // Verify user is admin
      const role = await groupService.getUserRole(groupId, user.uid);
      if (role !== 'admin') {
        throw new Error('Only group admins can cancel challenges');
      }

      // Update challenge status
      await firestore()
        .collection('groups')
        .doc(groupId)
        .collection('challenges')
        .doc(challengeId)
        .update({
          status: 'cancelled',
          completedAt: new Date().toISOString(),
        });

      // Clear group's active challenge
      await firestore()
        .collection('groups')
        .doc(groupId)
        .update({
          activeChallenge: null,
        });

      console.log('[ChallengeService] Challenge cancelled:', challengeId);
    } catch (error) {
      console.error('[ChallengeService] Error cancelling challenge:', error);
      throw error;
    }
  }

  /**
   * Get user's challenge statistics
   */
  async getUserChallengeStats(userId: string): Promise<ChallengeStats> {
    try {
      // Query all challenges where user participated
      const snapshot = await firestore()
        .collectionGroup('leaderboard')
        .where('userId', '==', userId)
        .get();

      let totalChallenges = 0;
      let activeChallenges = 0;
      let completedChallenges = 0;
      let challengesWon = 0;
      let totalWins = 0;
      let mostRecentWin: ChallengeStats['mostRecentWin'] = null;

      // Get unique challenge IDs
      const challengeIds = new Set<string>();
      snapshot.forEach((doc) => {
        const challengeId = doc.ref.parent.parent!.id;
        challengeIds.add(challengeId);
      });

      // Check each challenge
      for (const challengeId of challengeIds) {
        // Find the challenge document
        const challengeSnapshot = await firestore()
          .collectionGroup('challenges')
          .where(firestore.FieldPath.documentId(), '==', challengeId)
          .get();

        if (!challengeSnapshot.empty) {
          const challenge = challengeSnapshot.docs[0].data() as Challenge;
          totalChallenges++;

          if (challenge.status === 'active') {
            activeChallenges++;
          } else if (challenge.status === 'completed') {
            completedChallenges++;

            // Check if user won
            const userRank = challenge.winners.indexOf(userId) + 1;
            if (userRank > 0) {
              totalWins++;
              if (userRank === 1) {
                challengesWon++;
              }

              // Check if most recent win
              if (
                !mostRecentWin ||
                new Date(challenge.completedAt!) > new Date(mostRecentWin.completedAt)
              ) {
                mostRecentWin = {
                  challengeId: challenge.id,
                  challengeName: `${challenge.groupName} - ${this.getChallengeTypeName(challenge.type)}`,
                  rank: userRank,
                  completedAt: challenge.completedAt!,
                };
              }
            }
          }
        }
      }

      return {
        totalChallenges,
        activeChallenges,
        completedChallenges,
        challengesWon,
        totalWins,
        mostRecentWin,
      };
    } catch (error) {
      console.error('[ChallengeService] Error getting challenge stats:', error);
      return {
        totalChallenges: 0,
        activeChallenges: 0,
        completedChallenges: 0,
        challengesWon: 0,
        totalWins: 0,
        mostRecentWin: null,
      };
    }
  }

  /**
   * Helper: Get human-readable challenge type name
   */
  private getChallengeTypeName(type: ChallengeType): string {
    switch (type) {
      case 'practices':
        return 'Practice Challenge';
      case 'malas':
        return 'Mala Challenge';
      case 'minutes':
        return 'Minutes Challenge';
      case 'consistency':
        return 'Consistency Challenge';
      default:
        return 'Challenge';
    }
  }

  /**
   * Helper: Get challenge description
   */
  getChallengeDescription(challenge: Challenge): string {
    const typeNames = {
      practices: 'practice sessions',
      malas: 'malas',
      minutes: 'minutes',
      consistency: 'day streak',
    };

    return `First to ${challenge.goal} ${typeNames[challenge.type]}`;
  }

  /**
   * Helper: Get time remaining
   */
  getTimeRemaining(challenge: Challenge): string {
    const now = new Date();
    const end = new Date(challenge.endsAt);
    const diffMs = end.getTime() - now.getTime();

    if (diffMs <= 0) {
      return 'Ended';
    }

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    } else if (hours > 0) {
      return `${hours}h remaining`;
    } else {
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${minutes}m remaining`;
    }
  }

  /**
   * Listen to challenge leaderboard updates (real-time)
   */
  onLeaderboardChange(
    groupId: string,
    challengeId: string,
    callback: (entries: ChallengeLeaderboardEntry[]) => void
  ): () => void {
    const user = auth().currentUser;

    const unsubscribe = firestore()
      .collection('groups')
      .doc(groupId)
      .collection('challenges')
      .doc(challengeId)
      .collection('leaderboard')
      .orderBy('score', 'desc')
      .limit(50)
      .onSnapshot(
        (snapshot) => {
          const entries: ChallengeLeaderboardEntry[] = [];
          snapshot.forEach((doc) => {
            const entry = doc.data() as ChallengeLeaderboardEntry;
            entry.isCurrentUser = user ? entry.userId === user.uid : false;
            entries.push(entry);
          });
          callback(entries);
        },
        (error) => {
          console.error('[ChallengeService] Error in leaderboard listener:', error);
        }
      );

    return unsubscribe;
  }
}

// Export singleton instance
export const challengeService = new ChallengeService();

// Export class for testing
export { ChallengeService };
