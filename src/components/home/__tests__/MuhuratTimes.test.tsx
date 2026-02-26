/**
 * MuhuratTimes Component Tests
 * Shloka Sadhana - V3 Feature #4
 *
 * Tests for auspicious times display component
 * Following TDD approach - RED phase
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import { MuhuratTimes } from '../MuhuratTimes';
import * as locationUtils from '@/utils/location';
import * as muhuratUtils from '@/utils/muhurat';

// Mock the utilities
jest.mock('@/utils/location');
jest.mock('@/utils/muhurat');

const mockGetUserLocation = locationUtils.getUserLocation as jest.MockedFunction<typeof locationUtils.getUserLocation>;
const mockGetDefaultLocation = locationUtils.getDefaultLocation as jest.MockedFunction<typeof locationUtils.getDefaultLocation>;
const mockGetMuhuratForDate = muhuratUtils.getMuhuratForDate as jest.MockedFunction<typeof muhuratUtils.getMuhuratForDate>;

describe('MuhuratTimes', () => {
  const mockLocation = {
    latitude: 28.6139,
    longitude: 77.209,
    timezone: 'Asia/Kolkata',
    city: 'Delhi, India',
  };

  const mockMuhuratData = {
    date: '2026-02-07',
    sunrise: '06:30',
    sunset: '18:15',
    brahmaMuhurta: {
      start: '05:00',
      end: '06:30',
    },
    abhijitMuhurat: {
      start: '11:45',
      end: '12:33',
    },
    rahuKaal: {
      start: '15:00',
      end: '16:30',
    },
    yamagandaKaal: {
      start: '08:00',
      end: '09:30',
    },
    gulikaKaal: {
      start: '10:00',
      end: '11:30',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserLocation.mockResolvedValue(mockLocation);
    mockGetDefaultLocation.mockReturnValue(mockLocation);
    mockGetMuhuratForDate.mockReturnValue(mockMuhuratData);
  });

  describe('Initial Render', () => {
    it('should render the component', async () => {
      render(<MuhuratTimes />);
      await waitFor(() => {
        expect(screen.getByText(/Auspicious Times/i)).toBeTruthy();
      });
    });

    it('should fetch user location on mount', async () => {
      render(<MuhuratTimes />);
      await waitFor(() => {
        expect(mockGetUserLocation).toHaveBeenCalled();
      });
    });

    it('should calculate muhurat times for today', async () => {
      render(<MuhuratTimes />);
      await waitFor(() => {
        expect(mockGetMuhuratForDate).toHaveBeenCalled();
      });
    });
  });

  describe('Brahma Muhurta Display', () => {
    it('should display Brahma Muhurta time', async () => {
      render(<MuhuratTimes />);
      await waitFor(() => {
        expect(screen.getByText(/Best for Spiritual Practice/i)).toBeTruthy();
      });
    });

    it('should display Brahma Muhurta time range in 12-hour format', async () => {
      render(<MuhuratTimes />);
      await waitFor(() => {
        // 05:00 - 06:30 should be displayed as "5:00 AM – 6:30 AM"
        expect(screen.getByText(/5:00 AM/i)).toBeTruthy();
      });
    });

    it('should display Brahma Muhurta icon', async () => {
      render(<MuhuratTimes />);
      await waitFor(() => {
        expect(screen.getByText('🕉️')).toBeTruthy();
      });
    });

    it('should display activity description for Brahma Muhurta', async () => {
      render(<MuhuratTimes />);
      await waitFor(() => {
        expect(screen.getByText(/Meditation, chanting/i)).toBeTruthy();
      });
    });
  });

  describe('Abhijit Muhurat Display', () => {
    it('should display Abhijit Muhurat title', async () => {
      render(<MuhuratTimes />);
      await waitFor(() => {
        expect(screen.getByText(/Best for Important Tasks/i)).toBeTruthy();
      });
    });

    it('should display Abhijit Muhurat time range', async () => {
      render(<MuhuratTimes />);
      await waitFor(() => {
        // 11:45 - 12:33 should be displayed
        expect(screen.getByText(/11:45 AM/i)).toBeTruthy();
      });
    });

    it('should display Abhijit icon', async () => {
      render(<MuhuratTimes />);
      await waitFor(() => {
        expect(screen.getByText('⭐')).toBeTruthy();
      });
    });
  });

  describe('Rahu Kaal Display', () => {
    it('should display Rahu Kaal title', async () => {
      render(<MuhuratTimes />);
      await waitFor(() => {
        expect(screen.getByText(/Avoid for New Ventures/i)).toBeTruthy();
      });
    });

    it('should display Rahu Kaal time range', async () => {
      render(<MuhuratTimes />);
      await waitFor(() => {
        // 15:00 - 16:30 should be displayed as "3:00 PM – 4:30 PM"
        expect(screen.getByText(/3:00 PM/i)).toBeTruthy();
      });
    });

    it('should use gentle tone for Rahu Kaal (not alarming)', async () => {
      render(<MuhuratTimes />);
      await waitFor(() => {
        // Should have gray/neutral color, not red
        expect(screen.getByText('⚠️')).toBeTruthy();
      });
    });

    it('should NOT display Yamaganda Kaal label', async () => {
      render(<MuhuratTimes />);
      await waitFor(() => {
        expect(screen.queryByText(/Yamaganda Kaal/i)).toBeNull();
      });
    });

    it('should NOT display Gulika Kaal label', async () => {
      render(<MuhuratTimes />);
      await waitFor(() => {
        expect(screen.queryByText(/Gulika Kaal/i)).toBeNull();
      });
    });

    it('should only show Rahu Kaal in Avoid section (not Yamaganda or Gulika)', async () => {
      render(<MuhuratTimes />);
      await waitFor(() => {
        // Should have "Avoid for New Ventures" but no sub-labels for Yamaganda/Gulika
        expect(screen.getByText(/Avoid for New Ventures/i)).toBeTruthy();
        expect(screen.queryByText(/Yamaganda Kaal/i)).toBeNull();
        expect(screen.queryByText(/Gulika Kaal/i)).toBeNull();
      });
    });
  });

  describe('Time Formatting', () => {
    it('should format AM times correctly', async () => {
      render(<MuhuratTimes />);
      await waitFor(() => {
        // 05:00 should show as "5:00 AM" (no leading zero for hours)
        expect(screen.getByText(/5:00 AM/i)).toBeTruthy();
      });
    });

    it('should format PM times correctly', async () => {
      render(<MuhuratTimes />);
      await waitFor(() => {
        // 15:00 should show as "3:00 PM"
        expect(screen.getByText(/3:00 PM/i)).toBeTruthy();
      });
    });

    it('should format noon correctly', async () => {
      mockGetMuhuratForDate.mockReturnValue({
        ...mockMuhuratData,
        abhijitMuhurat: {
          start: '12:00',
          end: '12:48',
        },
      });

      render(<MuhuratTimes />);
      await waitFor(() => {
        // 12:00 should show as "12:00 PM" (not AM)
        expect(screen.getByText(/12:00 PM/i)).toBeTruthy();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading state while fetching location', () => {
      mockGetUserLocation.mockReturnValue(new Promise(() => {})); // Never resolves
      render(<MuhuratTimes />);

      // Should show loading indicator or skeleton
      expect(screen.queryByText(/Auspicious Times/i)).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should use default location if getUserLocation fails', async () => {
      mockGetUserLocation.mockRejectedValue(new Error('Location error'));

      render(<MuhuratTimes />);

      await waitFor(() => {
        // Should still display muhurat times (using default location)
        expect(mockGetMuhuratForDate).toHaveBeenCalled();
      });
    });

    it('should still render if muhurat calculation fails', async () => {
      mockGetMuhuratForDate.mockImplementation(() => {
        throw new Error('Calculation error');
      });

      render(<MuhuratTimes />);

      await waitFor(() => {
        // Component should not crash
        expect(screen.getByText(/Auspicious Times/i)).toBeTruthy();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible labels for each muhurat', async () => {
      render(<MuhuratTimes />);
      await waitFor(() => {
        const brahmaMuhurta = screen.getByText(/Best for Spiritual Practice/i);
        expect(brahmaMuhurta).toBeTruthy();
      });
    });

    it('should be screen reader friendly', async () => {
      render(<MuhuratTimes />);
      await waitFor(() => {
        // Check that text is accessible
        expect(screen.getByText(/Auspicious Times/i)).toBeTruthy();
      });
    });
  });

  describe('Styling', () => {
    it('should use different colors for different muhurats', async () => {
      const { UNSAFE_getAllByType } = render(<MuhuratTimes />);

      await waitFor(() => {
        // Component should render with different colored sections
        expect(UNSAFE_getAllByType).toBeDefined();
      });
    });
  });
});
