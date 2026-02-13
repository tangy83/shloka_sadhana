/**
 * useFeatureFlags Hook
 * Shloka Sadhana - Phase 2A: Feature Flags
 *
 * React hook for accessing Firebase Remote Config feature flags
 */

import { useState, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { remoteConfigService, FeatureFlags } from '@/services/remoteConfig';

/**
 * Hook to access feature flags from Remote Config
 * Automatically refreshes when app comes to foreground
 */
export const useFeatureFlags = () => {
  const [flags, setFlags] = useState<FeatureFlags>(remoteConfigService.getFeatureFlags());
  const [loading, setLoading] = useState(false);

  // Refresh flags when app comes to foreground
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        setLoading(true);
        await remoteConfigService.refresh();
        setFlags(remoteConfigService.getFeatureFlags());
        setLoading(false);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  return {
    flags,
    loading,
    isFeatureEnabled: (feature: keyof FeatureFlags) => flags[feature],
  };
};

/**
 * Helper hook to check if a specific feature is enabled
 */
export const useFeatureFlag = (feature: keyof FeatureFlags): boolean => {
  const { flags } = useFeatureFlags();
  return flags[feature];
};
