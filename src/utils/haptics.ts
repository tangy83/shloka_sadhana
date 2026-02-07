/**
 * Haptics Service
 * Shloka Sadhana - Haptic Feedback
 *
 * Provides tactile feedback for user interactions
 */

import * as Haptics from 'expo-haptics';

/**
 * Trigger light impact feedback
 * Use for: Button taps, UI interactions
 */
export const triggerLight = async (): Promise<void> => {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (error) {
    console.error('[Haptics] Light impact error:', error);
  }
};

/**
 * Trigger medium impact feedback
 * Use for: Mala counter increments, significant actions
 */
export const triggerMedium = async (): Promise<void> => {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch (error) {
    console.error('[Haptics] Medium impact error:', error);
  }
};

/**
 * Trigger heavy impact feedback
 * Use for: Completing a mala round (108 counts), major milestones
 */
export const triggerHeavy = async (): Promise<void> => {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch (error) {
    console.error('[Haptics] Heavy impact error:', error);
  }
};

/**
 * Trigger success notification feedback
 * Use for: Completing practice, saving sankalp, achieving streak
 */
export const triggerSuccess = async (): Promise<void> => {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (error) {
    console.error('[Haptics] Success notification error:', error);
  }
};

/**
 * Trigger warning notification feedback
 * Use for: Non-critical alerts, reminders
 */
export const triggerWarning = async (): Promise<void> => {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch (error) {
    console.error('[Haptics] Warning notification error:', error);
  }
};

/**
 * Trigger error notification feedback
 * Use for: Errors, failed actions
 */
export const triggerError = async (): Promise<void> => {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch (error) {
    console.error('[Haptics] Error notification error:', error);
  }
};

/**
 * Trigger selection feedback
 * Use for: Picker changes, tab switches, selection changes
 */
export const triggerSelection = async (): Promise<void> => {
  try {
    await Haptics.selectionAsync();
  } catch (error) {
    console.error('[Haptics] Selection error:', error);
  }
};
