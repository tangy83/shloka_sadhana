/**
 * SatsangScreen Tests
 * Shloka Sadhana - Satsang (Community) Screen
 *
 * The screen is a self-contained reflection on satsang with a personal-practice
 * CTA. It must NOT advertise any unbuilt/"coming soon" feature (App Review 2.1).
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { SatsangScreen } from '../SatsangScreen';

describe('SatsangScreen', () => {
  describe('Initial Render', () => {
    it('should render the screen title', () => {
      render(<SatsangScreen />);
      expect(screen.getByText('Satsang')).toBeTruthy();
    });

    it('should display the OM glyph', () => {
      render(<SatsangScreen />);
      expect(screen.getByText('ॐ')).toBeTruthy();
    });
  });

  describe('Static devotional content (no unbuilt features advertised)', () => {
    it('should display reflective notes about satsang', () => {
      render(<SatsangScreen />);
      expect(screen.getByText('What Satsang Means')).toBeTruthy();
      expect(screen.getByText('Consistency Is Devotion')).toBeTruthy();
    });

    it('should NOT advertise any coming-soon / future feature', () => {
      render(<SatsangScreen />);
      expect(screen.queryByText(/coming soon/i)).toBeNull();
      expect(screen.queryByText(/future update/i)).toBeNull();
      expect(screen.queryByText(/Group Chanting/i)).toBeNull();
      expect(screen.queryByText(/Shared Streaks/i)).toBeNull();
    });
  });

  describe('CTA Section', () => {
    it('should display the Start a Personal Session CTA', () => {
      render(<SatsangScreen />);
      expect(screen.getByText('Start a Personal Session')).toBeTruthy();
    });
  });

  describe('Scrollable Content', () => {
    it('should render a scrollable view', () => {
      const { getByTestId } = render(<SatsangScreen />);
      expect(getByTestId('satsang-scroll')).toBeTruthy();
    });
  });
});
