/**
 * OnboardingScreen
 * Shloka Sadhana - Welcome Flow
 *
 * 5-screen onboarding carousel with progress indicator
 * Goal: 70%+ completion rate
 * Phase 2A Week 18: Added referral code input
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/navigation';
import { useUserStore } from '@/stores/useUserStore';
import { analyticsService } from '@/services/analytics';
import { AnalyticsEvents, AnalyticsProperties } from '@/constants/AnalyticsEvents';
import { getItem, removeItem } from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants/StorageKeys';
import { referralService } from '@/services/referralService';
import auth from '@react-native-firebase/auth';

import { WelcomeScreen } from './WelcomeScreen';
import { ReferralCodeInput } from '@/components/referral/ReferralCodeInput';
import { PersonalizationScreen } from './PersonalizationScreen';
import { FirstPracticeScreen } from './FirstPracticeScreen';
import { NotificationScreen } from './NotificationScreen';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export interface UserPreferences {
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  dailyTime: '5-10' | '10-20' | '20+' | 'flexible';
  preferredDeity?: string;
}

/**
 * OnboardingScreen - Main container for 4-screen onboarding flow
 */
export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [currentStep, setCurrentStep] = useState(1);
  const [preferences, setPreferences] = useState<UserPreferences>({
    experienceLevel: 'beginner',
    dailyTime: 'flexible',
  });
  const [referralCode, setReferralCode] = useState<string | null>(null);

  const { setOnboardingComplete, setPreferences: savePreferences } = useUserStore();

  /**
   * Check for pending referral code from deep link
   * Phase 2A Week 18
   */
  useEffect(() => {
    const checkPendingReferral = async () => {
      const pendingCode = await getItem<string>(STORAGE_KEYS.PENDING_REFERRAL_CODE);
      if (pendingCode) {
        setReferralCode(pendingCode);
        // Don't remove yet - will remove after successful signup
      }
    };
    checkPendingReferral();
  }, []);

  /**
   * Track onboarding started (only once)
   */
  React.useEffect(() => {
    analyticsService.trackEvent(AnalyticsEvents.ONBOARDING_STARTED);
  }, []);

  /**
   * Handle moving to next screen
   */
  const handleNext = () => {
    // Track step completion
    analyticsService.trackEvent(AnalyticsEvents.ONBOARDING_STEP_COMPLETED, {
      [AnalyticsProperties.STEP_NUMBER]: currentStep,
    });

    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  /**
   * Handle referral code validation
   * Phase 2A Week 18
   */
  const handleReferralCodeValidated = (code: string) => {
    setReferralCode(code);
    handleNext();
  };

  /**
   * Handle referral code skip
   * Phase 2A Week 18
   */
  const handleReferralSkip = () => {
    setReferralCode(null);
    handleNext();
  };

  /**
   * Handle going back to previous screen
   */
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  /**
   * Handle skip button (marks onboarding as complete without preferences)
   */
  const handleSkip = async () => {
    analyticsService.trackEvent(AnalyticsEvents.ONBOARDING_SKIPPED, {
      [AnalyticsProperties.STEP_NUMBER]: currentStep,
    });

    await setOnboardingComplete(true);
    navigation.navigate('MainTabs', { screen: 'Home' });
  };

  /**
   * Handle onboarding completion
   */
  const handleComplete = async () => {
    // Save preferences to user store
    await savePreferences(preferences);
    await setOnboardingComplete(true);

    // Phase 2A Week 18: Record referral if code was provided
    if (referralCode && auth().currentUser) {
      try {
        await referralService.recordReferral(referralCode, auth().currentUser!.uid);
        // Clear pending referral code
        await removeItem(STORAGE_KEYS.PENDING_REFERRAL_CODE);
        console.log('[Onboarding] Referral recorded:', referralCode);
      } catch (error) {
        console.error('[Onboarding] Error recording referral:', error);
        // Non-blocking - don't prevent onboarding completion
      }
    }

    // Track completion
    analyticsService.trackEvent(AnalyticsEvents.ONBOARDING_COMPLETED, {
      [AnalyticsProperties.EXPERIENCE_LEVEL]: preferences.experienceLevel,
      [AnalyticsProperties.DAILY_TIME]: preferences.dailyTime,
      [AnalyticsProperties.PREFERRED_DEITY]: preferences.preferredDeity || 'none',
      has_referral_code: !!referralCode,
    });

    // Navigate to main app
    navigation.navigate('MainTabs', { screen: 'Home' });
  };

  /**
   * Update user preferences
   */
  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences({ ...preferences, ...updates });
  };

  /**
   * Render current screen based on step
   */
  const renderCurrentScreen = () => {
    switch (currentStep) {
      case 1:
        return (
          <WelcomeScreen
            onNext={handleNext}
            onSkip={handleSkip}
          />
        );
      case 2:
        // Phase 2A Week 18: Referral code input
        return (
          <View style={styles.screenContainer}>
            <ReferralCodeInput
              onCodeValidated={handleReferralCodeValidated}
              onSkip={handleReferralSkip}
            />
          </View>
        );
      case 3:
        return (
          <PersonalizationScreen
            preferences={preferences}
            onUpdatePreferences={updatePreferences}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <FirstPracticeScreen
            preferences={preferences}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 5:
        return (
          <NotificationScreen
            onComplete={handleComplete}
            onSkip={handleComplete}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {renderCurrentScreen()}

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {[1, 2, 3, 4].map((step) => (
          <View
            key={step}
            style={[
              styles.progressDot,
              step === currentStep && styles.progressDotActive,
              step < currentStep && styles.progressDotCompleted,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#121212',
    flex: 1,
  },
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  progressContainer: {
    alignItems: 'center',
    bottom: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    width: '100%',
  },
  progressDot: {
    backgroundColor: '#3E3E3E',
    borderRadius: 4,
    height: 8,
    marginHorizontal: 4,
    width: 8,
  },
  progressDotActive: {
    backgroundColor: '#FF9800',
    width: 24,
  },
  progressDotCompleted: {
    backgroundColor: '#FF9800',
  },
});
