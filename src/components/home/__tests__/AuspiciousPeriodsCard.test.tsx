/**
 * AuspiciousPeriodsCard Component Tests
 * Shloka Sadhana - Home screen
 *
 * Unit tests for the Auspicious Periods (Choghadiya) component.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import { AuspiciousPeriodsCard } from '../AuspiciousPeriodsCard';
import * as locationUtils from '@/utils/location';
import * as muhuratUtils from '@/utils/muhurat';

jest.mock('@/utils/location');
// Keep the real formatTo12Hour; mock only the data-producing functions.
jest.mock('@/utils/muhurat', () => ({
  ...jest.requireActual('@/utils/muhurat'),
  getMuhuratForDate: jest.fn(),
  getAuspiciousPeriods: jest.fn(),
}));

const mockGetUserLocation = locationUtils.getUserLocation as jest.MockedFunction<typeof locationUtils.getUserLocation>;
const mockGetDefaultLocation = locationUtils.getDefaultLocation as jest.MockedFunction<typeof locationUtils.getDefaultLocation>;
const mockGetMuhuratForDate = muhuratUtils.getMuhuratForDate as jest.MockedFunction<typeof muhuratUtils.getMuhuratForDate>;
const mockGetAuspiciousPeriods = muhuratUtils.getAuspiciousPeriods as jest.MockedFunction<typeof muhuratUtils.getAuspiciousPeriods>;

describe('AuspiciousPeriodsCard', () => {
  const mockLocation = {
    latitude: 28.6139,
    longitude: 77.209,
    timezone: 'Asia/Kolkata',
    city: 'Delhi, India',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserLocation.mockResolvedValue(mockLocation);
    mockGetDefaultLocation.mockReturnValue(mockLocation);
    mockGetMuhuratForDate.mockReturnValue({} as never);
    mockGetAuspiciousPeriods.mockReturnValue({
      date: '2026-08-08',
      auspiciousPeriods: [
        { start: '11:45', end: '12:33' },
        { start: '15:00', end: '16:30' },
      ],
      inauspiciousPeriods: [{ start: '09:00', end: '10:30' }],
    });
  });

  it('renders the devotional title', async () => {
    render(<AuspiciousPeriodsCard />);
    await waitFor(() => {
      expect(screen.getByText('Choghadiya — Auspicious Periods')).toBeTruthy();
    });
  });

  it('shows the auspicious periods section with formatted 12h times', async () => {
    render(<AuspiciousPeriodsCard />);
    await waitFor(() => {
      expect(screen.getByText('Auspicious Periods')).toBeTruthy();
      expect(screen.getByText(/11:45 AM - 12:33 PM/)).toBeTruthy();
    });
  });

  it('renders an empty state when there are no auspicious periods', async () => {
    mockGetAuspiciousPeriods.mockReturnValue({
      date: '2026-08-08',
      auspiciousPeriods: [],
      inauspiciousPeriods: [],
    });
    render(<AuspiciousPeriodsCard />);
    await waitFor(() => {
      expect(screen.getByText('No auspicious periods today')).toBeTruthy();
    });
  });
});
