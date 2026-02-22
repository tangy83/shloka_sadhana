/**
 * EkadashiDetailScreen Tests
 * Shloka Sadhana — Ekadashi detail with Vrat Katha
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { EkadashiDetailScreen } from '../EkadashiDetailScreen';

// Mock navigation & route
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: jest.fn() }),
  useRoute: jest.fn(),
  useFocusEffect: jest.fn(),
  RouteProp: {},
}));
// eslint-disable-next-line import/first
import { useRoute } from '@react-navigation/native';
const mockUseRoute = useRoute as jest.MockedFunction<typeof useRoute>;

// Mock ekadashi calendar utils
jest.mock('@/utils/ekadashiCalendar', () => ({
  getEkadashiByDate: jest.fn(),
}));
// eslint-disable-next-line import/first
import { getEkadashiByDate } from '@/utils/ekadashiCalendar';
const mockGetEkadashiByDate = getEkadashiByDate as jest.MockedFunction<typeof getEkadashiByDate>;

const MOCK_EKADASHI = {
  date: '2026-03-03',
  name: 'Amalaki Ekadashi',
  name_hindi: 'आमलकी एकादशी',
  paksha: 'Shukla Paksha',
  deity: 'Lord Vishnu',
  significance: 'Observing this Ekadashi fast destroys all sins and bestows moksha.',
  benefits: 'Spiritual upliftment, liberation, and divine blessings.',
  vrat_katha: 'In ancient times, in the forest of Naimisharanya, sages gathered...',
  day: 'Tuesday',
};

describe('EkadashiDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRoute.mockReturnValue({
      params: { date: '2026-03-03' },
      key: 'test',
      name: 'EkadashiDetail',
    } as never);
    mockGetEkadashiByDate.mockReturnValue(MOCK_EKADASHI as never);
  });

  describe('Header', () => {
    it('should render without crash', () => {
      expect(() => render(<EkadashiDetailScreen />)).not.toThrow();
    });

    it('should display the ekadashi name', () => {
      render(<EkadashiDetailScreen />);

      expect(screen.getByText('Amalaki Ekadashi')).toBeTruthy();
    });

    it('should display the Hindi name', () => {
      render(<EkadashiDetailScreen />);

      expect(screen.getByText('आमलकी एकादशी')).toBeTruthy();
    });

    it('should display the OM glyph', () => {
      render(<EkadashiDetailScreen />);

      expect(screen.getByText('ॐ')).toBeTruthy();
    });
  });

  describe('Date & Metadata', () => {
    it('should display the formatted date', () => {
      render(<EkadashiDetailScreen />);

      // formatDate('2026-03-03') → 'March 3, 2026'
      expect(screen.getByText('March 3, 2026')).toBeTruthy();
    });

    it('should display Paksha information', () => {
      render(<EkadashiDetailScreen />);

      expect(screen.getByText('Shukla Paksha')).toBeTruthy();
    });

    it('should display the deity', () => {
      render(<EkadashiDetailScreen />);

      expect(screen.getByText('Lord Vishnu')).toBeTruthy();
    });

    it('should display day when available', () => {
      render(<EkadashiDetailScreen />);

      expect(screen.getByText('Tuesday')).toBeTruthy();
    });
  });

  describe('Content Sections', () => {
    it('should display the Significance section', () => {
      render(<EkadashiDetailScreen />);

      expect(screen.getByText('Significance')).toBeTruthy();
      expect(screen.getByText(MOCK_EKADASHI.significance)).toBeTruthy();
    });

    it('should display the Benefits section', () => {
      render(<EkadashiDetailScreen />);

      expect(screen.getByText('Benefits')).toBeTruthy();
      expect(screen.getByText(MOCK_EKADASHI.benefits)).toBeTruthy();
    });

    it('should display the Vrat Katha section', () => {
      render(<EkadashiDetailScreen />);

      expect(screen.getByText('Vrat Katha')).toBeTruthy();
      expect(screen.getByText(MOCK_EKADASHI.vrat_katha)).toBeTruthy();
    });

    it('should display the "How to Observe" section', () => {
      render(<EkadashiDetailScreen />);

      expect(screen.getByText('How to Observe')).toBeTruthy();
    });
  });

  describe('Error State', () => {
    it('should show error message when ekadashi is not found', () => {
      mockGetEkadashiByDate.mockReturnValue(undefined as never);

      render(<EkadashiDetailScreen />);

      expect(screen.getByText('Ekadashi not found for 2026-03-03')).toBeTruthy();
    });
  });
});
