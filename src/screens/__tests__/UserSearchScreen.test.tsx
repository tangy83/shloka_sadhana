/**
 * UserSearchScreen Tests
 * Shloka Sadhana - Phase 2A Friend System
 *
 * Tests for the User Search screen: search input, debounced query,
 * store interactions, results rendering, and profile navigation.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import { UserSearchScreen } from '../UserSearchScreen';
import { useSocialStore } from '@/stores/useSocialStore';
import { useNavigation } from '@react-navigation/native';

// ─── Mock navigation ─────────────────────────────────────────────────────────

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
    addListener: jest.fn(),
  })),
  useFocusEffect: jest.fn(),
  NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
}));

// ─── Mock social store ────────────────────────────────────────────────────────

jest.mock('@/stores/useSocialStore');

// ─── Mock analytics service ───────────────────────────────────────────────────

jest.mock('@/services/analytics', () => ({
  analyticsService: {
    trackEvent: jest.fn(),
    trackScreen: jest.fn(),
  },
}));

// ─── Typed helpers ────────────────────────────────────────────────────────────

const mockUseSocialStore = useSocialStore as jest.MockedFunction<typeof useSocialStore>;
const mockUseNavigation = useNavigation as jest.MockedFunction<typeof useNavigation>;

/** Create a FriendSearchResult-compatible object for testing */
const makeFriendResult = (overrides: {
  id?: string;
  displayName?: string;
  currentStreak?: number;
  totalPractices?: number;
  favoriteDeity?: string;
} = {}) => ({
  profile: {
    id: overrides.id ?? 'user-1',
    displayName: overrides.displayName ?? 'Test User',
    currentStreak: overrides.currentStreak ?? 5,
    totalPractices: overrides.totalPractices ?? 20,
    favoriteDeity: overrides.favoriteDeity ?? 'Ganesha',
    photoURL: null,
  },
  friendshipStatus: 'none' as const,
  requestId: null,
});

/** Build a default store mock with optional overrides */
const buildStoreMock = (overrides: Record<string, unknown> = {}) => ({
  searchResults: [] as ReturnType<typeof makeFriendResult>[],
  searchLoading: false,
  searchUsers: jest.fn(() => Promise.resolve()),
  clearSearch: jest.fn(),
  sendFriendRequest: jest.fn(() => Promise.resolve()),
  friends: [],
  friendsLoading: false,
  incomingRequests: [],
  outgoingRequests: [],
  requestsLoading: false,
  stats: { friendCount: 0, incomingRequestCount: 0, outgoingRequestCount: 0 },
  userProfile: null,
  lastSyncedAt: null,
  loadFriends: jest.fn(() => Promise.resolve()),
  refreshFriends: jest.fn(() => Promise.resolve()),
  removeFriend: jest.fn(() => Promise.resolve()),
  loadRequests: jest.fn(() => Promise.resolve()),
  acceptFriendRequest: jest.fn(() => Promise.resolve()),
  declineFriendRequest: jest.fn(() => Promise.resolve()),
  cancelFriendRequest: jest.fn(() => Promise.resolve()),
  loadSocialStats: jest.fn(() => Promise.resolve()),
  createOrUpdateProfile: jest.fn(() => Promise.resolve()),
  loadUserProfile: jest.fn(() => Promise.resolve()),
  syncToCloud: jest.fn(() => Promise.resolve()),
  loadFromCloud: jest.fn(() => Promise.resolve()),
  ...overrides,
});

describe('UserSearchScreen', () => {
  let mockNavigate: jest.Mock;
  let mockGoBack: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockNavigate = jest.fn();
    mockGoBack = jest.fn();

    mockUseNavigation.mockReturnValue({
      navigate: mockNavigate,
      goBack: mockGoBack,
      setOptions: jest.fn(),
      addListener: jest.fn(),
    } as any);

    mockUseSocialStore.mockReturnValue(buildStoreMock() as any);
  });

  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------

  describe('Initial Render', () => {
    it('renders without crashing', () => {
      render(<UserSearchScreen />);
      expect(screen.getByText('Find Friends')).toBeTruthy();
    });

    it('renders the search input', () => {
      render(<UserSearchScreen />);
      expect(screen.getByLabelText('Search for users')).toBeTruthy();
    });

    it('shows the empty-state prompt when query is empty', () => {
      render(<UserSearchScreen />);
      expect(screen.getByText('Search for friends')).toBeTruthy();
    });

    it('renders the back button', () => {
      render(<UserSearchScreen />);
      expect(screen.getByLabelText('Go back')).toBeTruthy();
    });
  });

  // -------------------------------------------------------------------------
  // Search behaviour
  // -------------------------------------------------------------------------

  describe('Search Behaviour', () => {
    it('does not call searchUsers when query is empty', async () => {
      const searchUsers = jest.fn(() => Promise.resolve());
      mockUseSocialStore.mockReturnValue(buildStoreMock({ searchUsers }) as any);

      render(<UserSearchScreen />);
      await act(async () => {
        await new Promise(r => setTimeout(r, 350));
      });

      expect(searchUsers).not.toHaveBeenCalled();
    });

    it('calls clearSearch when query is fewer than 2 characters', async () => {
      const clearSearch = jest.fn();
      mockUseSocialStore.mockReturnValue(buildStoreMock({ clearSearch }) as any);

      render(<UserSearchScreen />);
      fireEvent.changeText(screen.getByLabelText('Search for users'), 'a');

      await act(async () => {
        await new Promise(r => setTimeout(r, 350));
      });

      expect(clearSearch).toHaveBeenCalled();
    });

    it('shows "Keep typing..." hint when query is 1 character', async () => {
      render(<UserSearchScreen />);
      fireEvent.changeText(screen.getByLabelText('Search for users'), 'a');

      await waitFor(() => {
        expect(screen.getByText('Keep typing...')).toBeTruthy();
      });
    });

    it('calls searchUsers with the query after debounce', async () => {
      const searchUsers = jest.fn(() => Promise.resolve());
      mockUseSocialStore.mockReturnValue(buildStoreMock({ searchUsers }) as any);

      render(<UserSearchScreen />);
      fireEvent.changeText(screen.getByLabelText('Search for users'), 'Arjun');

      await act(async () => {
        await new Promise(r => setTimeout(r, 350));
      });

      expect(searchUsers).toHaveBeenCalledWith('Arjun');
    });

    it('shows a loading indicator while searchLoading is true', () => {
      mockUseSocialStore.mockReturnValue(buildStoreMock({ searchLoading: true }) as any);

      render(<UserSearchScreen />);
      fireEvent.changeText(screen.getByLabelText('Search for users'), 'Arjun');

      expect(screen.getByText('Searching...')).toBeTruthy();
    });

    it('clears the input when the clear button is pressed', async () => {
      render(<UserSearchScreen />);
      const input = screen.getByLabelText('Search for users');

      fireEvent.changeText(input, 'Rama');

      await waitFor(() => {
        expect(screen.getByLabelText('Clear search')).toBeTruthy();
      });

      fireEvent.press(screen.getByLabelText('Clear search'));

      await waitFor(() => {
        expect(screen.getByText('Search for friends')).toBeTruthy();
      });
    });
  });

  // -------------------------------------------------------------------------
  // Results display
  // -------------------------------------------------------------------------

  describe('Results Display', () => {
    it('renders search results returned by the store', async () => {
      const results = [
        makeFriendResult({ id: 'user-1', displayName: 'Arjun Sharma' }),
        makeFriendResult({ id: 'user-2', displayName: 'Priya Patel' }),
      ];

      mockUseSocialStore.mockReturnValue(buildStoreMock({ searchResults: results }) as any);

      render(<UserSearchScreen />);
      fireEvent.changeText(screen.getByLabelText('Search for users'), 'Arjun');

      await waitFor(() => {
        expect(screen.getByText('Arjun Sharma')).toBeTruthy();
        expect(screen.getByText('Priya Patel')).toBeTruthy();
      });
    });

    it('shows "No users found" when results are empty and query is long enough', async () => {
      mockUseSocialStore.mockReturnValue(
        buildStoreMock({ searchResults: [], searchLoading: false }) as any,
      );

      render(<UserSearchScreen />);
      fireEvent.changeText(screen.getByLabelText('Search for users'), 'Nonexistent');

      await waitFor(() => {
        expect(screen.getByText('No users found')).toBeTruthy();
      });
    });

    it('displays streak and practice stats for a result', async () => {
      const results = [
        makeFriendResult({ id: 'user-1', displayName: 'Test User', currentStreak: 7, totalPractices: 42 }),
      ];
      mockUseSocialStore.mockReturnValue(buildStoreMock({ searchResults: results }) as any);

      render(<UserSearchScreen />);
      fireEvent.changeText(screen.getByLabelText('Search for users'), 'Test');

      await waitFor(() => {
        expect(screen.getByText(/7 day streak/i)).toBeTruthy();
        expect(screen.getByText(/42 practices/i)).toBeTruthy();
      });
    });
  });

  // -------------------------------------------------------------------------
  // Navigation from results
  // -------------------------------------------------------------------------

  describe('Navigation', () => {
    it('navigates to UserProfile when a result is tapped', async () => {
      const results = [makeFriendResult({ id: 'user-99', displayName: 'Radha Krishna' })];
      mockUseSocialStore.mockReturnValue(buildStoreMock({ searchResults: results }) as any);

      render(<UserSearchScreen />);
      fireEvent.changeText(screen.getByLabelText('Search for users'), 'Radha');

      await waitFor(() => {
        expect(screen.getByText('Radha Krishna')).toBeTruthy();
      });

      fireEvent.press(screen.getByLabelText("View Radha Krishna's profile"));
      expect(mockNavigate).toHaveBeenCalledWith('UserProfile', { userId: 'user-99' });
    });

    it('calls goBack when back button is pressed', () => {
      render(<UserSearchScreen />);
      fireEvent.press(screen.getByLabelText('Go back'));
      expect(mockGoBack).toHaveBeenCalledTimes(1);
    });
  });
});
