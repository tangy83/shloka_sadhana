# App Store & Play Store Submission Checklist
**Shloka Sadhana - iOS & Android Release Preparation**

Last Updated: 2026-02-05

---

## Status Overview

| Category | iOS App Store | Google Play Store | Status |
|----------|--------------|-------------------|---------|
| App Build | ❌ Not Started | ❌ Not Started | Needed |
| Metadata | ❌ Not Started | ❌ Not Started | Needed |
| Graphics | ❌ Not Started | ❌ Not Started | Needed |
| Privacy | ⚠️ Partial | ⚠️ Partial | Needs Review |
| Legal | ❌ Not Started | ❌ Not Started | Needed |
| Testing | ✅ Complete | ✅ Complete | Done (V2) |

---

## 1. APP BUILD REQUIREMENTS

### iOS Build (via EAS Build)
- [ ] **Apple Developer Account** ($99/year)
- [ ] **Bundle Identifier** (e.g., com.yourcompany.shlokasadhana)
- [ ] **App Icon** (all required sizes)
- [ ] **Splash Screen**
- [ ] **Build with Expo EAS**
  ```bash
  eas build --platform ios
  ```
- [ ] **TestFlight Beta Testing** (optional but recommended)
- [ ] **Production Build** ready for submission

### Android Build (via EAS Build)
- [ ] **Google Play Developer Account** ($25 one-time)
- [ ] **Package Name** (e.g., com.yourcompany.shlokasadhana)
- [ ] **App Icon** (all required sizes)
- [ ] **Splash Screen**
- [ ] **Build with Expo EAS**
  ```bash
  eas build --platform android
  ```
- [ ] **Internal Testing** (optional but recommended)
- [ ] **Production APK/AAB** ready for submission

### Build Configuration
- [ ] Update `app.json` with correct values:
  - App name
  - Version number (1.0.0)
  - Bundle ID / Package name
  - Permissions
  - Privacy descriptions
  - Orientation settings
  - Icon and splash screen paths

---

## 2. APP METADATA & STORE LISTING

### Required for Both Stores
- [ ] **App Name**: "Shloka Sadhana" (check availability)
- [ ] **Subtitle/Short Description**: One-line tagline (30 chars iOS, 80 chars Android)
- [ ] **Full Description**: Detailed app description (4000 chars iOS, 4000 chars Android)
- [ ] **Keywords**: Search optimization keywords (100 chars iOS, not visible on Android)
- [ ] **Category**:
  - iOS: Lifestyle or Health & Fitness
  - Android: Lifestyle or Health & Fitness
- [ ] **Age Rating**: 4+ (iOS) / Everyone (Android)
- [ ] **Support URL**: Website or support email
- [ ] **Privacy Policy URL**: **REQUIRED** (must be hosted)

### Example Descriptions:

**Subtitle (iOS):**
```
Daily Mantra Practice & Tracking
```

**Short Description (Android):**
```
Practice mantras, track progress with mala counter, maintain streaks, Hindu calendar
```

**Full Description:**
```
Shloka Sadhana is your companion for daily spiritual practice, helping you:

CORE FEATURES:
• Practice shlokas and mantras with digital mala counter
• Track your daily practice sessions and maintain streaks
• Set and achieve practice goals
• View Hindu calendar (Paanchang) with Tithi, Nakshatra
• Receive personalized mantra recommendations
• Get daily reminders for consistent practice

PRACTICE TRACKING:
• Digital mala with configurable repetitions
• Session notes and offerings
• Sankalp (intention setting) for each practice
• Detailed session history with statistics
• Streak tracking to build consistency

LIBRARY & CONTENT:
• Curated collection of popular shlokas
• Sanskrit text with English transliteration
• Meanings and context for each shloka
• Benefits of regular practice
• Category-based organization

PERSONALIZATION:
• Adjustable font sizes for accessibility
• Customizable reminder times
• Practice goals and progress tracking
• Dark theme for comfortable viewing

HINDU CALENDAR:
• Daily Tithi and Nakshatra information
• Ekadashi dates and reminders (coming soon)
• Auspicious timings
• Festival notifications

Whether you're new to mantra practice or a seasoned practitioner, Shloka Sadhana makes it easy to maintain a consistent spiritual routine.
```

---

## 3. GRAPHICS & VISUAL ASSETS

### App Icon
- [ ] **iOS**: 1024x1024px PNG (no transparency, no rounded corners)
- [ ] **Android**: 512x512px PNG (can have transparency)
- [ ] Design must be simple, recognizable, no text overlay
- [ ] Should represent spiritual/meditation theme
- [ ] Consider: Om symbol, Mala beads, Lotus, or abstract spiritual design

### Screenshots (REQUIRED)
**iOS:** Need for ALL device sizes
- [ ] iPhone 6.7" (1290 x 2796) - iPhone 15 Pro Max
- [ ] iPhone 6.5" (1284 x 2778) - iPhone 14 Pro Max
- [ ] iPhone 5.5" (1242 x 2208) - iPhone 8 Plus
- [ ] iPad Pro 12.9" (2048 x 2732)
- [ ] iPad Pro 11" (1668 x 2388)

**Android:** At least 2, up to 8
- [ ] Phone: 1080 x 1920 or higher
- [ ] Tablet: 1600 x 2560 or higher (optional)

**Screenshot Content Ideas:**
1. Home screen with stats
2. Shloka library view
3. Practice session with mala counter
4. Session history/streaks
5. Paanchang/Calendar view
6. Settings screen

### Feature Graphic (Android Only)
- [ ] 1024 x 500px PNG/JPG
- [ ] Used in Play Store listing
- [ ] Banner-style promotional image

### Promo Video (Optional but Recommended)
- [ ] 15-30 seconds
- [ ] Show key features in action
- [ ] No audio required (add captions)

---

## 4. PRIVACY & PERMISSIONS

### Privacy Policy (REQUIRED)
- [ ] **Must have hosted privacy policy** (critical for both stores)
- [ ] Must explain:
  - What data is collected (sessions, streaks, settings)
  - How data is stored (local device only)
  - No data sharing/selling statement
  - User data deletion process
  - Contact information

### Example Privacy Policy Outline:
```
1. Information We Collect
   - Practice session data (stored locally on device)
   - App settings and preferences
   - No personal information collected

2. How We Use Information
   - All data stored locally on your device
   - Used only for app functionality
   - No data sent to external servers
   - No analytics or tracking

3. Data Sharing
   - We do not share, sell, or transfer your data
   - No third-party access

4. Your Rights
   - You can delete all data via Settings > Clear Data
   - Uninstalling removes all data

5. Contact Us
   - Email: privacy@shlokasadhana.com
```

### App Privacy Details (iOS)
- [ ] Fill out App Privacy questionnaire in App Store Connect
- [ ] Current app collects:
  - ✅ Practice data (not linked to user, stays on device)
  - ✅ App settings (not linked to user)
  - ❌ No identifiers
  - ❌ No location data
  - ❌ No contact info
  - ❌ No tracking

### Data Safety (Android)
- [ ] Fill out Data Safety form in Play Console
- [ ] Declare what data is collected
- [ ] Confirm data stays on device
- [ ] No data sharing

### Required Permissions to Declare
Current app uses:
- [ ] **Notifications** - For daily reminders
  - iOS: Must provide description in `app.json`
  - Android: Declared automatically
- [ ] **Local Storage** - For saving practice data
  - Automatic, no special permission

### Permission Descriptions (iOS Info.plist)
Add to `app.json`:
```json
"infoPlist": {
  "NSUserNotificationsUsageDescription": "We send daily reminders to help you maintain your practice routine. You can customize or disable reminders in Settings."
}
```

---

## 5. LEGAL & COMPLIANCE

### Terms of Service
- [ ] Create Terms of Service document
- [ ] Host on website
- [ ] Link in app (About screen)
- [ ] Cover:
  - User conduct
  - Intellectual property
  - Disclaimer (not religious advice)
  - Limitation of liability

### Content Rights
- [ ] **Shlokas/Mantras**: Ensure public domain or have rights
  - Most traditional shlokas are public domain
  - Verify modern translations if any
- [ ] **Images**: All assets properly licensed
- [ ] **Fonts**: License allows app distribution

### Religious Content Guidelines
- [ ] **iOS**: Religious content is allowed, must be respectful
- [ ] **Android**: Same, must not promote hate or discrimination
- [ ] Add disclaimer: "For spiritual practice and educational purposes"
- [ ] Ensure content is inclusive and respectful

### Copyright & Trademark
- [ ] App name "Shloka Sadhana" - check trademark availability
- [ ] Logo design - ensure original or licensed
- [ ] No use of copyrighted religious imagery without permission

---

## 6. TECHNICAL REQUIREMENTS

### Performance
- [ ] **App Size**:
  - iOS: Prefer < 100 MB (current should be ~10-20 MB)
  - Android: Prefer < 50 MB
- [ ] **Launch Time**: < 3 seconds
- [ ] **No Crashes**: Must be stable
- [ ] **Battery Usage**: Efficient, no background drain

### Functionality
- [ ] **All features work**: No broken buttons or screens
- [ ] **Error handling**: Graceful error messages
- [ ] **Offline support**: App works without internet ✅
- [ ] **Orientation**: Support portrait mode (landscape optional)
- [ ] **Safe Area**: Respect notches and home indicators

### iOS-Specific
- [ ] **No Private APIs**: Only use public APIs
- [ ] **No 3rd party install prompts**: Don't ask users to download other apps
- [ ] **Complete functionality**: Not a demo or "coming soon" app
- [ ] **IPv6 compatible**: Expo handles this automatically

### Android-Specific
- [ ] **Target SDK**: Latest Android SDK (Expo handles)
- [ ] **64-bit support**: Required (Expo handles)
- [ ] **No hidden features**: All features accessible
- [ ] **Back button**: Proper navigation handling

---

## 7. TESTING REQUIREMENTS

### Current Status: ✅ EXCELLENT
- ✅ 656 comprehensive tests passing
- ✅ TDD approach throughout
- ✅ All features tested

### Additional Testing Needed:
- [ ] **Real device testing**:
  - iPhone (latest iOS)
  - iPad (if supporting)
  - Android phone (latest Android)
  - Android tablet (if supporting)
- [ ] **Beta testing**:
  - TestFlight (iOS) - 10-20 users
  - Internal testing (Android) - 10-20 users
  - Collect feedback
  - Fix any critical bugs
- [ ] **Performance testing**:
  - Battery drain
  - Memory usage
  - Long practice sessions (1000+ repetitions)
  - Multiple days of data

---

## 8. APP STORE CONNECT SETUP (iOS)

### Prerequisites
- [ ] Apple Developer Account ($99/year)
- [ ] Agree to latest legal agreements
- [ ] Payment and banking info (if paid app or in-app purchases)

### Steps
1. [ ] Create App ID in Certificates, Identifiers & Profiles
2. [ ] Create new app in App Store Connect
3. [ ] Fill out all metadata
4. [ ] Upload screenshots
5. [ ] Set pricing (Free)
6. [ ] Fill out App Privacy details
7. [ ] Upload build via EAS
8. [ ] Submit for review
9. [ ] Wait 1-7 days for review

### Review Process
- **Average time**: 24-48 hours
- **Common rejections**:
  - Missing privacy policy
  - Incomplete functionality
  - Crashes or bugs
  - Misleading screenshots
  - Privacy issues

---

## 9. GOOGLE PLAY CONSOLE SETUP (Android)

### Prerequisites
- [ ] Google Play Developer Account ($25 one-time)
- [ ] Agree to developer agreement
- [ ] Payment profile setup

### Steps
1. [ ] Create new application
2. [ ] Fill out store listing
3. [ ] Upload screenshots and graphics
4. [ ] Complete Content rating questionnaire
5. [ ] Fill out Data safety form
6. [ ] Set pricing and distribution (Free, All countries)
7. [ ] Upload APK/AAB via EAS
8. [ ] Choose release track (Production)
9. [ ] Submit for review
10. [ ] Wait few hours to 1 day

### Review Process
- **Average time**: Few hours to 1 day
- **Generally easier than iOS**
- Common issues same as iOS

---

## 10. POST-LAUNCH CHECKLIST

### Monitoring
- [ ] Set up crash reporting (Sentry, Bugsnag)
- [ ] Monitor app store ratings
- [ ] Track download numbers
- [ ] Monitor user reviews

### Marketing
- [ ] Create website/landing page
- [ ] Social media presence
- [ ] App Store Optimization (ASO)
  - Optimize keywords
  - Update screenshots based on performance
  - A/B test descriptions

### Updates
- [ ] Set up EAS Update for OTA updates
- [ ] Plan monthly update schedule
- [ ] Collect user feedback
- [ ] Priority bug fixes

---

## CRITICAL BLOCKERS (Must Have Before Submission)

1. ❌ **Privacy Policy** - Absolute requirement, will be rejected without
2. ❌ **App Icon** - Must have proper icon
3. ❌ **Screenshots** - Need minimum required screenshots
4. ❌ **App Store Accounts** - Need both developer accounts
5. ❌ **Build Configuration** - app.json must be complete
6. ⚠️ **Content Review** - Ensure all shlokas/content is appropriate

---

## TIMELINE ESTIMATE

| Task | Estimated Time |
|------|---------------|
| Developer accounts setup | 1 day |
| Privacy policy creation | 1-2 days |
| App icon design | 1-2 days |
| Screenshots creation | 1 day |
| Store listing content | 1 day |
| Build configuration | 1 day |
| Build generation (EAS) | 2-4 hours |
| Testing on devices | 2-3 days |
| Beta testing (optional) | 1-2 weeks |
| Final submission prep | 1 day |
| **Total (minimum)** | **7-10 days** |
| **Total (with beta)** | **3-4 weeks** |

Plus review time:
- iOS: 1-7 days (usually 1-2 days)
- Android: Few hours to 1 day

**Realistic First Launch**: 2-4 weeks from start

---

## NEXT STEPS (Priority Order)

1. **Get Developer Accounts** (can take 1-2 days to activate)
   - Apple Developer Program: https://developer.apple.com/programs/
   - Google Play Developer: https://play.google.com/console/signup

2. **Create Privacy Policy** (critical blocker)
   - Use generator or hire lawyer
   - Host on website or GitHub Pages

3. **Design App Icon** (critical blocker)
   - Hire designer or use tools like Figma/Canva
   - Must be professional quality

4. **Take Screenshots** (critical blocker)
   - Use Expo on real devices or simulator
   - Edit with proper device frames

5. **Configure app.json** (1-2 hours)
   - Set all metadata
   - Add permission descriptions
   - Configure build settings

6. **Build with EAS** (2-4 hours)
   - `eas build --platform all`
   - Wait for builds to complete

7. **Test on Real Devices** (1-2 days)
   - Install on iPhone and Android
   - Full feature testing
   - Fix any issues

8. **Submit for Review**
   - Upload to stores
   - Wait for approval
   - Respond to any review issues

---

## RESOURCES

### Official Documentation
- [Apple App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Store Policies](https://play.google.com/about/developer-content-policy/)
- [Expo EAS Build](https://docs.expo.dev/build/introduction/)
- [Expo EAS Submit](https://docs.expo.dev/submit/introduction/)

### Tools
- **Icon Generator**: https://appicon.co/
- **Screenshot Frames**: https://www.screely.com/
- **Privacy Policy Generator**: https://www.privacypolicies.com/
- **App Store Optimization**: https://appradar.com/

---

## NOTES

- Current app (V2) has solid functionality and testing ✅
- Main work needed is metadata, graphics, and legal docs
- No code changes required for store submission
- Consider beta testing before public launch
- Both stores are stricter now about privacy and data handling
- Religious content is fine as long as respectful and educational

Last Updated: 2026-02-05
