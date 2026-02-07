# Technology Decision Document
# Shloka Sadhana - Mobile App Platform Choice

**Version:** 1.0
**Date:** February 5, 2026
**Decision Status:** Pending User Confirmation

---

## Executive Summary

We need to choose the mobile app development approach for Shloka Sadhana. This document evaluates three primary options and provides a recommendation based on project requirements.

---

## Options Evaluated

### Option 1: React Native (Expo)
**Recommended ✅**

### Option 2: React Native (Bare Workflow)

### Option 3: Native Development (Swift + Kotlin)

---

## Decision Matrix

| Criteria | React Native (Expo) | React Native (Bare) | Native (Swift/Kotlin) |
|----------|---------------------|---------------------|----------------------|
| **Development Speed** | ⭐⭐⭐⭐⭐ Fast | ⭐⭐⭐⭐ Fast | ⭐⭐ Slow |
| **Code Reusability** | ⭐⭐⭐⭐⭐ 95%+ | ⭐⭐⭐⭐⭐ 95%+ | ⭐ 0% (separate apps) |
| **Testing Support** | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐ Good |
| **TDD Friendly** | ⭐⭐⭐⭐⭐ Yes | ⭐⭐⭐⭐⭐ Yes | ⭐⭐⭐ Moderate |
| **Learning Curve** | ⭐⭐⭐⭐ Easy | ⭐⭐⭐ Moderate | ⭐⭐ Steep |
| **Performance** | ⭐⭐⭐⭐ Good | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐⭐ Excellent |
| **Offline Support** | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐⭐ Excellent |
| **Community Support** | ⭐⭐⭐⭐⭐ Large | ⭐⭐⭐⭐⭐ Large | ⭐⭐⭐⭐ Platform-specific |
| **Build Complexity** | ⭐⭐⭐⭐⭐ Simple (EAS) | ⭐⭐⭐ Moderate | ⭐⭐ Complex |
| **App Store Ready** | ⭐⭐⭐⭐⭐ Yes | ⭐⭐⭐⭐⭐ Yes | ⭐⭐⭐⭐⭐ Yes |
| **Cost** | ⭐⭐⭐⭐⭐ Free/Low | ⭐⭐⭐⭐⭐ Free | ⭐⭐⭐ High (2x dev time) |

---

## Recommendation: React Native with Expo

### Why React Native with Expo?

#### ✅ Pros

1. **Production-Ready, Scalable Architecture**
   - Built for thousands of users, not just 100
   - Mature ecosystem with production apps (Discord, Microsoft, Shopify use RN)
   - EAS Build handles complex iOS/Android builds
   - Over-the-air updates (fix bugs without app store review)
   - Crash reporting and monitoring (Sentry integration)

2. **Aligned with Current Skills**
   - Reference implementation is in React
   - Team already familiar with React patterns
   - TypeScript support out of the box
   - Smooth transition from reference implementation

3. **Rapid Development (Without Sacrificing Quality)**
   - Single codebase for iOS and Android
   - Hot reload for fast iteration
   - Expo SDK provides 90% of needed features
   - Rich ecosystem of production-tested libraries
   - TDD-friendly with Jest and React Native Testing Library

4. **Guest-First, Privacy-Respecting Architecture**
   - App fully functional without authentication (AsyncStorage)
   - No forced sign-ups, no tracking
   - Optional cloud sync (Phase 2) with seamless migration
   - Respects spiritual practice privacy

5. **Production-Quality Infrastructure**
   - Error boundaries and crash reporting (Sentry)
   - Performance monitoring built-in
   - Accessibility support (VoiceOver, TalkBack)
   - Memory leak prevention tools
   - Battery-efficient background tasks

6. **Offline-First by Default**
   - AsyncStorage for local data (production-ready storage)
   - No web browser limitations
   - Works completely offline after first launch
   - Background task support

7. **Native Features We Need**
   - Push notifications (practice reminders)
   - Background timers (keep running when app backgrounded)
   - Haptic feedback (for mala counter)
   - Sound/vibration for session completion
   - App badge for streak display

8. **Future-Proof & Scalable**
   - Easy to eject to bare React Native if needed
   - Can add native modules later
   - Architecture supports 10,000+ users (Phase 2 cloud sync)
   - Strong community and ecosystem
   - Backed by Meta (React Native) and Expo team
   - Production apps scale to millions of users

#### ⚠️ Cons (Mitigated)

1. **Not "True Native" Performance**
   - **Mitigation:** For our use case (timer, counter, text display), performance is more than adequate
   - **Mitigation:** Can optimize critical paths with native modules if needed

2. **Expo Limitations**
   - **Mitigation:** Expo SDK covers 95% of our needs
   - **Mitigation:** Can use custom dev clients for unavailable libraries
   - **Mitigation:** Can eject to bare workflow if truly necessary

3. **Bundle Size**
   - **Mitigation:** ~40MB base, acceptable for spiritual app
   - **Mitigation:** Users expect this size for feature-rich apps

---

## Technology Stack (React Native + Expo)

### Core Framework
- **React Native:** 0.73+ (latest stable)
- **Expo:** SDK 50+ (managed workflow)
- **TypeScript:** Strict mode enabled
- **Node.js:** 18+ LTS

### Testing (Updated for React Native)
- **Jest:** Unit and integration testing (included with Expo)
- **React Native Testing Library:** Component testing
- **jest-expo:** Expo-specific Jest preset
- **Detox or Maestro:** E2E testing (iOS + Android)

### Navigation
- **React Navigation 6:** Stack, bottom tabs, modals
- **TypeScript support:** Type-safe navigation

### State Management
- **React Context API:** Global state (streak, settings)
- **AsyncStorage:** Persistent data (@react-native-async-storage/async-storage)
- **Custom hooks:** Encapsulated logic (useStreak, useTimer, etc.)

### UI/Styling
- **React Native StyleSheet:** Core styling (recommended for performance)
- **React Native built-in components:** View, Text, TouchableOpacity, FlatList
- **Custom styled components:** Reusable component library
- **No CSS frameworks:** React Native doesn't support Tailwind/CSS-in-JS the same way

### Notifications
- **expo-notifications:** Local and push notifications
- **expo-task-manager:** Background tasks

### Additional Features
- **expo-av:** Audio playback (for shloka audio in future)
- **expo-haptics:** Haptic feedback for mala counter
- **expo-linking:** Deep linking for sharing
- **expo-updates:** Over-the-air updates
- **expo-splash-screen:** Beautiful splash screen

### Development Tools
- **EAS Build:** Cloud builds for iOS and Android
- **EAS Submit:** Automated app store submission
- **Expo Go:** Quick testing on physical devices
- **React Native Debugger:** Advanced debugging

---

## Alternative Consideration: Web App as PWA

If you prefer web-first approach:

### Progressive Web App (PWA)
- **Framework:** React + Vite
- **Mobile Feel:** Install to home screen
- **Offline:** Service Workers
- **Push Notifications:** Web Push API (limited on iOS)

#### ✅ Pros of PWA
- No app store approval needed
- Instant updates
- Web and mobile from one codebase
- Lower development complexity

#### ❌ Cons of PWA
- Limited iOS support (notifications, background tasks)
- Feels less native
- Can't access native APIs (haptics, precise timers)
- Browser limitations

**Verdict:** PWA works, but React Native provides better user experience for this use case.

---

## Hybrid Approach: Expo + Web

Expo supports web builds:
- Same codebase → iOS, Android, Web
- Best of both worlds
- Start with mobile, add web later
- Use `react-native-web` under the hood

**Recommendation:** Start with Expo (mobile-first), add web later if needed.

---

## Project Structure (React Native + Expo)

```
shloka-sadhana/
├── app.json                    # Expo config
├── package.json
├── tsconfig.json
├── babel.config.js
├── .eslintrc.js
├── App.tsx                     # Entry point
├── src/
│   ├── navigation/            # React Navigation setup
│   │   ├── AppNavigator.tsx
│   │   └── types.ts
│   ├── screens/               # Screen components
│   │   ├── HomeScreen/
│   │   ├── LibraryScreen/
│   │   ├── PracticeScreen/
│   │   ├── SatsangScreen/
│   │   └── WisdomScreen/
│   ├── components/            # Reusable components
│   │   ├── common/
│   │   ├── timer/
│   │   ├── library/
│   │   └── modals/
│   ├── hooks/                 # Custom hooks
│   │   ├── useStreak.ts
│   │   ├── useTimer.ts
│   │   ├── useAsyncStorage.ts
│   │   └── useNotifications.ts
│   ├── contexts/              # React Context
│   │   ├── StreakContext.tsx
│   │   └── SettingsContext.tsx
│   ├── utils/                 # Utilities
│   │   ├── storage.ts
│   │   ├── dateUtils.ts
│   │   └── hinduCalendar.ts
│   ├── data/                  # Static data
│   │   ├── shlokas.ts
│   │   ├── wisdom.ts
│   │   └── satsang.ts
│   ├── types/                 # TypeScript types
│   │   └── index.ts
│   ├── constants/             # Constants
│   │   ├── Colors.ts
│   │   └── Layout.ts
│   └── __tests__/            # Tests
│       ├── components/
│       ├── hooks/
│       ├── utils/
│       └── e2e/
├── assets/                    # Images, fonts, audio
│   ├── images/
│   ├── fonts/
│   └── audio/
└── docs/                      # Documentation
    ├── PRD.md
    ├── IMPLEMENTATION_PLAN.md
    └── API.md
```

---

## Setup Commands (React Native + Expo)

```bash
# Install Expo CLI globally
npm install -g expo-cli

# OR use npx (no global install needed)
npx create-expo-app shloka-sadhana --template expo-template-blank-typescript

# Navigate to project
cd shloka-sadhana

# Install dependencies
npm install

# Install navigation
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack
npx expo install react-native-screens react-native-safe-area-context

# Install AsyncStorage
npx expo install @react-native-async-storage/async-storage

# Install testing dependencies
npm install -D @testing-library/react-native @testing-library/jest-native jest-expo

# Install additional Expo modules
npx expo install expo-notifications expo-haptics expo-av

# Start development server
npx expo start

# Run on iOS simulator (Mac only)
npx expo run:ios

# Run on Android emulator
npx expo run:android

# Run on physical device (scan QR code with Expo Go app)
# iOS: Camera app → scan QR → opens in Expo Go
# Android: Expo Go app → scan QR
```

---

## Development Workflow

### Phase 0: Setup (Day 1)
1. Create Expo project with TypeScript
2. Set up folder structure
3. Configure Jest + React Native Testing Library
4. Set up ESLint + Prettier
5. Create base navigation structure
6. Configure TypeScript strict mode

### Phase 1: Core Infrastructure (Days 2-4)
1. AsyncStorage utilities (TDD)
2. Date/time utilities (TDD)
3. Hindu calendar utilities (TDD)
4. Streak management hook (TDD)
5. Navigation setup

### Phase 2: Practice Features (Days 5-11)
1. Timer component (TDD)
2. Mala counter (TDD)
3. Sankalp modal (TDD)
4. Practice screen integration (TDD)
5. Session completion flow (TDD)

### Phase 3: Content Features (Days 12-16)
1. Shloka library (TDD)
2. Shloka detail view (TDD)
3. Wisdom teachings (TDD)
4. Satsang view (TDD)
5. Hindu calendar display (TDD)

### Phase 4: Polish (Days 17-21)
1. Notifications setup
2. Haptic feedback
3. Splash screen + App icon
4. E2E tests (Detox/Maestro)
5. Performance optimization

### Phase 5: Deployment (Days 22-26)
1. Build with EAS
2. Test on physical devices
3. App Store preparation
4. Beta testing (TestFlight + Google Play Beta)
5. Production release

---

## App Store Requirements

### iOS App Store
- **Apple Developer Account:** $99/year
- **App Store Guidelines:** Must comply
- **Review Time:** 1-3 days typically
- **TestFlight:** Beta testing before release

### Google Play Store
- **Google Play Developer Account:** $25 one-time
- **Play Store Guidelines:** Must comply
- **Review Time:** Hours to 1 day typically
- **Internal Testing:** Beta testing tracks

### Required Assets
- App Icon (1024x1024)
- Splash Screen
- Screenshots (iOS: 6.5", 5.5" | Android: Various sizes)
- Privacy Policy URL
- App Description
- Keywords/Categories

---

## Cost Breakdown

### Free Tier (Development)
- ✅ Expo SDK
- ✅ React Native
- ✅ TypeScript
- ✅ Testing tools
- ✅ Expo Go app for testing
- ✅ Development builds

### Paid (Optional for MVP)
- ❌ Apple Developer: $99/year (required for iOS release)
- ❌ Google Play: $25 one-time (required for Android release)
- ❌ EAS Build (optional): Free tier → 30 builds/month → adequate for MVP

### Total MVP Cost
- **iOS + Android:** $124 (year 1), then $99/year
- **Android only:** $25 (one-time)

---

## Questions for You

Before we proceed, please confirm:

1. **Target Platform(s)?**
   - [ ] iOS only
   - [ ] Android only
   - [ ] Both iOS and Android (recommended)

2. **Development Environment?**
   - [ ] Mac (required for iOS development)
   - [ ] Windows (Android only)
   - [ ] Linux (Android only)

3. **Testing Devices Available?**
   - [ ] iOS device for testing
   - [ ] Android device for testing
   - [ ] Will use simulators/emulators only

4. **Timeline Preference?**
   - [ ] Fastest to market (Expo recommended)
   - [ ] Maximum control (Bare React Native)
   - [ ] Best performance (Native Swift + Kotlin)

5. **Budget for App Store?**
   - [ ] Have Apple Developer account ($99/year)
   - [ ] Have Google Play account ($25 one-time)
   - [ ] Need to create accounts

---

## Recommendation Summary

**For Shloka Sadhana, I recommend:**

✅ **React Native with Expo (Managed Workflow)**

**Reasons:**
1. Fastest path to market (4-6 weeks MVP)
2. Single codebase for iOS + Android
3. Perfect for offline-first apps
4. Excellent TDD support
5. Can leverage existing React reference implementation
6. EAS Build simplifies deployment
7. Over-the-air updates for quick bug fixes
8. Great developer experience
9. Strong community support
10. Adequate performance for our use case

**Next Steps:**
1. Confirm platform choice
2. Set up development environment
3. Create Expo project
4. Update implementation plan for React Native
5. Begin Phase 0 (Project Setup)

---

**Document Control:**
- **Created:** February 5, 2026
- **Status:** Awaiting Decision
- **Decision By:** Product Owner/Lead Developer

**Change Log:**
- v1.0 (2026-02-05): Initial technology evaluation
