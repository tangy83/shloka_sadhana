/**
 * ShlokaDetailScreen Tests
 * Shloka Sadhana - Shloka Detail Screen
 *
 * Tests for displaying full shloka content with navigation
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { ShlokaDetailScreen } from '../ShlokaDetailScreen';

import { getShlokaById } from '../../data/shlokas';
import { isFavorite } from '../../utils/favorites';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockRoute = {
  params: {
    shlokaId: 'test-shloka',
  },
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
  useRoute: () => mockRoute,
}));

// Mock the shlokas data
jest.mock('../../data/shlokas', () => ({
  getShlokaById: jest.fn(),
}));

// Mock the favorites service
jest.mock('../../utils/favorites', () => ({
  isFavorite: jest.fn(),
  addFavorite: jest.fn(),
  removeFavorite: jest.fn(),
}));

const mockGetShlokaById = getShlokaById as jest.MockedFunction<typeof getShlokaById>;
const mockIsFavorite = isFavorite as jest.MockedFunction<typeof isFavorite>;

describe('ShlokaDetailScreen', () => {
  const mockShloka = {
    id: 'test-shloka',
    name: 'Test Mantra',
    shortName: 'Test',
    deity: 'Test Deity',
    description: 'Test description of the mantra',
    benefits: 'Test benefits of chanting',
    duration: '5 minutes',
    bestTime: 'Morning',
    youtubeUrl: 'https://www.youtube.com/watch?v=test123',
    sections: [
      {
        id: 1,
        sanskrit: 'ॐ तेस्ट मन्त्र',
        transliteration: 'Om Test Mantra',
        meaning: 'Om, this is a test mantra',
      },
      {
        id: 2,
        sanskrit: 'दूसरा भाग',
        transliteration: 'Dūsarā Bhāga',
        meaning: 'This is the second part',
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetShlokaById.mockReturnValue(mockShloka);
    mockIsFavorite.mockResolvedValue(false); // Default: not favorited
  });

  describe('Initial Render', () => {
    it('should render the screen', () => {
      render(<ShlokaDetailScreen />);
      expect(screen.getByText('Test Mantra')).toBeTruthy();
    });

    it('should load shloka using route params', () => {
      render(<ShlokaDetailScreen />);
      expect(mockGetShlokaById).toHaveBeenCalledWith('test-shloka');
    });

    it('should display shloka name', () => {
      render(<ShlokaDetailScreen />);
      expect(screen.getByText('Test Mantra')).toBeTruthy();
    });

    it('should display deity', () => {
      render(<ShlokaDetailScreen />);
      expect(screen.getByText('Test Deity')).toBeTruthy();
    });
  });

  describe('Shloka Content Display', () => {
    it('should display description', () => {
      render(<ShlokaDetailScreen />);
      expect(screen.getByText('Test description of the mantra')).toBeTruthy();
    });

    it('should display benefits', () => {
      render(<ShlokaDetailScreen />);
      expect(screen.getByText('Test benefits of chanting')).toBeTruthy();
    });

    it('should display duration', () => {
      render(<ShlokaDetailScreen />);
      expect(screen.getByText(/5 minutes/)).toBeTruthy();
    });

    it('should display best time', () => {
      render(<ShlokaDetailScreen />);
      expect(screen.getByText(/Morning/)).toBeTruthy();
    });
  });

  describe('Section Display', () => {
    it('should display all sections', () => {
      render(<ShlokaDetailScreen />);
      expect(screen.getByText('ॐ तेस्ट मन्त्र')).toBeTruthy();
      expect(screen.getByText('दूसरा भाग')).toBeTruthy();
    });

    it('should display Sanskrit text', () => {
      render(<ShlokaDetailScreen />);
      expect(screen.getByText('ॐ तेस्ट मन्त्र')).toBeTruthy();
    });

    it('should display transliteration', () => {
      render(<ShlokaDetailScreen />);
      expect(screen.getByText('Om Test Mantra')).toBeTruthy();
    });

    it('should display meaning', () => {
      render(<ShlokaDetailScreen />);
      expect(screen.getByText('Om, this is a test mantra')).toBeTruthy();
    });

    it('should display multiple sections', () => {
      render(<ShlokaDetailScreen />);
      expect(screen.getByText('Om Test Mantra')).toBeTruthy();
      expect(screen.getByText('Dūsarā Bhāga')).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent shloka', () => {
      mockGetShlokaById.mockReturnValue(undefined);
      render(<ShlokaDetailScreen />);
      expect(screen.getByText(/not found/i)).toBeTruthy();
    });

    it('should show error message for invalid ID', () => {
      mockGetShlokaById.mockReturnValue(undefined);
      render(<ShlokaDetailScreen />);
      expect(screen.getByText(/not found/i)).toBeTruthy();
    });
  });

  describe('Scrollable Content', () => {
    it('should render scrollable view', () => {
      const { getByTestId } = render(<ShlokaDetailScreen />);
      expect(getByTestId('shloka-detail-scroll')).toBeTruthy();
    });
  });

  describe('YouTube Link', () => {
    it('should display YouTube link button', () => {
      render(<ShlokaDetailScreen />);
      expect(screen.getByText('Watch on YouTube')).toBeTruthy();
    });

    it('should have accessible label for YouTube button', () => {
      render(<ShlokaDetailScreen />);
      expect(screen.getByLabelText('Watch Test Mantra on YouTube')).toBeTruthy();
    });

    it('should display YouTube icon or indicator', () => {
      render(<ShlokaDetailScreen />);
      const button = screen.getByTestId('youtube-button');
      expect(button).toBeTruthy();
    });
  });

  describe('Favorites Feature', () => {
    it('should display favorite button', () => {
      render(<ShlokaDetailScreen />);
      expect(screen.getByTestId('favorite-button')).toBeTruthy();
    });

    it('should show unfilled heart when not favorited', () => {
      render(<ShlokaDetailScreen />);
      screen.getByTestId('favorite-button');
      expect(screen.getByText('🤍')).toBeTruthy();
    });

    it('should show filled heart when favorited', async () => {
      render(<ShlokaDetailScreen />);
      const button = screen.getByTestId('favorite-button');

      // Toggle favorite
      fireEvent.press(button);

      // Wait for state update
      await waitFor(() => {
        expect(screen.getByText('❤️')).toBeTruthy();
      });
    });

    it('should have accessible label for favorite button', () => {
      render(<ShlokaDetailScreen />);
      expect(screen.getByLabelText('Toggle favorite for Test Mantra')).toBeTruthy();
    });

    it('should toggle favorite state on press', async () => {
      render(<ShlokaDetailScreen />);
      const button = screen.getByTestId('favorite-button');

      // Initially unfavorited
      expect(screen.getByText('🤍')).toBeTruthy();

      // Press to favorite
      fireEvent.press(button);

      await waitFor(() => {
        expect(screen.getByText('❤️')).toBeTruthy();
      });

      // Press to unfavorite
      fireEvent.press(button);

      await waitFor(() => {
        expect(screen.getByText('🤍')).toBeTruthy();
      });
    });
  });

  describe('Start Practice Feature', () => {
    it('should display Start Practice button', () => {
      render(<ShlokaDetailScreen />);
      expect(screen.getByTestId('start-practice-button')).toBeTruthy();
    });

    it('should have Start Practice button text', () => {
      render(<ShlokaDetailScreen />);
      expect(screen.getByText('Start Practice')).toBeTruthy();
    });

    it('should have accessible label for Start Practice button', () => {
      render(<ShlokaDetailScreen />);
      expect(screen.getByLabelText('Start practice session with Test Mantra')).toBeTruthy();
    });

    it('should navigate to Practice screen on press', () => {
      render(<ShlokaDetailScreen />);
      const button = screen.getByTestId('start-practice-button');

      fireEvent.press(button);

      expect(mockNavigate).toHaveBeenCalledWith('Practice', {
        shlokaId: 'test-shloka',
        shlokaName: 'Test Mantra',
      });
    });

    it('should pass correct shlokaId when navigating', () => {
      render(<ShlokaDetailScreen />);
      const button = screen.getByTestId('start-practice-button');

      fireEvent.press(button);

      expect(mockNavigate).toHaveBeenCalledWith(
        'Practice',
        expect.objectContaining({
          shlokaId: 'test-shloka',
        })
      );
    });

    it('should pass shlokaName for display', () => {
      render(<ShlokaDetailScreen />);
      const button = screen.getByTestId('start-practice-button');

      fireEvent.press(button);

      expect(mockNavigate).toHaveBeenCalledWith(
        'Practice',
        expect.objectContaining({
          shlokaName: 'Test Mantra',
        })
      );
    });
  });
});
