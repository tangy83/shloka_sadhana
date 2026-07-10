# Shloka Sadhana - Product Backlog

This document tracks future enhancements and features planned for V3 and beyond.

---

## V3 Feature Overview Table

Quick reference guide for all planned V3 features. Review this table to prioritize which features to implement next.

| # | Feature Name | Priority | Effort | Status | Description |
|---|--------------|----------|--------|--------|-------------|
| 1 | **Theme System (Light/Dark/Auto)** | P1 | 3-5 days | Infrastructure ✅ | Complete light theme UI implementation. Infrastructure (context, hooks, persistence) already done in V2. Need to add theme switcher in Settings and replace hardcoded colors across all screens. |
| 2 | **Ekadashi Calendar & Details** | V3 | 3-4 days | Not Started | Display 12-month rolling calendar of Ekadashi dates with names (Nirjala, Putrada, etc.), significance, fasting guidelines, recommended mantras, and parana timing. Integrates with Home screen banners. | can we add stories behind Ekadashi as well 
| 3 | **Content Metadata & Structure** | V3 | 2-3 days | Not Started | **Foundational**: Add rich metadata to shlokas (difficulty, duration, deity-day mapping, festival associations, Ekadashi relevance, tags). Powers smart recommendations, library filtering, and personalization for beginner vs advanced users. |
| 4 | **Accessibility Enhancements** | P1 | 3 days | Not Started | Enhance screen reader support, dynamic type (iOS), voice control, reduced motion mode, high contrast. V2 has good foundation; V3 adds comprehensive WCAG AA+ compliance. |
| 5 | **Over-The-Air (OTA) Updates** | V3 | 2-3 days | Not Started | EAS Update integration for pushing JavaScript/content updates without App Store review. Enables quick bug fixes, content updates, staged rollouts, and rollback capability. |
| 6 | **User Authentication & Cloud Sync** | P1 | 5-7 days | Not Started | **Guest-first**: Optional account creation (email/social) for cloud backup of streaks, sessions, and settings. Multi-device sync with seamless local-to-cloud migration. Includes weekly/monthly/yearly analytics dashboard. Firebase or Supabase. |
| 7 | **Donations & Payments (Stripe)** | V3 | 3-5 days | Not Started | Voluntary Dana model using existing Stripe account. One-time ($2-$50) and monthly donations. All features stay free forever. Includes thank-you flow, receipts via email, transparent fund usage display. |
| 8 | **Audio Mantra Playback** | P2 | 5-7 days | Not Started | Stream professional audio recordings with play/pause, seek, speed control (0.5x-2x), loop, background playback, lock screen controls. Audio sessions count toward streaks equally with manual practice. Requires sourcing/recording content. |
| 9 | **Library Favorites Filter** | P2 | 1-2 days | Not Started | Add "All" / "Favorites" tabs in Library. Filter to show only hearted shlokas. Empty state when no favorites. Favorites infrastructure already exists; just needs UI toggle. |
| 10 | **Library Search** | P2 | 2-3 days | Not Started | Search bar in Library filtering by shloka name, deity, keywords, description. Debounced real-time filtering. Works with Favorites filter. Client-side, no backend needed. |
| 11 | **Practice Goals UI** | P2 | 2-3 days | Not Started | Set daily/weekly goals (e.g., "1 session per day", "7 sessions/week") in Settings. Home displays progress (3/7 days). Goal storage already exists; needs UI implementation and completion celebration. |
| 12 | **Quiet Hours for Reminders** | P2 | 1 day | Not Started | Set time range (e.g., 10 PM - 7 AM) where daily reminders are suppressed. Handles overnight ranges. Prevents notification fatigue while sleeping. |
| 13 | **Streak Recovery Message** | V3 | 0.5-1 day | Not Started | Show encouraging message when streak breaks: "Your best was X days – you can reach it again." One-time per break, gentle and supportive tone. Displays on Home when `currentStreak === 0` and `longestStreak > 0`. |
| 14 | **Weekly Practice Digest** | P2 | 1-2 days | Not Started | In-app "This week" summary (sessions, minutes, malas) on Home. Optional push notification (Sunday/Monday) with weekly stats. Opt-in, respects quiet hours. Informational, non-competitive. |
| 15 | **Default Timer 30s Option** | P2 | 0.5-1 day | Not Started | Allow users to set minimum session duration to 30 seconds (instead of 60s) in Settings. Default stays 60s for consistency. Useful for shorter mantra repetitions. |
| 16 | **Onboarding Flow** | P2 | 2-3 days | Not Started | First-time user tutorial: welcome, optional reminder setup, pick first shloka to try, sankalp explanation. Skippable at any step. Shows once per install. 2-4 screens. |
| 17 | **Home Screen Widget** | P2 | 3-5 days | Not Started | iOS 14+ and Android 12+ home screen widget showing current streak and "Start practice" tap target. Small widget only. Requires native code (WidgetKit/App Widget) or Expo widget library. |
| 18 | **Background Timer Support** | V3 | 2-3 days | Not Started | Persist timer when app backgrounds/closes. Resume session on return with correct elapsed time. Handle app termination gracefully with "Resume session?" prompt. Uses AppState and AsyncStorage. |
| 19 | **Offline Indicator** | P2 | 0.5-1 day | Not Started | Show banner when offline and remote content fails: "Offline – showing saved content." Non-alarming, reassuring. Uses NetInfo to detect connectivity. Only shows when remote fetch attempted. |
| 20 | **Daily Shloka Recommendation** | V3 | 1-2 days | Not Started | "Shloka of the day" on Home using smart recommendation engine (depends on Feature #3). Day-of-week, Ekadashi, festival-aware. Taps open ShlokaDetail. Deterministic per day. |
| 21 | **Verse of the Day** | V3 | 1-2 days | Not Started | For multi-verse shlokas, highlight one verse per day on ShlokaDetail or Home. Shows Sanskrit, transliteration, meaning. Rotates daily deterministically. Helps users focus on single verse. |
| 22 | **Muhurat on Home (Best Times)** | V3 | 1-2 days | Not Started | Display auspicious times for different activities: Brahma Muhurta (spiritual practice), Abhijit (important tasks/buying), Rahu Kaal (avoid new ventures). Uses existing `muhurat.ts`. Activity-labeled for practical use. Optional Phase 2: Choghadiya segments. |
| 23 | **Upcoming Festivals List** | V3 | 1-2 days | Not Started | Show next 2-4 weeks of festivals on Home using existing `festivalCalendar.ts`. List format: "Maha Shivaratri – Mar 8, 2026". Tappable for future detail view. Empty state if none upcoming. |
| 24 | **Sankalp Help/Examples** | V3 | 0.5 day | Not Started | Add "What's a sankalp?" link or first-time explanation in SankalpModal. 2-3 sentence definition. Optional: show example sankalpas by category (personal, family, universal, spiritual) with quick-select. |
| 25 | **Advanced Practice Features** | P3 | 8 days | Not Started | Practice templates, custom mala configurations (non-108), practice categories/tags, session history search/filter, data export (CSV/JSON). |
| 26 | **Social & Sharing Features** | P3 | 5 days | Not Started | Share session summary (text/image), find local practice groups, teacher directory, live events calendar, anonymous community Q&A. |
| 27 | **Advanced Statistics & Insights** | P3 | 5 days | Not Started | Monthly/yearly summaries, streak calendar visualization (heatmap), practice pattern insights, favorite shlokas analysis, best practice times, data export (CSV/PDF). |
| 28 | **Content Expansion** | P4 | Ongoing | Not Started | Add 50+ shlokas/mantras: Stotrams (Shiva, Lakshmi, Saraswati), regional languages (Hindi, Tamil, Telugu), multiple translations, audio library, video lessons from teachers. |
| 29 | **Platform Expansion** | P4 | Varies | Not Started | iPad-optimized layout, Android tablet optimization, web version (Expo Web), desktop app (Electron), Apple Watch companion, Wear OS support. |

**Priority Legend:**
- **P1 (High)**: Must-have for V3.0, foundational features
- **P2 (Medium)**: Should-have for V3.0, high user value
- **P3 (Low)**: Nice-to-have, can defer to V3.1+
- **P4 (Future)**: Long-term vision, V4+

**Effort Scale:**
- 0.5-1 day: Quick win
- 1-3 days: Small feature
- 3-5 days: Medium feature
- 5-7 days: Large feature
- 8+ days: Epic feature

**Key Dependencies:**
- Feature #3 (Content Metadata) is foundational for #20 (Daily Shloka)
- Feature #6 (Auth/Cloud) enables weekly/monthly analytics dashboards
- Feature #2 (Ekadashi) and #3 (Metadata) power smart recommendations

**Quick Wins (< 1 day):** #13 (Streak Recovery), #15 (Timer 30s), #19 (Offline Indicator), #24 (Sankalp Help)

**High Impact + Low Effort:** #9 (Favorites Filter), #12 (Quiet Hours), #14 (Weekly Digest)

**Foundational (Do First):** #3 (Content Metadata), #5 (OTA Updates), #1 (Theme System)

---

## V3 - Future Enhancements

### Theme System (V3 - P1)

**Status:** Infrastructure Complete
**Epic:** Theme Switching & Personalization
**Priority:** P1
**Estimated Effort:** 3-5 days

#### What's Already Done (V2):
- ✅ Theme constants defined (dark/light themes)
- ✅ ThemeContext with persistence
- ✅ useTheme hook
- ✅ Theme storage infrastructure
- ✅ 5 comprehensive tests - all passing

#### What Needs to Be Done:
1. **Add Theme Switcher UI to SettingsScreen**
   - Add "Appearance" section
   - Add theme selector (Dark/Light/System)
   - Connect to useTheme hook
   - Add tests for theme switcher UI

2. **Wrap App with ThemeProvider**
   - Update App.tsx or root navigation to wrap with ThemeProvider
   - Ensure all screens have access to theme context

3. **Update All Screens to Use Theme**
   - Replace hardcoded colors with theme.* properties
   - Screens to update (~10-15 files):
     - HomeScreen
     - PracticeScreen
     - LibraryScreen
     - ShlokaDetailScreen
     - WisdomScreen
     - HistoryScreen
     - SettingsScreen
     - SessionHistoryScreen
     - All modal components
   - Update StyleSheets to use dynamic theme colors
   - Test theme switching across all screens

4. **Handle System Theme (Optional)**
   - Detect system theme preference
   - Auto-switch when "System" option selected
   - Listen for system theme changes

#### Acceptance Criteria:
- [ ] User can select Dark/Light/System theme in Settings
- [ ] Theme persists across app restarts
- [ ] All screens reflect selected theme immediately
- [ ] System theme option follows device preference
- [ ] All UI elements (buttons, cards, text) use theme colors
- [ ] Theme switching is smooth with no visual glitches
- [ ] All existing tests still pass
- [ ] New theme UI tests added

#### Technical Notes:
- Theme infrastructure is production-ready
- All hardcoded colors need to be replaced:
  - Background: `'#121212'` → `theme.background`
  - Surface: `'#1E1E1E'` → `theme.surface`
  - Text: `'#FFFFFF'` → `theme.text`
  - Text Secondary: `'#9E9E9E'` → `theme.textSecondary`
  - Primary: `'#FF9800'` → `theme.primary`
  - Border: `'#2A2A2A'` → `theme.border`
- Consider creating themed StyleSheet helper function
- May need to update navigation theme as well

---

## Other Future Enhancements

### Ekadashi Calendar & Details (V3 - P1)

**Status:** Not Started
**Epic:** Paanchang & Hindu Calendar Enhancements
**Priority:** P1
**Estimated Effort:** 3-4 days

Display upcoming Ekadashi dates with detailed information for spiritual observance.

#### Features to Implement:
1. **Ekadashi Calendar View**
   - Display next 12 months of Ekadashi dates (rolling calendar)
   - Show both Krishna Paksha and Shukla Paksha Ekadashi
   - Include Ekadashi names (e.g., "Nirjala Ekadashi", "Putrada Ekadashi")
   - Countdown to next Ekadashi
   - Visual calendar with highlighted Ekadashi dates

2. **Ekadashi Details Screen**
   - Detailed information about each Ekadashi
   - Significance and benefits of observing
   - Traditional fasting rules and guidelines
   - Recommended mantras/shlokas for that Ekadashi
   - Parana (breaking fast) timing
   - Moon phase and paksha information

3. **Ekadashi Notifications**
   - Optional reminder 1 day before Ekadashi
   - Notification on Ekadashi morning
   - Parana time notification
   - Customizable notification preferences

4. **Home Screen Integration**
   - Banner on Home when it's Ekadashi day
   - "Next Ekadashi in X days" widget
   - Special Ekadashi mantra recommendations
   - Link to Ekadashi details from Home

#### Data Requirements:
- Accurate Ekadashi calculation algorithm (lunar calendar based)
- Database of Ekadashi names and significance
- Parana time calculation based on location
- Multi-year Ekadashi data (configurable/JSON)

#### Technical Considerations:
- Use existing Paanchang infrastructure
- Integrate with Hindu calendar utilities
- Cache Ekadashi dates for offline access
- Location-based timing calculations
- Configurable content for different traditions (Vaishnava/Smartha)

#### Acceptance Criteria:
- [ ] User can view next 12 months of Ekadashi dates
- [ ] Each Ekadashi shows accurate date, name, and significance
- [ ] Calendar updates automatically (rolling 12-month window)
- [ ] Ekadashi details screen shows comprehensive information
- [ ] Home screen displays current Ekadashi status
- [ ] Notifications work correctly for Ekadashi reminders
- [ ] Parana times calculated accurately for user's location
- [ ] All Ekadashi data is configurable/updateable without code changes

#### UI/UX Notes:
- Calendar view with monthly grid layout
- Ekadashi dates highlighted in primary color (#FF9800)
- Card-based detail view with sections for significance, fasting rules, timings
- Smooth navigation from calendar to detail view
- Search/filter for specific Ekadashi by name

---

### Advanced Practice Features (V3 - P2)
- Practice templates (quick start with pre-configured settings)
- Custom mala configurations (different bead counts)
- Practice categories/tags
- Search and filter in session history
- Export practice data (CSV/JSON)

### Social & Sharing (V3 - P2)
- Share practice milestones
- Community challenges
- Practice groups/sangha features

### Advanced Statistics (V3 - P2)
- Graphs and charts for practice trends
- Year-in-review summary
- Practice heatmap calendar
- Goal achievement analytics

### Content Expansion (V3 - P3)
- More shlokas and mantras
- Audio pronunciations
- Video guides
- Sanskrit transliteration options

### Accessibility (V3 - P1)
- Screen reader optimizations
- High contrast mode
- Larger font size options (partially done in V2)
- Reduced motion mode

### User Authentication & Cloud Sync (V3 - P1)

**Status:** Not Started
**Epic:** User Accounts & Data Management
**Priority:** P1
**Estimated Effort:** 5-7 days

Enable users to create accounts, sync progress across devices, and access long-term analytics.

#### Authentication Options:

**Option A: Firebase Authentication (Recommended)**
- Social logins (Google, Apple, Facebook)
- Email/password authentication
- Anonymous accounts with upgrade option
- Free tier: 10K monthly active users
- Easy integration with React Native

**Option B: Supabase Authentication**
- Open-source alternative
- Email/password + social logins
- PostgreSQL backend included
- More control, self-hostable
- Free tier: 50K monthly active users

**Option C: AWS Amplify**
- Full AWS ecosystem integration
- Cognito for authentication
- More complex setup
- Better for enterprise scale

#### Features to Implement:

1. **Authentication Flows**
   - Sign up with email/password
   - Social sign-in (Google, Apple)
   - Guest mode (use app without account)
   - Convert guest to registered user
   - Password reset flow
   - Email verification

2. **User Profile**
   - Profile screen with user info
   - Edit name, email, profile picture
   - Account settings
   - Connected devices list
   - Account deletion option

3. **Cloud Sync**
   - Automatic background sync
   - Sync practice sessions across devices
   - Sync streaks and statistics
   - Sync settings and preferences
   - Sync goals and notes
   - Conflict resolution (last-write-wins or merge)
   - Offline-first architecture (sync when online)

4. **Data Migration**
   - Migrate local data to cloud on first login
   - Preserve existing progress
   - Merge data if user had multiple devices
   - Export/import for data portability

5. **Progress Dashboard**
   - **Weekly View**:
     - Sessions per day
     - Total practice time
     - Shlokas practiced
     - Streak status
     - Goal achievement

   - **Monthly View**:
     - Month-over-month comparison
     - Best day/worst day
     - Consistency score
     - Most practiced shlokas
     - Total repetitions

   - **Yearly View**:
     - Year in review
     - Total practice hours
     - Longest streak achieved
     - Total sessions count
     - Growth trends

   - **All-Time Stats**:
     - Total days practiced
     - Total mantras chanted
     - Total time in practice
     - Badges/achievements earned
     - First practice date

6. **Advanced Analytics**
   - Practice time by weekday
   - Practice time by time-of-day
   - Favorite shlokas (most practiced)
   - Practice consistency heatmap
   - Goal completion rate
   - Streak history graph
   - Progress charts (line, bar, pie)

7. **Multi-Device Support**
   - View active devices
   - Last synced timestamp per device
   - Device names/types
   - Remove device from account
   - Sync status indicator

8. **Data Privacy & Security**
   - End-to-end encryption for sensitive data
   - Secure token storage
   - GDPR compliance
   - Right to be forgotten (delete account)
   - Data export in JSON format
   - Privacy controls (what to sync)

#### Database Schema (Firebase/Supabase):

```typescript
// Users Collection
interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: timestamp;
  lastLoginAt: timestamp;
  settings: UserSettings;
}

// Sessions Collection
interface Session {
  id: string;
  userId: string;
  shlokaId: string;
  date: timestamp;
  duration: number; // seconds
  repetitions: number;
  sankalp?: string;
  offering?: string;
  notes?: string;
  completed: boolean;
  deviceId: string;
  syncedAt: timestamp;
}

// Streaks Collection
interface Streak {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: date;
  streakHistory: StreakDay[];
}

// Goals Collection
interface Goal {
  id: string;
  userId: string;
  type: 'daily' | 'weekly' | 'custom';
  target: number;
  current: number;
  startDate: date;
  endDate?: date;
  achieved: boolean;
}

// User Settings Collection
interface UserSettings {
  userId: string;
  theme: 'dark' | 'light' | 'system';
  fontSize: number;
  notificationsEnabled: boolean;
  reminderTime: { hour: number; minute: number };
  syncEnabled: boolean;
  syncFrequency: 'realtime' | 'hourly' | 'daily';
}
```

#### Sync Strategy:

**Offline-First Approach:**
1. All actions work offline (write to local DB)
2. Queue changes when offline
3. Sync queue when online
4. Handle conflicts gracefully
5. Show sync status to user

**Conflict Resolution:**
- Sessions: Merge (both devices' sessions kept)
- Streaks: Take highest values
- Settings: Last-write-wins (most recent)
- Goals: Merge progress

#### UI Components:

1. **Login Screen**
   - Email/password fields
   - Social login buttons
   - "Continue as Guest" option
   - "Forgot Password" link
   - Sign up link

2. **Sign Up Screen**
   - Name, email, password fields
   - Terms acceptance checkbox
   - Social sign-up buttons
   - Back to login link

3. **Profile Screen**
   - User avatar (editable)
   - Name, email display
   - "Edit Profile" button
   - Account stats summary
   - Settings link
   - "Sign Out" button
   - "Delete Account" option

4. **Progress Dashboard Screen**
   - Time period selector (Week/Month/Year/All)
   - Key metrics cards
   - Charts and graphs
   - Detailed breakdown
   - Export data button

5. **Sync Status Indicator**
   - Small icon in header
   - Shows: synced ✓, syncing ⟳, offline ⨯
   - Tap to see details
   - Last synced timestamp

#### Security Considerations:

- [ ] Use HTTPS for all API calls
- [ ] Store tokens securely (Keychain/Keystore)
- [ ] Implement session timeout
- [ ] Rate limiting on login attempts
- [ ] Secure password requirements
- [ ] Two-factor authentication (optional)
- [ ] Audit log for account changes

#### Privacy Considerations:

- [ ] Update Privacy Policy for cloud storage
- [ ] User consent for data sync
- [ ] Option to use app without account (guest mode)
- [ ] Clear data retention policies
- [ ] Data export functionality
- [ ] Account deletion removes all data
- [ ] No selling or sharing user data

#### Free vs Premium (Future Consideration):

**Free Tier:**
- Basic authentication
- Cloud sync (1 device)
- 30 days of detailed history
- Basic statistics

**Premium Tier (Optional):**
- Unlimited devices
- Unlimited history
- Advanced analytics
- Priority support
- Offline backup
- $2.99/month or $19.99/year

#### Technical Implementation:

```bash
# Install Firebase (Option A)
npm install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore

# Or Supabase (Option B)
npm install @supabase/supabase-js

# Authentication flow example
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Sign in
const signIn = async (email, password) => {
  const userCredential = await auth().signInWithEmailAndPassword(email, password);
  return userCredential.user;
};

// Sync session
const syncSession = async (session) => {
  await firestore()
    .collection('sessions')
    .doc(session.id)
    .set({
      ...session,
      syncedAt: firestore.FieldValue.serverTimestamp()
    });
};
```

#### Migration Strategy:

**Phase 1: Add Authentication (Week 1)**
- Implement login/signup screens
- Firebase/Supabase setup
- Guest mode support
- Local data migration on first login

**Phase 2: Cloud Sync (Week 2)**
- Sync sessions to cloud
- Sync settings and preferences
- Background sync implementation
- Conflict resolution

**Phase 3: Progress Dashboard (Week 3)**
- Build analytics screens
- Implement charts/graphs
- Weekly/monthly/yearly views
- Export functionality

**Phase 4: Polish & Testing (Week 4)**
- Multi-device testing
- Offline scenario testing
- Performance optimization
- Security audit

#### Acceptance Criteria:

- [ ] Users can sign up with email/password
- [ ] Users can log in with Google/Apple
- [ ] Guest mode allows app use without account
- [ ] Guest data migrates to account on signup
- [ ] Sessions sync automatically when online
- [ ] Synced data accessible on multiple devices
- [ ] Offline changes sync when back online
- [ ] Progress dashboard shows weekly stats
- [ ] Progress dashboard shows monthly stats
- [ ] Progress dashboard shows yearly stats
- [ ] Charts and graphs display correctly
- [ ] Users can export their data
- [ ] Users can delete their account
- [ ] Sync status visible in UI
- [ ] No data loss during sync
- [ ] Conflicts handled gracefully
- [ ] App works fully offline
- [ ] Login state persists between app restarts
- [ ] Password reset flow works
- [ ] Email verification works

#### Benefits:

- ✅ Access progress from any device
- ✅ Never lose practice data
- ✅ Long-term analytics and insights
- ✅ Backup and restore capability
- ✅ Social features possible (future)
- ✅ Cross-platform support (iOS/Android/Web)
- ✅ Better user engagement
- ✅ Premium feature potential

#### Costs:

**Firebase (Recommended):**
- Free tier: 10K monthly active users
- Spark Plan: Free
- Blaze Plan: Pay-as-you-go (starts free)
- ~$25/month for 50K active users

**Supabase:**
- Free tier: 50K monthly active users
- Pro: $25/month (unlimited users)
- More generous free tier

#### Testing Strategy:

- [ ] Unit tests for auth functions
- [ ] Integration tests for sync
- [ ] Offline scenario testing
- [ ] Multi-device sync testing
- [ ] Conflict resolution testing
- [ ] Performance testing (large datasets)
- [ ] Security penetration testing

---

### Donations & Payments (V3 - P2)

**Status:** Not Started
**Epic:** Monetization & Sustainability
**Priority:** P2
**Estimated Effort:** 3-5 days

Enable users to support the app through voluntary donations using Stripe.

#### Payment Model: Donation-Based (Dana) 🙏

**Philosophy:**
- All features remain FREE for everyone
- No paywalls, no premium features
- Users donate voluntarily to support development
- Align with spiritual principle of Dana (giving)
- Transparent about how donations are used

#### Integration: Stripe (Your Existing Account)

**Why Stripe:**
- ✅ You already have an account
- ✅ Supports one-time donations
- ✅ Supports recurring donations
- ✅ Easy React Native integration
- ✅ Handles all payment methods (cards, Apple Pay, Google Pay)
- ✅ International payments supported
- ✅ PCI compliant (secure)
- ✅ ~2.9% + $0.30 per transaction fee

**Alternatives Considered:**
- PayPal: Higher fees, less modern
- In-App Purchases: Apple takes 30%, complex
- Razorpay: Good for India, less global

#### Features to Implement:

1. **Donation Screen/Section**
   - Accessible from Settings menu
   - "Support Shloka Sadhana" button
   - Beautiful, spiritual design
   - Gratitude-focused messaging
   - Show impact of donations

2. **Donation Options**

   **One-Time Donations:**
   - Preset amounts: $2, $5, $10, $20, $50
   - Custom amount option (min $1)
   - Quick checkout with saved cards

   **Recurring Donations (Optional):**
   - Monthly support: $2, $5, $10/month
   - Cancel anytime
   - Manage subscriptions in Settings

3. **Payment Methods**
   - Credit/Debit cards (Visa, Mastercard, Amex)
   - Apple Pay (iOS)
   - Google Pay (Android)
   - Save payment method for future
   - PCI-compliant secure checkout

4. **Donor Recognition (Optional)**
   - Thank you message after donation
   - Special "Supporter" badge in profile (if logged in)
   - Donor list on About page (with permission)
   - Send receipt via email
   - No ads ever for supporters (even if you add ads later)

5. **Transparency**
   - Show how donations are used:
     - Server costs
     - Development time
     - Content creation
     - Future features
   - Display total supporters count
   - Anonymous option for donors

6. **Guest Donations**
   - Allow donations without login
   - Collect email for receipt only
   - Simple, quick checkout
   - Option to create account after

#### UI/UX Design:

**Donation Screen:**
```
┌─────────────────────────────────┐
│  Support Shloka Sadhana 🙏      │
│                                 │
│  Your donations help us:        │
│  • Keep the app free for all    │
│  • Add more shlokas & content   │
│  • Maintain server & sync       │
│  • Build new features           │
│                                 │
│  Choose Amount:                 │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐      │
│  │$2│ │$5│ │$10│ │$20│ │...│     │
│  └──┘ └──┘ └──┘ └──┘ └──┘      │
│                                 │
│  Or enter custom amount:        │
│  ┌─────────────────────┐        │
│  │ $                   │        │
│  └─────────────────────┘        │
│                                 │
│  ○ One-time    ○ Monthly        │
│                                 │
│  ┌─────────────────────┐        │
│  │   Donate with ❤️    │        │
│  └─────────────────────┘        │
│                                 │
│  💳 Cards  🍎 Apple Pay 🤖 GPay │
│                                 │
│  137 supporters this month      │
└─────────────────────────────────┘
```

**Settings Integration:**
```
Settings
  ├── Account
  ├── Appearance
  ├── Notifications
  ├── Support Shloka Sadhana ❤️  ← New
  ├── About
  └── Privacy Policy
```

#### Technical Implementation:

**Stripe Setup:**
```bash
# Install Stripe React Native SDK
npm install @stripe/stripe-react-native

# Backend (Firebase Functions or simple Node server)
npm install stripe
```

**Frontend (React Native):**
```typescript
// Donation screen
import { useStripe } from '@stripe/stripe-react-native';

const DonationScreen = () => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const handleDonate = async (amount: number) => {
    // 1. Create payment intent on backend
    const { clientSecret } = await createPaymentIntent(amount);

    // 2. Initialize payment sheet
    await initPaymentSheet({
      paymentIntentClientSecret: clientSecret,
      merchantDisplayName: 'Shloka Sadhana',
      applePay: true,
      googlePay: true,
    });

    // 3. Present payment sheet
    const { error } = await presentPaymentSheet();

    if (!error) {
      // Payment successful!
      showThankYouMessage();
      sendReceiptEmail();
    }
  };
};
```

**Backend (Firebase Functions or Node.js):**
```javascript
// Create payment intent endpoint
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createPaymentIntent = async (req, res) => {
  const { amount, currency = 'usd', recurring = false } = req.body;

  if (recurring) {
    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
    });
    return res.json({ clientSecret: subscription.latest_invoice.payment_intent.client_secret });
  } else {
    // One-time payment
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency,
      metadata: {
        app: 'Shloka Sadhana',
        platform: 'mobile'
      }
    });
    return res.json({ clientSecret: paymentIntent.client_secret });
  }
};

// Webhook to confirm payments
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

  if (event.type === 'payment_intent.succeeded') {
    // Update database, send thank you email
    const paymentIntent = event.data.object;
    await recordDonation(paymentIntent);
    await sendThankYouEmail(paymentIntent);
  }

  res.json({ received: true });
};
```

#### Backend Options:

**Option A: Firebase Functions (Recommended)**
- Serverless, scales automatically
- Free tier: 2M invocations/month
- Easy integration with Firebase
- HTTPS endpoints automatically secured
- ~$5-20/month at scale

**Option B: Simple Node.js Server**
- Host on Heroku, Railway, or DigitalOcean
- More control
- Fixed monthly cost (~$5-10/month)
- Need to manage server

**Option C: Stripe Payment Links (Simplest)**
- No backend code needed
- Create payment links in Stripe Dashboard
- Less customization
- Good for MVP

#### Features Breakdown:

1. **Donation Settings Screen** (Day 1)
   - UI design
   - Amount selection
   - One-time vs recurring toggle
   - Navigation from Settings

2. **Stripe Integration** (Day 2-3)
   - Install Stripe SDK
   - Set up Firebase Functions or Node backend
   - Create payment intent endpoint
   - Implement payment sheet
   - Test with test cards

3. **Payment Processing** (Day 3-4)
   - Handle successful payments
   - Error handling
   - Loading states
   - Receipt generation
   - Email notifications

4. **Donor Recognition** (Day 4-5)
   - Thank you screen
   - Supporter badge (optional)
   - Transaction history
   - Manage recurring donations

5. **Testing & Polish** (Day 5)
   - Test all payment methods
   - Test error scenarios
   - Test webhooks
   - Polish UI/UX

#### Stripe Products/Prices Setup:

```javascript
// Create products in Stripe Dashboard or via API
const products = [
  {
    name: 'Shloka Sadhana - Small Donation',
    amount: 200, // $2.00
    type: 'one_time'
  },
  {
    name: 'Shloka Sadhana - Medium Donation',
    amount: 500, // $5.00
    type: 'one_time'
  },
  {
    name: 'Shloka Sadhana - Large Donation',
    amount: 1000, // $10.00
    type: 'one_time'
  },
  {
    name: 'Monthly Supporter',
    amount: 500, // $5.00/month
    type: 'recurring',
    interval: 'month'
  }
];
```

#### Email Receipts:

Use SendGrid, Mailgun, or Firebase Extensions for emails:

```
Subject: Thank you for supporting Shloka Sadhana 🙏

Dear [Name],

Thank you for your generous donation of $[Amount] to Shloka Sadhana!

Your support helps us:
• Keep the app free for everyone
• Add more shlokas and spiritual content
• Maintain cloud sync and servers
• Build new features for the community

Your donation makes a real difference in helping people maintain their spiritual practice.

Receipt Details:
Amount: $[Amount]
Date: [Date]
Transaction ID: [ID]

With gratitude,
The Shloka Sadhana Team

---
This is a receipt for your donation. For questions, email support@shlokasadhana.com
```

#### App Store / Play Store Compliance:

**iOS Guidelines:**
- ✅ Donations for non-profits are allowed outside In-App Purchase
- ✅ For-profit donations must disclose clearly
- ✅ Cannot offer digital goods for donations
- ✅ Physical goods or services OK
- ⚠️ Consider: "Support development" vs "Donate"

**Android Guidelines:**
- ✅ More flexible than iOS
- ✅ Donations outside Play Billing OK
- ✅ Must comply with local laws

**Recommendation:**
- Use language like "Support Development" or "Voluntary Contribution"
- Don't offer any features in exchange (keep all features free)
- Make it clear donations are voluntary
- Show transparency on usage

#### Messaging & Copy:

**Settings Button:**
```
❤️ Support This App
Help keep Shloka Sadhana free for everyone
```

**Donation Screen Header:**
```
Support Shloka Sadhana 🙏

Shloka Sadhana is free for everyone, with no ads or paywalls.
Your voluntary contributions help us maintain and improve the app.
```

**Impact Statement:**
```
Your donations help us:
✓ Keep all features free forever
✓ Add more shlokas and mantras
✓ Maintain cloud sync servers
✓ Build new features
✓ Support development costs
```

**After Donation:**
```
🙏 Thank You!

Your generous contribution of $[Amount] means the world to us.
Together, we're helping people maintain their spiritual practice.

May your practice bring you peace and fulfillment.
```

#### Legal & Compliance:

- [ ] **Terms of Service**: Add donation terms
- [ ] **Refund Policy**: Stripe standard (can refund if requested)
- [ ] **Tax Receipts**: If registered as non-profit (optional)
- [ ] **Privacy**: Disclose donation data handling
- [ ] **Stripe Agreement**: Accept Stripe Terms of Service
- [ ] **Regional Compliance**: Check laws in target countries

#### Privacy Considerations:

**Data Collected for Donations:**
- Email (for receipt)
- Payment method (tokenized by Stripe, not stored by you)
- Amount and date
- Optional: Name

**Privacy Policy Update:**
```
Donations:
When you make a donation, we use Stripe to process payments securely.
We collect:
- Your email address (for receipt)
- Donation amount and date
- Payment method (stored securely by Stripe, not by us)

We do NOT store your card details. All payment processing is handled
securely by Stripe, our PCI-compliant payment processor.
```

#### Database Schema:

```typescript
// Donations Collection
interface Donation {
  id: string;
  userId?: string; // Optional if guest
  email: string;
  amount: number;
  currency: string;
  type: 'one_time' | 'recurring';
  status: 'pending' | 'succeeded' | 'failed';
  stripePaymentIntentId: string;
  stripeCustomerId?: string;
  date: timestamp;
  receiptUrl?: string;
  anonymous: boolean;
}

// Recurring Subscriptions Collection
interface Subscription {
  id: string;
  userId: string;
  stripeSubscriptionId: string;
  amount: number;
  currency: string;
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodStart: date;
  currentPeriodEnd: date;
  cancelAtPeriodEnd: boolean;
}
```

#### Analytics to Track:

- Total donations received
- Average donation amount
- Monthly recurring revenue
- Donation conversion rate
- Most popular donation amounts
- Donor retention (recurring)
- Revenue by country/region

#### Costs:

**Stripe Fees:**
- 2.9% + $0.30 per transaction (US)
- Varies by country
- No monthly fees
- No setup fees

**Example:**
- $5 donation: You receive $4.56
- $10 donation: You receive $9.41
- $20 donation: You receive $19.12

**Backend Hosting:**
- Firebase Functions: Free tier, then ~$5-20/month
- Or Node.js server: ~$5-10/month

#### Acceptance Criteria:

- [ ] Donation screen accessible from Settings
- [ ] Users can select preset or custom amounts
- [ ] One-time donations work with Stripe
- [ ] Apple Pay works on iOS
- [ ] Google Pay works on Android
- [ ] Card payments work
- [ ] Receipt sent via email
- [ ] Thank you screen shows after donation
- [ ] Guest users can donate without login
- [ ] Recurring donations work (optional)
- [ ] Users can manage recurring subscriptions
- [ ] Error handling for failed payments
- [ ] Refund process works
- [ ] Privacy policy updated
- [ ] Terms of service updated
- [ ] App store guidelines complied with
- [ ] Webhook endpoint secured
- [ ] All payments tracked in database
- [ ] Analytics dashboard shows donation metrics

#### Future Enhancements:

- **Dedicated Donations**: "Dedicate your donation in memory of..."
- **Impact Tracking**: Show total users supported, hours of practice enabled
- **Donor Leaderboard**: Optional, with permission (gamification)
- **Annual Reports**: Transparency report showing fund usage
- **Community Goals**: "Help us reach $X to build Feature Y"
- **Corporate Matching**: Partner with companies for donation matching

#### Testing:

**Stripe Test Cards:**
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0027 6000 3184
```

**Test Checklist:**
- [ ] One-time payment succeeds
- [ ] One-time payment fails gracefully
- [ ] Apple Pay works
- [ ] Google Pay works
- [ ] Receipt email sent
- [ ] Webhook processes correctly
- [ ] Refund works
- [ ] Recurring subscription created
- [ ] Subscription can be canceled
- [ ] Guest donation works
- [ ] Logged-in donation works
- [ ] Database records created
- [ ] Thank you screen shows
- [ ] Error messages clear

---

### Over-The-Air (OTA) Updates (V3 - P1)

**Status:** Not Started
**Epic:** Deployment & Distribution
**Priority:** P1
**Estimated Effort:** 2-3 days

Enable seamless updates for JavaScript code and content without requiring App Store/Play Store updates.

#### Implementation Options:

**Option A: Expo Updates (EAS Update) - Recommended**
- Built-in Expo solution
- Free tier available
- Easy integration with existing Expo app
- Automatic background updates
- Rollback capability
- Built-in update channels (production, staging, preview)

**Option B: Microsoft CodePush**
- More mature, widely used
- Requires additional setup
- Works with bare React Native apps
- More control over update distribution

#### Features to Implement:
1. **Automatic Update Checks**
   - Check for updates on app launch
   - Background update downloads
   - Update UI indicator while downloading

2. **Update Installation**
   - Apply updates on next app restart
   - Option for "Update now" vs "Later"
   - Progress indicator during update

3. **Update Rollout Strategy**
   - Staged rollouts (10% → 50% → 100%)
   - A/B testing capability
   - Emergency rollback if issues detected

4. **User Communication**
   - "New version available" notification
   - Changelog display (what's new)
   - Optional vs mandatory updates
   - Update size indicator

5. **Update Channels**
   - Production channel (stable releases)
   - Beta channel (early access)
   - Preview channel (testing)

#### What Can Be Updated via OTA:
- ✅ JavaScript code changes
- ✅ React component updates
- ✅ Bug fixes in JS code
- ✅ UI/UX improvements
- ✅ Content updates (shlokas, wisdom, festivals data)
- ✅ Images and assets
- ✅ JSON configuration files
- ✅ Business logic changes

#### What REQUIRES App Store Update:
- ❌ New native dependencies
- ❌ Changes to native code (iOS/Android)
- ❌ New permissions requests
- ❌ SDK version upgrades
- ❌ App config changes (app.json)
- ❌ Major version upgrades

#### Technical Implementation:
```bash
# Setup EAS Update
npm install -g eas-cli
eas update:configure

# Publish update
eas update --branch production --message "Bug fixes and improvements"

# In app.json
{
  "expo": {
    "updates": {
      "enabled": true,
      "checkAutomatically": "ON_LOAD",
      "fallbackToCacheTimeout": 0
    }
  }
}
```

#### Update Flow:
1. Developer publishes update via EAS CLI
2. Update uploaded to Expo's CDN
3. App checks for updates on launch
4. Download in background (if available)
5. User sees "Update available" prompt
6. Update applies on next app restart
7. Analytics track update success/failure

#### Acceptance Criteria:
- [ ] OTA updates configured with EAS Update
- [ ] Updates check automatically on app launch
- [ ] Background downloads don't block app usage
- [ ] User can see update changelog before installing
- [ ] Updates apply smoothly on restart
- [ ] Rollback mechanism works correctly
- [ ] Analytics track update adoption rates
- [ ] Staged rollout works (10% → 100%)
- [ ] Emergency rollback can be triggered
- [ ] Works offline (uses cached version)

#### Content Update Strategy:
- **Shlokas/Mantras**: Can be updated via OTA (JSON files)
- **Wisdom teachings**: OTA updates
- **Festival data**: OTA updates
- **Bug fixes**: OTA updates (instant)
- **UI improvements**: OTA updates
- **New features (JS only)**: OTA updates

#### Cost Considerations:
- **Expo EAS Free Tier**: Limited updates/month
- **Expo EAS Production**: ~$29/month (unlimited updates)
- **CodePush**: Free (self-hosted) or Azure pricing

#### Testing Strategy:
- Preview channel for internal testing
- Beta channel for select users (TestFlight/Play Beta)
- Staged production rollout
- Automatic rollback on crash rate increase

---

### Technical Improvements (V3 - P3)
- Cloud sync across devices
- Offline mode improvements
- Performance optimizations
- Crash reporting and analytics
- CI/CD pipeline automation

---

## New Backlog Items (V3)

### Audio Mantra Playback (V3 - P2)

**Status:** Not Started
**Epic:** Practice Experience & Audio Features
**Priority:** P2
**Estimated Effort:** 5-7 days (13 story points)

Enable users to listen to professional audio recordings of mantras and complete their daily practice through guided audio sessions.

#### User Story:
"As a practitioner, I want to listen to professionally recorded mantras so that I can learn correct pronunciation, practice while multitasking, and maintain my streak through guided audio sessions."

#### Features to Implement:

**1. Audio Practice Mode**
- Two practice options on Shloka Detail screen:
  - "Practice Manually" (existing timer/counter mode)
  - "Practice with Audio" (new audio playback mode)
- Audio player screen with beautiful, minimal UI
- Shows shloka details while audio plays
- Can set sankalp before audio session (just like manual practice)

**2. Audio Player Controls**
- ✅ Play/Pause button (primary control)
- ✅ Seek bar (scrub through audio)
- ✅ Current time / Total duration display
- ✅ 10-second forward/backward buttons
- ✅ Playback speed control (0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x)
- ✅ Repeat/Loop toggle (repeat entire mantra)
- Volume control (uses system volume)
- Background playback support

**3. Session Management**
- Timer automatically runs while audio plays
- Session completes when audio finishes or user manually stops
- Minimum 60-second rule applies (same as manual practice)
- Marks day complete if session is valid
- **Audio practice and manual practice have equal "weight" for streaks**
- Session history shows: "Listened to [Shloka Name]" with duration

**4. Audio Files**
- Professional recordings for each shloka
- High-quality audio (128kbps+ AAC or MP3)
- **V3 Initial Release: Streaming only** (no downloads)
- Audio hosted on CDN or cloud storage (Firebase Storage, S3, etc.)
- Future: Download for offline playback (V4)

**5. Session Completion Flow**
- Same as manual practice:
  - Offering/dedication modal
  - Session notes/reflection
  - Session summary
  - Streak update
- Session summary shows "Audio Practice" badge/icon

**6. Background Audio**
- Audio continues playing when app backgrounded
- Lock screen controls (iOS/Android media controls)
- Notification shows currently playing mantra
- Handle interruptions (phone calls, alarms)
- Resume from where left off when returning to app

#### Acceptance Criteria:
- [ ] User can choose between "Manual" and "Audio" practice modes
- [ ] Audio player has play/pause, seek, skip controls
- [ ] Playback speed adjustable (0.5x - 2x)
- [ ] Loop/repeat toggle works correctly
- [ ] Session timer tracks audio playback duration
- [ ] Audio practice counts toward daily streak
- [ ] Session history differentiates audio vs manual practice
- [ ] Audio continues playing in background
- [ ] Lock screen shows media controls with shloka name
- [ ] Handle phone call interruptions gracefully
- [ ] Offering and notes flow works for audio sessions
- [ ] Session summary shows audio practice details
- [ ] All existing practice tests still pass
- [ ] New audio player tests added and passing

#### Technical Implementation:

**Audio Library:** Use `expo-av` (Expo's audio/video library)

```bash
# Install expo-av
npx expo install expo-av
```

**Audio Player Component:**
```typescript
import { Audio } from 'expo-av';
import { useState, useEffect } from 'react';

const AudioPracticeScreen = ({ shloka }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);

  // Load audio
  useEffect(() => {
    loadAudio();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const loadAudio = async () => {
    // Enable background audio
    await Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
    });

    const { sound: audioSound } = await Audio.Sound.createAsync(
      { uri: shloka.audioUrl },
      { shouldPlay: false },
      onPlaybackStatusUpdate
    );

    setSound(audioSound);
  };

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis);
      setIsPlaying(status.isPlaying);
    }
  };

  const handlePlayPause = async () => {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    }
  };

  const handleSeek = async (value: number) => {
    if (sound) {
      await sound.setPositionAsync(value);
    }
  };

  const handleSkip = async (seconds: number) => {
    if (sound) {
      const newPosition = Math.max(0, Math.min(position + (seconds * 1000), duration));
      await sound.setPositionAsync(newPosition);
    }
  };

  const handleSpeed = async (rate: number) => {
    if (sound) {
      await sound.setRateAsync(rate, true);
      setPlaybackRate(rate);
    }
  };

  const handleLoop = async (loop: boolean) => {
    if (sound) {
      await sound.setIsLoopingAsync(loop);
    }
  };

  return (
    <View style={styles.container}>
      {/* Shloka info */}
      <Text style={styles.title}>{shloka.name}</Text>

      {/* Seek bar */}
      <Slider
        value={position}
        minimumValue={0}
        maximumValue={duration}
        onSlidingComplete={handleSeek}
      />

      {/* Time display */}
      <Text>{formatTime(position)} / {formatTime(duration)}</Text>

      {/* Playback controls */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={() => handleSkip(-10)}>
          <Text>⏪ 10s</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handlePlayPause}>
          <Text>{isPlaying ? '⏸' : '▶️'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleSkip(10)}>
          <Text>10s ⏩</Text>
        </TouchableOpacity>
      </View>

      {/* Speed control */}
      <SpeedSelector value={playbackRate} onChange={handleSpeed} />

      {/* Loop toggle */}
      <Switch value={loop} onValueChange={handleLoop} />
    </View>
  );
};
```

**Audio URL Storage:**
```typescript
interface Shloka {
  id: string;
  name: string;
  // ... existing fields
  audioUrl?: string; // Add audio URL field
  audioDuration?: number; // Duration in seconds
  audioFormat?: 'mp3' | 'aac'; // Audio format
}

// Example shloka with audio
const vishnu Sahasranam: Shloka = {
  id: 'vishnu-sahasranam',
  name: 'Vishnu Sahasranam',
  audioUrl: 'https://cdn.shlokasadhana.com/audio/vishnu-sahasranam.mp3',
  audioDuration: 1500, // 25 minutes
  audioFormat: 'mp3',
  // ... other fields
};
```

**Session Data Update:**
```typescript
interface PracticeSession {
  // ... existing fields
  practiceType: 'manual' | 'audio'; // Add practice type
  playbackSpeed?: number; // If audio practice
}
```

#### Audio Content Creation:

**Initial Content (V3):**
- Vishnu Sahasranam (25 min)
- Hanuman Chalisa (10 min)
- Gayatri Mantra (3 min with repetitions)

**Sources for Audio:**
1. **Option A:** Record professional audio
   - Hire Sanskrit scholars/practitioners
   - Professional recording studio
   - Cost: $50-100 per recording

2. **Option B:** Use public domain/Creative Commons audio
   - Verify licensing allows commercial/app use
   - Quality check for clarity
   - Free but limited selection

3. **Option C:** Partner with spiritual organizations
   - Temple recordings
   - Organization partnerships
   - May require revenue sharing

**Hosting:**
- Firebase Storage (pay per GB)
- AWS S3 + CloudFront CDN
- Expo Asset hosting
- Estimated cost: $5-20/month for V3 (streaming only)

#### UI/UX Design:

**Audio Player Screen:**
```
┌─────────────────────────────────┐
│  ← Back          Audio Practice │
│                                 │
│  🎵                             │
│  Hanuman Chalisa               │
│  Professional Recording         │
│                                 │
│  ━━━━━━●━━━━━━━━━━━━━━━━      │
│  3:45 / 10:00                  │
│                                 │
│   ⏪ 10s    ⏸️    10s ⏩       │
│                                 │
│   Speed: 1.0x    🔁 Loop      │
│                                 │
│  Timer: 04:12 ⏱️               │
│                                 │
│  Sankalp: For world peace 🙏   │
│                                 │
│  ┌─────────────────────┐       │
│  │   Complete Session  │       │
│  └─────────────────────┘       │
└─────────────────────────────────┘
```

#### Testing Requirements:
- [ ] Audio loads and plays correctly
- [ ] Play/pause state transitions
- [ ] Seek bar updates in real-time
- [ ] Skip forward/backward (10s)
- [ ] Playback speed changes work
- [ ] Loop mode functionality
- [ ] Background audio continues playing
- [ ] Lock screen controls work (iOS/Android)
- [ ] Handle phone call interruptions
- [ ] Timer tracks audio playback duration
- [ ] Session completes correctly
- [ ] Streak updates for audio practice
- [ ] Session history shows audio sessions
- [ ] Network error handling (streaming fails)
- [ ] Audio unloads on component unmount

#### Future Enhancements (V4+):
- [ ] Download audio for offline playback
- [ ] Playlist feature (queue multiple mantras)
- [ ] Audio quality selection (low/med/high)
- [ ] Repeat specific sections (verse-by-verse)
- [ ] Background ambient sounds (temple bells, nature)
- [ ] Synchronized Sanskrit text display (karaoke style)
- [ ] Multiple voice options (male/female, different styles)
- [ ] User-contributed audio recordings (with moderation)

#### Estimated Complexity Breakdown:
- Audio player implementation: 3 points
- Background audio & lock screen: 3 points
- Speed/loop/seek controls: 2 points
- Session integration (sankalp, offering, history): 2 points
- Testing & edge cases: 2 points
- Audio content creation/sourcing: 1 point
- **Total: 13 points (5-7 days)**

---

### Library Favorites Filter (V3 - P2)

**Status:** Not Started
**Epic:** Shloka Library & Content
**Priority:** P2
**Estimated Effort:** 1-2 days

Allow users to filter the Library to show only their favorited shlokas. Favorites infrastructure and ShlokaDetail toggle already exist; LibraryScreen currently shows all shlokas.

#### Features to Implement:
1. **LibraryScreen Filter UI**
   - Add "All" / "Favorites" (or "My list") segment control or tabs above the shloka list
   - When "Favorites" selected, filter list using `getFavorites()` and match shloka IDs to `getAllShlokas()`
   - Show empty state when no favorites: "No favorites yet. Tap a shloka and tap the heart to add."
   - Persist filter preference (optional) or default to "All"

2. **Integration**
   - Ensure LibraryScreen subscribes to favorite changes (e.g. when user returns from ShlokaDetail after toggling favorite, list updates)
   - Add tests for filter behavior and empty state

#### Acceptance Criteria:
- [ ] User can switch between "All" and "Favorites" in Library
- [ ] Favorites filter shows only shlokas the user has marked as favorite
- [ ] Empty state displays when user has no favorites
- [ ] Toggling favorite on ShlokaDetail updates Favorites filter when user navigates back
- [ ] All existing Library and favorites tests still pass

#### Technical Notes:
- Use existing `getFavorites()` from `@/utils/favorites`
- Filter: `shlokas.filter(s => favoriteIds.includes(s.id))` where `favoriteIds = await getFavorites()`

---

### Library Search (V3 - P2)

**Status:** Not Started
**Epic:** Shloka Library & Content
**Priority:** P2
**Estimated Effort:** 2-3 days

Search shlokas in the Library by name, deity, or keyword so the library remains usable as content grows.

#### Features to Implement:
1. **Search Input**
   - Add search bar at top of LibraryScreen (below header or in header)
   - Debounced text input (e.g. 300ms) to avoid excessive filtering on every keystroke
   - Clear button when search has text
   - Accessibility: search field label, hint "Search by name, deity, or keyword"

2. **Search Logic**
   - Search across shloka `name`, `shortName`, `deity`, `description`, and optionally `benefits`
   - Case-insensitive match; consider substring match (e.g. "Gayatri" matches "Gayatri Mantra")
   - Optional: highlight matching text in results (future enhancement)

3. **Empty State**
   - When search returns no results: "No shlokas match your search. Try a different word."

#### Acceptance Criteria:
- [ ] User can type in search field and see filtered list
- [ ] Results update as user types (with debounce)
- [ ] Search matches name, deity, and description
- [ ] Empty state shows when no results
- [ ] Clearing search restores full list
- [ ] Search works with Favorites filter (search within favorites when both active)
- [ ] Accessible and works with screen reader

#### Technical Notes:
- Keep search client-side; no backend required
- Consider `useMemo` for filtered list based on `searchQuery` and `favoriteIds`

---

### Practice Goals UI (V3 - P2)

**Status:** Not Started
**Epic:** Progress Tracking & Motivation
**Priority:** P2
**Estimated Effort:** 2-3 days

Expose practice goals in the UI so users can set a simple goal (e.g. "1 session per day" or "X sessions this week") and see progress. Goals storage (`goalsStorage`) already exists.

#### Features to Implement:
1. **Set Goal (Settings or Home)**
   - Section in SettingsScreen or Home: "Practice goal"
   - Options: e.g. "1 session per day", "3 sessions per week", "7 sessions per week" (configurable)
   - Start date = today or start of current week
   - Save via `saveGoal()` with `PracticeGoal` shape (targetSessions, currentProgress, startDate, isActive)

2. **Progress Display**
   - On Home (or Settings): show "3/7 days this week" or "2/3 sessions" with simple progress indicator (e.g. text + optional progress bar)
   - When goal is met for the period: "Goal met! 🎯" or similar; optionally increment or show next period
   - When no goal set: optional CTA "Set a practice goal" linking to goal setup

3. **Goal Progress Updates**
   - When user completes a session (PracticeScreen completion flow), call `updateGoalProgress()` if goal is active and period matches
   - Ensure goal period logic aligns with `GoalType` (daily vs weekly) and `startDate`

#### Acceptance Criteria:
- [ ] User can set a practice goal (e.g. sessions per day or per week)
- [ ] Goal persists across app restarts
- [ ] Home (or dedicated area) shows current progress (e.g. "3/7 days")
- [ ] Completing a session updates progress when goal is active
- [ ] When goal is met, user sees success state; goal can reset for next period or stay completed
- [ ] User can clear or change goal in Settings
- [ ] Tests for goal UI and progress updates

#### Technical Notes:
- Use existing `goalsStorage`: `loadGoal`, `saveGoal`, `updateGoalProgress`, `clearGoal`
- Types: `PracticeGoal` in `@/types/practice` (targetSessions, currentProgress, startDate, isActive, type)

---

### Quiet Hours for Reminders (V3 - P2)

**Status:** Not Started
**Epic:** Notifications & Reminders
**Priority:** P2
**Estimated Effort:** 1 day

Prevent "No practice yet today" (and similar) reminders from being sent during user-defined quiet hours (e.g. 10 PM – 7 AM).

#### Features to Implement:
1. **Quiet Hours Settings**
   - In SettingsScreen, under Notifications: add "Quiet hours" (e.g. start time and end time, or "From 10:00 PM to 7:00 AM")
   - Store quiet hours in AsyncStorage (e.g. `quiet_hours_start`, `quiet_hours_end` as time or minutes-from-midnight)
   - Default: e.g. 22:00–07:00 or configurable defaults

2. **Reminder Scheduling Logic**
   - When scheduling daily reminder, check whether reminder time falls inside quiet hours; if so, skip or adjust to next available time after quiet hours end
   - Optional: "No practice yet" type notifications should not fire if current time is within quiet hours
   - Use existing notification utilities; extend with quiet-hours check

#### Acceptance Criteria:
- [ ] User can set quiet hours start and end in Settings
- [ ] Daily reminder is not sent during quiet hours (or is moved to first non-quiet time)
- [ ] Quiet hours persist across app restarts
- [ ] Edge cases: overnight range (e.g. 22:00–07:00) handled correctly
- [ ] Tests for quiet-hours logic

#### Technical Notes:
- Compare reminder time with quiet range; handle overnight span (e.g. 22–07 = 22:00 to next day 07:00)
- Reuse `scheduleDailyReminder` and related functions in `@/utils/notifications`

---

### Streak Recovery Message (V3 - P2)

**Status:** Not Started
**Epic:** Progress Tracking & Motivation
**Priority:** P2
**Estimated Effort:** 0.5-1 day

After a user breaks their streak (misses a day), show a gentle one-time message encouraging them to start again, e.g. "Your best was X days – you can reach it again."

#### Features to Implement:
1. **Detection**
   - When streak is 0 and `longestStreak` (from `useStreak` or storage) is > 0, user has just broken a streak (or has in the past)
   - Optional: track "last broken date" to show message only once per break (e.g. show once after break, then not again until next break)

2. **Message Placement**
   - On HomeScreen: when `currentStreak === 0` and `longestStreak > 0`, show a small card or line: "Start a new streak today" and "Your best was X days – you can reach it again."
   - Dismissible or always visible until streak > 0; avoid being intrusive

3. **Copy**
   - Non-competitive, supportive tone; align with app's spiritual tone

#### Acceptance Criteria:
- [ ] When streak is 0 and longest streak > 0, user sees encouragement message on Home
- [ ] Message shows longest streak number
- [ ] Message does not show when user has never had a streak (longestStreak === 0)
- [ ] Optional: message shows only once per broken streak (track last broken date)
- [ ] Accessible and readable

#### Technical Notes:
- `useStreak()` or storage already exposes `longestStreak` and `currentStreak`
- Optional: store `lastStreakBrokenDate` to show message once per break

---

### Weekly Digest (V3 - P2)

**Status:** Not Started
**Epic:** Notifications & Reminders
**Priority:** P2
**Estimated Effort:** 1-2 days

Optional weekly summary (in-app and/or push notification): e.g. "This week: 5 sessions, 47 minutes, 3 malas." Informational only, non-competitive.

#### Features to Implement:
1. **In-App Digest**
   - Section on HomeScreen or dedicated "Insights" area: "This week" summary (total sessions, total minutes, total malas) for current week (Mon–Sun or Sun–Sat, configurable)
   - Reuse or extend existing weekly stats (useStats weeklyStats) if already on Home; ensure it's clearly labeled as "This week"

2. **Push Notification (Optional)**
   - Optional: one push per week (e.g. Sunday evening or Monday morning) with digest: "This week: X sessions, Y minutes, Z malas"
   - User preference in Settings: "Weekly digest" on/off; default off to avoid notification fatigue
   - Schedule weekly notification; respect quiet hours

#### Acceptance Criteria:
- [ ] User can see "This week" summary (sessions, minutes, malas) in app
- [ ] Optional: user can enable weekly digest push and receive one summary per week
- [ ] Digest is informational only (no comparison to others, no pressure)
- [ ] Settings allow disabling weekly digest notification
- [ ] Week boundary consistent (e.g. Monday start)

#### Technical Notes:
- Use existing `useStats()` / `getPracticeStats()` for weekly aggregation
- If push: use existing notification scheduling; add weekly recurrence or one scheduled notification per week

---

### Default Timer Minimum 30s Option (V3 - P2)

**Status:** Not Started
**Epic:** Practice Management
**Priority:** P2
**Estimated Effort:** 0.5-1 day

Allow users to optionally count a session as valid when duration is at least 30 seconds (instead of only 60). Default remains 60 seconds for consistency with existing behavior.

#### Features to Implement:
1. **Settings**
   - In SettingsScreen: "Session minimum" or "Count session from" with options: "60 seconds (recommended)" and "30 seconds"
   - Store preference in AsyncStorage (e.g. `session_minimum_seconds`: 60 or 30)

2. **Practice Flow**
   - In PracticeScreen / useTimer or completion logic: when determining if session "counts" (e.g. for streak, for history), read minimum from storage; if `elapsedSeconds >= sessionMinimum`, count as valid
   - UI: "Complete" button or session completion still respects same minimum (e.g. button enabled when elapsed >= minimum)
   - Ensure streak and session history use the same threshold

#### Acceptance Criteria:
- [ ] User can select 60s or 30s minimum in Settings
- [ ] Session is counted (streak, history) when duration >= selected minimum
- [ ] Default is 60 seconds; existing behavior unchanged for existing users
- [ ] Complete button (or equivalent) enables at selected minimum
- [ ] Tests updated or added for 30s and 60s minimum

#### Technical Notes:
- Single storage key, e.g. `session_minimum_seconds` (number)
- Use in completion check: `elapsedSeconds >= (await getSessionMinimum())`

---

### Onboarding Flow (V3 - P2)

**Status:** Not Started
**Epic:** User Experience & First Run
**Priority:** P2
**Estimated Effort:** 2-3 days

Short first-time user flow: set reminder time, pick one shloka to try, and brief explanation of sankalp. Skip available so returning users are not forced through.

#### Features to Implement:
1. **First-Run Detection**
   - Store `onboarding_completed` (or similar) in AsyncStorage; if not set on app launch, show onboarding (e.g. modal or full-screen flow) instead of main app until complete or skip

2. **Onboarding Steps (2–4 screens)**
   - **Welcome:** App name, tagline, "Get started" or "Skip"
   - **Reminder (optional):** "When would you like to be reminded to practice?" Time picker; can skip
   - **Try a shloka:** "Pick one shloka to try first" – list or carousel of 3–5 shlokas; tap one and "Continue" (optionally navigate to ShlokaDetail or Practice with that shlokaId)
   - **What's a sankalp?** Short 2–3 sentence explanation; "Start practicing" or "Skip"

3. **Persistence**
   - On completion or skip, set `onboarding_completed = true`; optionally save chosen reminder time and chosen shloka
   - Do not show onboarding again unless user clears data or reinstall

#### Acceptance Criteria:
- [ ] First-time users see onboarding flow (welcome + optional reminder + optional shloka pick + sankalp explanation)
- [ ] User can skip at any step; skip marks onboarding complete
- [ ] Reminder time set in onboarding is saved and used for daily reminder if user enabled it
- [ ] After completion, user lands on Home (or main app)
- [ ] Returning users do not see onboarding
- [ ] Accessible (labels, focus order, skip always available)
- [ ] Tests for first-run vs returning user and skip paths

#### Technical Notes:
- Use AsyncStorage for `onboarding_completed` and any chosen options
- Can be implemented as modal stack or dedicated onboarding screens; keep it simple (2–4 steps)

---

### Home Screen Widget (V3 - P2)

**Status:** Not Started
**Epic:** Engagement & Quick Access
**Priority:** P2
**Estimated Effort:** 3-5 days

Widget on device home screen showing "Today's streak: X" and "Start practice" for quick access. Different from Ekadashi-specific widget already in backlog.

#### Features to Implement:
1. **iOS (iOS 14+)**
   - Widget Extension (SwiftUI) or React Native widget solution
   - Small widget: streak number + "Start practice" tap target (opens app to Practice tab)
   - Optional: medium widget with streak + last practice date + Start practice

2. **Android (Android 12+)**
   - Home screen widget (native or Expo/React Native widget library)
   - Same content: streak + Start practice
   - Tap opens app (or deep link to Practice screen)

3. **Data**
   - Widget must read streak (and optional last practice) from shared storage (UserDefaults / SharedPreferences or app group / same app storage) that main app updates
   - Ensure AsyncStorage or equivalent is readable by widget process

#### Acceptance Criteria:
- [ ] User can add Shloka Sadhana widget to home screen (iOS and/or Android)
- [ ] Widget displays current streak number
- [ ] Tapping "Start practice" (or widget) opens app to Practice screen
- [ ] Widget updates when app updates streak (may have platform delay)
- [ ] Works on iOS 14+ and Android 12+ (or per platform support matrix)
- [ ] Accessible (widget content has semantic labels where supported)

#### Technical Notes:
- iOS: WidgetKit + App Groups for sharing streak data; or use existing Expo config for widgets if supported
- Android: App Widget with BroadcastReceiver or WorkManager to update; read from shared prefs
- May require native code or Expo config plugin; estimate higher if first time implementing widgets

---

### Background Timer (V3 - P2)

**Status:** Not Started
**Epic:** Practice Management
**Priority:** P2
**Estimated Effort:** 2-3 days

Keep the practice timer running (or persist elapsed time) when the app is in the background so users can lock the device or switch apps without losing the session. On return, show clear "Session in progress" state.

#### Features to Implement:
1. **Timer Persistence**
   - When app goes to background: save current elapsed seconds, start time (or paused state), and "session active" flag to AsyncStorage or in-memory + persistence
   - Use AppState or equivalent to detect background/foreground; on background, persist; on foreground, restore and resume timer display
   - Optional: use native background task or timer to increment elapsed time while in background (platform-dependent; may have limits)

2. **Resume Experience**
   - When user returns to app: if "session in progress", show Practice screen with timer showing correct elapsed time and "Resume" or continue state
   - If session was paused before background, keep it paused on return
   - Clear "session in progress" only when user completes or resets session

3. **Edge Cases**
   - App killed by OS: on next launch, if persisted "session in progress" and start time exist, restore elapsed time (calculated from start time to now or to last saved time) or offer "Resume session?"
   - Do not double-count: ensure one active session at a time

#### Acceptance Criteria:
- [ ] Timer continues (or elapsed time is preserved) when app goes to background
- [ ] On return to app, user sees correct elapsed time and can resume or complete
- [ ] If app was killed, user can resume session from saved state (or prompted "Resume?")
- [ ] Paused state is preserved across background/foreground
- [ ] No duplicate "active session" when resuming
- [ ] Tests for persist/restore and background transition

#### Technical Notes:
- React Native AppState; persist `activePractice` (existing type) with `elapsedSeconds`, `startTime`, `pausedTime`, `isActive`
- Elapsed while in background: either recalculate from `startTime` minus paused duration, or use background task to update (iOS/Android limits apply)
- Existing `loadActivePractice` / `saveActivePractice` in practiceStorage may be extended

---

### Offline Indicator (V3 - P2)

**Status:** Not Started
**Epic:** Technical & Polish
**Priority:** P2
**Estimated Effort:** 0.5-1 day

When the app uses remote content (e.g. contentLoader fetch) and the device is offline or fetch fails, show a clear "Offline – data is local" (or similar) so users understand data is still available and nothing is broken.

#### Features to Implement:
1. **Network State**
   - Use `@react-native-community/netinfo` or Expo equivalent to detect connectivity
   - Optional: detect failed fetch (e.g. contentLoader) and set "offline or error" state when remote content is used

2. **UI Indicator**
   - Small banner or line at top of screen (or on relevant screens: Library, ShlokaDetail, Home if they load remote content): "Offline – showing saved content" or "Offline – data is local"
   - Only show when app has attempted to use network and is offline (or fetch failed); do not show on purely local screens if no remote usage
   - Dismissible or auto-hide when back online; optional "Retry" for content

3. **Scope**
   - Apply where remote content is used (e.g. contentLoader for shlokas); if app is fully local for MVP, indicator can appear only when a fetch fails (e.g. after OTA or remote config is introduced)

#### Acceptance Criteria:
- [ ] When device is offline and app relies on remote content, user sees offline indicator
- [ ] Message is reassuring ("data is local" / "showing saved content") not alarming
- [ ] Indicator disappears when back online (and optional retry succeeds)
- [ ] Does not block use of app; content falls back to local/cached where implemented
- [ ] Accessible (announced to screen reader when state changes)

#### Technical Notes:
- NetInfo.currentState; listen for changes
- If contentLoader already has local fallback, indicator explains why "latest" content might not be there
- Can be a small context or hook: `useOfflineIndicator()` that returns `isOffline` and optional `lastFetchFailed`

---

### Daily Shloka / Shloka of the Day (V3 - P2)

**Status:** Not Started
**Epic:** Shloka Library & Content
**Priority:** P2
**Estimated Effort:** 1-2 days

Rotate a "shloka of the day" on Home or Library; tapping it opens the existing ShlokaDetail screen. Encourages variety and discovery.

#### Features to Implement:
1. **Selection Logic**
   - Pick one shloka per day (e.g. by hash of date string, or round-robin by index): `shlokas[hash(date) % shlokas.length]` or seeded random per day
   - Same shloka for all users for a given day (deterministic) or per-user random; document choice

2. **UI Placement**
   - On HomeScreen: card or section "Shloka of the day" with shloka name and optional deity; tap navigates to ShlokaDetail with that shlokaId
   - Alternatively or additionally: highlight at top of LibraryScreen as "Today's pick"
   - Reuse existing ShlokaDetail; no new screen

3. **Label**
   - Clear label: "Shloka of the day" or "Today's pick" so users understand it rotates

#### Acceptance Criteria:
- [ ] User sees a "Shloka of the day" (or "Today's pick") on Home or Library
- [ ] Tapping it opens ShlokaDetail for that shloka
- [ ] Selection changes daily (deterministic or consistent for the day)
- [ ] Works with existing navigation and ShlokaDetail
- [ ] Accessible (button/link has clear label)

#### Technical Notes:
- Use `getAllShlokas()`; derive index from `new Date().toISOString().split('T')[0]` (date string) + simple hash or modulo
- No backend required; can be driven by local date

---

### Verse of the Day (V3 - P2)

**Status:** Not Started
**Epic:** Shloka Library & Content
**Priority:** P2
**Estimated Effort:** 1-2 days

For shlokas with multiple verses, optionally show one "verse of the day" (e.g. on ShlokaDetail or Home) to help users focus on a single verse. Complements Daily Shloka.

#### Features to Implement:
1. **Selection**
   - For a given shloka with `sections[]`, pick one verse per day (e.g. by date + shlokaId: `sections[hash(date + shlokaId) % sections.length]`)
   - If only one section, show that section as "verse of the day" for that shloka

2. **Display**
   - On ShlokaDetailScreen: optional collapsible or highlighted section "Verse of the day" showing Sanskrit, transliteration, and meaning for the selected verse
   - Optional: on Home, show "Verse of the day" from a chosen shloka (e.g. from "Shloka of the day") with one verse and link to full ShlokaDetail

3. **Label**
   - "Verse of the day" or "Today's verse" so users know it rotates

#### Acceptance Criteria:
- [ ] For multi-verse shlokas, user can see a "Verse of the day" (one verse) on detail or Home
- [ ] Selection changes daily and is deterministic per shloka
- [ ] Displays Sanskrit, transliteration, and meaning
- [ ] Tapping can expand or navigate to full shloka
- [ ] Accessible

#### Technical Notes:
- Use existing `ShlokaSection` (id, sanskrit, transliteration, meaning); no new types
- Deterministic index from date + shlokaId

---

### Muhurat on Home – Best Times for the Day (V3 - P2)

**Status:** Not Started
**Epic:** Paanchang & Hindu Calendar
**Priority:** P2
**Estimated Effort:** 1-2 days (Phase 1); 2-3 days if Choghadiya added (Phase 2)

Show on Home (inside or below PaanchangCard) **auspicious times for different activities** – not only puja/practice, but also best times for important work, buying, travel, etc. Uses existing `muhurat.ts` (Brahma Muhurta, Abhijit Muhurta, Rahu Kaal). Optionally extend later with Choghadiya for more granular "good for travel / business / buying" segments.

#### Why extend beyond puja?
In Jyotisha/Panchang, different muhurtas are traditionally used for different activities:
- **Brahma Muhurta** – spiritual practice, meditation, study
- **Abhijit Muhurta** – important work, decisions, new ventures, buying, travel, starting things
- **Rahu Kaal** – generally avoided for new ventures and important tasks (we show it so users can plan around it)

So the same calculations we already have can be labeled by **activity** and shown as "Best for practice", "Best for important tasks & buying", "Avoid for new ventures", etc.

#### Features to Implement

**Phase 1 – Activity-labeled muhurtas (no new calculations):**

1. **Muhurat data**
   - Call `getMuhuratForDate()` from `@/utils/muhurat` for today; get Brahma Muhurta, Abhijit Muhurta, and Rahu Kaal (already returned).
   - Use default or user location; document default (e.g. Delhi).

2. **How timezone / country (location) affect muhurat**
   - **Latitude:** Affects day length (sunrise/sunset). Higher latitude = longer summer days, shorter winter days; extreme latitudes can have polar day/night. So Brahma Muhurta and Abhijit windows shift with latitude.
   - **Longitude:** Affects when solar noon (and thus sunrise/sunset) occurs. Same timezone but different longitude (e.g. Delhi vs Mumbai) = different actual sun times; `muhurat.ts` uses longitude in the solar formula, so times are location-specific.
   - **Timezone:** (1) Defines **what “today” is** for the user. “Today” must be the user’s local date (YYYY-MM-DD in their timezone), not UTC, so we show muhurat for the correct calendar day. (2) For display, times should be in the user’s local clock time; if the app uses a fixed default (e.g. Delhi), that default should use that place’s timezone when resolving “today” and when interpreting sunrise/sunset as clock time.
   - **Country:** Same as above (location = lat/lon + timezone). Optionally, country/region can drive a default location (e.g. India → Delhi, US → user’s city or a fallback) and the correct IANA timezone (e.g. Asia/Kolkata, America/New_York).
   - **Implementation:** Resolve “today” in the user’s timezone (device timezone or user-set location’s timezone). Pass that date plus user/saved lat/lon to `getMuhuratForDate()`. If we add timezone to the API later, use it for “today” and for any conversion from solar to clock time; until then, document that default is Delhi and times are for the chosen location’s sun.

3. **Activity labels (constants or config)**
   - **Brahma Muhurta:** "Best for: practice, meditation, study" (or "Best for spiritual practice")
   - **Abhijit Muhurta:** "Best for: important work, decisions, buying, new ventures" (or "Best for important tasks & buying")
   - **Rahu Kaal:** "Avoid for: new ventures, important tasks" (or "Avoid for new beginnings" – gentle, non-alarming)
   - Store labels in constants or JSON so they can be tuned/translated later.

4. **UI on Home**
   - Section "Auspicious times today" or "Best times today" inside PaanchangCard or directly below it.
   - Show 2–3 lines, e.g.:
     - "Best for practice: 5:30–6:00 AM (Brahma Muhurta)"
     - "Best for important tasks & buying: 12:00–12:48 PM (Abhijit)"
     - "Avoid for new ventures: 3:00–4:30 PM (Rahu Kaal)"
   - Optional: tap to expand or link to future "Muhurat" detail screen with full list and short explanations.
   - Keep copy clear and concise; avoid overwhelming.

5. **Optional: user preference**
   - Settings: "Show Rahu Kaal" on/off (some users prefer not to see "avoid" times); default on.

**Phase 2 – Choghadiya (future, optional):**

6. **Choghadiya-style segments**
   - Divide the day into segments (e.g. 8 periods from sunrise to sunset) and assign each a type (Amrit/Shubh/Labh = good; Udveg/Kal = avoid) based on weekday and sunrise/sunset.
   - Map segment types to activities: e.g. "Good for travel", "Good for business", "Good for buying", "Avoid for new ventures".
   - Display 2–4 "Good for X: HH:MM–HH:MM" lines, or a compact "Today’s Choghadiya" table/list.
   - Requires Choghadiya calculation logic (formulas vary by tradition); can be added in a later backlog item.

#### Acceptance Criteria (Phase 1):
- [ ] Home displays "Best times today" (or equivalent) with at least Brahma and Abhijit, each with activity label.
- [ ] Brahma shows "Best for practice" (or spiritual practice); Abhijit shows "Best for important tasks & buying" (or similar).
- [ ] Optional: Rahu Kaal shown with "Avoid for new ventures" (or similar); optional setting to hide.
- [ ] Time ranges are accurate for default (or user) location.
- [ ] Copy is clear, concise, and respectful of tradition.
- [ ] Fits visually with PaanchangCard; does not clutter.
- [ ] Tests for muhurat display (mock muhurat if needed).

#### Acceptance Criteria (Phase 2 – if Choghadiya added):
- [ ] Day is divided into segments with "good for" / "avoid" labels.
- [ ] User sees at least 2–4 activity-specific time windows (e.g. good for travel, business, buying).
- [ ] Calculation is documented and consistent with one chosen tradition (e.g. Gujarati Choghadiya or similar).

#### Technical Notes:
- Phase 1: Use existing `muhurat.ts` – `getMuhuratForDate()` returns `brahmaMuhurta`, `abhijitMuhurat`, `rahuKaal` (start/end). No new calculation; only add activity labels and UI.
- Activity labels: define in `constants/MuhuratLabels.ts` or in PaanchangCard; optionally move to JSON for i18n later.
- Phase 2: Choghadiya requires segment calculation (sunrise/sunset + weekday-based mapping); research one authoritative source and implement in a new util or extend muhurat.ts.
- PaanchangCard or HomeScreen can import `getMuhuratForDate` and render the section.

---

### Upcoming Festivals List (V3 - P2)

**Status:** Not Started
**Epic:** Paanchang & Hindu Calendar
**Priority:** P2
**Estimated Effort:** 1-2 days

Show a list of upcoming festivals (next N days or weeks) on Home or a dedicated section, using existing festivalCalendar.ts and festivals.json. Backlog already has Ekadashi calendar; this is general festivals.

#### Features to Implement:
1. **Data**
   - Use `getUpcomingFestivals(date, count)` or equivalent from `@/utils/festivalCalendar`; supply count (e.g. next 10 or next 30 days)
   - Ensure festivals.json (or loaded data) includes name, date, significance (optional)

2. **UI**
   - Section on HomeScreen: "Upcoming festivals" with list of name + date (e.g. "Maha Shivaratri – Mar 8, 2026")
   - Optional: tap opens a detail view (future) or link to Ekadashi/Paanchang; for MVP, list only
   - Optional: dedicated "Festivals" tab or screen; or keep on Home only

3. **Empty State**
   - If no festivals in range, hide section or show "No upcoming festivals in the next N days"

#### Acceptance Criteria:
- [ ] User sees upcoming festivals (name + date) on Home or dedicated area
- [ ] List is sorted by date; covers next 2–4 weeks (or configurable)
- [ ] Data comes from existing festival calendar utility and JSON
- [ ] Optional: tap for more detail (if implemented later)
- [ ] Empty state handled
- [ ] Tests for festival list rendering

#### Technical Notes:
- Use existing `festivalCalendar.ts` and `festivals.json`
- If festivals.json is large, consider loading only next N entries or filtering by date range

---

### "What's a Sankalp?" Help (V3 - P3)

**Status:** Not Started
**Epic:** User Experience & First Run
**Priority:** P3
**Estimated Effort:** 0.5 day

Add a short explanation of sankalp (intention) on the SankalpModal or via a first-time tooltip so new users understand why they're asked to set an intention.

#### Features to Implement:
1. **Copy**
   - 2–3 sentences: e.g. "A sankalp is a heartfelt intention you set before practice. It dedicates your practice to a person, cause, or your own growth. You can skip if you prefer."

2. **Placement**
   - Option A: Small "What's a sankalp?" link or (?) icon on SankalpModal; tap shows modal or inline expand with the copy
   - Option B: Show once on first open of SankalpModal as a short paragraph above the text input; then collapse or hide on later opens
   - Option C: Include in onboarding flow (see Onboarding Flow backlog item)

3. **Accessibility**
   - Link/button has accessible name; expanded content is readable by screen reader

#### Acceptance Criteria:
- [ ] User can access a brief explanation of sankalp (from modal or onboarding)
- [ ] Copy is clear and respectful of tradition
- [ ] Does not block users who want to skip or type immediately
- [ ] Accessible
- [ ] Optional: show only once per install (then "What's a sankalp?" link only)

#### Technical Notes:
- No new dependencies; add copy to constants or inline in SankalpModal
- If "show once": store `sankalp_explanation_seen` in AsyncStorage

---

### Content Metadata & Structure Enhancement (V3 - P1)

**Status:** Not Started
**Epic:** Shloka Library & Content / Smart Recommendations
**Priority:** P1 (foundational for multiple V3 features)
**Estimated Effort:** 2-3 days

Enhance shloka data model with rich metadata to power intelligent recommendation engine, personalized content discovery, and better serve both beginner and advanced practitioners.

#### Problem Statement:
Current shloka data model lacks structured metadata needed for:
- Daily shloka recommendations based on day of week, festivals, Paanchang
- Difficulty-based filtering (beginner vs. advanced)
- Duration-based discovery (quick 3-min vs. 25-min practices)
- Deity/tradition-based organization
- Ekadashi-specific content recommendations

#### User Stories:
- As **Michael (beginner)**, I want to see beginner-friendly mantras (3-5 min, simple) so I'm not overwhelmed
- As **Asha (experienced)**, I want to find advanced Vedic chants and longer stotrams for my practice
- As **Priya (consistent practitioner)**, I want Tuesday/Saturday to automatically suggest Hanuman Chalisa
- As **any user**, I want Ekadashi days to suggest Vishnu-related shlokas
- As **any user**, I want festival days (Maha Shivaratri) to suggest relevant deity shlokas (Shiva)

#### Features to Implement:

**1. Extend Shloka Data Model**

Add new metadata fields to `Shloka` interface:

```typescript
interface Shloka {
  // ... existing fields (id, name, deity, description, etc.)

  // NEW: Day of week recommendations
  recommendedDays?: DayOfWeek[]; // e.g. ['tuesday', 'saturday'] for Hanuman

  // NEW: Festival associations
  associatedFestivals?: string[]; // e.g. ['maha-shivaratri', 'pradosham'] for Shiva

  // NEW: Ekadashi relevance
  ekadashiRelevant?: boolean; // true for Vishnu/Krishna shlokas

  // NEW: Difficulty level
  difficulty: 'beginner' | 'intermediate' | 'advanced';

  // NEW: Duration category (derived or explicit)
  durationMinutes: number; // e.g. 3, 10, 25
  durationCategory: 'quick' | 'medium' | 'long'; // <5min, 5-15min, 15+min

  // NEW: Practice type
  practiceType: 'mantra' | 'stotra' | 'chalisa' | 'sahasranama' | 'suktam';

  // NEW: Tradition/lineage (optional)
  tradition?: 'vaishnava' | 'shaiva' | 'shakta' | 'smartha' | 'universal';

  // NEW: Tags for search and filtering
  tags?: string[]; // e.g. ['protection', 'courage', 'obstacles', 'devotion']

  // NEW: Recommended for (use cases)
  recommendedFor?: string[]; // e.g. ['morning', 'evening', 'before-sleep', 'fasting-days']
}

type DayOfWeek = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
```

**2. Populate Metadata for Existing Shlokas**

Example metadata structure:

```typescript
// Hanuman Chalisa
{
  id: 'hanuman-chalisa',
  name: 'Hanuman Chalisa',
  deity: 'Hanuman',
  recommendedDays: ['tuesday', 'saturday'], // Traditional days for Hanuman
  associatedFestivals: ['hanuman-jayanti'],
  ekadashiRelevant: false,
  difficulty: 'beginner', // Well-known, accessible
  durationMinutes: 10,
  durationCategory: 'medium',
  practiceType: 'chalisa',
  tradition: 'universal', // Widely practiced across traditions
  tags: ['courage', 'strength', 'obstacles', 'devotion', 'protection'],
  recommendedFor: ['morning', 'anytime', 'challenges']
}

// Vishnu Sahasranam
{
  id: 'vishnu-sahasranam',
  name: 'Vishnu Sahasranam',
  deity: 'Vishnu',
  recommendedDays: ['thursday'], // Vishnu's day
  associatedFestivals: ['vaikuntha-ekadashi', 'vishnu-jayanti'],
  ekadashiRelevant: true, // Perfect for Ekadashi
  difficulty: 'intermediate',
  durationMinutes: 25,
  durationCategory: 'long',
  practiceType: 'sahasranama',
  tradition: 'vaishnava',
  tags: ['peace', 'protection', 'spiritual-growth', 'ekadashi', 'vishnu'],
  recommendedFor: ['morning', 'before-sleep', 'ekadashi', 'fasting-days']
}

// Gayatri Mantra
{
  id: 'gayatri-mantra',
  name: 'Gayatri Mantra',
  deity: 'Universal (Savitri)',
  recommendedDays: [], // Any day
  associatedFestivals: [],
  ekadashiRelevant: false,
  difficulty: 'beginner', // Simple, short, universal
  durationMinutes: 3,
  durationCategory: 'quick',
  practiceType: 'mantra',
  tradition: 'universal',
  tags: ['wisdom', 'clarity', 'illumination', 'beginner-friendly', 'universal'],
  recommendedFor: ['morning', 'sandhya', 'sunrise', 'sunset', 'daily']
}

// Future: Shiva Tandava Stotram (example)
{
  id: 'shiva-tandava-stotram',
  deity: 'Shiva',
  recommendedDays: ['monday'], // Shiva's day
  associatedFestivals: ['maha-shivaratri', 'pradosham'],
  ekadashiRelevant: false,
  difficulty: 'advanced', // Complex Sanskrit, fast pace
  durationMinutes: 8,
  durationCategory: 'medium',
  practiceType: 'stotra',
  tradition: 'shaiva',
  tags: ['power', 'transformation', 'shiva', 'advanced'],
  recommendedFor: ['monday', 'evening', 'shivaratri']
}

// Future: Lakshmi Ashtottara (example)
{
  deity: 'Lakshmi',
  recommendedDays: ['friday', 'thursday'], // Lakshmi and Vishnu days
  associatedFestivals: ['diwali', 'varalakshmi-vratam'],
  ekadashiRelevant: false,
  difficulty: 'intermediate',
  durationMinutes: 7,
  durationCategory: 'medium',
  practiceType: 'stotra',
  tradition: 'shakta',
  tags: ['abundance', 'prosperity', 'gratitude', 'lakshmi'],
  recommendedFor: ['friday', 'morning', 'evening']
}
```

**3. Day-of-Week Mapping Constants**

Create utility for day-based recommendations:

```typescript
// @/constants/DayDeityMap.ts
export const DAY_DEITY_MAP = {
  sunday: { deity: 'Surya (Sun)', shlokas: ['aditya-hridayam', 'surya-mantra'] },
  monday: { deity: 'Shiva', shlokas: ['shiva-tandava', 'mahamrityunjaya-mantra'] },
  tuesday: { deity: 'Hanuman', shlokas: ['hanuman-chalisa', 'hanuman-ashtottara'] },
  wednesday: { deity: 'Vishnu/Ganesha', shlokas: ['vishnu-sahasranam', 'ganesha-mantra'] },
  thursday: { deity: 'Vishnu/Guru', shlokas: ['vishnu-sahasranam', 'guru-stotra'] },
  friday: { deity: 'Lakshmi/Devi', shlokas: ['lakshmi-ashtottara', 'devi-stotra'] },
  saturday: { deity: 'Hanuman/Shani', shlokas: ['hanuman-chalisa', 'shani-stotra'] }
};
```

**4. Smart Recommendation Engine Utility**

```typescript
// @/utils/shlokaRecommendations.ts

interface RecommendationContext {
  currentDay: DayOfWeek;
  isEkadashi: boolean;
  upcomingFestival?: string; // e.g. 'maha-shivaratri'
  userLevel?: 'beginner' | 'intermediate' | 'advanced';
  preferredDuration?: 'quick' | 'medium' | 'long';
  userHistory?: string[]; // Recently practiced shloka IDs (avoid repeating)
}

export function getRecommendedShloka(
  context: RecommendationContext
): Shloka | null {
  const allShlokas = getAllShlokas();

  // Priority 1: Upcoming festival (if within 3 days)
  if (context.upcomingFestival) {
    const festivalMatch = allShlokas.filter(s =>
      s.associatedFestivals?.includes(context.upcomingFestival)
    );
    if (festivalMatch.length) return festivalMatch[0];
  }

  // Priority 2: Ekadashi day
  if (context.isEkadashi) {
    const ekadashiShlokas = allShlokas.filter(s => s.ekadashiRelevant);
    if (ekadashiShlokas.length) return ekadashiShlokas[0];
  }

  // Priority 3: Day of week
  const dayShlokas = allShlokas.filter(s =>
    s.recommendedDays?.includes(context.currentDay)
  );

  // Filter by user level if provided
  let candidates = dayShlokas.length ? dayShlokas : allShlokas;
  if (context.userLevel) {
    candidates = candidates.filter(s => s.difficulty === context.userLevel);
  }

  // Filter by duration if provided
  if (context.preferredDuration) {
    candidates = candidates.filter(s => s.durationCategory === context.preferredDuration);
  }

  // Exclude recently practiced (avoid repetition)
  if (context.userHistory?.length) {
    candidates = candidates.filter(s => !context.userHistory!.includes(s.id));
  }

  // Return first match or fallback to Gayatri (universal, beginner-friendly)
  return candidates[0] || allShlokas.find(s => s.id === 'gayatri-mantra') || null;
}
```

**5. Library Filtering by Metadata**

Enable filtering in LibraryScreen:

- Filter by difficulty: "Beginner", "Intermediate", "Advanced"
- Filter by duration: "Quick (<5 min)", "Medium (5-15 min)", "Long (15+ min)"
- Filter by deity: "Vishnu", "Shiva", "Hanuman", "Universal"
- Filter by practice type: "Mantra", "Stotra", "Chalisa"
- Combined filters: e.g. "Beginner + Quick" shows only Gayatri-like mantras

**6. Enhance Daily Shloka Recommendation (#18)**

Update existing V3 feature with smart engine:

```typescript
// On HomeScreen
const today = new Date();
const dayOfWeek = getDayOfWeek(today); // 'tuesday'
const isEkadashi = checkIfEkadashi(today);
const upcomingFestival = getNextFestival(today, 3); // Within 3 days

const recommendedShloka = getRecommendedShloka({
  currentDay: dayOfWeek,
  isEkadashi,
  upcomingFestival: upcomingFestival?.id,
  userLevel: 'beginner', // From user profile or inferred
  preferredDuration: 'quick', // From user settings or history
  userHistory: recentlyPracticed // Last 7 days
});

// Display: "Today's recommendation: Hanuman Chalisa (Tuesday)"
```

#### Content Strategy for Future Expansion:

**Beginner-Friendly (3-5 min):**
- Gayatri Mantra ✅ (existing)
- Mahamrityunjaya Mantra
- Ganesha Mantra
- Simple Shanti Mantras

**Intermediate (5-15 min):**
- Hanuman Chalisa ✅ (existing)
- Lakshmi Ashtottara
- Durga Chalisa
- Aditya Hridayam

**Advanced (15+ min):**
- Vishnu Sahasranam ✅ (existing)
- Shiva Tandava Stotram
- Lalita Sahasranama
- Rudram Chamakam

**Deity-Day Mapping (Traditional):**
- Monday → Shiva
- Tuesday/Saturday → Hanuman
- Thursday → Vishnu/Guru
- Friday → Lakshmi/Devi
- Ekadashi (any day) → Vishnu/Krishna

#### Acceptance Criteria:

- [ ] Shloka data model extended with all new metadata fields
- [ ] All existing shlokas (Vishnu Sahasranam, Hanuman Chalisa, Gayatri) have complete metadata
- [ ] `getRecommendedShloka()` utility implemented and tested
- [ ] Day-of-week mapping constants defined
- [ ] Library filtering by difficulty, duration, deity works
- [ ] Daily recommendation uses smart engine (not just random/hash)
- [ ] Ekadashi days prioritize Vishnu content
- [ ] Festival days prioritize relevant deity content
- [ ] User sees appropriate beginner/advanced content based on level
- [ ] Metadata schema documented for future content additions
- [ ] Tests for recommendation engine with various contexts

#### Technical Notes:

- Extend `@/types/shloka.ts` with new fields
- Update `@/data/shlokas.json` (or TypeScript data) with metadata
- Create `@/utils/shlokaRecommendations.ts` for smart logic
- Create `@/constants/DayDeityMap.ts` and `@/constants/FestivalMap.ts`
- LibraryScreen gets new filter UI (can reuse existing filter patterns)
- Daily Shloka feature (#18 in V3) consumes this infrastructure

#### Benefits:

- ✅ **Powers V3 Daily Shloka Recommendation (#18)** with intelligent context-aware suggestions
- ✅ **Serves beginner users (Michael)** with filtered easy content (difficulty + duration)
- ✅ **Serves advanced users (Asha)** with longer, complex chants
- ✅ **Increases engagement** via culturally-appropriate day/festival suggestions
- ✅ **Ekadashi integration** recommends Vishnu content automatically
- ✅ **Scales content library** with clear structure for adding 50+ shlokas in future
- ✅ **Improves discovery** through filtering and personalization
- ✅ **Respects tradition** by honoring day-deity associations

#### Dependencies:

- Paanchang integration (already done in V2) for Ekadashi detection
- Festival calendar (existing `festivalCalendar.ts`) for festival-based recommendations
- User profile/settings (V3 Auth feature) for storing user level preference (optional)

#### Implementation Priority:

**Phase 1 (Essential - 1 day):**
- Extend Shloka interface
- Populate metadata for 3 existing shlokas
- Basic day-of-week mapping

**Phase 2 (Recommendation Engine - 1 day):**
- Implement `getRecommendedShloka()` utility
- Integrate with Daily Shloka feature (#18)
- Test with Ekadashi and day-of-week logic

**Phase 3 (Filtering UI - 1 day):**
- Add difficulty/duration/deity filters to LibraryScreen
- Add "Beginner-friendly" badge to shloka cards
- Add duration badges (3 min, 10 min, 25 min)

---

### Duolingo-Style UI/UX Refresh (V3 - P2)

**Status:** Not Started
**Epic:** UI/UX Overhaul
**Priority:** P2
**Estimated Effort:** 5–10 days (phased)

Align app UI/UX with Duolingo-inspired patterns: friendly, clear, habit-forming, with one primary action per screen and visible progress.

#### Visual & Tone
- Bright, simple, friendly palette; clear hierarchy; minimal clutter
- Strong colour system (e.g. green = success/continue, one accent for primary actions)
- Optional: illustrations or mascot for personality
- Content in cards with rounded corners; avoid dense text blocks

#### Flow & Structure
- **Path / learning tree:** one clear “next step” (e.g. next mantra or lesson), not a long menu
- **One main action per screen:** e.g. “Start this mantra” or “Continue”
- **Progress at a glance:** streak, “X of Y completed”, or level bar visible (e.g. top or bottom bar)
- **Celebrations:** short confetti/sound on lesson complete or streak kept

#### Habits & Motivation
- **Streak:** “You’ve practised 7 days in a row” with visible streak count
- **Daily goal:** e.g. “5 min today” with progress ring or bar
- **Gentle reminders:** “Don’t break your streak” (notification or in-app)
- Optional: hearts/lives or session limits if desired

#### Content Presentation
- **Chunking:** one line or one short verse per card/screen, then “Next”
- **Tap to reveal:** e.g. tap to show meaning/transliteration (Duolingo-style)
- **Minimal text per view:** Sanskrit + one line meaning; scroll or tap for more

#### Navigation
- **Bottom tab bar:** e.g. Home (path), Practice, Profile/Stats
- **Home = path:** list of mantras/sections as steps; current one highlighted, completed with checkmark

#### Acceptance Criteria (high level)
- [ ] Single primary action per screen where possible
- [ ] Progress/streak visible on main flow
- [ ] Mantra/shloka content shown in small chunks with next/reveal
- [ ] Navigation follows path + tabs pattern
- [ ] Visual style: friendly, clear, consistent colour system
- [ ] Optional: completion/streak celebration

#### Notes
- Can be phased: e.g. Phase 1 = path + chunks + one action; Phase 2 = streak/celebration; Phase 3 = visual refresh
- Respect sacred tone; avoid over-gamification if it conflicts with app purpose

---

## Completed Features

### V2 Features (Completed)
- ✅ Phase 1: Shloka Library & Detail
- ✅ Phase 2: Paanchang & Hindu Calendar
- ✅ Phase 3: Practice Enhancements (Sankalp, Offering, Notes, Goals)
- ✅ Phase 4: Home & Dashboard Improvements (Stats, Quick Actions)
- ✅ Phase 5: Settings & Personalization
  - ✅ Theme infrastructure complete (UI rollout deferred to V3)
  - ✅ Font size settings (completed)
  - ✅ Reminder time configuration (completed)
  - All 656 tests passing

---

## Notes

- Items marked with ⚠️ have infrastructure ready but need UI completion
- Items marked with 🔄 are in progress
- Priority levels: P1 (High), P2 (Medium), P3 (Low)
- Estimated efforts are rough approximations

Last Updated: 2026-02-06 (New Backlog Items: Duolingo-Style UI/UX Refresh (V3-P2), Content Metadata & Structure Enhancement (V3-P1), Library Favorites Filter, Library Search, Practice Goals UI, Quiet Hours, Streak Recovery, Weekly Digest, Timer 30s Option, Onboarding, Home Widget, Background Timer, Offline Indicator, Daily Shloka, Verse of the Day, Muhurat on Home, Upcoming Festivals, Sankalp Help)

---

## V4 / Post-Launch Enhancements

### #30: Algorithmic Hindu Festival Calendar Calculation

**Priority:** P4 (V4+)  
**Effort:** 5-7 days  
**Status:** Backlog (V3 uses static JSON)  
**Dependencies:** Completed V3 festivals feature, Location services

**Description:**
Implement algorithmic calculation of Hindu festival dates based on lunar calendar (Panchang) instead of static JSON data. Auto-generate festival dates for any year dynamically.

**Current V3 Approach:**
- Static JSON file with 180 festivals (Nov 2025 - Feb 2028)
- Manual updates required annually
- Works offline, predictable

**Proposed V4 Enhancement:**
- Dynamic calculation using lunar calendar algorithms
- Based on Tithi, Paksha, Nakshatra, Moon phase
- Support 2025-2100+ date range
- Regional variations (North/South India)
- Location/timezone aware

**Technical:**
- Research library: `@date-fns/panchang`, `drikpanchang-api`, or custom
- Astronomical calculations for moon timings
- Validate against traditional Panchangs
- Performance target: <100ms for 1 year generation
- Fallback to static JSON if calculation fails

**Benefits:**
- No annual manual updates
- More accurate lunar-based dates
- Support any year dynamically
- Easy regional variations

**Challenges:**
- Complex Hindu calendar math
- Regional calculation differences
- Requires extensive validation
- Performance optimization needed


---

## Repo & Release Engineering

Captured at the close of the 2026-07-10 development session. These are repository,
tooling, and release-process items — not product features — so they sit outside the
V3 Feature Overview Table above.

### Context: This Repo Is Now an Independent Fork

**Status:** Decided & Done
**Date:** 2026-07-10

`tangy83/shloka_sadhana` is the canonical repository and proceeds independently.

- `vapmail16/shloka_sadhana` is **read-only** for us (`pull: true, push: false`) — we were
  never collaborators there. It remains configured as the `origin` remote.
- Local `main` now tracks `fork/main`. `fork/main` was fast-forwarded to local `main`.
- PR #4 (app-store prep) was opened against `vapmail16` and then **closed** — we are not
  merging upstream. Nothing is pending from vapmail16.

---

### Salvage Candidates from `archive/firebase-lineage`

**Status:** Not Started
**Epic:** Technical Debt & Prior Art
**Priority:** P1 (reference — read before starting Features #6 or #26)
**Estimated Effort:** Investigation 0.5 day; salvage effort varies

Before the Expo Go rebuild (`6fa50d6`, 2026-02-20, "remove sentry-expo and firebase"),
this project had a substantially different architecture on a lineage that was never merged.
It is preserved on the fork as the annotated tag **`archive/firebase-lineage`** → `aa335e7`.

That lineage contains **working implementations** of things still sitting unstarted in the
backlog above. Read it before building them from scratch:

| Archived work | Relevant backlog item |
|---|---|
| Firebase Auth, Firestore, Remote Config; `AuthContext`, `LoginScreen`, `SignUpScreen` | **#6** User Authentication & Cloud Sync (P1) |
| Social/groups/referrals: `feedService`, `activityService`, `FriendsScreen`, `GroupsScreen`, `ReferralScreen`, `firestore-social.rules` | **#26** Social & Sharing Features (P3) |
| Zustand stores (`useQuestStore`, `useAchievementStore`, `usePracticeStore`, …) | State-management reference |
| `mlRecommendationService` | **#20** Daily Shloka Recommendation (V3) |
| Maestro e2e suite (`e2e/*.yaml` — smoke, practice flow, library search, settings nav) | Testing infrastructure — **does not exist on `main`** |
| ~30 test files incl. integration tests (cloud-sync, friend-system, quest-expiration) | Testing infrastructure |

**Important caveats:**
- This lineage is **not** on any branch. It survives only because of the tag. Do not delete
  the tag — the commits will be garbage-collected.
- It predates the entire current design system, theme migration, and sacred visual system.
  Treat it as **reference, not something to merge**. Architecture diverged deliberately.
- It depends on `@react-native-firebase/*`, `@sentry/react-native`, and `zustand`, none of
  which are in the current `package.json`.

#### Tasks:
- [ ] Review `e2e/*.yaml` — the Maestro suite is the highest-value, lowest-conflict salvage
      (test files, no runtime deps on Firebase). Consider porting to `main` as-is.
- [ ] Before starting Feature #6, read `docs/FIRESTORE_SCHEMA.md` and `docs/firestore-social-schema.md`
      from the tag; the schema design work is already done.
- [ ] Decide explicitly whether the Zustand store pattern is worth revisiting, or whether
      React Context + AsyncStorage remains the answer.
- [ ] Recover checked: `git show archive/firebase-lineage:<path>` reads any file without checkout.

---

### Housekeeping — Quick Wins

**Status:** Not Started
**Priority:** P2 / P3
**Estimated Effort:** < 1 day total

#### 1. Remove the duplicate `images/` directory (P2, 15 min)
`images/` sits untracked in the working tree and contains five PNGs that are **byte-for-byte
identical** (verified by SHA-256) to those already committed in `assets/` by `671438a`:
`icon.png`, `adaptive-icon.png`, `favicon.png`, `notification-icon.png`, `splash-icon.png`.

It is 748K of exact duplicates and was deliberately **not committed** — adding it would put
those bytes in history permanently. Nothing in the codebase references it.

- [ ] `rm -rf images/` — or add `images/` to `.gitignore` if it is a deliberate scratch area.

#### 2. Delete redundant branches on the fork (P3, 5 min)
Both are now fully contained in `fork/main` and serve no purpose:
- [ ] `git push fork --delete appstore-prep`
- [ ] `git push fork --delete rebuild/expo-go-clean`

#### 3. Adopt the conventional fork remote layout (P3, 5 min)
Currently `origin` points at the upstream repo we cannot push to, and `fork` points at ours —
the reverse of convention, and the reason a plain `git push` returned 403.
- [ ] `git remote rename origin upstream && git remote rename fork origin`

#### 4. Fix stale asset reference in docs (P3, 5 min)
`docs/FEATURE_SUMMARY.md:92` still lists `flowerpattern.png`, `rangolipattern.png`,
`trishul pattern.png`, and `glow pattern.png` as "new assets". These PNGs were deleted in
`dfeb844` — they were referenced nowhere in code, and the sacred visuals are SVG components
(`TrishulIcon.tsx`, `MandalaBackground.tsx`).
- [ ] Update or remove that line.

---

### Open Question — Expo Go vs. Native Dev Builds

**Status:** Needs Decision
**Priority:** P2
**Estimated Effort:** 0.5 day to decide; consequences vary

`dfeb844` changed the dev scripts from `expo start --ios/--android` to
`expo run:ios` / `expo run:android`, and both `ios/` and `android/` native directories are
now present. This means **the day-to-day dev path is a native dev build, not Expo Go**.

That quietly invalidates a constraint the codebase was designed around. Notably,
`react-native-reanimated` was removed because Expo Go's SDK 54 bundle shipped an
incompatible native Reanimated build (both v3.16 and v4.1 crashed), and the sacred
animation system was rewritten on the RN `Animated` API as a result.

- [ ] Confirm the move to native dev builds is intentional and permanent.
- [ ] If so, re-evaluate whether `react-native-reanimated` can return — it would simplify
      `src/animations/sacredAnimations.ts` and the sacred components considerably.
- [ ] If Expo Go support still matters (e.g. for quick sharing/demos), document which
      workflow is canonical so the reanimated constraint stays justified.

---

### Note — `eas.json` `update` Block Removed

Relevant to **Feature #5 (Over-The-Air Updates, P1)** above.

`dfeb844` removed the top-level `"update"` key from `eas.json`. This is **not** a regression:
OTA channels are still declared per build profile (`development`, `preview`, `production`),
which is where EAS actually reads them from. `expo-updates` remains installed and `app.json`
retains its `updates` config and `runtimeVersion: { policy: "appVersion" }`.

No action required — recorded so Feature #5 is not started on a false premise.
