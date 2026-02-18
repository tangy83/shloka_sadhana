/**
 * Friend System Integration Tests
 * Shloka Sadhana - Phase 2A Week 16
 *
 * End-to-end tests for friend search, requests, and friendship lifecycle
 */

import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { FriendsScreen } from '@/screens/FriendsScreen';
import { UserSearchScreen } from '@/screens/UserSearchScreen';
import { friendService } from '@/services/friendService';
import { useSocialStore } from '@/stores/useSocialStore';
import { FriendRequestStatus } from '@/types/social';

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
};

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => mockNavigation,
  useRoute: () => ({ params: {} }),
}));

// Mock Firebase
jest.mock('@react-native-firebase/firestore', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        set: jest.fn(),
        get: jest.fn(() =>
          Promise.resolve({
            exists: true,
            data: () => ({}),
          })
        ),
        update: jest.fn(),
      })),
      where: jest.fn().mockReturnThis(),
      get: jest.fn(() => Promise.resolve({ docs: [] })),
    })),
  })),
}));

jest.mock('@react-native-firebase/auth', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    currentUser: { uid: 'test-user-123' },
  })),
}));

describe('Friend System Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSocialStore.setState({
      friends: [],
      friendRequests: [],
    });
  });

  it('should search for users by name', async () => {
    const mockUsers = [
      {
        id: 'user-1',
        displayName: 'Priya Sharma',
        currentStreak: 15,
        totalPractices: 50,
      },
      {
        id: 'user-2',
        displayName: 'Priyanka Verma',
        currentStreak: 7,
        totalPractices: 20,
      },
    ];

    jest.spyOn(friendService, 'searchUsers').mockResolvedValue(mockUsers as any);

    const { getByPlaceholderText, getByText } = render(
      <NavigationContainer>
        <UserSearchScreen />
      </NavigationContainer>
    );

    const searchInput = getByPlaceholderText(/Search by name/i);
    fireEvent.changeText(searchInput, 'Priya');

    await waitFor(() => {
      expect(getByText('Priya Sharma')).toBeTruthy();
      expect(getByText('Priyanka Verma')).toBeTruthy();
    });
  });

  it('should send friend request', async () => {
    const mockUser = {
      id: 'user-1',
      displayName: 'Priya Sharma',
      currentStreak: 15,
      totalPractices: 50,
    };

    jest.spyOn(friendService, 'searchUsers').mockResolvedValue([mockUser] as any);
    jest.spyOn(friendService, 'sendFriendRequest').mockResolvedValue(undefined);

    const { getByPlaceholderText, getByText } = render(
      <NavigationContainer>
        <UserSearchScreen />
      </NavigationContainer>
    );

    // Search for user
    fireEvent.changeText(getByPlaceholderText(/Search by name/i), 'Priya');

    await waitFor(() => {
      expect(getByText('Priya Sharma')).toBeTruthy();
    });

    // Send friend request
    const addButton = getByText(/Add Friend/i);
    fireEvent.press(addButton);

    await waitFor(() => {
      expect(friendService.sendFriendRequest).toHaveBeenCalledWith(
        'test-user-123',
        'user-1'
      );
    });
  });

  it('should accept friend request and create friendship', async () => {
    const mockRequest = {
      id: 'request-1',
      fromUserId: 'user-1',
      toUserId: 'test-user-123',
      status: FriendRequestStatus.PENDING,
      createdAt: new Date(),
      fromUser: {
        displayName: 'Priya Sharma',
        currentStreak: 15,
      },
    };

    useSocialStore.setState({
      friendRequests: [mockRequest as any],
    });

    jest.spyOn(friendService, 'acceptFriendRequest').mockResolvedValue(undefined);

    const { getByText } = render(
      <NavigationContainer>
        <FriendsScreen />
      </NavigationContainer>
    );

    // Navigate to Requests tab
    const requestsTab = getByText(/Requests/i);
    fireEvent.press(requestsTab);

    await waitFor(() => {
      expect(getByText('Priya Sharma')).toBeTruthy();
    });

    // Accept request
    const acceptButton = getByText(/Accept/i);
    fireEvent.press(acceptButton);

    await waitFor(() => {
      expect(friendService.acceptFriendRequest).toHaveBeenCalledWith('request-1');
    });
  });

  it('should decline friend request', async () => {
    const mockRequest = {
      id: 'request-1',
      fromUserId: 'user-1',
      toUserId: 'test-user-123',
      status: FriendRequestStatus.PENDING,
      createdAt: new Date(),
      fromUser: {
        displayName: 'Priya Sharma',
        currentStreak: 15,
      },
    };

    useSocialStore.setState({
      friendRequests: [mockRequest as any],
    });

    jest.spyOn(friendService, 'declineFriendRequest').mockResolvedValue(undefined);

    const { getByText } = render(
      <NavigationContainer>
        <FriendsScreen />
      </NavigationContainer>
    );

    // Navigate to Requests tab
    fireEvent.press(getByText(/Requests/i));

    // Decline request
    const declineButton = getByText(/Decline/i);
    fireEvent.press(declineButton);

    await waitFor(() => {
      expect(friendService.declineFriendRequest).toHaveBeenCalledWith('request-1');
    });
  });

  it('should display friends list with current streaks', async () => {
    const mockFriends = [
      {
        id: 'user-1',
        displayName: 'Priya Sharma',
        currentStreak: 15,
        totalPractices: 50,
      },
      {
        id: 'user-2',
        displayName: 'Raj Kumar',
        currentStreak: 30,
        totalPractices: 100,
      },
    ];

    useSocialStore.setState({
      friends: mockFriends as any,
    });

    const { getByText } = render(
      <NavigationContainer>
        <FriendsScreen />
      </NavigationContainer>
    );

    await waitFor(() => {
      expect(getByText('Priya Sharma')).toBeTruthy();
      expect(getByText('Raj Kumar')).toBeTruthy();
      expect(getByText(/15 day streak/i)).toBeTruthy();
      expect(getByText(/30 day streak/i)).toBeTruthy();
    });
  });

  it('should remove friend with confirmation', async () => {
    const mockFriend = {
      id: 'user-1',
      displayName: 'Priya Sharma',
      currentStreak: 15,
      totalPractices: 50,
    };

    useSocialStore.setState({
      friends: [mockFriend as any],
    });

    jest.spyOn(friendService, 'removeFriend').mockResolvedValue(undefined);

    const { getByText } = render(
      <NavigationContainer>
        <FriendsScreen />
      </NavigationContainer>
    );

    await waitFor(() => {
      expect(getByText('Priya Sharma')).toBeTruthy();
    });

    // Long press to show remove option
    const friendItem = getByText('Priya Sharma');
    fireEvent(friendItem, 'longPress');

    // Confirm removal
    const removeButton = getByText(/Remove Friend/i);
    fireEvent.press(removeButton);

    const confirmButton = getByText(/Confirm/i);
    fireEvent.press(confirmButton);

    await waitFor(() => {
      expect(friendService.removeFriend).toHaveBeenCalledWith(
        'test-user-123',
        'user-1'
      );
    });
  });

  it('should prevent duplicate friend requests', async () => {
    const mockUser = {
      id: 'user-1',
      displayName: 'Priya Sharma',
      currentStreak: 15,
      totalPractices: 50,
    };

    jest.spyOn(friendService, 'searchUsers').mockResolvedValue([mockUser] as any);
    jest
      .spyOn(friendService, 'sendFriendRequest')
      .mockRejectedValue(new Error('Friend request already exists'));

    const { getByPlaceholderText, getByText } = render(
      <NavigationContainer>
        <UserSearchScreen />
      </NavigationContainer>
    );

    fireEvent.changeText(getByPlaceholderText(/Search by name/i), 'Priya');

    await waitFor(() => {
      expect(getByText('Priya Sharma')).toBeTruthy();
    });

    const addButton = getByText(/Add Friend/i);
    fireEvent.press(addButton);

    await waitFor(() => {
      expect(getByText(/already exists/i)).toBeTruthy();
    });
  });

  it('should navigate to friend profile when tapped', async () => {
    const mockFriend = {
      id: 'user-1',
      displayName: 'Priya Sharma',
      currentStreak: 15,
      totalPractices: 50,
    };

    useSocialStore.setState({
      friends: [mockFriend as any],
    });

    const { getByText } = render(
      <NavigationContainer>
        <FriendsScreen />
      </NavigationContainer>
    );

    await waitFor(() => {
      expect(getByText('Priya Sharma')).toBeTruthy();
    });

    fireEvent.press(getByText('Priya Sharma'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('UserProfile', {
      userId: 'user-1',
    });
  });
});
