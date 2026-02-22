/**
 * App Navigator
 * Shloka Sadhana - Main Navigation
 *
 * Stack + bottom tab navigation connecting all main screens
 */

import React, { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '@/screens/HomeScreen';
import { LibraryScreen } from '@/screens/LibraryScreen';
import { ShlokaDetailScreen } from '@/screens/ShlokaDetailScreen';
import { SatsangScreen } from '@/screens/SatsangScreen';
import { PracticeScreen } from '@/screens/PracticeScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { FestivalsListScreen } from '@/screens/FestivalsListScreen';
import { EkadashiCalendarScreen } from '@/screens/EkadashiCalendarScreen';
import { EkadashiDetailScreen } from '@/screens/EkadashiDetailScreen';
import { WisdomScreen } from '@/screens/WisdomScreen';
import { WisdomDetailScreen } from '@/screens/WisdomDetailScreen';
import { AboutScreen } from '@/screens/AboutScreen';
import { PrivacyPolicyScreen } from '@/screens/PrivacyPolicyScreen';
import { TermsOfServiceScreen } from '@/screens/TermsOfServiceScreen';
import { SessionHistoryScreen } from '@/screens/SessionHistoryScreen';
import { OnboardingScreen } from '@/screens/OnboardingScreen';
import { getItem } from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants/StorageKeys';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/**
 * Bottom Tab Navigator
 */
const TabNavigator = () => {
  const insets = useSafeAreaInsets();
  // Reserve 60pt for icons/labels + full bottom safe area inset so the
  // bar background reaches the screen edge and icons sit comfortably
  // above the home indicator with ~8pt breathing room.
  const tabBarHeight = 60 + insets.bottom;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingBottom: insets.bottom + 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'home-variant' : 'home-variant-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Practice"
        component={PracticeScreen}
        options={{
          tabBarLabel: 'Practice',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="meditation"
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{
          tabBarLabel: 'Library',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'book-open-variant' : 'book-open-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Satsang"
        component={SatsangScreen}
        options={{
          tabBarLabel: 'Satsang',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'bell' : 'bell-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Wisdom"
        component={WisdomScreen}
        options={{
          tabBarLabel: 'Wisdom',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'bulb' : 'bulb-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * Main App Navigator with Stack
 *
 * On first launch (ONBOARDING_COMPLETE not set) the Onboarding screen is
 * registered as the initial route.  After the user completes onboarding the
 * flag is written to AsyncStorage and navigation.replace('MainTabs') is called.
 * On subsequent launches the MainTabs screen is shown immediately.
 */
export const AppNavigator = () => {
  // null = still loading; false = first launch; true = already onboarded
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      const flag = await getItem<boolean>(STORAGE_KEYS.ONBOARDING_COMPLETE);
      setIsOnboarded(flag === true);
    };
    checkOnboarding();
  }, []);

  // Render nothing while we check AsyncStorage — avoids a flash of the wrong screen
  if (isOnboarded === null) {
    return null;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      {/* Conditional root: show onboarding on first launch only */}
      {!isOnboarded && (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      )}

      {/* Main tabs */}
      <Stack.Screen name="MainTabs" component={TabNavigator} />

      {/* Detail screens */}
      <Stack.Screen
        name="ShlokaDetail"
        component={ShlokaDetailScreen}
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: Colors.surface,
          },
          headerTintColor: Colors.primary,
          headerTitle: '',
          headerBackTitle: 'Library',
        }}
      />

      {/* Festivals List - V3 Feature #3 */}
      <Stack.Screen
        name="FestivalsList"
        component={FestivalsListScreen}
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: Colors.surface,
          },
          headerTintColor: Colors.primary,
          headerTitle: '',
          headerBackTitle: 'Back',
        }}
      />

      {/* Ekadashi Calendar - V3 Feature #10 */}
      <Stack.Screen
        name="EkadashiCalendar"
        component={EkadashiCalendarScreen}
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: Colors.surface,
          },
          headerTintColor: Colors.primary,
          headerTitle: '',
          headerBackTitle: 'Back',
        }}
      />

      {/* Ekadashi Detail - V3 Feature #10 */}
      <Stack.Screen
        name="EkadashiDetail"
        component={EkadashiDetailScreen}
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: Colors.surface,
          },
          headerTintColor: Colors.primary,
          headerTitle: '',
          headerBackTitle: 'Back',
        }}
      />

      {/* Settings — accessed via gear icon on Home header */}
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: Colors.surface,
          },
          headerTintColor: Colors.primary,
          headerTitle: 'Settings',
          headerBackTitle: 'Home',
        }}
      />

      {/* Wisdom Detail */}
      <Stack.Screen
        name="WisdomDetail"
        component={WisdomDetailScreen}
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: Colors.surface,
          },
          headerTintColor: Colors.primary,
          headerTitle: '',
          headerBackTitle: 'Back',
        }}
      />

      {/* About */}
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: Colors.surface,
          },
          headerTintColor: Colors.primary,
          headerTitle: '',
          headerBackTitle: 'Settings',
        }}
      />

      {/* Privacy Policy */}
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: Colors.surface,
          },
          headerTintColor: Colors.primary,
          headerTitle: '',
          headerBackTitle: 'Settings',
        }}
      />

      {/* Terms of Service */}
      <Stack.Screen
        name="TermsOfService"
        component={TermsOfServiceScreen}
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: Colors.surface,
          },
          headerTintColor: Colors.primary,
          headerTitle: '',
          headerBackTitle: 'Settings',
        }}
      />

      {/* Session History */}
      <Stack.Screen
        name="SessionHistory"
        component={SessionHistoryScreen}
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: Colors.surface,
          },
          headerTintColor: Colors.primary,
          headerTitle: 'Practice History',
          headerBackTitle: 'Home',
        }}
      />
    </Stack.Navigator>
  );
};
