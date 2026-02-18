/**
 * Activity Service Tests
 * Tests for posting practice, achievement, and quest activities to the friend feed
 */

// Must mock these before module imports resolve
jest.mock('@react-native-firebase/auth', () => ({
  __esModule: true,
  default: jest.fn(() => ({ currentUser: null })),
}));

jest.mock('@/services/analytics', () => ({
  analyticsService: {
    trackEvent: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock('@/services/friendService', () => ({
  friendService: {
    getUserProfile: jest.fn(() =>
      Promise.resolve({ displayName: 'Test User', photoURL: null })
    ),
    getFriends: jest.fn(() => Promise.resolve([])),
  },
}));

// Firestore mock: activityService uses collection().doc().set() pattern (not .add())
const mockSet = jest.fn(() => Promise.resolve());
const mockBatchCommit = jest.fn(() => Promise.resolve());
const mockDocRef = { id: 'activity-id-123', set: mockSet, collection: jest.fn() };
const mockBatch = { set: jest.fn(), commit: mockBatchCommit };

jest.mock('@react-native-firebase/firestore', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    collection: jest.fn(() => ({ doc: jest.fn(() => mockDocRef) })),
    batch: jest.fn(() => mockBatch),
  })),
}));

import { activityService } from '@/services/activityService';
import auth from '@react-native-firebase/auth';
import { friendService } from '@/services/friendService';

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockFriendService = friendService as jest.Mocked<typeof friendService>;

const MOCK_USER = { uid: 'test-uid-123', displayName: 'Test User' };
const MOCK_PROFILE = { displayName: 'Test User', photoURL: null };

function signIn() {
  mockAuth.mockReturnValue({ currentUser: MOCK_USER } as any);
}

describe('activityService — postPracticeActivity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFriendService.getUserProfile.mockResolvedValue(MOCK_PROFILE as any);
    mockFriendService.getFriends.mockResolvedValue([]);
    mockSet.mockResolvedValue(undefined);
    signIn();
  });

  it('should write a practice activity document to Firestore', async () => {
    await activityService.postPracticeActivity('Gayatri Mantra', 15, 2);

    expect(mockSet).toHaveBeenCalled();
  });

  it('should include shloka name, duration, and mala count in activity', async () => {
    await activityService.postPracticeActivity('Hanuman Chalisa', 20, 1);

    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          shlokaName: 'Hanuman Chalisa',
          duration: 20,
          malaCount: 1,
        }),
      })
    );
  });

  it('should include the user ID in the activity', async () => {
    await activityService.postPracticeActivity('Gayatri Mantra', 10, 0);

    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'test-uid-123' })
    );
  });

  it('should return activity ID on success', async () => {
    const id = await activityService.postPracticeActivity('Mantra', 5, 0);
    expect(typeof id).toBe('string');
    expect(id).toBeTruthy();
  });

  it('should throw when user is not signed in', async () => {
    mockAuth.mockReturnValue({ currentUser: null } as any);

    await expect(
      activityService.postPracticeActivity('Mantra', 5, 0)
    ).rejects.toThrow();
  });
});

describe('activityService — postAchievementActivity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFriendService.getUserProfile.mockResolvedValue(MOCK_PROFILE as any);
    mockFriendService.getFriends.mockResolvedValue([]);
    mockSet.mockResolvedValue(undefined);
    signIn();
  });

  it('should write an achievement activity to Firestore', async () => {
    await activityService.postAchievementActivity('streak_7', '7-Day Streak', '🔥', 50);

    expect(mockSet).toHaveBeenCalled();
  });

  it('should include achievement details in the activity', async () => {
    await activityService.postAchievementActivity('practice_10', '10 Practices', '🌟', 30);

    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          achievementId: 'practice_10',
          achievementName: '10 Practices',
          achievementIcon: '🌟',
          xpEarned: 30,
        }),
      })
    );
  });

  it('should include user ID and activity type', async () => {
    await activityService.postAchievementActivity('id', 'Name', '⭐', 10);

    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'test-uid-123', type: 'achievement' })
    );
  });
});

describe('activityService — postQuestActivity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFriendService.getUserProfile.mockResolvedValue(MOCK_PROFILE as any);
    mockFriendService.getFriends.mockResolvedValue([]);
    mockSet.mockResolvedValue(undefined);
    signIn();
  });

  it('should write a quest completion activity to Firestore', async () => {
    await activityService.postQuestActivity('Daily Practice', 'PRACTICE_ONCE', 10);

    expect(mockSet).toHaveBeenCalled();
  });

  it('should include quest name in the activity', async () => {
    await activityService.postQuestActivity('10-Minute Focus', 'PRACTICE_DURATION', 20);

    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ questName: '10-Minute Focus' }),
      })
    );
  });
});
