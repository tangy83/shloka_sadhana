# Firestore Cloud Backup Setup Guide
## Shloka Sadhana - P0 #50 (Days 51-54)

**Status**: 🚧 In Progress - Day 51
**Required**: Manual setup by developer

---

## Prerequisites

You already have Firebase setup for Analytics and Auth:
- ✅ Firebase project exists
- ✅ `@react-native-firebase/app`: ^23.8.6
- ✅ `@react-native-firebase/analytics`: ^23.8.6
- ✅ `@react-native-firebase/auth`: ^23.8.6 (just installed)
- ✅ Authentication enabled

---

## Step 1: Install Firestore

Run this command:

```bash
npm install @react-native-firebase/firestore
```

**Expected version**: `@react-native-firebase/firestore`: ^23.8.6 (matches Firebase app version)

---

## Step 2: Enable Firestore in Firebase Console

### 2.1 Create Firestore Database

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: "Shloka Sadhana"
3. **Navigate to**: Firestore Database (left sidebar)
4. **Click**: "Create database"

### 2.2 Choose Mode

**Select**: Production mode
- Starts with secure rules (users can only access their own data)
- We'll add rules in Step 3

**Don't select**: Test mode (allows anyone to read/write - insecure!)

### 2.3 Choose Location

**Recommended**: `us-central1` (or closest to your users)
- This is permanent - can't change later
- Affects data latency
- US users: `us-central1`
- Europe users: `europe-west1`
- Asia users: `asia-southeast1`

**Click**: Enable

**Wait**: ~30 seconds for database creation

---

## Step 3: Set Up Security Rules

**CRITICAL**: These rules prevent unauthorized access to user data.

### 3.1 Navigate to Rules

1. In Firebase Console → Firestore Database
2. Click **"Rules"** tab (top of page)

### 3.2 Replace Default Rules

**Delete** the default rules and **paste** this:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users collection - each user has their own document
    match /users/{userId} {
      // Allow read/write only if authenticated AND accessing own data
      allow read, write: if request.auth != null && request.auth.uid == userId;

      // Subcollections under user document
      match /{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }

    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 3.3 Publish Rules

**Click**: "Publish"

**What these rules do**:
- ✅ Users can only access `/users/{their_uid}/` documents
- ✅ Users can access all subcollections under their document
- ✅ Unauthenticated users have no access
- ✅ Users cannot read other users' data
- ❌ Everything else is denied

### 3.4 Test Rules (Optional)

Click "Rules Playground" tab:
1. Select: `get` operation
2. Location: `/users/test123`
3. Authenticated: Yes
4. Auth UID: `test123`
5. Click "Run" → Should show "Allowed ✅"

6. Change Auth UID to `different456`
7. Click "Run" → Should show "Denied ❌"

---

## Step 4: Rebuild App (Native Module)

Since Firestore is a native module, you must rebuild:

```bash
# Clean and rebuild
npx expo prebuild --clean

# Rebuild for iOS
npx expo run:ios

# OR rebuild for Android
npx expo run:android
```

**Why?** Native modules require Xcode/Android Studio compilation. Hot reload won't work.

---

## Step 5: Verify Firestore Integration

After rebuilding, test in your app:

```typescript
import firestore from '@react-native-firebase/firestore';

// Check if Firestore is accessible
console.log('Firestore initialized:', firestore());

// Try writing a test document (must be signed in)
const testWrite = async () => {
  const userId = authService.getCurrentUser()?.uid;
  if (!userId) {
    console.log('Not signed in');
    return;
  }

  try {
    await firestore()
      .collection('users')
      .doc(userId)
      .set({ test: 'Hello from Firestore!' });
    console.log('✅ Firestore write successful');
  } catch (error) {
    console.error('❌ Firestore error:', error);
  }
};
```

**Expected Result**: Console shows "✅ Firestore write successful"

**Check Firebase Console**:
- Firestore Database → Data tab
- You should see: `/users/{your_uid}/` document with `{ test: 'Hello from Firestore!' }`

---

## Step 6: Enable Offline Persistence (Built-in)

Good news: Firestore has **automatic offline persistence**!

**How it works**:
- When online: Writes go to cloud immediately
- When offline: Writes queued locally
- When reconnected: Automatic background sync

**No extra configuration needed** - it's enabled by default in React Native Firebase.

---

## Step 7: Firestore Console - Monitoring

### View Data

**Firebase Console → Firestore Database → Data tab**

You'll see your data structure:
```
users/
  {userId}/
    streak: { currentStreak: 5, longestStreak: 10, ... }
    settings: { notificationsEnabled: true, ... }
    practices/
      {practiceId}/
        shlokaId: "gayatri"
        timestamp: "2026-02-09T10:30:00Z"
        duration: 300
```

### Monitor Usage

**Firebase Console → Firestore Database → Usage tab**

Free tier limits:
- **Reads**: 50,000/day
- **Writes**: 20,000/day
- **Deletes**: 20,000/day
- **Storage**: 1 GB

**Your app usage** (estimated for 100 active users):
- Reads: ~500/day (5 per user per session)
- Writes: ~200/day (2 per user per session)
- Storage: ~10 MB
- **Well within free tier** ✅

---

## Troubleshooting

### Error: "Firestore module not found"

**Cause**: Dependencies not installed or app not rebuilt

**Fix**:
```bash
npm install @react-native-firebase/firestore
npx expo prebuild --clean
npx expo run:ios
```

### Error: "Permission denied"

**Cause**: Security rules blocking access or user not signed in

**Fix**:
1. Check user is signed in: `authService.getCurrentUser()`
2. Verify security rules published (Step 3)
3. Check Firestore Rules Playground (Step 3.4)

### Error: "Network error" or "Unavailable"

**Cause**: No internet connection

**Fix**:
- This is expected when offline
- Firestore will queue writes and sync when online
- Check: `firestore().settings.persistence` is enabled (default)

### Data not syncing

**Cause**: User not signed in or sync not triggered

**Fix**:
1. Verify user signed in: `const { user } = useAuth()`
2. Check console logs for sync messages
3. Manually trigger sync: `await useUserStore.getState().syncToCloud()`

---

## Testing Checklist

After setup, test these scenarios:

### Online Sync
- [ ] Sign in with auth
- [ ] Complete a practice
- [ ] Check Firebase Console → Firestore → Data
- [ ] Verify practice appears in `/users/{uid}/practices/`

### Offline Sync
- [ ] Enable airplane mode
- [ ] Complete a practice
- [ ] Check local data still saved
- [ ] Disable airplane mode
- [ ] Wait 5 seconds
- [ ] Check Firebase Console - practice should appear

### Cross-Device Sync
- [ ] Sign in on Device A
- [ ] Complete a practice
- [ ] Sign out
- [ ] Sign in on Device B (same account)
- [ ] Check practice history loaded
- [ ] Verify streak matches

### Conflict Resolution
- [ ] Offline on Device A: Complete practice (streak = 5)
- [ ] Offline on Device B: Complete practice (streak = 6)
- [ ] Bring Device A online first → Syncs (streak = 5)
- [ ] Bring Device B online → Syncs (streak = 6 overwrites)
- [ ] Result: Last write wins (Device B's data)

---

## Data Structure

Firestore will store data in this structure:

```
users/
  {userId}/                          // Document: User's root
    streak:                          // Field: Streak data
      currentStreak: 15
      longestStreak: 21
      lastCompletedDate: "2026-02-09"
      totalPractices: 47

    settings:                        // Field: Settings data
      notificationsEnabled: true
      notificationTime: "07:00"
      theme: "dark"

    preferences:                     // Field: User preferences
      experienceLevel: "intermediate"
      dailyTime: "10-20"
      preferredDeity: "Lord Shiva"

    practices/                       // Subcollection: Practice history
      {practiceId}/                  // Document: Individual practice
        shlokaId: "gayatri"
        shlokaName: "Gayatri Mantra"
        timestamp: "2026-02-09T10:30:00Z"
        duration: 300
        malaCount: 1
        sankalp: "Inner peace"
        offering: "To Lord Brahma"
```

**Why this structure?**
- **Flat user document**: Fast reads (streak, settings in one query)
- **Practices subcollection**: Scalable (thousands of practices won't slow down user document)
- **practiceId**: UUID ensures uniqueness across devices

---

## Cost Estimation (Free Tier)

**Free tier includes**:
- 50,000 document reads/day
- 20,000 document writes/day
- 20,000 document deletes/day
- 1 GB storage

**Your app (100 daily active users)**:
- **Reads**: ~500/day
  - Sign in: 1 read (load streak)
  - Load practices: 5 reads (last 5 practices)
  - Total: 6 reads per user × 100 users = 600 reads/day
- **Writes**: ~200/day
  - Complete practice: 2 writes (update streak + create practice doc)
  - Total: 2 writes per user × 100 users = 200 writes/day
- **Storage**: ~10 MB
  - User doc: ~1 KB per user × 100 = 100 KB
  - Practices: ~500 bytes × 50 practices/user × 100 users = 2.5 MB

**Conclusion**: Well within free tier! 🎉

**At 1,000 users**: Still free (6,000 reads, 2,000 writes, 25 MB storage)

**At 10,000 users**: Need Blaze plan (~$10/month for ~2,500 users over free tier)

---

## Next Steps

Once setup is complete:

1. ✅ Firestore enabled in Firebase Console
2. ✅ Security rules published
3. ✅ App rebuilt with Firestore module
4. ✅ Test write verified in console
5. ✅ Mark "Install Firestore dependencies" todo as complete
6. ✅ Continue to Firestore service implementation

---

## Summary

**Setup Time**: 15-30 minutes
**Complexity**: Low (mostly Firebase Console clicks)
**Blocking**: Yes (must complete before cloud sync works)

**Key Steps**:
1. Install `@react-native-firebase/firestore`
2. Enable Firestore in console (Production mode)
3. Set up security rules (copy/paste provided rules)
4. Rebuild app (`npx expo prebuild --clean && npx expo run:ios`)
5. Test with sample write

**When done**: You'll have a secure Firestore database ready for cloud sync! 🚀

---

**Status**: 📝 Setup Instructions Complete
**Next**: Create Firestore service for syncing practices, streaks, settings
