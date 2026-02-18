/**
 * ActivityFeed Component Tests
 * Tests loading, rendering, empty/error states, and pull-to-refresh
 */

import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { ActivityFeed } from '../ActivityFeed';
import { ActivityFeedItem as ActivityFeedItemType } from '@/types/activityFeed';

// ─── Mock sub-components and dependencies ─────────────────────────────────────

jest.mock('../ActivityFeedItem', () => ({
  ActivityFeedItem: ({
    activity,
  }: {
    activity: ActivityFeedItemType;
    onReactionChange: () => void;
  }) => {
    const { Text } = require('react-native');
    return <Text testID={`activity-item-${activity.id}`}>{activity.userDisplayName}</Text>;
  },
}));

const mockGetActivityFeed = jest.fn();
const mockOnActivityFeedChange = jest.fn();

jest.mock('@/services/activityService', () => ({
  activityService: {
    getActivityFeed: jest.fn((...args: unknown[]) => mockGetActivityFeed(...args)),
    onActivityFeedChange: jest.fn((...args: unknown[]) => mockOnActivityFeedChange(...args)),
  },
}));

jest.mock('@/services/analytics', () => ({
  analyticsService: {
    trackEvent: jest.fn(),
  },
}));

// ─── Mock constants that use Layout.spacing and Colors.text ──────────────────

jest.mock('@/constants/Colors', () => ({
  Colors: {
    primary: '#E87E04',
    text: {
      primary: '#E8D5B7',
      secondary: 'rgba(232, 213, 183, 0.7)',
    },
  },
}));

jest.mock('@/constants/Layout', () => ({
  Layout: {
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
      xxxl: 64,
    },
  },
}));

// ─── Test data ────────────────────────────────────────────────────────────────

const MOCK_ACTIVITY: ActivityFeedItemType = {
  id: 'act-1',
  userId: 'user-1',
  userDisplayName: 'Priya Sharma',
  userPhotoURL: null,
  type: 'practice',
  metadata: { shlokaName: 'Gayatri Mantra', duration: 600, malaCount: 108 },
  createdAt: '2026-02-17T08:00:00.000Z',
  reactions: {},
  fromFriendId: 'user-1',
  isFriend: true,
};

const MOCK_ACTIVITIES: ActivityFeedItemType[] = [
  MOCK_ACTIVITY,
  {
    ...MOCK_ACTIVITY,
    id: 'act-2',
    userId: 'user-2',
    userDisplayName: 'Rahul Kumar',
    type: 'achievement',
    metadata: { achievementName: 'First Week', xpEarned: 100 },
  },
];

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ActivityFeed', () => {
  beforeEach(() => {
    mockGetActivityFeed.mockResolvedValue([]);
    // Default: real-time listener returns a no-op unsubscribe
    mockOnActivityFeedChange.mockReturnValue(jest.fn());
  });

  describe('Loading state', () => {
    it('shows loading indicator while fetching activities', () => {
      // Keep the promise pending so loading stays visible
      mockGetActivityFeed.mockReturnValue(new Promise(() => {}));

      const { getByText } = render(<ActivityFeed />);
      expect(getByText('Loading activities...')).toBeTruthy();
    });

    it('hides loading indicator after activities are fetched', async () => {
      mockGetActivityFeed.mockResolvedValue([]);

      const { queryByText } = render(<ActivityFeed />);
      await waitFor(() => {
        expect(queryByText('Loading activities...')).toBeNull();
      });
    });
  });

  describe('Empty state', () => {
    it('shows empty state when no activities are returned', async () => {
      mockGetActivityFeed.mockResolvedValue([]);

      const { getByText } = render(<ActivityFeed />);
      await waitFor(() => {
        expect(getByText('No activities yet')).toBeTruthy();
      });
    });

    it('shows descriptive empty state message', async () => {
      mockGetActivityFeed.mockResolvedValue([]);

      const { getByText } = render(<ActivityFeed />);
      await waitFor(() => {
        expect(getByText(/When your friends practice/)).toBeTruthy();
      });
    });
  });

  describe('Activities rendering', () => {
    it('renders activity items after loading', async () => {
      mockGetActivityFeed.mockResolvedValue(MOCK_ACTIVITIES);

      const { getByTestId } = render(<ActivityFeed />);
      await waitFor(() => {
        expect(getByTestId('activity-item-act-1')).toBeTruthy();
        expect(getByTestId('activity-item-act-2')).toBeTruthy();
      });
    });

    it('passes correct activity data to ActivityFeedItem', async () => {
      mockGetActivityFeed.mockResolvedValue([MOCK_ACTIVITY]);

      const { getByText } = render(<ActivityFeed />);
      await waitFor(() => {
        expect(getByText('Priya Sharma')).toBeTruthy();
      });
    });

    it('calls getActivityFeed with the limit prop', async () => {
      render(<ActivityFeed limit={20} />);
      await waitFor(() => {
        expect(mockGetActivityFeed).toHaveBeenCalledWith({ limit: 20 });
      });
    });

    it('uses default limit of 50 when not provided', async () => {
      render(<ActivityFeed />);
      await waitFor(() => {
        expect(mockGetActivityFeed).toHaveBeenCalledWith({ limit: 50 });
      });
    });
  });

  describe('Error state', () => {
    it('shows error state when API call fails', async () => {
      mockGetActivityFeed.mockRejectedValue(new Error('Network error'));

      const { getByText } = render(<ActivityFeed />);
      await waitFor(() => {
        expect(getByText('Oops!')).toBeTruthy();
        expect(getByText('Failed to load activity feed. Please try again.')).toBeTruthy();
      });
    });

    it('does not show loading indicator after error', async () => {
      mockGetActivityFeed.mockRejectedValue(new Error('Network error'));

      const { queryByText } = render(<ActivityFeed />);
      await waitFor(() => {
        expect(queryByText('Loading activities...')).toBeNull();
      });
    });
  });

  describe('Real-time updates', () => {
    it('subscribes to real-time feed when enableRealtime=true (default)', async () => {
      mockGetActivityFeed.mockResolvedValue([]);

      render(<ActivityFeed enableRealtime={true} />);
      await waitFor(() => {
        expect(mockOnActivityFeedChange).toHaveBeenCalled();
      });
    });

    it('does not subscribe when enableRealtime=false', async () => {
      mockGetActivityFeed.mockResolvedValue([]);

      render(<ActivityFeed enableRealtime={false} />);
      await waitFor(() => {
        expect(mockGetActivityFeed).toHaveBeenCalled();
      });
      expect(mockOnActivityFeedChange).not.toHaveBeenCalled();
    });

    it('calls the unsubscribe function on unmount', async () => {
      const mockUnsubscribe = jest.fn();
      mockOnActivityFeedChange.mockReturnValue(mockUnsubscribe);
      mockGetActivityFeed.mockResolvedValue([]);

      const { unmount } = render(<ActivityFeed enableRealtime={true} />);
      await waitFor(() => {
        expect(mockOnActivityFeedChange).toHaveBeenCalled();
      });

      unmount();
      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('updates activities when real-time listener fires', async () => {
      let capturedCallback: ((activities: ActivityFeedItemType[]) => void) | null = null;
      mockOnActivityFeedChange.mockImplementation(
        (callback: (activities: ActivityFeedItemType[]) => void) => {
          capturedCallback = callback;
          return jest.fn();
        }
      );
      mockGetActivityFeed.mockResolvedValue([]);

      const { getByTestId, queryByText } = render(<ActivityFeed enableRealtime={true} />);
      await waitFor(() => {
        expect(queryByText('No activities yet')).toBeTruthy();
      });

      // Fire real-time update
      await act(async () => {
        if (capturedCallback) capturedCallback(MOCK_ACTIVITIES);
      });

      await waitFor(() => {
        expect(getByTestId('activity-item-act-1')).toBeTruthy();
      });
    });
  });

  describe('Analytics', () => {
    it('tracks activity_feed_viewed event on mount', async () => {
      const { analyticsService } = require('@/services/analytics');
      mockGetActivityFeed.mockResolvedValue([]);

      render(<ActivityFeed />);
      await waitFor(() => {
        expect(analyticsService.trackEvent).toHaveBeenCalledWith('activity_feed_viewed');
      });
    });
  });
});
