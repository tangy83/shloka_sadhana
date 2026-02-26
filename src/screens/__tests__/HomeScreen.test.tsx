/**
 * HomeScreen Tests
 * Shloka Sadhana - Home Dashboard
 *
 * Tests for main dashboard screen
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { HomeScreen } from '../HomeScreen';
import { useNavigation } from '@react-navigation/native';

import { useStreak } from '@/hooks/useStreak';
import { loadActivePractice, getPracticeStats, loadPracticeHistory } from '@/utils/practiceStorage';
import { PracticeSession, PracticeStats } from '@/types/practice';

// Mock navigation
jest.mock('@react-navigation/native', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  return {
    useNavigation: jest.fn(),
    useFocusEffect: (cb: () => void) => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      React.useEffect(cb, []);
    },
  };
});

// Mock useStreak hook
jest.mock('@/hooks/useStreak', () => ({
  useStreak: jest.fn(),
}));

// Mock practice storage
jest.mock('@/utils/practiceStorage', () => ({
  loadActivePractice: jest.fn(),
  getPracticeStats: jest.fn(),
  loadPracticeHistory: jest.fn(),
}));

// Mock new V3 components
jest.mock('@/components/home/VerseOfTheDayCard', () => ({
  VerseOfTheDayCard: () => null,
}));

jest.mock('@/components/home/RecommendedShlokaCard', () => ({
  RecommendedShlokaCard: () => null,
}));

const mockUseStreak = useStreak as jest.MockedFunction<typeof useStreak>;
const mockLoadActivePractice = loadActivePractice as jest.MockedFunction<typeof loadActivePractice>;
const mockGetPracticeStats = getPracticeStats as jest.MockedFunction<typeof getPracticeStats>;
const mockLoadPracticeHistory = loadPracticeHistory as jest.MockedFunction<typeof loadPracticeHistory>;

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock return values
    mockUseStreak.mockReturnValue({
      currentStreak: 5,
      longestStreak: 10,
      totalPractices: 5,
      isPracticedToday: true,
      isStreakAtRisk: false,
      markTodayComplete: jest.fn(),
      isLoading: false,
    });

    // Default practice storage mocks
    mockLoadActivePractice.mockResolvedValue(null);
    mockGetPracticeStats.mockResolvedValue({
      totalPractices: 0,
      totalMinutes: 0,
      totalMalas: 0,
      favoriteShlokaId: null,
      lastPracticeDate: null,
    });
    mockLoadPracticeHistory.mockResolvedValue([]);
  });

  describe('Initial Render', () => {
    it('should render the screen', () => {
      render(<HomeScreen />);
      expect(screen.getByText('Sadhana')).toBeTruthy();
    });

    it('should display app title', () => {
      render(<HomeScreen />);
      expect(screen.getByText('Sadhana')).toBeTruthy();
    });

    it('should display welcome message', () => {
      render(<HomeScreen />);
      expect(screen.getByText(/Welcome/i)).toBeTruthy();
    });
  });

  describe('Quick Actions', () => {
    it('should display quick action buttons', () => {
      const { getAllByTestId } = render(<HomeScreen />);
      const actionButtons = getAllByTestId('quick-action-button');
      expect(actionButtons.length).toBeGreaterThan(0);
    });

    it('should display Start Practice button', () => {
      render(<HomeScreen />);
      expect(screen.getByText(/Start Practice/i)).toBeTruthy();
    });

    it('should display Mantras button', () => {
      render(<HomeScreen />);
      expect(screen.getByText('Mantras')).toBeTruthy();
    });

    // Removed: Daily Wisdom and Quick 5-Min buttons no longer exist in Quick Actions

    it('should have 4 quick action buttons', () => {
      const { getAllByTestId } = render(<HomeScreen />);
      const actionButtons = getAllByTestId('quick-action-button');
      expect(actionButtons.length).toBe(4);
    });

    it('should display Ekadashi button', () => {
      render(<HomeScreen />);
      expect(screen.getByText('Ekadashi')).toBeTruthy();
    });

    it('should display Festivals button', () => {
      render(<HomeScreen />);
      expect(screen.getByText('Festivals')).toBeTruthy();
    });
  });

  // Removed: Today's Highlight section no longer exists (was redundant with Recommended for You)
  // describe('Today\'s Highlight', () => { ... });

  describe('Stats Overview', () => {
    it('should display stats section', () => {
      render(<HomeScreen />);
      expect(screen.getByText(/Your Journey/i)).toBeTruthy();
    });

    it('should display streak count', () => {
      render(<HomeScreen />);
      const streakElements = screen.queryAllByText(/streak/i);
      expect(streakElements.length).toBeGreaterThan(0);
    });

    it('should display total practices', () => {
      render(<HomeScreen />);
      const practiceElements = screen.queryAllByText(/practices/i);
      expect(practiceElements.length).toBeGreaterThan(0);
    });

    it('should display current streak from useStreak hook', () => {
      mockUseStreak.mockReturnValue({
        currentStreak: 12,
        longestStreak: 15,
        totalPractices: 12,
        isPracticedToday: true,
        isStreakAtRisk: false,
        markTodayComplete: jest.fn(),
        isLoading: false,
      });

      render(<HomeScreen />);
      expect(screen.getByText('12')).toBeTruthy();
    });

    it('should use useStreak hook on mount', () => {
      render(<HomeScreen />);
      expect(mockUseStreak).toHaveBeenCalled();
    });

    it('should display loading state when streak is loading', () => {
      mockUseStreak.mockReturnValue({
        currentStreak: 0,
        longestStreak: 0,
        totalPractices: 0,
        isPracticedToday: false,
        isStreakAtRisk: false,
        markTodayComplete: jest.fn(),
        isLoading: true,
      });

      render(<HomeScreen />);
      // Should show 0 for streak and stats
      const zeroValues = screen.queryAllByText('0');
      expect(zeroValues.length).toBeGreaterThan(0);
    });
  });

  describe('Scrollable Content', () => {
    it('should render scrollable view', () => {
      const { getByTestId } = render(<HomeScreen />);
      expect(getByTestId('home-scroll')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    let mockNavigate: jest.Mock;

    beforeEach(() => {
      mockNavigate = jest.fn();
      (useNavigation as jest.Mock).mockReturnValue({
        navigate: mockNavigate,
      });
    });

    it('should navigate to Practice screen when Start Practice button is pressed', () => {
      const { getByText } = render(<HomeScreen />);
      const startButton = getByText('Start Practice');
      fireEvent.press(startButton);
      expect(mockNavigate).toHaveBeenCalledWith('Practice');
    });

    it('should navigate to Library screen when Mantras button is pressed', () => {
      const { getByText } = render(<HomeScreen />);
      fireEvent.press(getByText('Mantras'));
      expect(mockNavigate).toHaveBeenCalledWith('Library');
    });

    it('should navigate to EkadashiCalendar when Ekadashi button is pressed', () => {
      const { getByText } = render(<HomeScreen />);
      fireEvent.press(getByText('Ekadashi'));
      expect(mockNavigate).toHaveBeenCalledWith('EkadashiCalendar');
    });

    it('should navigate to FestivalsList when Festivals button is pressed', () => {
      const { getByText } = render(<HomeScreen />);
      fireEvent.press(getByText('Festivals'));
      expect(mockNavigate).toHaveBeenCalledWith('FestivalsList');
    });
  });

  describe('Practice Persistence', () => {
    describe('Resume Practice Feature', () => {
      it('should load active practice session on mount', async () => {
        const activePractice: PracticeSession = {
          isActive: true,
          startTime: '2026-02-05T10:00:00.000Z',
          pausedTime: null,
          elapsedSeconds: 300,
          malaCount: 25,
          selectedShlokaId: 'gayatri-mantra',
          sankalp: 'For peace',
        };

        mockLoadActivePractice.mockResolvedValue(activePractice);

        render(<HomeScreen />);

        await waitFor(() => {
          expect(mockLoadActivePractice).toHaveBeenCalled();
        });
      });

      it('should display Resume Practice button when active practice exists', async () => {
        const activePractice: PracticeSession = {
          isActive: true,
          startTime: '2026-02-05T10:00:00.000Z',
          pausedTime: null,
          elapsedSeconds: 300,
          malaCount: 25,
          selectedShlokaId: null,
          sankalp: 'For inner peace',
        };

        mockLoadActivePractice.mockResolvedValue(activePractice);

        render(<HomeScreen />);

        await waitFor(() => {
          expect(screen.getByText(/Resume Practice/i)).toBeTruthy();
        });
      });

      it('should not display Resume Practice button when no active practice', async () => {
        mockLoadActivePractice.mockResolvedValue(null);

        render(<HomeScreen />);

        await waitFor(() => {
          expect(mockLoadActivePractice).toHaveBeenCalled();
        });

        expect(screen.queryByText(/Resume Practice/i)).toBeNull();
      });

      it('should navigate to Practice screen when Resume button is pressed', async () => {
        const mockNavigate = jest.fn();
        (useNavigation as jest.Mock).mockReturnValue({
          navigate: mockNavigate,
        });

        const activePractice: PracticeSession = {
          isActive: true,
          startTime: '2026-02-05T10:00:00.000Z',
          pausedTime: null,
          elapsedSeconds: 600,
          malaCount: 50,
          selectedShlokaId: null,
          sankalp: null,
        };

        mockLoadActivePractice.mockResolvedValue(activePractice);

        render(<HomeScreen />);

        await waitFor(() => {
          expect(screen.getByText(/Resume Practice/i)).toBeTruthy();
        });

        const resumeButton = screen.getByText(/Resume Practice/i);
        fireEvent.press(resumeButton);

        expect(mockNavigate).toHaveBeenCalledWith('Practice');
      });
    });

    describe('Practice Statistics', () => {
      it('should load practice statistics on mount', async () => {
        render(<HomeScreen />);

        await waitFor(() => {
          expect(mockGetPracticeStats).toHaveBeenCalled();
        });
      });

      it('should display real total practices from stats', async () => {
        const stats: PracticeStats = {
          totalPractices: 25,
          totalMinutes: 180,
          totalMalas: 270,
          favoriteShlokaId: 'gayatri-mantra',
          lastPracticeDate: '2026-02-05T10:00:00.000Z',
        };

        mockGetPracticeStats.mockResolvedValue(stats);

        render(<HomeScreen />);

        await waitFor(() => {
          expect(screen.getByText('25')).toBeTruthy();
        });
      });

      it('should display real minutes practiced from stats', async () => {
        const stats: PracticeStats = {
          totalPractices: 10,
          totalMinutes: 450,
          totalMalas: 108,
          favoriteShlokaId: null,
          lastPracticeDate: null,
        };

        mockGetPracticeStats.mockResolvedValue(stats);

        render(<HomeScreen />);

        await waitFor(() => {
          expect(screen.getByText('450')).toBeTruthy();
        });
      });

      it('should display zero stats when no practice history', async () => {
        const stats: PracticeStats = {
          totalPractices: 0,
          totalMinutes: 0,
          totalMalas: 0,
          favoriteShlokaId: null,
          lastPracticeDate: null,
        };

        mockGetPracticeStats.mockResolvedValue(stats);

        render(<HomeScreen />);

        await waitFor(() => {
          expect(screen.getAllByText('0').length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Trading Windows Integration', () => {
    it('should display Trading Windows card on HomeScreen', async () => {
      render(<HomeScreen />);

      // Wait for the Trading Windows card to be rendered
      await waitFor(() => {
        expect(screen.getByText('Trading Windows Today')).toBeTruthy();
      });
    });

    it('should display both Auspicious Times and Trading Windows sections', async () => {
      render(<HomeScreen />);

      // Both sections should be present
      await waitFor(() => {
        expect(screen.getByText('Auspicious Times Today')).toBeTruthy();
        expect(screen.getByText('Trading Windows Today')).toBeTruthy();
      });
    });

    it('should show trading windows subtitle', async () => {
      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText(/Based on Abhijit Muhurat & Choghadiya/i)).toBeTruthy();
      });
    });

    it('should display auspicious trading times section', async () => {
      render(<HomeScreen />);

      await waitFor(() => {
        expect(screen.getByText('Auspicious Trading Times')).toBeTruthy();
      });
    });
  });
});
