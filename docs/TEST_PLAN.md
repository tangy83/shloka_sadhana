# Phase 2A Test Plan
**Shloka Sadhana - Automated Testing Strategy**

**Status**: Test specifications defined, implementation pending
**Framework**: Jest + React Native Testing Library
**Coverage Target**: >80% for business logic

---

## Test Structure

```
__tests__/
├── unit/
│   ├── services/
│   │   ├── questService.test.ts (15 tests)
│   │   ├── achievementService.test.ts (15 tests)
│   │   ├── friendService.test.ts (10 tests)
│   │   ├── groupService.test.ts (10 tests)
│   │   ├── challengeService.test.ts (10 tests)
│   │   └── referralService.test.ts (10 tests)
│   ├── stores/
│   │   ├── useQuestStore.test.ts (8 tests)
│   │   ├── useAchievementStore.test.ts (8 tests)
│   │   ├── useSocialStore.test.ts (6 tests)
│   │   └── useGroupStore.test.ts (6 tests)
│   └── utils/
│       ├── recommendationEngine.test.ts (12 tests)
│       └── feedService.test.ts (10 tests)
├── integration/
│   ├── quest-flow.test.ts (5 tests)
│   ├── friend-system.test.ts (8 tests)
│   ├── group-challenges.test.ts (7 tests)
│   └── referral-flow.test.ts (5 tests)
└── e2e/ (future)
    └── critical-paths.test.ts
```

**Total Tests**: 125+
- Unit Tests: 100+
- Integration Tests: 25+

---

## Unit Tests (100+)

### Quest Service (15 tests)

**File**: `__tests__/unit/services/questService.test.ts`

```typescript
describe('QuestService', () => {
  describe('generateDailyQuest', () => {
    it('should generate beginner quest for new user (0-7 practices)', () => {
      const user = { totalPractices: 3, experienceLevel: 'beginner' };
      const quest = questService.generateDailyQuest(user);

      expect(quest.type).toBe('practice_once');
      expect(quest.target).toBe(1);
      expect(quest.xp).toBe(10);
    });

    it('should generate intermediate quest for regular user (7-30 practices)', () => {
      const user = { totalPractices: 15, experienceLevel: 'intermediate' };
      const quest = questService.generateDailyQuest(user);

      expect(quest.type).toBe('practice_duration');
      expect(quest.target).toBe(600); // 10 minutes
      expect(quest.xp).toBe(20);
    });

    it('should generate advanced quest for experienced user (30+ practices)', () => {
      const user = { totalPractices: 50, experienceLevel: 'advanced' };
      const quest = questService.generateDailyQuest(user);

      expect(quest.type).toBe('complete_sessions');
      expect(quest.target).toBe(2);
      expect(quest.xp).toBe(30);
    });
  });

  describe('updateQuestProgress', () => {
    it('should update progress for practice_once quest', async () => {
      const quest = { type: 'practice_once', target: 1, progress: 0 };
      const update = { practiceCompleted: true };

      const result = await questService.updateQuestProgress(quest, update);

      expect(result.progress).toBe(1);
      expect(result.completed).toBe(true);
    });

    it('should update progress for duration quest', async () => {
      const quest = { type: 'practice_duration', target: 600, progress: 0 };
      const update = { duration: 300 };

      const result = await questService.updateQuestProgress(quest, update);

      expect(result.progress).toBe(300);
      expect(result.completed).toBe(false);
    });

    it('should complete quest when target reached', async () => {
      const quest = { type: 'practice_duration', target: 600, progress: 500 };
      const update = { duration: 200 }; // Total 700, exceeds target

      const result = await questService.updateQuestProgress(quest, update);

      expect(result.progress).toBe(700);
      expect(result.completed).toBe(true);
    });
  });

  describe('checkQuestExpiration', () => {
    it('should mark quest as expired if not completed by midnight', () => {
      const quest = {
        startedAt: '2026-02-09T00:00:00Z',
        completed: false
      };
      const now = '2026-02-10T00:01:00Z';

      const expired = questService.checkQuestExpiration(quest, now);

      expect(expired).toBe(true);
    });

    it('should not mark quest as expired if completed', () => {
      const quest = {
        startedAt: '2026-02-09T00:00:00Z',
        completed: true,
        completedAt: '2026-02-09T20:00:00Z'
      };
      const now = '2026-02-10T00:01:00Z';

      const expired = questService.checkQuestExpiration(quest, now);

      expect(expired).toBe(false);
    });
  });

  describe('calculateQuestStreak', () => {
    it('should calculate consecutive quest completions', () => {
      const quests = [
        { completedAt: '2026-02-07T20:00:00Z' },
        { completedAt: '2026-02-08T19:00:00Z' },
        { completedAt: '2026-02-09T21:00:00Z' }
      ];

      const streak = questService.calculateQuestStreak(quests);

      expect(streak).toBe(3);
    });

    it('should reset streak if day skipped', () => {
      const quests = [
        { completedAt: '2026-02-07T20:00:00Z' },
        // Feb 8 skipped
        { completedAt: '2026-02-09T21:00:00Z' }
      ];

      const streak = questService.calculateQuestStreak(quests);

      expect(streak).toBe(1);
    });
  });

  describe('awardQuestXP', () => {
    it('should award correct XP amount', async () => {
      const quest = { xp: 20 };
      const initialXP = 100;

      const newXP = await questService.awardQuestXP(quest, initialXP);

      expect(newXP).toBe(120);
    });
  });
});
```

**Additional Quest Tests**:
- [ ] Quest reset at midnight (timezone handling)
- [ ] Multiple quest types handled correctly
- [ ] Quest progress persists to Firestore
- [ ] Quest progress loads from Firestore
- [ ] Offline quest completion queues for sync

---

### Achievement Service (15 tests)

**File**: `__tests__/unit/services/achievementService.test.ts`

```typescript
describe('AchievementService', () => {
  describe('checkAchievements', () => {
    it('should unlock streak achievement at 7 days', async () => {
      const userData = { currentStreak: 7 };

      const unlocked = await achievementService.checkAchievements(userData);

      expect(unlocked).toContainEqual(
        expect.objectContaining({ id: 'streak_7' })
      );
    });

    it('should unlock practice achievement at 10 practices', async () => {
      const userData = { totalPractices: 10 };

      const unlocked = await achievementService.checkAchievements(userData);

      expect(unlocked).toContainEqual(
        expect.objectContaining({ id: 'practice_10' })
      );
    });

    it('should unlock multiple achievements simultaneously', async () => {
      const userData = {
        currentStreak: 7,
        totalPractices: 10,
        totalMalas: 1
      };

      const unlocked = await achievementService.checkAchievements(userData);

      expect(unlocked).toHaveLength(3);
      expect(unlocked.map(a => a.id)).toContain('streak_7');
      expect(unlocked.map(a => a.id)).toContain('practice_10');
      expect(unlocked.map(a => a.id)).toContain('mala_1');
    });

    it('should not unlock already unlocked achievements', async () => {
      const userData = {
        currentStreak: 10,
        unlockedAchievements: ['streak_7']
      };

      const unlocked = await achievementService.checkAchievements(userData);

      expect(unlocked.map(a => a.id)).not.toContain('streak_7');
    });
  });

  describe('getAchievementProgress', () => {
    it('should calculate progress toward achievement', () => {
      const achievement = { id: 'practice_50', target: 50 };
      const userData = { totalPractices: 30 };

      const progress = achievementService.getAchievementProgress(achievement, userData);

      expect(progress).toBe(30);
      expect(progress / achievement.target).toBeCloseTo(0.6);
    });

    it('should cap progress at target', () => {
      const achievement = { id: 'practice_50', target: 50 };
      const userData = { totalPractices: 75 };

      const progress = achievementService.getAchievementProgress(achievement, userData);

      expect(progress).toBe(50);
    });
  });

  describe('getNearCompleteAchievements', () => {
    it('should return achievements within 3 of target', () => {
      const userData = {
        totalPractices: 48, // 2 away from 50
        currentStreak: 6,    // 1 away from 7
        totalMalas: 95       // 13 away from 108
      };

      const nearComplete = achievementService.getNearCompleteAchievements(userData);

      expect(nearComplete).toHaveLength(2);
      expect(nearComplete.map(a => a.id)).toContain('practice_50');
      expect(nearComplete.map(a => a.id)).toContain('streak_7');
      expect(nearComplete.map(a => a.id)).not.toContain('mala_108');
    });
  });

  describe('Achievement Categories', () => {
    it('should correctly categorize streak achievements', () => {
      const achievements = achievementService.getAchievementsByCategory('streak');

      expect(achievements.map(a => a.id)).toContain('streak_7');
      expect(achievements.map(a => a.id)).toContain('streak_30');
      expect(achievements.map(a => a.id)).toContain('streak_100');
    });

    it('should correctly categorize practice achievements', () => {
      const achievements = achievementService.getAchievementsByCategory('practice');

      expect(achievements.map(a => a.id)).toContain('practice_10');
      expect(achievements.map(a => a.id)).toContain('practice_50');
    });

    it('should correctly categorize social achievements', () => {
      const achievements = achievementService.getAchievementsByCategory('social');

      expect(achievements.map(a => a.id)).toContain('friends_5');
      expect(achievements.map(a => a.id)).toContain('friends_20');
    });
  });
});
```

**Additional Achievement Tests**:
- [ ] Badge awarding triggers notification
- [ ] Achievement unlocks persist to Firestore
- [ ] Achievement progress calculates for all 6 categories
- [ ] Group achievements unlock correctly
- [ ] Quest achievements track consecutive completions

---

### Friend Service (10 tests)

**File**: `__tests__/unit/services/friendService.test.ts`

```typescript
describe('FriendService', () => {
  describe('searchUsers', () => {
    it('should return users matching search query', async () => {
      const results = await friendService.searchUsers('Priya', 'currentUserId');

      expect(results).toBeInstanceOf(Array);
      expect(results[0]).toHaveProperty('displayName');
      expect(results[0]).toHaveProperty('currentStreak');
    });

    it('should exclude current user from results', async () => {
      const currentUserId = 'user123';
      const results = await friendService.searchUsers('Test', currentUserId);

      expect(results.every(u => u.id !== currentUserId)).toBe(true);
    });

    it('should handle fuzzy search (typos)', async () => {
      const results = await friendService.searchUsers('Prya', 'currentUserId'); // Typo

      expect(results.some(u => u.displayName.includes('Priya'))).toBe(true);
    });
  });

  describe('sendFriendRequest', () => {
    it('should create friend request', async () => {
      const request = await friendService.sendFriendRequest('user1', 'user2');

      expect(request).toHaveProperty('fromUserId', 'user1');
      expect(request).toHaveProperty('toUserId', 'user2');
      expect(request).toHaveProperty('status', 'pending');
    });

    it('should prevent duplicate requests', async () => {
      await friendService.sendFriendRequest('user1', 'user2');

      await expect(
        friendService.sendFriendRequest('user1', 'user2')
      ).rejects.toThrow('Request already sent');
    });

    it('should prevent self-friending', async () => {
      await expect(
        friendService.sendFriendRequest('user1', 'user1')
      ).rejects.toThrow('Cannot friend yourself');
    });
  });

  describe('acceptFriendRequest', () => {
    it('should create bidirectional friendship', async () => {
      const requestId = 'req123';

      await friendService.acceptFriendRequest(requestId);

      const friendship = await friendService.getFriendship('user1', 'user2');
      expect(friendship).toHaveProperty('status', 'active');
      expect(friendship.users).toContain('user1');
      expect(friendship.users).toContain('user2');
    });
  });

  describe('declineFriendRequest', () => {
    it('should remove request without creating friendship', async () => {
      const requestId = 'req123';

      await friendService.declineFriendRequest(requestId);

      const friendship = await friendService.getFriendship('user1', 'user2');
      expect(friendship).toBeNull();
    });
  });
});
```

**Additional Friend Tests**:
- [ ] Get pending requests filters correctly
- [ ] Unfriend removes bidirectional relationship
- [ ] Friend count calculates correctly
- [ ] Privacy settings respected in search

---

### Group Service (10 tests)

**File**: `__tests__/unit/services/groupService.test.ts`

```typescript
describe('GroupService', () => {
  describe('createGroup', () => {
    it('should create group with admin role', async () => {
      const data = {
        name: 'Morning Sadhana',
        description: 'Practice together in the morning',
        privacy: 'public'
      };

      const group = await groupService.createGroup(data);

      expect(group).toHaveProperty('name', data.name);
      expect(group).toHaveProperty('createdBy');
      expect(group.memberCount).toBe(1);
    });

    it('should validate minimum name length', async () => {
      const data = {
        name: 'AB', // Too short
        description: 'Test group',
        privacy: 'public'
      };

      await expect(groupService.createGroup(data)).rejects.toThrow('Name too short');
    });
  });

  describe('joinGroup', () => {
    it('should add member to public group', async () => {
      const groupId = 'group123';
      const userId = 'user456';

      await groupService.joinGroup(groupId, userId);

      const member = await groupService.getGroupMember(groupId, userId);
      expect(member).toHaveProperty('role', 'member');
    });

    it('should reject joining private group without invite', async () => {
      const groupId = 'privateGroup123';
      const userId = 'user456';

      await expect(
        groupService.joinGroup(groupId, userId)
      ).rejects.toThrow('Group is private');
    });
  });

  describe('updateGroupStats', () => {
    it('should increment group stats after practice', async () => {
      const practice = {
        duration: 600,
        malaCount: 2
      };

      await groupService.updateGroupStats('group123', practice);

      const stats = await groupService.getGroupStats('group123');
      expect(stats.totalPractices).toBeGreaterThan(0);
      expect(stats.totalMalas).toBeGreaterThan(0);
      expect(stats.totalMinutes).toBeGreaterThan(0);
    });
  });

  describe('inviteToGroup', () => {
    it('should create group invite', async () => {
      const invite = await groupService.inviteToGroup('group123', 'user456');

      expect(invite).toHaveProperty('groupId', 'group123');
      expect(invite).toHaveProperty('toUserId', 'user456');
      expect(invite).toHaveProperty('status', 'pending');
    });

    it('should prevent duplicate invites', async () => {
      await groupService.inviteToGroup('group123', 'user456');

      await expect(
        groupService.inviteToGroup('group123', 'user456')
      ).rejects.toThrow('Already invited');
    });
  });
});
```

**Additional Group Tests**:
- [ ] Leave group removes member and decrements count
- [ ] Admin permissions enforced
- [ ] Group discovery filters private groups
- [ ] Group stats aggregate correctly

---

### Challenge Service (10 tests)

**File**: `__tests__/unit/services/challengeService.test.ts`

```typescript
describe('ChallengeService', () => {
  describe('createChallenge', () => {
    it('should create challenge with correct end date', async () => {
      const data = {
        type: 'practices',
        goal: 100,
        duration: 7
      };

      const challenge = await challengeService.createChallenge('group123', data);

      expect(challenge.type).toBe('practices');
      expect(challenge.goal).toBe(100);

      const startDate = new Date(challenge.startedAt);
      const endDate = new Date(challenge.endsAt);
      const daysDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

      expect(daysDiff).toBeCloseTo(7, 0);
    });

    it('should reject creating challenge when one exists', async () => {
      await challengeService.createChallenge('group123', { type: 'practices', goal: 100, duration: 7 });

      await expect(
        challengeService.createChallenge('group123', { type: 'malas', goal: 500, duration: 14 })
      ).rejects.toThrow('Active challenge exists');
    });
  });

  describe('updateChallengeProgress', () => {
    it('should update score for practices challenge', async () => {
      const practice = { malaCount: 2, duration: 600 };

      await challengeService.updateChallengeProgress('group123', 'challenge456', 'user789', practice);

      const entry = await challengeService.getLeaderboardEntry('challenge456', 'user789');
      expect(entry.score).toBe(1); // 1 practice
    });

    it('should update score for malas challenge', async () => {
      const practice = { malaCount: 2, duration: 600 };

      await challengeService.updateChallengeProgress('group123', 'challenge456', 'user789', practice);

      const entry = await challengeService.getLeaderboardEntry('challenge456', 'user789');
      expect(entry.score).toBe(2); // 2 malas
    });

    it('should recalculate ranks after score update', async () => {
      // User A: 10 practices
      // User B: 5 practices
      // User C: 15 practices

      const leaderboard = await challengeService.getLeaderboard('challenge456');

      expect(leaderboard[0].rank).toBe(1); // User C (15)
      expect(leaderboard[1].rank).toBe(2); // User A (10)
      expect(leaderboard[2].rank).toBe(3); // User B (5)
    });
  });

  describe('checkCompletedChallenges', () => {
    it('should mark challenge as completed after end date', async () => {
      const challenge = {
        id: 'challenge456',
        endsAt: '2026-02-09T23:59:59Z',
        status: 'active'
      };
      const now = '2026-02-10T00:01:00Z';

      await challengeService.checkCompletedChallenges();

      const updated = await challengeService.getChallenge('group123', 'challenge456');
      expect(updated.status).toBe('completed');
    });

    it('should determine top 3 winners', async () => {
      const leaderboard = [
        { userId: 'user1', score: 100 },
        { userId: 'user2', score: 95 },
        { userId: 'user3', score: 90 },
        { userId: 'user4', score: 85 }
      ];

      const winners = challengeService.determineWinners(leaderboard);

      expect(winners).toHaveLength(3);
      expect(winners).toEqual(['user1', 'user2', 'user3']);
    });
  });
});
```

**Additional Challenge Tests**:
- [ ] Challenge types calculate scores correctly
- [ ] Leaderboard updates in real-time
- [ ] Winner badges awarded
- [ ] Admin can cancel challenge

---

### Referral Service (10 tests)

**File**: `__tests__/unit/services/referralService.test.ts`

```typescript
describe('ReferralService', () => {
  describe('generateReferralCode', () => {
    it('should generate code from name and userId', () => {
      const code = referralService.generateReferralCode('Priya Kumar', 'abc123xyz');

      expect(code).toMatch(/^PRIYA[A-Z0-9]{4}$/);
    });

    it('should handle collision by adding random suffix', async () => {
      const code1 = await referralService.createReferralCode('user1', 'John Doe');
      const code2 = await referralService.createReferralCode('user2', 'John Doe');

      expect(code1).not.toBe(code2);
    });
  });

  describe('validateReferralCode', () => {
    it('should return true for valid code', async () => {
      await referralService.createReferralCode('user1', 'Test User');
      const code = 'TEST1234';

      const valid = await referralService.validateReferralCode(code);

      expect(valid).toBe(true);
    });

    it('should return false for invalid code', async () => {
      const valid = await referralService.validateReferralCode('INVALID');

      expect(valid).toBe(false);
    });
  });

  describe('recordReferral', () => {
    it('should create referral relationship', async () => {
      await referralService.recordReferral('PRIYA2024', 'newUser123');

      const relationship = await referralService.getReferralRelationship('referrer', 'newUser123');
      expect(relationship).toHaveProperty('status', 'pending');
    });

    it('should increment referrer stats', async () => {
      await referralService.recordReferral('PRIYA2024', 'newUser123');

      const stats = await referralService.getUserReferralData('referrer');
      expect(stats.totalReferrals).toBe(1);
      expect(stats.pendingReferrals).toBe(1);
    });

    it('should prevent self-referral', async () => {
      const userId = 'user123';
      const code = await referralService.getUserReferralCode(userId);

      await expect(
        referralService.recordReferral(code, userId)
      ).rejects.toThrow('Cannot use your own code');
    });
  });

  describe('awardReferralRewards', () => {
    it('should award 50 XP to referee', async () => {
      await referralService.awardReferralRewards('newUser123');

      // Check XP was awarded (via useQuestStore)
      const xp = useQuestStore.getState().totalXP;
      expect(xp).toBeGreaterThanOrEqual(50);
    });

    it('should award badge to referee', async () => {
      await referralService.awardReferralRewards('newUser123');

      const achievements = useAchievementStore.getState().unlockedAchievements;
      expect(achievements).toContain('welcomed_by_community');
    });

    it('should award 50 XP to referrer', async () => {
      await referralService.awardReferralRewards('newUser123');

      const stats = await referralService.getUserReferralData('referrer');
      expect(stats.xpEarned).toBe(50);
    });

    it('should award milestone badge at 5 referrals', async () => {
      // Simulate 5 successful referrals
      for (let i = 0; i < 5; i++) {
        await referralService.recordReferral('CODE', `user${i}`);
        await referralService.awardReferralRewards(`user${i}`);
      }

      const achievements = useAchievementStore.getState().unlockedAchievements;
      expect(achievements).toContain('spiritual_guide');
    });
  });

  describe('getReferralLeaderboard', () => {
    it('should return top 10 referrers', async () => {
      const leaderboard = await referralService.getReferralLeaderboard(10);

      expect(leaderboard).toHaveLength(10);
      expect(leaderboard[0].successfulReferrals).toBeGreaterThanOrEqual(
        leaderboard[1].successfulReferrals
      );
    });
  });
});
```

---

## Integration Tests (25+)

### Quest Flow (5 tests)

**File**: `__tests__/integration/quest-flow.test.ts`

```typescript
describe('Quest Flow Integration', () => {
  it('should complete full quest flow: generate → practice → complete → reward', async () => {
    // 1. Generate quest
    const quest = await questService.generateDailyQuest(mockUser);
    expect(quest).toHaveProperty('type');

    // 2. Start practice
    await practiceStore.startSession('gayatri', 'Gayatri Mantra');

    // 3. Complete practice
    await practiceStore.endSession();

    // 4. Quest updates
    const updated = await questStore.updateProgress({
      practiceCompleted: true,
      duration: 600
    });

    expect(updated).toBe(true); // Quest completed

    // 5. XP awarded
    const xp = questStore.getState().totalXP;
    expect(xp).toBeGreaterThan(0);
  });

  it('should unlock achievement after completing 7 quests', async () => {
    // Complete 7 quests over 7 days
    for (let i = 0; i < 7; i++) {
      await completeQuest();
      await advanceDay();
    }

    const achievements = achievementStore.getState().unlockedAchievements;
    expect(achievements).toContain('quest_7');
  });

  it('should reset quest at midnight', async () => {
    // Complete quest
    await completeQuest();

    // Advance to next day
    await advanceToMidnight();

    // Check new quest generated
    const quest = questStore.getState().currentQuest;
    expect(quest.progress).toBe(0);
    expect(quest.completed).toBe(false);
  });

  it('should save quest progress offline and sync when online', async () => {
    // Go offline
    await goOffline();

    // Complete quest
    await completeQuest();

    // Quest saved locally
    const localQuest = await AsyncStorage.getItem('quest');
    expect(JSON.parse(localQuest).completed).toBe(true);

    // Go online
    await goOnline();

    // Quest synced to Firestore
    await waitFor(() => {
      expect(mockFirestore.collection).toHaveBeenCalledWith('users');
    });
  });

  it('should show completion modal and allow sharing', async () => {
    const { getByText } = render(<App />);

    // Complete quest
    await completeQuest();

    // Modal appears
    expect(getByText('Quest Complete!')).toBeTruthy();
    expect(getByText(/50 XP/)).toBeTruthy();

    // Share button present
    expect(getByText('Share')).toBeTruthy();
  });
});
```

---

### Friend System (8 tests)

**File**: `__tests__/integration/friend-system.test.ts`

```typescript
describe('Friend System Integration', () => {
  it('should complete friend request flow: search → request → accept → friendship', async () => {
    // 1. Search for user
    const results = await friendService.searchUsers('Priya');
    expect(results.length).toBeGreaterThan(0);

    // 2. Send request
    const request = await friendService.sendFriendRequest(currentUser.id, results[0].id);
    expect(request.status).toBe('pending');

    // 3. Accept request (from other user)
    await friendService.acceptFriendRequest(request.id);

    // 4. Friendship created
    const friends = await friendService.getFriends(currentUser.id);
    expect(friends).toContainEqual(
      expect.objectContaining({ id: results[0].id })
    );
  });

  it('should show friend request notification badge', async () => {
    // Send request
    await friendService.sendFriendRequest('user1', currentUser.id);

    // Badge appears
    const { getByText } = render(<App />);
    expect(getByText('1')).toBeTruthy(); // Badge count
  });

  it('should post practice activity to friend feeds', async () => {
    // Add friend
    await createFriendship(currentUser.id, 'friend1');

    // Complete practice
    await practiceStore.endSession();

    // Activity posted
    await waitFor(() => {
      expect(mockFirestore.collection('activityFeed').add).toHaveBeenCalled();
    });

    // Friend sees activity
    const activities = await activityService.getFriendActivities('friend1');
    expect(activities[0]).toMatchObject({
      userId: currentUser.id,
      type: 'practice'
    });
  });

  it('should allow reacting to friend activities', async () => {
    // Friend posts activity
    const activity = await activityService.postPracticeActivity('Friend', 600, 2);

    // React
    await activityService.addReaction(activity.id, currentUser.id, 'celebrate');

    // Reaction saved
    const updated = await activityService.getActivity(activity.id);
    expect(updated.reactions[currentUser.id]).toBe('celebrate');
  });

  it('should respect privacy settings when viewing profile', async () => {
    // Friend with private stats
    await friendService.updatePrivacySettings('friend1', {
      showStreak: false,
      showPractices: false
    });

    // View profile
    const profile = await friendService.getUserProfile('friend1');

    expect(profile.currentStreak).toBeUndefined();
    expect(profile.totalPractices).toBeUndefined();
  });

  it('should remove friend and hide activities', async () => {
    // Create friendship
    await createFriendship(currentUser.id, 'friend1');

    // Post activity
    await activityService.postPracticeActivity('Test', 600, 1);

    // Unfriend
    await friendService.unfriend(currentUser.id, 'friend1');

    // Activities hidden
    const activities = await activityService.getFriendActivities('friend1');
    expect(activities).toHaveLength(0);
  });

  it('should handle concurrent friend requests', async () => {
    // User A sends to User B
    const request1 = friendService.sendFriendRequest('userA', 'userB');

    // User B sends to User A simultaneously
    const request2 = friendService.sendFriendRequest('userB', 'userA');

    await Promise.all([request1, request2]);

    // Only one friendship created
    const friends = await friendService.getFriends('userA');
    expect(friends.filter(f => f.id === 'userB')).toHaveLength(1);
  });

  it('should sync friend list across devices', async () => {
    // Add friend on Device A
    await friendService.acceptFriendRequest('req123');

    // Load friends on Device B
    const friendsB = await friendService.loadFriends(currentUser.id);

    expect(friendsB).toContainEqual(
      expect.objectContaining({ id: 'newFriend' })
    );
  });
});
```

---

### Group Challenges (7 tests)

**File**: `__tests__/integration/group-challenges.test.ts`

```typescript
describe('Group Challenge Integration', () => {
  it('should complete challenge flow: create → practice → update leaderboard → complete', async () => {
    // 1. Create group
    const group = await groupService.createGroup({
      name: 'Test Group',
      description: 'Testing challenges',
      privacy: 'public'
    });

    // 2. Create challenge
    const challenge = await challengeService.createChallenge(group.id, {
      type: 'practices',
      goal: 10,
      duration: 7
    });

    // 3. Members practice
    await practiceStore.endSession(); // Member 1
    await challengeService.updateChallengeProgress(group.id, challenge.id, 'member1', practice);

    // 4. Leaderboard updates
    const leaderboard = await challengeService.getLeaderboard(challenge.id);
    expect(leaderboard[0].score).toBe(1);

    // 5. Challenge completes
    await advanceDays(7);
    await challengeService.checkCompletedChallenges();

    const completed = await challengeService.getChallenge(group.id, challenge.id);
    expect(completed.status).toBe('completed');
    expect(completed.winners).toHaveLength(3);
  });

  it('should update both group stats and challenge progress', async () => {
    // Practice updates both
    await practiceStore.endSession();

    await waitFor(() => {
      expect(mockFirestore.collection('groups').doc().update).toHaveBeenCalled();
      expect(mockFirestore.collection('challenges').doc().update).toHaveBeenCalled();
    });
  });

  it('should handle multiple challenge types correctly', async () => {
    // Practices challenge
    const ch1 = await challengeService.createChallenge(groupId, { type: 'practices', goal: 10 });
    await practiceStore.endSession();
    let entry = await challengeService.getLeaderboardEntry(ch1.id, userId);
    expect(entry.score).toBe(1);

    // Malas challenge
    const ch2 = await challengeService.createChallenge(groupId, { type: 'malas', goal: 100 });
    await practiceStore.endSession(); // 2 malas
    entry = await challengeService.getLeaderboardEntry(ch2.id, userId);
    expect(entry.score).toBe(2);

    // Minutes challenge
    const ch3 = await challengeService.createChallenge(groupId, { type: 'minutes', goal: 1000 });
    await practiceStore.endSession(); // 10 minutes
    entry = await challengeService.getLeaderboardEntry(ch3.id, userId);
    expect(entry.score).toBe(10);
  });

  it('should recalculate ranks correctly after score changes', async () => {
    // Initial: User A (5), User B (10), User C (3)
    const initial = await challengeService.getLeaderboard(challengeId);
    expect(initial[0].userId).toBe('userB'); // Rank 1

    // User A practices, score becomes 11
    await challengeService.updateChallengeProgress(groupId, challengeId, 'userA', practice);

    const updated = await challengeService.getLeaderboard(challengeId);
    expect(updated[0].userId).toBe('userA'); // New rank 1
    expect(updated[1].userId).toBe('userB'); // Rank 2
  });

  it('should award badges to top 3 winners', async () => {
    // Complete challenge
    await advanceToEndDate();
    await challengeService.checkCompletedChallenges();

    // Check winner badges
    const winner1Achievements = await achievementService.getUnlockedAchievements('winner1');
    expect(winner1Achievements).toContain('challenge_winner');
  });

  it('should allow creating new challenge after completion', async () => {
    // Complete challenge
    await challengeService.checkCompletedChallenges();

    // Create new challenge
    const newChallenge = await challengeService.createChallenge(groupId, {
      type: 'malas',
      goal: 500,
      duration: 14
    });

    expect(newChallenge.status).toBe('active');
  });

  it('should handle member leaving during challenge', async () => {
    // Member participates
    await challengeService.updateChallengeProgress(groupId, challengeId, 'member1', practice);

    // Member leaves group
    await groupService.leaveGroup(groupId, 'member1');

    // Progress remains but member not in current leaderboard
    const leaderboard = await challengeService.getLeaderboard(challengeId);
    const currentMembers = await groupService.getGroupMembers(groupId);

    expect(leaderboard.every(entry =>
      currentMembers.some(m => m.userId === entry.userId)
    )).toBe(true);
  });
});
```

---

### Referral Flow (5 tests)

**File**: `__tests__/integration/referral-flow.test.ts`

```typescript
describe('Referral Flow Integration', () => {
  it('should complete referral flow: sign up → practice → rewards', async () => {
    // 1. Referrer shares code
    const referrerCode = await referralService.getUserReferralCode('referrer123');

    // 2. New user signs up with code
    await referralService.recordReferral(referrerCode, 'newUser456');

    // 3. New user completes first practice
    await practiceStore.endSession();

    // 4. Rewards awarded
    await referralService.awardReferralRewards('newUser456');

    // Referee gets XP
    const refereeXP = questStore.getState().totalXP;
    expect(refereeXP).toBeGreaterThanOrEqual(50);

    // Referrer gets XP
    const referrerData = await referralService.getUserReferralData('referrer123');
    expect(referrerData.xpEarned).toBe(50);
  });

  it('should handle deep link flow', async () => {
    // 1. Open deep link
    await Linking.openURL('shlokasadhana.app/invite/PRIYA2024');

    // 2. Code stored
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_REFERRAL_CODE);
    expect(stored).toBe('PRIYA2024');

    // 3. Code appears in onboarding
    const { getByDisplayValue } = render(<OnboardingScreen />);
    expect(getByDisplayValue('PRIYA2024')).toBeTruthy();
  });

  it('should unlock milestone badges at 5, 10, 25 referrals', async () => {
    // 5 referrals
    await create5Referrals('referrer123');
    let achievements = await achievementService.getUnlockedAchievements('referrer123');
    expect(achievements).toContain('spiritual_guide');

    // 10 referrals
    await create5MoreReferrals('referrer123');
    achievements = await achievementService.getUnlockedAchievements('referrer123');
    expect(achievements).toContain('spiritual_teacher');

    // 25 referrals
    await create15MoreReferrals('referrer123');
    achievements = await achievementService.getUnlockedAchievements('referrer123');
    expect(achievements).toContain('spiritual_guru');
  });

  it('should show referral stats correctly', async () => {
    // 10 sign-ups, 7 completed first practice
    await createReferrals('referrer123', 10, 7);

    const stats = await referralService.getUserReferralData('referrer123');
    expect(stats.totalReferrals).toBe(10);
    expect(stats.successfulReferrals).toBe(7);
    expect(stats.pendingReferrals).toBe(3);
    expect(stats.xpEarned).toBe(350); // 7 * 50
  });

  it('should display in referral leaderboard', async () => {
    // Create multiple referrers with different counts
    await createReferrals('user1', 20, 20);
    await createReferrals('user2', 15, 15);
    await createReferrals('user3', 10, 10);

    const leaderboard = await referralService.getReferralLeaderboard(10);

    expect(leaderboard[0].userId).toBe('user1');
    expect(leaderboard[0].successfulReferrals).toBe(20);
    expect(leaderboard[1].userId).toBe('user2');
  });
});
```

---

## Test Execution

### Running Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm test -- unit/

# Run integration tests only
npm test -- integration/

# Run specific test file
npm test questService.test.ts

# Run with coverage
npm test -- --coverage

# Watch mode (re-run on file changes)
npm test -- --watch
```

### Coverage Targets

- **Overall**: >80%
- **Services**: >90% (core business logic)
- **Stores**: >85% (state management)
- **Components**: >70% (UI components)

---

## Next Steps

1. **Install Dependencies**:
   ```bash
   npm install --save-dev @testing-library/react-native @testing-library/jest-native jest-expo
   ```

2. **Configure Jest**:
   - Update `jest.config.js` with React Native preset
   - Add mock for Firebase, AsyncStorage, React Navigation

3. **Write Tests**:
   - Start with unit tests (services first)
   - Add integration tests after unit tests pass
   - Target 80%+ coverage

4. **Run Tests in CI/CD**:
   - Add test step to GitHub Actions
   - Block merges if tests fail
   - Generate coverage reports

---

**Test Plan Status**: ✅ Specifications Complete, Implementation Pending

**Total Tests Planned**: 125+
- Unit Tests: 100+
- Integration Tests: 25+

Ready to implement automated testing! 🧪
