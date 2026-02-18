/**
 * WisdomDetailScreen Tests
 * Shloka Sadhana - Wisdom Quote Detail
 *
 * Tests for the detail view of a wisdom quote: renders quote text,
 * category, Sanskrit text, attribution, practical application,
 * and gracefully handles an unknown quoteId.
 *
 * NOTE: sectionTitle uses `textTransform: 'uppercase'` in StyleSheet, but
 * RNTL does not apply CSS transforms to text content — queries must match
 * the literal string value in JSX (e.g. "Sanskrit" not "SANSKRIT").
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { WisdomDetailScreen } from '../WisdomDetailScreen';

// ─── Test fixtures ──────────────────────────────────────────────────────────
// bhagavad-gita-2-47: has all optional fields (text_sanskrit, context, tags, practical_application)
// thirukkural-kindness: has empty text_sanskrit (so Sanskrit section is hidden)
// bhagavad-gita-12-13-14: category = 'devotion'
// yoga-sutras-1-2: category = 'meditation'

const WITH_SANSKRIT_ID = 'bhagavad-gita-2-47';
const WITHOUT_SANSKRIT_ID = 'thirukkural-kindness';

// ─── Override the global navigation mock ────────────────────────────────────

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
    addListener: jest.fn(),
  })),
  useRoute: jest.fn(() => ({
    params: { quoteId: WITH_SANSKRIT_ID },
    key: 'WisdomDetail-test',
    name: 'WisdomDetail',
  })),
  useFocusEffect: jest.fn(),
  NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
}));

import { useRoute } from '@react-navigation/native';
const mockUseRoute = useRoute as jest.MockedFunction<typeof useRoute>;

describe('WisdomDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRoute.mockReturnValue({
      params: { quoteId: WITH_SANSKRIT_ID },
      key: 'WisdomDetail-test',
      name: 'WisdomDetail',
    } as any);
  });

  // -------------------------------------------------------------------------
  // Rendering with a valid quoteId that has all optional fields
  // -------------------------------------------------------------------------

  describe('Valid Quote Rendering (all fields)', () => {
    it('renders without crashing', () => {
      render(<WisdomDetailScreen />);
      expect(screen.getByText('Karma')).toBeTruthy();
    });

    it('displays the quote text', () => {
      render(<WisdomDetailScreen />);
      expect(
        screen.getByText(/You have the right to perform your prescribed duty/i),
      ).toBeTruthy();
    });

    it('displays the category label (Karma)', () => {
      render(<WisdomDetailScreen />);
      expect(screen.getByText('Karma')).toBeTruthy();
    });

    it('displays the Sanskrit section title when text_sanskrit is non-empty', () => {
      render(<WisdomDetailScreen />);
      // sectionTitle JSX value is "Sanskrit"; textTransform: uppercase is CSS-only
      expect(screen.getByText('Sanskrit')).toBeTruthy();
    });

    it('displays the Sanskrit text content', () => {
      render(<WisdomDetailScreen />);
      expect(screen.getByText(/कर्मण्येवाधिकारस्ते/)).toBeTruthy();
    });

    it('displays the Meaning section title', () => {
      render(<WisdomDetailScreen />);
      expect(screen.getByText('Meaning')).toBeTruthy();
    });

    it('displays the meaning content', () => {
      render(<WisdomDetailScreen />);
      expect(screen.getByText(/Nishkama Karma/i)).toBeTruthy();
    });

    it('displays the author attribution', () => {
      render(<WisdomDetailScreen />);
      expect(screen.getByText('— Lord Krishna')).toBeTruthy();
    });

    it('displays the source text', () => {
      render(<WisdomDetailScreen />);
      expect(screen.getByText('Bhagavad Gita 2:47')).toBeTruthy();
    });

    it('displays the source chapter', () => {
      render(<WisdomDetailScreen />);
      expect(screen.getByText(/Chapter 2: Sankhya Yoga/i)).toBeTruthy();
    });

    it('displays the Context section title', () => {
      render(<WisdomDetailScreen />);
      expect(screen.getByText('Context')).toBeTruthy();
    });

    it('displays context content', () => {
      render(<WisdomDetailScreen />);
      expect(screen.getByText(/Kurukshetra/i)).toBeTruthy();
    });

    it('displays the How to Apply section title', () => {
      render(<WisdomDetailScreen />);
      expect(screen.getByText('How to Apply')).toBeTruthy();
    });

    it('displays practical application content', () => {
      render(<WisdomDetailScreen />);
      expect(screen.getByText(/Focus on your efforts/i)).toBeTruthy();
    });

    it('displays the Related Topics section and tags', () => {
      render(<WisdomDetailScreen />);
      expect(screen.getByText('Related Topics')).toBeTruthy();
      expect(screen.getByText('duty')).toBeTruthy();
      expect(screen.getByText('detachment')).toBeTruthy();
    });
  });

  // -------------------------------------------------------------------------
  // Quote with empty text_sanskrit — Sanskrit section hidden
  // -------------------------------------------------------------------------

  describe('Quote with no Sanskrit text', () => {
    beforeEach(() => {
      // thirukkural-kindness has text_sanskrit: "" (falsy → section hidden)
      mockUseRoute.mockReturnValue({
        params: { quoteId: WITHOUT_SANSKRIT_ID },
        key: 'WisdomDetail-test',
        name: 'WisdomDetail',
      } as any);
    });

    it('renders the quote text', () => {
      render(<WisdomDetailScreen />);
      expect(screen.getByText(/compassion and kindness/i)).toBeTruthy();
    });

    it('does not render the Sanskrit section when text_sanskrit is empty', () => {
      render(<WisdomDetailScreen />);
      // text_sanskrit is "" which is falsy, so the conditional section is skipped
      expect(screen.queryByText('Sanskrit')).toBeNull();
    });

    it('still renders the Meaning section', () => {
      render(<WisdomDetailScreen />);
      expect(screen.getByText('Meaning')).toBeTruthy();
    });
  });

  // -------------------------------------------------------------------------
  // Invalid / missing quoteId
  // -------------------------------------------------------------------------

  describe('Invalid quoteId', () => {
    it('shows "Wisdom quote not found" for an unknown quoteId', () => {
      mockUseRoute.mockReturnValue({
        params: { quoteId: 'this-id-does-not-exist' },
        key: 'WisdomDetail-test',
        name: 'WisdomDetail',
      } as any);

      render(<WisdomDetailScreen />);
      expect(screen.getByText('Wisdom quote not found')).toBeTruthy();
    });

    it('does not render quote content when quoteId is unknown', () => {
      mockUseRoute.mockReturnValue({
        params: { quoteId: 'bogus-quote-id' },
        key: 'WisdomDetail-test',
        name: 'WisdomDetail',
      } as any);

      render(<WisdomDetailScreen />);
      expect(screen.queryByText('Meaning')).toBeNull();
      expect(screen.queryByText('Sanskrit')).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // Category display mapping
  // -------------------------------------------------------------------------

  describe('Category mapping', () => {
    const cases = [
      { quoteId: 'bhagavad-gita-12-13-14', expectedDisplay: 'Devotion' },
      { quoteId: 'yoga-sutras-1-2', expectedDisplay: 'Meditation' },
    ] as const;

    cases.forEach(({ quoteId, expectedDisplay }) => {
      it(`shows "${expectedDisplay}" for quoteId "${quoteId}"`, () => {
        mockUseRoute.mockReturnValue({
          params: { quoteId },
          key: 'WisdomDetail-test',
          name: 'WisdomDetail',
        } as any);

        render(<WisdomDetailScreen />);
        expect(screen.getByText(expectedDisplay)).toBeTruthy();
      });
    });
  });
});
