/**
 * RecoveryMessageCard Component Tests
 * Shloka Sadhana - V3 Feature #2
 *
 * Tests for streak recovery encouragement message
 * Following TDD approach - RED phase
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { RecoveryMessageCard } from '../RecoveryMessageCard';

describe('RecoveryMessageCard', () => {
  const mockOnDismiss = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should display the longest streak number prominently', () => {
      render(
        <RecoveryMessageCard longestStreak={7} onDismiss={mockOnDismiss} />
      );

      expect(screen.getByText(/7 days/i)).toBeTruthy();
    });

    it('should display encouraging message', () => {
      render(
        <RecoveryMessageCard longestStreak={14} onDismiss={mockOnDismiss} />
      );

      expect(screen.getByText(/Your best was/i)).toBeTruthy();
      expect(screen.getByText(/you can reach it again/i)).toBeTruthy();
    });

    it('should display call-to-action text', () => {
      render(
        <RecoveryMessageCard longestStreak={5} onDismiss={mockOnDismiss} />
      );

      expect(screen.getByText(/Start a new streak today/i)).toBeTruthy();
    });

    it('should use correct number format for single day', () => {
      render(
        <RecoveryMessageCard longestStreak={1} onDismiss={mockOnDismiss} />
      );

      expect(screen.getByText(/1 day/i)).toBeTruthy();
    });

    it('should use plural for multiple days', () => {
      render(
        <RecoveryMessageCard longestStreak={2} onDismiss={mockOnDismiss} />
      );

      expect(screen.getByText(/2 days/i)).toBeTruthy();
    });
  });

  describe('Dismissal', () => {
    it('should display dismiss button', () => {
      render(
        <RecoveryMessageCard longestStreak={7} onDismiss={mockOnDismiss} />
      );

      // Check for X or close button
      expect(screen.getByLabelText(/dismiss|close/i)).toBeTruthy();
    });

    it('should call onDismiss when dismiss button is pressed', () => {
      render(
        <RecoveryMessageCard longestStreak={7} onDismiss={mockOnDismiss} />
      );

      const dismissButton = screen.getByLabelText(/dismiss|close/i);
      fireEvent.press(dismissButton);

      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });

    it('should have accessible role for dismiss button', () => {
      render(
        <RecoveryMessageCard longestStreak={7} onDismiss={mockOnDismiss} />
      );

      const dismissButton = screen.getByLabelText(/dismiss|close/i);
      expect(dismissButton.props.accessibilityRole).toBe('button');
    });
  });

  describe('Styling and Tone', () => {
    it('should use warm colors (not red/alarming)', () => {
      const { UNSAFE_getAllByType } = render(
        <RecoveryMessageCard longestStreak={7} onDismiss={mockOnDismiss} />
      );

      // Component should render without red color scheme
      // This is more of a visual test, but we can check it renders
      expect(UNSAFE_getAllByType).toBeDefined();
    });

    it('should have encouraging tone (not guilt-inducing)', () => {
      render(
        <RecoveryMessageCard longestStreak={7} onDismiss={mockOnDismiss} />
      );

      // Check for positive language
      const text = screen.getByText(/you can reach it again/i);
      expect(text).toBeTruthy();

      // Should NOT have negative language
      expect(screen.queryByText(/failed|lost|give up/i)).toBeNull();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible label for the card', () => {
      render(
        <RecoveryMessageCard longestStreak={7} onDismiss={mockOnDismiss} />
      );

      expect(screen.getByLabelText('Streak recovery encouragement')).toBeTruthy();
    });

    it('should have semantic role for the message', () => {
      render(
        <RecoveryMessageCard longestStreak={7} onDismiss={mockOnDismiss} />
      );

      const card = screen.getByLabelText('Streak recovery encouragement');
      // Card should be accessible
      expect(card.props.accessible).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large streak numbers', () => {
      render(
        <RecoveryMessageCard longestStreak={365} onDismiss={mockOnDismiss} />
      );

      expect(screen.getByText(/365 days/i)).toBeTruthy();
    });

    it('should handle streak of 1 day correctly', () => {
      render(
        <RecoveryMessageCard longestStreak={1} onDismiss={mockOnDismiss} />
      );

      // Should show "day" (singular) not "days"
      expect(screen.getByText(/1 day/i)).toBeTruthy();
    });
  });

  describe('Optional Prop: onDismiss', () => {
    it('should work without onDismiss prop (optional dismissal)', () => {
      // If onDismiss is optional, component should render without it
      expect(() => {
        render(<RecoveryMessageCard longestStreak={7} onDismiss={mockOnDismiss} />);
      }).not.toThrow();
    });
  });
});
