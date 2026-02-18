/**
 * QuestCompletionModal Tests
 * Shloka Sadhana - Phase 2A: Engagement Core
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// Must mock @/constants/Layout before importing the component because
// QuestCompletionModal uses Layout.typography which is not in the real
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

// Mock react-native-modal so it renders children when isVisible=true
jest.mock('react-native-modal', () => {
  const React = require('react');
  const { View } = require('react-native');
  return ({ children, isVisible }: any) =>
    isVisible ? React.createElement(View, null, children) : null;
});

// Mock haptics (Button uses it)
jest.mock('@/utils/haptics', () => ({ triggerHaptic: jest.fn() }));

// Mock ShareModal
jest.mock('@/components/modals/ShareModal', () => ({
  ShareModal: () => null,
}));

// Mock useQuestStore
jest.mock('@/stores/useQuestStore');
import { useQuestStore } from '@/stores/useQuestStore';
import { QuestCompletionModal } from '@/components/modals/QuestCompletionModal';

const mockUseQuestStore = useQuestStore as jest.MockedFunction<typeof useQuestStore>;

const MOCK_QUEST: any = {
  id: 'quest-1',
  name: 'Morning Practice',
  type: 'practice_once',
  title: 'Complete a practice session',
  description: 'Practice any shloka today',
  targetCount: 1,
  progress: 1,
  status: 'completed',
  difficulty: 'easy',
  expiresAt: new Date().toISOString(),
  xpReward: 50,
  target: 1,
};

const MOCK_REWARD: any = {
  xp: 50,
  message: 'Great job completing the quest!',
};

const MOCK_STORE_STATE: any = {
  showCompletionModal: true,
  lastCompletedQuest: MOCK_QUEST,
  lastReward: MOCK_REWARD,
  setShowCompletionModal: jest.fn(),
  currentQuest: null,
  isQuestLoading: false,
  stats: {
    totalCompleted: 1,
    questStreak: 1,
    longestQuestStreak: 1,
    totalXP: 50,
    completionRate: 100,
    favoriteQuestType: null,
  },
  initializeQuest: jest.fn(),
  generateNewQuest: jest.fn(),
  updateProgress: jest.fn(),
  completeQuest: jest.fn(),
  abandonQuest: jest.fn(),
  loadQuestData: jest.fn(),
  refreshStats: jest.fn(),
  resetQuestIfExpired: jest.fn(),
  syncToCloud: jest.fn(),
  loadFromCloud: jest.fn(),
};

describe('QuestCompletionModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseQuestStore.mockReturnValue({ ...MOCK_STORE_STATE, setShowCompletionModal: jest.fn() });
  });

  it('returns null when lastCompletedQuest is null', () => {
    mockUseQuestStore.mockReturnValue({
      ...MOCK_STORE_STATE,
      lastCompletedQuest: null,
    });
    const { toJSON } = render(<QuestCompletionModal />);
    expect(toJSON()).toBeNull();
  });

  it('returns null when lastReward is null', () => {
    mockUseQuestStore.mockReturnValue({
      ...MOCK_STORE_STATE,
      lastReward: null,
    });
    const { toJSON } = render(<QuestCompletionModal />);
    expect(toJSON()).toBeNull();
  });

  it('shows quest name when modal is visible', () => {
    const { getByText } = render(<QuestCompletionModal />);
    expect(getByText('Morning Practice')).toBeTruthy();
  });

  it('shows XP reward label', () => {
    const { getByText } = render(<QuestCompletionModal />);
    expect(getByText('XP Earned')).toBeTruthy();
  });

  it('shows XP reward amount', () => {
    const { getByText } = render(<QuestCompletionModal />);
    // The component renders +{lastReward.xp}
    expect(getByText('+50')).toBeTruthy();
  });

  it('calls setShowCompletionModal(false) when close button is pressed', () => {
    const setShowMock = jest.fn();
    mockUseQuestStore.mockReturnValue({
      ...MOCK_STORE_STATE,
      setShowCompletionModal: setShowMock,
    });
    const { getByLabelText } = render(<QuestCompletionModal />);
    fireEvent.press(getByLabelText('Awesome, close modal'));
    expect(setShowMock).toHaveBeenCalledWith(false);
  });

  it('does not show modal content when showCompletionModal is false', () => {
    mockUseQuestStore.mockReturnValue({
      ...MOCK_STORE_STATE,
      showCompletionModal: false,
    });
    const { queryByText } = render(<QuestCompletionModal />);
    expect(queryByText('Morning Practice')).toBeNull();
  });

  it('renders share button', () => {
    const { getByLabelText } = render(<QuestCompletionModal />);
    expect(getByLabelText('Share quest completion')).toBeTruthy();
  });
});
