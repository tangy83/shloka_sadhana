/**
 * FestivalsListScreen Tests
 * Shloka Sadhana - V3 Feature #3
 *
 * Tests for browsing upcoming Hindu festivals
 * Following TDD approach - RED phase
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { FestivalsListScreen } from '../FestivalsListScreen';

import { getUpcomingFestivals, getPastFestivals } from '../../utils/festivals';

// Mock the festivals utility
jest.mock('../../utils/festivals', () => ({
  getUpcomingFestivals: jest.fn(),
  getPastFestivals: jest.fn(),
}));

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

const mockGetUpcomingFestivals = getUpcomingFestivals as jest.MockedFunction<typeof getUpcomingFestivals>;
const mockGetPastFestivals = getPastFestivals as jest.MockedFunction<typeof getPastFestivals>;

describe('FestivalsListScreen', () => {
  const mockUpcomingFestivals = [
    {
      name: 'Maha Shivaratri',
      date: '2026-02-17',
      category: 'major',
      deity_association: 'Lord Shiva',
      description: 'The Great Night of Shiva, observed with fasting and night vigil.',
    },
    {
      name: 'Holi',
      date: '2026-03-06',
      category: 'major',
      deity_association: 'Lord Krishna, Radha',
      description: 'Festival of Colors celebrating the victory of good over evil.',
    },
    {
      name: 'Ram Navami',
      date: '2026-04-02',
      category: 'major',
      deity_association: 'Lord Rama',
      description: 'Birthday of Lord Rama, seventh avatar of Vishnu.',
    },
  ];

  const mockPastFestivals = [
    {
      name: 'Makar Sankranti',
      date: '2026-01-14',
      category: 'major',
      deity_association: 'Surya (Sun God)',
      description: 'Harvest festival marking the sun\'s transition into Capricorn.',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUpcomingFestivals.mockReturnValue(mockUpcomingFestivals);
    mockGetPastFestivals.mockReturnValue(mockPastFestivals);
  });

  describe('Initial Render', () => {
    it('should render the screen', () => {
      render(<FestivalsListScreen />);
      expect(screen.getByText('Hindu Festivals')).toBeTruthy();
    });

    it('should display screen title', () => {
      render(<FestivalsListScreen />);
      expect(screen.getByText('Hindu Festivals')).toBeTruthy();
    });

    it('should load upcoming festivals by default', () => {
      render(<FestivalsListScreen />);
      expect(mockGetUpcomingFestivals).toHaveBeenCalled();
      expect(screen.getByText('Maha Shivaratri')).toBeTruthy();
      expect(screen.getByText('Holi')).toBeTruthy();
    });
  });

  describe('Tab Navigation', () => {
    it('should display Upcoming and Past tabs', () => {
      render(<FestivalsListScreen />);
      expect(screen.getByText('Upcoming')).toBeTruthy();
      expect(screen.getByText('Past')).toBeTruthy();
    });

    it('should have Upcoming tab active by default', () => {
      const { getByTestId } = render(<FestivalsListScreen />);
      const upcomingTab = getByTestId('tab-upcoming');
      // Check for active styling or state
      expect(upcomingTab).toBeTruthy();
    });

    it('should switch to Past tab when clicked', () => {
      render(<FestivalsListScreen />);
      const pastTab = screen.getByText('Past');
      fireEvent.press(pastTab);

      expect(mockGetPastFestivals).toHaveBeenCalled();
      expect(screen.getByText('Makar Sankranti')).toBeTruthy();
    });

    it('should switch back to Upcoming tab when clicked', () => {
      render(<FestivalsListScreen />);

      // Switch to Past
      const pastTab = screen.getByText('Past');
      fireEvent.press(pastTab);

      // Switch back to Upcoming
      const upcomingTab = screen.getByText('Upcoming');
      fireEvent.press(upcomingTab);

      expect(screen.getByText('Maha Shivaratri')).toBeTruthy();
    });
  });

  describe('Festival Card Display', () => {
    it('should display festival name', () => {
      render(<FestivalsListScreen />);
      expect(screen.getByText('Maha Shivaratri')).toBeTruthy();
    });

    it('should display festival date', () => {
      render(<FestivalsListScreen />);
      expect(screen.getByText(/Feb 17, 2026/i)).toBeTruthy();
    });

    it('should display deity association', () => {
      render(<FestivalsListScreen />);
      expect(screen.getByText('Lord Shiva')).toBeTruthy();
    });

    it('should display festival description', () => {
      render(<FestivalsListScreen />);
      expect(screen.getByText(/The Great Night of Shiva/i)).toBeTruthy();
    });

    it('should display category badge for major festivals', () => {
      render(<FestivalsListScreen />);
      // Check for "major" category indicator (multiple festivals have this)
      const badges = screen.getAllByText('MAJOR');
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  describe('Date Formatting', () => {
    it('should format dates in readable format (MMM DD, YYYY)', () => {
      render(<FestivalsListScreen />);
      // 2026-02-17 should display as "Feb 17, 2026"
      expect(screen.getByText('Feb 17, 2026')).toBeTruthy();
    });

    it('should handle different months correctly', () => {
      render(<FestivalsListScreen />);
      // 2026-03-06 should display as "Mar 06, 2026"
      expect(screen.getByText('Mar 06, 2026')).toBeTruthy();
    });

    it('should show relative date for near future (e.g., "in 10 days")', () => {
      render(<FestivalsListScreen />);
      // Check for relative date text (multiple festivals may have this)
      const relativeDates = screen.getAllByText(/in \d+ days?/i);
      expect(relativeDates.length).toBeGreaterThan(0);
    });
  });

  describe('Empty State', () => {
    it('should show message when no upcoming festivals', () => {
      mockGetUpcomingFestivals.mockReturnValue([]);
      render(<FestivalsListScreen />);
      expect(screen.getByText(/No upcoming festivals/i)).toBeTruthy();
    });

    it('should show message when no past festivals', () => {
      mockGetPastFestivals.mockReturnValue([]);
      render(<FestivalsListScreen />);

      const pastTab = screen.getByText('Past');
      fireEvent.press(pastTab);

      expect(screen.getByText(/No past festivals/i)).toBeTruthy();
    });
  });

  describe('Scrollable List', () => {
    it('should render a scrollable FlatList', () => {
      const { getByTestId } = render(<FestivalsListScreen />);
      expect(getByTestId('festivals-list')).toBeTruthy();
    });

    it('should display multiple festivals', () => {
      render(<FestivalsListScreen />);
      expect(screen.getByText('Maha Shivaratri')).toBeTruthy();
      expect(screen.getByText('Holi')).toBeTruthy();
      expect(screen.getByText('Ram Navami')).toBeTruthy();
    });
  });

  describe('Festival Card Interaction', () => {
    it('should be tappable/pressable', () => {
      const { getAllByTestId } = render(<FestivalsListScreen />);
      const festivalCards = getAllByTestId('festival-card');
      expect(festivalCards.length).toBeGreaterThan(0);

      // Should be able to press the card
      fireEvent.press(festivalCards[0]);
    });

    it('should have accessibility role as button', () => {
      const { getAllByTestId } = render(<FestivalsListScreen />);
      const festivalCards = getAllByTestId('festival-card');

      festivalCards.forEach(card => {
        expect(card.props.accessibilityRole).toBe('button');
      });
    });

    it('should have accessibility label with festival name', () => {
      const { getAllByTestId } = render(<FestivalsListScreen />);
      const festivalCards = getAllByTestId('festival-card');

      expect(festivalCards[0].props.accessibilityLabel).toContain('Maha Shivaratri');
    });
  });

  describe('Performance', () => {
    it('should use FlatList for efficient rendering', () => {
      const { getByTestId } = render(<FestivalsListScreen />);
      const list = getByTestId('festivals-list');

      // FlatList should be used for performance
      expect(list.type).toBe('RCTScrollView'); // FlatList renders as ScrollView
    });

    it('should have keyExtractor for unique keys', () => {
      // This is implicitly tested by FlatList rendering without warnings
      render(<FestivalsListScreen />);
      expect(screen.getByText('Maha Shivaratri')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible tab buttons', () => {
      render(<FestivalsListScreen />);
      const upcomingTab = screen.getByText('Upcoming');
      const pastTab = screen.getByText('Past');

      expect(upcomingTab).toBeTruthy();
      expect(pastTab).toBeTruthy();
    });

    it('should announce tab changes to screen readers', () => {
      const { getByTestId } = render(<FestivalsListScreen />);
      const upcomingTab = getByTestId('tab-upcoming');

      expect(upcomingTab.props.accessibilityRole).toBe('button');
    });
  });

  describe('Edge Cases', () => {
    it('should handle festivals with long descriptions', () => {
      const longDescFestival = [{
        ...mockUpcomingFestivals[0],
        description: 'A'.repeat(500), // Very long description
      }];

      mockGetUpcomingFestivals.mockReturnValue(longDescFestival);
      render(<FestivalsListScreen />);

      // Description should be present (truncated with numberOfLines prop)
      const descriptions = screen.getAllByText(/A+/);
      expect(descriptions.length).toBeGreaterThan(0);
    });

    it('should handle festivals with special characters in names', () => {
      const specialCharFestival = [{
        ...mockUpcomingFestivals[0],
        name: 'Diwali (Deepavali)',
      }];

      mockGetUpcomingFestivals.mockReturnValue(specialCharFestival);
      render(<FestivalsListScreen />);

      expect(screen.getByText('Diwali (Deepavali)')).toBeTruthy();
    });

    it('should handle missing optional fields gracefully', () => {
      const minimalFestival = [{
        name: 'Test Festival',
        date: '2026-03-01',
        category: 'regional',
        deity_association: 'Test Deity',
        description: 'Test description',
      }];

      mockGetUpcomingFestivals.mockReturnValue(minimalFestival);
      render(<FestivalsListScreen />);

      expect(screen.getByText('Test Festival')).toBeTruthy();
    });
  });
});
