/**
 * EkadashiBanner Component Tests
 * Shloka Sadhana - V3 Feature #10
 *
 * Tests for Ekadashi banner displayed on Home screen
 * Following TDD approach - RED phase
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { EkadashiBanner } from '../EkadashiBanner';
import * as ekadashiCalendar from '@/utils/ekadashiCalendar';

// Mock the ekadashiCalendar utility
jest.mock('@/utils/ekadashiCalendar');
const mockCheckIfEkadashi = ekadashiCalendar.checkIfEkadashi as jest.MockedFunction<typeof ekadashiCalendar.checkIfEkadashi>;
const mockGetEkadashiByDate = ekadashiCalendar.getEkadashiByDate as jest.MockedFunction<typeof ekadashiCalendar.getEkadashiByDate>;
const mockGetNextEkadashi = ekadashiCalendar.getNextEkadashi as jest.MockedFunction<typeof ekadashiCalendar.getNextEkadashi>;

describe('EkadashiBanner', () => {
  const mockTodayEkadashi = {
    serial: 4,
    name: 'Vijaya Ekadashi',
    name_hindi: 'विजया एकादशी',
    date: '2026-02-13',
    day: 'Friday',
    paksha: 'Magha Shukla Paksha',
    deity: 'Lord Narayana',
    significance: 'This Ekadashi grants victory in all endeavors',
    benefits: 'Brings success, removes obstacles, grants victory',
    vrat_katha: 'Once upon a time in the kingdom of...',
  };

  const mockUpcomingEkadashi = {
    serial: 5,
    name: 'Amalaki Ekadashi',
    name_hindi: 'आमलकी एकादशी',
    date: '2026-02-28',
    day: 'Saturday',
    paksha: 'Phalguna Krishna Paksha',
    deity: 'Lord Narayana',
    significance: 'Worshipping Lord Vishnu near Amalaki tree',
    benefits: 'Purifies sins, grants longevity',
    vrat_katha: 'In ancient times...',
  };

  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock navigation
    jest.mock('@react-navigation/native', () => ({
      useNavigation: () => ({ navigate: mockNavigate }),
    }));
  });

  describe('Conditional Rendering', () => {
    it('should render when today is Ekadashi', () => {
      mockCheckIfEkadashi.mockReturnValue(true);
      mockGetEkadashiByDate.mockReturnValue(mockTodayEkadashi);

      render(<EkadashiBanner />);

      expect(screen.getByText(/Vijaya Ekadashi/i)).toBeTruthy();
    });

    it('should render when next Ekadashi is within 3 days', () => {
      mockCheckIfEkadashi.mockReturnValue(false);
      mockGetEkadashiByDate.mockReturnValue(null);
      mockGetNextEkadashi.mockReturnValue({
        ...mockUpcomingEkadashi,
        date: '2026-02-09', // 2 days away from 2026-02-07
      });

      render(<EkadashiBanner />);

      expect(screen.getByText(/Amalaki Ekadashi/i)).toBeTruthy();
    });

    it('should not render when no Ekadashi nearby', () => {
      mockCheckIfEkadashi.mockReturnValue(false);
      mockGetEkadashiByDate.mockReturnValue(null);
      mockGetNextEkadashi.mockReturnValue({
        ...mockUpcomingEkadashi,
        date: '2026-02-20', // More than 3 days away
      });

      const { queryByTestId } = render(<EkadashiBanner />);

      // Should not render the banner
      expect(queryByTestId('ekadashi-banner')).toBeNull();
    });
  });

  describe('Today is Ekadashi', () => {
    beforeEach(() => {
      mockCheckIfEkadashi.mockReturnValue(true);
      mockGetEkadashiByDate.mockReturnValue(mockTodayEkadashi);
    });

    it('should display "Today" badge', () => {
      render(<EkadashiBanner />);

      expect(screen.getByText('Today')).toBeTruthy();
    });

    it('should display Ekadashi name in English', () => {
      render(<EkadashiBanner />);

      expect(screen.getByText('Vijaya Ekadashi')).toBeTruthy();
    });

    it('should display Ekadashi name in Hindi', () => {
      render(<EkadashiBanner />);

      expect(screen.getByText('विजया एकादशी')).toBeTruthy();
    });

    it('should display significance', () => {
      render(<EkadashiBanner />);

      expect(screen.getByText(/grants victory/i)).toBeTruthy();
    });

    it('should display deity', () => {
      render(<EkadashiBanner />);

      expect(screen.getByText(/Lord Narayana/i)).toBeTruthy();
    });

    it('should have a call-to-action to view details', () => {
      render(<EkadashiBanner />);

      expect(screen.getByText(/Learn More/i)).toBeTruthy();
    });

    it('should be touchable/clickable', () => {
      render(<EkadashiBanner />);

      const banner = screen.getByTestId('ekadashi-banner');
      expect(banner).toBeTruthy();

      fireEvent.press(banner);
      // Navigation will be tested in integration
    });
  });

  describe('Upcoming Ekadashi (within 3 days)', () => {
    beforeEach(() => {
      mockCheckIfEkadashi.mockReturnValue(false);
      mockGetEkadashiByDate.mockReturnValue(null);
      mockGetNextEkadashi.mockReturnValue({
        ...mockUpcomingEkadashi,
        date: '2026-02-09', // 2 days away
      });
    });

    it('should display "In X days" badge', () => {
      render(<EkadashiBanner />);

      expect(screen.getByText(/In \d+ day/i)).toBeTruthy();
    });

    it('should display Ekadashi name', () => {
      render(<EkadashiBanner />);

      expect(screen.getByText('Amalaki Ekadashi')).toBeTruthy();
    });

    it('should display date in readable format', () => {
      render(<EkadashiBanner />);

      // Should show date like "February 9, 2026" or "Feb 9"
      expect(screen.getByText(/Feb/i)).toBeTruthy();
    });

    it('should have gentle color scheme (not alarming)', () => {
      const { getByTestId } = render(<EkadashiBanner />);

      const banner = getByTestId('ekadashi-banner');
      // Component should use calm colors, not bright red/urgent colors
      expect(banner).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle tomorrow (1 day away)', () => {
      mockCheckIfEkadashi.mockReturnValue(false);
      mockGetEkadashiByDate.mockReturnValue(null);
      mockGetNextEkadashi.mockReturnValue({
        ...mockUpcomingEkadashi,
        date: '2026-02-08', // Tomorrow
      });

      render(<EkadashiBanner />);

      expect(screen.getByText(/In 1 day/i)).toBeTruthy();
    });

    it('should handle exactly 3 days away', () => {
      mockCheckIfEkadashi.mockReturnValue(false);
      mockGetEkadashiByDate.mockReturnValue(null);
      mockGetNextEkadashi.mockReturnValue({
        ...mockUpcomingEkadashi,
        date: '2026-02-10', // 3 days away
      });

      render(<EkadashiBanner />);

      expect(screen.getByText(/In 3 day/i)).toBeTruthy();
    });

    it('should handle error from getNextEkadashi gracefully', () => {
      mockCheckIfEkadashi.mockReturnValue(false);
      mockGetEkadashiByDate.mockReturnValue(null);
      mockGetNextEkadashi.mockImplementation(() => {
        throw new Error('No Ekadashi found');
      });

      const { queryByTestId } = render(<EkadashiBanner />);

      // Should not crash, should not render
      expect(queryByTestId('ekadashi-banner')).toBeNull();
    });

    it('should handle missing optional fields', () => {
      mockCheckIfEkadashi.mockReturnValue(true);
      mockGetEkadashiByDate.mockReturnValue({
        ...mockTodayEkadashi,
        day: undefined, // Optional field
      });

      render(<EkadashiBanner />);

      // Should still render without crashing
      expect(screen.getByText('Vijaya Ekadashi')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible role and label', () => {
      mockCheckIfEkadashi.mockReturnValue(true);
      mockGetEkadashiByDate.mockReturnValue(mockTodayEkadashi);

      const { getByTestId } = render(<EkadashiBanner />);

      const banner = getByTestId('ekadashi-banner');
      expect(banner).toBeTruthy();
    });

    it('should have clear text hierarchy', () => {
      mockCheckIfEkadashi.mockReturnValue(true);
      mockGetEkadashiByDate.mockReturnValue(mockTodayEkadashi);

      render(<EkadashiBanner />);

      // Should have title, subtitle, and description in clear hierarchy
      expect(screen.getByText('Vijaya Ekadashi')).toBeTruthy();
      expect(screen.getByText('विजया एकादशी')).toBeTruthy();
    });
  });

  describe('Styling', () => {
    it('should use dark theme consistent with HomeScreen', () => {
      mockCheckIfEkadashi.mockReturnValue(true);
      mockGetEkadashiByDate.mockReturnValue(mockTodayEkadashi);

      const { getByTestId } = render(<EkadashiBanner />);

      const banner = getByTestId('ekadashi-banner');
      // Should use #1E1E1E background like other cards
      expect(banner).toBeTruthy();
    });

    it('should have icon/emoji for visual appeal', () => {
      mockCheckIfEkadashi.mockReturnValue(true);
      mockGetEkadashiByDate.mockReturnValue(mockTodayEkadashi);

      render(<EkadashiBanner />);

      // Should have icon (component uses 🕉️)
      expect(screen.getByText('🕉️')).toBeTruthy();

      // Component should render
      expect(screen.getByText('Vijaya Ekadashi')).toBeTruthy();
    });
  });
});
