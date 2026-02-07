/**
 * WisdomScreen Tests
 * Shloka Sadhana - Wisdom Screen
 *
 * Tests for displaying daily spiritual wisdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { WisdomScreen } from '../WisdomScreen';

describe('WisdomScreen', () => {
  describe('Initial Render', () => {
    it('should render the screen', () => {
      render(<WisdomScreen />);
      expect(screen.getByText('Daily Spiritual Teachings')).toBeTruthy();
    });

    it('should display screen title', () => {
      render(<WisdomScreen />);
      expect(screen.getAllByText('Wisdom').length).toBeGreaterThan(0);
    });

    it('should display subtitle', () => {
      render(<WisdomScreen />);
      expect(screen.getByText(/Daily Spiritual Teachings/i)).toBeTruthy();
    });
  });

  describe('Quote Display', () => {
    it('should display a quote', () => {
      render(<WisdomScreen />);
      const quoteElements = screen.queryAllByTestId('wisdom-quote');
      expect(quoteElements.length).toBeGreaterThan(0);
    });

    it('should display quote text', () => {
      render(<WisdomScreen />);
      const quoteTexts = screen.queryAllByTestId('quote-text');
      expect(quoteTexts.length).toBeGreaterThan(0);
      expect(quoteTexts[0]).toBeTruthy();
    });

    it('should display quote author', () => {
      render(<WisdomScreen />);
      const authors = screen.queryAllByTestId('quote-author');
      expect(authors.length).toBeGreaterThan(0);
      expect(authors[0]).toBeTruthy();
    });

    it('should display quote source', () => {
      render(<WisdomScreen />);
      const sources = screen.queryAllByTestId('quote-source');
      expect(sources.length).toBeGreaterThan(0);
      expect(sources[0]).toBeTruthy();
    });
  });

  describe('Content Sections', () => {
    it('should display multiple wisdom quotes', () => {
      render(<WisdomScreen />);
      const quotes = screen.queryAllByTestId('wisdom-quote');
      expect(quotes.length).toBeGreaterThanOrEqual(3);
    });

    it('should render scrollable content', () => {
      const { getByTestId } = render(<WisdomScreen />);
      expect(getByTestId('wisdom-scroll')).toBeTruthy();
    });
  });

  describe('Quote Categories', () => {
    it('should display category tag', () => {
      render(<WisdomScreen />);
      const categories = screen.queryAllByTestId('quote-category');
      expect(categories.length).toBeGreaterThan(0);
    });
  });
});
