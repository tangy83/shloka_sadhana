/**
 * AchievementProgressCard Tests
 * Shloka Sadhana — Achievement XP summary card
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { AchievementProgressCard } from '../AchievementProgressCard';
import { ACHIEVEMENTS } from '@/data/achievements';

// Mock the useAchievements hook
jest.mock('@/hooks/useAchievements', () => ({
  useAchievements: jest.fn(),
}));
// eslint-disable-next-line import/first
import { useAchievements } from '@/hooks/useAchievements';
const mockUseAchievements = useAchievements as jest.MockedFunction<typeof useAchievements>;

describe('AchievementProgressCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should not render anything while isLoading=true', () => {
      mockUseAchievements.mockReturnValue({
        unlockedIds: [],
        xp: 0,
        recentlyUnlocked: null,
        checkAndUnlock: jest.fn(),
        dismissRecentlyUnlocked: jest.fn(),
        isLoading: true,
      });

      const { toJSON } = render(<AchievementProgressCard />);
      expect(toJSON()).toBeNull();
    });
  });

  describe('XP Display', () => {
    it('should display XP value in the badge', () => {
      mockUseAchievements.mockReturnValue({
        unlockedIds: [],
        xp: 150,
        recentlyUnlocked: null,
        checkAndUnlock: jest.fn(),
        dismissRecentlyUnlocked: jest.fn(),
        isLoading: false,
      });

      render(<AchievementProgressCard />);

      expect(screen.getByText('150 XP')).toBeTruthy();
    });

    it('should display "0 XP" when no achievements unlocked', () => {
      mockUseAchievements.mockReturnValue({
        unlockedIds: [],
        xp: 0,
        recentlyUnlocked: null,
        checkAndUnlock: jest.fn(),
        dismissRecentlyUnlocked: jest.fn(),
        isLoading: false,
      });

      render(<AchievementProgressCard />);

      expect(screen.getByText('0 XP')).toBeTruthy();
    });
  });

  describe('Progress Summary', () => {
    it('should display "0 / 8 unlocked" when no achievements unlocked', () => {
      mockUseAchievements.mockReturnValue({
        unlockedIds: [],
        xp: 0,
        recentlyUnlocked: null,
        checkAndUnlock: jest.fn(),
        dismissRecentlyUnlocked: jest.fn(),
        isLoading: false,
      });

      render(<AchievementProgressCard />);

      expect(screen.getByText(`0 / ${ACHIEVEMENTS.length} unlocked`)).toBeTruthy();
    });

    it('should display correct count when some achievements are unlocked', () => {
      mockUseAchievements.mockReturnValue({
        unlockedIds: ['first_practice', 'mala_master'],
        xp: 125,
        recentlyUnlocked: null,
        checkAndUnlock: jest.fn(),
        dismissRecentlyUnlocked: jest.fn(),
        isLoading: false,
      });

      render(<AchievementProgressCard />);

      expect(screen.getByText(`2 / ${ACHIEVEMENTS.length} unlocked`)).toBeTruthy();
    });
  });

  describe('Empty State', () => {
    it('should show empty hint when no achievements are unlocked', () => {
      mockUseAchievements.mockReturnValue({
        unlockedIds: [],
        xp: 0,
        recentlyUnlocked: null,
        checkAndUnlock: jest.fn(),
        dismissRecentlyUnlocked: jest.fn(),
        isLoading: false,
      });

      render(<AchievementProgressCard />);

      expect(
        screen.getByText('Complete a practice session to earn your first achievement.')
      ).toBeTruthy();
    });

    it('should NOT show empty hint when achievements are unlocked', () => {
      mockUseAchievements.mockReturnValue({
        unlockedIds: ['first_practice'],
        xp: 50,
        recentlyUnlocked: null,
        checkAndUnlock: jest.fn(),
        dismissRecentlyUnlocked: jest.fn(),
        isLoading: false,
      });

      render(<AchievementProgressCard />);

      expect(
        screen.queryByText('Complete a practice session to earn your first achievement.')
      ).toBeNull();
    });
  });

  describe('Recent Achievements', () => {
    it('should show titles of recently unlocked achievements', () => {
      mockUseAchievements.mockReturnValue({
        unlockedIds: ['first_practice'],
        xp: 50,
        recentlyUnlocked: null,
        checkAndUnlock: jest.fn(),
        dismissRecentlyUnlocked: jest.fn(),
        isLoading: false,
      });

      render(<AchievementProgressCard />);

      expect(screen.getByText('First Steps')).toBeTruthy();
    });

    it('should show XP of recent achievement', () => {
      mockUseAchievements.mockReturnValue({
        unlockedIds: ['first_practice'],
        xp: 50,
        recentlyUnlocked: null,
        checkAndUnlock: jest.fn(),
        dismissRecentlyUnlocked: jest.fn(),
        isLoading: false,
      });

      render(<AchievementProgressCard />);

      expect(screen.getByText('+50')).toBeTruthy();
    });

    it('should display "Achievements" card header', () => {
      mockUseAchievements.mockReturnValue({
        unlockedIds: [],
        xp: 0,
        recentlyUnlocked: null,
        checkAndUnlock: jest.fn(),
        dismissRecentlyUnlocked: jest.fn(),
        isLoading: false,
      });

      render(<AchievementProgressCard />);

      expect(screen.getByText('Achievements')).toBeTruthy();
    });
  });
});
