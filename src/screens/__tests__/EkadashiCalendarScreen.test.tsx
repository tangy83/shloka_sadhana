/**
 * EkadashiCalendarScreen Tests
 * Shloka Sadhana — Ekadashi calendar browsing screen
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { EkadashiCalendarScreen } from '../EkadashiCalendarScreen';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
  useRoute: () => ({ params: {} }),
  useFocusEffect: jest.fn(),
}));

// Mock date utils
jest.mock('@/utils/dateUtils', () => ({
  getTodayISO: jest.fn(() => '2026-02-22'),
}));

// Mock ekadashi calendar utils
jest.mock('@/utils/ekadashiCalendar', () => ({
  getUpcomingEkadashis: jest.fn(),
  getAllEkadashis: jest.fn(),
  getEkadashiByDate: jest.fn(),
}));
// eslint-disable-next-line import/first
import { getUpcomingEkadashis, getAllEkadashis } from '@/utils/ekadashiCalendar';
const mockGetUpcomingEkadashis = getUpcomingEkadashis as jest.MockedFunction<typeof getUpcomingEkadashis>;
const mockGetAllEkadashis = getAllEkadashis as jest.MockedFunction<typeof getAllEkadashis>;

const MOCK_EKADASHIS = [
  {
    date: '2026-03-03',
    name: 'Amalaki Ekadashi',
    name_hindi: 'आमलकी एकादशी',
    paksha: 'Shukla Paksha',
    deity: 'Lord Vishnu',
    significance: 'Observing this fast destroys all sins.',
    benefits: 'Spiritual upliftment and moksha.',
    vrat_katha: 'Once upon a time in the forest...',
    day: 'Tuesday',
  },
  {
    date: '2026-03-18',
    name: 'Papamochani Ekadashi',
    name_hindi: 'पापमोचनी एकादशी',
    paksha: 'Krishna Paksha',
    deity: 'Lord Vishnu',
    significance: 'This fast cleanses all sins.',
    benefits: 'Liberation from sins.',
    vrat_katha: 'In ancient times there was a sage...',
    day: 'Wednesday',
  },
];

describe('EkadashiCalendarScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUpcomingEkadashis.mockReturnValue(MOCK_EKADASHIS as never);
    mockGetAllEkadashis.mockReturnValue(MOCK_EKADASHIS as never);
  });

  describe('Initial Render', () => {
    it('should render without crash', () => {
      expect(() => render(<EkadashiCalendarScreen />)).not.toThrow();
    });

    it('should display the title "Ekadashi Calendar"', () => {
      render(<EkadashiCalendarScreen />);

      expect(screen.getByText('Ekadashi Calendar')).toBeTruthy();
    });

    it('should show count of ekadashis in subtitle', () => {
      render(<EkadashiCalendarScreen />);

      expect(screen.getByText('2 Ekadashis')).toBeTruthy();
    });
  });

  describe('Tab Navigation', () => {
    it('should show Upcoming and All 2026 tabs', () => {
      render(<EkadashiCalendarScreen />);

      expect(screen.getByTestId('tab-upcoming')).toBeTruthy();
      expect(screen.getByTestId('tab-all')).toBeTruthy();
    });

    it('should default to Upcoming tab', () => {
      render(<EkadashiCalendarScreen />);

      // Upcoming tab should be selected by default
      // getAllEkadashis should not be the active data source initially
      expect(mockGetUpcomingEkadashis).toHaveBeenCalled();
    });

    it('should switch to all ekadashis when All tab is pressed', () => {
      render(<EkadashiCalendarScreen />);

      fireEvent.press(screen.getByTestId('tab-all'));

      expect(mockGetAllEkadashis).toHaveBeenCalled();
    });
  });

  describe('Ekadashi Card Display', () => {
    it('should display ekadashi names', () => {
      render(<EkadashiCalendarScreen />);

      expect(screen.getByText('Amalaki Ekadashi')).toBeTruthy();
      expect(screen.getByText('Papamochani Ekadashi')).toBeTruthy();
    });

    it('should display Hindi names', () => {
      render(<EkadashiCalendarScreen />);

      expect(screen.getByText('आमलकी एकादशी')).toBeTruthy();
    });

    it('should display formatted date', () => {
      render(<EkadashiCalendarScreen />);

      // formatDate('2026-03-03') → 'Mar 03, 2026'
      expect(screen.getByText('Mar 03, 2026')).toBeTruthy();
    });

    it('should display paksha information', () => {
      render(<EkadashiCalendarScreen />);

      expect(screen.getByText('Shukla Paksha')).toBeTruthy();
    });

    it('should display significance text', () => {
      render(<EkadashiCalendarScreen />);

      expect(screen.getByText('Observing this fast destroys all sins.')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('should navigate to EkadashiDetail when a card is tapped', () => {
      render(<EkadashiCalendarScreen />);

      const cards = screen.getAllByTestId('ekadashi-card');
      fireEvent.press(cards[0]);

      expect(mockNavigate).toHaveBeenCalledWith('EkadashiDetail', {
        date: '2026-03-03',
      });
    });
  });

  describe('Empty State', () => {
    it('should show "No upcoming Ekadashis" when upcoming list is empty', () => {
      mockGetUpcomingEkadashis.mockReturnValue([]);

      render(<EkadashiCalendarScreen />);

      expect(screen.getByText('No upcoming Ekadashis')).toBeTruthy();
    });

    it('should show "No Ekadashis available" when All tab is empty', () => {
      mockGetUpcomingEkadashis.mockReturnValue([]);
      mockGetAllEkadashis.mockReturnValue([]);

      render(<EkadashiCalendarScreen />);

      fireEvent.press(screen.getByTestId('tab-all'));

      expect(screen.getByText('No Ekadashis available')).toBeTruthy();
    });
  });
});
