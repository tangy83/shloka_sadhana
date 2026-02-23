# Shloka Sadhana — Feature Summary

**Generated:** 2026-02-22
**Base version:** VAPMAIL16 (commit `fee6470`, 7 Feb 2026)
**Current branch:** `rebuild/expo-go-clean`

---

## What Was in VAPMAIL16 (7 Feb 2026)

VAPMAIL16 was a complete, well-structured codebase — 149 files, 813 passing tests. All the core screens, data, hooks, and utility logic were present. However, the app **could not run on device**: Sentry integration was wired to an external service without credentials, causing a silent crash at startup before any screen rendered.

### Screens present

| Screen | Status in VAPMAIL16 |
|--------|---------------------|
| HomeScreen | ✅ Working — stats grid, Paanchang card, Ekadashi banner, wisdom card, muhurat times, verse of day, recommended shloka |
| PracticeScreen | ✅ Working — timer, mala counter, sankalp + offering modals, streak display |
| LibraryScreen | ✅ Basic list only — no search, no favorites filter |
| ShlokaDetailScreen | ✅ Working — Sanskrit, transliteration, meaning; audio play/pause (basic, no speed control) |
| WisdomScreen + WisdomDetailScreen | ✅ Working |
| EkadashiCalendarScreen + EkadashiDetailScreen | ✅ Working |
| FestivalsListScreen | ✅ Working |
| SessionHistoryScreen | ⚠️ Broken — reading from wrong AsyncStorage key, so history was always empty |
| SatsangScreen | ⚠️ Non-functional — displayed hardcoded fake event data, not a real stub |
| SettingsScreen | ⚠️ Incomplete — font size slider and theme selector were commented out ("Hidden for now") |
| AboutScreen | ✅ Working |
| PrivacyPolicyScreen + TermsOfServiceScreen | ✅ Working |

### Logic and utilities present but not wired to any UI

- `ThemeContext` / `useTheme` — context and persistence existed; no selector in Settings
- `useFontSize` — hook existed; slider was explicitly commented out in Settings
- `favorites.ts` — full AsyncStorage utility; no filter UI in LibraryScreen
- `goalsStorage.ts` — full storage utility; no progress bar or goals UI anywhere
- `notifications.ts` — push notification scheduling; no quiet hours UI
- `useBackgroundTimer` — timer persistence across app background; wired correctly
- `streakRecovery.ts` — recovery message logic; `RecoveryMessageCard` component existed on HomeScreen

### Known bugs in VAPMAIL16

1. **App did not boot on Expo Go** — `sentry.ts` (173 lines) called the real Sentry SDK; missing credentials caused a silent crash before any screen loaded
2. **Session history always empty** — `SessionHistoryScreen` read from `@shloka_sadhana:sessions`; `PracticeScreen` wrote to `practice_history`. No overlap, so history was always blank
3. **Tab bar clipped** — bottom tab bar did not account for device safe area insets; icons were partially hidden behind the home indicator on newer iPhones

---

## What We Built Since VAPMAIL16

All work is on the `rebuild/expo-go-clean` branch. Changes fall into four categories: bug fixes, design system, wiring existing utilities to UI, and net-new features.

---

### 1. Bug Fixes and Reliability

| Fix | Detail |
|-----|--------|
| **App now boots** | `sentry.ts` replaced with a console-only stub; `sentry-expo` plugin removed from `app.json`. Zero external service dependency |
| **Session history works** | Storage key corrected to `practice_history`; `SessionHistoryScreen` updated to use the `CompletedPractice` type with correct field names |
| **Tab bar safe area** | `useSafeAreaInsets()` applied; tab icons no longer clip behind the home indicator |
| **EAS / OTA updates** | EAS Update configured for pushing JS and content updates without App Store re-review |

---

### 2. Design System — Ethnic Indian Palette and Sacred Components

VAPMAIL16 used generic dark UI colors (grays, a maroon accent). All hardcoded color values have been replaced with a saffron-forward Indian palette and a suite of sacred visual components.

**Palette applied across all screens:**

| Token | Before (VAPMAIL16) | After |
|-------|--------------------|-------|
| Background | `#121212` / `#2C1200` | `#1E0E05` (deep temple brown) |
| Surface | `#1E1E1E` | `#2A1408` / `#3A1D0D` |
| Primary accent | `#8B0020` (crimson) | `#FF9A2A → #E55B00` (saffron gradient) |
| Text secondary | `#9E9E9E` | `#FFB74D` (warm amber) |
| Light mode background | `#FFFFFF` | `#FFF0D0` (aged parchment / warm cream) |

**New sacred component library** (`src/components/sacred/`, `src/components/primitives/`):

- `MandalaBackground` — SVG mandala pattern as a full-screen decorative backdrop on the home screen
- `DiyaGlow` — animated flame glow tied to timer state on the practice screen (pulses while active)
- `LotusIcon` — SVG lotus used as a primary decorative icon
- `TrishulIcon` — SVG trishul used in section headers
- `SacredButton` — spring-press touch handler (replaces plain `TouchableOpacity` on primary actions)
- `MalaCelebration` — animated celebration sequence triggered when mala count reaches 108, replacing the plain emoji approach
- `Card` — shared warm-surface card with optional press handler
- `PrimaryButton` — gradient CTA button using saffron gradient

**Animation infrastructure** (`src/animations/sacredAnimations.ts`) — RN Animated constants (easing curves, durations, reduced-motion check). Reanimated was explicitly excluded — Expo Go SDK 54 has an incompatible native bundle.

**New assets:** `flowerpattern.png`, `rangolipattern.png`, `trishul pattern.png`, `glow pattern.png` — decorative motifs for card headers and screen backgrounds.

---

### 3. Wiring Existing Utilities to UI

Several utilities in VAPMAIL16 had full implementations but no UI surface. These have now been wired.

**Library search and favorites filter** (LibraryScreen)
- Search bar added with debounced real-time filtering by name, deity, and keywords
- "All / Favorites" tab toggle added; favorite state reads from the existing `favorites.ts` utility
- VAPMAIL16 had 157 lines in this file; now 471 lines

**Practice goals progress bar** (PracticeScreen)
- Progress bar added that reads from `goalsStorage.ts` and increments as the user taps the mala counter
- Goals can be set in Settings (daily mala count or session duration target)

**Theme selector** (SettingsScreen)
- Light / Dark / System picker added and connected to `ThemeContext`
- Light mode uses warm parchment (#FFF0D0) with saffron accents — not plain white
- Theme persists across restarts

**Font size presets** (SettingsScreen)
- `useFontSize` hook was already written; the slider was commented out in VAPMAIL16
- Re-enabled as three preset buttons (Small / Default / Large / XL: 0.8× – 1.5×)
- Shloka and wisdom text scales correctly; validated at maximum size with no clipping

**Quiet hours** (SettingsScreen)
- Time-range picker (start / end) added to notification settings
- `notifications.ts` extended to suppress any scheduled reminder that falls within the quiet window
- Handles overnight ranges (e.g., 22:00 – 07:00)

**Audio speed control** (ShlokaDetailScreen)
- VAPMAIL16 had basic play/pause; no speed control
- Speed selector added: 0.75× / 1× / 1.25×
- Useful for slower recitation by elder users

---

### 4. Net-New Features

**Quest and achievement system**

Nothing in VAPMAIL16. Entirely new:
- `src/data/quests.ts` — daily quest definitions
- `src/data/achievements.ts` — achievement definitions with unlock conditions
- `src/hooks/useQuestProgress.ts` — quest state and progress, persisted in AsyncStorage
- `src/hooks/useAchievements.ts` — achievement unlock logic and state
- `src/components/home/DailyQuestCard.tsx` — home screen card showing today's quest with progress
- `src/components/home/AchievementProgressCard.tsx` — home screen card showing earned achievements
- `src/components/QuestCompletionModal.tsx` — modal shown on quest completion
- `src/components/AchievementUnlockedModal.tsx` — modal shown on achievement unlock
- PracticeScreen wired to update quest progress and trigger modals after each session

**Onboarding flow**

Nothing in VAPMAIL16. Entirely new:
- `src/screens/OnboardingScreen.tsx` (407 lines) — 3-page first-launch welcome sequence
- Page 1: Devotional welcome with the app's visual language
- Page 2: App purpose explained with persona-resonant copy
- Page 3: Notification permission request
- `onboarded: true` flag written to AsyncStorage on completion; shown once per install; skippable at every step
- `AppNavigator` updated with conditional root: shows `OnboardingScreen` on first launch, `MainTabs` on subsequent launches

**Local user profile and personalised greeting**

Nothing in VAPMAIL16. Entirely new:
- `src/hooks/useUserProfile.ts` — display name and avatar emoji stored in AsyncStorage only
- Profile section added to SettingsScreen
- HomeScreen greeting reads "Welcome back, [Name] 🙏" once a name is set

**Satsang screen rebuilt as proper stub**

VAPMAIL16 `SatsangScreen` rendered hardcoded fake community events as if they were real. This was misleading and would have caused user confusion. Rebuilt as a graceful "Community features coming soon" screen with devotional styling — no fake data.

**"Guest Mode" transparency note**

Added to SettingsScreen to inform users that cloud sync is a planned future feature, so there is no confusion about data portability.

**"View Practice History" shortcut**

A quick-access button added to HomeScreen below the stats grid, navigating directly to SessionHistoryScreen.

---

## Backlog — Planned Enhancements

Captured in full in [docs/BACKLOG.md](BACKLOG.md). Items are prioritised P1–P4.

### P1 — Must Do (Post-Launch)

| Feature | Notes |
|---------|-------|
| **User Authentication & Cloud Sync** | Optional account (email/social) for cloud backup of streaks, sessions, settings. Multi-device sync with local-to-cloud migration. Firebase or Supabase. |
| **Accessibility Enhancements** | Comprehensive WCAG AA+ — improved screen reader labels, dynamic type (iOS), voice control, reduced motion mode, high contrast |

### P2 — High Value (Next Cycle)

| Feature | Notes |
|---------|-------|
| **Donations (Stripe)** | Voluntary Dana model — one-time and monthly. All features stay free forever. Thank-you flow and email receipts |
| **Contact Us / Feedback form** | In-app feedback and feature request submission. High priority for post-launch user engagement |
| **Weekly Practice Digest** | "This week" summary (sessions, minutes, malas) on home. Optional Sunday push notification. Opt-in, respects quiet hours |
| **Default Timer 30s option** | Allow minimum session duration of 30 seconds (default stays 60s). Useful for shorter mantras |
| **Home Screen Widget** | iOS 14+ / Android 12+ widget showing streak and a "Start Practice" tap target. Requires WidgetKit / App Widget native modules |
| **Offline indicator** | Non-alarming banner when offline and remote content is unavailable. Uses NetInfo; only shown when a remote fetch is attempted |
| **Full audio library** | Professional studio recordings, lock screen / Control Centre media controls, background playback. Audio sessions count toward streaks. Requires sourcing or recording content |

### P3 — Nice to Have

| Feature | Notes |
|---------|-------|
| **Advanced practice features** | Practice templates, custom mala configurations (non-108), session search/filter, data export (CSV/JSON) |
| **Social and sharing** | Share session summary, local practice group finder, teacher directory, anonymous community Q&A |
| **Advanced statistics** | Monthly/yearly summaries, streak heatmap calendar, best practice times, data export (CSV/PDF) |
| **Ekadashi stories** | Mythological narrative behind each Ekadashi — noted as an extension to the existing Ekadashi Calendar screen |

### P4 — Long-Term Vision

| Feature | Notes |
|---------|-------|
| **Content expansion** | 50+ additional shlokas and mantras — Stotrams (Shiva, Lakshmi, Saraswati), regional languages (Hindi, Tamil, Telugu), multiple translations, audio library, video lessons |
| **Platform expansion** | iPad-optimised layout, Android tablet, web (Expo Web), desktop (Electron), Apple Watch companion, Wear OS |

---

*Full acceptance criteria and technical notes per backlog item: [docs/BACKLOG.md](BACKLOG.md)*
*Product requirements and version history: [docs/PRD.md](PRD.md)*
*Stage-by-stage rebuild details: [docs/EXPO_GO_REBUILD_PLAN.md](EXPO_GO_REBUILD_PLAN.md)*
