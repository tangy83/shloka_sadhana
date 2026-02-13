/**
 * NotificationScreen
 * Shloka Sadhana - Onboarding Screen 4
 *
 * Request notification permission with time picker
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  requestNotificationPermissions,
  scheduleDailyReminder,
} from '@/utils/notifications';
import { useSettingsStore } from '@/stores/useSettingsStore';

interface NotificationScreenProps {
  onComplete: () => void;
  onSkip: () => void;
  onBack: () => void;
}

/**
 * Screen 4: Notification Permission
 */
export const NotificationScreen: React.FC<NotificationScreenProps> = ({
  onComplete,
  onSkip,
  onBack,
}) => {
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const { setNotificationsEnabled, setNotificationTime } = useSettingsStore();

  // Set initial time to 7:00 AM
  React.useEffect(() => {
    const initialTime = new Date();
    initialTime.setHours(7, 0, 0, 0);
    setSelectedTime(initialTime);
  }, []);

  /**
   * Handle enabling notifications
   */
  const handleEnableNotifications = async () => {
    try {
      // Request permission
      const hasPermission = await requestNotificationPermissions();

      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to receive daily reminders.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Schedule notification
      const hour = selectedTime.getHours();
      const minute = selectedTime.getMinutes();
      await scheduleDailyReminder(hour, minute);

      // Save to settings
      const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      await setNotificationTime(timeStr);
      await setNotificationsEnabled(true);

      // Complete onboarding
      onComplete();
    } catch (error) {
      console.error('[NotificationScreen] Error enabling notifications:', error);
      Alert.alert('Error', 'Failed to enable notifications. You can set this up later in Settings.');
      onSkip();
    }
  };

  /**
   * Handle time change in picker
   */
  const handleTimeChange = (_event: any, date?: Date) => {
    if (date) {
      setSelectedTime(date);
    }
  };

  /**
   * Format time for display
   */
  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = String(minutes).padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${period}`;
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.content}>
        {/* Visual */}
        <Text style={styles.emoji}>🔔</Text>

        {/* Title */}
        <Text style={styles.title}>Stay on track with gentle reminders</Text>
        <Text style={styles.subtitle}>
          We'll send you one daily reminder at your preferred time to keep your practice consistent
        </Text>

        {/* Time Picker */}
        <View style={styles.timeSection}>
          <Text style={styles.timeLabel}>Reminder Time</Text>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setShowTimePicker(!showTimePicker)}
            accessibilityRole="button"
            accessibilityLabel="Select reminder time"
          >
            <Text style={styles.timeText}>{formatTime(selectedTime)}</Text>
            <Text style={styles.timeIcon}>🕐</Text>
          </TouchableOpacity>

          {showTimePicker && (
            <DateTimePicker
              value={selectedTime}
              mode="time"
              is24Hour={false}
              display="spinner"
              onChange={handleTimeChange}
              textColor="#FFFFFF"
              style={styles.timePicker}
            />
          )}
        </View>

        {/* Benefits */}
        <View style={styles.benefits}>
          <View style={styles.benefit}>
            <Text style={styles.benefitIcon}>✓</Text>
            <Text style={styles.benefitText}>One gentle reminder per day</Text>
          </View>
          <View style={styles.benefit}>
            <Text style={styles.benefitIcon}>✓</Text>
            <Text style={styles.benefitText}>Help maintain your streak</Text>
          </View>
          <View style={styles.benefit}>
            <Text style={styles.benefitIcon}>✓</Text>
            <Text style={styles.benefitText}>Change anytime in Settings</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleEnableNotifications}
          accessibilityRole="button"
          accessibilityLabel="Enable Notifications"
        >
          <Text style={styles.ctaText}>Enable Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={onSkip}
          accessibilityRole="button"
          accessibilityLabel="Skip for now"
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  actions: {
    marginBottom: 80,
  },
  backButton: {
    padding: 12,
  },
  backText: {
    color: '#FF9800',
    fontSize: 16,
  },
  benefit: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 12,
  },
  benefitIcon: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 12,
  },
  benefitText: {
    color: '#E0E0E0',
    fontSize: 15,
  },
  benefits: {
    marginTop: 32,
  },
  container: {
    backgroundColor: '#121212',
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  content: {
    flex: 1,
  },
  ctaButton: {
    backgroundColor: '#FF9800',
    borderRadius: 12,
    marginBottom: 12,
    paddingVertical: 16,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  emoji: {
    fontSize: 60,
    marginTop: 20,
    textAlign: 'center',
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderColor: '#3E3E3E',
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 16,
  },
  skipText: {
    color: '#9E9E9E',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: {
    color: '#9E9E9E',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
    textAlign: 'center',
  },
  timeButton: {
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderColor: '#FF9800',
    borderRadius: 12,
    borderWidth: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  timeIcon: {
    fontSize: 24,
  },
  timeLabel: {
    color: '#B0B0B0',
    fontSize: 14,
    marginBottom: 12,
  },
  timePicker: {
    height: 150,
    marginTop: 12,
  },
  timeSection: {
    marginTop: 32,
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700',
    marginTop: 24,
    textAlign: 'center',
  },
});
