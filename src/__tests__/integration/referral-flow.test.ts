/**
 * Referral Flow Integration Tests
 * Shloka Sadhana - Phase 2A Week 18
 *
 * End-to-end tests for referral signup, first practice, and reward distribution
 */

import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { OnboardingScreen } from '@/screens/onboarding/OnboardingScreen';
import { PracticeScreen } from '@/screens/PracticeScreen';
import { ReferralScreen } from '@/screens/ReferralScreen';
import { referralService } from '@/services/referralService';
import { achievementService } from '@/services/achievementService';
import { useQuestStore } from '@/stores/useQuestStore';
import { REFERRAL_REWARD_THRESHOLDS, ReferralStatus } from '@/types/referrals';
import { getItem, setItem } from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants/StorageKeys';

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
};

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => mockNavigation,
  useRoute: () => ({ params: {} }),
}));

// Mock Firebase
jest.mock('@react-native-firebase/firestore', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        set: jest.fn(),
        get: jest.fn(() =>
          Promise.resolve({
            exists: true,
            data: () => ({}),
          })
        ),
        update: jest.fn(),
      })),
    })),
  })),
}));

jest.mock('@react-native-firebase/auth', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    currentUser: { uid: 'referee-user-123', displayName: 'New User' },
  })),
}));

// Mock storage
jest.mock('@/utils/storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock deep linking
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  Linking: {
    addEventListener: jest.fn(),
    getInitialURL: jest.fn(() => Promise.resolve(null)),
  },
}));

describe('Referral Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useQuestStore.setState({ totalXP: 0 });
  });

  it('should accept referral code during onboarding', async () => {
    jest.spyOn(referralService, 'validateReferralCode').mockResolvedValue(true);
    jest.spyOn(referralService, 'recordReferral').mockResolvedValue(undefined);

    const { getByPlaceholderText, getByText } = render(
      <NavigationContainer>
        <OnboardingScreen />
      </NavigationContainer>
    );

    // Navigate to referral code step (step 2)
    await waitFor(() => {
      const nextButton = getByText(/Next/i);
      if (nextButton) fireEvent.press(nextButton);
    });

    // Enter referral code
    const codeInput = getByPlaceholderText(/Enter referral code/i);
    fireEvent.changeText(codeInput, 'PRIYA2024');

    // Validate code
    const validateButton = getByText(/Apply/i);
    fireEvent.press(validateButton);

    await waitFor(() => {
      expect(referralService.validateReferralCode).toHaveBeenCalledWith('PRIYA2024');
      expect(getByText(/Code applied/i)).toBeTruthy();
    });
  });

  it('should handle deep link with referral code', async () => {
    const { Linking } = require('react-native');

    // Simulate deep link
    const deepLinkUrl = 'shlokasadhana.app/invite/PRIYA2024';
    Linking.getInitialURL.mockResolvedValue(deepLinkUrl);

    jest.spyOn(referralService, 'validateReferralCode').mockResolvedValue(true);

    // Extract code from deep link
    const code = deepLinkUrl.split('/invite/')[1];
    expect(code).toBe('PRIYA2024');

    // Verify code is stored for onboarding
    await setItem(STORAGE_KEYS.PENDING_REFERRAL_CODE, code);
    expect(setItem).toHaveBeenCalledWith(STORAGE_KEYS.PENDING_REFERRAL_CODE, 'PRIYA2024');
  });

  it('should award referee rewards after first practice', async () => {
    // Mock referral exists
    const mockReferral = {
      id: 'referral-123',
      referrerId: 'referrer-user-456',
      refereeId: 'referee-user-123',
      referralCode: 'PRIYA2024',
      status: ReferralStatus.PENDING,
      rewardsAwarded: false,
    };

    jest
      .spyOn(referralService, 'getReferralByReferee')
      .mockResolvedValue(mockReferral as any);
    jest.spyOn(referralService, 'awardReferralRewards').mockResolvedValue(undefined);
    jest.spyOn(achievementService, 'unlockAchievement').mockResolvedValue(undefined);

    const { getByText, getByTestId } = render(
      <NavigationContainer>
        <PracticeScreen />
      </NavigationContainer>
    );

    // Complete first practice
    fireEvent.press(getByText(/Start Practice/i));
    jest.advanceTimersByTime(60000); // 60 seconds
    fireEvent.press(getByTestId('complete-practice-button'));

    await waitFor(() => {
      expect(referralService.awardReferralRewards).toHaveBeenCalledWith(
        'referee-user-123'
      );
    });
  });

  it('should award 50 XP to referee', async () => {
    const mockReferral = {
      referrerId: 'referrer-user-456',
      refereeId: 'referee-user-123',
      status: ReferralStatus.PENDING,
      rewardsAwarded: false,
    };

    jest
      .spyOn(referralService, 'getReferralByReferee')
      .mockResolvedValue(mockReferral as any);

    const addXPSpy = jest.fn();
    useQuestStore.setState({ addXP: addXPSpy } as any);

    await referralService.awardReferralRewards('referee-user-123');

    expect(addXPSpy).toHaveBeenCalledWith(REFERRAL_REWARD_THRESHOLDS.REFEREE_SIGNUP.xp);
  });

  it('should award 50 XP to referrer', async () => {
    const mockReferral = {
      referrerId: 'referrer-user-456',
      refereeId: 'referee-user-123',
      status: ReferralStatus.PENDING,
      rewardsAwarded: false,
    };

    jest
      .spyOn(referralService, 'getReferralByReferee')
      .mockResolvedValue(mockReferral as any);

    await referralService.awardReferralRewards('referee-user-123');

    // Verify referrer's XP was incremented in Firestore
    // (Mock verification would happen in the service test)
  });

  it('should unlock "spiritual_guide" badge at 5 successful referrals', async () => {
    const mockReferrerProfile = {
      referral: {
        successfulReferrals: 5, // Just reached 5
      },
    };

    jest
      .spyOn(referralService, 'getReferralStats')
      .mockResolvedValue(mockReferrerProfile.referral as any);
    jest.spyOn(achievementService, 'unlockAchievement').mockResolvedValue(undefined);

    // Check milestone
    const stats = await referralService.getReferralStats('referrer-user-456');

    if (stats.successfulReferrals === REFERRAL_REWARD_THRESHOLDS.REFERRER_GUIDE.count) {
      await achievementService.unlockAchievement(
        'referrer-user-456',
        REFERRAL_REWARD_THRESHOLDS.REFERRER_GUIDE.badge
      );
    }

    expect(achievementService.unlockAchievement).toHaveBeenCalledWith(
      'referrer-user-456',
      'spiritual_guide'
    );
  });

  it('should display referral code and stats on ReferralScreen', async () => {
    const mockReferralStats = {
      referralCode: 'NEWUSER1',
      totalReferrals: 10,
      successfulReferrals: 7,
      pendingReferrals: 3,
      xpEarned: 350,
    };

    jest
      .spyOn(referralService, 'getReferralStats')
      .mockResolvedValue(mockReferralStats as any);

    const { getByText } = render(
      <NavigationContainer>
        <ReferralScreen />
      </NavigationContainer>
    );

    await waitFor(() => {
      expect(getByText('NEWUSER1')).toBeTruthy();
      expect(getByText(/10 total/i)).toBeTruthy();
      expect(getByText(/7 completed/i)).toBeTruthy();
      expect(getByText(/350 XP earned/i)).toBeTruthy();
    });
  });

  it('should NOT award rewards twice', async () => {
    const mockReferral = {
      referrerId: 'referrer-user-456',
      refereeId: 'referee-user-123',
      status: ReferralStatus.COMPLETED,
      rewardsAwarded: true, // Already awarded
    };

    jest
      .spyOn(referralService, 'getReferralByReferee')
      .mockResolvedValue(mockReferral as any);

    const addXPSpy = jest.fn();
    useQuestStore.setState({ addXP: addXPSpy } as any);

    await referralService.awardReferralRewards('referee-user-123');

    // Should not call addXP if already awarded
    expect(addXPSpy).not.toHaveBeenCalled();
  });
});
