/**
 * PrimaryButton Primitive Tests
 * Shloka Sadhana — Gradient CTA button
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { PrimaryButton } from '../PrimaryButton';

// Mock SacredButton — just renders children in a Pressable
jest.mock('@/components/sacred', () => ({
  SacredButton: ({
    children,
    onPress,
    disabled,
    accessibilityLabel,
    style,
  }: {
    children: React.ReactNode;
    onPress?: () => void;
    disabled?: boolean;
    accessibilityLabel?: string;
    style?: object;
  }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pressable, View } = require('react-native');
    return (
      <View style={style}>
        <Pressable
          onPress={disabled ? undefined : onPress}
          disabled={disabled}
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
        >
          {children}
        </Pressable>
      </View>
    );
  },
}));

describe('PrimaryButton', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crash', () => {
      expect(() =>
        render(<PrimaryButton label="Test" onPress={mockOnPress} />)
      ).not.toThrow();
    });

    it('should display the label text', () => {
      render(<PrimaryButton label="Start Practice" onPress={mockOnPress} />);

      expect(screen.getByText('Start Practice')).toBeTruthy();
    });
  });

  describe('Press Interaction', () => {
    it('should call onPress when button is pressed', () => {
      render(
        <PrimaryButton
          label="Begin"
          onPress={mockOnPress}
          accessibilityLabel="Begin button"
        />
      );

      fireEvent.press(screen.getByLabelText('Begin button'));

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should NOT call onPress when disabled', () => {
      render(
        <PrimaryButton
          label="Begin"
          onPress={mockOnPress}
          disabled={true}
          accessibilityLabel="Begin button"
        />
      );

      fireEvent.press(screen.getByLabelText('Begin button'));

      expect(mockOnPress).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should use label as accessibilityLabel when no explicit one is provided', () => {
      render(<PrimaryButton label="Save Settings" onPress={mockOnPress} />);

      expect(screen.getByLabelText('Save Settings')).toBeTruthy();
    });

    it('should use provided accessibilityLabel over default label', () => {
      render(
        <PrimaryButton
          label="Save"
          onPress={mockOnPress}
          accessibilityLabel="Save all settings"
        />
      );

      expect(screen.getByLabelText('Save all settings')).toBeTruthy();
    });
  });

  describe('Disabled State', () => {
    it('should render label text even when disabled', () => {
      render(<PrimaryButton label="Unavailable" onPress={mockOnPress} disabled />);

      expect(screen.getByText('Unavailable')).toBeTruthy();
    });
  });
});
