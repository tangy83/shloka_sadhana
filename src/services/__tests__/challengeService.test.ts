/**
 * Challenge Service Unit Tests
 * Shloka Sadhana - Phase 2A Week 18
 *
 * Tests for challenge creation, progress tracking, and leaderboard
 */

import { challengeService } from '../challengeService';
import { ChallengeType, ChallengeStatus } from '@/types/challenges';
import type { Challenge, CompletedPractice } from '@/types';

// Mock Firestore
const mockFirestore = {
  collection: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    get: jest.fn(() => Promise.resolve({ docs: [] })),
    doc: jest.fn((id: string) => ({
      get: jest.fn(() => Promise.resolve({ exists: true, data: () => ({}) })),
      set: jest.fn(() => Promise.resolve()),
      update: jest.fn(() => Promise.resolve()),
      collection: jest.fn(() => ({
        doc: jest.fn(() => ({
          set: jest.fn(() => Promise.resolve()),
          get: jest.fn(() => Promise.resolve({ exists: true, data: () => ({}) })),
        })),
        get: jest.fn(() => Promise.resolve({ docs: [] })),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
      })),
    })),
  })),
  FieldValue: {
    increment: jest.fn((value) => value),
  },
};

jest.mock('@react-native-firebase/firestore', () => ({
  __esModule: true,
  default: jest.fn(() => mockFirestore),
}));

describe('challengeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createChallenge', () => {
    it('should create PRACTICES challenge with correct structure', async () => {
      const setSpy = jest.fn(() => Promise.resolve());
      mockFirestore.collection().doc().collection().doc().set = setSpy;

      const challengeData = {
        type: ChallengeType.PRACTICES,
        goal: 100,
        duration: 30, // 30 days
      };

      const challengeId = await challengeService.createChallenge(
        'group-123',
        'test-user-123',
        challengeData.type,
        challengeData.goal,
        challengeData.duration
      );

      expect(setSpy).toHaveBeenCalled();
      const createdChallenge = setSpy.mock.calls[0][0];

      expect(createdChallenge.type).toBe(ChallengeType.PRACTICES);
      expect(createdChallenge.goal).toBe(100);
      expect(createdChallenge.duration).toBe(30);
      expect(createdChallenge.status).toBe(ChallengeStatus.ACTIVE);
      expect(createdChallenge.createdBy).toBe('test-user-123');
      expect(createdChallenge.participantCount).toBe(0);
      expect(createdChallenge.winners).toEqual([]);
      expect(challengeId).toBeDefined();
    });

    it('should calculate correct endsAt timestamp', async () => {
      const setSpy = jest.fn(() => Promise.resolve());
      mockFirestore.collection().doc().collection().doc().set = setSpy;

      const duration = 14; // 14 days
      const startTime = new Date();

      await challengeService.createChallenge(
        'group-123',
        'test-user-123',
        ChallengeType.MALAS,
        1000,
        duration
      );

      const createdChallenge = setSpy.mock.calls[0][0];
      const expectedEndTime = new Date(
        startTime.getTime() + duration * 24 * 60 * 60 * 1000
      );

      const actualEndTime = new Date(createdChallenge.endsAt);
      const timeDiff = Math.abs(actualEndTime.getTime() - expectedEndTime.getTime());

      // Allow 1 second tolerance
      expect(timeDiff).toBeLessThan(1000);
    });

    it('should throw error if invalid challenge duration', async () => {
      await expect(
        challengeService.createChallenge(
          'group-123',
          'test-user-123',
          ChallengeType.PRACTICES,
          100,
          0 // Invalid: 0 days
        )
      ).rejects.toThrow('Challenge duration must be between 1 and 90 days');
    });
  });

  describe('updateChallengeProgress', () => {
    it('should update progress for PRACTICES challenge', async () => {
      const challenge: Challenge = {
        id: 'challenge-123',
        type: ChallengeType.PRACTICES,
        goal: 100,
        duration: 30,
        startedAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: ChallengeStatus.ACTIVE,
        createdBy: 'user-1',
        participantCount: 10,
        winners: [],
      };

      mockFirestore
        .collection()
        .doc()
        .collection()
        .doc()
        .get = jest.fn(() =>
        Promise.resolve({
          exists: true,
          data: () => challenge,
        })
      );

      const leaderboardSetSpy = jest.fn(() => Promise.resolve());
      mockFirestore.collection().doc().collection().doc().set = leaderboardSetSpy;

      const practice: Partial<CompletedPractice> = {
        duration: 600,
        malaCount: 2,
      };

      await challengeService.updateChallengeProgress(
        'group-123',
        'challenge-123',
        'test-user-123',
        practice as CompletedPractice
      );

      expect(leaderboardSetSpy).toHaveBeenCalled();
      const leaderboardUpdate = leaderboardSetSpy.mock.calls[0][0];

      expect(leaderboardUpdate.score).toBeDefined();
    });

    it('should calculate correct score for MALAS challenge', async () => {
      const challenge: Challenge = {
        id: 'challenge-123',
        type: ChallengeType.MALAS,
        goal: 1000,
        duration: 30,
        startedAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: ChallengeStatus.ACTIVE,
        createdBy: 'user-1',
        participantCount: 10,
        winners: [],
      };

      mockFirestore
        .collection()
        .doc()
        .collection()
        .doc()
        .get = jest.fn(() =>
        Promise.resolve({
          exists: true,
          data: () => challenge,
        })
      );

      const practice: Partial<CompletedPractice> = {
        duration: 600,
        malaCount: 3, // User completed 3 malas
      };

      const score = challengeService.calculateChallengeScore(
        challenge.type,
        practice as CompletedPractice
      );

      expect(score).toBe(3); // MALAS challenge counts mala count
    });

    it('should calculate correct score for MINUTES challenge', async () => {
      const challenge: Challenge = {
        id: 'challenge-123',
        type: ChallengeType.MINUTES,
        goal: 1000,
        duration: 30,
        startedAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: ChallengeStatus.ACTIVE,
        createdBy: 'user-1',
        participantCount: 10,
        winners: [],
      };

      const practice: Partial<CompletedPractice> = {
        duration: 720, // 12 minutes
        malaCount: 0,
      };

      const score = challengeService.calculateChallengeScore(
        challenge.type,
        practice as CompletedPractice
      );

      expect(score).toBe(12); // MINUTES challenge counts duration in minutes
    });
  });

  describe('getLeaderboard', () => {
    it('should return leaderboard ordered by score descending', async () => {
      const mockLeaderboard = [
        {
          id: 'user-1',
          data: () => ({
            userId: 'user-1',
            score: 50,
            rank: 1,
            displayName: 'Top User',
          }),
        },
        {
          id: 'user-2',
          data: () => ({
            userId: 'user-2',
            score: 30,
            rank: 2,
            displayName: 'Second User',
          }),
        },
        {
          id: 'user-3',
          data: () => ({
            userId: 'user-3',
            score: 10,
            rank: 3,
            displayName: 'Third User',
          }),
        },
      ];

      mockFirestore
        .collection()
        .doc()
        .collection()
        .doc()
        .collection()
        .get = jest.fn(() => Promise.resolve({ docs: mockLeaderboard }));

      const orderBySpy = jest.spyOn(
        mockFirestore.collection().doc().collection().doc().collection(),
        'orderBy'
      );

      const leaderboard = await challengeService.getLeaderboard(
        'group-123',
        'challenge-123'
      );

      expect(orderBySpy).toHaveBeenCalledWith('score', 'desc');
      expect(leaderboard.length).toBe(3);
      expect(leaderboard[0].score).toBeGreaterThan(leaderboard[1].score);
    });

    it('should limit leaderboard to top 100', async () => {
      const limitSpy = jest.spyOn(
        mockFirestore.collection().doc().collection().doc().collection(),
        'limit'
      );

      await challengeService.getLeaderboard('group-123', 'challenge-123');

      expect(limitSpy).toHaveBeenCalledWith(100);
    });
  });

  describe('checkCompletedChallenges', () => {
    it('should detect challenges that have passed endsAt', async () => {
      const expiredChallenge = {
        id: 'challenge-123',
        data: () => ({
          id: 'challenge-123',
          status: ChallengeStatus.ACTIVE,
          endsAt: new Date(Date.now() - 1000).toISOString(), // 1 second ago
          groupId: 'group-123',
        }),
      };

      mockFirestore.collection().get = jest.fn(() =>
        Promise.resolve({ docs: [expiredChallenge] })
      );

      const completedChallenges = await challengeService.checkCompletedChallenges();

      expect(completedChallenges.length).toBe(1);
      expect(completedChallenges[0].id).toBe('challenge-123');
    });

    it('should update challenge status to COMPLETED', async () => {
      const expiredChallenge = {
        id: 'challenge-123',
        data: () => ({
          id: 'challenge-123',
          status: ChallengeStatus.ACTIVE,
          endsAt: new Date(Date.now() - 1000).toISOString(),
          groupId: 'group-123',
        }),
      };

      mockFirestore.collection().get = jest.fn(() =>
        Promise.resolve({ docs: [expiredChallenge] })
      );

      const updateSpy = jest.fn(() => Promise.resolve());
      mockFirestore
        .collection()
        .doc()
        .collection()
        .doc()
        .update = updateSpy;

      await challengeService.checkCompletedChallenges();

      expect(updateSpy).toHaveBeenCalled();
      const updateData = updateSpy.mock.calls[0][0];

      expect(updateData.status).toBe(ChallengeStatus.COMPLETED);
    });

    it('should determine top 3 winners from leaderboard', async () => {
      const expiredChallenge = {
        id: 'challenge-123',
        data: () => ({
          id: 'challenge-123',
          status: ChallengeStatus.ACTIVE,
          endsAt: new Date(Date.now() - 1000).toISOString(),
          groupId: 'group-123',
        }),
      };

      const mockLeaderboard = [
        { id: 'user-1', data: () => ({ userId: 'user-1', score: 100, rank: 1 }) },
        { id: 'user-2', data: () => ({ userId: 'user-2', score: 80, rank: 2 }) },
        { id: 'user-3', data: () => ({ userId: 'user-3', score: 60, rank: 3 }) },
        { id: 'user-4', data: () => ({ userId: 'user-4', score: 40, rank: 4 }) },
      ];

      mockFirestore.collection().get = jest.fn(() =>
        Promise.resolve({ docs: [expiredChallenge] })
      );

      mockFirestore
        .collection()
        .doc()
        .collection()
        .doc()
        .collection()
        .get = jest.fn(() => Promise.resolve({ docs: mockLeaderboard }));

      const updateSpy = jest.fn(() => Promise.resolve());
      mockFirestore
        .collection()
        .doc()
        .collection()
        .doc()
        .update = updateSpy;

      await challengeService.checkCompletedChallenges();

      const updateData = updateSpy.mock.calls[0][0];
      expect(updateData.winners).toHaveLength(3);
      expect(updateData.winners).toContain('user-1');
      expect(updateData.winners).toContain('user-2');
      expect(updateData.winners).toContain('user-3');
      expect(updateData.winners).not.toContain('user-4');
    });
  });

  describe('recalculateRanks', () => {
    it('should assign correct ranks based on score', async () => {
      const mockLeaderboard = [
        {
          id: 'user-1',
          ref: { update: jest.fn() },
          data: () => ({ userId: 'user-1', score: 100 }),
        },
        {
          id: 'user-2',
          ref: { update: jest.fn() },
          data: () => ({ userId: 'user-2', score: 80 }),
        },
        {
          id: 'user-3',
          ref: { update: jest.fn() },
          data: () => ({ userId: 'user-3', score: 80 }), // Tie
        },
      ];

      mockFirestore
        .collection()
        .doc()
        .collection()
        .doc()
        .collection()
        .get = jest.fn(() => Promise.resolve({ docs: mockLeaderboard }));

      await challengeService.recalculateRanks('group-123', 'challenge-123');

      expect(mockLeaderboard[0].ref.update).toHaveBeenCalledWith({ rank: 1 });
      expect(mockLeaderboard[1].ref.update).toHaveBeenCalledWith({ rank: 2 });
      expect(mockLeaderboard[2].ref.update).toHaveBeenCalledWith({ rank: 2 }); // Tie gets same rank
    });
  });
});
