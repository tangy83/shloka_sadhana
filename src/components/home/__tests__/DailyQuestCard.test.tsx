/**
 * DailyQuestCard Tests
 * Shloka Sadhana - Phase 2A: Engagement Core
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// Must mock @/constants/Layout before importing the component
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

// Mock Card - must NOT reference React out-of-scope; use require inside factory
jest.mock('@/components/ui/Card', () => ({
  Card: ({ children, onPress }: any) => {
    const { TouchableOpacity } = require('react-native');
    const reactModule = require('react');
    return reactModule.createElement(TouchableOpacity, { onPress, testID: 'quest-card' }, children);
  },
}));

// Mock Badge - must NOT reference React out-of-scope
jest.mock('@/components/ui/Badge', () => ({
  Badge: ({ children }: any) => {
    const { Text } = require('react-native');
    const reactModule = require('react');
    return reactModule.createElement(Text, { testID: 'badge' }, children);
  },
}));

// Mock useQuestStore
jest.mock('@/stores/useQuestStore');
import { useQuestStore, getQuestProgressPercentage } from '@/stores/useQuestStore';
import { DailyQuestCard } from '@/components/home/DailyQuestCard';

const mockUseQuestStore = useQuestStore as jest.MockedFunction<typeof useQuestStore>;
const mockGetQuestProgressPercentage = getQuestProgressPercentage as jest.MockedFunction<typeof getQuestProgressPercentage>;

const MOCK_QUEST_ACTIVE: any = {
  id: 'quest-1',
  name: 'Morning Chant',
  description: 'Recite a morning shloka',
  difficulty: 'beginner',
  status: 'active',
  progress: 0,
  target: 1,
  xpReward: 50,
  type: 'practice_once',
  expiresAt: new Date().toISOString(),
};

const MOCK_QUEST_COMPLETED: any = {
  ...MOCK_QUEST_ACTIVE,
  status: 'completed',
  progress: 1,
};

const MOCK_STATS: any = {
  totalCompleted: 5,
  questStreak: 3,
  longestQuestStreak: 7,
  totalXP: 250,
  completionRate: 80,
  favoriteQuestType: 'practice_once',
};

const BASE_STORE_STATE: any = {
  currentQuest: MOCK_QUEST_ACTIVE,
  stats: MOCK_STATS,
  isQuestLoading: false,
  showCompletionModal: false,
  lastCompletedQuest: null,
  lastReward: null,
  initializeQuest: jest.fn(),
  generateNewQuest: jest.fn(),
  updateProgress: jest.fn(),
  completeQuest: jest.fn(),
  abandonQuest: jest.fn(),
  loadQuestData: jest.fn(),
  refreshStats: jest.fn(),
  setShowCompletionModal: jest.fn(),
  resetQuestIfExpired: jest.fn(),
  syncToCloud: jest.fn(),
  loadFromCloud: jest.fn(),
};

describe('DailyQuestCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseQuestStore.mockReturnValue(BASE_STORE_STATE);
    mockGetQuestProgressPercentage.mockReturnValue(0);
  });

  it('returns null when there is no current quest', () => {
    mockUseQuestStore.mockReturnValue({
      ...BASE_STORE_STATE,
      currentQuest: null,
    });
    const { toJSON } = render(<DailyQuestCard />);
    expect(toJSON()).toBeNull();
  });

  it('shows quest title / name', () => {
    const { getByText } = render(<DailyQuestCard />);
    expect(getByText('Morning Chant')).toBeTruthy();
  });

  it('shows difficulty badge text (uppercased)', () => {
    const { getByText } = render(<DailyQuestCard />);
    // DailyQuestCard uppercases the difficulty before passing to Badge
    expect(getByText('BEGINNER')).toBeTruthy();
  });

  it('shows progress text when quest is not completed', () => {
    const { getByText } = render(<DailyQuestCard />);
    // Component renders "{progress} / {target}" when status != completed
    expect(getByText('0 / 1')).toBeTruthy();
  });

  it('shows "Completed!" text when quest is completed', () => {
    mockUseQuestStore.mockReturnValue({
      ...BASE_STORE_STATE,
      currentQuest: MOCK_QUEST_COMPLETED,
    });
    mockGetQuestProgressPercentage.mockReturnValue(100);
    const { getByText } = render(<DailyQuestCard />);
    expect(getByText('Completed!')).toBeTruthy();
  });

  it('calls onPress prop when card is pressed', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(<DailyQuestCard onPress={onPressMock} />);
    fireEvent.press(getByTestId('quest-card'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});
