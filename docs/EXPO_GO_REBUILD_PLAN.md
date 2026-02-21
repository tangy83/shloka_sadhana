# Shloka Sadhana — Expo Go Rebuild Plan

## Context

The app was experiencing loading failures on device. While the dependency stack is technically Expo Go-compatible (Firebase JS SDK is web-based, not native), the root cause was missing Firebase credentials (`.env` not configured) causing silent crashes at startup. Firebase and all cloud dependencies have been removed entirely; the app is rebuilt as a fully offline-first, self-contained Expo Go app. Each stage ends with a manual test on device before proceeding.

The "original" VAPMAIL16 codebase (commit `fee6470`) already included Firebase wiring, so a simple rollback was not sufficient — Firebase had to be excised as part of the rebuild. The plan uses `fee6470` as the structural baseline (screens, data files, components, navigation) but replaces the entire backend (auth, firestore, analytics) with local AsyncStorage.

**Single-user model throughout Stages 0–6.** All data is stored in AsyncStorage keyed to the device. No login, no guest ID, no cloud identity. A minimal local profile (display name + avatar emoji) is added in Stage 7 as the final step.

### Preserved Across the Rebuild
- All 3 Personas (Priya, Michael, Asha) from `docs/PRD.md`
- Full feature backlog from `docs/BACKLOG.md`
- All static content: shlokas, wisdom quotes, Ekadashi calendar, festivals
- All UI screens, components, navigation structure

### Branch
All rebuild work lives on: `rebuild/expo-go-clean`

---

## Ethnic Indian Design Language

The three personas drive the visual and interaction design. This is a standing constraint for every stage — not a cosmetic afterthought.

| Element | Requirement |
|---------|-------------|
| **Color Palette** | Saffron (#FF6B35), Temple Gold (#FFD700), Lotus Pink (#E91E8C tints), Deep Indigo (#1A0A2E background), Warm Cream (#FFF8E7 for light mode) — no generic tech-app blues/grays |
| **Typography** | Sanskrit and Hindi text in a Devanagari-compatible font; English text in a warm humanist sans-serif. Reverent spacing around sacred text |
| **Iconography** | Spiritual symbols (🪷 lotus, ॐ Om, 🪔 diya, bell, mala beads) as primary icons rather than generic UI icons |
| **Decorative Motifs** | Subtle mandala/rangoli border patterns in card headers; lotus petal dividers between sections |
| **Texture & Warmth** | Cards with warm amber/gold tint on dark background — not flat grey; subtle warmth on key surfaces |
| **Interaction Tone** | Meditative micro-animations: slow fade-ins, gentle pulse on mala counter tap, soft glow on session completion |

### Persona → Design Mapping

| Persona | Core Need | Design Implementation |
|---------|-----------|----------------------|
| **Priya** (42, Mumbai, daily practitioner) | Familiar, traditional feel; not "app-ified" | Warm saffron dominant; Sanskrit text prominent; layout reminiscent of a puja space |
| **Michael** (28, SF, curious explorer) | Discovery, learning, modern enough not to feel alien | Clear information hierarchy; contextual labels explaining Sanskrit terms; beautiful imagery |
| **Asha** (67, Chennai, elder teacher) | Accessibility, large text, no clutter | Font size defaults to 1.2x; high contrast; touch targets min 48dp; no small icons |

### Persona → Stage Coverage

| Persona | Stage | Feature Addressed |
|---------|-------|------------------|
| Priya | 0.5 | Saffron/gold color tokens applied |
| Priya | 2 | Practice timer, mala counter, streak, session history |
| Priya | 4 | Practice goals UI, streak recovery message |
| Michael | 3 | Shloka library, recommendations, verse of the day |
| Michael | 3.5 | Audio mantra playback |
| Michael | 4 | Library search, favorites filter |
| Asha | 5 | Font size accessibility (0.8x–1.5x), quiet hours |
| Asha | 5 | Onboarding welcome flow |
| All | 5 | Theme system (light/dark/system) |
| All | 6 | Satsang stub with graceful empty state |
| All | 7 | Local profile (display name + avatar emoji) |

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

### Stage 0.5 — Design Token Audit

**Goal:** Ensure color tokens and typography reflect the ethnic Indian palette and that Sanskrit text renders correctly, before any screen work in later stages.

**Steps:**
1. Audit `src/constants/` (colors, theme tokens) — replace any generic grays/blues with the saffron/gold/indigo palette defined in the Design Language section above
2. Verify Devanagari/Sanskrit strings display correctly in Expo Go (no missing glyphs, no clipping)
3. Verify card backgrounds use warm amber/gold tint on dark mode, not flat `#1E1E1E` grey
4. Verify mala counter tap has a gentle meditative pulse animation (not a sharp hard press)
5. Verify the bottom tab bar uses saffron (#FF6B35) as the active icon color, not generic blue

**Key files:** `src/constants/`, `src/contexts/ThemeContext.tsx`, `src/components/MalaCounter.tsx`

**Test on Expo Go:**
- Launch app → overall warmth is devotional and Indian in character, not a generic mobile app
- Sanskrit text in any card is legible and not truncated
- Tab bar active icon is saffron

---

### Stage 2 — Core Practice Features ✅

**Goal:** Mala counter, timer, streaks, session history, streak recovery, and background timer work fully offline.

**Steps:**
1. Fix `SessionHistoryScreen` storage key mismatch:
   - Was reading from `@shloka_sadhana:sessions` (never written to)
   - Now reads from `practice_history` via `loadPracticeHistory()` — same key `PracticeScreen` writes to
2. Update `SessionHistoryScreen` to use `CompletedPractice` type (correct field names: `malaCount`, `date`, `shlokaName`, `notes`)
3. Add `SessionHistoryScreen` as a stack screen in `AppNavigator`
4. Add "View Practice History" button on `HomeScreen` below the stats grid
5. Add `SessionHistory` to `RootStackParamList`
6. Validate **Streak Recovery Message** (`src/utils/streakRecovery.ts`): after a simulated missed day, the home screen shows the encouraging recovery message
7. Validate **Background Timer** (`src/hooks/useBackgroundTimer.ts`): backgrounding the app during an active practice session does not reset the timer; elapsed time is correct on return
8. Verify mala counter tap triggers gentle haptic feedback via `expo-haptics`

**Test on Expo Go:**
- Start timer, tap mala counter, complete session (60s+) → Offering modal appears
- Streak count increments on Practice screen
- Home: "View Practice History" button visible
- History: completed session appears with correct date, duration, mala count
- Session detail modal: shows sankalp/offering if entered
- Restart app → streak and history persist
- Background app during active timer → return → timer still running, elapsed time preserved
- Streak Recovery Message visible on home screen after simulated missed day
- Mala counter tap: gentle haptic pulse felt on device

**Validation checkpoint required before Stage 3.**

---

### Stage 3 — Content Library

**Goal:** All spiritual content screens render correctly from bundled data files; home screen recommendation engine and calendar features are functional.

**Steps:**
1. Validate `LibraryScreen.tsx` loads shlokas from `src/data/shlokas_content.json`
2. Validate `ShlokaDetailScreen.tsx` — full shloka view with Sanskrit, transliteration, meaning, Hindi translation; Sanskrit text styled larger with reverent spacing distinct from English body text
3. Validate `WisdomScreen.tsx` + `WisdomDetailScreen.tsx` — wisdom quotes
4. Validate `EkadashiCalendarScreen.tsx` + `EkadashiDetailScreen.tsx` — calendar data
5. Validate `FestivalsListScreen.tsx` — festivals list
6. Validate home screen cards: `VerseOfTheDayCard` (using `src/utils/verseOfTheDay.ts`), `EkadashiBanner`, `DailyWisdomCard`, `MuhuratTimes`
7. Validate **Shloka Recommendation Engine**: `RecommendedShlokaCard` on HomeScreen returns a non-blank shloka using `src/utils/shlokaRecommendation.ts` + `src/utils/weekdayRecommendations.ts` (day-of-week and time-of-day aware)
8. Validate **Paanchang Card**: `PaanchangCard` on HomeScreen shows today's tithi, nakshatra, and paksha via `src/utils/paanchang.ts` + `src/utils/hinduCalendar.ts`
9. Validate **Muhurat Times**: `MuhuratTimes` card on HomeScreen shows sunrise, sunset, Brahma Muhurta, and Rahu Kaal via `src/utils/muhurat.ts`

**Key data files (read-only, bundled — no changes needed):**
- `src/data/shlokas_content.json`
- `src/data/wisdom_quotes.json`
- `src/data/ekadashi.json`
- `src/data/festivals.json`

**Test on Expo Go:**
- Browse shloka library → shlokas load, tap for detail; Sanskrit text visually distinct and reverently styled
- Wisdom screen shows quotes
- Ekadashi calendar shows upcoming dates
- Home screen Recommended Shloka card: shows a shloka name and description (not blank)
- Verse of the Day card: shows Sanskrit verse + transliteration + meaning; changes by date
- Paanchang card: shows today's tithi, nakshatra, paksha
- Muhurat Times: shows sunrise and Brahma Muhurta for device locale

**Validation checkpoint required before Stage 3.5.**

---

### Stage 3.5 — Audio Mantra Playback

**Goal:** Play mantra audio within `ShlokaDetailScreen` using `expo-av` with bundled local assets — zero network dependency.

**Steps:**
1. Validate `src/utils/audio.ts` wires correctly to `expo-av`
2. Add play/pause/stop controls to `ShlokaDetailScreen.tsx` using the existing audio utility
3. Add playback speed control: 0.75x, 1x (default), 1.25x — accessible to all personas including Asha who may prefer slower recitation
4. Confirm audio plays from a bundled `assets/audio/` file (no network request)
5. Handle audio cleanup on screen unmount (no memory leaks, no orphan audio sessions)
6. Graceful degradation: if no audio asset is available for a shloka, hide the player rather than crash

**Key files:**
- `src/utils/audio.ts`
- `src/screens/ShlokaDetailScreen.tsx`
- `assets/audio/` (bundled audio assets)

**Test on Expo Go:**
- Open a shloka detail → play button visible
- Tap play → audio starts
- Tap pause → audio stops, playhead position retained
- Tap speed button → playback speed changes audibly
- Navigate away → audio stops cleanly (no audio playing in background unexpectedly)
- No network request made during playback

**Validation checkpoint required before Stage 4.**

---

### Stage 4 — Progress & Engagement (Local)

**Goal:** Quest system, achievement system, XP, streak milestones, library favorites, library search, and practice goals work entirely from AsyncStorage.

**Steps:**
1. Wire `useQuestStore` to AsyncStorage-only (strip any Firestore calls from `questService.ts`)
2. Wire `useAchievementStore` to AsyncStorage-only (strip any Firestore calls from `achievementService.ts`)
3. Validate `DailyQuestCard` on home screen shows a quest and tracks progress
4. Validate `AchievementProgressCard` shows earned achievements
5. Validate `QuestCompletionModal` and `AchievementUnlockedModal` trigger correctly
6. Validate XP display updates after practice
7. **Library Favorites Filter:** Add All / Favorites tab toggle to `LibraryScreen.tsx` using `src/utils/favorites.ts` — favorite state persists in AsyncStorage
8. **Library Search:** Add a debounced search bar to `LibraryScreen.tsx` that filters shlokas by name, deity, and keywords — pure local computation, no network
9. **Practice Goals UI:** Wire `src/utils/goalsStorage.ts` to a Goals section (in `SettingsScreen.tsx` or a new `GoalsScreen.tsx`) — user sets a daily mala count or minute target; a progress bar on `PracticeScreen.tsx` shows completion towards the goal

**Test on Expo Go:**
- Complete a practice → quest progress updates
- Earn an achievement → modal appears
- Restart app → quest and achievement state persists
- Library Search: type "Gayatri" → only Gayatri Mantra shown
- Library Favorites: heart a shloka → switch to Favorites tab → shloka visible; persist after restart
- Practice Goals: set a 108-mala goal → progress bar on Practice screen increments with each mala tap

**Validation checkpoint required before Stage 5.**

---

### Stage 5 — Onboarding & Settings Polish

**Goal:** First-launch onboarding works; theme system, font size, and quiet hours settings are functional. Single-user only — no login.

**Steps:**
1. **Onboarding Flow:** Create a simple 3-screen welcome flow (`OnboardingScreen.tsx`) — screen 1: welcome with devotional imagery; screen 2: explain the app's purpose with persona-resonant copy; screen 3: notification permission request. Store `onboarded: true` flag in AsyncStorage on completion. No name, no login.
2. **Theme System UI:** Add a light/dark/system selector to `SettingsScreen.tsx` using the existing `ThemeContext.tsx`. Validate that all screens re-render correctly and that light mode uses the warm cream (#FFF8E7) background with saffron accents — not harsh white.
3. **Font Size Accessibility:** Wire the `useFontSize.ts` hook slider in `SettingsScreen.tsx` — shloka and wisdom text scales smoothly from 0.8x to 1.5x. Default is 1.0x for Priya/Michael; Asha persona would set 1.2x–1.5x. Validate no text is clipped at maximum size.
4. **Quiet Hours:** Add a time-range picker (start time / end time) to notification settings in `SettingsScreen.tsx`. Extend `src/utils/notifications.ts` to suppress scheduled reminders that fall within the quiet hours window. No network required.
5. Validate all settings sub-screens (About, Privacy Policy, Terms of Service) render
6. Add a "Guest Mode — settings sync coming soon" note in `SettingsScreen.tsx` for transparency

**Test on Expo Go:**
- Simulate fresh install (clear AsyncStorage) → relaunch → onboarding appears → complete → home screen loads
- Settings: switch to Light theme → warm cream background, saffron accents visible; no white-on-white text
- Settings: switch to System → follows device dark/light mode correctly
- Font size 1.5x → shloka text in Library and Detail screen is visibly larger, no clipping
- Quiet Hours set to 22:00–07:00 → no notification fires between those times

**Validation checkpoint required before Stage 6.**

---

### Stage 6 — Social Screens (Graceful Stubs)

**Goal:** Social/community screens render without crashing; display graceful empty states. No backend. No user IDs.

**Steps:**
1. `SatsangScreen.tsx` — review and stub if needed; show a "Community features coming soon" empty state with inviting devotional imagery
2. Any other social screens in navigation — show empty state or "coming soon" UI
3. No crashes when navigating to any screen

**Test on Expo Go:**
- Navigate to all tabs and screens → no crash
- Satsang tab shows graceful empty state with devotional styling

**Validation checkpoint required before Stage 7.**

---

### Stage 7 — Full QA Pass, Local Profile & Cleanup

**Goal:** End-to-end walkthrough of all app flows; local user profile added; zero Firebase/Sentry-expo remnants.

**Steps:**
1. **Local Profile:** Add a minimal profile screen (or section in `SettingsScreen.tsx`) where the user sets their display name and an avatar emoji. Store in AsyncStorage only — no cloud, no auth, no user ID generation. The home screen greeting reads "Welcome back, [Name] 🙏".
2. Grep `src/` for `firebase`, `firestore`, `sentry-expo` — confirm zero remaining imports
3. Full manual walkthrough on Expo Go:
   - Onboarding → Practice → Library → Audio → Wisdom → Ekadashi → Settings → Satsang
4. Verify ethnic Indian design language is consistent across all screens (saffron active states, warm card backgrounds, Sanskrit text styled correctly)
5. Final commit: `feat: rebuild app as offline-first Expo Go compatible`

**Test on Expo Go:**
- Set display name "Priya" → home screen shows "Welcome back, Priya 🙏"
- All tabs navigate without crash
- Complete a practice session end-to-end: sankalp → timer → mala → offering → history
- Library search + favorites work
- Audio plays in shloka detail
- Settings: theme switch, font size, quiet hours all save and persist after restart

---

## What is NOT in Scope (Deferred to Backlog)

- Optional cloud sync — needs a backend decision (Supabase, custom API, or Firebase with proper credentials)
- Social features (friends, groups, challenges) — requires a backend
- Push notifications via EAS (requires EAS build, not Expo Go)
- Apple Sign-In / Google Sign-In
- OTA Updates (EAS)
- Stripe / donation payments
- Home screen widgets (iOS WidgetKit / Android App Widget — native modules)
- Sentry production crash reporting

These remain captured in `docs/BACKLOG.md` and `docs/PRD.md`.

---

## Verification Method (Per Stage)

After each stage:
1. Run `npx expo start --clear` (fresh Metro bundler cache)
2. Scan QR code from Expo Go on physical device
3. Complete the manual test checklist for that stage
4. Provide go/no-go sign-off before next stage begins
