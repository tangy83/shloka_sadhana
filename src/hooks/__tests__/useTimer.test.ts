/**
 * useTimer Hook Tests
 * Shloka Sadhana - Timer Management Hook
 *
 * Tests for practice timer with start, pause, resume, reset functionality
 */

import { renderHook, act } from '@testing-library/react-native';
import { useTimer } from '../useTimer';

// Mock setInterval and clearInterval
jest.useFakeTimers();

describe('useTimer', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Initial State', () => {
    it('should initialize with idle status and zero elapsed time', () => {
      const { result } = renderHook(() => useTimer());

      expect(result.current.status).toBe('idle');
      expect(result.current.elapsedSeconds).toBe(0);
      expect(result.current.isRunning).toBe(false);
      expect(result.current.canComplete).toBe(false);
    });

    it('should format initial time as 00:00', () => {
      const { result } = renderHook(() => useTimer());

      expect(result.current.formattedTime).toBe('00:00');
    });
  });

  describe('Start Timer', () => {
    it('should start timer and change status to running', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
      });

      expect(result.current.status).toBe('running');
      expect(result.current.isRunning).toBe(true);
    });

    it('should increment elapsed time every second', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.start();
      });

      expect(result.current.elapsedSeconds).toBe(0);

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.elapsedSeconds).toBe(1);

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(result.current.elapsedSeconds).toBe(4);
    });

    it('should format time correctly as MM:SS', () => {
      const { result } = renderHook(() => useTimer());

      act(() => { result.current.start(); });
      act(() => { jest.advanceTimersByTime(65000); });

      expect(result.current.formattedTime).toBe('01:05');
    });

    it('should not start if already running', () => {
      const { result } = renderHook(() => useTimer());

      act(() => { result.current.start(); });
      act(() => { jest.advanceTimersByTime(3000); });

      const elapsedBeforeSecondStart = result.current.elapsedSeconds;

      act(() => { result.current.start(); });

      expect(result.current.elapsedSeconds).toBe(elapsedBeforeSecondStart);
    });
  });

  describe('Pause Timer', () => {
    it('should pause timer and change status to paused', () => {
      const { result } = renderHook(() => useTimer());

      act(() => { result.current.start(); });
      act(() => { jest.advanceTimersByTime(5000); });
      act(() => { result.current.pause(); });

      expect(result.current.status).toBe('paused');
      expect(result.current.isRunning).toBe(false);
      expect(result.current.elapsedSeconds).toBe(5);
    });

    it('should stop incrementing elapsed time when paused', () => {
      const { result } = renderHook(() => useTimer());

      act(() => { result.current.start(); });
      act(() => { jest.advanceTimersByTime(5000); });
      act(() => { result.current.pause(); });

      const elapsedAtPause = result.current.elapsedSeconds;

      act(() => { jest.advanceTimersByTime(10000); });

      expect(result.current.elapsedSeconds).toBe(elapsedAtPause);
    });

    it('should do nothing if timer is not running', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.pause(); // Pause without starting
      });

      expect(result.current.status).toBe('idle');
    });
  });

  describe('Resume Timer', () => {
    it('should resume from paused state', () => {
      const { result } = renderHook(() => useTimer());

      act(() => { result.current.start(); });
      act(() => { jest.advanceTimersByTime(5000); });
      act(() => { result.current.pause(); });

      const elapsedAtPause = result.current.elapsedSeconds;

      act(() => { result.current.resume(); });
      act(() => { jest.advanceTimersByTime(3000); });

      expect(result.current.status).toBe('running');
      expect(result.current.isRunning).toBe(true);
      expect(result.current.elapsedSeconds).toBe(elapsedAtPause + 3);
    });

    it('should do nothing if timer is not paused', () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.resume(); // Resume without pausing
      });

      expect(result.current.status).toBe('idle');
    });

    it('should do nothing if timer is already running', () => {
      const { result } = renderHook(() => useTimer());

      act(() => { result.current.start(); });
      act(() => { jest.advanceTimersByTime(3000); });
      act(() => { result.current.resume(); });

      expect(result.current.status).toBe('running');
    });
  });

  describe('Reset Timer', () => {
    it('should reset timer to initial state', () => {
      const { result } = renderHook(() => useTimer());

      act(() => { result.current.start(); });
      act(() => { jest.advanceTimersByTime(30000); });
      act(() => { result.current.reset(); });

      expect(result.current.status).toBe('idle');
      expect(result.current.elapsedSeconds).toBe(0);
      expect(result.current.formattedTime).toBe('00:00');
      expect(result.current.isRunning).toBe(false);
    });

    it('should reset from paused state', () => {
      const { result } = renderHook(() => useTimer());

      act(() => { result.current.start(); });
      act(() => { jest.advanceTimersByTime(30000); });
      act(() => { result.current.pause(); });
      act(() => { result.current.reset(); });

      expect(result.current.status).toBe('idle');
      expect(result.current.elapsedSeconds).toBe(0);
    });

    it('should reset from completed state', () => {
      const { result } = renderHook(() => useTimer());

      act(() => { result.current.start(); });
      act(() => { jest.advanceTimersByTime(70000); });
      act(() => { result.current.complete(); });
      act(() => { result.current.reset(); });

      expect(result.current.status).toBe('idle');
      expect(result.current.elapsedSeconds).toBe(0);
      expect(result.current.canComplete).toBe(false);
    });
  });

  describe('Complete Timer', () => {
    it('should not complete if less than 60 seconds', () => {
      const { result } = renderHook(() => useTimer());

      act(() => { result.current.start(); });
      act(() => { jest.advanceTimersByTime(30000); });

      expect(result.current.canComplete).toBe(false);

      act(() => { result.current.complete(); });

      expect(result.current.status).toBe('running');
    });

    it('should complete if 60 seconds or more have elapsed', () => {
      const { result } = renderHook(() => useTimer());

      act(() => { result.current.start(); });
      act(() => { jest.advanceTimersByTime(60000); });

      expect(result.current.canComplete).toBe(true);

      act(() => { result.current.complete(); });

      expect(result.current.status).toBe('completed');
    });

    it('should complete if more than 60 seconds have elapsed', () => {
      const { result } = renderHook(() => useTimer());

      act(() => { result.current.start(); });
      act(() => { jest.advanceTimersByTime(120000); });

      expect(result.current.canComplete).toBe(true);

      act(() => { result.current.complete(); });

      expect(result.current.status).toBe('completed');
      expect(result.current.elapsedSeconds).toBe(120);
    });

    it('should stop timer when completed', () => {
      const { result } = renderHook(() => useTimer());

      act(() => { result.current.start(); });
      act(() => { jest.advanceTimersByTime(70000); });
      act(() => { result.current.complete(); });

      const elapsedAtCompletion = result.current.elapsedSeconds;

      act(() => { jest.advanceTimersByTime(10000); });

      expect(result.current.elapsedSeconds).toBe(elapsedAtCompletion);
    });

    it('should call onComplete callback when completing', () => {
      const onComplete = jest.fn();
      const { result } = renderHook(() => useTimer({ onComplete }));

      act(() => { result.current.start(); });
      act(() => { jest.advanceTimersByTime(70000); });
      act(() => { result.current.complete(); });

      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(onComplete).toHaveBeenCalledWith(70);
    });

    it('should not call onComplete if cannot complete', () => {
      const onComplete = jest.fn();
      const { result } = renderHook(() => useTimer({ onComplete }));

      act(() => { result.current.start(); });
      act(() => { jest.advanceTimersByTime(30000); });
      act(() => { result.current.complete(); });

      expect(onComplete).not.toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('should clear interval on unmount', () => {
      const { result, unmount } = renderHook(() => useTimer());

      act(() => { result.current.start(); });
      act(() => { jest.advanceTimersByTime(5000); });

      expect(result.current.elapsedSeconds).toBe(5);

      unmount();

      act(() => { jest.advanceTimersByTime(10000); });
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid start/pause/resume cycles', () => {
      const { result } = renderHook(() => useTimer());

      act(() => { result.current.start(); });
      act(() => { jest.advanceTimersByTime(2000); });
      act(() => { result.current.pause(); });
      act(() => { result.current.resume(); });
      act(() => { jest.advanceTimersByTime(3000); });
      act(() => { result.current.pause(); });
      act(() => { result.current.resume(); });
      act(() => { jest.advanceTimersByTime(5000); });

      expect(result.current.elapsedSeconds).toBe(10);
      expect(result.current.status).toBe('running');
    });

    it('should format time correctly for hours', () => {
      const { result } = renderHook(() => useTimer());

      act(() => { result.current.start(); });
      act(() => { jest.advanceTimersByTime(3665000); });

      expect(result.current.formattedTime).toBe('61:05');
    });

    it('should handle zero padding correctly', () => {
      const { result } = renderHook(() => useTimer());

      act(() => { result.current.start(); });
      act(() => { jest.advanceTimersByTime(9000); });

      expect(result.current.formattedTime).toBe('00:09');
    });
  });

  describe('Multi-Session (Reset and Restart)', () => {
    it('should complete correctly across two consecutive sessions', () => {
      const onComplete = jest.fn();
      const { result } = renderHook(() => useTimer({ onComplete }));

      // First session
      act(() => { result.current.start(); });
      act(() => { jest.advanceTimersByTime(70000); });
      act(() => { result.current.complete(); });

      expect(result.current.status).toBe('completed');
      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(onComplete).toHaveBeenCalledWith(70);

      // Reset
      act(() => { result.current.reset(); });
      expect(result.current.status).toBe('idle');
      expect(result.current.elapsedSeconds).toBe(0);

      // Second session
      act(() => { result.current.start(); });
      act(() => { jest.advanceTimersByTime(70000); });

      expect(result.current.elapsedSeconds).toBe(70);
      expect(result.current.canComplete).toBe(true);

      act(() => { result.current.complete(); });

      expect(result.current.status).toBe('completed');
      expect(onComplete).toHaveBeenCalledTimes(2);
      expect(onComplete).toHaveBeenLastCalledWith(70);
    });

    it('should not leak intervals across sessions', () => {
      const { result } = renderHook(() => useTimer());

      // First session - start, run, complete
      act(() => { result.current.start(); });
      act(() => { jest.advanceTimersByTime(70000); });
      act(() => { result.current.complete(); });

      const elapsedAfterComplete = result.current.elapsedSeconds;

      // No interval should be running after complete
      act(() => { jest.advanceTimersByTime(5000); });
      expect(result.current.elapsedSeconds).toBe(elapsedAfterComplete);

      // Reset and start second session
      act(() => { result.current.reset(); });
      expect(result.current.elapsedSeconds).toBe(0);

      act(() => { result.current.start(); });
      act(() => { jest.advanceTimersByTime(5000); });

      // Exactly 5 seconds — no leaked interval adding extra ticks
      expect(result.current.elapsedSeconds).toBe(5);
    });

    it('should handle three consecutive sessions', () => {
      const onComplete = jest.fn();
      const { result } = renderHook(() => useTimer({ onComplete }));

      for (let session = 0; session < 3; session++) {
        act(() => { result.current.start(); });
        act(() => { jest.advanceTimersByTime(65000); });
        act(() => { result.current.complete(); });

        expect(result.current.status).toBe('completed');

        act(() => { result.current.reset(); });
        expect(result.current.status).toBe('idle');
        expect(result.current.elapsedSeconds).toBe(0);
      }

      expect(onComplete).toHaveBeenCalledTimes(3);
    });

    it('should handle pause/resume cycles across sessions', () => {
      const { result } = renderHook(() => useTimer());

      // First session with pause/resume
      act(() => { result.current.start(); });
      act(() => { jest.advanceTimersByTime(30000); });
      act(() => { result.current.pause(); });
      act(() => { result.current.resume(); });
      act(() => { jest.advanceTimersByTime(40000); });
      act(() => { result.current.complete(); });
      act(() => { result.current.reset(); });

      // Second session with pause/resume
      act(() => { result.current.start(); });
      act(() => { jest.advanceTimersByTime(20000); });
      act(() => { result.current.pause(); });

      expect(result.current.elapsedSeconds).toBe(20);

      act(() => { result.current.resume(); });
      act(() => { jest.advanceTimersByTime(45000); });

      expect(result.current.elapsedSeconds).toBe(65);
      expect(result.current.canComplete).toBe(true);

      act(() => { result.current.complete(); });
      expect(result.current.status).toBe('completed');
    });

    it('should not fire onComplete callback on reset', () => {
      const onComplete = jest.fn();
      const { result } = renderHook(() => useTimer({ onComplete }));

      act(() => { result.current.start(); });
      act(() => { jest.advanceTimersByTime(70000); });
      act(() => { result.current.complete(); });

      expect(onComplete).toHaveBeenCalledTimes(1);

      act(() => { result.current.reset(); });

      // onComplete should NOT fire again on reset
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('Background Timer', () => {
    it('should continue counting time when timer is running', () => {
      const { result } = renderHook(() => useTimer());

      act(() => { result.current.start(); });
      act(() => { jest.advanceTimersByTime(5000); });

      expect(result.current.elapsedSeconds).toBe(5);

      act(() => { jest.advanceTimersByTime(10000); });

      expect(result.current.elapsedSeconds).toBe(15);
    });

    it('should restore elapsed time when initialized with starting value', () => {
      const { result } = renderHook(() => useTimer({ initialElapsedSeconds: 30 }));

      expect(result.current.elapsedSeconds).toBe(30);
      expect(result.current.formattedTime).toBe('00:30');
    });

    it('should continue from initial elapsed time when started', () => {
      const { result } = renderHook(() => useTimer({ initialElapsedSeconds: 45 }));

      act(() => { result.current.start(); });
      act(() => { jest.advanceTimersByTime(20000); });

      expect(result.current.elapsedSeconds).toBe(65);
      expect(result.current.formattedTime).toBe('01:05');
    });

    it('should allow completion if initial time already meets minimum', () => {
      const { result } = renderHook(() => useTimer({ initialElapsedSeconds: 60 }));

      expect(result.current.canComplete).toBe(true);

      act(() => { result.current.start(); });
      act(() => { result.current.complete(); });

      expect(result.current.status).toBe('completed');
    });

    it('should handle paused state with initial elapsed time', () => {
      const { result } = renderHook(() => useTimer({ initialElapsedSeconds: 25 }));

      act(() => { result.current.start(); });
      act(() => { jest.advanceTimersByTime(5000); });
      act(() => { result.current.pause(); });

      expect(result.current.elapsedSeconds).toBe(30);
      expect(result.current.status).toBe('paused');
    });
  });
});
