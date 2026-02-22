/**
 * SettingsScreen
 * Shloka Sadhana - Settings Configuration
 *
 * Settings screen for app configuration and preferences
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getItem, setItem, clearAll } from '@/utils/storage';
import {
  requestNotificationPermissions,
  scheduleDailyReminder,
  cancelAllNotifications,
} from '@/utils/notifications';
import { useUserProfile } from '@/hooks/useUserProfile';
import Constants from 'expo-constants';
import { Colors } from '@/constants/Colors';

interface NotificationSettings {
  enabled: boolean;
  hour: number;
  minute: number;
}

/**
 * Settings screen - app configuration
 */
const AVATAR_EMOJIS = ['🙏', '🌸', '🕉️', '🪷', '🔥', '⭐', '🌙', '🌺'];

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { profile, saveProfile } = useUserProfile();
  const [displayName, setDisplayName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🙏');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationTime, setNotificationTime] = useState({ hour: 7, minute: 0 });
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempTime, setTempTime] = useState({ hour: 7, minute: 0 });

  // Sync profile values when loaded
  useEffect(() => {
    if (profile.displayName) setDisplayName(profile.displayName);
    if (profile.avatarEmoji) setSelectedEmoji(profile.avatarEmoji);
  }, [profile.displayName, profile.avatarEmoji]);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  /**
   * Load notification settings from storage
   */
  const loadSettings = async () => {
    try {
      const settings = await getItem<NotificationSettings>('notification_settings');
      if (settings) {
        setNotificationsEnabled(settings.enabled);
        setNotificationTime({ hour: settings.hour, minute: settings.minute });
      }
    } catch (error) {
      console.error('[Settings] Error loading settings:', error);
    }
  };

  /**
   * Save notification settings to storage
   */
  const saveSettings = async (enabled: boolean, hour: number, minute: number) => {
    try {
      const settings: NotificationSettings = { enabled, hour, minute };
      await setItem('notification_settings', settings);
    } catch (error) {
      console.error('[Settings] Error saving settings:', error);
    }
  };

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
      setNotificationsEnabled(true);
      await saveSettings(true, notificationTime.hour, notificationTime.minute);
    } else {
      // Cancel all notifications
      await cancelAllNotifications();
      setNotificationsEnabled(false);
      await saveSettings(false, notificationTime.hour, notificationTime.minute);
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
              await clearAll();
              setNotificationsEnabled(false);
              setNotificationTime({ hour: 7, minute: 0 });
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
   * Save user profile
   */
  const handleSaveProfile = async () => {
    await saveProfile({ displayName: displayName.trim(), avatarEmoji: selectedEmoji });
    Alert.alert('Saved', 'Your profile has been updated.');
  };

  /**
   * Navigate to screen
   */
  const navigateToScreen = (screenName: string) => {
    // @ts-expect-error - Navigation types not fully defined
    navigation.navigate(screenName);
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
    setNotificationTime(tempTime);
    await saveSettings(notificationsEnabled, tempTime.hour, tempTime.minute);

    // If notifications are enabled, reschedule with new time
    if (notificationsEnabled) {
      await scheduleDailyReminder(tempTime.hour, tempTime.minute);
    }

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
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>

          <View style={styles.profileCard}>
            <Text style={styles.settingLabel}>Your Name</Text>
            <TextInput
              style={styles.nameInput}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Enter your name"
              placeholderTextColor={Colors.textSecondary}
              maxLength={30}
              returnKeyType="done"
              accessibilityLabel="Your display name"
            />
            <Text style={[styles.settingLabel, { marginTop: 16, marginBottom: 10 }]}>
              Avatar
            </Text>
            <View style={styles.emojiRow}>
              {AVATAR_EMOJIS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={[styles.emojiBtn, selectedEmoji === emoji && styles.emojiBtnActive]}
                  onPress={() => setSelectedEmoji(emoji)}
                  accessibilityRole="button"
                  accessibilityLabel={`Select avatar ${emoji}`}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.saveProfileBtn}
              onPress={handleSaveProfile}
              accessibilityRole="button"
              accessibilityLabel="Save profile"
            >
              <Text style={styles.saveProfileBtnText}>Save Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

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
              trackColor={{ false: '#3e3e3e', true: Colors.primary }}
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

        {/* Guest Mode Note */}
        <View style={styles.guestNote}>
          <Ionicons name="cloud-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.guestNoteText}>
            Guest mode · Your data is stored locally on this device.{'\n'}
            Cloud sync is coming in a future update.
          </Text>
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
                textColor="#FFF8E7"
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
    color: Colors.textSecondary,
    fontSize: 24,
  },
  cancelButton: {
    backgroundColor: Colors.surface,
  },
  cancelButtonText: {
    color: '#FFF8E7',
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  dangerRow: {
    borderColor: '#F44336',
    borderWidth: 1,
  },
  dangerText: {
    color: '#F44336',
  },
  header: {
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    color: '#FFF8E7',
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
    backgroundColor: Colors.surface,
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
    color: '#FFF8E7',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  // previewText: { // Hidden with font size slider
  //   color: '#FFF8E7',
  //   fontWeight: '500',
  //   marginTop: 12,
  //   textAlign: 'center',
  // },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  saveButtonText: {
    color: '#FFF8E7',
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
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  settingDescription: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    color: '#FFF8E7',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingRow: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
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
  //   color: Colors.textSecondary,
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
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  nameInput: {
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.border,
    borderRadius: 10,
    borderWidth: 1,
    color: Colors.text,
    fontSize: 16,
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  emojiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  emojiBtn: {
    alignItems: 'center',
    borderColor: Colors.border,
    borderRadius: 24,
    borderWidth: 1.5,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  emojiBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(229, 91, 0, 0.15)',
  },
  emojiText: {
    fontSize: 22,
  },
  saveProfileBtn: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 10,
    marginTop: 16,
    paddingVertical: 12,
  },
  saveProfileBtnText: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  guestNote: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 10,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
    padding: 14,
  },
  guestNoteText: {
    color: Colors.textSecondary,
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
