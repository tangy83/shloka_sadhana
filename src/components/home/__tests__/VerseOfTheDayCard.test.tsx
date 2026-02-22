/**
 * VerseOfTheDayCard Tests
 * Shloka Sadhana — Daily verse from sacred texts
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { VerseOfTheDayCard } from '../VerseOfTheDayCard';

// Mock verseOfTheDay utility
jest.mock('@/utils/verseOfTheDay', () => ({
  getVerseOfTheDay: jest.fn(),
}));
// eslint-disable-next-line import/first
import { getVerseOfTheDay } from '@/utils/verseOfTheDay';
const mockGetVerseOfTheDay = getVerseOfTheDay as jest.MockedFunction<typeof getVerseOfTheDay>;

// Mock dateUtils
jest.mock('@/utils/dateUtils', () => ({
  getTodayISO: jest.fn(() => '2026-02-22'),
}));

const MOCK_VERSE = {
  id: 0,
  shlokaId: 'gayatri-mantra',
  sectionId: 0,
  shlokaName: 'Gayatri Mantra',
  deity: 'Goddess Gayatri',
  sanskrit: 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यम्',
  transliteration: 'Om Bhur Bhuvah Svah Tat Savitur Varenyam',
  meaning: 'We meditate on the glory of the Creator who has created the Universe.',
  hindi: 'हम उस परम तत्व का ध्यान करते हैं।',
  category: 'Mantra',
};

describe('VerseOfTheDayCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Empty State', () => {
    it('should not render when getVerseOfTheDay returns null', () => {
      mockGetVerseOfTheDay.mockReturnValue(null as never);

      const { toJSON } = render(<VerseOfTheDayCard />);
      expect(toJSON()).toBeNull();
    });

    it('should not render when getVerseOfTheDay throws', () => {
      mockGetVerseOfTheDay.mockImplementation(() => {
        throw new Error('No verse found');
      });

      const { toJSON } = render(<VerseOfTheDayCard />);
      expect(toJSON()).toBeNull();
    });
  });

  describe('Content Display', () => {
    it('should render without crash', () => {
      mockGetVerseOfTheDay.mockReturnValue(MOCK_VERSE);

      expect(() => render(<VerseOfTheDayCard />)).not.toThrow();
    });

    it('should display "Verse of the Day" badge', () => {
      mockGetVerseOfTheDay.mockReturnValue(MOCK_VERSE);

      render(<VerseOfTheDayCard />);

      expect(screen.getByText('Verse of the Day')).toBeTruthy();
    });

    it('should display the deity name', () => {
      mockGetVerseOfTheDay.mockReturnValue(MOCK_VERSE);

      render(<VerseOfTheDayCard />);

      expect(screen.getByText(MOCK_VERSE.deity)).toBeTruthy();
    });

    it('should display the Sanskrit text', () => {
      mockGetVerseOfTheDay.mockReturnValue(MOCK_VERSE);

      render(<VerseOfTheDayCard />);

      expect(screen.getByText(MOCK_VERSE.sanskrit)).toBeTruthy();
    });

    it('should display the transliteration', () => {
      mockGetVerseOfTheDay.mockReturnValue(MOCK_VERSE);

      render(<VerseOfTheDayCard />);

      expect(screen.getByText(MOCK_VERSE.transliteration)).toBeTruthy();
    });

    it('should display the English meaning', () => {
      mockGetVerseOfTheDay.mockReturnValue(MOCK_VERSE);

      render(<VerseOfTheDayCard />);

      expect(screen.getByText(MOCK_VERSE.meaning)).toBeTruthy();
    });

    it('should display Hindi translation when available', () => {
      mockGetVerseOfTheDay.mockReturnValue(MOCK_VERSE);

      render(<VerseOfTheDayCard />);

      expect(screen.getByText(MOCK_VERSE.hindi!)).toBeTruthy();
    });

    it('should NOT render Hindi section when hindi is not provided', () => {
      const verseWithoutHindi = { ...MOCK_VERSE, hindi: undefined };
      mockGetVerseOfTheDay.mockReturnValue(verseWithoutHindi);

      render(<VerseOfTheDayCard />);

      // Hindi text should not appear
      expect(screen.queryByText(MOCK_VERSE.hindi!)).toBeNull();
    });

    it('should display the source (shloka name)', () => {
      mockGetVerseOfTheDay.mockReturnValue(MOCK_VERSE);

      render(<VerseOfTheDayCard />);

      expect(screen.getByText(`— ${MOCK_VERSE.shlokaName}`)).toBeTruthy();
    });

    it('should display the category when provided', () => {
      mockGetVerseOfTheDay.mockReturnValue(MOCK_VERSE);

      render(<VerseOfTheDayCard />);

      expect(screen.getByText(MOCK_VERSE.category!)).toBeTruthy();
    });
  });
});
