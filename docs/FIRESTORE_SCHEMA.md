# Firestore Schema & Security Rules
## Shloka Sadhana - Phase 2A: Quest & Achievement System

### Database Structure

```
/users/{userId}/
  ├─ streak: StreakData
  ├─ settings: SettingsData
  ├─ preferences: UserPreferences
  ├─ recentlyPracticed: RecentlyPracticed[]
  │
  ├─ quests/                         # Phase 2A: Quest data
  │   ├─ currentQuest: Quest | null
  │   ├─ completedQuestsCount: number
  │   ├─ stats: QuestStats
  │   └─ lastUpdated: timestamp
  │
  ├─ achievements/                   # Phase 2A: Achievement data
  │   ├─ unlockedCount: number
  │   ├─ stats: AchievementStats
  │   └─ lastUpdated: timestamp
  │
  ├─ /practices/{practiceId}/        # Subcollection: Practice history
  │   ├─ id: string
  │   ├─ shlokaId: string
  │   ├─ shlokaName: string
  │   ├─ duration: number
  │   ├─ malaCount: number
  │   ├─ timestamp: string
  │   └─ ...
  │
  ├─ /completedQuests/{questId}/     # Subcollection: Completed quests
  │   ├─ questId: string
  │   ├─ type: QuestType
  │   ├─ difficulty: QuestDifficulty
  │   ├─ completedAt: string
  │   ├─ xpEarned: number
  │   └─ completionTime: number
  │
  └─ /unlockedAchievements/{achievementId}/  # Subcollection: Unlocked achievements
      ├─ achievementId: string
      ├─ achievement: Achievement
      ├─ unlockedAt: string
      ├─ xpEarned: number
      └─ celebrationShown: boolean
```

---

## Firestore Security Rules

### 1. Install Rules in Firebase Console

1. Open Firebase Console: https://console.firebase.google.com/
2. Select your project: "Shloka Sadhana"
3. Navigate to: **Firestore Database → Rules**
4. Copy and paste the rules below
5. Click **Publish**

### 2. Security Rules Code

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ====================
    // HELPER FUNCTIONS
    // ====================

    // Check if user is authenticated
    function isSignedIn() {
      return request.auth != null;
    }

    // Check if user is accessing their own data
    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    // Check if request has valid timestamp
    function hasValidTimestamp() {
      return request.resource.data.lastUpdated == request.time;
    }

    // ====================
    // USER DATA (Main Document)
    // ====================

    match /users/{userId} {
      // User can read their own document
      allow read: if isSignedIn() && isOwner(userId);

      // User can write their own document
      allow write: if isSignedIn() && isOwner(userId);

      // ====================
      // PRACTICES SUBCOLLECTION
      // ====================

      match /practices/{practiceId} {
        // User can read their own practices
        allow read: if isSignedIn() && isOwner(userId);

        // User can create new practices
        allow create: if isSignedIn() && isOwner(userId)
                      && request.resource.data.id is string
                      && request.resource.data.timestamp is string;

        // User can update their own practices (merge updates)
        allow update: if isSignedIn() && isOwner(userId);

        // User can delete their own practices
        allow delete: if isSignedIn() && isOwner(userId);
      }

      // ====================
      // COMPLETED QUESTS SUBCOLLECTION - Phase 2A
      // ====================

      match /completedQuests/{questId} {
        // User can read their own completed quests
        allow read: if isSignedIn() && isOwner(userId);

        // User can create new completed quests
        allow create: if isSignedIn() && isOwner(userId)
                      && request.resource.data.questId is string
                      && request.resource.data.completedAt is string
                      && request.resource.data.xpEarned is number;

        // User can update completed quests (merge updates)
        allow update: if isSignedIn() && isOwner(userId);

        // User can delete completed quests
        allow delete: if isSignedIn() && isOwner(userId);
      }

      // ====================
      // UNLOCKED ACHIEVEMENTS SUBCOLLECTION - Phase 2A
      // ====================

      match /unlockedAchievements/{achievementId} {
        // User can read their own unlocked achievements
        allow read: if isSignedIn() && isOwner(userId);

        // User can create new unlocked achievements
        allow create: if isSignedIn() && isOwner(userId)
                      && request.resource.data.achievementId is string
                      && request.resource.data.unlockedAt is string
                      && request.resource.data.xpEarned is number;

        // User can update unlocked achievements (merge updates)
        allow update: if isSignedIn() && isOwner(userId);

        // User can delete unlocked achievements
        allow delete: if isSignedIn() && isOwner(userId);
      }
    }

    // ====================
    // DEFAULT: DENY ALL OTHER ACCESS
    // ====================

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## Data Sync Flow

### Quest Completion Flow

```
1. User completes practice
   ↓
2. useQuestStore.updateProgress()
   ↓
3. Quest marked as completed
   ↓
4. useQuestStore.completeQuest()
   ↓
5. Save to AsyncStorage (local)
   ↓
6. useQuestStore.syncToCloud()
   ↓
7. firestoreService.syncQuestData()
   ↓
8. Update /users/{userId}/quests (main document)
   ↓
9. Add to /users/{userId}/completedQuests/{questId} (subcollection)
```

### Achievement Unlock Flow

```
1. User completes practice/quest/milestone
   ↓
2. useAchievementStore.checkAchievements()
   ↓
3. Achievement conditions met
   ↓
4. useAchievementStore.unlockAchievement()
   ↓
5. Save to AsyncStorage (local)
   ↓
6. useAchievementStore.syncToCloud()
   ↓
7. firestoreService.syncAchievements()
   ↓
8. Update /users/{userId}/achievements (main document)
   ↓
9. Add to /users/{userId}/unlockedAchievements/{achievementId} (subcollection)
```

### Sign-In Sync Flow

```
1. User signs in with Google/Apple/Email
   ↓
2. Check if cloud data exists
   ↓
3. If cloud data exists:
   ├─ Load all user data from Firestore
   ├─ Merge with local data (cloud takes precedence)
   └─ Save to AsyncStorage
   ↓
4. If no cloud data:
   ├─ Upload local data to Firestore
   └─ Continue with local data
```

---

## Firestore Indexes

### Required Indexes

Add these composite indexes in **Firestore Database → Indexes**:

#### 1. Practices Query
```
Collection: users/{userId}/practices
Fields:
  - timestamp (Descending)
Query Scope: Collection
```

#### 2. Completed Quests Query
```
Collection: users/{userId}/completedQuests
Fields:
  - completedAt (Descending)
Query Scope: Collection
```

#### 3. Unlocked Achievements Query
```
Collection: users/{userId}/unlockedAchievements
Fields:
  - unlockedAt (Descending)
Query Scope: Collection
```

**Note**: Firebase will automatically suggest creating these indexes when you first query the collections. Click "Create Index" when prompted.

---

## Testing Firestore Rules

### Test in Firebase Console

1. Go to **Firestore Database → Rules → Playground**
2. Test scenarios:

#### Test 1: Authenticated User Reads Own Data
```
Simulation Type: get
Location: /users/testUserId123
Auth: Authenticated (UID: testUserId123)
Expected: Allow ✅
```

#### Test 2: Unauthenticated User Reads Data
```
Simulation Type: get
Location: /users/testUserId123
Auth: Unauthenticated
Expected: Deny ❌
```

#### Test 3: User Reads Another User's Data
```
Simulation Type: get
Location: /users/anotherUserId456
Auth: Authenticated (UID: testUserId123)
Expected: Deny ❌
```

#### Test 4: User Writes Quest Data
```
Simulation Type: create
Location: /users/testUserId123/completedQuests/quest_001
Auth: Authenticated (UID: testUserId123)
Data:
{
  "questId": "quest_001",
  "completedAt": "2026-02-10T10:00:00Z",
  "xpEarned": 50
}
Expected: Allow ✅
```

---

## Data Size Limits

### Firestore Limits (Free Tier)

- **Document Size**: 1 MB max
- **Subcollection Depth**: 100 levels (we use 2)
- **Writes per Second**: 10,000 (we're well below this)
- **Reads per Day**: 50,000 (free tier)
- **Writes per Day**: 20,000 (free tier)

### Our Usage Estimate (per user per day)

- **Quest sync**: ~2 writes (update quest, add completed quest)
- **Achievement sync**: ~1 write (unlock achievement)
- **Practice sync**: ~1-5 writes (practices completed)
- **Total**: ~4-8 writes per day per user

**With 1000 users**: ~4,000-8,000 writes/day (within free tier)

---

## Backup & Recovery

### Automatic Backups

Firebase Firestore does NOT have automatic backups on the free tier.

### Manual Backup (Recommended)

Use Firebase CLI to export data weekly:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Export Firestore data
firebase firestore:export gs://your-bucket-name/backups/$(date +%Y%m%d)
```

### Data Recovery

If a user deletes their data by accident:

1. **From Firestore**: Restore from manual backup (if exists)
2. **From AsyncStorage**: Data persists locally on device
3. **No backup**: Data is permanently lost

**Note**: Implement account deletion confirmation in app UI.

---

## Monitoring & Debugging

### Firebase Console Monitoring

1. **Firestore Usage**: Monitor reads/writes
   - Dashboard → Firestore Database → Usage

2. **Error Logs**: Check for permission denied errors
   - Logging → Logs Explorer → Filter: `resource.type="cloud_firestore"`

3. **Real-time Data**: View documents in real-time
   - Firestore Database → Data tab

### App-Side Logging

All Firestore operations log to console:

```typescript
[Firestore] Quest data synced to cloud
[Firestore] Achievement data loaded from cloud
[Firestore] Error syncing to cloud: [error]
```

Check logs in:
- **iOS**: Xcode → Console
- **Android**: Android Studio → Logcat
- **Expo**: Metro bundler terminal

---

## Next Steps: Week 14+

Week 14-18 will add more Firestore collections:

- **Week 16**: `/publicProfiles/{userId}`, `/friendRequests/{requestId}`, `/friendships/{friendshipId}`
- **Week 17**: `/activityFeed/{activityId}`, `/groups/{groupId}/members/{userId}`
- **Week 18**: `/groups/{groupId}/challenges/{challengeId}/leaderboard/{userId}`, `/referrals/{referralCode}`

These will require additional security rules.

---

## Questions?

- **Firestore Docs**: https://firebase.google.com/docs/firestore
- **Security Rules**: https://firebase.google.com/docs/firestore/security/get-started
- **React Native Firebase**: https://rnfirebase.io/firestore/usage
