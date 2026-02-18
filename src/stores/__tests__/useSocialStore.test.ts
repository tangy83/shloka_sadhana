/**
 * Social Store Tests
 * Tests for friend requests, search, profile management, and state transitions
 */

import { useSocialStore } from '@/stores/useSocialStore';
import { friendService } from '@/services/friendService';

jest.mock('@/services/friendService');

const mockFriendService = friendService as jest.Mocked<typeof friendService>;

const MOCK_USER = { uid: 'test-uid', email: 'test@example.com' };
const MOCK_FRIEND: any = {
  userId: 'friend-uid-1',
  displayName: 'Priya Sharma',
  currentStreak: 5,
  totalPractices: 30,
  friendedAt: '2026-01-15T10:00:00.000Z',
};
const MOCK_INCOMING_REQUEST: any = {
  id: 'req-1',
  fromUserId: 'user-2',
  fromDisplayName: 'Raj Kumar',
  toUserId: 'test-uid',
  status: 'pending',
  createdAt: '2026-02-10T10:00:00.000Z',
};
const MOCK_OUTGOING_REQUEST: any = {
  id: 'req-2',
  fromUserId: 'test-uid',
  toUserId: 'user-3',
  toDisplayName: 'Meera Devi',
  status: 'pending',
  createdAt: '2026-02-12T10:00:00.000Z',
};

// Mock Firebase auth to return a user
jest.mock('@react-native-firebase/auth', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    currentUser: MOCK_USER,
  })),
}));

function resetSocialStore() {
  useSocialStore.setState({
    friends: [],
    friendsLoading: false,
    incomingRequests: [],
    outgoingRequests: [],
    requestsLoading: false,
    stats: { friendCount: 0, pendingRequests: 0, sentRequests: 0 },
    searchResults: [],
    searchLoading: false,
    userProfile: null,
    lastSyncedAt: null,
  });
}

describe('useSocialStore — loadFriends', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetSocialStore();
  });

  it('should load friends from service and update state', async () => {
    mockFriendService.getFriends.mockResolvedValue([MOCK_FRIEND]);

    await useSocialStore.getState().loadFriends();

    const { friends } = useSocialStore.getState();
    expect(friends).toHaveLength(1);
    expect(friends[0].userId).toBe('friend-uid-1');
  });

  it('should handle empty friends list', async () => {
    mockFriendService.getFriends.mockResolvedValue([]);

    await useSocialStore.getState().loadFriends();

    expect(useSocialStore.getState().friends).toHaveLength(0);
  });

  it('should handle service errors and re-throw', async () => {
    mockFriendService.getFriends.mockRejectedValue(new Error('Network error'));

    await expect(useSocialStore.getState().loadFriends()).rejects.toThrow('Network error');
  });
});

describe('useSocialStore — Friend Requests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetSocialStore();
    mockFriendService.sendFriendRequest.mockResolvedValue(MOCK_OUTGOING_REQUEST);
    mockFriendService.acceptFriendRequest.mockResolvedValue(undefined);
    mockFriendService.declineFriendRequest.mockResolvedValue(undefined);
    mockFriendService.cancelFriendRequest.mockResolvedValue(undefined);
  });

  it('should send friend request and add to outgoingRequests', async () => {
    mockFriendService.getIncomingRequests.mockResolvedValue([]);
    mockFriendService.getOutgoingRequests.mockResolvedValue([MOCK_OUTGOING_REQUEST]);

    await useSocialStore.getState().sendFriendRequest('user-3');

    expect(mockFriendService.sendFriendRequest).toHaveBeenCalledWith('test-uid', 'user-3');
  });

  it('should accept incoming request and move to friends', async () => {
    useSocialStore.setState({ incomingRequests: [MOCK_INCOMING_REQUEST] });
    mockFriendService.acceptFriendRequest.mockResolvedValue(undefined);
    mockFriendService.getFriends.mockResolvedValue([MOCK_FRIEND]);
    mockFriendService.getIncomingRequests.mockResolvedValue([]);
    mockFriendService.getOutgoingRequests.mockResolvedValue([]);

    await useSocialStore.getState().acceptFriendRequest('req-1');

    expect(mockFriendService.acceptFriendRequest).toHaveBeenCalledWith('req-1', 'test-uid');
  });

  it('should decline incoming request', async () => {
    useSocialStore.setState({ incomingRequests: [MOCK_INCOMING_REQUEST] });

    await useSocialStore.getState().declineFriendRequest('req-1');

    expect(mockFriendService.declineFriendRequest).toHaveBeenCalledWith('req-1', 'test-uid');
    // Request should be removed from incomingRequests
    expect(useSocialStore.getState().incomingRequests).toHaveLength(0);
  });

  it('should cancel outgoing request', async () => {
    useSocialStore.setState({ outgoingRequests: [MOCK_OUTGOING_REQUEST] });

    await useSocialStore.getState().cancelFriendRequest('req-2');

    expect(mockFriendService.cancelFriendRequest).toHaveBeenCalledWith('req-2', 'test-uid');
    // Request should be removed from outgoingRequests
    expect(useSocialStore.getState().outgoingRequests).toHaveLength(0);
  });
});

describe('useSocialStore — searchUsers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetSocialStore();
  });

  it('should search and populate searchResults', async () => {
    const mockResults = [
      { userId: 'user-a', displayName: 'Anjali Shah', currentStreak: 3 },
      { userId: 'user-b', displayName: 'Anand Rao', currentStreak: 7 },
    ];
    mockFriendService.searchUsers.mockResolvedValue(mockResults as any);

    await useSocialStore.getState().searchUsers('Anj');

    const { searchResults } = useSocialStore.getState();
    expect(searchResults).toHaveLength(2);
    expect(searchResults[0].userId).toBe('user-a');
  });

  it('should clear searchResults for empty query', async () => {
    useSocialStore.setState({ searchResults: [{ userId: 'x' } as any] });

    useSocialStore.getState().clearSearch();

    expect(useSocialStore.getState().searchResults).toHaveLength(0);
  });

  it('should handle search errors and re-throw', async () => {
    mockFriendService.searchUsers.mockRejectedValue(new Error('Firestore error'));

    await expect(useSocialStore.getState().searchUsers('query')).rejects.toThrow('Firestore error');
  });
});

describe('useSocialStore — removeFriend', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetSocialStore();
    mockFriendService.removeFriend.mockResolvedValue(undefined);
  });

  it('should remove friend from the friends list', async () => {
    useSocialStore.setState({ friends: [MOCK_FRIEND] });

    await useSocialStore.getState().removeFriend('friend-uid-1');

    expect(mockFriendService.removeFriend).toHaveBeenCalled();
    expect(useSocialStore.getState().friends).toHaveLength(0);
  });

  it('should handle removing non-existent friend gracefully', async () => {
    useSocialStore.setState({ friends: [] });

    await expect(useSocialStore.getState().removeFriend('non-existent')).resolves.not.toThrow();
  });
});
