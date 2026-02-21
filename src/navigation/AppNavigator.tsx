/**
 * App Navigator
 * Shloka Sadhana - Main Navigation
 *
 * Stack + bottom tab navigation connecting all main screens
 */

import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
import { WisdomDetailScreen } from '@/screens/WisdomDetailScreen';
import { AboutScreen } from '@/screens/AboutScreen';
import { PrivacyPolicyScreen } from '@/screens/PrivacyPolicyScreen';
import { TermsOfServiceScreen } from '@/screens/TermsOfServiceScreen';
import { SessionHistoryScreen } from '@/screens/SessionHistoryScreen';

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
          backgroundColor: '#1A0A2E',  // Deep Indigo
          borderTopColor: '#3D2560',
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingBottom: insets.bottom + 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#FF6B35',   // Saffron
        tabBarInactiveTintColor: '#C9A96E', // Warm amber-gold
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
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'cog' : 'cog-outline'}
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
 */
export const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Main tabs */}
      <Stack.Screen name="MainTabs" component={TabNavigator} />

      {/* Detail screens */}
      <Stack.Screen
        name="ShlokaDetail"
        component={ShlokaDetailScreen}
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: '#2D1B4E',
          },
          headerTintColor: '#FF6B35',
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
            backgroundColor: '#2D1B4E',
          },
          headerTintColor: '#FF6B35',
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
            backgroundColor: '#2D1B4E',
          },
          headerTintColor: '#FF6B35',
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
            backgroundColor: '#2D1B4E',
          },
          headerTintColor: '#FF6B35',
          headerTitle: '',
          headerBackTitle: 'Back',
        }}
      />

      {/* Wisdom Detail */}
      <Stack.Screen
        name="WisdomDetail"
        component={WisdomDetailScreen}
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: '#2D1B4E',
          },
          headerTintColor: '#FF6B35',
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
            backgroundColor: '#2D1B4E',
          },
          headerTintColor: '#FF6B35',
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
            backgroundColor: '#2D1B4E',
          },
          headerTintColor: '#FF6B35',
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
            backgroundColor: '#2D1B4E',
          },
          headerTintColor: '#FF6B35',
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
            backgroundColor: '#2D1B4E',
          },
          headerTintColor: '#FF6B35',
          headerTitle: 'Practice History',
          headerBackTitle: 'Home',
        }}
      />
    </Stack.Navigator>
  );
};
