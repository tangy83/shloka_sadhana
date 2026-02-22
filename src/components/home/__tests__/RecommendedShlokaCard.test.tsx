/**
 * RecommendedShlokaCard Tests
 * Shloka Sadhana — Daily shloka recommendation card
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { RecommendedShlokaCard } from '../RecommendedShlokaCard';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Mock shlokaRecommendation module
jest.mock('@/utils/shlokaRecommendation', () => ({
  getDailyRecommendation: jest.fn(),
}));
// eslint-disable-next-line import/first
import { getDailyRecommendation } from '@/utils/shlokaRecommendation';
const mockGetDailyRecommendation = getDailyRecommendation as jest.MockedFunction<typeof getDailyRecommendation>;

// Mock dateUtils
jest.mock('@/utils/dateUtils', () => ({
  getTodayISO: jest.fn(() => '2026-02-22'),
}));

const MOCK_SHLOKA = {
  id: 'gayatri-mantra',
  name: 'Gayatri Mantra',
  shortName: 'Gayatri',
  deity: 'Goddess Gayatri',
  category: 'Mantra',
  description: 'The most sacred mantra in Hinduism.',
  benefits: 'Illuminates intellect, bestows wisdom.',
  duration: '5-10 minutes',
  bestTime: 'Sunrise',
  youtubeUrl: 'https://youtube.com/gayatri',
  sections: [],
};

const MOCK_RECOMMENDATION = {
  shloka: MOCK_SHLOKA,
  reason: 'Perfect for Monday — solar energy aligns with Gayatri practice.',
};

describe('RecommendedShlokaCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Empty State', () => {
    it('should not render when recommendation is null', () => {
      mockGetDailyRecommendation.mockReturnValue(null as never);

      const { toJSON } = render(<RecommendedShlokaCard />);
      expect(toJSON()).toBeNull();
    });

    it('should not render when getDailyRecommendation throws', () => {
      mockGetDailyRecommendation.mockImplementation(() => {
        throw new Error('Failed');
      });

      const { toJSON } = render(<RecommendedShlokaCard />);
      expect(toJSON()).toBeNull();
    });
  });

  describe('Content Display', () => {
    it('should render without crash', () => {
      mockGetDailyRecommendation.mockReturnValue(MOCK_RECOMMENDATION);

      expect(() => render(<RecommendedShlokaCard />)).not.toThrow();
    });

    it('should display the "Recommended for You" badge', () => {
      mockGetDailyRecommendation.mockReturnValue(MOCK_RECOMMENDATION);

      render(<RecommendedShlokaCard />);

      expect(screen.getByText('Recommended for You')).toBeTruthy();
    });

    it('should display the shloka name', () => {
      mockGetDailyRecommendation.mockReturnValue(MOCK_RECOMMENDATION);

      render(<RecommendedShlokaCard />);

      expect(screen.getByText(MOCK_SHLOKA.name)).toBeTruthy();
    });

    it('should display the deity name', () => {
      mockGetDailyRecommendation.mockReturnValue(MOCK_RECOMMENDATION);

      render(<RecommendedShlokaCard />);

      expect(screen.getByText(MOCK_SHLOKA.deity)).toBeTruthy();
    });

    it('should display the recommendation reason', () => {
      mockGetDailyRecommendation.mockReturnValue(MOCK_RECOMMENDATION);

      render(<RecommendedShlokaCard />);

      expect(screen.getByText(MOCK_RECOMMENDATION.reason)).toBeTruthy();
    });

    it('should display the description', () => {
      mockGetDailyRecommendation.mockReturnValue(MOCK_RECOMMENDATION);

      render(<RecommendedShlokaCard />);

      expect(screen.getByText(MOCK_SHLOKA.description)).toBeTruthy();
    });

    it('should display "Start Practice" CTA', () => {
      mockGetDailyRecommendation.mockReturnValue(MOCK_RECOMMENDATION);

      render(<RecommendedShlokaCard />);

      expect(screen.getByText('Start Practice')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('should navigate to ShlokaDetail when card is pressed', () => {
      mockGetDailyRecommendation.mockReturnValue(MOCK_RECOMMENDATION);

      render(<RecommendedShlokaCard />);

      const card = screen.getByTestId('recommended-shloka-card');
      fireEvent.press(card);

      expect(mockNavigate).toHaveBeenCalledWith('ShlokaDetail', {
        shlokaId: MOCK_SHLOKA.id,
      });
    });
  });

  describe('testID', () => {
    it('should have testID on the card container', () => {
      mockGetDailyRecommendation.mockReturnValue(MOCK_RECOMMENDATION);

      render(<RecommendedShlokaCard />);

      expect(screen.getByTestId('recommended-shloka-card')).toBeTruthy();
    });
  });
});
