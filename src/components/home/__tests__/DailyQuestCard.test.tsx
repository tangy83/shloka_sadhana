/**
 * DailyQuestCard Tests
 * Shloka Sadhana — Daily rotating quest card
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { DailyQuestCard } from '../DailyQuestCard';

// Mock the useQuestProgress hook
jest.mock('@/hooks/useQuestProgress', () => ({
  useQuestProgress: jest.fn(),
}));
// eslint-disable-next-line import/first
import { useQuestProgress } from '@/hooks/useQuestProgress';
const mockUseQuestProgress = useQuestProgress as jest.MockedFunction<typeof useQuestProgress>;

const PRACTICE_QUEST = {
  id: 'daily_practice',
  title: 'Complete a Practice',
  description: 'Finish one full practice session today.',
  target: 1,
  type: 'practices' as const,
  xpReward: 50,
};

const MALAS_QUEST = {
  id: 'chant_108',
  title: 'Full Mala',
  description: 'Chant a complete mala of 108 beads.',
  target: 108,
  type: 'malas' as const,
  xpReward: 75,
};

const STREAK_QUEST = {
  id: 'streak_3',
  title: '3-Day Streak',
  description: 'Maintain a practice streak for 3 days.',
  target: 3,
  type: 'streak_days' as const,
  xpReward: 100,
};

describe('DailyQuestCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render without crash', () => {
      mockUseQuestProgress.mockReturnValue({
        todayQuest: PRACTICE_QUEST,
        progress: 0,
        isCompleted: false,
        incrementProgress: jest.fn(),
        xpEarned: 0,
      });

      expect(() => render(<DailyQuestCard />)).not.toThrow();
    });

    it('should display the quest title', () => {
      mockUseQuestProgress.mockReturnValue({
        todayQuest: PRACTICE_QUEST,
        progress: 0,
        isCompleted: false,
        incrementProgress: jest.fn(),
        xpEarned: 0,
      });

      render(<DailyQuestCard />);

      expect(screen.getByText(PRACTICE_QUEST.title)).toBeTruthy();
    });

    it('should display the quest description', () => {
      mockUseQuestProgress.mockReturnValue({
        todayQuest: PRACTICE_QUEST,
        progress: 0,
        isCompleted: false,
        incrementProgress: jest.fn(),
        xpEarned: 0,
      });

      render(<DailyQuestCard />);

      expect(screen.getByText(PRACTICE_QUEST.description)).toBeTruthy();
    });

    it('should display the XP reward text', () => {
      mockUseQuestProgress.mockReturnValue({
        todayQuest: PRACTICE_QUEST,
        progress: 0,
        isCompleted: false,
        incrementProgress: jest.fn(),
        xpEarned: 0,
      });

      render(<DailyQuestCard />);

      expect(screen.getByText(`+${PRACTICE_QUEST.xpReward} XP on completion`)).toBeTruthy();
    });

    it('should display "Daily Quest" section label', () => {
      mockUseQuestProgress.mockReturnValue({
        todayQuest: PRACTICE_QUEST,
        progress: 0,
        isCompleted: false,
        incrementProgress: jest.fn(),
        xpEarned: 0,
      });

      render(<DailyQuestCard />);

      expect(screen.getByText('Daily Quest')).toBeTruthy();
    });
  });

  describe('Progress Display', () => {
    it('should display progress in "current / target" format', () => {
      mockUseQuestProgress.mockReturnValue({
        todayQuest: PRACTICE_QUEST,
        progress: 0,
        isCompleted: false,
        incrementProgress: jest.fn(),
        xpEarned: 0,
      });

      render(<DailyQuestCard />);

      expect(screen.getByText('0 / 1')).toBeTruthy();
    });

    it('should display partial progress correctly', () => {
      mockUseQuestProgress.mockReturnValue({
        todayQuest: MALAS_QUEST,
        progress: 54,
        isCompleted: false,
        incrementProgress: jest.fn(),
        xpEarned: 0,
      });

      render(<DailyQuestCard />);

      expect(screen.getByText('54 / 108')).toBeTruthy();
    });
  });

  describe('Completion Badge', () => {
    it('should NOT show "Done!" badge when not completed', () => {
      mockUseQuestProgress.mockReturnValue({
        todayQuest: PRACTICE_QUEST,
        progress: 0,
        isCompleted: false,
        incrementProgress: jest.fn(),
        xpEarned: 0,
      });

      render(<DailyQuestCard />);

      expect(screen.queryByText('Done!')).toBeNull();
    });

    it('should show "Done!" badge when quest is completed', () => {
      mockUseQuestProgress.mockReturnValue({
        todayQuest: PRACTICE_QUEST,
        progress: 1,
        isCompleted: true,
        incrementProgress: jest.fn(),
        xpEarned: 50,
      });

      render(<DailyQuestCard />);

      expect(screen.getByText('Done!')).toBeTruthy();
    });
  });

  describe('Quest Icon by Type', () => {
    it('should render meditation icon for practices quest', () => {
      mockUseQuestProgress.mockReturnValue({
        todayQuest: PRACTICE_QUEST,
        progress: 0,
        isCompleted: false,
        incrementProgress: jest.fn(),
        xpEarned: 0,
      });

      render(<DailyQuestCard />);

      // @expo/vector-icons is mocked — icon name rendered as text
      expect(screen.getByText('meditation')).toBeTruthy();
    });

    it('should render circle-outline icon for malas quest', () => {
      mockUseQuestProgress.mockReturnValue({
        todayQuest: MALAS_QUEST,
        progress: 0,
        isCompleted: false,
        incrementProgress: jest.fn(),
        xpEarned: 0,
      });

      render(<DailyQuestCard />);

      expect(screen.getByText('circle-outline')).toBeTruthy();
    });

    it('should render fire icon for streak_days quest', () => {
      mockUseQuestProgress.mockReturnValue({
        todayQuest: STREAK_QUEST,
        progress: 0,
        isCompleted: false,
        incrementProgress: jest.fn(),
        xpEarned: 0,
      });

      render(<DailyQuestCard />);

      expect(screen.getByText('fire')).toBeTruthy();
    });
  });
});
