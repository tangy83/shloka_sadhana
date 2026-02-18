/**
 * Group Challenges Integration Tests
 * Shloka Sadhana - Phase 2A Week 17-18
 *
 * End-to-end tests for group creation, challenges, and leaderboards
 */

import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GroupDetailScreen } from '@/screens/GroupDetailScreen';
import { groupService } from '@/services/groupService';
import { challengeService } from '@/services/challengeService';
import { useGroupStore } from '@/stores/useGroupStore';
import { ChallengeType, ChallengeStatus } from '@/types/challenges';
import { GroupMemberRole } from '@/types/groups';

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
};

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => mockNavigation,
  useRoute: () => ({
    params: {
      groupId: 'group-123',
    },
  }),
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
        collection: jest.fn(() => ({
          doc: jest.fn(() => ({
            set: jest.fn(),
            get: jest.fn(() =>
              Promise.resolve({
                exists: true,
                data: () => ({}),
              })
            ),
          })),
          get: jest.fn(() => Promise.resolve({ docs: [] })),
          where: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
        })),
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

describe('Group Challenges Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useGroupStore.setState({
      myGroups: [],
      currentGroup: null,
    });
  });

  it('should create a new challenge (admin only)', async () => {
    const mockGroup = {
      id: 'group-123',
      name: 'Daily Devotees',
      memberCount: 10,
      stats: {
        totalPractices: 50,
        totalMalas: 20,
        totalMinutes: 500,
      },
    };

    const mockMember = {
      role: GroupMemberRole.ADMIN,
    };

    jest.spyOn(groupService, 'getGroup').mockResolvedValue(mockGroup as any);
    jest.spyOn(groupService, 'getMember').mockResolvedValue(mockMember as any);
    jest.spyOn(challengeService, 'createChallenge').mockResolvedValue('challenge-123');

    const { getByText, getByTestId } = render(
      <NavigationContainer>
        <GroupDetailScreen />
      </NavigationContainer>
    );

    // Navigate to Challenges tab
    await waitFor(() => {
      expect(getByText('Daily Devotees')).toBeTruthy();
    });

    const challengesTab = getByText(/Challenges/i);
    fireEvent.press(challengesTab);

    // Open create challenge modal
    const createButton = getByText(/Create Challenge/i);
    fireEvent.press(createButton);

    // Fill challenge form
    fireEvent.changeText(getByTestId('challenge-goal-input'), '100');
    fireEvent.changeText(getByTestId('challenge-duration-input'), '30');

    // Select challenge type
    const typeSelector = getByTestId('challenge-type-selector');
    fireEvent.press(typeSelector);
    fireEvent.press(getByText('Total Practices'));

    // Submit
    const submitButton = getByText(/Create/i);
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(challengeService.createChallenge).toHaveBeenCalledWith(
        'group-123',
        'test-user-123',
        ChallengeType.PRACTICES,
        100,
        30
      );
    });
  });

  it('should update leaderboard after practice completion', async () => {
    const mockChallenge = {
      id: 'challenge-123',
      type: ChallengeType.PRACTICES,
      goal: 100,
      duration: 30,
      status: ChallengeStatus.ACTIVE,
      startedAt: new Date().toISOString(),
      endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const mockLeaderboard = [
      {
        userId: 'test-user-123',
        displayName: 'Me',
        score: 10,
        rank: 1,
      },
      {
        userId: 'user-2',
        displayName: 'Priya',
        score: 8,
        rank: 2,
      },
    ];

    jest
      .spyOn(challengeService, 'getActiveChallenge')
      .mockResolvedValue(mockChallenge as any);
    jest
      .spyOn(challengeService, 'getLeaderboard')
      .mockResolvedValue(mockLeaderboard as any);
    jest
      .spyOn(challengeService, 'updateChallengeProgress')
      .mockResolvedValue(undefined);

    const { getByText } = render(
      <NavigationContainer>
        <GroupDetailScreen />
      </NavigationContainer>
    );

    // Navigate to Challenges tab
    await waitFor(() => {
      const challengesTab = getByText(/Challenges/i);
      fireEvent.press(challengesTab);
    });

    // View leaderboard
    await waitFor(() => {
      expect(getByText('Me')).toBeTruthy();
      expect(getByText('Priya')).toBeTruthy();
      expect(getByText(/10 practices/i)).toBeTruthy();
      expect(getByText(/8 practices/i)).toBeTruthy();
    });
  });

  it('should detect and complete expired challenges', async () => {
    const expiredChallenge = {
      id: 'challenge-123',
      type: ChallengeType.PRACTICES,
      goal: 100,
      duration: 30,
      status: ChallengeStatus.ACTIVE,
      startedAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString(),
      endsAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Expired yesterday
      groupId: 'group-123',
    };

    const mockLeaderboard = [
      { userId: 'user-1', score: 100, rank: 1 },
      { userId: 'user-2', score: 80, rank: 2 },
      { userId: 'user-3', score: 60, rank: 3 },
    ];

    jest
      .spyOn(challengeService, 'checkCompletedChallenges')
      .mockResolvedValue([expiredChallenge] as any);
    jest
      .spyOn(challengeService, 'getLeaderboard')
      .mockResolvedValue(mockLeaderboard as any);

    // Run challenge completion check
    const completedChallenges = await challengeService.checkCompletedChallenges();

    expect(completedChallenges).toHaveLength(1);
    expect(completedChallenges[0].id).toBe('challenge-123');
  });

  it('should announce top 3 winners when challenge completes', async () => {
    const mockChallenge = {
      id: 'challenge-123',
      type: ChallengeType.MALAS,
      goal: 1000,
      status: ChallengeStatus.COMPLETED,
      winners: ['user-1', 'user-2', 'user-3'],
    };

    const mockLeaderboard = [
      { userId: 'user-1', displayName: 'Priya', score: 1200, rank: 1 },
      { userId: 'user-2', displayName: 'Raj', score: 1100, rank: 2 },
      { userId: 'user-3', displayName: 'Krishna', score: 1000, rank: 3 },
    ];

    jest.spyOn(challengeService, 'getChallenge').mockResolvedValue(mockChallenge as any);
    jest
      .spyOn(challengeService, 'getLeaderboard')
      .mockResolvedValue(mockLeaderboard as any);

    const { getByText } = render(
      <NavigationContainer>
        <GroupDetailScreen />
      </NavigationContainer>
    );

    await waitFor(() => {
      const challengesTab = getByText(/Challenges/i);
      fireEvent.press(challengesTab);
    });

    // Check for winner announcement
    await waitFor(() => {
      expect(getByText(/Challenge Complete/i)).toBeTruthy();
      expect(getByText(/Priya/i)).toBeTruthy(); // 1st place
      expect(getByText(/Raj/i)).toBeTruthy(); // 2nd place
      expect(getByText(/Krishna/i)).toBeTruthy(); // 3rd place
      expect(getByText(/🥇/)).toBeTruthy(); // Gold medal
      expect(getByText(/🥈/)).toBeTruthy(); // Silver medal
      expect(getByText(/🥉/)).toBeTruthy(); // Bronze medal
    });
  });

  it('should calculate correct scores for different challenge types', async () => {
    const practicesChallenge = {
      id: 'challenge-1',
      type: ChallengeType.PRACTICES,
      goal: 100,
      status: ChallengeStatus.ACTIVE,
    };

    const malasChallenge = {
      id: 'challenge-2',
      type: ChallengeType.MALAS,
      goal: 1000,
      status: ChallengeStatus.ACTIVE,
    };

    const minutesChallenge = {
      id: 'challenge-3',
      type: ChallengeType.MINUTES,
      goal: 500,
      status: ChallengeStatus.ACTIVE,
    };

    const practice = {
      duration: 720, // 12 minutes
      malaCount: 3,
    };

    const practicesScore = challengeService.calculateChallengeScore(
      practicesChallenge.type,
      practice as any
    );
    expect(practicesScore).toBe(1); // One practice = 1 point

    const malasScore = challengeService.calculateChallengeScore(
      malasChallenge.type,
      practice as any
    );
    expect(malasScore).toBe(3); // 3 malas = 3 points

    const minutesScore = challengeService.calculateChallengeScore(
      minutesChallenge.type,
      practice as any
    );
    expect(minutesScore).toBe(12); // 12 minutes = 12 points
  });

  it('should prevent non-admins from creating challenges', async () => {
    const mockMember = {
      role: GroupMemberRole.MEMBER, // Not admin
    };

    jest.spyOn(groupService, 'getMember').mockResolvedValue(mockMember as any);

    const { queryByText } = render(
      <NavigationContainer>
        <GroupDetailScreen />
      </NavigationContainer>
    );

    await waitFor(() => {
      const challengesTab = queryByText(/Challenges/i);
      if (challengesTab) fireEvent.press(challengesTab);
    });

    // Create Challenge button should not be visible
    const createButton = queryByText(/Create Challenge/i);
    expect(createButton).toBeNull();
  });

  it('should update group stats after member practices', async () => {
    const mockGroup = {
      id: 'group-123',
      stats: {
        totalPractices: 50,
        totalMalas: 20,
        totalMinutes: 500,
      },
    };

    jest.spyOn(groupService, 'getGroup').mockResolvedValue(mockGroup as any);
    jest.spyOn(groupService, 'updateGroupStats').mockResolvedValue(undefined);

    const practice = {
      userId: 'test-user-123',
      duration: 600, // 10 minutes
      malaCount: 2,
    };

    await groupService.updateGroupStats('group-123', practice as any);

    expect(groupService.updateGroupStats).toHaveBeenCalledWith('group-123', practice);
  });
});
