/**
 * Referral Service Unit Tests
 * Shloka Sadhana - Phase 2A Week 18
 *
 * Tests for referral code generation, validation, and reward distribution
 */

import { referralService } from '../referralService';
import { ReferralStatus, REFERRAL_REWARD_THRESHOLDS } from '@/types/referrals';

// Mock Firestore
const mockFirestore = {
  collection: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    get: jest.fn(() => Promise.resolve({ docs: [] })),
    doc: jest.fn((id: string) => ({
      get: jest.fn(() => Promise.resolve({ exists: false, data: () => ({}) })),
      set: jest.fn(() => Promise.resolve()),
      update: jest.fn(() => Promise.resolve()),
    })),
  })),
  FieldValue: {
    increment: jest.fn((value) => value),
    arrayUnion: jest.fn((value) => value),
  },
};

jest.mock('@react-native-firebase/firestore', () => ({
  __esModule: true,
  default: jest.fn(() => mockFirestore),
}));

// Mock auth
jest.mock('@react-native-firebase/auth', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    currentUser: { uid: 'test-user-123', displayName: 'Priya Sharma' },
  })),
}));

// Mock achievement service
jest.mock('../achievementService', () => ({
  achievementService: {
    unlockAchievement: jest.fn(),
  },
}));

// Mock quest store
jest.mock('@/stores/useQuestStore', () => ({
  useQuestStore: {
    getState: jest.fn(() => ({
      addXP: jest.fn(),
    })),
  },
}));

describe('referralService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateReferralCode', () => {
    it('should generate code from displayName and userId', () => {
      const code = referralService.generateReferralCode('Priya Sharma', 'user-abc-123');

      expect(code).toMatch(/^PRIYA[A-Z0-9]{4}$/); // First name + 4 chars from userId
      expect(code.length).toBeLessThanOrEqual(10); // Max length
    });

    it('should generate code from single-word displayName', () => {
      const code = referralService.generateReferralCode('Krishna', 'user-xyz-789');

      expect(code).toMatch(/^KRISHNA[A-Z0-9]{4}$/);
    });

    it('should handle long displayNames by truncating', () => {
      const code = referralService.generateReferralCode(
        'VeryLongFirstName',
        'user-123'
      );

      expect(code.length).toBeLessThanOrEqual(10);
    });

    it('should generate unique codes for same name', () => {
      const code1 = referralService.generateReferralCode('Priya', 'user-111');
      const code2 = referralService.generateReferralCode('Priya', 'user-222');

      expect(code1).not.toBe(code2);
    });

    it('should append random suffix if code collision detected', async () => {
      // Mock collision detection
      mockFirestore.collection().doc().get = jest.fn(() =>
        Promise.resolve({ exists: true }) // Code already exists
      );

      const code = await referralService.generateUniqueReferralCode(
        'Priya Sharma',
        'user-123'
      );

      // Should have added random suffix
      expect(code.length).toBeGreaterThan(8);
    });
  });

  describe('validateReferralCode', () => {
    it('should return true for valid existing code', async () => {
      mockFirestore.collection().doc().get = jest.fn(() =>
        Promise.resolve({
          exists: true,
          data: () => ({
            userId: 'referrer-123',
            code: 'PRIYA2024',
          }),
        })
      );

      const isValid = await referralService.validateReferralCode('PRIYA2024');

      expect(isValid).toBe(true);
    });

    it('should return false for non-existent code', async () => {
      mockFirestore.collection().doc().get = jest.fn(() =>
        Promise.resolve({ exists: false })
      );

      const isValid = await referralService.validateReferralCode('INVALID');

      expect(isValid).toBe(false);
    });

    it('should be case-insensitive', async () => {
      mockFirestore.collection().doc().get = jest.fn(() =>
        Promise.resolve({
          exists: true,
          data: () => ({ userId: 'referrer-123' }),
        })
      );

      const isValid1 = await referralService.validateReferralCode('PRIYA2024');
      const isValid2 = await referralService.validateReferralCode('priya2024');

      expect(isValid1).toBe(true);
      expect(isValid2).toBe(true);
    });
  });

  describe('recordReferral', () => {
    it('should create referral document with correct structure', async () => {
      mockFirestore.collection().doc().get = jest.fn(() =>
        Promise.resolve({
          exists: true,
          data: () => ({
            userId: 'referrer-123',
            code: 'PRIYA2024',
          }),
        })
      );

      const setSpy = jest.fn(() => Promise.resolve());
      mockFirestore.collection().doc().set = setSpy;

      await referralService.recordReferral('PRIYA2024', 'referee-456');

      expect(setSpy).toHaveBeenCalled();
      const referralData = setSpy.mock.calls[0][0];

      expect(referralData.referrerId).toBe('referrer-123');
      expect(referralData.refereeId).toBe('referee-456');
      expect(referralData.referralCode).toBe('PRIYA2024');
      expect(referralData.status).toBe(ReferralStatus.PENDING);
      expect(referralData.rewardsAwarded).toBe(false);
    });

    it('should update referee user profile with referrer', async () => {
      mockFirestore.collection().doc().get = jest.fn(() =>
        Promise.resolve({
          exists: true,
          data: () => ({
            userId: 'referrer-123',
          }),
        })
      );

      const updateSpy = jest.fn(() => Promise.resolve());
      mockFirestore.collection().doc().update = updateSpy;

      await referralService.recordReferral('PRIYA2024', 'referee-456');

      expect(updateSpy).toHaveBeenCalledWith({
        'referral.referredBy': 'referrer-123',
      });
    });

    it('should increment referrer totalReferrals', async () => {
      mockFirestore.collection().doc().get = jest.fn(() =>
        Promise.resolve({
          exists: true,
          data: () => ({
            userId: 'referrer-123',
          }),
        })
      );

      const updateSpy = jest.fn(() => Promise.resolve());
      mockFirestore.collection().doc().update = updateSpy;

      await referralService.recordReferral('PRIYA2024', 'referee-456');

      expect(updateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          'referral.totalReferrals': expect.anything(),
          'referral.referredUsers': expect.anything(),
        })
      );
    });
  });

  describe('awardReferralRewards', () => {
    it('should award XP to both referee and referrer', async () => {
      mockFirestore.collection().doc().get = jest.fn(() =>
        Promise.resolve({
          exists: true,
          data: () => ({
            referrerId: 'referrer-123',
            refereeId: 'referee-456',
            status: ReferralStatus.PENDING,
            rewardsAwarded: false,
          }),
        })
      );

      const { useQuestStore } = require('@/stores/useQuestStore');
      const addXPSpy = jest.fn();
      useQuestStore.getState.mockReturnValue({ addXP: addXPSpy });

      await referralService.awardReferralRewards('referee-456');

      expect(addXPSpy).toHaveBeenCalledWith(
        REFERRAL_REWARD_THRESHOLDS.REFEREE_SIGNUP.xp
      );
    });

    it('should unlock "welcomed_by_community" badge for referee', async () => {
      mockFirestore.collection().doc().get = jest.fn(() =>
        Promise.resolve({
          exists: true,
          data: () => ({
            referrerId: 'referrer-123',
            refereeId: 'referee-456',
            status: ReferralStatus.PENDING,
          }),
        })
      );

      const { achievementService } = require('../achievementService');

      await referralService.awardReferralRewards('referee-456');

      expect(achievementService.unlockAchievement).toHaveBeenCalledWith(
        'referee-456',
        REFERRAL_REWARD_THRESHOLDS.REFEREE_SIGNUP.badge
      );
    });

    it('should update referral status to COMPLETED', async () => {
      mockFirestore.collection().doc().get = jest.fn(() =>
        Promise.resolve({
          exists: true,
          data: () => ({
            referrerId: 'referrer-123',
            refereeId: 'referee-456',
            status: ReferralStatus.PENDING,
            rewardsAwarded: false,
          }),
        })
      );

      const updateSpy = jest.fn(() => Promise.resolve());
      mockFirestore.collection().doc().update = updateSpy;

      await referralService.awardReferralRewards('referee-456');

      expect(updateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ReferralStatus.COMPLETED,
          rewardsAwarded: true,
        })
      );
    });

    it('should increment referrer successfulReferrals count', async () => {
      mockFirestore.collection().doc().get = jest.fn(() =>
        Promise.resolve({
          exists: true,
          data: () => ({
            referrerId: 'referrer-123',
            refereeId: 'referee-456',
            status: ReferralStatus.PENDING,
          }),
        })
      );

      const updateSpy = jest.fn(() => Promise.resolve());
      mockFirestore.collection().doc().update = updateSpy;

      await referralService.awardReferralRewards('referee-456');

      expect(updateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          'referral.successfulReferrals': expect.anything(),
          'referral.xpEarned': expect.anything(),
        })
      );
    });

    it('should unlock "spiritual_guide" badge at 5 successful referrals', async () => {
      mockFirestore.collection().doc().get = jest
        .fn()
        .mockResolvedValueOnce({
          exists: true,
          data: () => ({
            referrerId: 'referrer-123',
            refereeId: 'referee-456',
            status: ReferralStatus.PENDING,
          }),
        })
        .mockResolvedValueOnce({
          exists: true,
          data: () => ({
            referral: {
              successfulReferrals: 5, // Just reached 5
            },
          }),
        });

      const { achievementService } = require('../achievementService');

      await referralService.awardReferralRewards('referee-456');

      expect(achievementService.unlockAchievement).toHaveBeenCalledWith(
        'referrer-123',
        REFERRAL_REWARD_THRESHOLDS.REFERRER_GUIDE.badge
      );
    });

    it('should NOT award rewards twice', async () => {
      mockFirestore.collection().doc().get = jest.fn(() =>
        Promise.resolve({
          exists: true,
          data: () => ({
            referrerId: 'referrer-123',
            refereeId: 'referee-456',
            status: ReferralStatus.COMPLETED,
            rewardsAwarded: true, // Already awarded
          }),
        })
      );

      const { useQuestStore } = require('@/stores/useQuestStore');
      const addXPSpy = jest.fn();
      useQuestStore.getState.mockReturnValue({ addXP: addXPSpy });

      await referralService.awardReferralRewards('referee-456');

      expect(addXPSpy).not.toHaveBeenCalled();
    });
  });

  describe('getReferralStats', () => {
    it('should return referral stats for user', async () => {
      mockFirestore.collection().doc().get = jest.fn(() =>
        Promise.resolve({
          exists: true,
          data: () => ({
            referral: {
              referralCode: 'PRIYA2024',
              totalReferrals: 10,
              successfulReferrals: 7,
              xpEarned: 350,
            },
          }),
        })
      );

      const stats = await referralService.getReferralStats('test-user-123');

      expect(stats).toEqual({
        referralCode: 'PRIYA2024',
        totalReferrals: 10,
        successfulReferrals: 7,
        pendingReferrals: 3,
        xpEarned: 350,
      });
    });

    it('should return default stats for new users', async () => {
      mockFirestore.collection().doc().get = jest.fn(() =>
        Promise.resolve({
          exists: false,
        })
      );

      const stats = await referralService.getReferralStats('new-user-123');

      expect(stats).toEqual({
        referralCode: '',
        totalReferrals: 0,
        successfulReferrals: 0,
        pendingReferrals: 0,
        xpEarned: 0,
      });
    });
  });
});
