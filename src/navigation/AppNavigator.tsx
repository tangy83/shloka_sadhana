/**
 * App Navigator
 * Shloka Sadhana - Main Navigation
 *
 * Stack + bottom tab navigation connecting all main screens
 */

import React from 'react';
import { Text } from 'react-native';
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
import { OnboardingScreen } from '@/screens/onboarding';
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { SignUpScreen } from '@/screens/auth/SignUpScreen';
import { FriendsScreen } from '@/screens/FriendsScreen';
import { UserSearchScreen } from '@/screens/UserSearchScreen';
import { UserProfileScreen } from '@/screens/UserProfileScreen';
import { GroupsScreen } from '@/screens/GroupsScreen';
import { GroupDetailScreen } from '@/screens/GroupDetailScreen';
import { CreateGroupScreen } from '@/screens/CreateGroupScreen';
import { ChallengeDetailScreen } from '@/screens/ChallengeDetailScreen';
import { ReferralScreen } from '@/screens/ReferralScreen';
import type { TabParamList, RootStackParamList } from '@/types/navigation';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Bottom Tab Navigator
 */
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1E1E1E',
          borderTopColor: '#2A2A2A',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#FF9800',
        tabBarInactiveTintColor: '#B0B0B0', // Improved contrast for accessibility (4.5:1)
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
          tabBarIcon: () => (
            <Text style={{ fontSize: 24 }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Practice"
        component={PracticeScreen}
        options={{
          tabBarLabel: 'Practice',
          tabBarIcon: () => (
            <Text style={{ fontSize: 24 }}>🙏</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{
          tabBarLabel: 'Library',
          tabBarIcon: () => (
            <Text style={{ fontSize: 24 }}>📚</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Friends"
        component={FriendsScreen}
        options={{
          tabBarLabel: 'Friends',
          tabBarIcon: () => (
            <Text style={{ fontSize: 24 }}>👥</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Satsang"
        component={SatsangScreen}
        options={{
          tabBarLabel: 'Satsang',
          tabBarIcon: () => (
            <Text style={{ fontSize: 24 }}>🎵</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: () => (
            <Text style={{ fontSize: 24 }}>⚙️</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

interface AppNavigatorProps {
  initialRouteName?: keyof RootStackParamList;
}

/**
 * Main App Navigator with Stack
 */
export const AppNavigator: React.FC<AppNavigatorProps> = ({ initialRouteName = 'MainTabs' }) => {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Onboarding flow */}
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />

      {/* Auth screens - P0 #51 */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />

      {/* Main tabs */}
      <Stack.Screen name="MainTabs" component={TabNavigator} />

      {/* Detail screens */}
      <Stack.Screen
        name="ShlokaDetail"
        component={ShlokaDetailScreen}
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: '#1E1E1E',
          },
          headerTintColor: '#FF9800',
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
            backgroundColor: '#1E1E1E',
          },
          headerTintColor: '#FF9800',
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
            backgroundColor: '#1E1E1E',
          },
          headerTintColor: '#FF9800',
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
            backgroundColor: '#1E1E1E',
          },
          headerTintColor: '#FF9800',
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
            backgroundColor: '#1E1E1E',
          },
          headerTintColor: '#FF9800',
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
            backgroundColor: '#1E1E1E',
          },
          headerTintColor: '#FF9800',
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
            backgroundColor: '#1E1E1E',
          },
          headerTintColor: '#FF9800',
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
            backgroundColor: '#1E1E1E',
          },
          headerTintColor: '#FF9800',
          headerTitle: '',
          headerBackTitle: 'Settings',
        }}
      />

      {/* Social screens - Phase 2A Week 16 */}
      <Stack.Screen
        name="UserSearch"
        component={UserSearchScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="UserProfile"
        component={UserProfileScreen}
        options={{
          headerShown: false,
        }}
      />

      {/* Group screens - Phase 2A Week 17 */}
      <Stack.Screen
        name="GroupDetail"
        component={GroupDetailScreen}
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: '#1E1E1E',
          },
          headerTintColor: '#FF9800',
          headerTitle: '',
          headerBackTitle: 'Groups',
        }}
      />
      <Stack.Screen
        name="CreateGroup"
        component={CreateGroupScreen}
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: '#1E1E1E',
          },
          headerTintColor: '#FF9800',
          headerTitle: '',
          headerBackTitle: 'Back',
        }}
      />

      {/* Challenge screens - Phase 2A Week 18 */}
      <Stack.Screen
        name="ChallengeDetail"
        component={ChallengeDetailScreen}
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: '#1E1E1E',
          },
          headerTintColor: '#FF9800',
          headerTitle: '',
          headerBackTitle: 'Group',
        }}
      />

      {/* Referral screen - Phase 2A Week 18 */}
      <Stack.Screen
        name="Referral"
        component={ReferralScreen}
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: '#1E1E1E',
          },
          headerTintColor: '#FF9800',
          headerTitle: '',
          headerBackTitle: 'Settings',
        }}
      />
    </Stack.Navigator>
  );
};
