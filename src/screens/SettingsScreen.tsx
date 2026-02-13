/**
 * SettingsScreen
 * Shloka Sadhana - Settings Configuration
 *
 * Settings screen for app configuration and preferences
 * Now uses Zustand stores for state management
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
// import Slider from '@react-native-community/slider'; // Hidden for now
import { clearAll } from '@/utils/storage';
import {
  requestNotificationPermissions,
  scheduleDailyReminder,
  cancelAllNotifications,
} from '@/utils/notifications';
import { useSettingsStore } from '@/stores/useSettingsStore';
// import { useFontSize } from '@/hooks/useFontSize'; // Hidden for now
import Constants from 'expo-constants';
import { analyticsService } from '@/services/analytics';
import { AnalyticsEvents, AnalyticsProperties } from '@/constants/AnalyticsEvents';
import { useAuth } from '@/contexts/AuthContext';
import type { RootStackParamList } from '@/types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * Settings screen - app configuration
 */
export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user, signOut } = useAuth();

  // Settings store - replaces useState for persisted settings
  const {
    notificationsEnabled,
    notificationTime: notificationTimeStr,
    setNotificationsEnabled,
    setNotificationTime,
    loadSettings: loadSettingsFromStore,
  } = useSettingsStore();

  // Parse notification time from HH:MM string
  const notificationTime = React.useMemo(() => {
    const [hour, minute] = notificationTimeStr.split(':').map(Number);
    return { hour: hour || 7, minute: minute || 0 };
  }, [notificationTimeStr]);

  // Local UI state
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempTime, setTempTime] = useState({ hour: 7, minute: 0 });

  // Track screen view when Settings screen is focused
  useFocusEffect(
    React.useCallback(() => {
      analyticsService.trackScreen('Settings');
    }, [])
  );

  // Load settings on mount
  useEffect(() => {
    loadSettingsFromStore();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  /**
   * Toggle notifications on/off
   */
  const handleToggleNotifications = async (value: boolean) => {
    if (value) {
      // Request permissions first
      const hasPermission = await requestNotificationPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to receive daily reminders.'
        );
        return;
      }

      // Schedule notification
      await scheduleDailyReminder(notificationTime.hour, notificationTime.minute);
      await setNotificationsEnabled(true);

      // Track notification enabled
      analyticsService.trackEvent(AnalyticsEvents.NOTIFICATION_ENABLED, {
        [AnalyticsProperties.NOTIFICATION_TIME]: `${notificationTime.hour}:${String(notificationTime.minute).padStart(2, '0')}`,
      });
    } else {
      // Cancel all notifications
      await cancelAllNotifications();
      await setNotificationsEnabled(false);

      // Track notification disabled
      analyticsService.trackEvent(AnalyticsEvents.NOTIFICATION_DISABLED);
    }
  };

  /**
   * Handle clear data button press
   */
  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your practice history, streaks, and settings. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            try {
              // Track data cleared before clearing (so event is captured)
              analyticsService.trackEvent(AnalyticsEvents.DATA_CLEARED);

              await clearAll();
              await setNotificationsEnabled(false);
              await setNotificationTime('07:00');
              Alert.alert('Success', 'All data has been cleared.');
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            }
          },
        },
      ]
    );
  };

  /**
   * Navigate to screen (type-safe)
   */
  const navigateToScreen = (screenName: 'About' | 'PrivacyPolicy' | 'TermsOfService') => {
    navigation.navigate(screenName);
  };

  /**
   * Handle sign out - P0 #51
   */
  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              Alert.alert('Signed Out', 'You have been successfully signed out.');
            } catch (error: any) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  /**
   * Navigate to Login screen - P0 #51
   */
  const handleSignIn = () => {
    navigation.navigate('Login');
  };

  /**
   * Open time picker modal
   */
  const handleOpenTimePicker = () => {
    setTempTime(notificationTime);
    setShowTimePicker(true);
  };

  /**
   * Handle time change in picker
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleTimeChange = (event: any, selectedDate?: Date) => {
    if (event.type === 'dismissed' || !selectedDate) {
      return;
    }
    const hour = selectedDate.getHours();
    const minute = selectedDate.getMinutes();
    setTempTime({ hour, minute });
  };

  /**
   * Save selected time and close modal
   */
  const handleSaveTime = async () => {
    // Format time as HH:MM
    const timeStr = `${String(tempTime.hour).padStart(2, '0')}:${String(tempTime.minute).padStart(2, '0')}`;
    await setNotificationTime(timeStr);

    // If notifications are enabled, reschedule with new time
    if (notificationsEnabled) {
      await scheduleDailyReminder(tempTime.hour, tempTime.minute);
    }

    // Track notification time changed
    analyticsService.trackEvent(AnalyticsEvents.NOTIFICATION_TIME_CHANGED, {
      [AnalyticsProperties.NOTIFICATION_TIME]: timeStr,
    });

    setShowTimePicker(false);
  };

  /**
   * Cancel time selection and close modal
   */
  const handleCancelTimePicker = () => {
    setShowTimePicker(false);
  };

  const appVersion = Constants.expoConfig?.version || '1.0.0';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        testID="settings-scroll"
      >
        {/* Appearance Section - HIDDEN FOR NOW */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Font Size</Text>
              <Text style={styles.settingDescription}>
                Adjust text size for better readability
              </Text>
            </View>
          </View>

          <View style={[styles.settingRow, styles.sliderRow]}>
            <View style={styles.sliderContainer}>
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>A</Text>
                <Text style={[styles.sliderLabel, styles.sliderLabelLarge]}>A</Text>
              </View>
              <Slider
                testID="font-size-slider"
                style={styles.slider}
                minimumValue={0.8}
                maximumValue={1.5}
                step={0.1}
                value={fontSize}
                onValueChange={setFontSize}
                minimumTrackTintColor="#FF9800"
                maximumTrackTintColor="#3e3e3e"
                thumbTintColor="#FFA726"
                accessibilityLabel="Font size slider"
                accessibilityRole="adjustable"
              />
              <Text
                testID="font-size-preview"
                style={[styles.previewText, { fontSize: 16 * fontSize }]}
              >
                Sample Text
              </Text>
            </View>
          </View>
        </View> */}

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Daily Reminder</Text>
              <Text style={styles.settingDescription}>
                Receive a notification each day to practice
              </Text>
            </View>
            <Switch
              testID="notification-toggle"
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: '#3e3e3e', true: '#FF9800' }}
              thumbColor={notificationsEnabled ? '#FFA726' : '#f4f3f4'}
              accessibilityLabel="Toggle daily reminders"
              accessibilityRole="switch"
            />
          </View>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleOpenTimePicker}
            testID="reminder-time-button"
            accessibilityRole="button"
            accessibilityLabel="Change reminder time"
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Reminder Time</Text>
              <Text style={styles.settingDescription}>
                {notificationTime.hour}:
                {notificationTime.minute.toString().padStart(2, '0')} {notificationTime.hour >= 12 ? 'PM' : 'AM'}
              </Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Community Section - Phase 2A Week 18 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Community</Text>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => navigation.navigate('Referral')}
            accessibilityRole="button"
            accessibilityLabel="Invite Friends"
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>🎁 Invite Friends</Text>
              <Text style={styles.settingDescription}>
                Share your practice journey and earn rewards
              </Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* App Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Version</Text>
              <Text style={styles.settingDescription}>{appVersion}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => navigateToScreen('About')}
            accessibilityRole="button"
            accessibilityLabel="About Shloka Sadhana"
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>About Shloka Sadhana</Text>
              <Text style={styles.settingDescription}>
                Learn more about this app
              </Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Links Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => navigateToScreen('PrivacyPolicy')}
            accessibilityRole="button"
            accessibilityLabel="Privacy Policy"
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Privacy Policy</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => navigateToScreen('TermsOfService')}
            accessibilityRole="button"
            accessibilityLabel="Terms of Service"
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Terms of Service</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Account Section - P0 #51 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          {user ? (
            <>
              {/* Signed in - show user info and sign out */}
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Signed in as</Text>
                  <Text style={styles.settingDescription}>
                    {user.email || user.displayName || 'User'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.settingRow, styles.dangerRow]}
                onPress={handleSignOut}
                accessibilityRole="button"
                accessibilityLabel="Sign out of account"
              >
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingLabel, styles.dangerText]}>Sign Out</Text>
                  <Text style={styles.settingDescription}>
                    Sign out of your account
                  </Text>
                </View>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Not signed in - show sign in button */}
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Not signed in</Text>
                  <Text style={styles.settingDescription}>
                    Sign in to back up your data and sync across devices
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.settingRow, styles.primaryRow]}
                onPress={handleSignIn}
                accessibilityRole="button"
                accessibilityLabel="Sign in to account"
              >
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingLabel, styles.primaryText]}>Sign In</Text>
                  <Text style={styles.settingDescription}>
                    Back up your progress and sync
                  </Text>
                </View>
                <Text style={[styles.arrow, styles.primaryText]}>›</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Data Management Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>

          <TouchableOpacity
            style={[styles.settingRow, styles.dangerRow]}
            onPress={handleClearData}
            accessibilityRole="button"
            accessibilityLabel="Clear all app data"
            accessibilityHint="This will delete all your practice history and settings"
          >
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, styles.dangerText]}>Clear Data</Text>
              <Text style={styles.settingDescription}>
                Delete all app data and reset
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Time Picker Modal */}
      <Modal
        visible={showTimePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancelTimePicker}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Reminder Time</Text>

            <View style={styles.timePickerContainer}>
              <DateTimePicker
                testID="time-picker"
                value={new Date(2000, 0, 1, tempTime.hour, tempTime.minute)}
                mode="time"
                is24Hour={false}
                display="spinner"
                onChange={handleTimeChange}
                textColor="#FFFFFF"
                style={styles.timePicker}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancelTimePicker}
                accessibilityRole="button"
                accessibilityLabel="Cancel time selection"
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveTime}
                accessibilityRole="button"
                accessibilityLabel="Save reminder time"
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  arrow: {
    color: '#9E9E9E',
    fontSize: 24,
  },
  cancelButton: {
    backgroundColor: '#2A2A2A',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    backgroundColor: '#121212',
    flex: 1,
  },
  dangerRow: {
    borderColor: '#F44336',
    borderWidth: 1,
  },
  dangerText: {
    color: '#F44336',
  },
  primaryRow: {
    borderColor: '#FF9800',
    borderWidth: 1,
  },
  primaryText: {
    color: '#FF9800',
  },
  header: {
    borderBottomColor: '#2A2A2A',
    borderBottomWidth: 1,
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
  },
  modalButton: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    paddingVertical: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    maxWidth: 400,
    padding: 24,
    width: '85%',
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    flex: 1,
    justifyContent: 'center',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  // previewText: { // Hidden with font size slider
  //   color: '#FFFFFF',
  //   fontWeight: '500',
  //   marginTop: 12,
  //   textAlign: 'center',
  // },
  saveButton: {
    backgroundColor: '#FF9800',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#9E9E9E',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  settingDescription: {
    color: '#9E9E9E',
    fontSize: 14,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingRow: {
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    padding: 16,
  },
  // slider: { // Hidden with font size slider
  //   height: 40,
  //   width: '100%',
  // },
  // sliderContainer: { // Hidden with font size slider
  //   width: '100%',
  // },
  // sliderLabel: { // Hidden with font size slider
  //   color: '#9E9E9E',
  //   fontSize: 14,
  //   fontWeight: '600',
  // },
  // sliderLabelLarge: { // Hidden with font size slider
  //   fontSize: 24,
  // },
  // sliderLabels: { // Hidden with font size slider
  //   alignItems: 'flex-end',
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   marginBottom: 8,
  // },
  // sliderRow: { // Hidden with font size slider
  //   alignItems: 'stretch',
  //   flexDirection: 'column',
  // },
  timePicker: {
    height: 200,
    width: '100%',
  },
  timePickerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
});
