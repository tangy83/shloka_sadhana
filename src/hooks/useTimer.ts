/**
 * useTimer Hook
 * Shloka Sadhana - Timer Management
 *
 * Manages practice session timer with start, pause, resume, and completion.
 * Uses effect-based interval management to avoid side effects in state updaters.
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
  setElapsedSeconds: (seconds: number) => void;
}

const MIN_COMPLETION_SECONDS = 60;

/**
 * Hook for managing practice session timer.
 * Interval lifecycle is driven by a useEffect watching `status`,
 * ensuring proper cleanup via the effect's return function.
 * Action functions only update state — no side effects.
 */
export const useTimer = (options?: UseTimerOptions): UseTimerReturn => {
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(options?.initialElapsedSeconds || 0);

  const onCompleteRef = useRef(options?.onComplete);
  const elapsedRef = useRef(elapsedSeconds);

  useEffect(() => {
    onCompleteRef.current = options?.onComplete;
  }, [options?.onComplete]);

  // Keep elapsedRef in sync so complete() can read the latest value
  elapsedRef.current = elapsedSeconds;

  /**
   * Effect-based interval management.
   * Starts the interval when status is 'running', cleans up otherwise.
   */
  useEffect(() => {
    if (status !== 'running') return;

    const id = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(id);
    };
  }, [status]);

  /**
   * Fire onComplete callback when status transitions to 'completed'.
   * Runs in an effect so it's not nested inside a state updater.
   */
  const hasCalledCompleteRef = useRef(false);

  useEffect(() => {
    if (status === 'completed' && !hasCalledCompleteRef.current) {
      hasCalledCompleteRef.current = true;
      onCompleteRef.current?.(elapsedRef.current);
    }
    if (status !== 'completed') {
      hasCalledCompleteRef.current = false;
    }
  }, [status]);

  const start = useCallback(() => {
    setStatus((s) => (s === 'idle' ? 'running' : s));
  }, []);

  const pause = useCallback(() => {
    setStatus((s) => (s === 'running' ? 'paused' : s));
  }, []);

  const resume = useCallback(() => {
    setStatus((s) => (s === 'paused' ? 'running' : s));
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setElapsedSeconds(0);
  }, []);

  const complete = useCallback(() => {
    if (elapsedRef.current < MIN_COMPLETION_SECONDS) return;
    setStatus('completed');
  }, []);

  const formattedTime = formatTime(elapsedSeconds);
  const isRunning = status === 'running';
  const canComplete = elapsedSeconds >= MIN_COMPLETION_SECONDS;

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
    setElapsedSeconds,
  };
};

/**
 * Format seconds as MM:SS
 */
function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const minutesStr = String(minutes).padStart(2, '0');
  const secondsStr = String(remainingSeconds).padStart(2, '0');

  return `${minutesStr}:${secondsStr}`;
}
