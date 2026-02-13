# Phase 2A Manual Testing Checklist
**Shloka Sadhana - Pre-Beta Release Testing**

**Tester**: _______________
**Date**: _______________
**Build**: _______________
**Device**: _______________ (iOS/Android version)

---

## Testing Instructions

1. **Complete ALL sections** in order
2. **Mark checkboxes** as you complete each test
3. **Document bugs** in the "Issues Found" section at the bottom
4. **Take screenshots** of any visual issues
5. **Test both online and offline** scenarios where applicable

---

## ✅ Week 13-14: Quest System

### Daily Quest Generation
- [ ] **New day quest**: Force date change (device settings) → Quest resets at midnight
- [ ] **Beginner quest**: New user gets "Complete 1 practice" (10 XP)
- [ ] **Intermediate quest**: User with 7-30 practices gets duration-based quest (20 XP)
- [ ] **Advanced quest**: User with 30+ practices gets multi-session quest (30 XP)
- [ ] **Quest display**: DailyQuestCard shows on HomeScreen with correct icon and progress bar

### Quest Progress Tracking
- [ ] **Practice once**: Complete practice → Quest progress updates immediately
- [ ] **Duration tracking**: 10-min practice → Duration quest shows "10/10 minutes"
- [ ] **Mala tracking**: Complete 108 beads → Mala-based quest updates
- [ ] **Multiple sessions**: Complete 2 practices same day → Multi-session quest completes
- [ ] **Real-time updates**: Progress bar animates smoothly during practice

### Quest Completion
- [ ] **Completion modal**: Quest complete → QuestCompletionModal appears with confetti
- [ ] **XP award**: Modal shows correct XP amount (10/20/30)
- [ ] **Streak tracking**: Complete quests 3 consecutive days → Quest streak = 3
- [ ] **Next quest**: After completion → New quest available tomorrow
- [ ] **Analytics**: Check Firebase Analytics for QUEST_COMPLETED event

### Quest Edge Cases
- [ ] **Incomplete quest**: Skip a day → Quest resets, streak breaks
- [ ] **Offline mode**: Complete quest offline → Syncs when online
- [ ] **Multiple devices**: Complete quest on Device A → Shows completed on Device B
- [ ] **Quest skip**: User doesn't practice → Quest expires at midnight

---

## ✅ Week 13-14: Achievement System

### Achievement Unlocking
- [ ] **Streak achievement**: Reach 7-day streak → "Week Warrior" badge unlocks
- [ ] **Practice achievement**: Complete 10 practices → "Dedicated Devotee" badge
- [ ] **Mala achievement**: Complete 1 mala → "Mala Beginner" badge
- [ ] **Quest achievement**: Complete 7 quests → "Quest Enthusiast" badge
- [ ] **Unlock modal**: Achievement unlocks → AchievementUnlockedModal shows with animation

### Achievement Progress
- [ ] **Progress display**: AchievementProgressCard shows "7/10 practices"
- [ ] **Near completion**: 2 away from unlock → Card appears on HomeScreen
- [ ] **Multiple unlocks**: Complete practice that unlocks 2 achievements → Both modals show
- [ ] **Badge collection**: Navigate to profile/achievements → All unlocked badges visible

### Achievement Categories
- [ ] **Streak category**: Test 7, 30, 100 day achievements
- [ ] **Practice category**: Test 10, 50, 100, 500 practice achievements
- [ ] **Mala category**: Test 1, 10, 50, 108 mala achievements
- [ ] **Social category** (Week 16): Test 5, 20, 50 friend achievements
- [ ] **Group category** (Week 17): Test "Join group", "Win challenge" achievements

---

## ✅ Week 14: Personalized Feed

### Feed Generation
- [ ] **Dynamic feed**: HomeScreen shows sections in personalized order
- [ ] **Quest priority**: Incomplete quest appears at top of feed
- [ ] **Achievement priority**: Near-complete achievement shows high in feed
- [ ] **Recommended shloka**: Feed includes personalized recommendation
- [ ] **Section variety**: Feed contains 8-10 different sections

### Feed Interaction
- [ ] **Pull-to-refresh**: Swipe down → Feed regenerates with new order
- [ ] **Refresh indicator**: Loading spinner shows during refresh
- [ ] **Section navigation**: Tap section → Navigates to correct screen
- [ ] **Feed caching**: Refresh works offline (shows cached feed)
- [ ] **Auto-refresh**: Return to HomeScreen after 30 min → Feed auto-refreshes

### Feed Analytics
- [ ] **Section views**: Tap sections → Check Firebase for FEED_SECTION_VIEWED events
- [ ] **Feed refresh**: Pull-to-refresh → Check for FEED_REFRESHED event
- [ ] **Section interactions**: Tap recommended shloka → Check for interaction event

---

## ✅ Week 15: Enhanced Recommendations

### ML Recommendation Engine
- [ ] **Morning (6-12)**: Check recommendation at 8 AM → Suggests Gayatri/Surya prayers
- [ ] **Afternoon (12-16)**: Check at 2 PM → Suggests short mantras (5-10 min)
- [ ] **Evening (16-19)**: Check at 6 PM → Suggests Shiva/Devi
- [ ] **Night (19-22)**: Check at 9 PM → Suggests Vishnu Sahasranam/calming
- [ ] **Brahma Muhurta (4-6)**: Check at 5 AM → Suggests Gayatri Mantra

### Recommendation Factors
- [ ] **Deity preference**: Set Shiva as preference → Recommendations bias toward Shiva
- [ ] **Experience level**: Beginner → Short, simple mantras recommended
- [ ] **Practice history**: Practice Gayatri 5 times → Different shloka recommended next
- [ ] **Ekadashi context**: On Ekadashi → Vishnu-related shlokas recommended
- [ ] **Festival context**: On Diwali → Lakshmi prayers recommended

### Recommendation Explanation
- [ ] **"Why this?"**: Recommendation card shows reason (e.g., "Perfect for morning")
- [ ] **Reason accuracy**: Explanation matches actual recommendation logic
- [ ] **Multiple factors**: Complex recommendation shows primary reason
- [ ] **Acceptance tracking**: Start recommended practice → Analytics tracks acceptance

---

## ✅ Week 16: Social Sharing

### Share Modal
- [ ] **Achievement share**: Unlock achievement → Tap share → ShareModal opens
- [ ] **Quest share**: Complete quest → Tap share → ShareModal opens (optional)
- [ ] **Platform options**: Modal shows WhatsApp, Instagram, Messages, More
- [ ] **Share card**: Modal displays shareable card (1200x630)

### Share Card Generation
- [ ] **User info**: Card shows user's name and avatar
- [ ] **Achievement info**: Card displays achievement icon, name, and stats
- [ ] **App branding**: Card includes "Practice with me on Shloka Sadhana" + logo
- [ ] **Referral link**: Card includes referral code and deep link (Week 18)
- [ ] **Image quality**: Generated image is clear, not pixelated

### Share Execution
- [ ] **WhatsApp**: Share to WhatsApp → Card appears in chat
- [ ] **Instagram**: Share to Instagram Stories → Card posts correctly
- [ ] **Native share**: Tap "More" → Native share sheet opens
- [ ] **Share cancel**: Tap outside modal → Modal closes, no share
- [ ] **Analytics**: Share completed → Check SHARE_COMPLETED event

---

## ✅ Week 16: Friend System

### Friend Discovery
- [ ] **Search**: Enter friend's name → Results appear instantly
- [ ] **Search accuracy**: Fuzzy search works (typos handled)
- [ ] **No results**: Search unknown name → "No users found" message
- [ ] **Empty state**: No search query → "Search for friends" placeholder
- [ ] **Profile preview**: Search results show avatar, name, current streak

### Friend Requests
- [ ] **Send request**: Tap "Add Friend" → Request sent, button changes to "Pending"
- [ ] **Receive request**: Friend sends request → Notification badge on Friends tab
- [ ] **Accept request**: Tap "Accept" → Friendship created, moves to Friends list
- [ ] **Decline request**: Tap "Decline" → Request removed, no friendship
- [ ] **Cancel request**: Tap "Cancel" on pending request → Request removed

### Friend List
- [ ] **Friend display**: Friends list shows all friends with current streaks
- [ ] **Streak accuracy**: Friend's streak matches their actual streak
- [ ] **Friend count**: Badge shows correct count (e.g., "Friends (12)")
- [ ] **Empty state**: No friends → "Find friends to practice together" message
- [ ] **Friend profile**: Tap friend → UserProfileScreen opens

### Friend Profile
- [ ] **Profile info**: Shows friend's name, avatar, current streak
- [ ] **Public stats**: Shows total practices, total minutes (if privacy allows)
- [ ] **Privacy settings**: Stats hidden if friend disabled sharing
- [ ] **Unfriend**: Tap "Unfriend" → Confirmation dialog → Friend removed
- [ ] **Navigation**: Back button returns to Friends list

### Friend Edge Cases
- [ ] **Self-add**: Try to add self → Error message "Cannot add yourself"
- [ ] **Duplicate request**: Send request twice → Second attempt shows "Already sent"
- [ ] **Blocked user**: Unfriend + re-add → Works correctly
- [ ] **Offline mode**: Requests queue offline → Sync when online

---

## ✅ Week 17: Activity Feed

### Activity Creation
- [ ] **Practice activity**: Complete practice → Activity posts to friend feeds
- [ ] **Achievement activity**: Unlock achievement → Activity posts
- [ ] **Quest activity**: Complete quest → Activity posts
- [ ] **Milestone activity**: Reach 10th practice → Milestone activity posts
- [ ] **Streak activity**: Achieve 7-day streak → Streak activity posts

### Activity Display
- [ ] **Feed order**: Activities show chronologically (newest first)
- [ ] **Activity details**: Each activity shows user, type, timestamp
- [ ] **Practice details**: Practice activity shows duration and shloka name
- [ ] **Achievement details**: Achievement activity shows badge icon and name
- [ ] **Timestamp accuracy**: "2 hours ago", "Yesterday", "3 days ago" format correct

### Activity Reactions
- [ ] **Add reaction**: Tap 🎉 → Reaction count increments
- [ ] **Change reaction**: Tap 🔥 after 🎉 → Reaction changes
- [ ] **Remove reaction**: Tap same emoji again → Reaction removed
- [ ] **Reaction count**: Shows "12 reactions" when multiple users react
- [ ] **Real-time updates**: Friend reacts → Count updates without refresh

### Activity Feed Performance
- [ ] **Load speed**: Activity feed loads in <1 second
- [ ] **Real-time listener**: New activity appears without manual refresh
- [ ] **Scroll performance**: Smooth scrolling with 50+ activities
- [ ] **Empty state**: No friend activities → "Your friends haven't practiced yet" message

---

## ✅ Week 17: Group System

### Group Creation
- [ ] **Create group**: Tap "Create Group" → CreateGroupScreen opens
- [ ] **Group name**: Enter name (min 3 chars) → Saves correctly
- [ ] **Group description**: Enter description (min 10 chars) → Saves
- [ ] **Privacy setting**: Select public/private → Saves correctly
- [ ] **Validation**: Try submitting with empty fields → Error messages show
- [ ] **Success**: Valid form → Group created, navigates to GroupDetailScreen

### Group Discovery
- [ ] **Discover tab**: Shows list of public groups
- [ ] **Group preview**: Each card shows name, description, member count
- [ ] **Join public group**: Tap "Join" → Immediately added to group
- [ ] **Joined indicator**: Joined groups show "Member" badge
- [ ] **Empty state**: No public groups → "Be the first to create a group!" message

### Group Invites
- [ ] **Invite modal**: Admin taps "Invite" → Shows friend list
- [ ] **Send invite**: Select friends → Invites sent
- [ ] **Receive invite**: Friend invites you → Notification badge appears
- [ ] **Accept invite**: Tap "Accept" → Added to group, invite removed
- [ ] **Decline invite**: Tap "Decline" → Invite removed, not added to group

### Group Detail Screen
- [ ] **Members tab**: Shows all members with join dates and stats
- [ ] **Admin badge**: Group admin has "Admin" badge
- [ ] **Member count**: "12 Members" shows correct count
- [ ] **Stats tab**: Shows aggregate stats (total practices, malas, minutes)
- [ ] **Leave group**: Tap "Leave" → Confirmation → Removed from group

### Group Stats
- [ ] **Practice contribution**: Complete practice → Group stats increment
- [ ] **Real-time updates**: Another member practices → Stats update
- [ ] **Stat accuracy**: Total practices = sum of all member practices
- [ ] **Admin actions**: Admin can remove members (non-admins cannot)

---

## ✅ Week 18: Group Challenges

### Challenge Creation
- [ ] **Create challenge**: Admin taps "Create Challenge" → Modal opens
- [ ] **Challenge types**: 4 types available (practices, malas, minutes, consistency)
- [ ] **Type selection**: Select type → Suggested goal appears
- [ ] **Custom goal**: Enter custom goal → Saves correctly
- [ ] **Duration**: Select 7/14/30 days → Saves correctly
- [ ] **Validation**: Invalid inputs → Error messages show
- [ ] **Success**: Valid challenge → Created, appears in group

### Challenge Display
- [ ] **Active challenge**: GroupDetailScreen shows active challenge prominently
- [ ] **Challenge card**: Shows type, goal, progress, time remaining
- [ ] **User progress**: Shows current user's score and rank
- [ ] **Create limit**: Only 1 active challenge at a time (Create button disabled)

### Challenge Leaderboard
- [ ] **Leaderboard screen**: Tap challenge → ChallengeDetailScreen opens
- [ ] **Real-time rankings**: Leaderboard shows all participants ranked by score
- [ ] **Top 3 highlight**: Ranks 1-3 show medal icons (🥇🥈🥉)
- [ ] **Current user highlight**: Your entry highlighted with special styling
- [ ] **Live updates**: Another member practices → Leaderboard updates without refresh

### Challenge Progress
- [ ] **Practice updates**: Complete practice → Score increments
- [ ] **Rank changes**: Score increases → Rank updates correctly
- [ ] **Progress percentage**: Shows "45% to goal" correctly
- [ ] **Multiple practices**: Multiple practices same day → All count toward challenge

### Challenge Completion
- [ ] **Auto-complete**: Challenge reaches end date → Status changes to "Completed"
- [ ] **Winner announcement**: Top 3 get badges
- [ ] **History**: Completed challenges appear in "Past Challenges" section
- [ ] **Create new**: After completion → Admin can create new challenge

### Challenge Edge Cases
- [ ] **Leave group**: Leave group with active challenge → No longer in leaderboard
- [ ] **Rejoin group**: Rejoin group → Can participate in new challenges
- [ ] **Admin leaves**: Admin leaves → Another member becomes admin
- [ ] **Cancel challenge**: Admin taps "Cancel" → Challenge cancelled, no winners

---

## ✅ Week 18: Referral Program

### Referral Code Generation
- [ ] **Code display**: ReferralScreen shows unique code (e.g., PRIYA2024)
- [ ] **Code format**: Format is FIRSTNAME + 4-digit suffix
- [ ] **Code uniqueness**: Each user has different code
- [ ] **Code persistence**: Code stays same across sessions

### Referral Sharing
- [ ] **Copy code**: Tap "Copy Code" → Code copied, confirmation shows
- [ ] **Share link**: Tap "Share Link" → Native share sheet opens
- [ ] **Share text**: Share message includes code and deep link
- [ ] **Platform share**: Share to WhatsApp → Message includes link correctly
- [ ] **Deep link format**: Link is `shlokasadhana.app/invite/CODE`

### Referral Stats
- [ ] **Total referrals**: Shows count of users who signed up with code
- [ ] **Successful referrals**: Shows count who completed first practice
- [ ] **Pending referrals**: Shows count who signed up but haven't practiced
- [ ] **XP earned**: Shows total XP from referrals (50 per successful)
- [ ] **Stats accuracy**: All counts match actual data

### Referral Leaderboard
- [ ] **Top 10**: Shows top 10 referrers by successful referrals
- [ ] **User rank**: Shows "Your rank: #12" if user is in top 10+
- [ ] **Leaderboard display**: Shows name, successful referrals, XP earned
- [ ] **Empty state**: No referrals yet → "Be the first to invite friends!" message

### Referral Onboarding
- [ ] **Code input**: Onboarding step 2 shows referral code input
- [ ] **Code validation**: Enter valid code → "Continue" button enabled
- [ ] **Invalid code**: Enter invalid code → Error message shows
- [ ] **Skip option**: Tap "Skip for now" → Proceeds without referral code
- [ ] **Pre-filled code**: Open deep link → Code pre-filled in onboarding

### Deep Linking
- [ ] **Deep link open**: Click `shlokasadhana.app/invite/CODE` → App opens
- [ ] **Code storage**: Deep link saves code → Shows in onboarding
- [ ] **App already open**: Click link while app open → Code saved for next signup
- [ ] **Invalid link**: Click malformed link → App handles gracefully (no crash)

### Referral Rewards
- [ ] **Referee reward**: Complete first practice with referral code → 50 XP + badge
- [ ] **Referrer reward**: Referee completes practice → Referrer gets 50 XP
- [ ] **Reward modal**: ReferralRewardModal shows for both users
- [ ] **Milestone badges**:
  - [ ] 5 referrals → "Spiritual Guide" badge 🎯
  - [ ] 10 referrals → "Spiritual Teacher" badge 🏆
  - [ ] 25 referrals → "Spiritual Guru" badge 👑

### Referral Edge Cases
- [ ] **Self-referral**: Try using own code → Error "Cannot use your own code"
- [ ] **Duplicate referral**: Use same code twice → Second attempt fails
- [ ] **Expired code**: User never practices after 30 days → Status = expired
- [ ] **Offline referral**: Sign up offline with code → Syncs when online

---

## ✅ Remote Config Feature Flags

### Flag Loading
- [ ] **Initial load**: App launches → Remote Config initializes
- [ ] **Default values**: Offline mode → Uses hardcoded defaults (all OFF)
- [ ] **Flag values**: Check DebugScreen → All 11 flags show correct ON/OFF state
- [ ] **Fetch interval**: Flags update after 1 hour (or force fetch for testing)

### Flag Toggle
- [ ] **Enable quest**: Set `daily_quests_enabled = true` in Firebase → DailyQuestCard appears
- [ ] **Disable quest**: Set to `false` → DailyQuestCard hidden
- [ ] **Enable friends**: Set `friend_system_enabled = true` → Friends tab appears
- [ ] **Disable friends**: Set to `false` → Friends tab hidden
- [ ] **Gradual rollout**: Test 10% rollout → Only some users see feature

### Flag Updates
- [ ] **App foreground**: Background app → Foreground → Flags refresh automatically
- [ ] **Manual refresh**: Pull-to-refresh on HomeScreen → Flags update
- [ ] **Force fetch**: Trigger force fetch in debug menu → Flags update immediately
- [ ] **Cache behavior**: Offline → Uses last fetched values (not defaults)

---

## 🔄 Cross-Feature Integration Tests

### Quest + Achievement
- [ ] **Quest completion unlocks achievement**: Complete 7 quests → Achievement unlocks
- [ ] **Both modals show**: Quest complete + achievement unlock → Both modals appear in sequence

### Friend + Activity Feed
- [ ] **Practice posts to friends**: Complete practice → Activity appears in friends' feeds
- [ ] **Friend reacts**: Friend adds reaction → You get notification (future feature)

### Group + Challenge
- [ ] **Practice updates both**: Complete practice → Group stats AND challenge score update
- [ ] **Challenge completion**: Complete challenge → Group achievement unlocks

### Referral + Achievement
- [ ] **Referral milestone**: 5th successful referral → "Spiritual Guide" achievement unlocks
- [ ] **Share referral achievement**: Unlock achievement → Can share with referral link

### Remote Config + All Features
- [ ] **All features OFF**: All flags = false → App works (MVP features only)
- [ ] **All features ON**: All flags = true → All Phase 2A features visible
- [ ] **Selective enable**: Enable only quests + friends → Only those features show

---

## 📱 Platform-Specific Tests

### iOS-Specific
- [ ] **App icon badge**: Friend request → Badge count appears on app icon
- [ ] **3D Touch**: Long-press app icon → Quick actions work (future)
- [ ] **Share sheet**: Native share includes iOS apps (Mail, Notes, etc.)
- [ ] **Keyboard**: Keyboard behavior correct in all text inputs
- [ ] **Safe area**: Content respects notch on iPhone X+

### Android-Specific
- [ ] **Back button**: Android back button works in all screens
- [ ] **Share menu**: Native share includes Android apps (Gmail, Drive, etc.)
- [ ] **Keyboard**: Keyboard behavior correct (not covering inputs)
- [ ] **Navigation bar**: Content respects navigation bar height
- [ ] **Material design**: Ripple effects on buttons work

---

## 🌐 Network Tests

### Offline Mode
- [ ] **Airplane mode on**: Enable airplane mode before app launch
- [ ] **Practice offline**: Complete practice → Saves locally
- [ ] **Quest offline**: Quest progress updates offline
- [ ] **Sync on reconnect**: Go online → All data syncs to Firestore
- [ ] **Graceful degradation**: Social features show "Offline" messages

### Poor Network
- [ ] **Slow 3G**: Simulate slow network → App remains usable
- [ ] **Timeout handling**: API timeout → Shows error, doesn't crash
- [ ] **Retry logic**: Failed request → Retries automatically

### Sync Conflicts
- [ ] **Multi-device**: Practice on Device A and B offline → Both sync when online
- [ ] **Conflict resolution**: Conflicting data → Most recent wins (or merge logic)

---

## ♿ Accessibility Tests

### Screen Reader
- [ ] **VoiceOver (iOS)**: Enable VoiceOver → All screens navigable
- [ ] **TalkBack (Android)**: Enable TalkBack → All screens navigable
- [ ] **Button labels**: All buttons have clear labels (not "Button")
- [ ] **State announcements**: Quest completion → Screen reader announces

### Keyboard Navigation
- [ ] **Tab order**: Tab key follows logical order (top to bottom, left to right)
- [ ] **Focus indicators**: Focused elements show visible outline
- [ ] **Modal traps**: Focus stays within modal (can't tab to background)
- [ ] **Escape key**: Modal closes on Escape (hardware keyboard)

### Visual Accessibility
- [ ] **Font scaling**: Enable large text → All text scales correctly
- [ ] **Color contrast**: All text has 4.5:1 contrast ratio minimum
- [ ] **Focus visible**: All interactive elements show focus state

---

## 🐛 Issues Found

### Critical (App-breaking)
1. _____________________________________________________
2. _____________________________________________________
3. _____________________________________________________

### High (Feature doesn't work)
1. _____________________________________________________
2. _____________________________________________________
3. _____________________________________________________

### Medium (Feature works but has issues)
1. _____________________________________________________
2. _____________________________________________________
3. _____________________________________________________

### Low (Visual/polish issues)
1. _____________________________________________________
2. _____________________________________________________
3. _____________________________________________________

---

## 📊 Test Summary

**Total Tests**: 200+
**Passed**: _____ / _____
**Failed**: _____ / _____
**Skipped**: _____ / _____

**Overall Status**: ✅ PASS / ❌ FAIL

**Ready for Beta**: YES / NO

**Tester Notes**:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

**Tester Signature**: _______________  **Date**: _______________
