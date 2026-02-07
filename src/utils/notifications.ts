/**
 * Notifications Service
 * Shloka Sadhana - Push Notifications
 *
 * Handles notification permissions and daily reminder scheduling
 */

import * as Notifications from 'expo-notifications';

/**
 * Request notification permissions from the user
 * @returns Promise<boolean> - true if granted, false otherwise
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('[Notifications] Permission request error:', error);
    return false;
  }
};

/**
 * Schedule a daily reminder notification at specified time
 * @param hour - Hour of the day (0-23)
 * @param minute - Minute of the hour (0-59)
 * @returns Promise<string | null> - Notification ID or null if failed
 */
export const scheduleDailyReminder = async (
  hour: number,
  minute: number
): Promise<string | null> => {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time for Your Daily Practice 🙏',
        body: "Begin your spiritual journey with today's practice",
        sound: true,
        priority: 'high',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour,
        minute,
        repeats: true,
      },
    });

    console.log('[Notifications] Daily reminder scheduled:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('[Notifications] Schedule error:', error);
    return null;
  }
};

/**
 * Cancel all scheduled notifications
 */
export const cancelAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('[Notifications] All notifications cancelled');
  } catch (error) {
    console.error('[Notifications] Cancel error:', error);
  }
};

/**
 * Get all pending scheduled notifications
 * @returns Promise<NotificationRequest[]> - List of pending notifications
 */
export const getPendingNotifications = async (): Promise<
  Notifications.NotificationRequest[]
> => {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log('[Notifications] Pending notifications:', notifications.length);
    return notifications;
  } catch (error) {
    console.error('[Notifications] Get pending error:', error);
    return [];
  }
};

/**
 * Configure notification handler for foreground notifications
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});
