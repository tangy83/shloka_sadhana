# Product Requirements Document (PRD)
# Shloka Sadhana - Spiritual Practice Companion

**Version:** 2.0
**Date:** February 5, 2026
**Status:** V2 Complete - Planning V3
**Owner:** Product Team

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [Goals & Objectives](#goals--objectives)
4. [Target Audience](#target-audience)
5. [User Personas](#user-personas)
6. [User Stories](#user-stories)
7. [Feature Requirements](#feature-requirements)
8. [Non-Functional Requirements](#non-functional-requirements)
9. [Technical Requirements](#technical-requirements)
10. [Success Metrics](#success-metrics)
11. [V2 Completed Features](#v2-completed-features-february-2026)
12. [V3 Roadmap](#v3-roadmap-planned-features)
13. [App Store Readiness & Launch Plan](#app-store-readiness--launch-plan)
14. [Monetization Strategy](#monetization-strategy)
15. [Future Enhancements](#future-enhancements)
16. [Risks & Mitigation](#risks--mitigation)

---

## Executive Summary

Shloka Sadhana is a **native mobile application** (iOS and Android) designed to support practitioners in their daily spiritual practice of chanting and meditation. The app provides a comprehensive toolkit including a shloka library, practice timer with haptic feedback, streak tracking, and cultural context through Hindu calendar integration (Paanchang). By combining traditional wisdom with modern mobile technology, Shloka Sadhana helps users build consistent spiritual habits and deepen their practice.

**Platform:** React Native with Expo (iOS and Android)
**Core Value Proposition:** Transform sporadic spiritual practice into a consistent, meaningful daily ritual through gentle guidance, cultural context, and community support in a native mobile experience.

### Current Status (V2 Complete - February 2026)

**Development Status:** ✅ **V2 COMPLETE** - Production Ready
- **656 comprehensive tests passing** (100% TDD approach)
- **5 development phases completed** (all features implemented and tested)
- **Offline-first architecture** (works without internet)
- **Ready for App Store & Play Store submission** (see APP_STORE_CHECKLIST.md)

**V2 Achievements:**
- Shloka Library with 3 core shlokas (Vishnu Sahasranam, Hanuman Chalisa, Gayatri Mantra)
- Practice timer with mala counter and haptic feedback
- Streak tracking and session history
- Hindu calendar (Paanchang) with Tithi, Nakshatra, Paksha
- Settings & Personalization (font size, notifications, reminders)
- Full dark theme UI
- Complete accessibility support
- Offline data persistence with AsyncStorage

**What's Next:**
- V3 planning in progress with 20+ new features in backlog
- Priority features: Theme system, Ekadashi calendar, Cloud sync, Donations
- See [V3 Roadmap](#v3-roadmap) section below

---

## Problem Statement

### The Challenge

Many spiritual practitioners struggle with:
1. **Inconsistent Practice:** Difficulty maintaining daily spiritual routines
2. **Lack of Guidance:** Not knowing which shlokas to chant or when to practice
3. **Lost Tradition:** Disconnection from cultural and spiritual context
4. **Isolation:** Practicing alone without community support
5. **Progress Tracking:** No way to measure consistency or growth
6. **Motivation:** Losing motivation after initial enthusiasm fades

### Why This Matters

Regular spiritual practice has profound benefits for mental health, emotional well-being, and spiritual growth. However, without structure, guidance, and community, most people abandon their practice within weeks. Shloka Sadhana addresses these barriers by providing:
- **Structure:** Clear practice sessions with timers and counters
- **Guidance:** Curated shloka library with meanings and best practice times
- **Context:** Hindu calendar and moon phases for auspicious timing
- **Community:** Anonymous sharing through Satsang feature
- **Motivation:** Streak tracking and progressive wisdom unlocking

---

## Goals & Objectives

### Primary Goals

1. **Increase Practice Consistency**
   - Help users maintain daily spiritual practice for 30+ consecutive days
   - Reduce practice abandonment rate to <20%

2. **Deepen Spiritual Understanding**
   - Provide cultural and spiritual context for each practice
   - Unlock progressive wisdom teachings based on consistency

3. **Foster Community Connection**
   - Create safe space for sharing spiritual experiences
   - Build sense of community without social media pressures

### Secondary Goals

4. **Accessibility & Inclusivity**
   - Make spiritual practice accessible to beginners
   - Respect diverse spiritual paths within Hindu traditions

5. **Offline-First Experience**
   - Work without internet connection
   - Store progress locally for privacy

---

## Target Audience

### Primary Audience

**Spiritual Practitioners (Ages 25-55)**
- Practicing or interested in Hindu spiritual traditions
- Seeking structured approach to daily practice
- Comfortable with technology but value simplicity
- English-speaking, globally distributed
- Mix of heritage practitioners and seekers from other backgrounds

### Secondary Audience

**Beginners to Spiritual Practice (Ages 18-35)**
- Curious about meditation and chanting
- Seeking stress relief and mental clarity
- May not have family tradition of practice
- Looking for guidance and structure

---

## User Personas

### Persona 1: Priya - The Consistent Practitioner

**Demographics:**
- Age: 42
- Location: Mumbai, India
- Occupation: Software Engineer
- Background: Grew up with spiritual practice, lapsed in 20s, returning now

**Goals:**
- Restart daily Hanuman Chalisa practice
- Track consistency to stay motivated
- Learn deeper meanings of verses

**Pain Points:**
- Forgets to practice without reminders
- Loses count during chanting
- Feels isolated in practice

**How Shloka Sadhana Helps:**
- Streak tracking keeps her accountable
- Mala counter prevents distraction
- Satsang feature provides community connection

### Persona 2: Michael - The Curious Seeker

**Demographics:**
- Age: 28
- Location: San Francisco, USA
- Occupation: Graphic Designer
- Background: No family tradition, exploring meditation

**Goals:**
- Learn about Hindu spiritual practices
- Start meditation practice
- Understand cultural context

**Pain Points:**
- Overwhelmed by information online
- Doesn't know where to start
- Concerned about cultural appropriation

**How Shloka Sadhana Helps:**
- Curated library with clear guidance
- Educational content with cultural context
- Respectful presentation of traditions

### Persona 3: Asha - The Elder Teacher

**Demographics:**
- Age: 67
- Location: Chennai, India
- Occupation: Retired Teacher
- Background: Lifelong spiritual practice

**Goals:**
- Maintain daily Vishnu Sahasranam practice
- Share wisdom with younger generation
- Track practice time for personal discipline

**Pain Points:**
- Technology can be confusing
- Needs simple, focused interface
- Wants to contribute to community

**How Shloka Sadhana Helps:**
- Simple, large text interface
- Clear navigation without clutter
- Satsang allows anonymous wisdom sharing

---

## User Stories

### Epic 1: Practice Management

**US-1.1:** As a practitioner, I want to start a practice session with a timer so that I can track how long I practice.

**US-1.2:** As a practitioner, I want to count my chants using a mala counter so that I don't lose track during practice.

**US-1.3:** As a practitioner, I want to set a daily sankalp (intention) so that I can dedicate my practice meaningfully.

**US-1.4:** As a practitioner, I want to pause and resume my practice session so that I can handle interruptions without losing my progress.

### Epic 2: Shloka Library

**US-2.1:** As a user, I want to browse a library of shlokas so that I can choose what to practice.

**US-2.2:** As a beginner, I want to see the Sanskrit text, transliteration, and meaning so that I can learn correctly.

**US-2.3:** As a practitioner, I want to know the best time to chant each shloka so that I can practice at auspicious times.

**US-2.4:** As a user, I want to watch video tutorials on YouTube so that I can learn proper pronunciation.

### Epic 3: Progress Tracking

**US-3.1:** As a practitioner, I want to see my current streak so that I stay motivated to practice daily.

**US-3.2:** As a user, I want to mark today's practice as complete so that my streak is maintained.

**US-3.3:** As a practitioner, I want to see my practice statistics (total time, sessions) so that I can track my growth.

**US-3.4:** As a user, I want my data to persist locally so that I don't lose my progress.

### Epic 4: Cultural Context

**US-4.1:** As a user, I want to see today's moon phase and paksha so that I understand the spiritual significance.

**US-4.2:** As a practitioner, I want to see today's tithi (lunar day) so that I can practice on auspicious days.

**US-4.3:** As a seeker, I want to receive daily wisdom quotes so that I can reflect on spiritual teachings.

### Epic 5: Community & Learning

**US-5.1:** As a practitioner, I want to read anonymous reflections from others so that I feel connected to a community.

**US-5.2:** As a user, I want to share my practice reflections anonymously so that I can contribute without social pressure.

**US-5.3:** As a committed practitioner, I want to unlock wisdom teachings based on my streak so that I'm rewarded for consistency.

### Epic 6: Session Completion

**US-6.1:** As a practitioner, I want to offer my practice to someone/something so that I practice selflessness.

**US-6.2:** As a user, I want to write a reflection after practice so that I can capture insights.

**US-6.3:** As a practitioner, I want to see my session summary (time, counts) so that I can review what I accomplished.

---

## Feature Requirements

### Feature 1: Practice Timer & Counter

**Priority:** P0 (Must Have)
**Complexity:** Medium
**Epic:** Practice Management

**Description:**
A combined timer and mala counter that allows users to track their practice session duration and count repetitions.

**Functional Requirements:**
- FR-1.1: Display a timer showing minutes and seconds (MM:SS format)
- FR-1.2: Start/pause/stop functionality with clear visual feedback
- FR-1.3: Mala counter with +1 increment button
- FR-1.4: Display total count and mala count (count / 108 malas + remainder)
- FR-1.5: Timer continues running even if user switches views
- FR-1.6: Session minimum time of 60 seconds to count as valid practice

**Acceptance Criteria:**
- AC-1.1: User can start timer and it counts up from 00:00
- AC-1.2: User can pause timer and resume without losing time
- AC-1.3: Counter increments by 1 each time user taps count button
- AC-1.4: Counter displays "X malas + Y" format (e.g., "2 malas + 37")
- AC-1.5: Timer persists when user navigates to other views
- AC-1.6: Sessions under 60 seconds do not mark day as complete

**User Flow:**
1. User taps "Begin Today's Practice" on home screen
2. Optional: Set sankalp (intention) in modal
3. Timer screen appears with 00:00 and count at 0
4. User taps play button to start timer
5. User chants and taps "+Count" button after each repetition
6. User taps pause to stop temporarily or "Complete Session" to finish
7. System shows offering modal (if session > 60 seconds)
8. System shows session summary

### Feature 2: Sankalp (Intention Setting)

**Priority:** P0 (Must Have)
**Complexity:** Low
**Epic:** Practice Management

**Description:**
Allow users to set a sacred intention (sankalp) before beginning their practice session.

**Functional Requirements:**
- FR-2.1: Modal appears before practice if no sankalp set for today
- FR-2.2: Textarea for entering sankalp (max 500 characters)
- FR-2.3: Option to skip sankalp and practice without one
- FR-2.4: Display today's sankalp during practice session
- FR-2.5: Store sankalp with date in localStorage
- FR-2.6: Sankalp resets each day (not carried over)

**Acceptance Criteria:**
- AC-2.1: Modal blocks practice until user sets sankalp or skips
- AC-2.2: User can enter multi-line text (up to 500 chars)
- AC-2.3: Skip button allows proceeding without sankalp
- AC-2.4: Sankalp displayed prominently during practice
- AC-2.5: Sankalp persists across browser refreshes for same day
- AC-2.6: New day shows empty sankalp modal again

### Feature 3: Streak Tracking

**Priority:** P0 (Must Have)
**Complexity:** Medium
**Epic:** Progress Tracking

**Description:**
Track consecutive days of practice and display current streak to motivate consistency.

**Functional Requirements:**
- FR-3.1: Calculate streak based on consecutive days with completed sessions
- FR-3.2: Display current streak number prominently on home screen
- FR-3.3: Visual indicator showing if today is complete
- FR-3.4: Persist streak data in localStorage with dates
- FR-3.5: Break streak if user misses a day (not practices by midnight)
- FR-3.6: Allow multiple practice sessions per day (only first counts for streak)

**Acceptance Criteria:**
- AC-3.1: Streak displays as large number on home screen
- AC-3.2: Green checkmark shows when today is complete
- AC-3.3: Empty circle shows when today is not yet complete
- AC-3.4: Streak increases by 1 when user completes first session of new day
- AC-3.5: Streak resets to 0 if user skips a day
- AC-3.6: Streak survives browser refresh/close

**Edge Cases:**
- User practices at 11:59 PM and continues past midnight (counts for previous day)
- User travels across time zones (use local device time)
- User clears browser data (streak resets - acceptable for MVP)

### Feature 4: Shloka Library

**Priority:** P0 (Must Have)
**Complexity:** Medium
**Epic:** Shloka Library

**Description:**
A curated library of sacred Hindu shlokas and mantras with meanings and guidance.

**Functional Requirements:**
- FR-4.1: Display list of available shlokas with names and deities
- FR-4.2: Show shloka details including Sanskrit text, transliteration, meaning
- FR-4.3: Display recommended practice time (e.g., "Morning or before sleep")
- FR-4.4: Show estimated duration for each shloka
- FR-4.5: Link to YouTube video for pronunciation guidance
- FR-4.6: Expandable sections for each verse (tap to see details)

**Initial Shloka Collection (MVP):**
1. **Vishnu Sahasranam** (1000 names of Lord Vishnu)
   - Duration: 25 minutes
   - Best time: Morning or before sleep
   - Benefits: Peace, protection, spiritual growth

2. **Hanuman Chalisa** (40 verses praising Lord Hanuman)
   - Duration: 10 minutes
   - Best time: Tuesday, Saturday, or anytime
   - Benefits: Courage, strength, removal of obstacles

3. **Gayatri Mantra** (Sacred verse from Rigveda)
   - Duration: 3 minutes
   - Best time: Sunrise, noon, sunset (Sandhya)
   - Benefits: Wisdom, clarity, spiritual illumination

**Acceptance Criteria:**
- AC-4.1: User can browse all shlokas in library view
- AC-4.2: Tapping a shloka shows detail view with all verses
- AC-4.3: Each verse displays Sanskrit, transliteration, and meaning
- AC-4.4: YouTube link opens in new tab
- AC-4.5: "Start Practice" button launches timer with that shloka

### Feature 5: Hindu Calendar Integration

**Priority:** P1 (Should Have)
**Complexity:** Medium
**Epic:** Cultural Context

**Description:**
Display current lunar day (tithi), moon phase, and paksha to provide cultural and spiritual context.

**Functional Requirements:**
- FR-5.1: Calculate and display current tithi (lunar day)
- FR-5.2: Show moon phase emoji (🌒, 🌔, 🌖, 🌘, 🌑, 🌕)
- FR-5.3: Display paksha (Shukla or Krishna)
- FR-5.4: Provide brief spiritual guidance for current phase
- FR-5.5: Update automatically at midnight

**Tithi Calculation (Simplified):**
- Use date-based approximation for MVP
- Future: Integrate proper lunar calendar API

**Acceptance Criteria:**
- AC-5.1: Home screen displays current moon phase emoji
- AC-5.2: Tithi name displayed (e.g., "Pratipada", "Ekadashi", "Purnima")
- AC-5.3: Paksha indicated (Shukla or Krishna)
- AC-5.4: Brief guidance text shown (e.g., "Waxing moon — ideal for new beginnings")
- AC-5.5: Information updates when day changes

**Cultural Note:**
Actual Hindu calendar calculations are complex and region-specific. For MVP, we'll use simplified approximations. Future versions can integrate proper Panchang APIs.

### Feature 6: Wisdom Teachings (Progressive Unlocking)

**Priority:** P1 (Should Have)
**Complexity:** Low
**Epic:** Community & Learning

**Description:**
Unlock spiritual wisdom teachings progressively as users maintain their practice streak.

**Functional Requirements:**
- FR-6.1: Display list of wisdom teachings with unlock requirements
- FR-6.2: Show locked teachings with required streak days
- FR-6.3: Automatically unlock teachings when streak reaches requirement
- FR-6.4: Display teaching content (title, quote, explanation)
- FR-6.5: Store unlock status in localStorage

**Wisdom Teaching Milestones (MVP):**
- **Day 7:** "The Power of Repetition" (unlocked by default for demo)
- **Day 14:** "Sound is Brahman"
- **Day 21:** "The Mala's Secret"
- **Day 30:** "Sankalp Shakti"

**Acceptance Criteria:**
- AC-6.1: Teachings show locked icon with "X day streak" requirement
- AC-6.2: Locked teachings show teaser text
- AC-6.3: Unlocked teachings show full content
- AC-6.4: New unlock triggers celebratory animation
- AC-6.5: Unlock status persists across sessions

### Feature 7: Satsang (Community Reflections)

**Priority:** P2 (Nice to Have)
**Complexity:** Low (MVP - Static) / High (Future - Dynamic)

**Description:**
Anonymous community space for sharing spiritual reflections without social media pressures.

**Functional Requirements (MVP - Static Content):**
- FR-7.1: Display curated list of anonymous reflections
- FR-7.2: Show reflection text, relative time, and general location
- FR-7.3: Scrollable feed of reflections
- FR-7.4: No user-generated content in MVP (future enhancement)

**Acceptance Criteria:**
- AC-7.1: Satsang view displays 4-10 sample reflections
- AC-7.2: Each reflection shows text, time ago, and city
- AC-7.3: No like/comment functionality (intentionally absent)
- AC-7.4: Scrolls smoothly on mobile

**Future Enhancement:**
- User can submit anonymous reflections (with moderation)
- Geographic diversity in reflections shown
- Optional: Reflection submission after completing practice

### Feature 8: Daily Wisdom Quotes

**Priority:** P2 (Nice to Have)
**Complexity:** Low
**Epic:** Community & Learning

**Description:**
Display rotating daily wisdom quotes from Bhagavad Gita and other sacred texts.

**Functional Requirements:**
- FR-8.1: Show one wisdom quote per day on home screen
- FR-8.2: Rotate quotes based on date (deterministic)
- FR-8.3: Curated collection of 30+ quotes
- FR-8.4: Display as banner or card on home screen

**Acceptance Criteria:**
- AC-8.1: Home screen displays today's wisdom quote
- AC-8.2: Quote changes daily at midnight
- AC-8.3: Same date always shows same quote (deterministic)
- AC-8.4: Quote is readable and properly formatted

### Feature 9: Practice Session Completion Flow

**Priority:** P1 (Should Have)
**Complexity:** Medium
**Epic:** Practice Management

**Description:**
Meaningful completion flow after practice session including offering and reflection.

**Functional Requirements:**
- FR-9.1: "Offering" modal after sessions > 60 seconds
- FR-9.2: Predefined offering options (family, world peace, divine, ancestors, all beings)
- FR-9.3: Optional reflection textarea
- FR-9.4: Session summary with time and count
- FR-9.5: Return to home screen after completion

**Acceptance Criteria:**
- AC-9.1: Offering modal appears after completing valid session
- AC-9.2: User can select one offering option (radio buttons)
- AC-9.3: User can skip offering
- AC-9.4: Reflection modal appears after offering (skippable)
- AC-9.5: Session summary shows before returning home
- AC-9.6: Today marked as complete after finishing flow

---

## Non-Functional Requirements

### Performance

**NFR-1: Page Load Time**
- Initial page load: < 2 seconds on 3G connection
- Subsequent navigation: < 500ms

**NFR-2: Responsiveness**
- Timer updates: < 100ms lag
- Button interactions: < 50ms feedback
- Smooth scrolling: 60fps on modern mobile devices

### Usability

**NFR-3: Mobile-First Design**
- Optimized for screen sizes 320px - 428px width
- All interactions thumb-reachable on 6" phones
- Large touch targets (minimum 44x44px)

**NFR-4: Accessibility**
- WCAG 2.1 Level AA compliance
- Screen reader friendly (semantic HTML, ARIA labels)
- Keyboard navigation support
- Sufficient color contrast (minimum 4.5:1)

**NFR-5: Internationalization (Future)**
- Support for English (MVP)
- Infrastructure for Sanskrit, Hindi, Tamil (future)

### Reliability

**NFR-6: Offline Functionality**
- App works completely offline after first load
- All data stored in localStorage
- No server dependencies for core features

**NFR-7: Data Persistence**
- Practice data survives browser refresh
- Graceful handling of localStorage quota exceeded
- Data corruption recovery (fallback to defaults)

### Security & Privacy

**NFR-8: Authentication & Data Persistence (Guest-First Model)**

**Default Experience (Guest Mode):**
- App fully functional without any account or login
- All features accessible immediately (practice, timer, counter, library, wisdom, satsang)
- Data stored locally in AsyncStorage (device only)
- No sign-up prompts, no login gates, no interruptions
- Privacy-first: zero data sent to servers in guest mode

**Optional Cloud Sync (Non-Intrusive):**
- Account creation available in Settings (subtle, never promoted)
- Purpose: Save progress across devices and preserve data if app deleted
- Opt-in only: Users must explicitly choose to create account
- Seamless migration: Local data transfers to cloud when user creates account
- Privacy: No tracking or analytics even for logged-in users

**Guest Mode Limitations (Transparent):**
- Data lost if app deleted or device changed
- No cross-device sync
- Subtle notification in Settings: "Create account to backup your progress"

**Account Features (If User Opts In):**
- Cloud backup of streak, practice history, and settings
- Cross-device sync (practice on phone, continue on tablet)
- Data recovery if app reinstalled
- No social features, no public profiles (respecting spiritual privacy)

**NFR-9: Data Protection**
- Safe handling of AsyncStorage errors (guest mode) and cloud storage errors (account mode)
- No sensitive PII collected (only email if account created)
- Clear data deletion instructions (both local and cloud)
- GDPR compliance: Right to export data, right to be forgotten
- No third-party analytics or tracking (respecting spiritual privacy)

### Browser Compatibility

**NFR-10: Supported Browsers**
- Chrome/Edge: Latest 2 versions
- Safari (iOS): Latest 2 versions
- Firefox: Latest 2 versions
- No IE11 support

### Cultural Sensitivity

**NFR-11: Respectful Representation**
- Accurate Sanskrit transliteration (IAST or Harvard-Kyoto)
- Respectful language and imagery
- Cultural context provided with sensitivity
- Consultation with spiritual teachers for content accuracy

---

## Technical Requirements

### Technology Stack

**Framework:** React Native 0.73+ with Expo SDK 50+
**Language:** TypeScript (strict mode)
**Testing:** Jest + React Native Testing Library + Detox (E2E)
**Navigation:** React Navigation 6
**Styling:** StyleSheet (React Native) or Styled Components
**State Management:** React Context API + AsyncStorage (MVP - guest mode only)
**Authentication (Phase 2):** Firebase Auth or Supabase (optional, non-intrusive)
**Backend (Phase 2):** Firebase Firestore or Supabase (cloud sync for logged-in users only)
**Build System:** EAS Build (Expo Application Services)
**Notifications:** expo-notifications
**Haptics:** expo-haptics
**Audio (future):** expo-av

### Project Structure

```
shloka-sadhana/
├── App.tsx                 # Root component
├── app.json                # Expo configuration
├── src/
│   ├── navigation/        # React Navigation setup
│   ├── screens/           # Screen components
│   │   ├── HomeScreen/
│   │   ├── LibraryScreen/
│   │   ├── PracticeScreen/
│   │   ├── SatsangScreen/
│   │   └── WisdomScreen/
│   ├── components/
│   │   ├── common/        # Reusable UI components
│   │   ├── timer/         # Timer & counter components
│   │   ├── library/       # Shloka library components
│   │   └── modals/        # Modal components
│   ├── hooks/             # Custom React hooks
│   ├── contexts/          # React Context providers
│   ├── utils/             # Utility functions
│   ├── data/              # Static data (shlokas, quotes)
│   ├── types/             # TypeScript type definitions
│   ├── constants/         # Constants (colors, layout)
│   └── __tests__/         # Test files
├── assets/                # Images, fonts, sounds
│   ├── images/
│   ├── fonts/
│   └── sounds/
└── docs/                  # Documentation
```

### Data Models

**Streak Data:**
```typescript
interface StreakData {
  currentStreak: number;
  lastPracticeDate: string; // ISO date
  practiceHistory: PracticeSession[];
}
```

**Practice Session:**
```typescript
interface PracticeSession {
  id: string;
  date: string; // ISO date
  duration: number; // seconds
  count: number;
  shlokaId?: string;
  sankalp?: string;
  offering?: string;
  reflection?: string;
}
```

**Shloka:**
```typescript
interface Shloka {
  id: string;
  name: string;
  shortName: string;
  deity: string;
  description: string;
  benefits: string;
  duration: string;
  bestTime: string;
  youtubeUrl: string;
  sections: ShlokaSection[];
}

interface ShlokaSection {
  id: number;
  sanskrit: string;
  transliteration: string;
  meaning: string;
}
```

### AsyncStorage Keys

- `@shloka_sadhana:streak` - Streak data
- `@shloka_sadhana:sessions` - Practice sessions
- `@shloka_sadhana:today_sankalp` - Today's sankalp
- `@shloka_sadhana:settings` - User settings (notifications, haptics)
- `@shloka_sadhana:onboarding_complete` - First launch flag

---

## Success Metrics

### Primary Metrics (P0)

**M-1: Daily Active Users (DAU)**
- Target: 70% of users who installed return next day
- Measurement: localStorage presence check

**M-2: Streak Completion Rate**
- Target: 40% of users reach 7-day streak
- Target: 20% of users reach 21-day streak
- Measurement: Streak data in localStorage

**M-3: Practice Session Completion**
- Target: 80% of started sessions completed (> 60 seconds)
- Measurement: Session data

### Secondary Metrics (P1)

**M-4: Feature Engagement**
- Target: 60% of users explore shloka library
- Target: 40% of users set daily sankalp
- Target: 30% of users visit satsang section
- Measurement: View tracking (localStorage)

**M-5: Session Duration**
- Target: Average session duration > 10 minutes
- Measurement: Timer data

### Success Criteria for MVP Launch

- [ ] 100 beta users complete 7-day streak
- [ ] < 5% reported bugs
- [ ] Average session rating > 4.5/5
- [ ] Zero data loss incidents
- [ ] Mobile performance > 55/100 (Lighthouse)

---

## V2 Completed Features (February 2026)

All features below are **✅ COMPLETE** with comprehensive test coverage (656 tests passing).

### Phase 1: Shloka Library & Detail Screen ✅
**Status:** Complete (5 tasks, all tests passing)

**Completed Features:**
1. **Shloka Library Screen**
   - Browse curated collection of shlokas
   - Category-based organization (Vishnu, Hanuman, Universal)
   - Filter by deity/category
   - Search functionality
   - Card-based UI with deity icons

2. **Shloka Detail Screen**
   - Full Sanskrit text with transliteration
   - English meanings for each verse
   - Practice benefits and best times
   - YouTube video integration for pronunciation
   - Start practice directly from detail view

3. **Initial Shloka Collection**
   - Vishnu Sahasranam (1000 names, 25 min)
   - Hanuman Chalisa (40 verses, 10 min)
   - Gayatri Mantra (universal, 3 min)

**Test Coverage:**
- Library screen rendering and navigation
- Detail screen content display
- Search and filter functionality
- YouTube link handling
- Accessibility labels

### Phase 2: Paanchang (Hindu Calendar) Integration ✅
**Status:** Complete (7 tasks, all tests passing)

**Completed Features:**
1. **Paanchang Screen**
   - Today's Tithi (lunar day) with accurate calculation
   - Nakshatra (lunar mansion) display
   - Paksha (Shukla/Krishna fortnight)
   - Moon phase visualization with emoji
   - Spiritual significance and guidance

2. **Calendar Calculations**
   - Accurate lunar calculations
   - Time-zone aware
   - Updates at midnight automatically
   - Handles edge cases (new moon, full moon)

3. **Home Screen Integration**
   - Quick Paanchang widget on home
   - Moon phase display
   - Tap to view full details

**Test Coverage:**
- Tithi calculation accuracy
- Nakshatra mapping
- Paksha determination
- Moon phase rendering
- Time-zone handling
- Midnight refresh logic

### Phase 3: Practice Session Enhancements ✅
**Status:** Complete (6 tasks, all tests passing)

**Completed Features:**
1. **Session Notes & Reflection**
   - Add notes during/after practice
   - Reflection prompts
   - Notes stored with session history
   - Character limit (500 chars)

2. **Offering/Dedication**
   - Dedicate practice to someone/something
   - Predefined offering options (family, world peace, divine, ancestors, all beings)
   - Custom offering text input
   - Stored with session data

3. **Sankalp (Intention) Setting**
   - Set daily intention before practice
   - Modal appears before first session
   - Displayed during practice
   - Resets daily

4. **Session History Improvements**
   - View all past sessions
   - Filter by date range
   - See offerings and notes
   - Session statistics
   - Export data (coming in V3)

5. **Enhanced Session Summary**
   - Detailed stats (time, count, malas)
   - Notes and offerings displayed
   - Streak update shown
   - Share functionality (coming in V3)

**Test Coverage:**
- Notes input and storage
- Offering selection and custom text
- Sankalp modal flow
- Session history display
- Summary screen rendering
- Data persistence

### Phase 4: Home & Dashboard Screen ✅
**Status:** Complete (3 tasks, all tests passing)

**Completed Features:**
1. **Enhanced Home Screen**
   - Today's practice status (complete/incomplete)
   - Current streak prominently displayed
   - Quick Paanchang widget
   - Recent session preview
   - "Begin Practice" CTA button
   - Daily wisdom quote

2. **Dashboard Statistics**
   - Total sessions count
   - Total practice time (hours/minutes)
   - Total chants count
   - Longest streak
   - Current month activity

3. **Visual Design**
   - Dark theme UI
   - Card-based layout
   - Smooth animations
   - Accessibility-first design

**Test Coverage:**
- Home screen rendering
- Streak display and updates
- Statistics calculation
- Practice status logic
- Navigation flows
- Accessibility compliance

### Phase 5: Settings & Personalization ✅
**Status:** Complete (3 tasks, all tests passing)

**Completed Features:**
1. **Notification Settings**
   - Enable/disable daily reminders
   - Customizable reminder time (12-hour picker)
   - Permission request handling
   - Local notifications (no server needed)
   - Notification scheduling and cancellation

2. **Font Size Adjustment**
   - Slider control (0.8x - 1.5x)
   - Live preview
   - Applies globally across app
   - Persists across sessions
   - Accessibility enhancement

3. **App Information**
   - App version display
   - About screen
   - Privacy Policy link
   - Terms of Service link
   - Clear data option (with confirmation)

**Test Coverage:**
- Notification toggle functionality
- Time picker modal
- Font size slider behavior
- Settings persistence
- Clear data confirmation
- External link handling

### Additional V2 Features ✅

**Core Infrastructure:**
- AsyncStorage for local data persistence
- React Navigation setup with tab navigation
- TypeScript strict mode throughout
- Test-Driven Development (TDD) approach
- Comprehensive error handling
- Offline-first architecture

**UI/UX:**
- Full dark theme
- Consistent color palette
- Smooth transitions and animations
- Large touch targets (accessibility)
- Screen reader support
- Semantic HTML/ARIA labels

**Data Management:**
- Session history tracking
- Streak calculation and persistence
- User settings storage
- Paanchang data caching
- Graceful storage error handling

**Development Quality:**
- 656 tests passing (100% feature coverage)
- Jest + React Native Testing Library
- Detox E2E tests (planned)
- TypeScript type safety
- ESLint + Prettier configuration
- CI/CD ready

---

## V3 Roadmap (Planned Features)

All features below are in the **BACKLOG** and planned for V3+ releases. See BACKLOG.md for detailed specifications and estimates.

### V3 Priority 1 Features (Must Have)

**Estimated Timeline:** 6-8 weeks
**Total Complexity:** 39 points

#### 1. Theme System (Dark/Light/Auto) - 8 points
**Status:** Infrastructure ✅ Complete, UI Implementation Deferred
- Light theme UI components
- Auto theme based on system settings
- Theme toggle in settings
- Persistent theme preference
- All screens themed consistently
- **Note:** Dark theme infrastructure and context already implemented in V2

#### 2. Ekadashi Calendar & Details - 8 points
**Status:** Planned for V3
- Display next 12 Ekadashi dates (rolling)
- Ekadashi detail screen with:
  - Name and significance
  - Fasting guidelines
  - Recommended practices
  - Sunrise/sunset times
- Ekadashi reminders (optional)
- Integration with Paanchang screen
- Historical Ekadashi dates
- **User Request:** Show important Ekadashi dates for spiritual practice planning

#### 3. Accessibility Enhancements - 3 points
**Status:** V2 has good foundation, V3 to enhance
- Screen reader optimization
- Dynamic type support (iOS)
- Voice control compatibility
- Reduced motion option
- High contrast mode
- Keyboard navigation (future web version)

#### 4. Over-The-Air (OTA) Updates - 5 points
**Status:** Planned for V3
- EAS Update integration
- Push JavaScript/content updates without app store
- Update notification to users
- Rollback capability
- Staged rollouts (beta testing)
- Update size optimization
- **Benefit:** Fix bugs and update content quickly without app store review

#### 5. User Authentication & Cloud Sync - 15 points
**Status:** Planned for V3 Priority 1
- **Guest-first approach** (no login required)
- Optional account creation (Settings only)
- Firebase Auth or Supabase integration
- Email/password authentication
- Social auth (Google, Apple)
- **Cloud sync features:**
  - Backup streak and session history
  - Sync settings across devices
  - Restore data after reinstall
  - Cross-device continuity
- **Data migration:** Seamless local-to-cloud transfer
- **Privacy:** No tracking, user data stays private
- **User Request:** Users want to track progress over weeks/months across devices

### V3 Priority 2 Features (Should Have)

**Estimated Timeline:** 8-12 weeks
**Total Complexity:** 60 points

#### 6. Donations & Payments (Stripe Integration) - 13 points
**Status:** Planned for V3 Priority 2
- **Dana (voluntary giving) model** - no forced payments
- Donation button in Settings
- Stripe payment integration
- Multiple donation amounts ($5, $10, $25, custom)
- One-time and monthly options
- Receipt generation via email
- Secure payment handling (PCI compliant)
- Thank you message after donation
- **User Request:** Allow users to support development through voluntary donations
- **Note:** Free app with optional support, not required for any features

#### 7. Library Favorites Filter - 2 points
- Mark shlokas as favorites (heart icon)
- Filter library to show only favorites
- Favorite status persists
- Quick access to most-practiced shlokas

#### 8. Library Search Functionality - 3 points
- Search bar in library screen
- Search by shloka name, deity, or keywords
- Real-time filtering
- Clear search button
- Search history (optional)

#### 9. Practice Goals UI - 5 points
- Set daily/weekly practice goals
- Visual progress toward goals
- Goal types: time-based, count-based, streak-based
- Goal completion celebrations
- Goal streaks

#### 10. Quiet Hours for Reminders - 3 points
- Set quiet hours (e.g., 10 PM - 7 AM)
- No notifications during quiet time
- Customize per day of week
- Automatic DND integration (iOS)

#### 11. Streak Recovery Message - 2 points
- If streak breaks, show encouraging message
- Option to explain/note why missed
- Streak history preserved (show longest streak)
- Recovery tips and motivation

#### 12. Weekly Practice Digest - 5 points
- Weekly summary notification/screen
- Stats: sessions, time, chants this week
- Comparison to previous week
- Insights and encouragement
- Share weekly summary (optional)

#### 13. Default Timer 30s Option - 2 points
- Choose to start timer automatically after 30s
- Countdown before auto-start
- Skip countdown option
- Setting in preferences

#### 14. Onboarding Flow - 5 points
- First-time user tutorial
- Feature highlights (swipeable screens)
- Permission requests (notifications)
- Skip option
- "Get Started" CTA
- Show only once per install

#### 15. Home Screen Widget - 8 points
**iOS & Android**
- Small widget: Streak + today status
- Medium widget: Streak + quick Paanchang
- Large widget: Full stats + Paanchang
- Tap to open app
- Updates automatically
- iOS 14+, Android 12+

#### 16. Background Timer Support - 5 points
- Timer continues when app backgrounded
- Lock screen controls (play/pause)
- Background notifications (timer running)
- Handle phone calls during practice
- Restore timer state on app reopen

#### 17. Offline Indicator - 2 points
- Show banner when offline
- Explain what works offline (everything in V2)
- Show when cloud sync unavailable (V3+)

#### 18. Daily Shloka Recommendation - 3 points
- Algorithm suggests shloka for today
- Based on: day of week, Paanchang, practice history
- Display on home screen
- Tap to view/practice

#### 19. Verse of the Day - 2 points
- Daily inspirational verse from scriptures
- Rotates based on date
- Display on home screen
- Share functionality

#### 20. Muhurat (Auspicious Time) on Home - 3 points
- Show today's auspicious time for practice
- Based on Paanchang calculations
- Brahma Muhurta, sunrise, sunset times
- Notification at auspicious time (optional)

#### 21. Upcoming Festivals Display - 3 points
- Show next 3 upcoming Hindu festivals
- Festival name and date
- Brief description
- Recommended practices for festival
- Festival notifications (optional)

#### 22. Sankalp Help/Examples - 2 points
- "Need inspiration?" link in Sankalp modal
- Examples of meaningful sankalpas
- Categories: personal, family, universal, spiritual
- "Use this" quick-select
- Still allow custom text

### V3 Priority 3 Features (Nice to Have)

**Timeline:** Post V3.0
**Complexity:** 18 points

#### 23. Advanced Practice Features - 8 points
- Audio recordings of shlokas
- Guided meditation sessions
- Multiple shlokas per session
- Practice playlists
- Audio playback controls
- Download for offline playback
- Professional recordings from teachers

#### 24. Social & Sharing Features - 5 points
- Share session summary (text/image)
- Find local practice groups
- Teacher directory
- Live events calendar
- Anonymous community questions

#### 25. Advanced Statistics & Insights - 5 points
- Monthly/yearly practice summaries
- Streak calendar visualization
- Practice patterns and insights
- Favorite shlokas by time spent
- Best practice times analysis
- Export data (CSV, PDF)

### V3 Priority 4 Features (Future Consideration)

#### 26. Content Expansion
- 50+ shlokas and mantras
- Stotrams (Shiva, Lakshmi, Saraswati, etc.)
- Regional language support (Hindi, Tamil, Telugu)
- Translations in multiple languages
- Audio library expansion
- Video lessons from teachers

#### 27. Platform Expansion
- iPad-optimized layout
- Android tablet optimization
- Web version using Expo Web
- Desktop app (Electron, optional)
- Apple Watch companion app
- Wear OS support

#### 28. Advanced Gamification
- Milestone celebrations (7, 21, 30, 108 day streaks)
- Practice challenges (community)
- Achievement badges
- Yearly review (like Spotify Wrapped)
- Progress insights

#### 29. Premium Features (Optional)
- Advanced analytics
- Unlimited cloud storage
- Priority support
- Exclusive content from teachers
- Ad-free experience (though V2 has no ads)
- **Note:** Only if needed to sustain development, most features stay free

---

## App Store Readiness & Launch Plan

### Current Status: Ready for Submission (with prerequisites)

**Development:** ✅ Complete (V2)
**Testing:** ✅ Complete (656 tests passing)
**Technical Requirements:** ✅ Met

### Critical Blockers (Must Complete Before Submission)

See **APP_STORE_CHECKLIST.md** for full details.

#### 1. Privacy Policy ❌ REQUIRED
**Status:** Not Started
**Priority:** Critical Blocker
**Timeline:** 1-2 days

Must create and host privacy policy covering:
- What data is collected (sessions, streaks, settings)
- How data is stored (local device only in V2)
- No data sharing/selling statement
- User data deletion process
- Contact information
- Must be accessible via public URL

**Options:**
- Use privacy policy generator
- Host on GitHub Pages (free)
- Or host on dedicated website

#### 2. App Icon ❌ REQUIRED
**Status:** Not Started
**Priority:** Critical Blocker
**Timeline:** 1-2 days

Requirements:
- **iOS:** 1024x1024px PNG (no transparency, no rounded corners)
- **Android:** 512x512px PNG (can have transparency)
- Professional quality design
- Simple, recognizable
- Spiritual/meditation theme (Om symbol, Mala beads, Lotus, etc.)

**Options:**
- Hire designer on Fiverr/Upwork
- Use design tools (Figma, Canva)
- Commission from artist

#### 3. Screenshots ❌ REQUIRED
**Status:** Not Started
**Priority:** Critical Blocker
**Timeline:** 1 day

**iOS Requirements:** Multiple device sizes
- iPhone 6.7" (1290 x 2796) - iPhone 15 Pro Max
- iPhone 6.5" (1284 x 2778) - iPhone 14 Pro Max
- iPhone 5.5" (1242 x 2208) - iPhone 8 Plus
- iPad Pro 12.9" (2048 x 2732) - if supporting iPad
- iPad Pro 11" (1668 x 2388) - if supporting iPad

**Android Requirements:**
- At least 2, up to 8 screenshots
- Phone: 1080 x 1920 or higher
- Tablet: 1600 x 2560 or higher (optional)

**Screenshot Ideas:**
1. Home screen with stats and streak
2. Shloka library view
3. Practice session with mala counter
4. Session history and streaks
5. Paanchang/Calendar view
6. Settings screen

**Tools:**
- Use Expo on iOS Simulator / Android Emulator
- Add device frames using tools like Screely.com
- Ensure screenshots show best features

#### 4. Developer Accounts ❌ REQUIRED
**Status:** Not Started
**Priority:** Critical Blocker
**Timeline:** 1 day to setup, 1-2 days to activate
**Cost:** $124 total

**Apple Developer Program:**
- Cost: $99/year
- URL: https://developer.apple.com/programs/
- Activation time: 1-2 days

**Google Play Developer:**
- Cost: $25 one-time
- URL: https://play.google.com/console/signup
- Activation time: Few hours to 1 day

#### 5. Store Metadata ⚠️ PARTIAL
**Status:** Partial (drafts exist in APP_STORE_CHECKLIST.md)
**Priority:** Required
**Timeline:** 1 day

Required for both stores:
- App name (check availability)
- Subtitle/short description
- Full description (4000 chars)
- Keywords (iOS only, 100 chars)
- Category (Lifestyle or Health & Fitness)
- Age rating (4+ / Everyone)
- Support URL/email
- Privacy Policy URL

**Current Drafts Available in APP_STORE_CHECKLIST.md**

### Launch Timeline Estimate

| Task | Duration | Status |
|------|----------|--------|
| Developer accounts setup | 1-2 days | ❌ Not Started |
| Privacy policy creation | 1-2 days | ❌ Not Started |
| App icon design | 1-2 days | ❌ Not Started |
| Screenshots creation | 1 day | ❌ Not Started |
| Store listing metadata | 1 day | ⚠️ Partial |
| EAS build configuration | 1 day | ⚠️ Partial |
| Build generation (EAS) | 2-4 hours | ❌ Not Started |
| Device testing | 2-3 days | ⚠️ Partial |
| Beta testing (optional) | 1-2 weeks | ❌ Not Started |
| Final submission | 1 day | ❌ Not Started |
| **Minimum Timeline** | **7-10 days** | - |
| **With Beta Testing** | **3-4 weeks** | - |

**Plus Review Time:**
- iOS: 1-7 days (typically 1-2 days)
- Android: Few hours to 1 day

**Realistic First Launch:** 2-4 weeks from start

### Post-Launch Monitoring (V2)

**Recommended Tools:**
- Crash reporting: Sentry or Bugsnag (free tier)
- App store ratings monitoring
- User review responses
- Download tracking

**Initial Metrics to Track:**
- Daily active users (DAU)
- Practice session completion rate
- 7-day and 21-day streak achievement
- App crashes / stability
- User ratings and reviews

---

## Monetization Strategy

### V2: Free App (No Monetization)

**Current Approach:**
- Completely free
- No ads
- No in-app purchases
- No paywalls
- All features available to everyone

**Philosophy:** Focus on building a quality product and user base first.

### V3: Dana (Voluntary Donations) Model

**Planned for V3 Priority 2** (see Donations & Payments backlog item)

**Donation Model:**
- **Voluntary giving only** - never required
- Button in Settings screen (non-intrusive)
- Users can donate any amount they wish
- Support developers and server costs (cloud sync)
- No features locked behind donations
- Stripe integration for secure payments

**Donation Options:**
- Suggested amounts: $5, $10, $25, custom
- One-time or monthly support
- Email receipt for tax purposes
- Thank you message acknowledging support
- Optional donor recognition (if user wants)

**Why Dana Model:**
- Aligns with spiritual values of voluntary giving
- No pressure or guilt
- Users who benefit can support development
- Sustainable without compromising free access
- Respects user choice and financial situation

**Future Consideration (V4+):**
- Premium features (only if needed for sustainability)
  - Advanced analytics
  - Unlimited cloud storage
  - Exclusive content from teachers
  - Priority support
- **Note:** Core spiritual practice features will always remain free

---

## Future Enhancements (Post-MVP)

### Phase 2: Authentication & Cloud Sync (Optional, Non-Intrusive)
- **Priority:** P2 (Post-MVP)
- Optional account creation (email + password or social auth)
- Cloud backup of streak, practice history, settings
- Cross-device sync
- Seamless local-to-cloud data migration
- Account management in Settings (never promoted on main screens)
- Backend: Firebase Auth + Firestore or Supabase
- **Implementation note:** Must not change guest-first UX

### Phase 3: Community Features
- User-submitted reflections (moderated)
- Anonymous community questions to teachers
- Virtual group practice sessions

### Phase 4: Personalization
- Customizable reminders
- Practice goal setting
- Personalized shloka recommendations based on practice history

### Phase 5: Content Expansion
- 50+ shlokas and mantras
- Audio recordings for each shloka
- Guided meditation sessions
- Video lessons from teachers

### Phase 6: Gamification (Carefully)
- Milestone celebrations
- Practice insights (weekly/monthly summaries)
- Gentle challenges (e.g., "7-day Gayatri Mantra challenge")
- **Note:** Avoid competitive elements that detract from spiritual practice

### Phase 7: Social Features (Optional)
- Find local practice groups
- Teacher directory
- Live events calendar

### Phase 8: Advanced Features
- Multiple user profiles (family sharing)
- Data export (CSV, PDF)
- Cloud sync (optional, privacy-focused)
- Widget for home screen (iOS 14+, Android 12+)
- Apple Watch companion app (step counting during practice)
- Wear OS support

### Phase 9: Platform Expansion
- iPad-optimized layout
- Android tablet optimization
- Web version using Expo Web (same codebase)
- Desktop app (optional)

---

## Risks & Mitigation

### Risk 1: Cultural Appropriation Concerns

**Probability:** Medium
**Impact:** High
**Mitigation:**
- Consult with spiritual teachers and scholars
- Provide cultural context for all content
- Use respectful, inclusive language
- Clearly communicate learning intent
- Acknowledge sources and lineages

### Risk 2: User Engagement Drop-off

**Probability:** High
**Impact:** High
**Mitigation:**
- Strong onboarding experience
- Gentle reminders (future)
- Meaningful streak tracking
- Progressive unlocking of wisdom
- Community connection through satsang

### Risk 3: Technical - AsyncStorage Limitations

**Probability:** Low
**Impact:** Low
**Mitigation:**
- AsyncStorage has generous limits (6MB+)
- Graceful handling of storage errors
- Compression of historical data if needed
- Optional data export
- Clear messaging about data storage
- Future: Cloud sync option

### Risk 4: Content Accuracy

**Probability:** Low
**Impact:** High
**Mitigation:**
- Review all Sanskrit by qualified scholars
- Verify meanings and contexts
- Cite authoritative sources
- Errata page for corrections
- Regular content audits

### Risk 5: Platform-Specific Issues

**Probability:** Medium
**Impact:** Medium
**Mitigation:**
- Test on both iOS and Android throughout development
- Use Expo modules for consistent cross-platform APIs
- Follow platform-specific design guidelines
- EAS Build handles platform-specific builds
- Beta testing on TestFlight (iOS) and Google Play (Android)

---

## Open Questions

1. **Reminders:** Should MVP include practice reminders with push notifications?
   - **Decision:** YES - Native mobile makes this easy with expo-notifications
   - **Implementation:** Local notifications (no server needed)
   - **Priority:** P1 (Should Have for MVP)

2. **Data Export:** Should users be able to export their practice data in MVP?
   - **Decision:** Phase 3 feature - not critical for MVP

3. **Multiple Shlokas per Session:** Should users be able to practice multiple shlokas in one session?
   - **Decision:** MVP supports one shloka per session for simplicity

4. **Offline Audio:** Should we include audio recordings in the app?
   - **Decision:** Phase 2 - add audio files for offline playback
   - **MVP:** Link to YouTube for learning pronunciation

5. **Time Zone Handling:** How do we handle streak tracking across time zones?
   - **Decision:** Use device local time - acceptable for MVP

6. **Haptic Feedback Intensity:** Should users control haptic feedback strength?
   - **Decision:** Use system default haptics, add control in Phase 2

7. **Language Priority:** Which languages should we prioritize after English?
   - **Decision:** Hindi, then regional languages (Tamil, Telugu, Bengali)

8. **App Store Accounts:** Who will manage app store submissions?
   - **Decision:** TBD - Need Apple ($99/yr) and Google ($25 one-time) accounts

---

## Appendix

### Glossary of Terms

**Sadhana:** Spiritual practice or discipline
**Shloka:** Sacred verse or hymn in Sanskrit
**Mantra:** Sacred sound or chant with spiritual power
**Sankalp:** Sacred intention or resolve
**Tithi:** Lunar day in Hindu calendar (15 per fortnight)
**Paksha:** Fortnight (Shukla = waxing, Krishna = waning)
**Mala:** Prayer beads (typically 108 beads)
**Satsang:** Gathering of spiritual seekers; literally "company of truth"
**Panchang:** Hindu almanac with astrological details

### References

1. Bhagavad Gita - Sacred Hindu text
2. Vedas - Ancient Hindu scriptures
3. Patanjali Yoga Sutras - Foundational yoga text
4. IAST - International Alphabet of Sanskrit Transliteration
5. Hindu Calendar Systems - Regional variations

---

**Document Control:**
- **Created:** February 5, 2026
- **Last Updated:** February 5, 2026
- **Next Review:** Before V3 development begins
- **Approvers:** Product Manager, Lead Developer, Cultural Advisor

**Change Log:**
- v2.0 (2026-02-05): Major update reflecting V2 completion and V3 planning
  - Added "V2 Completed Features" section documenting all 5 phases
  - Added "V3 Roadmap" section with 29 planned features across 4 priority levels
  - Added "App Store Readiness & Launch Plan" section
  - Added "Monetization Strategy" section (Dana/donation model)
  - Updated Executive Summary with current status (656 tests passing)
  - Incorporated all backlog items from BACKLOG.md
  - Added launch timeline and critical blockers
  - Referenced APP_STORE_CHECKLIST.md for submission requirements
- v1.0 (2026-02-05): Initial PRD created based on reference implementation
