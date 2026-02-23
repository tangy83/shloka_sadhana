/**
 * Main App Entry Point
 * Shloka Sadhana - Spiritual Practice Companion
 */

import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from '@/navigation/AppNavigator';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useAppUpdates } from '@/hooks/useAppUpdates';
import { Colors } from '@/constants/Colors';

export default function App() {
  const updates = useAppUpdates();

  useEffect(() => {
    console.log('[App] Initialized - Shloka Sadhana v1.0.0');
    if (updates.isUpdateAvailable) {
      console.log('[App] Update available, will apply automatically');
    }
  }, [updates.isUpdateAvailable]);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <View style={styles.container}>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
          <StatusBar style="dark" />
        </View>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
});
