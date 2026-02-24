/**
 * PracticeScreen Tests
 * Shloka Sadhana - Main Practice Screen
 *
 * Integration tests for practice session flow
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import { PracticeScreen } from '../PracticeScreen';

import { useTimer } from '../../hooks/useTimer';
import { useStreak } from '../../hooks/useStreak';
import { Timer } from '../../components/Timer';
import { MalaCounter } from '../../components/MalaCounter';
import { OfferingModal } from '../../components/OfferingModal';
import {
  loadActivePractice,
  saveActivePractice,
  clearActivePractice,
  savePracticeToHistory,
} from '../../utils/practiceStorage';
import { PracticeSession } from '@/types/practice';

// Mock all hooks and components
jest.mock('../../hooks/useTimer');
jest.mock('../../hooks/useStreak');
jest.mock('../../components/Timer', () => ({
  Timer: jest.fn(() => null),
}));
jest.mock('../../components/MalaCounter', () => ({
  MalaCounter: jest.fn(() => null),
}));
jest.mock('../../components/OfferingModal', () => ({
  OfferingModal: jest.fn(() => null),
}));
jest.mock('../../utils/practiceStorage');

// Mock useAchievements — added post-fork to PracticeScreen (calls checkAndUnlock on completion)
jest.mock('../../hooks/useAchievements', () => ({
  useAchievements: () => ({
    unlockedIds: [],
    xp: 0,
    recentlyUnlocked: null,
    isLoading: false,
    checkAndUnlock: jest.fn().mockResolvedValue(undefined),
    dismissRecentlyUnlocked: jest.fn(),
  }),
}));

const mockUseTimer = useTimer as jest.MockedFunction<typeof useTimer>;
const mockUseStreak = useStreak as jest.MockedFunction<typeof useStreak>;
const MockTimer = Timer as jest.MockedFunction<typeof Timer>;
const MockMalaCounter = MalaCounter as jest.MockedFunction<typeof MalaCounter>;
const MockOfferingModal = OfferingModal as jest.MockedFunction<typeof OfferingModal>;
const mockLoadActivePractice = loadActivePractice as jest.MockedFunction<typeof loadActivePractice>;
const mockSaveActivePractice = saveActivePractice as jest.MockedFunction<typeof saveActivePractice>;
const mockClearActivePractice = clearActivePractice as jest.MockedFunction<typeof clearActivePractice>;
const mockSavePracticeToHistory = savePracticeToHistory as jest.MockedFunction<typeof savePracticeToHistory>;

describe('PracticeScreen', () => {
  const mockStart = jest.fn();
  const mockComplete = jest.fn();
  const mockMarkTodayComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    mockUseTimer.mockReturnValue({
      status: 'idle',
      elapsedSeconds: 0,
      formattedTime: '00:00',
      isRunning: false,
      canComplete: false,
      start: mockStart,
      pause: jest.fn(),
      resume: jest.fn(),
      reset: jest.fn(),
      complete: mockComplete,
      setElapsedSeconds: jest.fn(), // V3 Feature #9: Background timer support
    });

    mockUseStreak.mockReturnValue({
      currentStreak: 5,
      longestStreak: 10,
      totalPractices: 25,
      isPracticedToday: false,
      isStreakAtRisk: true,
      isLoading: false,
      markTodayComplete: mockMarkTodayComplete,
    });

    // Default practice storage mocks
    mockLoadActivePractice.mockResolvedValue(null);
    mockSaveActivePractice.mockResolvedValue();
    mockClearActivePractice.mockResolvedValue();
    mockSavePracticeToHistory.mockResolvedValue();
    // getPracticeStats — used by PracticeScreen to pass stats to achievements.checkAndUnlock
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getPracticeStats } = require('../../utils/practiceStorage');
    (getPracticeStats as jest.Mock).mockResolvedValue({
      totalPractices: 25,
      totalMalas: 100,
      totalMinutes: 500,
      favoriteShlokaId: null,
      lastPracticeDate: null,
    });

    // Mock component implementations
    MockTimer.mockImplementation(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { View, Text } = require('react-native');
      return <View testID="timer-component"><Text>Timer</Text></View>;
    });

    MockMalaCounter.mockImplementation(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { View, Text } = require('react-native');
      return <View testID="mala-counter-component"><Text>MalaCounter</Text></View>;
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    MockOfferingModal.mockImplementation((props: any) => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { View, Text } = require('react-native');
      if (!props.visible) return null;
      return <View testID="offering-modal"><Text>OfferingModal</Text></View>;
    });
  });

  describe('Initial Render', () => {
    it('should render the screen', () => {
      render(<PracticeScreen />);
      expect(screen.getByTestId('timer-component')).toBeTruthy();
      expect(screen.getByTestId('mala-counter-component')).toBeTruthy();
    });

    it('should display screen title', () => {
      render(<PracticeScreen />);
      expect(screen.getByText('Practice')).toBeTruthy();
    });

    it('should render Timer component', () => {
      render(<PracticeScreen />);
      expect(screen.getByTestId('timer-component')).toBeTruthy();
    });

    it('should render MalaCounter component', () => {
      render(<PracticeScreen />);
      expect(screen.getByTestId('mala-counter-component')).toBeTruthy();
    });

    it('should not show modals initially', () => {
      render(<PracticeScreen />);
      expect(screen.queryByTestId('sankalp-modal')).toBeNull();
      expect(screen.queryByTestId('offering-modal')).toBeNull();
    });
  });

  describe('Streak Display', () => {
    it('should display current streak', () => {
      render(<PracticeScreen />);
      expect(screen.getByText(/5/)).toBeTruthy(); // Current streak
    });

    it('should display streak warning when at risk', () => {
      mockUseStreak.mockReturnValue({
        currentStreak: 7,
        longestStreak: 10,
        totalPractices: 25,
        isPracticedToday: false,
        isStreakAtRisk: true,
        isLoading: false,
        markTodayComplete: mockMarkTodayComplete,
      });

      render(<PracticeScreen />);
      expect(screen.getByText(/Practice today/i)).toBeTruthy();
    });

    it('should not display warning when not at risk', () => {
      mockUseStreak.mockReturnValue({
        currentStreak: 7,
        longestStreak: 10,
        totalPractices: 25,
        isPracticedToday: true,
        isStreakAtRisk: false,
        isLoading: false,
        markTodayComplete: mockMarkTodayComplete,
      });

      render(<PracticeScreen />);
      expect(screen.queryByText(/Practice today/i)).toBeNull();
    });
  });

  describe('Practice Flow - Offering Modal', () => {
    it('should show Offering modal when practice completes', () => {
      mockUseTimer.mockReturnValue({
        status: 'completed',
        elapsedSeconds: 120,
        formattedTime: '02:00',
        isRunning: false,
        canComplete: true,
        start: mockStart,
        pause: jest.fn(),
        resume: jest.fn(),
        reset: jest.fn(),
        complete: mockComplete,
      setElapsedSeconds: jest.fn(),
      });

      render(<PracticeScreen />);

      expect(MockOfferingModal).toHaveBeenCalled();
    });
  });

  describe('Mala Counter Integration', () => {
    it('should track mala count changes', () => {
      render(<PracticeScreen />);

      // Verify MalaCounter is rendered with onChange prop
      expect(MockMalaCounter).toHaveBeenCalled();
      const lastCall = MockMalaCounter.mock.calls[MockMalaCounter.mock.calls.length - 1];
      expect(lastCall[0]).toHaveProperty('onChange');
    });
  });

  describe('Timer Integration', () => {
    it('should pass onComplete callback to Timer', () => {
      render(<PracticeScreen />);

      expect(MockTimer).toHaveBeenCalled();
      const lastCall = MockTimer.mock.calls[MockTimer.mock.calls.length - 1];
      expect(lastCall[0]).toHaveProperty('onComplete');
    });
  });

  describe('Streak Integration', () => {
    it('should update streak when practice completes with offering', async () => {
      mockUseTimer.mockReturnValue({
        status: 'completed',
        elapsedSeconds: 120,
        formattedTime: '02:00',
        isRunning: false,
        canComplete: true,
        start: mockStart,
        pause: jest.fn(),
        resume: jest.fn(),
        reset: jest.fn(),
        complete: mockComplete,
      setElapsedSeconds: jest.fn(),
      });

      render(<PracticeScreen />);

      // Get the OfferingModal onConfirm callback
      const offeringCall = MockOfferingModal.mock.calls[MockOfferingModal.mock.calls.length - 1];
      const onConfirm = offeringCall[0].onConfirm;

      // Simulate user confirming offering
      onConfirm('For all beings', '');

      await waitFor(() => {
        expect(mockMarkTodayComplete).toHaveBeenCalled();
      });
    });

    it('should reset timer when practice completes with offering', async () => {
      const mockReset = jest.fn();
      mockUseTimer.mockReturnValue({
        status: 'completed',
        elapsedSeconds: 120,
        formattedTime: '02:00',
        isRunning: false,
        canComplete: true,
        start: mockStart,
        pause: jest.fn(),
        resume: jest.fn(),
        reset: mockReset,
        complete: mockComplete,
        setElapsedSeconds: jest.fn(),
      });

      render(<PracticeScreen />);

      // Get the OfferingModal onConfirm callback
      const offeringCall = MockOfferingModal.mock.calls[MockOfferingModal.mock.calls.length - 1];
      const onConfirm = offeringCall[0].onConfirm;

      // Simulate user confirming offering
      onConfirm('For all beings', '');

      await waitFor(() => {
        expect(mockReset).toHaveBeenCalled();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator when streak is loading', () => {
      mockUseStreak.mockReturnValue({
        currentStreak: 0,
        longestStreak: 0,
        totalPractices: 0,
        isPracticedToday: false,
        isStreakAtRisk: false,
        isLoading: true,
        markTodayComplete: mockMarkTodayComplete,
      });

      render(<PracticeScreen />);
      expect(screen.getByText(/Loading/i)).toBeTruthy();
    });

    it('should hide loading indicator when streak loaded', () => {
      render(<PracticeScreen />);
      expect(screen.queryByText(/Loading/i)).toBeNull();
    });
  });

  describe('Practice Persistence', () => {
    describe('Loading Saved Session', () => {
      it('should load saved practice session on mount', async () => {
        const savedSession: PracticeSession = {
          isActive: true,
          startTime: '2026-02-05T10:00:00.000Z',
          pausedTime: null,
          elapsedSeconds: 300,
          malaCount: 25,
          selectedShlokaId: 'gayatri-mantra',
          sankalp: 'For peace',
        };

        mockLoadActivePractice.mockResolvedValue(savedSession);

        render(<PracticeScreen />);

        await waitFor(() => {
          expect(mockLoadActivePractice).toHaveBeenCalled();
        });
      });

      it('should restore mala count from saved session', async () => {
        const savedSession: PracticeSession = {
          isActive: true,
          startTime: '2026-02-05T10:00:00.000Z',
          pausedTime: null,
          elapsedSeconds: 300,
          malaCount: 50,
          selectedShlokaId: null,
          sankalp: 'For inner peace',
        };

        mockLoadActivePractice.mockResolvedValue(savedSession);

        render(<PracticeScreen />);

        await waitFor(() => {
          expect(mockLoadActivePractice).toHaveBeenCalled();
        });
      });

      it('should handle no saved session gracefully', async () => {
        mockLoadActivePractice.mockResolvedValue(null);

        render(<PracticeScreen />);

        await waitFor(() => {
          expect(mockLoadActivePractice).toHaveBeenCalled();
        });

        // Should render normally
        expect(screen.getByTestId('timer-component')).toBeTruthy();
      });
    });

    describe('Auto-saving Session', () => {
      beforeEach(() => {
        jest.useFakeTimers();
      });

      afterEach(() => {
        jest.useRealTimers();
      });

      it('should auto-save practice session when timer is running', async () => {
        mockUseTimer.mockReturnValue({
          status: 'running',
          elapsedSeconds: 120,
          formattedTime: '02:00',
          isRunning: true,
          canComplete: false,
          start: mockStart,
          pause: jest.fn(),
          resume: jest.fn(),
          reset: jest.fn(),
          complete: mockComplete,
          setElapsedSeconds: jest.fn(),
        });

        render(<PracticeScreen />);

        // Auto-save fires on a 5-second interval while running
        jest.advanceTimersByTime(5000);

        expect(mockSaveActivePractice).toHaveBeenCalled();
      });

      it('should include elapsed time in saved session', async () => {
        mockUseTimer.mockReturnValue({
          status: 'running',
          elapsedSeconds: 240,
          formattedTime: '04:00',
          isRunning: true,
          canComplete: false,
          start: mockStart,
          pause: jest.fn(),
          resume: jest.fn(),
          reset: jest.fn(),
          complete: mockComplete,
          setElapsedSeconds: jest.fn(),
        });

        render(<PracticeScreen />);

        jest.advanceTimersByTime(5000);

        expect(mockSaveActivePractice).toHaveBeenCalledWith(
          expect.objectContaining({
            elapsedSeconds: 240,
            isActive: true,
          })
        );
      });

      it('should save session when paused', async () => {
        mockUseTimer.mockReturnValue({
          status: 'paused',
          elapsedSeconds: 180,
          formattedTime: '03:00',
          isRunning: false,
          canComplete: false,
          start: mockStart,
          pause: jest.fn(),
          resume: jest.fn(),
          reset: jest.fn(),
          complete: mockComplete,
      setElapsedSeconds: jest.fn(),
        });

        render(<PracticeScreen />);

        await waitFor(() => {
          expect(mockSaveActivePractice).toHaveBeenCalledWith(
            expect.objectContaining({
              isActive: false,
            })
          );
        });
      });
    });

    describe('Completing Practice', () => {
      it('should save practice to history on completion', async () => {
        mockUseTimer.mockReturnValue({
          status: 'completed',
          elapsedSeconds: 600,
          formattedTime: '10:00',
          isRunning: false,
          canComplete: true,
          start: mockStart,
          pause: jest.fn(),
          resume: jest.fn(),
          reset: jest.fn(),
          complete: mockComplete,
      setElapsedSeconds: jest.fn(),
        });

        render(<PracticeScreen />);

        // Get the OfferingModal onConfirm callback
        const offeringCall = MockOfferingModal.mock.calls[MockOfferingModal.mock.calls.length - 1];
        const onConfirm = offeringCall[0].onConfirm;

        // Simulate user confirming offering
        onConfirm('For all beings', '');

        await waitFor(() => {
          expect(mockSavePracticeToHistory).toHaveBeenCalledWith(
            expect.objectContaining({
              duration: 600,
              offering: 'For all beings',
            })
          );
        });
      });

      it('should clear active practice after completion', async () => {
        mockUseTimer.mockReturnValue({
          status: 'completed',
          elapsedSeconds: 600,
          formattedTime: '10:00',
          isRunning: false,
          canComplete: true,
          start: mockStart,
          pause: jest.fn(),
          resume: jest.fn(),
          reset: jest.fn(),
          complete: mockComplete,
      setElapsedSeconds: jest.fn(),
        });

        render(<PracticeScreen />);

        // Get the OfferingModal onConfirm callback
        const offeringCall = MockOfferingModal.mock.calls[MockOfferingModal.mock.calls.length - 1];
        const onConfirm = offeringCall[0].onConfirm;

        // Simulate user confirming offering
        onConfirm('For my family', '');

        await waitFor(() => {
          expect(mockClearActivePractice).toHaveBeenCalled();
        });
      });

      it('should save practice with null sankalp (sankalp modal removed)', async () => {
        mockUseTimer.mockReturnValue({
          status: 'completed',
          elapsedSeconds: 600,
          formattedTime: '10:00',
          isRunning: false,
          canComplete: true,
          start: mockStart,
          pause: jest.fn(),
          resume: jest.fn(),
          reset: jest.fn(),
          complete: mockComplete,
          setElapsedSeconds: jest.fn(),
        });

        render(<PracticeScreen />);

        const offeringCall = MockOfferingModal.mock.calls[MockOfferingModal.mock.calls.length - 1];
        const onConfirm = offeringCall[0].onConfirm;

        onConfirm('For all beings', '');

        await waitFor(() => {
          expect(mockSavePracticeToHistory).toHaveBeenCalledWith(
            expect.objectContaining({
              sankalp: null,
            })
          );
        });
      });

      it('should save practice even when offering is skipped', async () => {
        mockUseTimer.mockReturnValue({
          status: 'completed',
          elapsedSeconds: 600,
          formattedTime: '10:00',
          isRunning: false,
          canComplete: true,
          start: mockStart,
          pause: jest.fn(),
          resume: jest.fn(),
          reset: jest.fn(),
          complete: mockComplete,
      setElapsedSeconds: jest.fn(),
        });

        render(<PracticeScreen />);

        // Get the OfferingModal onSkip callback
        const offeringCall = MockOfferingModal.mock.calls[MockOfferingModal.mock.calls.length - 1];
        const onSkip = offeringCall[0].onSkip;

        // Simulate user skipping offering
        onSkip();

        await waitFor(() => {
          expect(mockSavePracticeToHistory).toHaveBeenCalledWith(
            expect.objectContaining({
              duration: 600,
              offering: null,
            })
          );
        });
      });
    });
  });
});
