/**
 * AchievementUnlockedModal Tests
 * Shloka Sadhana - Phase 2A: Engagement Core
 */

import React from 'react';
import { act } from 'react-test-renderer';
import { render, fireEvent } from '@testing-library/react-native';

// Must mock @/constants/Layout before importing the component because
// AchievementUnlockedModal uses Layout.typography which is not in the real
// Layout object (only borderRadius/spacing are added in setup.ts).
jest.mock('@/constants/Layout', () => {
  const actual = jest.requireActual('@/constants/Layout');
  return {
    ...actual,
    Layout: {
      ...actual.Layout,
      borderRadius: actual.BorderRadius,
      spacing: actual.Spacing,
      typography: {
        h1: 28,
        h2: 24,
        h3: 20,
        body: 16,
        caption: 12,
      },
    },
  };
});

// Mock achievementService - must export ACHIEVEMENTS so useAchievementStore
// can import it without crashing at module load time.
jest.mock('@/services/achievementService', () => ({
  achievementService: {
    getShareMessage: jest.fn(() => 'I unlocked First Steps!'),
    getRarityColor: jest.fn(() => '#CD7F32'),
    getRarityDisplayName: jest.fn(() => 'Bronze'),
  },
  ACHIEVEMENTS: [],
}));

// Mock react-native-modal so it renders children when isVisible=true
jest.mock('react-native-modal', () => {
  const React = require('react');
  const { View } = require('react-native');
  return ({ children, isVisible }: any) =>
    isVisible ? React.createElement(View, null, children) : null;
});

// Mock haptics (Button uses it)
jest.mock('@/utils/haptics', () => ({ triggerHaptic: jest.fn() }));

// Mock ShareModal so it does not pull in heavy dependencies
jest.mock('@/components/modals/ShareModal', () => ({
  ShareModal: () => null,
}));

// Mock useUserStore
jest.mock('@/stores/useUserStore', () => ({
  useUserStore: jest.fn(() => ({ currentStreak: 5, totalPractices: 10 })),
}));

// Mock useAchievementStore - must come after achievementService mock so the
// store module can be required without crashing
jest.mock('@/stores/useAchievementStore');
import { useAchievementStore } from '@/stores/useAchievementStore';
import { AchievementUnlockedModal } from '@/components/modals/AchievementUnlockedModal';

const mockUseAchievementStore = useAchievementStore as jest.MockedFunction<typeof useAchievementStore>;

const MOCK_ACHIEVEMENT: any = {
  id: 'first_practice',
  name: 'First Steps',
  description: 'Complete your first practice',
  icon: '🌟',
  xpReward: 50,
  tier: 'bronze',
  rarity: 'common',
  category: 'practice',
};

const MOCK_STORE_STATE: any = {
  showUnlockModal: true,
  currentUnlock: MOCK_ACHIEVEMENT,
  dismissUnlockModal: jest.fn(),
  achievements: [],
  unlockedAchievements: [],
  totalXP: 0,
  isLoading: false,
  error: null,
  loadAchievements: jest.fn(),
  checkAchievements: jest.fn(),
  setShowUnlockModal: jest.fn(),
};

describe('AchievementUnlockedModal', () => {
  beforeAll(() => {
    // Use fake timers to prevent Animated.spring timers from leaking after tests
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAchievementStore.mockReturnValue({ ...MOCK_STORE_STATE, dismissUnlockModal: jest.fn() });
  });

  afterEach(() => {
    act(() => {
      jest.runAllTimers();
    });
  });

  it('returns null when currentUnlock is null', () => {
    mockUseAchievementStore.mockReturnValue({
      ...MOCK_STORE_STATE,
      currentUnlock: null,
    });
    const { toJSON } = render(<AchievementUnlockedModal />);
    expect(toJSON()).toBeNull();
  });

  it('shows achievement name when modal is visible', () => {
    const { getByText } = render(<AchievementUnlockedModal />);
    expect(getByText('First Steps')).toBeTruthy();
  });

  it('shows XP Earned label', () => {
    const { getByText } = render(<AchievementUnlockedModal />);
    expect(getByText('XP Earned')).toBeTruthy();
  });

  it('calls dismissUnlockModal when continue button is pressed', () => {
    const dismissMock = jest.fn();
    mockUseAchievementStore.mockReturnValue({
      ...MOCK_STORE_STATE,
      dismissUnlockModal: dismissMock,
    });
    const { getByLabelText } = render(<AchievementUnlockedModal />);
    fireEvent.press(getByLabelText('Continue and celebrate achievement'));
    expect(dismissMock).toHaveBeenCalledTimes(1);
  });

  it('renders share button in the modal', () => {
    const { getByLabelText } = render(<AchievementUnlockedModal />);
    expect(getByLabelText('Share this achievement')).toBeTruthy();
  });

  it('does not show modal content when showUnlockModal is false', () => {
    mockUseAchievementStore.mockReturnValue({
      ...MOCK_STORE_STATE,
      showUnlockModal: false,
    });
    const { queryByText } = render(<AchievementUnlockedModal />);
    // Modal mock returns null when isVisible=false, so content should not appear
    expect(queryByText('First Steps')).toBeNull();
  });
});
