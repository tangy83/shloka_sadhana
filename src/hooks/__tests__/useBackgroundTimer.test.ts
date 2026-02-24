/**
 * useBackgroundTimer Hook Tests
 * Shloka Sadhana — Timer persistence across app background/foreground
 *
 * Tests for the live background/foreground elapsed-time adjustment.
 * AsyncStorage save/restore is handled by PracticeScreen, not this hook.
 */

import { renderHook } from '@testing-library/react-native';
import { AppState, AppStateStatus } from 'react-native';
import { useBackgroundTimer } from '../useBackgroundTimer';

const mockRemoveSubscription = jest.fn();
let appStateHandler: ((state: AppStateStatus) => void) | null = null;

describe('useBackgroundTimer', () => {
  const mockOnRestore = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    appStateHandler = null;

    (AppState as { currentState: AppStateStatus }).currentState = 'active';

    jest.spyOn(AppState, 'addEventListener').mockImplementation((event, handler) => {
      if (event === 'change') {
        appStateHandler = handler as (state: AppStateStatus) => void;
      }
      return { remove: mockRemoveSubscription };
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Lifecycle', () => {
    it('should subscribe to AppState on mount', () => {
      renderHook(() =>
        useBackgroundTimer(false, 0, false, mockOnRestore)
      );

      expect(AppState.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should remove AppState listener on unmount', () => {
      const { unmount } = renderHook(() =>
        useBackgroundTimer(false, 0, false, mockOnRestore)
      );

      unmount();

      expect(mockRemoveSubscription).toHaveBeenCalled();
    });
  });

  describe('Background Transition', () => {
    it('should NOT call onRestore when timer is not active', () => {
      renderHook(() =>
        useBackgroundTimer(false, 0, false, mockOnRestore)
      );

      appStateHandler?.('background');
      appStateHandler?.('active');

      expect(mockOnRestore).not.toHaveBeenCalled();
    });
  });

  describe('Foreground Transition', () => {
    it('should call onRestore with additional background time when timer was running', () => {
      renderHook(() =>
        useBackgroundTimer(true, 30, false, mockOnRestore)
      );

      appStateHandler?.('background');
      appStateHandler?.('active');

      expect(mockOnRestore).toHaveBeenCalledWith(expect.any(Number));
      const restored = mockOnRestore.mock.calls[0][0];
      expect(restored).toBeGreaterThanOrEqual(30);
    });

    it('should NOT call onRestore when timer is paused on foreground return', () => {
      renderHook(() =>
        useBackgroundTimer(true, 30, true, mockOnRestore)
      );

      appStateHandler?.('background');
      appStateHandler?.('active');

      expect(mockOnRestore).not.toHaveBeenCalled();
    });
  });
});
