/**
 * Sentry Configuration
 * Shloka Sadhana - Production Error Tracking & Monitoring
 *
 * Initializes Sentry for crash reporting and performance monitoring
 * Only enabled in production builds
 */

import * as Sentry from 'sentry-expo';
import Constants from 'expo-constants';

// Type aliases for Sentry types
type SeverityLevel = 'fatal' | 'error' | 'warning' | 'info' | 'debug';

/**
 * Initialize Sentry for error tracking
 * Call this in App.tsx before rendering the app
 */
export const initSentry = (): void => {
  // Only initialize Sentry in production
  if (__DEV__) {
    console.log('[Sentry] Development mode - Sentry disabled');
    return;
  }

  // Get Sentry DSN from environment variables or Expo config
  const sentryDsn = Constants.expoConfig?.extra?.sentryDsn || process.env.SENTRY_DSN;

  if (!sentryDsn) {
    console.warn('[Sentry] No DSN found - Sentry disabled');
    return;
  }

  Sentry.init({
    dsn: sentryDsn,
    enableInExpoDevelopment: false, // Disable in Expo Go
    debug: false, // Set to true for debugging Sentry itself

    // Environment configuration
    environment: __DEV__ ? 'development' : 'production',

    // Release tracking (useful for correlating errors with versions)
    release: `${Constants.expoConfig?.slug}@${Constants.expoConfig?.version}`,
    dist: Constants.expoConfig?.version,

    // Performance monitoring (optional - can be enabled later)
    tracesSampleRate: 0.2, // Sample 20% of transactions for performance monitoring

    // Enable native crash reporting
    enableNative: true,
    enableNativeCrashHandling: true,
    enableNativeNagger: false, // Disable nag messages
  });

  console.log('[Sentry] Initialized successfully');
};

/**
 * Log error to Sentry with additional context
 */
export const logError = (
  error: Error,
  context?: {
    level?: SeverityLevel;
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
  }
): void => {
  if (__DEV__) {
    console.error('[Error]', error, context);
    return;
  }

  Sentry.Native.captureException(error, {
    level: context?.level || 'error',
    tags: context?.tags,
    extra: context?.extra,
  });
};

/**
 * Log message to Sentry (for non-error events)
 */
export const logMessage = (
  message: string,
  level: SeverityLevel = 'info',
  extra?: Record<string, unknown>
): void => {
  if (__DEV__) {
    console.log(`[${level}]`, message, extra);
    return;
  }

  Sentry.Native.captureMessage(message, {
    level,
    extra,
  });
};

/**
 * Set user context for error tracking
 * This helps identify which users are experiencing issues
 * Note: For guest-first app, we use anonymous IDs
 */
export const setUserContext = (userId: string, email?: string): void => {
  if (__DEV__) {
    return;
  }

  Sentry.Native.setUser({
    id: userId,
    email,
  });
};

/**
 * Clear user context (on logout or app reset)
 */
export const clearUserContext = (): void => {
  if (__DEV__) {
    return;
  }

  Sentry.Native.setUser(null);
};

/**
 * Add breadcrumb for debugging
 * Breadcrumbs help understand the user journey before an error
 */
export const addBreadcrumb = (
  message: string,
  category: string,
  level: SeverityLevel = 'info',
  data?: Record<string, unknown>
): void => {
  if (__DEV__) {
    console.log(`[Breadcrumb] ${category}: ${message}`, data);
    return;
  }

  Sentry.Native.addBreadcrumb({
    message,
    category,
    level,
    data,
  });
};

/**
 * Set custom tag for filtering errors
 */
export const setTag = (key: string, value: string): void => {
  if (__DEV__) {
    return;
  }

  Sentry.Native.setTag(key, value);
};

/**
 * Set custom context for additional debugging info
 */
export const setContext = (key: string, context: Record<string, unknown>): void => {
  if (__DEV__) {
    return;
  }

  Sentry.Native.setContext(key, context);
};

// Export Sentry instance for advanced usage
export { Sentry };
