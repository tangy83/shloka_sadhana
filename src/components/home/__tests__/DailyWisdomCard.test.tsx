/**
 * DailyWisdomCard Tests
 * Shloka Sadhana — Daily wisdom card component
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { DailyWisdomCard } from '../DailyWisdomCard';

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

// Mock data/wisdom module
jest.mock('@/data/wisdom', () => ({
  getDailyWisdomQuote: jest.fn(),
}));
// eslint-disable-next-line import/first
import { getDailyWisdomQuote } from '@/data/wisdom';
const mockGetDailyWisdomQuote = getDailyWisdomQuote as jest.MockedFunction<typeof getDailyWisdomQuote>;

// Mock dateUtils
jest.mock('@/utils/dateUtils', () => ({
  getTodayISO: jest.fn(() => '2026-02-22'),
}));

const MOCK_QUOTE = {
  id: 'bhagavad-gita-2-47',
  text: 'You have the right to perform your prescribed duty, but you are not entitled to the fruits of action.',
  meaning: 'This verse teaches the principle of Nishkama Karma.',
  author: 'Lord Krishna',
  source: 'Bhagavad Gita 2:47',
  category: 'karma' as const,
  tags: ['duty', 'karma'],
};

describe('DailyWisdomCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading / Empty State', () => {
    it('should not render when getDailyWisdomQuote returns null', () => {
      mockGetDailyWisdomQuote.mockReturnValue(null as never);

      const { toJSON } = render(<DailyWisdomCard />);
      expect(toJSON()).toBeNull();
    });

    it('should not render when getDailyWisdomQuote throws', () => {
      mockGetDailyWisdomQuote.mockImplementation(() => {
        throw new Error('Failed');
      });

      const { toJSON } = render(<DailyWisdomCard />);
      expect(toJSON()).toBeNull();
    });
  });

  describe('Content Display', () => {
    it('should render without crash when quote is available', () => {
      mockGetDailyWisdomQuote.mockReturnValue(MOCK_QUOTE);

      expect(() => render(<DailyWisdomCard />)).not.toThrow();
    });

    it('should display "Daily Wisdom" badge', () => {
      mockGetDailyWisdomQuote.mockReturnValue(MOCK_QUOTE);

      render(<DailyWisdomCard />);

      expect(screen.getByText('Daily Wisdom')).toBeTruthy();
    });

    it('should display the author attribution', () => {
      mockGetDailyWisdomQuote.mockReturnValue(MOCK_QUOTE);

      render(<DailyWisdomCard />);

      expect(screen.getByText(`— ${MOCK_QUOTE.author}`)).toBeTruthy();
    });

    it('should display the source reference', () => {
      mockGetDailyWisdomQuote.mockReturnValue(MOCK_QUOTE);

      render(<DailyWisdomCard />);

      expect(screen.getByText(MOCK_QUOTE.source)).toBeTruthy();
    });

    it('should display the quote text', () => {
      mockGetDailyWisdomQuote.mockReturnValue(MOCK_QUOTE);

      render(<DailyWisdomCard />);

      // Quote text is wrapped in &quot; entities which render as literal quotes
      expect(screen.getByText(`"${MOCK_QUOTE.text}"`)).toBeTruthy();
    });

    it('should display category label', () => {
      mockGetDailyWisdomQuote.mockReturnValue(MOCK_QUOTE);

      render(<DailyWisdomCard />);

      expect(screen.getByText('Karma')).toBeTruthy();
    });

    it('should display "Read More" CTA', () => {
      mockGetDailyWisdomQuote.mockReturnValue(MOCK_QUOTE);

      render(<DailyWisdomCard />);

      expect(screen.getByText('Read More')).toBeTruthy();
    });
  });

  describe('testID', () => {
    it('should have testID for selection in parent tests', () => {
      mockGetDailyWisdomQuote.mockReturnValue(MOCK_QUOTE);

      render(<DailyWisdomCard />);

      expect(screen.getByTestId('daily-wisdom-card')).toBeTruthy();
    });
  });
});
