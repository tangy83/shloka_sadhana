/**
 * Notifications Tests
 * Shloka Sadhana - Push Notifications
 *
 * Tests for notification scheduling and management
 */

import * as Notifications from 'expo-notifications';
import {
  requestNotificationPermissions,
  scheduleDailyReminder,
  cancelAllNotifications,
  getPendingNotifications,
} from '../notifications';

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
  SchedulableTriggerInputTypes: {
    CALENDAR: 'calendar',
    TIME_INTERVAL: 'timeInterval',
    DAILY: 'daily',
    WEEKLY: 'weekly',
    YEARLY: 'yearly',
    DATE: 'date',
    UNKNOWN: 'unknown',
  },
}));

const mockNotifications = Notifications as jest.Mocked<typeof Notifications>;

describe('Notifications Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestNotificationPermissions', () => {
    it('should request permissions successfully', async () => {
      mockNotifications.requestPermissionsAsync.mockResolvedValue({
        status: 'granted',
        expires: null,
        canAskAgain: true,
        granted: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const result = await requestNotificationPermissions();

      expect(result).toBe(true);
      expect(mockNotifications.requestPermissionsAsync).toHaveBeenCalled();
    });

    it('should return false when permissions denied', async () => {
      mockNotifications.requestPermissionsAsync.mockResolvedValue({
        status: 'denied',
        expires: null,
        canAskAgain: false,
        granted: false,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const result = await requestNotificationPermissions();

      expect(result).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      mockNotifications.requestPermissionsAsync.mockRejectedValue(new Error('Permission error'));

      const result = await requestNotificationPermissions();

      expect(result).toBe(false);
    });
  });

  describe('scheduleDailyReminder', () => {
    it('should schedule daily notification at specified time', async () => {
      mockNotifications.scheduleNotificationAsync.mockResolvedValue('notification-id');

      const notificationId = await scheduleDailyReminder(7, 0); // 7:00 AM

      expect(notificationId).toBe('notification-id');
      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: 'Time for Your Daily Practice 🙏',
          body: 'Begin your spiritual journey with today\'s practice',
          sound: true,
          priority: 'high',
        },
        trigger: {
          type: mockNotifications.SchedulableTriggerInputTypes.CALENDAR,
          hour: 7,
          minute: 0,
          repeats: true,
        },
      });
    });

    it('should handle different times', async () => {
      mockNotifications.scheduleNotificationAsync.mockResolvedValue('notification-id-2');

      await scheduleDailyReminder(18, 30); // 6:30 PM

      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          trigger: {
            type: mockNotifications.SchedulableTriggerInputTypes.CALENDAR,
            hour: 18,
            minute: 30,
            repeats: true,
          },
        })
      );
    });

    it('should return null on error', async () => {
      mockNotifications.scheduleNotificationAsync.mockRejectedValue(new Error('Schedule error'));

      const result = await scheduleDailyReminder(7, 0);

      expect(result).toBeNull();
    });
  });

  describe('cancelAllNotifications', () => {
    it('should cancel all scheduled notifications', async () => {
      mockNotifications.cancelAllScheduledNotificationsAsync.mockResolvedValue();

      await cancelAllNotifications();

      expect(mockNotifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      mockNotifications.cancelAllScheduledNotificationsAsync.mockRejectedValue(
        new Error('Cancel error')
      );

      await expect(cancelAllNotifications()).resolves.not.toThrow();
    });
  });

  describe('getPendingNotifications', () => {
    it('should return list of pending notifications', async () => {
      const mockNotifs = [
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { identifier: 'notif-1', content: {} as any, trigger: {} as any },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { identifier: 'notif-2', content: {} as any, trigger: {} as any },
      ];

      mockNotifications.getAllScheduledNotificationsAsync.mockResolvedValue(mockNotifs);

      const result = await getPendingNotifications();

      expect(result).toEqual(mockNotifs);
      expect(mockNotifications.getAllScheduledNotificationsAsync).toHaveBeenCalled();
    });

    it('should return empty array on error', async () => {
      mockNotifications.getAllScheduledNotificationsAsync.mockRejectedValue(
        new Error('Get error')
      );

      const result = await getPendingNotifications();

      expect(result).toEqual([]);
    });
  });
});
