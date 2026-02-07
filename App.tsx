/**
 * Main App Entry Point
 * Shloka Sadhana - Spiritual Practice Companion
 */

import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from '@/navigation/AppNavigator';
import { useAppUpdates } from '@/hooks/useAppUpdates';

export default function App() {
  // V3 Feature #7: OTA Updates via EAS
  // Automatically checks for and applies updates on app launch
  const updates = useAppUpdates();

  useEffect(() => {
    console.log('[App] Initialized - Shloka Sadhana v1.0.0 - V3 Complete - With OTA Updates');
    if (updates.isUpdateAvailable) {
      console.log('[App] Update available, will apply automatically');
    }
  }, [updates.isUpdateAvailable]);

  return (
    <View style={styles.container}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#121212',
    flex: 1,
  },
});
