/**
 * useTimer Hook
 * Shloka Sadhana - Timer Management
 *
 * Manages practice session timer with start, pause, resume, and completion
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface UseTimerOptions {
  onComplete?: (elapsedSeconds: number) => void;
  initialElapsedSeconds?: number;
}

export interface UseTimerReturn {
  status: TimerStatus;
  elapsedSeconds: number;
  formattedTime: string;
  isRunning: boolean;
  canComplete: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  complete: () => void;
  setElapsedSeconds: (seconds: number) => void; // V3 Feature #9: For background timer restoration
}

const MIN_COMPLETION_SECONDS = 60;

/**
 * Hook for managing practice session timer
 * Handles start, pause, resume, reset, and completion logic
 * Enforces minimum 60-second requirement for completion
 * Supports initialElapsedSeconds for background timer restoration
 */
export const useTimer = (options?: UseTimerOptions): UseTimerReturn => {
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(options?.initialElapsedSeconds || 0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Clear any existing interval
   */
  const clearExistingInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /**
   * Start timer from idle state
   */
  const start = useCallback(() => {
    if (status !== 'idle') {
      return; // Already running or paused
    }

    setStatus('running');
    clearExistingInterval();

    intervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  }, [status, clearExistingInterval]);

  /**
   * Pause running timer
   */
  const pause = useCallback(() => {
    if (status !== 'running') {
      return; // Not running
    }

    clearExistingInterval();
    setStatus('paused');
  }, [status, clearExistingInterval]);

  /**
   * Resume from paused state
   */
  const resume = useCallback(() => {
    if (status !== 'paused') {
      return; // Not paused
    }

    setStatus('running');
    clearExistingInterval();

    intervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  }, [status, clearExistingInterval]);

  /**
   * Reset timer to initial state
   */
  const reset = useCallback(() => {
    setStatus('idle');
    setElapsedSeconds(0);
    clearExistingInterval();
  }, [clearExistingInterval]);

  /**
   * Complete timer if minimum time requirement is met
   */
  const complete = useCallback(() => {
    if (elapsedSeconds < MIN_COMPLETION_SECONDS) {
      return; // Cannot complete - minimum time not met
    }

    setStatus('completed');
    clearExistingInterval();

    if (options?.onComplete) {
      options.onComplete(elapsedSeconds);
    }
  }, [elapsedSeconds, clearExistingInterval, options]);

  /**
   * Format elapsed seconds as MM:SS
   */
  const formattedTime = formatTime(elapsedSeconds);

  /**
   * Derived state
   */
  const isRunning = status === 'running';
  const canComplete = elapsedSeconds >= MIN_COMPLETION_SECONDS;

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      clearExistingInterval();
    };
  }, [clearExistingInterval]);

  return {
    status,
    elapsedSeconds,
    formattedTime,
    isRunning,
    canComplete,
    start,
    pause,
    resume,
    reset,
    complete,
    setElapsedSeconds, // V3 Feature #9: Expose for background timer restoration
  };
};

/**
 * Format seconds as MM:SS
 * @param seconds Total seconds
 * @returns Formatted time string
 */
function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const minutesStr = String(minutes).padStart(2, '0');
  const secondsStr = String(remainingSeconds).padStart(2, '0');

  return `${minutesStr}:${secondsStr}`;
}
