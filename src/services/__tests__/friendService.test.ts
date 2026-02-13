/**
 * Friend Service Unit Tests
 * Shloka Sadhana - Phase 2A Week 16
 *
 * Tests for friend search, requests, and relationship management
 */

import { friendService } from '../friendService';
import { FriendRequestStatus } from '@/types/social';
import type { UserProfile } from '@/types/social';

// Mock Firestore
const mockFirestore = {
  collection: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    get: jest.fn(() => Promise.resolve({ docs: [] })),
    doc: jest.fn((id: string) => ({
      get: jest.fn(() => Promise.resolve({ exists: true, data: () => ({}) })),
      set: jest.fn(() => Promise.resolve()),
      update: jest.fn(() => Promise.resolve()),
      delete: jest.fn(() => Promise.resolve()),
    })),
  })),
};

jest.mock('@react-native-firebase/firestore', () => ({
  __esModule: true,
  default: jest.fn(() => mockFirestore),
}));

// Mock auth
jest.mock('@react-native-firebase/auth', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    currentUser: { uid: 'test-user-123' },
  })),
}));

describe('friendService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('searchUsers', () => {
    it('should search users by display name', async () => {
      const mockUsers: UserProfile[] = [
        {
          id: 'user-1',
          displayName: 'Priya Sharma',
          photoURL: null,
          currentStreak: 15,
          totalPractices: 50,
          totalMinutes: 500,
          favoriteDeity: 'Shiva',
          privacySettings: {
            showStreak: true,
            showPractices: true,
            allowFriendRequests: true,
          },
          updatedAt: new Date(),
        },
        {
          id: 'user-2',
          displayName: 'Priyanka Verma',
          photoURL: null,
          currentStreak: 7,
          totalPractices: 20,
          totalMinutes: 200,
          favoriteDeity: 'Vishnu',
          privacySettings: {
            showStreak: true,
            showPractices: true,
            allowFriendRequests: true,
          },
          updatedAt: new Date(),
        },
      ];

      mockFirestore.collection().get = jest.fn(() =>
        Promise.resolve({
          docs: mockUsers.map((user) => ({
            data: () => user,
          })),
        })
      );

      const results = await friendService.searchUsers('Priya', 'test-user-123');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].displayName).toContain('Priya');
    });

    it('should filter out current user from search results', async () => {
      const mockUsers: UserProfile[] = [
        {
          id: 'test-user-123', // Current user
          displayName: 'Current User',
          photoURL: null,
          currentStreak: 10,
          totalPractices: 30,
          totalMinutes: 300,
          favoriteDeity: 'Ganesha',
          privacySettings: {
            showStreak: true,
            showPractices: true,
            allowFriendRequests: true,
          },
          updatedAt: new Date(),
        },
        {
          id: 'user-1',
          displayName: 'Other User',
          photoURL: null,
          currentStreak: 5,
          totalPractices: 10,
          totalMinutes: 100,
          favoriteDeity: 'Shiva',
          privacySettings: {
            showStreak: true,
            showPractices: true,
            allowFriendRequests: true,
          },
          updatedAt: new Date(),
        },
      ];

      mockFirestore.collection().get = jest.fn(() =>
        Promise.resolve({
          docs: mockUsers.map((user) => ({
            data: () => user,
          })),
        })
      );

      const results = await friendService.searchUsers('User', 'test-user-123');

      const containsCurrentUser = results.some((u) => u.id === 'test-user-123');
      expect(containsCurrentUser).toBe(false);
    });

    it('should limit search results to 20', async () => {
      const limitSpy = jest.spyOn(mockFirestore.collection(), 'limit');

      await friendService.searchUsers('test', 'test-user-123');

      expect(limitSpy).toHaveBeenCalledWith(20);
    });
  });

  describe('sendFriendRequest', () => {
    it('should create a friend request document', async () => {
      const setSpy = jest.fn(() => Promise.resolve());
      mockFirestore.collection().doc().set = setSpy;

      await friendService.sendFriendRequest('test-user-123', 'friend-user-456');

      expect(setSpy).toHaveBeenCalled();
      const requestData = setSpy.mock.calls[0][0];

      expect(requestData.fromUserId).toBe('test-user-123');
      expect(requestData.toUserId).toBe('friend-user-456');
      expect(requestData.status).toBe(FriendRequestStatus.PENDING);
      expect(requestData.createdAt).toBeDefined();
    });

    it('should throw error if request already exists', async () => {
      mockFirestore.collection().get = jest.fn(() =>
        Promise.resolve({
          docs: [{ data: () => ({ status: FriendRequestStatus.PENDING }) }],
        })
      );

      await expect(
        friendService.sendFriendRequest('test-user-123', 'friend-user-456')
      ).rejects.toThrow('Friend request already exists');
    });

    it('should prevent sending request to self', async () => {
      await expect(
        friendService.sendFriendRequest('test-user-123', 'test-user-123')
      ).rejects.toThrow('Cannot send friend request to yourself');
    });
  });

  describe('acceptFriendRequest', () => {
    it('should update request status to ACCEPTED', async () => {
      const updateSpy = jest.fn(() => Promise.resolve());
      mockFirestore.collection().doc().update = updateSpy;

      await friendService.acceptFriendRequest('request-123');

      expect(updateSpy).toHaveBeenCalled();
      const updateData = updateSpy.mock.calls[0][0];

      expect(updateData.status).toBe(FriendRequestStatus.ACCEPTED);
      expect(updateData.respondedAt).toBeDefined();
    });

    it('should create bidirectional friendship', async () => {
      const setSpy = jest.fn(() => Promise.resolve());
      mockFirestore.collection().doc().set = setSpy;

      mockFirestore.collection().doc().get = jest.fn(() =>
        Promise.resolve({
          exists: true,
          data: () => ({
            fromUserId: 'user-1',
            toUserId: 'user-2',
          }),
        })
      );

      await friendService.acceptFriendRequest('request-123');

      expect(setSpy).toHaveBeenCalled();
      const friendshipData = setSpy.mock.calls[0][0];

      expect(friendshipData.users).toContain('user-1');
      expect(friendshipData.users).toContain('user-2');
      expect(friendshipData.status).toBe('active');
    });

    it('should sort friendship users alphabetically', async () => {
      const setSpy = jest.fn(() => Promise.resolve());
      mockFirestore.collection().doc().set = setSpy;

      mockFirestore.collection().doc().get = jest.fn(() =>
        Promise.resolve({
          exists: true,
          data: () => ({
            fromUserId: 'user-zzz',
            toUserId: 'user-aaa',
          }),
        })
      );

      await friendService.acceptFriendRequest('request-123');

      const friendshipData = setSpy.mock.calls[0][0];
      expect(friendshipData.users[0]).toBe('user-aaa');
      expect(friendshipData.users[1]).toBe('user-zzz');
    });
  });

  describe('declineFriendRequest', () => {
    it('should update request status to REJECTED', async () => {
      const updateSpy = jest.fn(() => Promise.resolve());
      mockFirestore.collection().doc().update = updateSpy;

      await friendService.declineFriendRequest('request-123');

      expect(updateSpy).toHaveBeenCalled();
      const updateData = updateSpy.mock.calls[0][0];

      expect(updateData.status).toBe(FriendRequestStatus.REJECTED);
      expect(updateData.respondedAt).toBeDefined();
    });

    it('should NOT create friendship when declined', async () => {
      const setSpy = jest.fn(() => Promise.resolve());
      mockFirestore.collection().doc().set = setSpy;

      await friendService.declineFriendRequest('request-123');

      // setSpy should only be called once for the update, not for friendship creation
      const friendshipCalls = setSpy.mock.calls.filter(
        (call) => call[0].users !== undefined
      );
      expect(friendshipCalls.length).toBe(0);
    });
  });

  describe('removeFriend', () => {
    it('should delete friendship document', async () => {
      const deleteSpy = jest.fn(() => Promise.resolve());
      mockFirestore.collection().doc().delete = deleteSpy;

      mockFirestore.collection().get = jest.fn(() =>
        Promise.resolve({
          docs: [
            {
              id: 'friendship-123',
              data: () => ({ users: ['user-1', 'user-2'] }),
            },
          ],
        })
      );

      await friendService.removeFriend('user-1', 'user-2');

      expect(deleteSpy).toHaveBeenCalled();
    });

    it('should throw error if friendship not found', async () => {
      mockFirestore.collection().get = jest.fn(() =>
        Promise.resolve({ docs: [] })
      );

      await expect(
        friendService.removeFriend('user-1', 'user-2')
      ).rejects.toThrow('Friendship not found');
    });
  });

  describe('getFriends', () => {
    it('should return list of friends for user', async () => {
      const mockFriendships = [
        {
          id: 'friendship-1',
          data: () => ({
            users: ['test-user-123', 'friend-1'],
            status: 'active',
            createdAt: new Date(),
          }),
        },
        {
          id: 'friendship-2',
          data: () => ({
            users: ['test-user-123', 'friend-2'],
            status: 'active',
            createdAt: new Date(),
          }),
        },
      ];

      mockFirestore.collection().get = jest.fn(() =>
        Promise.resolve({ docs: mockFriendships })
      );

      const friends = await friendService.getFriends('test-user-123');

      expect(friends.length).toBe(2);
      expect(friends).toContain('friend-1');
      expect(friends).toContain('friend-2');
    });

    it('should return empty array if no friends', async () => {
      mockFirestore.collection().get = jest.fn(() =>
        Promise.resolve({ docs: [] })
      );

      const friends = await friendService.getFriends('test-user-123');

      expect(friends).toEqual([]);
    });
  });
});
