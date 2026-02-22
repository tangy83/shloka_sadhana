/**
 * useBackgroundTimer Hook Tests
 * Shloka Sadhana — Timer persistence across app background/foreground
 */

import { renderHook } from '@testing-library/react-native';
import { AppState, AppStateStatus } from 'react-native';
import { useBackgroundTimer } from '../useBackgroundTimer';
import { saveActivePractice, loadActivePractice } from '../../utils/practiceStorage';

// Mock practiceStorage
jest.mock('../../utils/practiceStorage');
const mockSaveActivePractice = saveActivePractice as jest.MockedFunction<typeof saveActivePractice>;
const mockLoadActivePractice = loadActivePractice as jest.MockedFunction<typeof loadActivePractice>;

// Use jest.spyOn instead of jest.mock('react-native', ...) to avoid TurboModule errors
// (jest.requireActual('react-native') triggers TurboModuleRegistry errors in Expo Jest env)
const mockRemoveSubscription = jest.fn();
let appStateHandler: ((state: AppStateStatus) => void) | null = null;

describe('useBackgroundTimer', () => {
  const mockOnRestore = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    appStateHandler = null;
    mockLoadActivePractice.mockResolvedValue(null);
    mockSaveActivePractice.mockResolvedValue(undefined);

    // Ensure currentState is a real string so useRef(AppState.currentState || 'active')
    // yields 'active' and appState.current.match(...) works correctly
    (AppState as { currentState: AppStateStatus }).currentState = 'active';

    // Spy on AppState.addEventListener and capture the handler
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

  describe('Mount / Restore', () => {
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

    it('should call onRestore with paused elapsed if session was paused', async () => {
      mockLoadActivePractice.mockResolvedValue({
        isActive: true,
        startTime: new Date(Date.now() - 120_000).toISOString(),
        pausedTime: new Date().toISOString(),
        elapsedSeconds: 90,
        malaCount: 0,
        selectedShlokaId: null,
        sankalp: null,
      });

      renderHook(() =>
        useBackgroundTimer(false, 0, false, mockOnRestore)
      );

      // Wait for async checkRestore
      await new Promise((r) => setTimeout(r, 10));

      expect(mockOnRestore).toHaveBeenCalledWith(90);
    });

    it('should call onRestore with calculated elapsed if session was running', async () => {
      const startTime = new Date(Date.now() - 60_000).toISOString(); // 60s ago

      mockLoadActivePractice.mockResolvedValue({
        isActive: true,
        startTime,
        pausedTime: null,
        elapsedSeconds: 0,
        malaCount: 0,
        selectedShlokaId: null,
        sankalp: null,
      });

      renderHook(() =>
        useBackgroundTimer(false, 0, false, mockOnRestore)
      );

      await new Promise((r) => setTimeout(r, 20));

      expect(mockOnRestore).toHaveBeenCalledWith(expect.any(Number));
      const elapsed = (mockOnRestore as jest.Mock).mock.calls[0][0];
      expect(elapsed).toBeGreaterThanOrEqual(55); // at least ~55s
    });

    it('should NOT call onRestore when no active session exists', async () => {
      mockLoadActivePractice.mockResolvedValue(null);

      renderHook(() =>
        useBackgroundTimer(false, 0, false, mockOnRestore)
      );

      await new Promise((r) => setTimeout(r, 10));

      expect(mockOnRestore).not.toHaveBeenCalled();
    });
  });

  describe('Background Transition (active → background)', () => {
    it('should save active practice when timer is running and app goes to background', async () => {
      renderHook(() =>
        useBackgroundTimer(true, 30, false, mockOnRestore)
      );

      // Simulate going to background
      appStateHandler?.('background');

      await new Promise((r) => setTimeout(r, 10));

      expect(mockSaveActivePractice).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: true,
          elapsedSeconds: 30,
        })
      );
    });

    it('should save pausedTime when timer is paused on backgrounding', async () => {
      renderHook(() =>
        useBackgroundTimer(true, 45, true, mockOnRestore)
      );

      appStateHandler?.('inactive');

      await new Promise((r) => setTimeout(r, 10));

      expect(mockSaveActivePractice).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: true,
          pausedTime: expect.any(String),
        })
      );
    });

    it('should NOT save when timer is not active', async () => {
      renderHook(() =>
        useBackgroundTimer(false, 0, false, mockOnRestore)
      );

      appStateHandler?.('background');

      await new Promise((r) => setTimeout(r, 10));

      expect(mockSaveActivePractice).not.toHaveBeenCalled();
    });
  });

  describe('Foreground Transition (background → active)', () => {
    it('should call onRestore with additional background time when timer was running', async () => {
      renderHook(() =>
        useBackgroundTimer(true, 30, false, mockOnRestore)
      );

      // Simulate app going to background first
      appStateHandler?.('background');
      await new Promise((r) => setTimeout(r, 10));

      // Simulate returning to foreground
      appStateHandler?.('active');

      expect(mockOnRestore).toHaveBeenCalledWith(expect.any(Number));
    });

    it('should NOT call onRestore when timer is paused on foreground return', async () => {
      renderHook(() =>
        useBackgroundTimer(true, 30, true, mockOnRestore)
      );

      // onRestore may have been called during checkRestore — clear it
      mockOnRestore.mockClear();

      appStateHandler?.('background');
      await new Promise((r) => setTimeout(r, 10));
      appStateHandler?.('active');

      expect(mockOnRestore).not.toHaveBeenCalled();
    });
  });
});
