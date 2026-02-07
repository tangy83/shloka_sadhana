/**
 * Error Logger Utility
 * Shloka Sadhana - Centralized error logging and handling
 *
 * Provides consistent error logging across the app
 * Integrates with Sentry for production error tracking
 */

import { logError, logMessage, addBreadcrumb } from './sentry';
import { AppError } from '@/types';

/**
 * Error categories for better organization
 */
export enum ErrorCategory {
  STORAGE = 'storage',
  NETWORK = 'network',
  NAVIGATION = 'navigation',
  PRACTICE = 'practice',
  NOTIFICATION = 'notification',
  AUDIO = 'audio',
  CALENDAR = 'calendar',
  UI = 'ui',
  UNKNOWN = 'unknown',
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low', // Minor issues, non-blocking
  MEDIUM = 'medium', // Issues that affect UX but not critical
  HIGH = 'high', // Critical issues that break core functionality
  FATAL = 'fatal', // App-breaking issues
}

/**
 * Create standardized AppError object
 */
export const createAppError = (
  message: string,
  code?: string,
  _originalError?: Error // Prefixed with _ to indicate intentionally unused
): AppError => {
  return {
    message,
    code,
    timestamp: Date.now(),
  };
};

/**
 * Log error with context
 */
export const logAppError = (
  error: Error | AppError | string,
  category: ErrorCategory = ErrorCategory.UNKNOWN,
  severity: ErrorSeverity = ErrorSeverity.MEDIUM,
  additionalContext?: Record<string, unknown>
): void => {
  // Convert string to Error if needed
  const errorObj = typeof error === 'string' ? new Error(error) : error;

  // Log to console in development
  if (__DEV__) {
    console.error(`[${category}] ${severity.toUpperCase()}:`, errorObj, additionalContext);
  }

  // Map severity to Sentry level
  const sentryLevel = mapSeverityToSentryLevel(severity);

  // Log to Sentry in production
  if (errorObj instanceof Error) {
    logError(errorObj, {
      level: sentryLevel,
      tags: {
        category,
        severity,
      },
      extra: {
        ...additionalContext,
        timestamp: Date.now(),
      },
    });
  } else {
    // If it's an AppError object
    logMessage(errorObj.message || 'Unknown error', sentryLevel, {
      category,
      severity,
      errorCode: (errorObj as AppError).code,
      ...additionalContext,
    });
  }

  // Add breadcrumb for tracking user journey
  addBreadcrumb(
    errorObj instanceof Error ? errorObj.message : errorObj.message || 'Error occurred',
    category,
    sentryLevel,
    additionalContext
  );
};

/**
 * Log storage-related errors
 */
export const logStorageError = (
  error: Error,
  operation: 'read' | 'write' | 'delete' | 'clear',
  key?: string
): void => {
  logAppError(
    error,
    ErrorCategory.STORAGE,
    ErrorSeverity.HIGH,
    {
      operation,
      key,
    }
  );
};

/**
 * Log network-related errors
 */
export const logNetworkError = (
  error: Error,
  endpoint?: string,
  method?: string
): void => {
  logAppError(
    error,
    ErrorCategory.NETWORK,
    ErrorSeverity.MEDIUM,
    {
      endpoint,
      method,
    }
  );
};

/**
 * Log navigation errors
 */
export const logNavigationError = (
  error: Error,
  screen?: string,
  params?: unknown
): void => {
  logAppError(
    error,
    ErrorCategory.NAVIGATION,
    ErrorSeverity.MEDIUM,
    {
      screen,
      params,
    }
  );
};

/**
 * Log practice session errors
 */
export const logPracticeError = (
  error: Error,
  context: {
    sessionId?: string;
    shlokaId?: string;
    duration?: number;
  }
): void => {
  logAppError(
    error,
    ErrorCategory.PRACTICE,
    ErrorSeverity.HIGH,
    context
  );
};

/**
 * Log notification errors
 */
export const logNotificationError = (
  error: Error,
  action: 'schedule' | 'cancel' | 'permission'
): void => {
  logAppError(
    error,
    ErrorCategory.NOTIFICATION,
    ErrorSeverity.LOW,
    {
      action,
    }
  );
};

/**
 * Log audio playback errors
 */
export const logAudioError = (
  error: Error,
  audioUrl?: string
): void => {
  logAppError(
    error,
    ErrorCategory.AUDIO,
    ErrorSeverity.MEDIUM,
    {
      audioUrl,
    }
  );
};

/**
 * Map app severity to Sentry severity level
 */
const mapSeverityToSentryLevel = (
  severity: ErrorSeverity
): 'fatal' | 'error' | 'warning' | 'info' => {
  switch (severity) {
    case ErrorSeverity.FATAL:
      return 'fatal';
    case ErrorSeverity.HIGH:
      return 'error';
    case ErrorSeverity.MEDIUM:
      return 'warning';
    case ErrorSeverity.LOW:
      return 'info';
    default:
      return 'error';
  }
};

/**
 * Handle async errors with try-catch wrapper
 * Usage: const result = await handleAsync(() => someAsyncFunction())
 */
export const handleAsync = async <T>(
  fn: () => Promise<T>,
  category: ErrorCategory = ErrorCategory.UNKNOWN,
  severity: ErrorSeverity = ErrorSeverity.MEDIUM
): Promise<{ data: T | null; error: Error | null }> => {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logAppError(err, category, severity);
    return { data: null, error: err };
  }
};

/**
 * Assert condition and log error if false
 */
export const assert = (
  condition: boolean,
  message: string,
  category: ErrorCategory = ErrorCategory.UNKNOWN
): void => {
  if (!condition) {
    const error = new Error(`Assertion failed: ${message}`);
    logAppError(error, category, ErrorSeverity.HIGH);
    throw error;
  }
};

/**
 * Log warning (non-error issues)
 */
export const logWarning = (
  message: string,
  category: ErrorCategory = ErrorCategory.UNKNOWN,
  context?: Record<string, unknown>
): void => {
  if (__DEV__) {
    console.warn(`[${category}] WARNING:`, message, context);
  }

  logMessage(message, 'warning', {
    category,
    ...context,
  });
};

/**
 * Log info message
 */
export const logInfo = (
  message: string,
  category: ErrorCategory = ErrorCategory.UNKNOWN,
  context?: Record<string, unknown>
): void => {
  if (__DEV__) {
    console.log(`[${category}] INFO:`, message, context);
  }

  logMessage(message, 'info', {
    category,
    ...context,
  });
};
