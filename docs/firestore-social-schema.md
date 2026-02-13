# Firestore Social Schema
**Phase 2A Week 16: Friend System**

This document describes the Firestore collections and security rules for social features.

## Collections

### 1. publicProfiles

**Purpose**: User's public profile visible to all users for search and friend discovery.

**Path**: `/publicProfiles/{userId}`

**Fields**:
```typescript
{
  id: string;                    // User ID (same as auth().currentUser.uid)
  displayName: string;           // User's display name
  photoURL: string | null;       // Profile photo URL (optional)
  currentStreak: number;         // Current practice streak in days
  totalPractices: number;        // Total completed practices
  totalMinutes: number;          // Total practice time in minutes
  favoriteDeity?: string;        // Favorite deity from onboarding
  privacySettings: {
    showStreak: boolean;         // Allow others to see streak
    showPractices: boolean;      // Allow others to see practice count
    allowFriendRequests: boolean; // Allow incoming friend requests
  };
  createdAt: string;             // ISO timestamp of profile creation
  updatedAt: string;             // ISO timestamp of last update
}
```

**Indexes**: None required for MVP (displayName search done client-side)

**Security Rules**:
- **Read**: Anyone can read (for search functionality)
- **Write**: Only the user who owns the profile

---

### 2. friendRequests

**Purpose**: Pending friend requests between users.

**Path**: `/friendRequests/{requestId}`

**Fields**:
```typescript
{
  id: string;                         // Auto-generated request ID
  fromUserId: string;                 // Sender's user ID
  fromUserProfile: UserProfile;       // Denormalized sender profile (for display)
  toUserId: string;                   // Recipient's user ID
  status: 'pending' | 'accepted' | 'rejected'; // Request status
  createdAt: string;                  // ISO timestamp of request creation
  respondedAt: string | null;         // ISO timestamp of response (null if pending)
}
```

**Indexes**:
- Composite index on `fromUserId` + `status` (for outgoing requests query)
- Composite index on `toUserId` + `status` (for incoming requests query)

**Security Rules**:
- **Read**: Both sender and recipient can read
- **Create**: Authenticated users can create (sender validates via client)
- **Update**: Only recipient can update (accept/decline)
- **Delete**: Only sender can delete (cancel)

---

### 3. friendships

**Purpose**: Active friendships between users.

**Path**: `/friendships/{friendshipId}`

**Friendship ID Format**: Deterministic, alphabetically sorted user IDs joined by underscore.
Example: `user_abc_def` where "abc" < "def"

**Fields**:
```typescript
{
  id: string;                         // Friendship ID (deterministic)
  users: [string, string];            // Array of 2 user IDs (alphabetically sorted)
  status: 'active' | 'blocked';       // Friendship status
  createdAt: string;                  // ISO timestamp of friendship creation
  lastInteraction: string | null;     // ISO timestamp of last interaction (future use)
}
```

**Indexes**:
- Single field index on `users` (array-contains query for user's friends)

**Security Rules**:
- **Read**: Both users in friendship can read
- **Write**: Both users can write (for remove/block)

---

## Data Flow

### Creating a Friend Request

1. User A searches for User B by display name
2. Client queries `publicProfiles` collection (case-insensitive client-side filtering)
3. User A sends friend request
4. Client creates document in `friendRequests`:
   ```typescript
   {
     id: auto-generated,
     fromUserId: userA_id,
     fromUserProfile: { ... }, // Denormalized for display
     toUserId: userB_id,
     status: 'pending',
     createdAt: new Date().toISOString(),
     respondedAt: null
   }
   ```

### Accepting a Friend Request

1. User B views incoming requests (query `friendRequests` where `toUserId == userB_id` and `status == 'pending'`)
2. User B accepts request
3. Client updates request status:
   ```typescript
   friendRequests/{requestId}.update({
     status: 'accepted',
     respondedAt: new Date().toISOString()
   })
   ```
4. Client creates friendship document:
   ```typescript
   const friendshipId = [userA_id, userB_id].sort().join('_');
   friendships/{friendshipId}.set({
     id: friendshipId,
     users: [userA_id, userB_id].sort(),
     status: 'active',
     createdAt: new Date().toISOString(),
     lastInteraction: null
   })
   ```

### Declining/Canceling a Request

**Decline (User B)**:
```typescript
friendRequests/{requestId}.update({
  status: 'rejected',
  respondedAt: new Date().toISOString()
})
```

**Cancel (User A)**:
```typescript
friendRequests/{requestId}.delete()
```

### Removing a Friend

1. Either user initiates unfriend
2. Client deletes friendship document:
   ```typescript
   const friendshipId = [userA_id, userB_id].sort().join('_');
   friendships/{friendshipId}.delete()
   ```

---

## Profile Migration

When a user signs in for the first time after the social features update, create their public profile:

```typescript
const migrateUserToPublicProfile = async (user: FirebaseAuthUser) => {
  const profileRef = firestore().collection('publicProfiles').doc(user.uid);
  const exists = await profileRef.get();

  if (!exists.exists) {
    // Get current stats from useUserStore
    const { currentStreak, totalPractices, totalMinutes } = useUserStore.getState();
    const { preferredDeity } = useUserStore.getState().preferences;

    await profileRef.set({
      id: user.uid,
      displayName: user.displayName || 'Anonymous',
      photoURL: user.photoURL || null,
      currentStreak,
      totalPractices,
      totalMinutes,
      favoriteDeity: preferredDeity,
      privacySettings: {
        showStreak: true,
        showPractices: true,
        allowFriendRequests: true,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
};
```

**Trigger**: Call this function in `AuthContext` after successful sign-in.

---

## Sync Strategy

**Profile Updates**: Update public profile after each practice completion.

```typescript
// In PracticeScreen after saving practice
if (auth().currentUser) {
  await friendService.createOrUpdateProfile(auth().currentUser.uid, {
    displayName: auth().currentUser.displayName || 'Anonymous',
    photoURL: auth().currentUser.photoURL,
    currentStreak: useUserStore.getState().currentStreak,
    totalPractices: useUserStore.getState().totalPractices,
    totalMinutes: useUserStore.getState().totalMinutes,
  });
}
```

**Friends List**: Load on app start and cache locally.

```typescript
// In useSocialStore
useEffect(() => {
  if (auth().currentUser) {
    loadFriends();
    loadRequests();
  }
}, [auth().currentUser]);
```

---

## Performance Considerations

### Client-Side Search (MVP)

**Current approach**: Fetch up to 50 public profiles and filter client-side.

**Limitations**:
- Won't scale beyond ~1000 users
- Case-insensitive search requires downloading all documents

**Future improvement**: Use Algolia or similar search service for production.

### Denormalization

**Friend Requests**: Sender profile is denormalized into request document to avoid extra reads.

```typescript
{
  fromUserId: "abc",
  fromUserProfile: {
    displayName: "Priya",
    photoURL: "...",
    currentStreak: 15
  },
  // ...
}
```

**Trade-off**: If sender updates their profile, existing requests won't reflect changes. This is acceptable for MVP as requests are typically short-lived.

---

## Analytics Events

Track social feature usage:

```typescript
// When user searches
analyticsService.trackEvent('user_search', {
  query,
  results_count: results.length
});

// When friend request sent
analyticsService.trackEvent('friend_request_sent', {
  to_user_id: toUserId
});

// When request accepted
analyticsService.trackEvent('friend_request_accepted', {
  from_user_id: fromUserId
});

// When friend removed
analyticsService.trackEvent('friend_removed', {
  friend_user_id: friendUserId
});
```

---

## Testing Checklist

- [ ] Create public profile on first sign-in
- [ ] Update profile after practice completion
- [ ] Search users by display name (case-insensitive)
- [ ] Send friend request (prevents duplicates)
- [ ] Accept friend request (creates friendship)
- [ ] Decline friend request (marks as rejected)
- [ ] Cancel friend request (deletes request)
- [ ] Remove friend (deletes friendship)
- [ ] View friends list with current streaks
- [ ] View incoming requests
- [ ] View outgoing requests
- [ ] Friendship status shown in search results
- [ ] Privacy settings respected (don't allow requests if disabled)
- [ ] Security rules prevent unauthorized access

---

## Future Enhancements

### Week 17: Activity Feed
- Add `activityFeed` collection for friend activities
- Denormalize activities to friends' feeds for performance
- Real-time listeners for instant updates

### Week 18: Groups
- Add `groups` and `groupMembers` collections
- Group-based challenges and leaderboards

### Production Scaling
- Implement Algolia search for large user base
- Add Cloud Functions for server-side operations (friend request validation, cleanup)
- Batch operations for bulk friend management
- Pagination for large friends lists (>100 friends)
