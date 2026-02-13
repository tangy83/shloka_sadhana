/**
 * Navigation Types
 * Shloka Sadhana - Type-Safe Navigation
 *
 * Comprehensive type definitions for React Navigation
 */

import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

/**
 * Tab Navigator Param List
 * Bottom tab navigation screens
 */
export type TabParamList = {
  Home: undefined;
  Practice: { shlokaId?: string; shlokaName?: string };
  Library: undefined;
  Friends: undefined; // Phase 2A Week 16
  Satsang: undefined;
  Settings: undefined;
};

/**
 * Root Stack Param List
 * All screens including modals and detail screens
 */
export type RootStackParamList = {
  // Onboarding flow
  Onboarding: undefined;

  // Auth screens (P0 #51)
  Login: undefined;
  SignUp: undefined;

  // Main tab navigator
  MainTabs: NavigatorScreenParams<TabParamList>;

  // Detail screens
  ShlokaDetail: { shlokaId: string };
  FestivalsList: undefined;
  EkadashiCalendar: undefined;
  EkadashiDetail: { date: string };
  WisdomDetail: { quoteId: string };
  About: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;

  // Social screens (Phase 2A Week 16)
  UserSearch: undefined;
  UserProfile: { userId: string };

  // Group screens (Phase 2A Week 17)
  GroupDetail: { groupId: string };
  CreateGroup: undefined;

  // Challenge screens (Phase 2A Week 18)
  ChallengeDetail: { groupId: string; challengeId: string };

  // Referral screen (Phase 2A Week 18)
  Referral: undefined;
};

/**
 * Helper types for screen props
 */
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type TabScreenProps<T extends keyof TabParamList> =
  BottomTabScreenProps<TabParamList, T>;

/**
 * Declare global navigation types for autocomplete
 * This enables type-safe navigation.navigate() calls without importing types
 */
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
