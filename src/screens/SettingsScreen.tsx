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
  Pressable,
  Alert,
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
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeMode } from '@/constants/theme';
import Constants from 'expo-constants';
import { Colors, withOpacity } from '@/constants/Colors';

interface QuietHoursTime {
  hour: number;
  minute: number;
}

interface NotificationSettings {
  enabled: boolean;
  hour: number;
  minute: number;
  quietHoursEnabled?: boolean;
  quietStart?: QuietHoursTime;
  quietEnd?: QuietHoursTime;
}

// Determine if a notification time falls within quiet hours
function isInQuietHours(
  notifHour: number,
  notifMinute: number,
  start: QuietHoursTime,
  end: QuietHoursTime
): boolean {
  const notifMins = notifHour * 60 + notifMinute;
  const startMins = start.hour * 60 + start.minute;
  const endMins = end.hour * 60 + end.minute;
  if (startMins <= endMins) {
    return notifMins >= startMins && notifMins < endMins;
  }
  // Overnight window (e.g. 22:00 – 06:00)
  return notifMins >= startMins || notifMins < endMins;
}

// Format hour/minute as readable 12-hour time
function formatTime(hour: number, minute: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}:${minute.toString().padStart(2, '0')} ${period}`;
}

const AVATAR_EMOJIS = ['🙏', '🌸', '🕉️', '🪷', '🔥', '⭐', '🌙', '🌺'];

const THEME_OPTIONS: { label: string; value: ThemeMode }[] = [
  { label: 'Dark', value: 'dark' },
  { label: 'Light', value: 'light' },
];

type PickerMode = 'notification' | 'quietStart' | 'quietEnd';

/**
 * Settings screen - app configuration
 */
export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { profile, saveProfile } = useUserProfile();
  const { theme, themeMode, setThemeMode } = useTheme();

  // Profile state
  const [displayName, setDisplayName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🙏');

  // Notification state
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationTime, setNotificationTime] = useState<QuietHoursTime>({ hour: 7, minute: 0 });

  // Quiet hours state
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietStart, setQuietStart] = useState<QuietHoursTime>({ hour: 22, minute: 0 });
  const [quietEnd, setQuietEnd] = useState<QuietHoursTime>({ hour: 6, minute: 0 });

  // Time picker modal state
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<PickerMode>('notification');
  const [tempTime, setTempTime] = useState<QuietHoursTime>({ hour: 7, minute: 0 });

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
        if (settings.quietHoursEnabled !== undefined) {
          setQuietHoursEnabled(settings.quietHoursEnabled);
        }
        if (settings.quietStart) setQuietStart(settings.quietStart);
        if (settings.quietEnd) setQuietEnd(settings.quietEnd);
      }
    } catch (error) {
      if (__DEV__) console.error('[Settings] Error loading settings:', error);
    }
  };

  /**
   * Save notification settings to storage
   */
  const saveSettings = async (
    enabled: boolean,
    notifTime: QuietHoursTime,
    qhEnabled: boolean,
    qhStart: QuietHoursTime,
    qhEnd: QuietHoursTime
  ) => {
    try {
      const settings: NotificationSettings = {
        enabled,
        hour: notifTime.hour,
        minute: notifTime.minute,
        quietHoursEnabled: qhEnabled,
        quietStart: qhStart,
        quietEnd: qhEnd,
      };
      await setItem('notification_settings', settings);
    } catch (error) {
      if (__DEV__) console.error('[Settings] Error saving settings:', error);
    }
  };

  /**
   * Toggle notifications on/off
   */
  const handleToggleNotifications = async (value: boolean) => {
    if (value) {
      const hasPermission = await requestNotificationPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to receive daily reminders.'
        );
        return;
      }

      // Warn if the notification time falls in quiet hours
      if (
        quietHoursEnabled &&
        isInQuietHours(notificationTime.hour, notificationTime.minute, quietStart, quietEnd)
      ) {
        Alert.alert(
          'Quiet Hours Conflict',
          `Your reminder time (${formatTime(notificationTime.hour, notificationTime.minute)}) falls within your quiet hours. Please choose a different reminder time.`
        );
        return;
      }

      await scheduleDailyReminder(notificationTime.hour, notificationTime.minute);
      setNotificationsEnabled(true);
      await saveSettings(true, notificationTime, quietHoursEnabled, quietStart, quietEnd);
    } else {
      await cancelAllNotifications();
      setNotificationsEnabled(false);
      await saveSettings(false, notificationTime, quietHoursEnabled, quietStart, quietEnd);
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
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAll();
              setNotificationsEnabled(false);
              setNotificationTime({ hour: 7, minute: 0 });
              setQuietHoursEnabled(false);
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
   * Open time picker for a specific mode
   */
  const openTimePicker = (mode: PickerMode) => {
    setPickerMode(mode);
    if (mode === 'notification') setTempTime(notificationTime);
    else if (mode === 'quietStart') setTempTime(quietStart);
    else setTempTime(quietEnd);
    setShowTimePicker(true);
  };

  /**
   * Handle time change in picker
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleTimeChange = (event: any, selectedDate?: Date) => {
    if (event.type === 'dismissed' || !selectedDate) return;
    setTempTime({ hour: selectedDate.getHours(), minute: selectedDate.getMinutes() });
  };

  /**
   * Save selected time and close modal
   */
  const handleSaveTime = async () => {
    if (pickerMode === 'notification') {
      setNotificationTime(tempTime);
      await saveSettings(notificationsEnabled, tempTime, quietHoursEnabled, quietStart, quietEnd);
      if (notificationsEnabled) await scheduleDailyReminder(tempTime.hour, tempTime.minute);
    } else if (pickerMode === 'quietStart') {
      setQuietStart(tempTime);
      await saveSettings(notificationsEnabled, notificationTime, quietHoursEnabled, tempTime, quietEnd);
    } else {
      setQuietEnd(tempTime);
      await saveSettings(notificationsEnabled, notificationTime, quietHoursEnabled, quietStart, tempTime);
    }
    setShowTimePicker(false);
  };

  /**
   * Toggle quiet hours
   */
  const handleToggleQuietHours = async (value: boolean) => {
    setQuietHoursEnabled(value);
    await saveSettings(notificationsEnabled, notificationTime, value, quietStart, quietEnd);
  };

  const handleCancelTimePicker = () => setShowTimePicker(false);

  const appVersion = Constants.expoConfig?.version || '1.0.0';

  const pickerTitle =
    pickerMode === 'notification'
      ? 'Set Reminder Time'
      : pickerMode === 'quietStart'
      ? 'Quiet Hours — Start'
      : 'Quiet Hours — End';

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.textBright }]}>Settings</Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        testID="settings-scroll"
      >
        {/* ── Profile Section ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Profile</Text>
          <View style={[styles.profileCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.settingLabel, { color: theme.textBright }]}>Your Name</Text>
            <TextInput
              style={[styles.nameInput, {
                backgroundColor: theme.surfaceElevated,
                borderColor: theme.border,
                color: theme.text,
              }]}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Enter your name"
              placeholderTextColor={theme.textSecondary}
              maxLength={30}
              returnKeyType="done"
              accessibilityLabel="Your display name"
            />
            <Text style={[styles.settingLabel, styles.settingLabelAvatar, { color: theme.textBright }]}>
              Avatar
            </Text>
            <View style={styles.emojiRow}>
              {AVATAR_EMOJIS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={[
                    styles.emojiBtn,
                    { borderColor: theme.border },
                    selectedEmoji === emoji && { borderColor: theme.primary, backgroundColor: withOpacity(Colors.primary, 0.15) },
                  ]}
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

        {/* ── Appearance Section ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Appearance</Text>

          {/* Theme selector */}
          <View style={[styles.settingCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.settingLabel, { color: theme.textBright }]}>Theme</Text>
            <View style={styles.segmentRow}>
              {THEME_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.segmentBtn,
                    { borderColor: theme.border },
                    themeMode === opt.value && { borderColor: theme.primary, backgroundColor: withOpacity(Colors.primary, 0.15) },
                  ]}
                  onPress={() => setThemeMode(opt.value)}
                  accessibilityRole="button"
                  accessibilityLabel={`Set theme to ${opt.label}`}
                >
                  <Text
                    style={[
                      styles.segmentBtnText,
                      { color: theme.textSecondary },
                      themeMode === opt.value && { color: theme.primary },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

        </View>

        {/* ── Notifications Section ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Notifications</Text>

          <View style={[styles.settingRow, { backgroundColor: theme.surface }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: theme.textBright }]}>Daily Reminder</Text>
              <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
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
            style={[styles.settingRow, { backgroundColor: theme.surface }]}
            onPress={() => openTimePicker('notification')}
            testID="reminder-time-button"
            accessibilityRole="button"
            accessibilityLabel="Change reminder time"
          >
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: theme.textBright }]}>Reminder Time</Text>
              <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                {formatTime(notificationTime.hour, notificationTime.minute)}
              </Text>
            </View>
            <Text style={[styles.arrow, { color: theme.textSecondary }]}>›</Text>
          </TouchableOpacity>

          {/* Quiet Hours */}
          <View style={[styles.settingRow, { backgroundColor: theme.surface }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: theme.textBright }]}>Quiet Hours</Text>
              <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                Prevent reminders during sleep or focus time
              </Text>
            </View>
            <Switch
              value={quietHoursEnabled}
              onValueChange={handleToggleQuietHours}
              trackColor={{ false: '#3e3e3e', true: Colors.primary }}
              thumbColor={quietHoursEnabled ? '#FFA726' : '#f4f3f4'}
              accessibilityLabel="Toggle quiet hours"
              accessibilityRole="switch"
            />
          </View>

          {quietHoursEnabled && (
            <>
              <TouchableOpacity
                style={[styles.settingRow, styles.indentedRow, { backgroundColor: theme.surface }]}
                onPress={() => openTimePicker('quietStart')}
                accessibilityRole="button"
                accessibilityLabel="Set quiet hours start time"
              >
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingLabel, { color: theme.textBright }]}>Start</Text>
                  <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                    {formatTime(quietStart.hour, quietStart.minute)}
                  </Text>
                </View>
                <Text style={[styles.arrow, { color: theme.textSecondary }]}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.settingRow, styles.indentedRow, { backgroundColor: theme.surface }]}
                onPress={() => openTimePicker('quietEnd')}
                accessibilityRole="button"
                accessibilityLabel="Set quiet hours end time"
              >
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingLabel, { color: theme.textBright }]}>End</Text>
                  <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                    {formatTime(quietEnd.hour, quietEnd.minute)}
                  </Text>
                </View>
                <Text style={[styles.arrow, { color: theme.textSecondary }]}>›</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* ── App Info Section ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>About</Text>

          <View style={[styles.settingRow, { backgroundColor: theme.surface }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: theme.textBright }]}>Version</Text>
              <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>{appVersion}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.settingRow, { backgroundColor: theme.surface }]}
            onPress={() => navigateToScreen('About')}
            accessibilityRole="button"
            accessibilityLabel="About Sadhana"
          >
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: theme.textBright }]}>About Sadhana</Text>
              <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>Learn more about this app</Text>
            </View>
            <Text style={[styles.arrow, { color: theme.textSecondary }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* ── Legal Section ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Legal</Text>

          <TouchableOpacity
            style={[styles.settingRow, { backgroundColor: theme.surface }]}
            onPress={() => navigateToScreen('PrivacyPolicy')}
            accessibilityRole="button"
            accessibilityLabel="Privacy Policy"
          >
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: theme.textBright }]}>Privacy Policy</Text>
            </View>
            <Text style={[styles.arrow, { color: theme.textSecondary }]}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingRow, { backgroundColor: theme.surface }]}
            onPress={() => navigateToScreen('TermsOfService')}
            accessibilityRole="button"
            accessibilityLabel="Terms of Service"
          >
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: theme.textBright }]}>Terms of Service</Text>
            </View>
            <Text style={[styles.arrow, { color: theme.textSecondary }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* ── Guest Mode Note ── */}
        <View style={[styles.guestNote, { backgroundColor: theme.surface }]}>
          <Ionicons name="cloud-outline" size={16} color={theme.textSecondary} />
          <Text style={[styles.guestNoteText, { color: theme.textSecondary }]}>
            Guest mode · Your data is stored locally on this device.{'\n'}
            Cloud sync is coming in a future update.
          </Text>
        </View>

        {/* ── Data Management Section ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Data</Text>

          <TouchableOpacity
            style={[styles.settingRow, styles.dangerRow, { backgroundColor: theme.surface }]}
            onPress={handleClearData}
            accessibilityRole="button"
            accessibilityLabel="Clear all app data"
            accessibilityHint="This will delete all your practice history and settings"
          >
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, styles.dangerText]}>Clear Data</Text>
              <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>Delete all app data and reset</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Time Picker Overlay ── */}
      {showTimePicker && (
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleCancelTimePicker} />
          <View style={[styles.modalContent, { backgroundColor: theme.surfaceElevated }]}>
            <Text style={[styles.modalTitle, { color: theme.textBright }]}>{pickerTitle}</Text>

            <View style={styles.timePickerContainer}>
              <DateTimePicker
                testID="time-picker"
                value={new Date(2000, 0, 1, tempTime.hour, tempTime.minute)}
                mode="time"
                is24Hour={false}
                display="spinner"
                onChange={handleTimeChange}
                textColor={theme.textBright}
                style={styles.timePicker}
              />
            </View>

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, { backgroundColor: theme.surface }]}
                onPress={handleCancelTimePicker}
                accessibilityRole="button"
                accessibilityLabel="Cancel time selection"
              >
                <Text style={[styles.cancelButtonText, { color: theme.textBright }]}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveTime}
                accessibilityRole="button"
                accessibilityLabel="Save selected time"
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  arrow: {
    color: Colors.textSecondary,
    fontSize: 24,
  },
  cancelButtonText: {
    color: Colors.textBright,
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  dangerRow: {
    borderColor: Colors.error,
    borderWidth: 1,
  },
  dangerText: {
    color: Colors.error,
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
  emojiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  emojiText: {
    fontSize: 22,
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
  header: {
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    color: Colors.textBright,
    fontSize: 32,
    fontWeight: '700',
  },
  indentedRow: {
    marginLeft: 16,
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
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: Colors.scrim,
    justifyContent: 'center',
    zIndex: 9999,
  },
  modalTitle: {
    color: Colors.textBright,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
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
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  saveButtonText: {
    color: Colors.textBright,
    fontSize: 16,
    fontWeight: '600',
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
  segmentBtn: {
    alignItems: 'center',
    borderColor: Colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 8,
  },
  segmentBtnText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  settingCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 8,
    padding: 16,
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
    color: Colors.textBright,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingLabelAvatar: {
    marginBottom: 10,
    marginTop: 16,
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
  timePicker: {
    height: 200,
    width: '100%',
  },
  timePickerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
});
