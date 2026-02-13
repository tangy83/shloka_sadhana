# Firebase Authentication Setup Guide
## Shloka Sadhana - P0 #51 (Days 44-50)

**Status**: 🚧 In Progress - Day 44
**Required**: Manual setup by developer

---

## Prerequisites

You already have Firebase installed for Analytics:
- ✅ `@react-native-firebase/app`: ^23.8.6
- ✅ `@react-native-firebase/analytics`: ^23.8.6
- ✅ Firebase project exists in console
- ✅ `GoogleService-Info.plist` (iOS) configured
- ✅ `google-services.json` (Android) configured

---

## Step 1: Install Dependencies

Run these commands in your terminal:

```bash
# Install Firebase Auth
npm install @react-native-firebase/auth

# Install Google Sign-In
npm install @react-native-google-signin/google-signin

# Install Apple Authentication (for iOS)
npx expo install expo-apple-authentication

# Install Fuse.js (for search - P0 #24)
npm install fuse.js
```

**Expected versions**:
- `@react-native-firebase/auth`: ^23.8.6 (matches your Firebase app version)
- `@react-native-google-signin/google-signin`: ^13.1.0
- `expo-apple-authentication`: Latest compatible with Expo SDK 54
- `fuse.js`: ^7.0.0

---

## Step 2: Firebase Console Setup

### Enable Authentication Methods

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: "Shloka Sadhana"
3. **Navigate to**: Authentication → Sign-in method (left sidebar)
4. **Enable these providers**:

#### Google Sign-In
- Click "Google" → Enable
- Support email: Your email address
- Click "Save"

#### Apple Sign-In (Required for iOS)
- Click "Apple" → Enable
- **Note**: Requires Apple Developer account ($99/year)
- You'll need to configure in Step 3

#### Email/Password (Fallback)
- Click "Email/Password" → Enable
- Don't enable "Email link (passwordless sign-in)" for now
- Click "Save"

---

## Step 3: iOS Configuration (Apple Sign-In)

### 3.1 Apple Developer Portal

1. **Go to**: https://developer.apple.com/account/
2. **Navigate to**: Certificates, Identifiers & Profiles → Identifiers
3. **Find your App ID**: `com.shlokasadhna.app`
4. **Edit capabilities**:
   - Check "Sign in with Apple"
   - Click "Save"

### 3.2 Xcode Configuration

1. **Open your project in Xcode**:
   ```bash
   open ios/shlokasadhana.xcworkspace
   ```

2. **Select your target**: shlokasadhana (in left sidebar)

3. **Go to**: Signing & Capabilities tab

4. **Add capability**:
   - Click "+ Capability" button
   - Search for "Sign in with Apple"
   - Add it

5. **Verify**: You should see "Sign in with Apple" in the capabilities list

### 3.3 Update app.json

Add Apple Sign-In entitlement:

```json
{
  "expo": {
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.shlokasadhna.app",
      "googleServicesFile": "./ios/shlokasadhana/GoogleService-Info.plist",
      "entitlements": {
        "com.apple.developer.applesignin": ["Default"]
      }
    }
  }
}
```

---

## Step 4: Android Configuration (Google Sign-In)

### 4.1 Get Web Client ID

1. **Go to Firebase Console**: Project Settings
2. **Scroll to**: "Your apps" section
3. **Find**: Web app (if none, add one: "Add app" → Web)
4. **Copy**: Web client ID (format: `123456789-abc123.apps.googleusercontent.com`)

### 4.2 Configure Google Sign-In

You'll need this Web Client ID for the Auth Service (Step 5).

---

## Step 5: Update Auth Service with Web Client ID

After getting your Web Client ID, update [src/services/auth.ts](src/services/auth.ts):

```typescript
// Line 9: Replace with your actual Web Client ID
GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID_HERE', // ← Replace this!
});
```

**Example**:
```typescript
GoogleSignin.configure({
  webClientId: '123456789-abc123.apps.googleusercontent.com',
});
```

---

## Step 6: Rebuild Native App

Since we added native modules (Firebase Auth, Google Sign-In), you MUST rebuild:

```bash
# Clean previous builds
npx expo prebuild --clean

# Rebuild for iOS
npx expo run:ios

# OR rebuild for Android
npx expo run:android
```

**Why rebuild?**
- Native modules require Xcode/Android Studio compilation
- `expo-dev-client` needs to include new native code
- Changes to entitlements/capabilities require native build

**Note**: This will take 5-10 minutes. Don't skip this step!

---

## Step 7: Verify Installation

### 7.1 Check Dependencies

```bash
npm list @react-native-firebase/auth
npm list @react-native-google-signin/google-signin
npm list expo-apple-authentication
npm list fuse.js
```

All should show versions without errors.

### 7.2 Test Auth Service

After rebuild, test in your app:

```typescript
import { authService } from '@/services/auth';

// Check if service is accessible
console.log('Auth service loaded:', authService);

// Check current user (should be null initially)
console.log('Current user:', authService.getCurrentUser());
```

---

## Step 8: Firestore Security Rules

Before implementing cloud backup (P0 #50), set up Firestore security rules:

1. **Go to Firebase Console**: Firestore Database
2. **Click**: Rules tab
3. **Replace with**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

4. **Click**: Publish

**What this does**:
- Only authenticated users can access Firestore
- Users can only read/write documents in `/users/{their_uid}/` path
- Prevents unauthorized access to other users' data

---

## Troubleshooting

### Error: "GoogleSignin is not defined"

**Cause**: Dependencies not installed or app not rebuilt

**Fix**:
```bash
npm install @react-native-google-signin/google-signin
npx expo prebuild --clean
npx expo run:ios
```

### Error: "Firebase Auth module not found"

**Cause**: Firebase Auth not installed

**Fix**:
```bash
npm install @react-native-firebase/auth
npx expo prebuild --clean
npx expo run:ios
```

### Error: "Sign in with Apple failed"

**Cause**: Not configured in Apple Developer Portal or Xcode

**Fix**:
1. Check Apple Developer Portal (Step 3.1)
2. Check Xcode capabilities (Step 3.2)
3. Ensure app.json has entitlements (Step 3.3)
4. Rebuild app

### Error: "Google Sign-In failed: DEVELOPER_ERROR"

**Cause**: Web Client ID not configured

**Fix**:
1. Get Web Client ID from Firebase Console (Step 4.1)
2. Update `auth.ts` line 9 (Step 5)
3. Restart app (no rebuild needed for config change)

### Error: "Apple Sign-In not available"

**Cause**: Testing on Android or iOS Simulator without proper setup

**Fix**:
- Apple Sign-In only works on physical iOS devices with iOS 13+
- OR use iOS Simulator with iCloud account signed in
- Android doesn't support Apple Sign-In

---

## Testing Checklist

After setup, test each auth method:

### Google Sign-In
- [ ] Tap "Continue with Google" on LoginScreen
- [ ] Google account picker appears
- [ ] Select account
- [ ] User signed in (check `authService.getCurrentUser()`)
- [ ] User appears in Firebase Console → Authentication

### Apple Sign-In (iOS only)
- [ ] Tap "Continue with Apple" on LoginScreen
- [ ] Face ID / Touch ID prompt appears
- [ ] Approve
- [ ] User signed in
- [ ] User appears in Firebase Console → Authentication

### Email/Password
- [ ] Tap "Sign In with Email" on LoginScreen
- [ ] Enter email and password
- [ ] Tap "Sign In"
- [ ] User signed in
- [ ] User appears in Firebase Console → Authentication

### Sign Out
- [ ] Go to Settings screen
- [ ] Tap "Sign Out"
- [ ] User signed out (returns to LoginScreen or Home)
- [ ] `authService.getCurrentUser()` returns null

---

## Next Steps

Once setup is complete and tests pass:

1. ✅ Mark "Install Firebase Auth dependencies" todo as complete
2. ✅ Service files are already created (auth.ts, AuthContext.tsx, LoginScreen.tsx)
3. ✅ Continue to P0 #50: Cloud Backup (Firestore sync)

---

## Files Created

This setup guide references these files (already created):
- [src/services/auth.ts](src/services/auth.ts) - Auth service (needs Web Client ID)
- [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx) - React context for auth state
- [src/screens/auth/LoginScreen.tsx](src/screens/auth/LoginScreen.tsx) - Login UI
- [src/screens/auth/SignUpScreen.tsx](src/screens/auth/SignUpScreen.tsx) - Sign up UI

**Remember**: Update `auth.ts` line 9 with your Web Client ID after Step 4!

---

## Summary

**Total Time**: 1-2 hours (mostly Firebase Console + Xcode)
**Complexity**: Moderate (requires native configuration)
**Blocking**: Yes (must complete before P0 #50 Cloud Backup)

**Key Points**:
- ✅ Install 4 npm packages
- ✅ Enable 3 auth methods in Firebase Console
- ✅ Configure Apple Sign-In in Xcode + Apple Developer Portal
- ✅ Get Web Client ID for Google Sign-In
- ✅ Update auth.ts with Web Client ID
- ✅ Rebuild native app (CRITICAL)
- ✅ Test all 3 sign-in methods

**When done**: You'll have a fully working authentication system with Google, Apple, and Email sign-in! 🎉

---

**Status**: 📝 Setup Instructions Complete
**Next**: Run setup steps, then create auth service files
