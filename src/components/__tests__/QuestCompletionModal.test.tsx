/**
 * QuestCompletionModal Tests
 * Shloka Sadhana — Daily quest completion celebration modal
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { QuestCompletionModal } from '../QuestCompletionModal';
import { Quest } from '../../data/quests';

const MOCK_QUEST: Quest = {
  id: 'daily_practice',
  title: 'Complete a Practice',
  description: 'Finish one full practice session today.',
  target: 1,
  type: 'practices',
  xpReward: 50,
};

describe('QuestCompletionModal', () => {
  const mockOnDismiss = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Visibility', () => {
    it('should not render when visible=false', () => {
      render(
        <QuestCompletionModal
          visible={false}
          quest={MOCK_QUEST}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.queryByText('Quest Complete!')).toBeNull();
    });

    it('should not render when quest=null', () => {
      render(
        <QuestCompletionModal
          visible={true}
          quest={null}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.queryByText('Quest Complete!')).toBeNull();
    });

    it('should render content when visible=true and quest is provided', () => {
      render(
        <QuestCompletionModal
          visible={true}
          quest={MOCK_QUEST}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('Quest Complete!')).toBeTruthy();
    });
  });

  describe('Content', () => {
    it('should display the OM glyph', () => {
      render(
        <QuestCompletionModal
          visible={true}
          quest={MOCK_QUEST}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('ॐ')).toBeTruthy();
    });

    it('should display the quest title', () => {
      render(
        <QuestCompletionModal
          visible={true}
          quest={MOCK_QUEST}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText(MOCK_QUEST.title)).toBeTruthy();
    });

    it('should display XP reward text with correct amount', () => {
      render(
        <QuestCompletionModal
          visible={true}
          quest={MOCK_QUEST}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText(`+${MOCK_QUEST.xpReward} XP earned today`)).toBeTruthy();
    });

    it('should display the hint text', () => {
      render(
        <QuestCompletionModal
          visible={true}
          quest={MOCK_QUEST}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('Tap anywhere to continue')).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('should call onDismiss when overlay is tapped', () => {
      render(
        <QuestCompletionModal
          visible={true}
          quest={MOCK_QUEST}
          onDismiss={mockOnDismiss}
        />
      );

      const overlay = screen.getByLabelText('Dismiss quest completion');
      fireEvent.press(overlay);

      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });

    it('should auto-dismiss after 3 seconds', () => {
      render(
        <QuestCompletionModal
          visible={true}
          quest={MOCK_QUEST}
          onDismiss={mockOnDismiss}
        />
      );

      expect(mockOnDismiss).not.toHaveBeenCalled();

      jest.advanceTimersByTime(3000);

      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });

    it('should not auto-dismiss before 3 seconds', () => {
      render(
        <QuestCompletionModal
          visible={true}
          quest={MOCK_QUEST}
          onDismiss={mockOnDismiss}
        />
      );

      jest.advanceTimersByTime(2999);

      expect(mockOnDismiss).not.toHaveBeenCalled();
    });

    it('should clear auto-dismiss timer when visible becomes false', () => {
      const { rerender } = render(
        <QuestCompletionModal
          visible={true}
          quest={MOCK_QUEST}
          onDismiss={mockOnDismiss}
        />
      );

      rerender(
        <QuestCompletionModal
          visible={false}
          quest={MOCK_QUEST}
          onDismiss={mockOnDismiss}
        />
      );

      jest.advanceTimersByTime(3000);

      // Timer should have been cleared — onDismiss not called
      expect(mockOnDismiss).not.toHaveBeenCalled();
    });
  });

  describe('Different quests', () => {
    it('should display a different quest title correctly', () => {
      const streakQuest: Quest = {
        id: 'streak_3',
        title: '3-Day Streak',
        description: 'Maintain a practice streak for 3 days.',
        target: 3,
        type: 'streak_days',
        xpReward: 100,
      };

      render(
        <QuestCompletionModal
          visible={true}
          quest={streakQuest}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('3-Day Streak')).toBeTruthy();
      expect(screen.getByText('+100 XP earned today')).toBeTruthy();
    });
  });
});
