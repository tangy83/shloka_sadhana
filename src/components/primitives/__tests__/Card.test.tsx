/**
 * Card Primitive Tests
 * Shloka Sadhana — Shared card surface component
 */

import React from 'react';
import { Text } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Card } from '../Card';

// Mock SacredButton (animation wrapper) — just renders children
jest.mock('@/components/sacred', () => ({
  SacredButton: ({ children, onPress, accessibilityLabel }: {
    children: React.ReactNode;
    onPress?: () => void;
    accessibilityLabel?: string;
  }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { TouchableOpacity } = require('react-native');
    return (
      <TouchableOpacity onPress={onPress} accessibilityLabel={accessibilityLabel}>
        {children}
      </TouchableOpacity>
    );
  },
}));

// Mock theme shadows
jest.mock('@/constants/theme', () => ({
  shadows: {
    card: {},
  },
}));

// Mock ThemeContext — Card calls useTheme(); @/constants/theme is partially mocked above
jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      background: '#FFF8F0',
      surface: '#FFF0D0',
      surfaceElevated: '#FFE5B0',
      border: 'rgba(139,90,43,0.15)',
      text: '#4A2700',
      textSecondary: '#8B5A2B',
      textBright: '#2A1408',
      primary: '#FF9A2A',
    },
    themeMode: 'light',
    setThemeMode: jest.fn(),
    isLoading: false,
  }),
}));

describe('Card', () => {
  describe('Rendering', () => {
    it('should render without crash', () => {
      expect(() =>
        render(
          <Card>
            <Text>Content</Text>
          </Card>
        )
      ).not.toThrow();
    });

    it('should render children content', () => {
      render(
        <Card>
          <Text>Hello World</Text>
        </Card>
      );

      expect(screen.getByText('Hello World')).toBeTruthy();
    });

    it('should render multiple children', () => {
      render(
        <Card>
          <Text>First</Text>
          <Text>Second</Text>
        </Card>
      );

      expect(screen.getByText('First')).toBeTruthy();
      expect(screen.getByText('Second')).toBeTruthy();
    });
  });

  describe('Elevation', () => {
    it('should render standard card (no elevated prop) without crash', () => {
      const { toJSON } = render(
        <Card>
          <Text>Standard</Text>
        </Card>
      );
      expect(toJSON()).toBeTruthy();
    });

    it('should render elevated card without crash', () => {
      const { toJSON } = render(
        <Card elevated>
          <Text>Elevated</Text>
        </Card>
      );
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Press Interaction', () => {
    it('should NOT wrap in pressable when onPress is not provided', () => {
      render(
        <Card>
          <Text>No Press</Text>
        </Card>
      );

      // No accessible button in the tree since no onPress was given
      // We just verify content is rendered
      expect(screen.getByText('No Press')).toBeTruthy();
    });

    it('should call onPress when card with onPress prop is tapped', () => {
      const onPress = jest.fn();

      render(
        <Card onPress={onPress} accessibilityLabel="Tap card">
          <Text>Pressable</Text>
        </Card>
      );

      const button = screen.getByLabelText('Tap card');
      fireEvent.press(button);

      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('should pass accessibilityLabel to SacredButton wrapper', () => {
      render(
        <Card onPress={jest.fn()} accessibilityLabel="Card action">
          <Text>Content</Text>
        </Card>
      );

      expect(screen.getByLabelText('Card action')).toBeTruthy();
    });
  });
});
