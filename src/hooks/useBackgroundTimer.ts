/**
 * useBackgroundTimer Hook
 * Shloka Sadhana - V3 Feature #9
 *
 * Manages timer persistence across app background/foreground transitions
 */

import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { saveActivePractice, loadActivePractice } from '@/utils/practiceStorage';

/**
 * Hook to persist timer state when app goes to background
 * and restore it when app returns to foreground
 *
 * @param isActive - Whether timer is currently active
 * @param elapsedSeconds - Current elapsed time in seconds
 * @param isPaused - Whether timer is paused
 * @param onRestore - Callback to restore elapsed time
 */
export function useBackgroundTimer(
  isActive: boolean,
  elapsedSeconds: number,
  isPaused: boolean,
  onRestore: (elapsed: number) => void
) {
  const appState = useRef<AppStateStatus>(AppState.currentState || 'active');
  const backgroundTime = useRef<number>(0);

  useEffect(() => {
    // Subscribe to app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // On mount, check if there's a session to restore
    async function checkRestore() {
      const saved = await loadActivePractice();
      if (saved?.isActive && saved.startTime) {
        // Calculate elapsed time from saved start time
        const startTimeMs = new Date(saved.startTime).getTime();
        const now = Date.now();
        const elapsedMs = now - startTimeMs;

        // If session was paused, use saved elapsedSeconds instead
        if (saved.pausedTime) {
          onRestore(saved.elapsedSeconds);
        } else {
          // Timer was running - calculate total elapsed
          const totalElapsed = Math.floor(elapsedMs / 1000);
          onRestore(Math.max(0, totalElapsed));
        }
      }
    }

    checkRestore();

    // Cleanup listener on unmount
    return () => {
      subscription.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAppStateChange(nextAppState: AppStateStatus) {
    // Going to background or inactive
    if (
      appState.current.match(/active/) &&
      nextAppState.match(/inactive|background/)
    ) {
      if (isActive) {
        // Save current session state
        backgroundTime.current = Date.now();

        const startTime = new Date(Date.now() - elapsedSeconds * 1000).toISOString();
        const pausedTime = isPaused ? new Date().toISOString() : null;

        await saveActivePractice({
          isActive: true,
          startTime,
          pausedTime,
          elapsedSeconds,
          malaCount: 0, // Will be updated by PracticeScreen
          selectedShlokaId: null,
          sankalp: null,
        });
      }
    }

    // Coming to foreground
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      if (isActive && backgroundTime.current > 0) {
        const timeInBackground = Date.now() - backgroundTime.current;

        if (!isPaused) {
          // Timer was running - add background time to elapsed
          const backgroundSeconds = Math.floor(timeInBackground / 1000);
          onRestore(elapsedSeconds + backgroundSeconds);
        }
        // If paused, don't add background time

        backgroundTime.current = 0;
      }
    }

    appState.current = nextAppState;
  }
}
