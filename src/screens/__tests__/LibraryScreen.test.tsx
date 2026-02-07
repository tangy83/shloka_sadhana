/**
 * LibraryScreen Tests
 * Shloka Sadhana - Library Screen
 *
 * Tests for browsing shlokas
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { LibraryScreen } from '../LibraryScreen';

import { getAllShlokas } from '../../data/shlokas';

// Mock the shlokas data
jest.mock('../../data/shlokas', () => ({
  getAllShlokas: jest.fn(),
}));

const mockGetAllShlokas = getAllShlokas as jest.MockedFunction<typeof getAllShlokas>;

describe('LibraryScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock data for tests
    mockGetAllShlokas.mockReturnValue([
      {
        id: 'test-1',
        name: 'Test Mantra 1',
        shortName: 'Test 1',
        deity: 'Test Deity 1',
        description: 'Test description 1',
        benefits: 'Test benefits 1',
        duration: '5 minutes',
        bestTime: 'Morning',
        youtubeUrl: 'https://www.youtube.com/watch?v=test1',
        sections: [
          {
            id: 1,
            sanskrit: 'Test Sanskrit 1',
            transliteration: 'Test Transliteration 1',
            meaning: 'Test Meaning 1',
          },
        ],
      },
      {
        id: 'test-2',
        name: 'Test Mantra 2',
        shortName: 'Test 2',
        deity: 'Test Deity 2',
        description: 'Test description 2',
        benefits: 'Test benefits 2',
        duration: '10 minutes',
        bestTime: 'Evening',
        youtubeUrl: 'https://www.youtube.com/watch?v=test2',
        sections: [
          {
            id: 1,
            sanskrit: 'Test Sanskrit 2',
            transliteration: 'Test Transliteration 2',
            meaning: 'Test Meaning 2',
          },
        ],
      },
    ]);
  });

  describe('Initial Render', () => {
    it('should render the screen', () => {
      render(<LibraryScreen />);
      expect(screen.getByText('Library')).toBeTruthy();
    });

    it('should display screen title', () => {
      render(<LibraryScreen />);
      expect(screen.getByText('Library')).toBeTruthy();
    });

    it('should load and display shlokas', () => {
      render(<LibraryScreen />);
      expect(mockGetAllShlokas).toHaveBeenCalled();
      expect(screen.getByText('Test Mantra 1')).toBeTruthy();
      expect(screen.getByText('Test Mantra 2')).toBeTruthy();
    });
  });

  describe('Shloka Card Display', () => {
    it('should display shloka name', () => {
      render(<LibraryScreen />);
      expect(screen.getByText('Test Mantra 1')).toBeTruthy();
    });

    it('should display deity', () => {
      render(<LibraryScreen />);
      expect(screen.getByText('Test Deity 1')).toBeTruthy();
    });

    it('should display duration', () => {
      render(<LibraryScreen />);
      expect(screen.getByText(/5 minutes/)).toBeTruthy();
    });

    it('should display description', () => {
      render(<LibraryScreen />);
      expect(screen.getByText('Test description 1')).toBeTruthy();
    });
  });

  describe('Empty State', () => {
    it('should show message when no shlokas available', () => {
      mockGetAllShlokas.mockReturnValue([]);
      render(<LibraryScreen />);
      expect(screen.getByText(/No shlokas/i)).toBeTruthy();
    });
  });

  describe('Scrollable List', () => {
    it('should render a scrollable list', () => {
      const { getByTestId } = render(<LibraryScreen />);
      expect(getByTestId('shloka-list')).toBeTruthy();
    });

    it('should display multiple shlokas', () => {
      render(<LibraryScreen />);
      const shloka1 = screen.getByText('Test Mantra 1');
      const shloka2 = screen.getByText('Test Mantra 2');
      expect(shloka1).toBeTruthy();
      expect(shloka2).toBeTruthy();
    });
  });
});
