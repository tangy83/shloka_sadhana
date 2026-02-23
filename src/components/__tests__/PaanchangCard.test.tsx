/**
 * PaanchangCard Component Tests
 * Shloka Sadhana - Hindu Calendar Display
 *
 * Tests for Paanchang (Hindu calendar) card component
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { PaanchangCard } from '../PaanchangCard';
import { PaanchangData } from '@/types';

import { getPaanchangForDate } from '@/utils/paanchang';

// Mock paanchang service
jest.mock('@/utils/paanchang', () => ({
  getPaanchangForDate: jest.fn(),
}));

// Mock weekday recommendations — prevents real recommendation text (which may contain
// weekday names like "Monday") from appearing in the render tree and conflicting with
// the weekday display assertions that use getByText(/Monday/).
jest.mock('@/utils/weekdayRecommendations', () => ({
  getRecommendationForDate: jest.fn().mockReturnValue(null),
}));

const mockGetPaanchangForDate = getPaanchangForDate as jest.MockedFunction<
  typeof getPaanchangForDate
>;

describe('PaanchangCard', () => {
  const mockPaanchang: PaanchangData = {
    date: '2024-01-15',
    tithi: 'Ekadashi',
    tithiNumber: 11,
    nakshatra: 'Rohini',
    paksha: 'Shukla',
    hinduMonth: 'Pausha',
    weekday: 'Somvar',
    weekdayEnglish: 'Monday',
    isEkadashi: true,
    ekadasiName: 'Pausha Putrada Ekadashi',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPaanchangForDate.mockReturnValue(mockPaanchang);
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { getByTestId } = render(<PaanchangCard />);
      expect(getByTestId('paanchang-card')).toBeTruthy();
    });

    it('should display Tithi', () => {
      const { getAllByText } = render(<PaanchangCard />);
      const ekadashiElements = getAllByText('Ekadashi');
      // Should appear at least once (in Tithi field)
      expect(ekadashiElements.length).toBeGreaterThan(0);
    });

    it('should display Nakshatra', () => {
      const { getByText } = render(<PaanchangCard />);
      expect(getByText('Rohini')).toBeTruthy();
    });

    it('should display Paksha', () => {
      const { getByText } = render(<PaanchangCard />);
      expect(getByText(/Shukla/)).toBeTruthy();
    });

    it('should display Hindu month', () => {
      const { getByText } = render(<PaanchangCard />);
      expect(getByText('Pausha')).toBeTruthy();
    });

    it('should display Sanskrit weekday', () => {
      const { getByText } = render(<PaanchangCard />);
      expect(getByText(/Somvar/)).toBeTruthy();
    });

    it('should display English weekday', () => {
      const { getByText } = render(<PaanchangCard />);
      expect(getByText(/Monday/)).toBeTruthy();
    });
  });

  describe('Ekadashi Highlight', () => {
    it('should show Ekadashi indicator when isEkadashi is true', () => {
      const { getByTestId } = render(<PaanchangCard />);
      expect(getByTestId('ekadashi-indicator')).toBeTruthy();
    });

    it('should display Ekadashi name when available', () => {
      const { getByText } = render(<PaanchangCard />);
      expect(getByText(/Pausha Putrada Ekadashi/)).toBeTruthy();
    });

    it('should not show Ekadashi indicator for non-Ekadashi days', () => {
      const nonEkadasiData: PaanchangData = {
        ...mockPaanchang,
        tithi: 'Pratipada',
        tithiNumber: 1,
        isEkadashi: false,
        ekadasiName: undefined,
      };
      mockGetPaanchangForDate.mockReturnValue(nonEkadasiData);

      const { queryByTestId } = render(<PaanchangCard />);
      expect(queryByTestId('ekadashi-indicator')).toBeNull();
    });
  });

  describe('Data Updates', () => {
    it('should update when date changes', () => {
      const { getAllByText, getByText, rerender } = render(<PaanchangCard date="2024-01-15" />);
      const ekadashiElements = getAllByText('Ekadashi');
      expect(ekadashiElements.length).toBeGreaterThan(0);

      // Update mock to return different data for a different date
      const newData: PaanchangData = {
        ...mockPaanchang,
        date: '2024-01-20',
        tithi: 'Purnima',
        tithiNumber: 15,
        isEkadashi: false,
        ekadasiName: undefined,
      };
      mockGetPaanchangForDate.mockReturnValue(newData);

      // Rerender with new date prop to trigger useEffect
      rerender(<PaanchangCard date="2024-01-20" />);
      expect(getByText('Purnima')).toBeTruthy();
    });

    it('should call getPaanchangForDate with today\'s date by default', () => {
      render(<PaanchangCard />);

      const today = new Date().toISOString().split('T')[0];
      expect(mockGetPaanchangForDate).toHaveBeenCalledWith(today);
    });

    it('should accept custom date prop', () => {
      const customDate = '2024-06-15';
      render(<PaanchangCard date={customDate} />);

      expect(mockGetPaanchangForDate).toHaveBeenCalledWith(customDate);
    });
  });

  describe('Layout', () => {
    it('should have proper accessibility labels', () => {
      const { getByLabelText } = render(<PaanchangCard />);
      expect(getByLabelText(/Hindu Calendar/i)).toBeTruthy();
    });

    it('should display all required fields', () => {
      const { getAllByText, getByText } = render(<PaanchangCard />);

      // Check all fields are present
      const ekadashiElements = getAllByText('Ekadashi');
      expect(ekadashiElements.length).toBeGreaterThan(0); // Tithi
      expect(getByText('Rohini')).toBeTruthy(); // Nakshatra
      expect(getByText(/Shukla/)).toBeTruthy(); // Paksha
      expect(getByText('Pausha')).toBeTruthy(); // Month
      expect(getByText(/Somvar/)).toBeTruthy(); // Weekday
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing Ekadashi name gracefully', () => {
      const dataWithoutEkadasiName: PaanchangData = {
        ...mockPaanchang,
        isEkadashi: true,
        ekadasiName: undefined,
      };
      mockGetPaanchangForDate.mockReturnValue(dataWithoutEkadasiName);

      const { getByTestId } = render(<PaanchangCard />);
      // Should still show Ekadashi indicator
      expect(getByTestId('ekadashi-indicator')).toBeTruthy();
    });

    it('should handle all pakshas correctly', () => {
      // Test Shukla Paksha
      const { getByText: getByTextShukla } = render(<PaanchangCard />);
      expect(getByTextShukla(/Shukla/)).toBeTruthy();

      // Test Krishna Paksha
      const krishnaData: PaanchangData = {
        ...mockPaanchang,
        paksha: 'Krishna',
      };
      mockGetPaanchangForDate.mockReturnValue(krishnaData);

      const { getByText: getByTextKrishna } = render(<PaanchangCard />);
      expect(getByTextKrishna(/Krishna/)).toBeTruthy();
    });
  });

  describe('Visual Styling', () => {
    it('should apply special styling for Ekadashi days', () => {
      const { getByTestId } = render(<PaanchangCard />);
      const card = getByTestId('paanchang-card');

      // Should have some special styling (implementation will verify exact styles)
      expect(card).toBeTruthy();
    });

    it('should have consistent styling for non-Ekadashi days', () => {
      const normalData: PaanchangData = {
        ...mockPaanchang,
        tithi: 'Pratipada',
        tithiNumber: 1,
        isEkadashi: false,
        ekadasiName: undefined,
      };
      mockGetPaanchangForDate.mockReturnValue(normalData);

      const { getByTestId } = render(<PaanchangCard />);
      const card = getByTestId('paanchang-card');

      expect(card).toBeTruthy();
    });
  });
});
