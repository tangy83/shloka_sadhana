/**
 * useUserProfile
 * Shloka Sadhana — Local user profile hook
 *
 * Manages a minimal local profile (display name + avatar emoji).
 * No cloud sync, no auth — stored in AsyncStorage only.
 */

import { useState, useEffect, useCallback } from 'react';
import { getItem, setItem } from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants/StorageKeys';
import { UserProfile } from '@/types';

const DEFAULT_PROFILE: UserProfile = {
  displayName: '',
  avatarEmoji: '🙏',
};

interface UseUserProfileReturn {
  profile: UserProfile;
  saveProfile: (updated: UserProfile) => Promise<void>;
  isLoading: boolean;
}

export const useUserProfile = (): UseUserProfileReturn => {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const saved = await getItem<UserProfile>(STORAGE_KEYS.USER_PROFILE);
        if (saved) {
          setProfile(saved);
        }
      } catch (error) {
        if (__DEV__) console.error('[useUserProfile] Failed to load profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const saveProfile = useCallback(async (updated: UserProfile) => {
    try {
      await setItem(STORAGE_KEYS.USER_PROFILE, updated);
      setProfile(updated);
    } catch (error) {
      if (__DEV__) console.error('[useUserProfile] Failed to save profile:', error);
    }
  }, []);

  return { profile, saveProfile, isLoading };
};
