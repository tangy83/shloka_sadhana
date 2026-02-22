/**
 * errorLogger Utility Tests
 * Shloka Sadhana — Centralized error logging and handling
 */

import {
  ErrorCategory,
  ErrorSeverity,
  createAppError,
  logAppError,
  logStorageError,
  logNetworkError,
  logNavigationError,
  logPracticeError,
  logNotificationError,
  logAudioError,
  handleAsync,
  assert,
  logWarning,
  logInfo,
} from '../errorLogger';

// Mock Sentry stub so it doesn't produce noise
jest.mock('../sentry', () => ({
  logError: jest.fn(),
  logMessage: jest.fn(),
  addBreadcrumb: jest.fn(),
}));

// Ensure __DEV__ is true so console calls are executed
(global as { __DEV__?: boolean }).__DEV__ = true;

describe('ErrorCategory', () => {
  it('should define STORAGE category', () => {
    expect(ErrorCategory.STORAGE).toBe('storage');
  });

  it('should define NETWORK category', () => {
    expect(ErrorCategory.NETWORK).toBe('network');
  });

  it('should define NAVIGATION category', () => {
    expect(ErrorCategory.NAVIGATION).toBe('navigation');
  });

  it('should define PRACTICE category', () => {
    expect(ErrorCategory.PRACTICE).toBe('practice');
  });

  it('should define NOTIFICATION category', () => {
    expect(ErrorCategory.NOTIFICATION).toBe('notification');
  });

  it('should define AUDIO category', () => {
    expect(ErrorCategory.AUDIO).toBe('audio');
  });

  it('should define UNKNOWN category', () => {
    expect(ErrorCategory.UNKNOWN).toBe('unknown');
  });
});

describe('ErrorSeverity', () => {
  it('should define LOW severity', () => {
    expect(ErrorSeverity.LOW).toBe('low');
  });

  it('should define MEDIUM severity', () => {
    expect(ErrorSeverity.MEDIUM).toBe('medium');
  });

  it('should define HIGH severity', () => {
    expect(ErrorSeverity.HIGH).toBe('high');
  });

  it('should define FATAL severity', () => {
    expect(ErrorSeverity.FATAL).toBe('fatal');
  });
});

describe('createAppError', () => {
  it('should return an object with message, code, and timestamp', () => {
    const err = createAppError('Something failed', 'ERR_001');

    expect(err.message).toBe('Something failed');
    expect(err.code).toBe('ERR_001');
    expect(typeof err.timestamp).toBe('number');
    expect(err.timestamp).toBeGreaterThan(0);
  });

  it('should work without an optional code', () => {
    const err = createAppError('No code');

    expect(err.message).toBe('No code');
    expect(err.code).toBeUndefined();
  });

  it('should produce a recent timestamp', () => {
    const before = Date.now();
    const err = createAppError('ts test');
    const after = Date.now();

    expect(err.timestamp).toBeGreaterThanOrEqual(before);
    expect(err.timestamp).toBeLessThanOrEqual(after);
  });
});

describe('logAppError', () => {
  it('should call console.error in development', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    logAppError(new Error('test error'));

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('should handle string error input', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => logAppError('simple string error')).not.toThrow();

    spy.mockRestore();
  });

  it('should handle AppError object input', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const appErr = createAppError('App error', 'APP_ERR');

    expect(() => logAppError(appErr)).not.toThrow();

    spy.mockRestore();
  });
});

describe('logStorageError', () => {
  it('should log with STORAGE category', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    logStorageError(new Error('read fail'), 'read', 'some_key');

    // Verify console.error was called (category appears in message)
    expect(spy).toHaveBeenCalled();
    const args = spy.mock.calls[0];
    expect(args[0]).toContain(ErrorCategory.STORAGE);

    spy.mockRestore();
  });
});

describe('logNetworkError', () => {
  it('should log with NETWORK category', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    logNetworkError(new Error('network fail'), '/api/data', 'GET');

    expect(spy).toHaveBeenCalled();
    const args = spy.mock.calls[0];
    expect(args[0]).toContain(ErrorCategory.NETWORK);

    spy.mockRestore();
  });
});

describe('logNavigationError', () => {
  it('should log without throwing', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() =>
      logNavigationError(new Error('nav fail'), 'HomeScreen')
    ).not.toThrow();

    spy.mockRestore();
  });
});

describe('logPracticeError', () => {
  it('should log with PRACTICE category', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    logPracticeError(new Error('practice fail'), { sessionId: '123' });

    expect(spy).toHaveBeenCalled();
    const args = spy.mock.calls[0];
    expect(args[0]).toContain(ErrorCategory.PRACTICE);

    spy.mockRestore();
  });
});

describe('logNotificationError', () => {
  it('should log without throwing', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() =>
      logNotificationError(new Error('notif fail'), 'schedule')
    ).not.toThrow();

    spy.mockRestore();
  });
});

describe('logAudioError', () => {
  it('should log without throwing', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() =>
      logAudioError(new Error('audio fail'), 'https://example.com/audio.mp3')
    ).not.toThrow();

    spy.mockRestore();
  });
});

describe('handleAsync', () => {
  it('should return { data, error: null } on success', async () => {
    const result = await handleAsync(() => Promise.resolve(42));

    expect(result.data).toBe(42);
    expect(result.error).toBeNull();
  });

  it('should return { data: null, error } on thrown error', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const thrownError = new Error('async fail');

    const result = await handleAsync(() => Promise.reject(thrownError));

    expect(result.data).toBeNull();
    expect(result.error).toBeTruthy();
    expect(result.error?.message).toBe('async fail');

    spy.mockRestore();
  });

  it('should convert non-Error throws to Error', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const result = await handleAsync(() => Promise.reject('string error'));

    expect(result.error).toBeInstanceOf(Error);

    spy.mockRestore();
  });
});

describe('assert', () => {
  it('should not throw when condition is true', () => {
    expect(() => assert(true, 'should pass')).not.toThrow();
  });

  it('should throw when condition is false', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => assert(false, 'failed assertion')).toThrow(/Assertion failed/);

    spy.mockRestore();
  });

  it('should include message in thrown error', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => assert(false, 'custom message')).toThrow('custom message');

    spy.mockRestore();
  });
});

describe('logWarning', () => {
  it('should call console.warn', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    logWarning('test warning');

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('logInfo', () => {
  it('should call console.log', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});

    logInfo('test info');

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
