/**
 * Settings Store
 * Shloka Sadhana - State Management
 *
 * Manages app settings and user preferences
 * Replaces useState from SettingsScreen
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { asyncStoragePersist } from './middleware/storage';
import { getItem, setItem } from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants/StorageKeys';
import { scheduleNotification, cancelAllNotifications } from '@/utils/notifications';
import { firestoreService } from '@/services/firestore';
import { authService } from '@/services/auth';

export interface SettingsState {
  // Notification settings
  notificationsEnabled: boolean;
  notificationTime: string; // HH:MM format (24-hour)

  // Audio/Haptic settings
  hapticsEnabled: boolean;
  soundEnabled: boolean;

  // Theme
  theme: 'dark' | 'light' | 'system';

  // Font size (for accessibility)
  fontSize: 'small' | 'medium' | 'large';

  // Actions - Notifications
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
  setNotificationTime: (time: string) => Promise<void>;

  // Actions - Audio/Haptic
  setHapticsEnabled: (enabled: boolean) => Promise<void>;
  setSoundEnabled: (enabled: boolean) => Promise<void>;

  // Actions - Theme
  setTheme: (theme: 'dark' | 'light' | 'system') => Promise<void>;

  // Actions - Font size
  setFontSize: (size: 'small' | 'medium' | 'large') => Promise<void>;

  // Actions - Data management
  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
  resetSettings: () => Promise<void>;

  // Actions - Cloud Sync (P0 #50)
  syncToCloud: () => Promise<void>;
  loadFromCloud: () => Promise<void>;
}

/**
 * Settings Store
 *
 * Central store for all app settings
 *
 * @example
 * ```tsx
 * const {
 *   notificationsEnabled,
 *   notificationTime,
 *   setNotificationTime
 * } = useSettingsStore();
 * ```
 */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // Initial state (default values)
      notificationsEnabled: false,
      notificationTime: '07:00', // 7:00 AM default
      hapticsEnabled: true,
      soundEnabled: true,
      theme: 'dark',
      fontSize: 'medium',

      // Notification actions
      setNotificationsEnabled: async (enabled: boolean) => {
        set({ notificationsEnabled: enabled });

        if (enabled) {
          // Schedule notification at the set time
          const state = get();
          await scheduleNotification(state.notificationTime);
        } else {
          // Cancel all scheduled notifications
          await cancelAllNotifications();
        }

        await get().saveSettings();
      },

      setNotificationTime: async (time: string) => {
        set({ notificationTime: time });

        // Reschedule notification if enabled
        const state = get();
        if (state.notificationsEnabled) {
          await cancelAllNotifications();
          await scheduleNotification(time);
        }

        await get().saveSettings();
      },

      // Audio/Haptic actions
      setHapticsEnabled: async (enabled: boolean) => {
        set({ hapticsEnabled: enabled });
        await get().saveSettings();
      },

      setSoundEnabled: async (enabled: boolean) => {
        set({ soundEnabled: enabled });
        await get().saveSettings();
      },

      // Theme actions
      setTheme: async (theme: 'dark' | 'light' | 'system') => {
        set({ theme });
        await get().saveSettings();

        // Note: Theme change will be handled by ThemeContext
        // which can subscribe to this store
      },

      // Font size actions
      setFontSize: async (size: 'small' | 'medium' | 'large') => {
        set({ fontSize: size });
        await get().saveSettings();
      },

      // Data management
      loadSettings: async () => {
        try {
          // Load individual settings (for backward compatibility with existing storage)
          const settings = await getItem<Partial<SettingsState>>(
            STORAGE_KEYS.SETTINGS
          );

          if (settings) {
            set({
              notificationsEnabled: settings.notificationsEnabled ?? false,
              notificationTime: settings.notificationTime ?? '07:00',
              hapticsEnabled: settings.hapticsEnabled ?? true,
              soundEnabled: settings.soundEnabled ?? true,
              theme: settings.theme ?? 'dark',
              fontSize: settings.fontSize ?? 'medium',
            });
          }

          // Also check for theme in separate key (if using ThemeContext)
          const theme = await getItem<'dark' | 'light' | 'system'>(
            STORAGE_KEYS.THEME
          );
          if (theme) {
            set({ theme });
          }

          // Font size
          const fontSize = await getItem<'small' | 'medium' | 'large'>(
            STORAGE_KEYS.FONT_SIZE
          );
          if (fontSize) {
            set({ fontSize });
          }
        } catch (error) {
          console.error('[SettingsStore] Error loading settings:', error);
        }
      },

      saveSettings: async () => {
        const state = get();

        const settings: Partial<SettingsState> = {
          notificationsEnabled: state.notificationsEnabled,
          notificationTime: state.notificationTime,
          hapticsEnabled: state.hapticsEnabled,
          soundEnabled: state.soundEnabled,
          theme: state.theme,
          fontSize: state.fontSize,
        };

        try {
          await setItem(STORAGE_KEYS.SETTINGS, settings);

          // Also save theme separately for ThemeContext compatibility
          await setItem(STORAGE_KEYS.THEME, state.theme);

          // Font size
          await setItem(STORAGE_KEYS.FONT_SIZE, state.fontSize);
        } catch (error) {
          console.error('[SettingsStore] Error saving settings:', error);
        }
      },

      resetSettings: async () => {
        set({
          notificationsEnabled: false,
          notificationTime: '07:00',
          hapticsEnabled: true,
          soundEnabled: true,
          theme: 'dark',
          fontSize: 'medium',
        });

        await cancelAllNotifications();
        await get().saveSettings();
      },

      // Cloud Sync - P0 #50
      /**
       * Sync settings to cloud
       * Uploads current settings to Firestore
       */
      syncToCloud: async () => {
        const user = authService.getCurrentUser();
        if (!user) {
          console.log('[SettingsStore] Cannot sync - not authenticated');
          return;
        }

        try {
          const state = get();

          console.log('[SettingsStore] Syncing settings to cloud...');

          await firestoreService.syncSettings(user.uid, {
            notificationsEnabled: state.notificationsEnabled,
            notificationTime: state.notificationTime,
            theme: state.theme,
          });

          console.log('[SettingsStore] Settings synced to cloud');
        } catch (error) {
          console.error('[SettingsStore] Cloud sync error:', error);
          // Don't throw - sync failures should be non-blocking
        }
      },

      /**
       * Load settings from cloud and merge with local
       * Downloads settings from Firestore on sign-in
       */
      loadFromCloud: async () => {
        const user = authService.getCurrentUser();
        if (!user) {
          console.log('[SettingsStore] Cannot load - not authenticated');
          return;
        }

        try {
          console.log('[SettingsStore] Loading settings from cloud...');

          const cloudSettings = await firestoreService.loadSettings(user.uid);

          if (!cloudSettings) {
            console.log('[SettingsStore] No cloud settings - uploading local');
            // Upload local settings to cloud
            await get().syncToCloud();
            return;
          }

          // Merge cloud settings with local (prefer cloud)
          set({
            notificationsEnabled: cloudSettings.notificationsEnabled,
            notificationTime: cloudSettings.notificationTime,
            theme: cloudSettings.theme ?? 'dark',
          });

          // Save merged settings to local storage
          await get().saveSettings();

          console.log('[SettingsStore] Settings loaded from cloud');
        } catch (error) {
          console.error('[SettingsStore] Cloud load error:', error);
          // Don't throw - load failures should be non-blocking
        }
      },
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => asyncStoragePersist),
    }
  )
);
