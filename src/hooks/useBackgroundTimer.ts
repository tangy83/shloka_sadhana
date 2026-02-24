/**
 * useBackgroundTimer Hook
 * Shloka Sadhana - V3 Feature #9
 *
 * Manages timer persistence across app background/foreground transitions.
 * Uses refs for all parameter values to avoid stale closures in the
 * AppState event listener.
 */

import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';

/**
 * Hook to persist timer state when app goes to background
 * and restore elapsed time when app returns to foreground.
 *
 * NOTE: Session save/restore from AsyncStorage is handled by PracticeScreen.
 * This hook only handles the live background/foreground elapsed-time adjustment.
 */
export function useBackgroundTimer(
  isActive: boolean,
  elapsedSeconds: number,
  isPaused: boolean,
  onRestore: (elapsed: number) => void
) {
  const isActiveRef = useRef(isActive);
  const elapsedRef = useRef(elapsedSeconds);
  const isPausedRef = useRef(isPaused);
  const onRestoreRef = useRef(onRestore);
  const backgroundTimeRef = useRef(0);

  isActiveRef.current = isActive;
  elapsedRef.current = elapsedSeconds;
  isPausedRef.current = isPaused;
  onRestoreRef.current = onRestore;

  const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
    if (nextAppState.match(/inactive|background/) && isActiveRef.current) {
      backgroundTimeRef.current = Date.now();
    }

    if (
      nextAppState === 'active' &&
      isActiveRef.current &&
      backgroundTimeRef.current > 0
    ) {
      if (!isPausedRef.current) {
        const bgSeconds = Math.floor(
          (Date.now() - backgroundTimeRef.current) / 1000
        );
        onRestoreRef.current(elapsedRef.current + bgSeconds);
      }
      backgroundTimeRef.current = 0;
    }
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => { subscription.remove(); };
  }, [handleAppStateChange]);
}
