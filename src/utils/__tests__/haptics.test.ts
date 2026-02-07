/**
 * Haptics Tests
 * Shloka Sadhana - Haptic Feedback
 *
 * Tests for haptic feedback functionality
 */

import * as Haptics from 'expo-haptics';
import {
  triggerLight,
  triggerMedium,
  triggerHeavy,
  triggerSuccess,
  triggerWarning,
  triggerError,
  triggerSelection,
} from '../haptics';

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
}));

const mockHaptics = Haptics as jest.Mocked<typeof Haptics>;

describe('Haptics Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Impact Feedback', () => {
    it('should trigger light impact', async () => {
      mockHaptics.impactAsync.mockResolvedValue();

      await triggerLight();

      expect(mockHaptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Light
      );
    });

    it('should trigger medium impact', async () => {
      mockHaptics.impactAsync.mockResolvedValue();

      await triggerMedium();

      expect(mockHaptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Medium
      );
    });

    it('should trigger heavy impact', async () => {
      mockHaptics.impactAsync.mockResolvedValue();

      await triggerHeavy();

      expect(mockHaptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Heavy
      );
    });

    it('should handle impact errors gracefully', async () => {
      mockHaptics.impactAsync.mockRejectedValue(new Error('Haptics error'));

      await expect(triggerLight()).resolves.not.toThrow();
    });
  });

  describe('Notification Feedback', () => {
    it('should trigger success notification', async () => {
      mockHaptics.notificationAsync.mockResolvedValue();

      await triggerSuccess();

      expect(mockHaptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Success
      );
    });

    it('should trigger warning notification', async () => {
      mockHaptics.notificationAsync.mockResolvedValue();

      await triggerWarning();

      expect(mockHaptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Warning
      );
    });

    it('should trigger error notification', async () => {
      mockHaptics.notificationAsync.mockResolvedValue();

      await triggerError();

      expect(mockHaptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Error
      );
    });

    it('should handle notification errors gracefully', async () => {
      mockHaptics.notificationAsync.mockRejectedValue(new Error('Haptics error'));

      await expect(triggerSuccess()).resolves.not.toThrow();
    });
  });

  describe('Selection Feedback', () => {
    it('should trigger selection feedback', async () => {
      mockHaptics.selectionAsync.mockResolvedValue();

      await triggerSelection();

      expect(mockHaptics.selectionAsync).toHaveBeenCalled();
    });

    it('should handle selection errors gracefully', async () => {
      mockHaptics.selectionAsync.mockRejectedValue(new Error('Haptics error'));

      await expect(triggerSelection()).resolves.not.toThrow();
    });
  });
});
