/**
 * Analytics Service
 * Shloka Sadhana - Firebase Analytics
 *
 * Centralized analytics tracking service using Firebase Analytics
 */

import analytics from '@react-native-firebase/analytics';

/**
 * Analytics Service
 *
 * Wrapper around Firebase Analytics for centralized event tracking
 *
 * @example
 * ```typescript
 * import { analyticsService } from '@/services/analytics';
 *
 * // Track an event
 * analyticsService.trackEvent('practice_started', {
 *   shloka_id: 'gayatri',
 *   has_sankalp: true
 * });
 *
 * // Track screen view
 * analyticsService.trackScreen('Practice');
 * ```
 */
class AnalyticsService {
  /**
   * Track a custom event
   *
   * @param eventName - Name of the event to track
   * @param properties - Optional event properties/parameters
   */
  async trackEvent(eventName: string, properties?: Record<string, any>) {
    try {
      await analytics().logEvent(eventName, properties);

      if (__DEV__) {
        console.log(`[Analytics] Event: ${eventName}`, properties);
      }
    } catch (error) {
      console.error('[Analytics] Error tracking event:', error);
    }
  }

  /**
   * Track a screen view
   *
   * Automatically tracked by React Navigation, but can be called manually
   *
   * @param screenName - Name of the screen being viewed
   * @param screenClass - Optional class name of the screen
   */
  async trackScreen(screenName: string, screenClass?: string) {
    try {
      await analytics().logScreenView({
        screen_name: screenName,
        screen_class: screenClass || screenName,
      });

      if (__DEV__) {
        console.log(`[Analytics] Screen: ${screenName}`);
      }
    } catch (error) {
      console.error('[Analytics] Error tracking screen:', error);
    }
  }

  /**
   * Set user property
   *
   * Used for segmentation and analysis
   *
   * @param name - Property name
   * @param value - Property value
   */
  async setUserProperty(name: string, value: string) {
    try {
      await analytics().setUserProperty(name, value);

      if (__DEV__) {
        console.log(`[Analytics] User Property: ${name} = ${value}`);
      }
    } catch (error) {
      console.error('[Analytics] Error setting user property:', error);
    }
  }

  /**
   * Set user ID
   *
   * @param userId - Unique user identifier
   */
  async setUserId(userId: string | null) {
    try {
      await analytics().setUserId(userId);

      if (__DEV__) {
        console.log(`[Analytics] User ID: ${userId}`);
      }
    } catch (error) {
      console.error('[Analytics] Error setting user ID:', error);
    }
  }

  /**
   * Enable/disable analytics collection
   *
   * @param enabled - Whether analytics should be enabled
   */
  async setAnalyticsEnabled(enabled: boolean) {
    try {
      await analytics().setAnalyticsCollectionEnabled(enabled);

      if (__DEV__) {
        console.log(`[Analytics] Collection ${enabled ? 'enabled' : 'disabled'}`);
      }
    } catch (error) {
      console.error('[Analytics] Error setting analytics enabled:', error);
    }
  }

  /**
   * Reset analytics data (for logout/data clearing)
   */
  async resetAnalytics() {
    try {
      await analytics().resetAnalyticsData();

      if (__DEV__) {
        console.log('[Analytics] Analytics data reset');
      }
    } catch (error) {
      console.error('[Analytics] Error resetting analytics:', error);
    }
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
