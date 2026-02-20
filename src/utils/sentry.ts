/**
 * Sentry stub — replaced with console-only logging for Expo Go compatibility.
 * All functions are no-ops in production; console output in development.
 */

type SeverityLevel = 'fatal' | 'error' | 'warning' | 'info' | 'debug';

export const initSentry = (): void => {};

export const logError = (
  error: Error,
  context?: {
    level?: SeverityLevel;
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
  }
): void => {
  console.error('[Error]', error.message, context);
};

export const logMessage = (
  message: string,
  level: SeverityLevel = 'info',
  extra?: Record<string, unknown>
): void => {
  console.log(`[${level}]`, message, extra);
};

export const setUserContext = (_userId: string, _email?: string): void => {};
export const clearUserContext = (): void => {};

export const addBreadcrumb = (
  message: string,
  category: string,
  _level: SeverityLevel = 'info',
  data?: Record<string, unknown>
): void => {
  console.log(`[Breadcrumb] ${category}: ${message}`, data);
};

export const setTag = (_key: string, _value: string): void => {};
export const setContext = (_key: string, _context: Record<string, unknown>): void => {};

// No-op Sentry export so any remaining references compile
export const Sentry = {
  Native: {
    captureException: (_e: unknown) => {},
    captureMessage: (_m: unknown) => {},
    setUser: (_u: unknown) => {},
    addBreadcrumb: (_b: unknown) => {},
    setTag: (_k: unknown, _v: unknown) => {},
    setContext: (_k: unknown, _c: unknown) => {},
  },
};
