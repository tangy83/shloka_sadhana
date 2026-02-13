# Firebase Setup Guide
## Shloka Sadhana - Analytics Configuration

This guide walks you through setting up Firebase Analytics for the Shloka Sadhana app.

## Prerequisites

- Firebase account (create one at https://console.firebase.google.com)
- Access to iOS and Android app bundle IDs from app.json

## Step-by-Step Setup

### Step 1: Create Firebase Project

1. Go to https://console.firebase.google.com/
2. Click **"Add project"**
3. Enter project name: **"Shloka Sadhana"**
4. **Disable** Google Analytics for Firebase (we're using Firebase Analytics, not Google Analytics)
5. Click **"Create project"**
6. Wait for project creation to complete

### Step 2: Add iOS App

1. In Firebase Console, click **"Add app"** → Select **iOS** icon
2. iOS bundle ID: `com.shlokasadhana.app` (from your app.json)
3. App nickname (optional): "Shloka Sadhana iOS"
4. Click **"Register app"**
5. **Download GoogleService-Info.plist**
6. Save the file to: `ios/shlokasadhana/GoogleService-Info.plist`
   ```bash
   # Create directory if it doesn't exist
   mkdir -p ios/shlokasadhana

   # Move the downloaded file
   mv ~/Downloads/GoogleService-Info.plist ios/shlokasadhana/
   ```
7. Click **"Next"** through remaining steps (SDK already installed)

### Step 3: Add Android App

1. In Firebase Console, click **"Add app"** → Select **Android** icon
2. Android package name: `com.shlokasadhana.app` (from your app.json)
3. App nickname (optional): "Shloka Sadhana Android"
4. Click **"Register app"**
5. **Download google-services.json**
6. Save the file to: `android/app/google-services.json`
   ```bash
   # Create directory if it doesn't exist
   mkdir -p android/app

   # Move the downloaded file
   mv ~/Downloads/google-services.json android/app/
   ```
7. Click **"Next"** through remaining steps (SDK already installed)

### Step 4: Configure app.json

Add Firebase plugin configuration to your `app.json`:

```json
{
  "expo": {
    "plugins": [
      "@react-native-firebase/app",
      "@react-native-firebase/analytics"
    ],
    "ios": {
      "googleServicesFile": "./ios/shlokasadhana/GoogleService-Info.plist",
      "bundleIdentifier": "com.shlokasadhana.app"
    },
    "android": {
      "googleServicesFile": "./android/app/google-services.json",
      "package": "com.shlokasadhana.app"
    }
  }
}
```

### Step 5: Rebuild App

Firebase requires native modules, so you need to rebuild:

```bash
# Clean and rebuild
npx expo prebuild --clean

# Run on iOS
npx expo run:ios

# OR run on Android
npx expo run:android
```

**Note:** You cannot use `expo start` or `expo go` with Firebase. You must use development builds.

### Step 6: Verify Setup

1. Run the app on a simulator/device
2. Open Firebase Console → Analytics → Dashboard
3. You should see "1 active user" within a few minutes
4. Check DebugView for real-time events:
   - Firebase Console → Analytics → DebugView
   - Events should appear when you interact with the app

### Step 7: Enable DebugView (Optional - for development)

**iOS:**
```bash
# Enable debug mode
npx expo run:ios --device -- -FIRDebugEnabled

# Disable debug mode
npx expo run:ios --device -- -FIRDebugDisabled
```

**Android:**
```bash
# Enable debug mode
adb shell setprop debug.firebase.analytics.app com.shlokasadhana.app

# Disable debug mode
adb shell setprop debug.firebase.analytics.app .none.
```

## Troubleshooting

### "GoogleService-Info.plist not found"
- Ensure the file is in `ios/shlokasadhana/GoogleService-Info.plist`
- Run `npx expo prebuild --clean` after adding the file

### "google-services.json not found"
- Ensure the file is in `android/app/google-services.json`
- Run `npx expo prebuild --clean` after adding the file

### "App crashes on launch"
- Check that bundle IDs match in Firebase Console and app.json
- Verify GoogleService files are in correct locations
- Check Xcode/Android Studio logs for specific errors

### "No analytics data in Firebase Console"
- Wait 24 hours for initial data aggregation
- Use DebugView for real-time verification
- Ensure app is built with `npx expo run:ios/android` (not Expo Go)

## Next Steps

Once Firebase is configured:
1. ✅ Analytics will automatically track screen views
2. ✅ Custom events are already instrumented in the app
3. ✅ Check Firebase Console → Analytics to see data

## Privacy Considerations

- Firebase Analytics is GDPR/CCPA compliant by default
- No personally identifiable information (PII) is collected
- Users are assigned anonymous IDs
- Data retention is set to 14 months (configurable in Firebase Console)
- Privacy policy has been updated to mention analytics

## Resources

- [Firebase iOS Setup](https://rnfirebase.io/#installation)
- [Firebase Android Setup](https://rnfirebase.io/#installation)
- [Firebase Analytics Documentation](https://rnfirebase.io/analytics/usage)
- [Expo Firebase Guide](https://docs.expo.dev/guides/using-firebase/)
