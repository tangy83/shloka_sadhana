/**
 * SettingsScreen Tests
 * Shloka Sadhana - Settings Configuration
 *
 * Tests for settings screen
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { SettingsScreen } from '../SettingsScreen';

import { getItem, setItem } from '@/utils/storage';
import {
  requestNotificationPermissions,
  scheduleDailyReminder,
} from '@/utils/notifications';

// Mock storage functions
jest.mock('@/utils/storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  clearAll: jest.fn(),
}));

// Mock notification functions
jest.mock('@/utils/notifications', () => ({
  requestNotificationPermissions: jest.fn(),
  scheduleDailyReminder: jest.fn(),
  cancelAllNotifications: jest.fn(),
}));

// Mock ThemeContext — SettingsScreen uses useTheme() which requires a ThemeProvider
jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    themeMode: 'dark',
    setThemeMode: jest.fn(),
  }),
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      version: '1.0.0',
    },
  },
}));

// Mock Slider component
jest.mock('@react-native-community/slider', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, react/display-name
  return (props: any) => <View {...props} />;
});

// Mock DateTimePicker component
jest.mock('@react-native-community/datetimepicker', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, react/display-name
  return (props: any) => <View {...props} />;
});

const mockGetItem = getItem as jest.MockedFunction<typeof getItem>;
const mockSetItem = setItem as jest.MockedFunction<typeof setItem>;
const mockRequestPermissions = requestNotificationPermissions as jest.MockedFunction<
  typeof requestNotificationPermissions
>;
const mockScheduleReminder = scheduleDailyReminder as jest.MockedFunction<
  typeof scheduleDailyReminder
>;

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetItem.mockResolvedValue(null);
    mockSetItem.mockResolvedValue(true);
    mockRequestPermissions.mockResolvedValue(true);
    mockScheduleReminder.mockResolvedValue('notification-id');
  });
  describe('Initial Render', () => {
    it('should render the screen', () => {
      render(<SettingsScreen />);
      expect(screen.getByText(/Settings/i)).toBeTruthy();
    });

    it('should display screen title', () => {
      render(<SettingsScreen />);
      expect(screen.getByText('Settings')).toBeTruthy();
    });
  });

  describe('Notifications Section', () => {
    it('should display notifications section title', () => {
      render(<SettingsScreen />);
      expect(screen.getByText(/Notifications/i)).toBeTruthy();
    });

    it('should display notification toggle', () => {
      const { getByTestId } = render(<SettingsScreen />);
      expect(getByTestId('notification-toggle')).toBeTruthy();
    });

    it('should display notification time picker', () => {
      render(<SettingsScreen />);
      expect(screen.getByText(/Reminder Time/i)).toBeTruthy();
    });

    it('should toggle notifications on/off', async () => {
      const { getByTestId } = render(<SettingsScreen />);
      const toggle = getByTestId('notification-toggle');

      // Initial state should be off
      expect(toggle.props.value).toBe(false);

      // Toggle on
      fireEvent(toggle, 'valueChange', true);

      // Wait for state update and permission request
      await waitFor(() => {
        expect(mockRequestPermissions).toHaveBeenCalled();
        expect(mockScheduleReminder).toHaveBeenCalledWith(7, 0);
      });
    });
  });

  describe('App Info Section', () => {
    it('should display app version', () => {
      render(<SettingsScreen />);
      expect(screen.getByText(/Version/i)).toBeTruthy();
    });

    it('should display about section', () => {
      render(<SettingsScreen />);
      expect(screen.getByText('About Shloka Sadhana')).toBeTruthy();
    });
  });

  describe('Links Section', () => {
    it('should display privacy policy link', () => {
      render(<SettingsScreen />);
      expect(screen.getByText(/Privacy Policy/i)).toBeTruthy();
    });

    it('should display terms of service link', () => {
      render(<SettingsScreen />);
      expect(screen.getByText(/Terms of Service/i)).toBeTruthy();
    });
  });

  describe('Data Management', () => {
    it('should display clear data button', () => {
      render(<SettingsScreen />);
      expect(screen.getByText(/Clear Data/i)).toBeTruthy();
    });

    it('should have accessible clear data button', () => {
      const { getByLabelText } = render(<SettingsScreen />);
      const clearButton = getByLabelText(/Clear all app data/i);
      expect(clearButton).toBeTruthy();
    });
  });

  describe('Scrollable Content', () => {
    it('should render scrollable view', () => {
      const { getByTestId } = render(<SettingsScreen />);
      expect(getByTestId('settings-scroll')).toBeTruthy();
    });
  });

  // Removed: Appearance section is hidden for now
  // describe('Appearance Section', () => { ... });

  describe('Reminder Time Configuration', () => {
    it('should display reminder time as a touchable element', () => {
      const { getByTestId } = render(<SettingsScreen />);
      const reminderTimeButton = getByTestId('reminder-time-button');
      expect(reminderTimeButton).toBeTruthy();
    });

    it('should show time picker modal when reminder time is pressed', () => {
      const { getByTestId, getByText } = render(<SettingsScreen />);
      const reminderTimeButton = getByTestId('reminder-time-button');

      fireEvent.press(reminderTimeButton);

      expect(getByText(/Set Reminder Time/i)).toBeTruthy();
    });

    it('should display current reminder time in modal', () => {
      const { getByTestId } = render(<SettingsScreen />);
      const reminderTimeButton = getByTestId('reminder-time-button');

      fireEvent.press(reminderTimeButton);

      const timePicker = getByTestId('time-picker');
      expect(timePicker).toBeTruthy();
    });

    it('should update reminder time when time is selected', async () => {
      const { getByTestId, getAllByText } = render(<SettingsScreen />);
      const reminderTimeButton = getByTestId('reminder-time-button');

      fireEvent.press(reminderTimeButton);

      // Change time to 8:30
      const timePicker = getByTestId('time-picker');
      const selectedDate = new Date(2000, 0, 1, 8, 30);
      fireEvent(timePicker, 'onChange', { type: 'set' }, selectedDate);

      // Press Save button (use getAllByText since 'Save' may appear in multiple contexts)
      const saveButtons = getAllByText(/Save/i);
      const saveButton = saveButtons[saveButtons.length - 1]; // last Save = modal Save
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockSetItem).toHaveBeenCalledWith(
          'notification_settings',
          expect.objectContaining({
            enabled: false,
            hour: 8,
            minute: 30,
          }),
        );
      });
    });

    it('should close modal when Cancel is pressed', () => {
      const { getByTestId, getByText, queryByText } = render(<SettingsScreen />);
      const reminderTimeButton = getByTestId('reminder-time-button');

      fireEvent.press(reminderTimeButton);
      expect(getByText(/Set Reminder Time/i)).toBeTruthy();

      const cancelButton = getByText(/Cancel/i);
      fireEvent.press(cancelButton);

      expect(queryByText(/Set Reminder Time/i)).toBeFalsy();
    });
  });
});
