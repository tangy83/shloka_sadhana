/**
 * AchievementUnlockedModal Tests
 * Shloka Sadhana — Achievement unlock celebration modal
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { AchievementUnlockedModal } from '../AchievementUnlockedModal';
import { Achievement } from '../../data/achievements';

const MOCK_ACHIEVEMENT: Achievement = {
  id: 'first_practice',
  title: 'First Steps',
  description: 'Complete your first practice session.',
  icon: 'star-outline',
  unlockCondition: { type: 'practices', value: 1 },
  xpReward: 50,
};

describe('AchievementUnlockedModal', () => {
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
        <AchievementUnlockedModal
          visible={false}
          achievement={MOCK_ACHIEVEMENT}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.queryByText('Achievement Unlocked!')).toBeNull();
    });

    it('should not render when achievement=null', () => {
      render(
        <AchievementUnlockedModal
          visible={true}
          achievement={null}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.queryByText('Achievement Unlocked!')).toBeNull();
    });

    it('should render when visible=true and achievement is provided', () => {
      render(
        <AchievementUnlockedModal
          visible={true}
          achievement={MOCK_ACHIEVEMENT}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('Achievement Unlocked!')).toBeTruthy();
    });
  });

  describe('Content', () => {
    it('should display the achievement title', () => {
      render(
        <AchievementUnlockedModal
          visible={true}
          achievement={MOCK_ACHIEVEMENT}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText(MOCK_ACHIEVEMENT.title)).toBeTruthy();
    });

    it('should display the achievement description', () => {
      render(
        <AchievementUnlockedModal
          visible={true}
          achievement={MOCK_ACHIEVEMENT}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText(MOCK_ACHIEVEMENT.description)).toBeTruthy();
    });

    it('should display XP reward as "+N XP"', () => {
      render(
        <AchievementUnlockedModal
          visible={true}
          achievement={MOCK_ACHIEVEMENT}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText(`+${MOCK_ACHIEVEMENT.xpReward} XP`)).toBeTruthy();
    });

    it('should display the header label', () => {
      render(
        <AchievementUnlockedModal
          visible={true}
          achievement={MOCK_ACHIEVEMENT}
          onDismiss={mockOnDismiss}
        />
      );

      // UPPERCASE: "ACHIEVEMENT UNLOCKED!" — or the raw label text
      expect(screen.getByText('Achievement Unlocked!')).toBeTruthy();
    });

    it('should display the icon name via the mocked icon component', () => {
      render(
        <AchievementUnlockedModal
          visible={true}
          achievement={MOCK_ACHIEVEMENT}
          onDismiss={mockOnDismiss}
        />
      );

      // @expo/vector-icons is mocked to render icon name as text
      expect(screen.getByText(MOCK_ACHIEVEMENT.icon)).toBeTruthy();
    });

    it('should display the hint text', () => {
      render(
        <AchievementUnlockedModal
          visible={true}
          achievement={MOCK_ACHIEVEMENT}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('Tap anywhere to continue')).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('should call onDismiss when overlay is tapped', () => {
      render(
        <AchievementUnlockedModal
          visible={true}
          achievement={MOCK_ACHIEVEMENT}
          onDismiss={mockOnDismiss}
        />
      );

      const overlay = screen.getByLabelText('Dismiss achievement unlocked');
      fireEvent.press(overlay);

      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });

    it('should auto-dismiss after 3 seconds', () => {
      render(
        <AchievementUnlockedModal
          visible={true}
          achievement={MOCK_ACHIEVEMENT}
          onDismiss={mockOnDismiss}
        />
      );

      expect(mockOnDismiss).not.toHaveBeenCalled();

      jest.advanceTimersByTime(3000);

      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });

    it('should not auto-dismiss before 3 seconds', () => {
      render(
        <AchievementUnlockedModal
          visible={true}
          achievement={MOCK_ACHIEVEMENT}
          onDismiss={mockOnDismiss}
        />
      );

      jest.advanceTimersByTime(2999);

      expect(mockOnDismiss).not.toHaveBeenCalled();
    });

    it('should clear timer when visible becomes false', () => {
      const { rerender } = render(
        <AchievementUnlockedModal
          visible={true}
          achievement={MOCK_ACHIEVEMENT}
          onDismiss={mockOnDismiss}
        />
      );

      rerender(
        <AchievementUnlockedModal
          visible={false}
          achievement={MOCK_ACHIEVEMENT}
          onDismiss={mockOnDismiss}
        />
      );

      jest.advanceTimersByTime(3000);

      expect(mockOnDismiss).not.toHaveBeenCalled();
    });
  });

  describe('Different achievements', () => {
    it('should correctly display a different achievement', () => {
      const weekStreak: Achievement = {
        id: 'week_streak',
        title: 'Week of Devotion',
        description: 'Maintain a 7-day practice streak.',
        icon: 'fire',
        unlockCondition: { type: 'streak', value: 7 },
        xpReward: 100,
      };

      render(
        <AchievementUnlockedModal
          visible={true}
          achievement={weekStreak}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('Week of Devotion')).toBeTruthy();
      expect(screen.getByText('Maintain a 7-day practice streak.')).toBeTruthy();
      expect(screen.getByText('+100 XP')).toBeTruthy();
      expect(screen.getByText('fire')).toBeTruthy(); // icon name rendered as text by mock
    });
  });
});
