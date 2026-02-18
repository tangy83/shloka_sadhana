/**
 * Group Store Tests
 * Tests for group management, invitations, and practice stat updates
 */

import { useGroupStore } from '@/stores/useGroupStore';
import { groupService } from '@/services/groupService';

jest.mock('@/services/groupService');

const mockGroupService = groupService as jest.Mocked<typeof groupService>;

const MOCK_USER = { uid: 'test-uid' };

// Mock Firebase auth to return a signed-in user
jest.mock('@react-native-firebase/auth', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    currentUser: MOCK_USER,
  })),
}));

const MOCK_GROUP: any = {
  id: 'group-1',
  name: 'Morning Sadhana Circle',
  description: 'Daily morning practice group',
  isPrivate: false,
  adminIds: ['test-uid'],
  memberIds: ['test-uid', 'user-2'],
  createdAt: '2026-02-01T06:00:00.000Z',
  totalPractices: 50,
  totalMinutes: 500,
};

const MOCK_INVITE: any = {
  id: 'invite-1',
  groupId: 'group-2',
  groupName: 'Evening Bhajan Group',
  fromUserId: 'user-3',
  fromDisplayName: 'Radha Devi',
  createdAt: '2026-02-15T18:00:00.000Z',
};

function resetGroupStore() {
  useGroupStore.setState({
    myGroups: [],
    myGroupsLoading: false,
    groupInvites: [],
    invitesLoading: false,
    publicGroups: [],
    discoveryLoading: false,
    groupStats: {
      totalGroups: 0,
      groupsAsAdmin: 0,
      groupsAsMember: 0,
      totalGroupPractices: 0,
      mostActiveGroup: null,
    },
  });
}

describe('useGroupStore — loadMyGroups', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetGroupStore();
  });

  it('should load user groups', async () => {
    mockGroupService.getUserGroups.mockResolvedValue([MOCK_GROUP]);

    await useGroupStore.getState().loadMyGroups();

    expect(useGroupStore.getState().myGroups).toHaveLength(1);
    expect(useGroupStore.getState().myGroups[0].id).toBe('group-1');
  });

  it('should handle empty groups list', async () => {
    mockGroupService.getUserGroups.mockResolvedValue([]);

    await useGroupStore.getState().loadMyGroups();

    expect(useGroupStore.getState().myGroups).toHaveLength(0);
  });

  it('should handle service errors gracefully', async () => {
    mockGroupService.getUserGroups.mockRejectedValue(new Error('Network error'));

    await expect(useGroupStore.getState().loadMyGroups()).resolves.not.toThrow();
  });
});

describe('useGroupStore — createGroup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetGroupStore();
  });

  it('should create a group and add to myGroups', async () => {
    const createData = { name: 'New Group', description: 'Test group', isPrivate: false };
    mockGroupService.createGroup.mockResolvedValue(MOCK_GROUP);
    mockGroupService.getUserGroupStats.mockResolvedValue({
      totalGroups: 1, groupsAsAdmin: 1, groupsAsMember: 0, totalGroupPractices: 0, mostActiveGroup: null,
    });

    const result = await useGroupStore.getState().createGroup(createData as any);

    expect(mockGroupService.createGroup).toHaveBeenCalledWith(createData);
    expect(result).toEqual(MOCK_GROUP);
    expect(useGroupStore.getState().myGroups).toContainEqual(MOCK_GROUP);
  });
});

describe('useGroupStore — joinGroup / leaveGroup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetGroupStore();
    mockGroupService.joinGroup.mockResolvedValue(undefined);
    mockGroupService.leaveGroup.mockResolvedValue(undefined);
    mockGroupService.getUserGroups.mockResolvedValue([MOCK_GROUP]);
    mockGroupService.discoverPublicGroups.mockResolvedValue([]);
    mockGroupService.getUserGroupStats.mockResolvedValue({
      totalGroups: 1, groupsAsAdmin: 0, groupsAsMember: 1, totalGroupPractices: 0, mostActiveGroup: null,
    });
  });

  it('should join a group', async () => {
    await useGroupStore.getState().joinGroup('group-1');

    expect(mockGroupService.joinGroup).toHaveBeenCalledWith('group-1');
  });

  it('should leave a group and remove from myGroups', async () => {
    useGroupStore.setState({ myGroups: [MOCK_GROUP] });

    await useGroupStore.getState().leaveGroup('group-1');

    expect(mockGroupService.leaveGroup).toHaveBeenCalledWith('group-1');
    expect(useGroupStore.getState().myGroups).toHaveLength(0);
  });
});

describe('useGroupStore — Group Invites', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetGroupStore();
    mockGroupService.acceptGroupInvite.mockResolvedValue(undefined);
    mockGroupService.declineGroupInvite.mockResolvedValue(undefined);
    mockGroupService.getUserGroups.mockResolvedValue([MOCK_GROUP]);
  });

  it('should load invites', async () => {
    mockGroupService.getPendingInvites.mockResolvedValue([MOCK_INVITE]);

    await useGroupStore.getState().loadGroupInvites();

    expect(useGroupStore.getState().groupInvites).toHaveLength(1);
  });

  it('should accept invite and remove from invites list', async () => {
    useGroupStore.setState({ groupInvites: [MOCK_INVITE] });
    mockGroupService.getUserGroupStats.mockResolvedValue({
      totalGroups: 1, groupsAsAdmin: 0, groupsAsMember: 1, totalGroupPractices: 0, mostActiveGroup: null,
    });

    await useGroupStore.getState().acceptInvite('invite-1');

    expect(mockGroupService.acceptGroupInvite).toHaveBeenCalledWith('invite-1');
    expect(useGroupStore.getState().groupInvites).toHaveLength(0);
  });

  it('should decline invite and remove from invites list', async () => {
    useGroupStore.setState({ groupInvites: [MOCK_INVITE] });

    await useGroupStore.getState().declineInvite('invite-1');

    expect(mockGroupService.declineGroupInvite).toHaveBeenCalledWith('invite-1');
    expect(useGroupStore.getState().groupInvites).toHaveLength(0);
  });
});

describe('useGroupStore — updateGroupStatsAfterPractice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetGroupStore();
    mockGroupService.updateGroupStats.mockResolvedValue(undefined);
  });

  it('should update stats for each group the user belongs to', async () => {
    useGroupStore.setState({ myGroups: [MOCK_GROUP] });

    const practice: any = {
      id: 'practice-1',
      duration: 15,
      malaCount: 1,
      date: '2026-02-17T07:00:00.000Z',
    };

    await useGroupStore.getState().updateGroupStatsAfterPractice(practice);

    expect(mockGroupService.updateGroupStats).toHaveBeenCalledWith(
      'group-1',
      'test-uid',
      practice
    );
  });

  it('should not call updateGroupStats if user has no groups', async () => {
    useGroupStore.setState({ myGroups: [] });

    const practice: any = { id: 'p1', duration: 10 };
    await useGroupStore.getState().updateGroupStatsAfterPractice(practice);

    expect(mockGroupService.updateGroupStats).not.toHaveBeenCalled();
  });

  it('should update stats for all groups when user belongs to multiple', async () => {
    const group2 = { ...MOCK_GROUP, id: 'group-2', name: 'Second Group' };
    useGroupStore.setState({ myGroups: [MOCK_GROUP, group2] });

    const practice: any = { id: 'p1', duration: 20, malaCount: 2 };
    await useGroupStore.getState().updateGroupStatsAfterPractice(practice);

    expect(mockGroupService.updateGroupStats).toHaveBeenCalledTimes(2);
  });
});
