/**
 * Notifications Service
 * Shloka Sadhana - Push Notifications
 *
 * Handles notification permissions and daily reminder scheduling
 * Enhanced with personalized messages and streak-risk alerts (P0 #45 & #46)
 */

import * as Notifications from 'expo-notifications';
import { checkIfEkadashi, getEkadashiByDate } from './ekadashiCalendar';
import { loadPracticeHistory } from './practiceStorage';

/**
 * User data interface for personalized notifications
 */
interface UserNotificationData {
  currentStreak: number;
  totalPractices: number;
  preferredDeity?: string;
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
}

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
 * P0 #45: Get personalized notification message based on user data
 * Messages vary by streak status, experience level, and context
 */
export const getPersonalizedNotificationMessage = (
  userData: UserNotificationData,
  isEkadashi: boolean = false
): { title: string; body: string } => {
  const { currentStreak, totalPractices, preferredDeity, experienceLevel } = userData;

  // Ekadashi special message (highest priority)
  if (isEkadashi) {
    return {
      title: 'Today is Ekadashi 🌙',
      body: 'A sacred day for spiritual practice. Begin your practice now!',
    };
  }

  // No streak yet - encouraging first steps
  if (currentStreak === 0 && totalPractices === 0) {
    return {
      title: 'Begin Your Spiritual Journey 🙏',
      body: 'Start your first practice today and build a meaningful habit',
    };
  }

  // Lost streak - motivational restart
  if (currentStreak === 0 && totalPractices > 0) {
    return {
      title: 'Start a New Practice Streak 🌟',
      body: 'Every day is a new beginning. Practice today and rebuild your streak',
    };
  }

  // Early streak (1-6 days) - encouraging
  if (currentStreak >= 1 && currentStreak <= 6) {
    return {
      title: 'Build Your Practice Habit 💪',
      body: `Day ${currentStreak} of your journey! Keep the momentum going`,
    };
  }

  // Week milestone (7 days)
  if (currentStreak === 7) {
    return {
      title: 'One Week Streak! 🎉',
      body: 'Incredible progress! Keep your 7-day streak alive with today\'s practice',
    };
  }

  // Strong streak (8-20 days) - maintenance
  if (currentStreak >= 8 && currentStreak <= 20) {
    return {
      title: `${currentStreak}-Day Streak 🔥`,
      body: 'Your dedication is inspiring! Continue your practice today',
    };
  }

  // Three-week milestone (21 days)
  if (currentStreak === 21) {
    return {
      title: 'Three Weeks Strong! 🏆',
      body: 'You\'ve built a powerful habit! Keep your 21-day streak going',
    };
  }

  // Advanced practitioner (30+ days) - reverence
  if (currentStreak >= 30) {
    return {
      title: `${currentStreak} Days of Devotion 🙏`,
      body: 'Your practice is a testament to your dedication. Continue today',
    };
  }

  // Default (shouldn't reach here)
  return {
    title: 'Time for Your Daily Practice 🙏',
    body: 'Begin your spiritual journey with today\'s practice',
  };
};

/**
 * P0 #45: Schedule daily reminder with personalized message
 * Uses user data to create contextual notification
 */
export const schedulePersonalizedDailyReminder = async (
  hour: number,
  minute: number,
  userData: UserNotificationData
): Promise<string | null> => {
  try {
    // Check if today is Ekadashi
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const isEkadashi = checkIfEkadashi(today);

    // Get personalized message
    const { title, body } = getPersonalizedNotificationMessage(userData, isEkadashi);

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
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

    console.log('[Notifications] Personalized daily reminder scheduled:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('[Notifications] Schedule personalized error:', error);
    return null;
  }
};

/**
 * P0 #46: Check if user has practiced today
 * @returns Promise<boolean> - true if practiced today, false otherwise
 */
export const checkIfPracticedToday = async (): Promise<boolean> => {
  try {
    const history = await loadPracticeHistory();
    const today = new Date().toDateString();

    return history.some((practice) => {
      const practiceDate = new Date(practice.timestamp).toDateString();
      return practiceDate === today;
    });
  } catch (error) {
    console.error('[Notifications] Error checking practice today:', error);
    return false; // Assume not practiced if error
  }
};

/**
 * P0 #46: Schedule streak-risk alert (6 PM reminder)
 * Sent if user has active streak but hasn't practiced today
 */
export const scheduleStreakRiskAlert = async (
  currentStreak: number
): Promise<string | null> => {
  try {
    // Only schedule if user has active streak
    if (currentStreak === 0) {
      return null;
    }

    // Check if already practiced today
    const practicedToday = await checkIfPracticedToday();
    if (practicedToday) {
      console.log('[Notifications] Already practiced today, skipping streak alert');
      return null;
    }

    // Schedule 6 PM notification for today
    const now = new Date();
    const alertTime = new Date();
    alertTime.setHours(18, 0, 0, 0); // 6 PM

    // Only schedule if 6 PM hasn't passed yet
    if (alertTime <= now) {
      console.log('[Notifications] 6 PM passed, skipping streak alert');
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Don't Forget Your Practice! 🔥",
        body: `Keep your ${currentStreak}-day streak alive! Practice before the day ends`,
        sound: true,
        priority: 'high',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIMESTAMP,
        timestamp: alertTime.getTime(),
      },
    });

    console.log('[Notifications] Streak-risk alert (6 PM) scheduled:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('[Notifications] Streak-risk alert (6 PM) error:', error);
    return null;
  }
};

/**
 * P0 #46: Schedule urgent streak-risk alert (9 PM reminder)
 * Final reminder before day ends
 */
export const scheduleUrgentStreakAlert = async (
  currentStreak: number
): Promise<string | null> => {
  try {
    // Only schedule if user has active streak
    if (currentStreak === 0) {
      return null;
    }

    // Check if already practiced today
    const practicedToday = await checkIfPracticedToday();
    if (practicedToday) {
      console.log('[Notifications] Already practiced today, skipping urgent alert');
      return null;
    }

    // Schedule 9 PM notification for today
    const now = new Date();
    const alertTime = new Date();
    alertTime.setHours(21, 0, 0, 0); // 9 PM

    // Only schedule if 9 PM hasn't passed yet
    if (alertTime <= now) {
      console.log('[Notifications] 9 PM passed, skipping urgent alert');
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Streak Alert! 🔥',
        body: `Your ${currentStreak}-day streak needs you! Practice before midnight`,
        sound: true,
        priority: 'high',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIMESTAMP,
        timestamp: alertTime.getTime(),
      },
    });

    console.log('[Notifications] Urgent streak alert (9 PM) scheduled:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('[Notifications] Urgent streak alert (9 PM) error:', error);
    return null;
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
