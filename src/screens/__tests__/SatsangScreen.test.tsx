/**
 * SatsangScreen Tests
 * Shloka Sadhana - Satsang (Community) Screen
 *
 * Tests for community and social features
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { SatsangScreen } from '../SatsangScreen';

describe('SatsangScreen', () => {
  describe('Initial Render', () => {
    it('should render the screen', () => {
      render(<SatsangScreen />);
      expect(screen.getByText('Satsang')).toBeTruthy();
    });

    it('should display screen title', () => {
      render(<SatsangScreen />);
      expect(screen.getByText('Satsang')).toBeTruthy();
    });

    it('should display subtitle', () => {
      render(<SatsangScreen />);
      expect(screen.getByText(/Spiritual Community/i)).toBeTruthy();
    });
  });

  // NOTE: SatsangScreen was refactored to a "Coming Soon" stub.
  // The original Community Features and Upcoming Events sections were removed.
  // Tests updated to reflect the current coming-soon design.

  describe('Community Hero Section', () => {
    it('should display the community invite text', () => {
      render(<SatsangScreen />);
      expect(screen.getByText(/global community of practitioners/i)).toBeTruthy();
    });

    it('should display the OM glyph', () => {
      render(<SatsangScreen />);
      expect(screen.getByText('ॐ')).toBeTruthy();
    });
  });

  describe('Coming Soon Feature Cards', () => {
    it('should display Group Chanting feature', () => {
      render(<SatsangScreen />);
      expect(screen.getByText('Group Chanting')).toBeTruthy();
    });

    it('should display Satsang Events feature', () => {
      render(<SatsangScreen />);
      expect(screen.getByText('Satsang Events')).toBeTruthy();
    });

    it('should display Shared Streaks feature', () => {
      render(<SatsangScreen />);
      expect(screen.getByText('Shared Streaks')).toBeTruthy();
    });

    it('should display Coming soon label', () => {
      render(<SatsangScreen />);
      expect(screen.getByText(/Coming soon/i)).toBeTruthy();
    });
  });

  describe('CTA Section', () => {
    it('should display Start a Personal Session CTA', () => {
      render(<SatsangScreen />);
      expect(screen.getByText('Start a Personal Session')).toBeTruthy();
    });
  });

  // Removed: Spiritual Calendar section no longer exists

  describe('Scrollable Content', () => {
    it('should render scrollable view', () => {
      const { getByTestId } = render(<SatsangScreen />);
      expect(getByTestId('satsang-scroll')).toBeTruthy();
    });
  });
});
