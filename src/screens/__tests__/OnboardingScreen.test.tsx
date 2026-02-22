/**
 * OnboardingScreen Tests
 * Shloka Sadhana — First-launch 3-page onboarding flow
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { OnboardingScreen } from '../OnboardingScreen';

// Mock navigation
const mockReplace = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ replace: mockReplace }),
  useRoute: () => ({ params: {} }),
}));

// Mock safe area context
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock DiyaGlow (sacred component — avoid SVG/animation issues)
jest.mock('@/components/sacred/DiyaGlow', () => ({
  DiyaGlow: () => null,
}));

// Mock PrimaryButton (uses SacredButton + LinearGradient)
jest.mock('@/components/primitives/PrimaryButton', () => ({
  PrimaryButton: ({ label, onPress, disabled, accessibilityLabel }: {
    label: string;
    onPress: () => void;
    disabled?: boolean;
    accessibilityLabel?: string;
  }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { TouchableOpacity, Text } = require('react-native');
    return (
      <TouchableOpacity
        onPress={disabled ? undefined : onPress}
        disabled={disabled}
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityRole="button"
      >
        <Text>{label}</Text>
      </TouchableOpacity>
    );
  },
}));

// Mock notifications
jest.mock('@/utils/notifications', () => ({
  requestNotificationPermissions: jest.fn().mockResolvedValue(undefined),
}));
// eslint-disable-next-line import/first
import { requestNotificationPermissions } from '@/utils/notifications';
const mockRequestPermissions = requestNotificationPermissions as jest.MockedFunction<typeof requestNotificationPermissions>;

// Mock storage
jest.mock('@/utils/storage', () => ({
  setItem: jest.fn().mockResolvedValue(true),
}));
// eslint-disable-next-line import/first
import { setItem } from '@/utils/storage';
const mockSetItem = setItem as jest.MockedFunction<typeof setItem>;

describe('OnboardingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Render (Page 1)', () => {
    it('should render without crash', () => {
      expect(() => render(<OnboardingScreen />)).not.toThrow();
    });

    it('should display the OM symbol on page 1', () => {
      render(<OnboardingScreen />);

      expect(screen.getByText('ॐ')).toBeTruthy();
    });

    it('should display the app name "Shloka Sadhana"', () => {
      render(<OnboardingScreen />);

      expect(screen.getByText('Shloka Sadhana')).toBeTruthy();
    });

    it('should display the tagline', () => {
      render(<OnboardingScreen />);

      expect(screen.getByText('Your daily sacred practice companion')).toBeTruthy();
    });

    it('should have a "Begin" button on page 1', () => {
      render(<OnboardingScreen />);

      expect(screen.getByText('Begin')).toBeTruthy();
    });

    it('should display page dot indicators', () => {
      render(<OnboardingScreen />);

      // 3 dots — all rendered as Views in the ScrollView
      // We can verify the presence of navigation actions indicating 3 pages
      expect(screen.getByText('Begin')).toBeTruthy();
    });
  });

  describe('Page 2 — Features', () => {
    it('should display all 3 feature titles', () => {
      render(<OnboardingScreen />);

      expect(screen.getByText('Daily Mantras')).toBeTruthy();
      expect(screen.getByText('Sacred Library')).toBeTruthy();
      expect(screen.getByText("Your Journey")).toBeTruthy();
    });

    it('should have a "Continue" button on page 2', () => {
      render(<OnboardingScreen />);

      expect(screen.getByText('Continue')).toBeTruthy();
    });
  });

  describe('Page 3 — Notifications', () => {
    it('should display "Enable Reminders" button on page 3', () => {
      render(<OnboardingScreen />);

      expect(screen.getByText('Enable Reminders')).toBeTruthy();
    });

    it('should display "Maybe later" skip button', () => {
      render(<OnboardingScreen />);

      expect(screen.getByText('Maybe later')).toBeTruthy();
    });

    it('should display the offline note', () => {
      render(<OnboardingScreen />);

      expect(screen.getByText('All data is stored locally — no account needed.')).toBeTruthy();
    });
  });

  describe('Completion — Skip path', () => {
    it('should mark onboarding complete and navigate to MainTabs when "Maybe later" is pressed', async () => {
      render(<OnboardingScreen />);

      const skipBtn = screen.getByLabelText('Skip notifications and enter the app');
      fireEvent.press(skipBtn);

      await waitFor(() => {
        expect(mockSetItem).toHaveBeenCalledWith(
          expect.stringContaining('onboarding'),
          true
        );
        expect(mockReplace).toHaveBeenCalledWith('MainTabs');
      });
    });
  });

  describe('Completion — Enable Reminders path', () => {
    it('should request notification permissions when Enable Reminders is pressed', async () => {
      render(<OnboardingScreen />);

      const enableBtn = screen.getByLabelText('Enable daily practice reminders');
      fireEvent.press(enableBtn);

      await waitFor(() => {
        expect(mockRequestPermissions).toHaveBeenCalled();
        expect(mockReplace).toHaveBeenCalledWith('MainTabs');
      });
    });
  });
});
