/**
 * FestivalDetailScreen Tests
 * Shloka Sadhana — Festival detail with shlokas, fasting and regional guidance
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { FestivalDetailScreen } from '../FestivalDetailScreen';

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

// Mock festivals utils
jest.mock('@/utils/festivals', () => ({
  getFestivalByNameAndDate: jest.fn(),
}));
// eslint-disable-next-line import/first
import { getFestivalByNameAndDate } from '@/utils/festivals';
const mockGetFestivalByNameAndDate = getFestivalByNameAndDate as jest.MockedFunction<
  typeof getFestivalByNameAndDate
>;

const MOCK_FESTIVAL = {
  name: 'Karva Chauth',
  date: '2026-10-29',
  category: 'major',
  deity_association: 'Lord Shiva, Goddess Parvati',
  description: 'Married Hindu women observe a day-long waterless fast for their husbands.',
  recommended_shlokas: [
    'Om Namah Shivaya',
    'Karva Chauth Vrat Katha',
    'Gauri Shankar Mantra: Om Gauri Shankaraya Namah',
  ],
  fasting_guidelines: 'Nirjala (waterless) fast from sunrise to moonrise.',
  regional_variations: 'Predominantly observed in North India. Not traditional in South India.',
};

describe('FestivalDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRoute.mockReturnValue({
      params: { name: 'Karva Chauth', date: '2026-10-29' },
      key: 'test',
      name: 'FestivalDetail',
    } as never);
    mockGetFestivalByNameAndDate.mockReturnValue(MOCK_FESTIVAL as never);
  });

  describe('Header', () => {
    it('should render without crash', () => {
      expect(() => render(<FestivalDetailScreen />)).not.toThrow();
    });

    it('should display the festival name', () => {
      render(<FestivalDetailScreen />);
      expect(screen.getByText('Karva Chauth')).toBeTruthy();
    });

    it('should display the formatted date', () => {
      render(<FestivalDetailScreen />);
      expect(screen.getByText('October 29, 2026')).toBeTruthy();
    });

    it('should display the MAJOR badge for major festivals', () => {
      render(<FestivalDetailScreen />);
      expect(screen.getByText('MAJOR')).toBeTruthy();
    });

    it('should not display the MAJOR badge for non-major festivals', () => {
      mockGetFestivalByNameAndDate.mockReturnValue({
        ...MOCK_FESTIVAL,
        category: 'observance',
      } as never);

      render(<FestivalDetailScreen />);
      expect(screen.queryByText('MAJOR')).toBeNull();
    });
  });

  describe('Lookup', () => {
    it('should look the festival up by both name and date', () => {
      render(<FestivalDetailScreen />);
      expect(mockGetFestivalByNameAndDate).toHaveBeenCalledWith('Karva Chauth', '2026-10-29');
    });
  });

  describe('Content Sections', () => {
    it('should display the deity association', () => {
      render(<FestivalDetailScreen />);
      expect(screen.getByText('Lord Shiva, Goddess Parvati')).toBeTruthy();
    });

    it('should display the description', () => {
      render(<FestivalDetailScreen />);
      expect(screen.getByText(MOCK_FESTIVAL.description)).toBeTruthy();
    });

    it('should display every recommended shloka', () => {
      render(<FestivalDetailScreen />);
      MOCK_FESTIVAL.recommended_shlokas.forEach((shloka) => {
        expect(screen.getByText(shloka)).toBeTruthy();
      });
    });

    it('should display the fasting guidelines', () => {
      render(<FestivalDetailScreen />);
      expect(screen.getByText('Fasting Guidelines')).toBeTruthy();
      expect(screen.getByText(MOCK_FESTIVAL.fasting_guidelines)).toBeTruthy();
    });

    it('should display the regional variations', () => {
      render(<FestivalDetailScreen />);
      expect(screen.getByText('Regional Variations')).toBeTruthy();
      expect(screen.getByText(MOCK_FESTIVAL.regional_variations)).toBeTruthy();
    });
  });

  describe('Optional Sections', () => {
    it('should omit optional sections when their data is absent', () => {
      mockGetFestivalByNameAndDate.mockReturnValue({
        name: 'Karva Chauth',
        date: '2026-10-29',
        category: 'observance',
        deity_association: 'Lord Shiva',
        description: 'A fast.',
      } as never);

      render(<FestivalDetailScreen />);

      expect(screen.queryByText('Recommended Shlokas')).toBeNull();
      expect(screen.queryByText('Fasting Guidelines')).toBeNull();
      expect(screen.queryByText('Regional Variations')).toBeNull();
      // The always-present sections still render
      expect(screen.getByText('A fast.')).toBeTruthy();
    });

    it('should omit the shlokas section when the array is empty', () => {
      mockGetFestivalByNameAndDate.mockReturnValue({
        ...MOCK_FESTIVAL,
        recommended_shlokas: [],
      } as never);

      render(<FestivalDetailScreen />);
      expect(screen.queryByText('Recommended Shlokas')).toBeNull();
    });
  });

  describe('Not Found', () => {
    it('should show a fallback message when the festival is not found', () => {
      mockGetFestivalByNameAndDate.mockReturnValue(null);

      render(<FestivalDetailScreen />);
      expect(screen.getByText(/not found/i)).toBeTruthy();
    });

    it('should not throw when route params are missing', () => {
      mockUseRoute.mockReturnValue({
        params: undefined,
        key: 'test',
        name: 'FestivalDetail',
      } as never);

      expect(() => render(<FestivalDetailScreen />)).not.toThrow();
      expect(screen.getByText(/not found/i)).toBeTruthy();
    });
  });
});
