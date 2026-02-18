/**
 * Settings Store Tests
 * Tests for notification settings, theme, font size, and persistence
 */

import { useSettingsStore } from '@/stores/useSettingsStore';

jest.mock('@/utils/notifications', () => ({
  scheduleNotification: jest.fn(() => Promise.resolve()),
  cancelAllNotifications: jest.fn(() => Promise.resolve()),
}));
jest.mock('@/services/firestore', () => ({
  firestoreService: {
    saveSettingsData: jest.fn(() => Promise.resolve()),
    loadSettingsData: jest.fn(() => Promise.resolve(null)),
  },
}));
jest.mock('@/services/auth', () => ({
  authService: {
    getCurrentUser: jest.fn(() => null),
    isSignedIn: jest.fn(() => false),
  },
}));
jest.mock('@/utils/storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

import { scheduleNotification, cancelAllNotifications } from '@/utils/notifications';
const mockScheduleNotification = scheduleNotification as jest.MockedFunction<typeof scheduleNotification>;
const mockCancelAll = cancelAllNotifications as jest.MockedFunction<typeof cancelAllNotifications>;

function resetSettingsStore() {
  useSettingsStore.setState({
    notificationsEnabled: false,
    notificationTime: '07:00',
    hapticsEnabled: true,
    soundEnabled: true,
    theme: 'dark',
    fontSize: 'medium',
  });
}

describe('useSettingsStore — Notifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetSettingsStore();
  });

  it('should enable notifications and schedule them', async () => {
    await useSettingsStore.getState().setNotificationsEnabled(true);

    expect(useSettingsStore.getState().notificationsEnabled).toBe(true);
    expect(mockScheduleNotification).toHaveBeenCalledWith('07:00');
  });

  it('should disable notifications and cancel them', async () => {
    useSettingsStore.setState({ notificationsEnabled: true });

    await useSettingsStore.getState().setNotificationsEnabled(false);

    expect(useSettingsStore.getState().notificationsEnabled).toBe(false);
    expect(mockCancelAll).toHaveBeenCalled();
  });

  it('should update notification time', async () => {
    useSettingsStore.setState({ notificationsEnabled: true });

    await useSettingsStore.getState().setNotificationTime('08:30');

    expect(useSettingsStore.getState().notificationTime).toBe('08:30');
  });

  it('should reschedule notification when time is updated and notifications are enabled', async () => {
    useSettingsStore.setState({ notificationsEnabled: true });

    await useSettingsStore.getState().setNotificationTime('09:00');

    expect(mockScheduleNotification).toHaveBeenCalledWith('09:00');
  });

  it('should NOT reschedule notification when notifications are disabled', async () => {
    useSettingsStore.setState({ notificationsEnabled: false });

    await useSettingsStore.getState().setNotificationTime('09:00');

    expect(mockScheduleNotification).not.toHaveBeenCalled();
  });
});

describe('useSettingsStore — Theme', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetSettingsStore();
  });

  it('should default to dark theme', () => {
    expect(useSettingsStore.getState().theme).toBe('dark');
  });

  it('should update theme to light', async () => {
    await useSettingsStore.getState().setTheme('light');
    expect(useSettingsStore.getState().theme).toBe('light');
  });

  it('should update theme to system', async () => {
    await useSettingsStore.getState().setTheme('system');
    expect(useSettingsStore.getState().theme).toBe('system');
  });
});

describe('useSettingsStore — Font Size', () => {
  beforeEach(() => {
    resetSettingsStore();
  });

  it('should default to medium font size', () => {
    expect(useSettingsStore.getState().fontSize).toBe('medium');
  });

  it('should update font size to large', async () => {
    await useSettingsStore.getState().setFontSize('large');
    expect(useSettingsStore.getState().fontSize).toBe('large');
  });

  it('should update font size to small', async () => {
    await useSettingsStore.getState().setFontSize('small');
    expect(useSettingsStore.getState().fontSize).toBe('small');
  });
});

describe('useSettingsStore — Audio and Haptics', () => {
  beforeEach(() => {
    resetSettingsStore();
  });

  it('should default with haptics enabled', () => {
    expect(useSettingsStore.getState().hapticsEnabled).toBe(true);
  });

  it('should disable haptics', async () => {
    await useSettingsStore.getState().setHapticsEnabled(false);
    expect(useSettingsStore.getState().hapticsEnabled).toBe(false);
  });

  it('should default with sound enabled', () => {
    expect(useSettingsStore.getState().soundEnabled).toBe(true);
  });

  it('should disable sound', async () => {
    await useSettingsStore.getState().setSoundEnabled(false);
    expect(useSettingsStore.getState().soundEnabled).toBe(false);
  });
});

describe('useSettingsStore — resetSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetSettingsStore();
  });

  it('should reset all settings to defaults', async () => {
    // Change everything from defaults
    useSettingsStore.setState({
      notificationsEnabled: true,
      notificationTime: '20:00',
      hapticsEnabled: false,
      soundEnabled: false,
      theme: 'light',
      fontSize: 'large',
    });

    await useSettingsStore.getState().resetSettings();

    const state = useSettingsStore.getState();
    expect(state.notificationsEnabled).toBe(false);
    expect(state.notificationTime).toBe('07:00');
    expect(state.hapticsEnabled).toBe(true);
    expect(state.soundEnabled).toBe(true);
    expect(state.theme).toBe('dark');
    expect(state.fontSize).toBe('medium');
  });
});
