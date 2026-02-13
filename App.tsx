/**
 * Main App Entry Point
 * Shloka Sadhana - Spiritual Practice Companion
 *
 * P0 #37: Launch Time Optimization
 * - Load only critical data (onboarding status) during launch
 * - Defer secondary data (streak, stats) until after app is interactive
 * - Track launch performance metrics
 */

import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator, Text, Linking } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from '@/navigation/AppNavigator';
import { useAppUpdates } from '@/hooks/useAppUpdates';
import { useUserStore } from '@/stores/useUserStore';
import { AuthProvider } from '@/contexts/AuthContext';
import { getItem, setItem } from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants/StorageKeys';
import { remoteConfigService } from '@/services/remoteConfig';

// P0 #37: Performance tracking - app start time
const APP_START_TIME = Date.now();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { onboardingComplete, loadStreakData, loadStats } = useUserStore();

  // V3 Feature #7: OTA Updates via EAS
  // Automatically checks for and applies updates on app launch
  const updates = useAppUpdates();

  // P0 #37: Load ONLY critical data during launch (onboarding status)
  // Defer loading streak and stats until after app is interactive
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // CRITICAL: Load only onboarding status (determines which screen to show)
        const onboardingStatus = await getItem<boolean>(STORAGE_KEYS.ONBOARDING_COMPLETE);
        if (onboardingStatus !== null) {
          useUserStore.setState({ onboardingComplete: onboardingStatus });
        }
      } catch (error) {
        console.error('[App] Error loading critical data:', error);
      } finally {
        // Mark app as interactive
        setIsLoading(false);

        // P0 #37: Track launch time
        const launchTime = Date.now() - APP_START_TIME;
        console.log(`[Performance] App launch time: ${launchTime}ms`);

        // Optional: Track in analytics if available
        // analyticsService.trackEvent('app_launch', { launch_time_ms: launchTime });
      }
    };

    initializeApp();
  }, []);

  // P0 #37: Defer loading secondary data (streak, stats) until after app is interactive
  useEffect(() => {
    if (!isLoading) {
      const loadSecondaryData = async () => {
        try {
          console.log('[App] Loading secondary data...');
          await loadStreakData();
          await loadStats();

          // Phase 2A: Initialize Remote Config for feature flags
          await remoteConfigService.initialize();
          console.log('[App] Remote Config initialized');

          console.log('[App] Secondary data loaded');
        } catch (error) {
          console.error('[App] Error loading secondary data:', error);
        }
      };

      // Load after a small delay to ensure app is fully interactive
      setTimeout(loadSecondaryData, 100);
    }
  }, [isLoading, loadStreakData, loadStats]);

  useEffect(() => {
    console.log('[App] Initialized - Shloka Sadhana v1.0.0 - V3 Complete - With OTA Updates');
    if (updates.isUpdateAvailable) {
      console.log('[App] Update available, will apply automatically');
    }
  }, [updates.isUpdateAvailable]);

  // Phase 2A Week 18: Deep linking for referral invites
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      const url = event.url;
      console.log('[App] Deep link received:', url);

      // Parse: shlokasadhana.app/invite/PRIYA2024 or shlokasadhana://invite/PRIYA2024
      if (url.includes('/invite/')) {
        const code = url.split('/invite/')[1];
        console.log('[App] Referral code from deep link:', code);

        // Store code for onboarding
        await setItem(STORAGE_KEYS.PENDING_REFERRAL_CODE, code);

        // If user hasn't completed onboarding, they'll see the referral input
        // during onboarding flow
      }
    };

    // Listen for deep links while app is open
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened with a deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Show loading screen while checking onboarding status
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingTitle}>Shloka Sadhana</Text>
        <ActivityIndicator size="large" color="#FF9800" style={styles.loadingSpinner} />
      </View>
    );
  }

  return (
    <AuthProvider>
      <View style={styles.container}>
        <NavigationContainer>
          <AppNavigator initialRouteName={onboardingComplete ? 'MainTabs' : 'Onboarding'} />
        </NavigationContainer>
        <StatusBar style="light" />
      </View>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#121212',
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: '#121212',
    flex: 1,
    justifyContent: 'center',
  },
  loadingSpinner: {
    marginTop: 20,
  },
  loadingTitle: {
    color: '#FF9800',
    fontSize: 32,
    fontWeight: '700',
  },
});
