/**
 * SatsangScreen Tests
 * Shloka Sadhana - Satsang (Community) Screen
 *
 * Tests for community and social features
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { SatsangScreen } from '../SatsangScreen';

describe('SatsangScreen', () => {
  describe('Initial Render', () => {
    it('should render the screen', () => {
      render(<SatsangScreen />);
      expect(screen.getByText('Satsang')).toBeTruthy();
    });

    it('should display screen title', () => {
      render(<SatsangScreen />);
      expect(screen.getByText('Satsang')).toBeTruthy();
    });

    it('should display subtitle', () => {
      render(<SatsangScreen />);
      expect(screen.getByText(/Spiritual Community/i)).toBeTruthy();
    });
  });

  describe('Community Features', () => {
    it('should display community section', () => {
      render(<SatsangScreen />);
      expect(screen.getByText(/Global Practitioners/i)).toBeTruthy();
    });

    it('should display total practitioners count', () => {
      render(<SatsangScreen />);
      const countElements = screen.queryAllByTestId('practitioners-count');
      expect(countElements.length).toBeGreaterThan(0);
    });
  });

  describe('Upcoming Events', () => {
    it('should display events section', () => {
      render(<SatsangScreen />);
      expect(screen.getByText(/Upcoming Events/i)).toBeTruthy();
    });

    it('should display event cards', () => {
      render(<SatsangScreen />);
      const events = screen.queryAllByTestId('event-card');
      expect(events.length).toBeGreaterThan(0);
    });

    it('should display event titles', () => {
      render(<SatsangScreen />);
      const eventTitles = screen.queryAllByTestId('event-title');
      expect(eventTitles.length).toBeGreaterThan(0);
    });

    it('should display event dates', () => {
      render(<SatsangScreen />);
      const eventDates = screen.queryAllByTestId('event-date');
      expect(eventDates.length).toBeGreaterThan(0);
    });

    it('should display event types', () => {
      render(<SatsangScreen />);
      const eventTypes = screen.queryAllByTestId('event-type');
      expect(eventTypes.length).toBeGreaterThan(0);
    });
  });

  // Removed: Spiritual Calendar section no longer exists

  describe('Scrollable Content', () => {
    it('should render scrollable view', () => {
      const { getByTestId } = render(<SatsangScreen />);
      expect(getByTestId('satsang-scroll')).toBeTruthy();
    });
  });
});
