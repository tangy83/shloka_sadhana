/**
 * useAppUpdates Hook
 * Shloka Sadhana - V3 Feature #7
 *
 * Manages OTA (Over-The-Air) updates via Expo EAS
 * Automatically checks for and applies updates
 */

import { useEffect, useState } from 'react';
import * as Updates from 'expo-updates';

export interface UseAppUpdatesReturn {
  isChecking: boolean;
  isDownloading: boolean;
  isUpdateAvailable: boolean;
  checkForUpdates: () => Promise<void>;
  applyUpdate: () => Promise<void>;
}

/**
 * Hook to manage app updates via EAS
 * Automatically checks for updates on mount
 */
export function useAppUpdates(): UseAppUpdatesReturn {
  const [isChecking, setIsChecking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);

  /**
   * Check if updates are available
   */
  const checkForUpdates = async () => {
    // Skip in development mode
    if (__DEV__) {
      console.log('[useAppUpdates] Skipping update check in development mode');
      return;
    }

    try {
      setIsChecking(true);
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        console.log('[useAppUpdates] Update available');
        setIsUpdateAvailable(true);
      } else {
        console.log('[useAppUpdates] No update available');
        setIsUpdateAvailable(false);
      }
    } catch (error) {
      console.error('[useAppUpdates] Error checking for updates:', error);
      setIsUpdateAvailable(false);
    } finally {
      setIsChecking(false);
    }
  };

  /**
   * Download and apply available update
   */
  const applyUpdate = async () => {
    // Skip in development mode
    if (__DEV__) {
      console.log('[useAppUpdates] Skipping update apply in development mode');
      return;
    }

    if (!isUpdateAvailable) {
      console.log('[useAppUpdates] No update to apply');
      return;
    }

    try {
      setIsDownloading(true);
      console.log('[useAppUpdates] Fetching update...');

      await Updates.fetchUpdateAsync();

      console.log('[useAppUpdates] Update downloaded, reloading app...');
      await Updates.reloadAsync();
    } catch (error) {
      console.error('[useAppUpdates] Error applying update:', error);
      setIsDownloading(false);
    }
  };

  /**
   * Auto-check for updates on mount
   */
  useEffect(() => {
    // Only auto-check in production
    if (!__DEV__) {
      checkForUpdates();
    }
  }, []);

  /**
   * Auto-apply updates if available (silent updates)
   */
  useEffect(() => {
    if (isUpdateAvailable && !isDownloading) {
      // Automatically apply update in production
      console.log('[useAppUpdates] Auto-applying update...');
      applyUpdate();
    }
  }, [isUpdateAvailable]);

  return {
    isChecking,
    isDownloading,
    isUpdateAvailable,
    checkForUpdates,
    applyUpdate,
  };
}
