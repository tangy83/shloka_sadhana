# Shloka Sadhana — Expo Go Rebuild Plan

## Context

The app was experiencing loading failures on device. While the dependency stack is technically Expo Go-compatible (Firebase JS SDK is web-based, not native), the root cause was missing Firebase credentials (`.env` not configured) causing silent crashes at startup. Firebase and all cloud dependencies have been removed entirely; the app is rebuilt as a fully offline-first, self-contained Expo Go app. Each stage ends with a manual test on device before proceeding.

The "original" VAPMAIL16 codebase (commit `fee6470`) already included Firebase wiring, so a simple rollback was not sufficient — Firebase had to be excised as part of the rebuild. The plan uses `fee6470` as the structural baseline (screens, data files, components, navigation) but replaces the entire backend (auth, firestore, analytics) with local AsyncStorage.

### Preserved Across the Rebuild
- All 3 Personas (Priya, Michael, Asha) from `docs/PRD.md`
- Full feature backlog from `docs/BACKLOG.md`
- All static content: shlokas, wisdom quotes, Ekadashi calendar, festivals
- All UI screens, components, navigation structure

### Branch
All rebuild work lives on: `rebuild/expo-go-clean`

---

## Critical Files Changed

| File | Action |
|------|--------|
| `package.json` | Removed `sentry-expo`; no `firebase` was ever installed on baseline |
| `src/config/firebase.ts` | DELETED — existed as orphan, nothing imported it |
| `src/utils/sentry.ts` | REPLACED — console-only stub, no external service |
| `app.json` | Removed `sentry-expo` plugin; disabled `expo-updates` (placeholder URL) |
| `App.tsx` | Added `SafeAreaProvider` wrapper |
| `src/navigation/AppNavigator.tsx` | Safe area insets for tab bar; added `SessionHistory` screen |
| `src/screens/SessionHistoryScreen.tsx` | Fixed storage key mismatch; updated to use `CompletedPractice` type |
| `src/screens/HomeScreen.tsx` | Added "View Practice History" button |
| `src/types/index.ts` | Added `SessionHistory` to `RootStackParamList` |

---

## Stage-by-Stage Plan

### Stage 0 — Clean Baseline from VAPMAIL16 ✅

**Goal:** Establish the rollback point in a safe new branch, confirm the file tree.

**Steps:**
1. Create branch `rebuild/expo-go-clean` from commit `fee6470` (VAPMAIL16 original)
2. Stash uncommitted changes on `main` to preserve them
3. Confirm branch has the full VAPMAIL16 screen/component/hook structure

**Validation:** Branch exists at `fee6470`, file tree matches expectation.

---

### Stage 1 — Get Expo Go to Launch (Firebase/Sentry Removed) ✅

**Goal:** App boots to the home screen on device with no crashes.

**Steps:**
1. Delete `src/config/firebase.ts` (orphan file — nothing imported it)
2. Replace `src/utils/sentry.ts` with console-only stub
3. Remove `sentry-expo` from `package.json` and `app.json` plugins
4. Set `"updates": { "enabled": false }` in `app.json` (removes placeholder EAS URL)
5. Add `coverage/` to `.gitignore`
6. Run `npm install` to sync node_modules
7. Add `SafeAreaProvider` to `App.tsx`
8. Fix tab bar height with `useSafeAreaInsets()` so icons clear the home indicator on all iPhone models

**Test on Expo Go:**
- App opens without crash
- Home screen renders
- Bottom tab bar reaches screen edge, icons have breathing room above home indicator
- No red error screens

**Result:** PASSED

---

### Stage 2 — Core Practice Features ✅

**Goal:** Mala counter, timer, streaks, and session history work fully offline.

**Steps:**
1. Fix `SessionHistoryScreen` storage key mismatch:
   - Was reading from `@shloka_sadhana:sessions` (never written to)
   - Now reads from `practice_history` via `loadPracticeHistory()` — same key `PracticeScreen` writes to
2. Update `SessionHistoryScreen` to use `CompletedPractice` type (correct field names: `malaCount`, `date`, `shlokaName`, `notes`)
3. Add `SessionHistoryScreen` as a stack screen in `AppNavigator`
4. Add "View Practice History" button on `HomeScreen` below the stats grid
5. Add `SessionHistory` to `RootStackParamList`

**Test on Expo Go:**
- Start timer, tap mala counter, complete session (60s+) → Offering modal appears
- Streak count increments on Practice screen
- Home: "View Practice History" button visible
- History: completed session appears with correct date, duration, mala count
- Session detail modal: shows sankalp/offering if entered
- Restart app → streak and history persist

**Validation checkpoint required before Stage 3.**

---

### Stage 3 — Content Library

**Goal:** All spiritual content screens render correctly from bundled data files.

**Steps:**
1. Validate `LibraryScreen.tsx` loads shlokas from `src/data/shlokas_content.json`
2. Validate `ShlokaDetailScreen.tsx` — full shloka view with sections
3. Validate `WisdomScreen.tsx` + `WisdomDetailScreen.tsx` — wisdom quotes
4. Validate `EkadashiCalendarScreen.tsx` + `EkadashiDetailScreen.tsx` — calendar data
5. Validate `FestivalsListScreen.tsx` — festivals list
6. Validate Home screen cards: `VerseOfTheDayCard`, `EkadashiBanner`, `DailyWisdomCard`, `MuhuratTimes`

**Key data files (read-only, bundled — no changes needed):**
- `src/data/shlokas_content.json`
- `src/data/wisdom_quotes.json`
- `src/data/ekadashi.json`
- `src/data/festivals.json`

**Test on Expo Go:**
- Browse shloka library → shlokas load, tap for detail
- Wisdom screen shows quotes
- Ekadashi calendar shows upcoming dates
- Home screen cards show content (not blank/errors)

**Validation checkpoint required before Stage 4.**

---

### Stage 4 — Progress & Engagement (Local)

**Goal:** Quest system, achievement system, XP, and streak milestones work entirely from AsyncStorage.

**Steps:**
1. Wire `useQuestStore` to AsyncStorage-only (strip any Firestore calls from `questService.ts`)
2. Wire `useAchievementStore` to AsyncStorage-only (strip any Firestore calls from `achievementService.ts`)
3. Validate `DailyQuestCard` on home screen shows a quest and tracks progress
4. Validate `AchievementProgressCard` shows earned achievements
5. Validate `QuestCompletionModal` and `AchievementUnlockedModal` trigger correctly
6. Validate XP display updates after practice

**Test on Expo Go:**
- Complete a practice → quest progress updates
- Earn an achievement → modal appears
- Restart app → quest and achievement state persists

**Validation checkpoint required before Stage 5.**

---

### Stage 5 — Onboarding & Settings Polish

**Goal:** First-launch onboarding flow works, all settings screens are functional.

**Steps:**
1. Wire `OnboardingScreen.tsx` to local guest auth — store "onboarded" flag and guest profile (displayName, avatar emoji) in AsyncStorage on completion
2. Validate notification permission request works in onboarding
3. Validate all settings sub-screens (About, Privacy Policy, Terms of Service) render
4. Validate shloka favorites toggle persists across restarts
5. Add a "Guest Mode" note to `SettingsScreen.tsx` for future cloud sync awareness

**Test on Expo Go:**
- Simulate fresh install (clear AsyncStorage) → relaunch → onboarding appears
- Complete onboarding → home screen loads with personalized greeting
- Settings changes persist after restart

**Validation checkpoint required before Stage 6.**

---

### Stage 6 — Social Screens (Graceful Stubs)

**Goal:** Social/community screens render without crashing; display graceful empty states.

**Steps:**
1. `SatsangScreen.tsx` — review and stub if needed
2. Any other social screens in navigation — show empty state or "coming soon" UI
3. No crashes when navigating to any screen

**Test on Expo Go:**
- Navigate to all tabs and screens → no crash, graceful empty states where applicable

**Validation checkpoint required before Stage 7.**

---

### Stage 7 — Full QA Pass & Cleanup

**Goal:** End-to-end walkthrough of all app flows; zero Firebase/Sentry-expo remnants.

**Steps:**
1. Grep `src/` for `firebase`, `firestore`, `sentry-expo` — confirm zero remaining imports
2. Full manual walkthrough on Expo Go:
   - Onboarding → Practice → Library → Wisdom → Ekadashi → Settings → Satsang
3. Final commit: `feat: rebuild app as offline-first Expo Go compatible`

---

## What is NOT in Scope (Deferred to Backlog)

- Optional cloud sync — needs a backend decision (Supabase, custom API, or Firebase with proper credentials)
- Social features (friends, groups, challenges) — requires a backend
- Push notifications via EAS (requires EAS build, not Expo Go)
- Apple Sign-In / Google Sign-In
- OTA Updates (EAS)

These remain captured in `docs/BACKLOG.md` and `docs/PRD.md`.

---

## Verification Method (Per Stage)

After each stage:
1. Run `npx expo start --clear` (fresh Metro bundler cache)
2. Scan QR code from Expo Go on physical device
3. Complete the manual test checklist for that stage
4. Provide go/no-go sign-off before next stage begins
