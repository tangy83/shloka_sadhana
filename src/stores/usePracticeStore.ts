/**
 * Practice Store
 * Shloka Sadhana - State Management
 *
 * Manages practice session state, replacing 9 useState instances from PracticeScreen
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { asyncStoragePersist } from './middleware/storage';
import {
  saveActivePractice,
  clearActivePractice,
  savePracticeToHistory,
} from '@/utils/practiceStorage';
import { CompletedPractice } from '@/types/practice';

export interface PracticeState {
  // Session state
  malaCount: number;
  sankalp: string;
  offering: string;
  sessionStartTime: string | null;
  selectedShlokaId: string | null;
  selectedShlokaName: string | null;

  // UI state
  showSankalpModal: boolean;
  showOfferingModal: boolean;
  hasShownSankalp: boolean;

  // Actions
  incrementMala: () => void;
  decrementMala: () => void;
  resetMala: () => void;
  setMalaCount: (count: number) => void;
  setSankalp: (sankalp: string) => void;
  setOffering: (offering: string) => void;
  setSessionStartTime: (time: string | null) => void;
  startSession: (shlokaId?: string, shlokaName?: string) => void;
  endSession: () => Promise<void>;
  toggleSankalpModal: (show?: boolean) => void;
  toggleOfferingModal: (show?: boolean) => void;
  setHasShownSankalp: (shown: boolean) => void;
  resetSession: () => void;

  // Persistence
  saveSessionToStorage: () => Promise<void>;
  loadSessionFromStorage: () => Promise<void>;
}

/**
 * Practice Store
 *
 * Central store for all practice session state
 *
 * @example
 * ```tsx
 * const {
 *   malaCount,
 *   incrementMala,
 *   showSankalpModal,
 *   toggleSankalpModal
 * } = usePracticeStore();
 * ```
 */
export const usePracticeStore = create<PracticeState>()(
  persist(
    (set, get) => ({
      // Initial state
      malaCount: 0,
      sankalp: '',
      offering: '',
      sessionStartTime: null,
      selectedShlokaId: null,
      selectedShlokaName: null,
      showSankalpModal: false,
      showOfferingModal: false,
      hasShownSankalp: false,

      // Mala counter actions
      incrementMala: () => {
        set((state) => ({
          malaCount: state.malaCount + 1,
        }));
        get().saveSessionToStorage();
      },

      decrementMala: () => {
        set((state) => ({
          malaCount: Math.max(0, state.malaCount - 1),
        }));
        get().saveSessionToStorage();
      },

      resetMala: () => {
        set({ malaCount: 0 });
        get().saveSessionToStorage();
      },

      setMalaCount: (count: number) => {
        set({ malaCount: Math.max(0, count) });
        get().saveSessionToStorage();
      },

      // Session data actions
      setSankalp: (sankalp: string) => {
        set({ sankalp });
        get().saveSessionToStorage();
      },

      setOffering: (offering: string) => {
        set({ offering });
      },

      setSessionStartTime: (time: string | null) => {
        set({ sessionStartTime: time });
        get().saveSessionToStorage();
      },

      // Session lifecycle
      startSession: (shlokaId?: string, shlokaName?: string) => {
        const now = new Date().toISOString();
        set({
          sessionStartTime: now,
          selectedShlokaId: shlokaId || null,
          selectedShlokaName: shlokaName || null,
          malaCount: 0,
          sankalp: '',
          offering: '',
          hasShownSankalp: false,
        });
        get().saveSessionToStorage();
      },

      endSession: async () => {
        const state = get();

        // Save completed practice to history
        const completedPractice: CompletedPractice = {
          id: `practice_${Date.now()}`,
          date: new Date().toISOString(),
          duration: 0, // Will be set by caller (from timer)
          malaCount: state.malaCount,
          shlokaId: state.selectedShlokaId,
          shlokaName: state.selectedShlokaName,
          sankalp: state.sankalp || null,
          offering: state.offering || null,
          notes: null,
        };

        try {
          await savePracticeToHistory(completedPractice);
          await clearActivePractice();
        } catch (error) {
          console.error('[PracticeStore] Error ending session:', error);
        }

        // Reset session state
        get().resetSession();
      },

      // UI actions
      toggleSankalpModal: (show?: boolean) => {
        set((state) => ({
          showSankalpModal: show !== undefined ? show : !state.showSankalpModal,
        }));
      },

      toggleOfferingModal: (show?: boolean) => {
        set((state) => ({
          showOfferingModal: show !== undefined ? show : !state.showOfferingModal,
        }));
      },

      setHasShownSankalp: (shown: boolean) => {
        set({ hasShownSankalp: shown });
      },

      resetSession: () => {
        set({
          malaCount: 0,
          sankalp: '',
          offering: '',
          sessionStartTime: null,
          selectedShlokaId: null,
          selectedShlokaName: null,
          showSankalpModal: false,
          showOfferingModal: false,
          hasShownSankalp: false,
        });
      },

      // Persistence helpers
      saveSessionToStorage: async () => {
        const state = get();

        if (state.sessionStartTime) {
          try {
            await saveActivePractice({
              isActive: true,
              startTime: state.sessionStartTime,
              pausedTime: null,
              elapsedSeconds: 0, // Will be managed by timer
              malaCount: state.malaCount,
              selectedShlokaId: state.selectedShlokaId,
              sankalp: state.sankalp || null,
            });
          } catch (error) {
            console.error('[PracticeStore] Error saving to storage:', error);
          }
        }
      },

      loadSessionFromStorage: async () => {
        // This will be called on app start to restore active session
        // Implementation depends on existing practiceStorage utility
      },
    }),
    {
      name: 'practice-storage',
      storage: createJSONStorage(() => asyncStoragePersist),
      // Only persist essential state, not UI state
      partialize: (state) => ({
        malaCount: state.malaCount,
        sankalp: state.sankalp,
        sessionStartTime: state.sessionStartTime,
        selectedShlokaId: state.selectedShlokaId,
        selectedShlokaName: state.selectedShlokaName,
        hasShownSankalp: state.hasShownSankalp,
      }),
    }
  )
);
