/**
 * Group Service Unit Tests
 * Shloka Sadhana - Phase 2A Week 17
 *
 * Tests for group creation, joining, invitations, and stats
 */

import { groupService } from '../groupService';
import { GroupPrivacy, GroupMemberRole } from '@/types/groups';
import type { Group } from '@/types/groups';

// Mock Firestore
const mockFirestore = {
  collection: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    get: jest.fn(() => Promise.resolve({ docs: [] })),
    doc: jest.fn((id: string) => ({
      get: jest.fn(() => Promise.resolve({ exists: true, data: () => ({}) })),
      set: jest.fn(() => Promise.resolve()),
      update: jest.fn(() => Promise.resolve()),
      delete: jest.fn(() => Promise.resolve()),
      collection: jest.fn(() => ({
        doc: jest.fn(() => ({
          set: jest.fn(() => Promise.resolve()),
          get: jest.fn(() => Promise.resolve({ exists: true, data: () => ({}) })),
        })),
        get: jest.fn(() => Promise.resolve({ docs: [] })),
      })),
    })),
  })),
  FieldValue: {
    increment: jest.fn((value) => value),
    arrayUnion: jest.fn((value) => value),
  },
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

describe('groupService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createGroup', () => {
    it('should create a new group with correct structure', async () => {
      const setSpy = jest.fn(() => Promise.resolve());
      mockFirestore.collection().doc().set = setSpy;

      const groupData = {
        name: 'Daily Devotees',
        description: 'Practice together every day',
        privacy: GroupPrivacy.PUBLIC,
      };

      const groupId = await groupService.createGroup(
        'test-user-123',
        groupData.name,
        groupData.description,
        groupData.privacy
      );

      expect(setSpy).toHaveBeenCalled();
      const createdGroup = setSpy.mock.calls[0][0];

      expect(createdGroup.name).toBe('Daily Devotees');
      expect(createdGroup.description).toBe('Practice together every day');
      expect(createdGroup.privacy).toBe(GroupPrivacy.PUBLIC);
      expect(createdGroup.createdBy).toBe('test-user-123');
      expect(createdGroup.memberCount).toBe(1);
      expect(createdGroup.stats).toEqual({
        totalPractices: 0,
        totalMalas: 0,
        totalMinutes: 0,
      });
      expect(groupId).toBeDefined();
    });

    it('should add creator as admin member', async () => {
      const memberSetSpy = jest.fn(() => Promise.resolve());
      mockFirestore.collection().doc().collection().doc().set = memberSetSpy;

      await groupService.createGroup(
        'test-user-123',
        'Test Group',
        'Description',
        GroupPrivacy.PRIVATE
      );

      expect(memberSetSpy).toHaveBeenCalled();
      const memberData = memberSetSpy.mock.calls[0][0];

      expect(memberData.role).toBe(GroupMemberRole.ADMIN);
      expect(memberData.isActive).toBe(true);
      expect(memberData.stats).toEqual({
        practices: 0,
        malas: 0,
        minutes: 0,
      });
    });
  });

  describe('joinGroup', () => {
    it('should add user as member to public group', async () => {
      mockFirestore.collection().doc().get = jest.fn(() =>
        Promise.resolve({
          exists: true,
          data: () => ({
            privacy: GroupPrivacy.PUBLIC,
            memberCount: 5,
          }),
        })
      );

      const memberSetSpy = jest.fn(() => Promise.resolve());
      mockFirestore.collection().doc().collection().doc().set = memberSetSpy;

      await groupService.joinGroup('group-123', 'test-user-123');

      expect(memberSetSpy).toHaveBeenCalled();
      const memberData = memberSetSpy.mock.calls[0][0];

      expect(memberData.role).toBe(GroupMemberRole.MEMBER);
      expect(memberData.isActive).toBe(true);
    });

    it('should increment memberCount when user joins', async () => {
      mockFirestore.collection().doc().get = jest.fn(() =>
        Promise.resolve({
          exists: true,
          data: () => ({
            privacy: GroupPrivacy.PUBLIC,
            memberCount: 5,
          }),
        })
      );

      const updateSpy = jest.fn(() => Promise.resolve());
      mockFirestore.collection().doc().update = updateSpy;

      await groupService.joinGroup('group-123', 'test-user-123');

      expect(updateSpy).toHaveBeenCalledWith({
        memberCount: expect.anything(), // Should call FieldValue.increment(1)
      });
    });

    it('should throw error if group does not exist', async () => {
      mockFirestore.collection().doc().get = jest.fn(() =>
        Promise.resolve({ exists: false })
      );

      await expect(
        groupService.joinGroup('nonexistent-group', 'test-user-123')
      ).rejects.toThrow('Group not found');
    });

    it('should throw error if trying to join private group without invite', async () => {
      mockFirestore.collection().doc().get = jest.fn(() =>
        Promise.resolve({
          exists: true,
          data: () => ({
            privacy: GroupPrivacy.PRIVATE,
          }),
        })
      );

      await expect(
        groupService.joinGroup('private-group-123', 'test-user-123')
      ).rejects.toThrow('Cannot join private group without invitation');
    });
  });

  describe('leaveGroup', () => {
    it('should remove user from group', async () => {
      const deleteSpy = jest.fn(() => Promise.resolve());
      mockFirestore.collection().doc().collection().doc().delete = deleteSpy;

      await groupService.leaveGroup('group-123', 'test-user-123');

      expect(deleteSpy).toHaveBeenCalled();
    });

    it('should decrement memberCount when user leaves', async () => {
      const updateSpy = jest.fn(() => Promise.resolve());
      mockFirestore.collection().doc().update = updateSpy;

      await groupService.leaveGroup('group-123', 'test-user-123');

      expect(updateSpy).toHaveBeenCalledWith({
        memberCount: expect.anything(), // Should call FieldValue.increment(-1)
      });
    });

    it('should throw error if user is the only admin', async () => {
      mockFirestore.collection().doc().collection().get = jest.fn(() =>
        Promise.resolve({
          docs: [
            {
              id: 'test-user-123',
              data: () => ({ role: GroupMemberRole.ADMIN }),
            },
          ],
        })
      );

      await expect(
        groupService.leaveGroup('group-123', 'test-user-123')
      ).rejects.toThrow('Cannot leave group as the only admin');
    });
  });

  describe('updateGroupStats', () => {
    it('should increment group practice stats', async () => {
      const updateSpy = jest.fn(() => Promise.resolve());
      mockFirestore.collection().doc().update = updateSpy;

      const practiceData = {
        duration: 600, // 10 minutes
        malaCount: 2,
      };

      await groupService.updateGroupStats('group-123', practiceData);

      expect(updateSpy).toHaveBeenCalled();
      const updateData = updateSpy.mock.calls[0][0];

      expect(updateData['stats.totalPractices']).toBeDefined();
      expect(updateData['stats.totalMalas']).toBeDefined();
      expect(updateData['stats.totalMinutes']).toBeDefined();
    });

    it('should also update member stats', async () => {
      const memberUpdateSpy = jest.fn(() => Promise.resolve());
      mockFirestore.collection().doc().collection().doc().update = memberUpdateSpy;

      const practiceData = {
        userId: 'test-user-123',
        duration: 600,
        malaCount: 2,
      };

      await groupService.updateGroupStats('group-123', practiceData);

      expect(memberUpdateSpy).toHaveBeenCalled();
    });
  });

  describe('inviteToGroup', () => {
    it('should create group invitation', async () => {
      const setSpy = jest.fn(() => Promise.resolve());
      mockFirestore.collection().doc().set = setSpy;

      await groupService.inviteToGroup(
        'group-123',
        'test-user-123',
        'friend-user-456'
      );

      expect(setSpy).toHaveBeenCalled();
      const inviteData = setSpy.mock.calls[0][0];

      expect(inviteData.groupId).toBe('group-123');
      expect(inviteData.fromUserId).toBe('test-user-123');
      expect(inviteData.toUserId).toBe('friend-user-456');
      expect(inviteData.status).toBe('pending');
    });

    it('should throw error if user already in group', async () => {
      mockFirestore.collection().doc().collection().doc().get = jest.fn(() =>
        Promise.resolve({ exists: true })
      );

      await expect(
        groupService.inviteToGroup('group-123', 'test-user-123', 'friend-user-456')
      ).rejects.toThrow('User is already a member of this group');
    });
  });

  describe('discoverPublicGroups', () => {
    it('should return list of public groups ordered by memberCount', async () => {
      const mockGroups = [
        {
          id: 'group-1',
          data: () => ({
            name: 'Big Group',
            privacy: GroupPrivacy.PUBLIC,
            memberCount: 100,
          }),
        },
        {
          id: 'group-2',
          data: () => ({
            name: 'Small Group',
            privacy: GroupPrivacy.PUBLIC,
            memberCount: 10,
          }),
        },
      ];

      mockFirestore.collection().get = jest.fn(() =>
        Promise.resolve({ docs: mockGroups })
      );

      const orderBySpy = jest.spyOn(mockFirestore.collection(), 'orderBy');

      const groups = await groupService.discoverPublicGroups();

      expect(orderBySpy).toHaveBeenCalledWith('memberCount', 'desc');
      expect(groups.length).toBe(2);
    });

    it('should limit results to 20 groups', async () => {
      const limitSpy = jest.spyOn(mockFirestore.collection(), 'limit');

      await groupService.discoverPublicGroups();

      expect(limitSpy).toHaveBeenCalledWith(20);
    });

    it('should only return PUBLIC groups', async () => {
      const whereSpy = jest.spyOn(mockFirestore.collection(), 'where');

      await groupService.discoverPublicGroups();

      expect(whereSpy).toHaveBeenCalledWith('privacy', '==', GroupPrivacy.PUBLIC);
    });
  });
});
