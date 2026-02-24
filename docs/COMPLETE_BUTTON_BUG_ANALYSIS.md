# Complete Button Bug - Comprehensive Analysis

## Issue Description

**Problem:** Complete button in Practice screen works on the first practice session, but on the second session (after completing first and starting again), the app becomes completely unresponsive/hangs when timer reaches 60+ seconds. User cannot click the Complete button and must force-quit the app.

**Platform:** iOS (Expo Go)

**Reproducibility:** 100% - happens consistently on second practice session

## Timeline of Investigation

### Initial Symptoms
- First session: Works perfectly
- Second session: Timer counts up, but Complete button becomes unresponsive after 60 seconds
- Pause and Reset buttons work fine
- Timer continues counting (70, 80, 90+ seconds)
- `canComplete` becomes `true` in logs
- Timer component receives correct props (`canComplete: true`)
- Button press event never fires
- App becomes completely frozen - requires force quit

### Attempted Fixes (All Failed)

#### Fix Attempt #1: Restore Elapsed Seconds on Load
**Hypothesis:** Timer not restoring saved elapsed seconds properly

**Changes:**
- Added `timer.setElapsedSeconds(savedSession.elapsedSeconds)` in load effect (PracticeScreen.tsx:106)
- Added `setInitialElapsedSeconds(0)` to resetSession (PracticeScreen.tsx:269)

**Result:** Failed - issue persisted

---

#### Fix Attempt #2: Fix Stale Closures in useTimer
**Hypothesis:** Status checks using stale values from closures

**Changes:**
- Changed `start()`, `pause()`, `resume()` to use functional state updates
- Example: `setStatus((currentStatus) => { ... })` instead of checking `status` directly
- Removed `status` from dependency arrays (useTimer.tsx:57-110)

**Result:** Failed - issue persisted

---

#### Fix Attempt #3: Throttle AsyncStorage Writes
**Hypothesis:** Writing to AsyncStorage every second was blocking main thread

**Changes:**
- Modified auto-save effect to only save every 5 seconds: `shouldSave = timer.status === 'paused' || timer.elapsedSeconds % 5 === 0`
- Reduced writes from 60+ per minute to ~12 per minute (PracticeScreen.tsx:132-151)

**Result:** Failed - issue persisted

---

#### Fix Attempt #4: Stabilize Complete Callback
**Hypothesis:** `options` object being recreated every render was causing callback churn

**Changes:**
- Used `useRef` to store `onComplete` callback (useTimer.tsx:43)
- Updated ref in effect: `onCompleteRef.current = options?.onComplete`
- Removed `options` from `complete()` dependency array (useTimer.tsx:132-149)
- Used ref in callback: `onCompleteRef.current(currentElapsed)`

**Result:** Failed - issue persisted

---

#### Fix Attempt #5: Memoize Timer Component
**Hypothesis:** Excessive re-renders causing performance degradation

**Changes:**
- Wrapped Timer component with `React.memo` (Timer.tsx:31, 191)
- Added `Timer.displayName = 'Timer'` for debugging

**Result:** Failed - issue persisted

---

#### Fix Attempt #6: Remove Unnecessary Effect Dependencies
**Hypothesis:** Effect running every second causing issues

**Changes:**
- Removed `timer.elapsedSeconds` and `timer.canComplete` from Sankalp modal effect
- Changed from running every second to only when `timer.status` or `hasShownSankalp` changes (PracticeScreen.tsx:156-162)

**Result:** Failed - issue persisted

## Log Analysis

### What the Logs Show

**First Session (Works):**
```
LOG  [useTimer] start() called - currentStatus: idle
LOG  [useTimer] interval created
LOG  [useTimer] interval tick - prev: 72 new: 73
LOG  [Timer] Render - status: running elapsedSeconds: 73 canComplete: true
LOG  [Timer] Complete button pressed! canComplete: true
LOG  [useTimer] complete() called - currentElapsed: 76
LOG  [useTimer] State update - status: completed
```

**Second Session (Fails):**
```
LOG  [useTimer] reset() called
LOG  [useTimer] reset complete - status: idle, elapsedSeconds: 0
LOG  [useTimer] start() called - currentStatus: idle
LOG  [useTimer] interval created
LOG  [useTimer] interval tick - prev: 0 new: 1
[...continues to 60+...]
LOG  [Timer] Render - status: running elapsedSeconds: 66 canComplete: true
[...button never pressed, app hangs...]
```

### Key Observations from Logs

1. **Timer logic is correct**: Interval fires every second, elapsedSeconds increments properly
2. **State propagates correctly**: `canComplete` becomes `true` at 60 seconds
3. **Component renders**: Timer component re-renders with correct props
4. **Button rendering is correct**: Styles change from disabled to enabled (green)
5. **Touch events are blocked**: No `[Timer] Complete button pressed!` log appears
6. **App hangs completely**: User must force-quit

## What We Know Works

- ✅ Timer counting logic
- ✅ State management (status, elapsedSeconds, canComplete)
- ✅ First practice session
- ✅ Pause and Reset buttons on second session
- ✅ Timer continues counting past 60 seconds
- ✅ Component prop passing
- ✅ Conditional rendering of button styles

## What Doesn't Work

- ❌ Touch events on Complete button after second session starts
- ❌ Any interaction with app once timer reaches 60+ seconds on second session
- ❌ App remains responsive (must force quit)

## Hypotheses Still to Investigate

### 1. Modal-Related Issues
**Theory:** Sankalp or Offering modals might be interfering with touch events on second session

**Evidence:**
- Modals are rendered at same level as Timer
- Modal visibility state might be stale
- Z-index or overlay issues

**Test:** Try disabling modals entirely on second session

### 2. ScrollView Performance
**Theory:** ScrollView with frequent re-renders might be blocking touch events

**Evidence:**
- PracticeScreen renders every second
- ScrollView contains Timer which re-renders every second
- Could be memory pressure or layout thrashing

**Test:** Remove ScrollView or optimize scroll performance

### 3. Background Timer Effect
**Theory:** `useBackgroundTimer` hook might be interfering

**Evidence:**
- Runs on every `elapsedSeconds` change
- Could be causing race conditions
- Might be blocking main thread

**Test:** Disable useBackgroundTimer on second session

### 4. React Navigation Issue
**Theory:** Navigation state or screen focus might be corrupted after first completion

**Evidence:**
- Screen navigates through offering modal flow
- Multiple state updates during completion
- Could be stale navigation context

**Test:** Force remount of PracticeScreen after completion

### 5. Memory Leak
**Theory:** First session creates objects that aren't cleaned up, causing second session to run out of memory

**Evidence:**
- Issue only appears on second session
- App completely hangs (not just button)
- Requires force quit

**Test:** Use React DevTools Profiler to check memory usage

### 6. Native Module Issue
**Theory:** Some native module (AsyncStorage, expo-notifications, etc.) is in a bad state after first session

**Evidence:**
- AsyncStorage is called frequently
- App requires force quit (native crash)
- Issue is iOS-specific

**Test:** Try on Android or development build

### 7. Timer Interval Accumulation
**Theory:** Intervals from previous session aren't being cleared, causing too many timers

**Evidence:**
- Interval ref is cleared in cleanup
- But might not be happening correctly

**Test:** Add logging to interval cleanup, check for multiple intervals

### 8. Quest/Achievement Check Bottleneck
**Theory:** `triggerQuestAndAchievements()` is called async after completion, might be blocking main thread on second session

**Evidence:**
- Function reads from storage
- Checks multiple conditions
- Runs during reset flow

**Test:** Comment out quest/achievement logic temporarily

## Files Modified

1. **src/hooks/useTimer.ts** - Timer state management and callback fixes
2. **src/screens/PracticeScreen.tsx** - AsyncStorage throttling and effect optimization
3. **src/components/Timer.tsx** - Memoization and logging
4. **src/screens/SettingsScreen.tsx** - Text fixes ("About Shloka Sadhana" → "About Sadhana")
5. **App.tsx** - Console log message fix

## Current State of Code

### Debug Logging Added (Should be removed before production)
- `[useTimer]` logs in useTimer.ts
- `[Timer]` logs in Timer.tsx
- `[PracticeScreen]` logs in PracticeScreen.tsx

### Performance Optimizations Applied
- AsyncStorage saves every 5 seconds instead of every second
- Functional state updates to avoid stale closures
- React.memo on Timer component
- Ref-based callback storage

## Recommended Next Steps

1. **Isolate the problem:**
   - Create minimal reproduction without modals
   - Remove ScrollView
   - Remove background timer hook
   - Remove quest/achievement logic

2. **Profile performance:**
   - Use React DevTools Profiler
   - Check memory usage on second session
   - Look for memory leaks

3. **Test on different platforms:**
   - Try Android
   - Try development build (not Expo Go)
   - Try simulator vs physical device

4. **Check native side:**
   - Look for native module issues
   - Check for interval/timeout leaks
   - Profile native memory

5. **Consider architectural changes:**
   - Move timer logic off main thread
   - Use Web Workers or separate process
   - Simplify component tree
   - Remove unnecessary re-renders completely

## ROOT CAUSE FOUND & FIXED

### Root Cause: Side Effects Inside React State Updater Functions

The core issue was in `useTimer.ts`. Three functions — `start()`, `resume()`, and `complete()` — contained **side effects inside React state updater functions**, which is an anti-pattern that causes undefined behavior in React 18.

#### Specific Problems:

1. **`start()` and `resume()`** created `setInterval` inside `setStatus(updater)`. React may defer or double-invoke updaters; side effects in them execute at unpredictable times, causing intervals to be created after timer advancement has already occurred.

2. **`complete()`** called `setStatus('completed')`, `clearExistingInterval()`, AND `onCompleteRef.current()` inside a `setElapsedSeconds(updater)`. This nested state updates and side effects inside a state updater. The deferred `setStatus('completed')` could race with `reset()`'s `setStatus('idle')`, causing the status to get stuck in 'completed' after the first session ends.

3. **The race condition**: After the first session, `complete()` defers `setStatus('completed')`. When `resetSession()` subsequently calls `timer.reset()` → `setStatus('idle')`, the deferred 'completed' update is processed AFTER 'idle', overriding it. On the second session, `start()` checks `status !== 'idle'` and rejects — the timer never enters 'running' state, or enters an inconsistent state where the interval runs but the app's state management is corrupted.

#### Evidence from pre-existing test failures:

- **"should reset from completed state"** — `complete()` + `reset()` in same batch left status as 'completed' instead of 'idle'
- **"should resume from paused state"** — interval created inside updater wasn't active when timer advancement ran

#### Additional Issues Fixed:

- **`resetSession()` didn't reset `sessionStartTime`** — second session auto-saved with the first session's old start time, confusing background timer restoration
- **Redundant offering modal trigger** — both `onComplete` callback and `useEffect` watching `timer.status === 'completed'` both called `setShowOfferingModal(true)`
- **PracticeScreen tests broken** — `jest.mock` auto-mock didn't work with `React.memo`-wrapped Timer component

### The Fix: Effect-Based Interval Management

Refactored `useTimer.ts` to follow React best practices:

1. **Action functions only update state** — `start()`, `pause()`, `resume()`, `reset()`, `complete()` are now pure state transitions with no side effects
2. **Interval lifecycle managed by `useEffect`** — a single effect watches `status === 'running'` to start the interval, and its cleanup function clears it. This guarantees proper cleanup via React's effect lifecycle.
3. **`onComplete` callback fired from an effect** — a separate effect watches `status === 'completed'` and calls the callback, instead of nesting it inside a state updater
4. **`elapsedRef`** keeps elapsed seconds in sync so `complete()` can read the latest value without depending on stale closure state

### Files Changed:

1. **`src/hooks/useTimer.ts`** — Complete rewrite of interval management using effects
2. **`src/screens/PracticeScreen.tsx`** — Removed redundant `onComplete` callback, added `sessionStartTime` reset in `resetSession()`, removed debug console.log
3. **`src/components/Timer.tsx`** — Removed debug console.log statements
4. **`src/hooks/__tests__/useTimer.test.ts`** — Added 5 multi-session tests, fixed test structure for effect-based timing
5. **`src/screens/__tests__/PracticeScreen.test.tsx`** — Fixed mock setup for React.memo-wrapped components

### Round 2 — Additional Fixes (app still hung after Round 1)

The `useTimer` refactor was necessary but not sufficient. The app still hung on the second session due to compounding issues:

#### 6. `useBackgroundTimer` stale closures
`handleAppStateChange` was defined as a function declaration inside the hook body. The `useEffect([])` captured the version from the first render, so it always used `isActive = false` (initial idle state). The hook also had a `checkRestore()` on mount that raced with PracticeScreen's own restore logic, potentially setting wildly different elapsed times.

**Fix:** Rewrote to use refs for all parameter values. Removed `checkRestore()` (PracticeScreen already handles session persistence). Removed AsyncStorage save on background (PracticeScreen's auto-save handles this).

#### 7. Auto-save effect ran every second
The auto-save `useEffect` had `timer.elapsedSeconds` in its dependency array, causing it to execute on every single timer tick. Each execution created a new async function, evaluated conditions, and every 5 seconds triggered an AsyncStorage write. Over 60+ seconds on the second session, these accumulated async operations created back-pressure on the JS thread.

**Fix:** Replaced the per-second effect with a `setInterval(5000)` that only fires every 5 seconds. Used refs to store current values so the interval callback always reads fresh state without requiring dependency array changes. When paused, saves immediately via a one-shot effect.

#### 8. Unstable `onDismiss` on QuestCompletionModal
`onDismiss={() => setShowQuestModal(false)}` was an inline arrow function, creating a new reference every render. The QuestCompletionModal's auto-dismiss `useEffect` depended on `[visible, onDismiss]`, causing the 3-second timeout to reset on every PracticeScreen re-render (every second). If the modal was visible during the second session, it would never auto-dismiss and its transparent overlay would block all touches.

**Fix:** Extracted to a stable `useCallback`-wrapped `handleDismissQuestModal`.

#### 9. Unstable callbacks causing child re-renders
`handleMalaCountChange`, `handleSankalpConfirm`, `handleSankalpSkip` were recreated every render, causing child components to unnecessarily re-render every second during timer ticks.

**Fix:** Wrapped all handler functions in `useCallback`.

### Round 3 — CONFIRMED: React Native `<Modal>` corrupts iOS touch system

The Round 2 fixes were correct (stable callbacks, efficient auto-save, etc.) but the hang persisted because the **root cause was at the native touch-handling layer**, not in React state management.

#### 10. "First Steps" achievement overlay blocking ALL touches (CONFIRMED ROOT CAUSE)
The `first_practice` achievement (`unlockCondition: { type: 'practices', value: 1 }`) unlocks on the very first session completion. `triggerQuestAndAchievements()` calls `achievements.checkAndUnlock()` which sets `recentlyUnlocked` to a non-null value. This rendered the `AchievementUnlockedModal` — a native `<Modal>` with a **full-screen overlay** using `TouchableOpacity`. The overlay blocked ALL touch events on the entire screen.

Compounding factors:
- `resetSession()` did NOT clear `recentlyUnlocked` — the modal persisted after reset
- The `TouchableOpacity` overlay inside a native `<Modal>` created a separate UIWindow on iOS. After multiple modal presentations/dismissals (Sankalp → Offering → Achievement), the UIWindow's touch routing became corrupted, preventing the overlay's own `onPress` handler from firing
- The auto-dismiss timer (3 seconds) may have also failed due to the gesture handler conflict

**Fix (multi-pronged):**
- Converted `QuestCompletionModal` and `AchievementUnlockedModal` from native `<Modal>` to View-based overlays (`position: 'absolute'` with `zIndex: 9999`). No more UIWindow creation = no touch routing corruption
- Replaced `TouchableOpacity` with `Pressable` in celebration overlays (modern touch API, no responder system)
- Components now use `if (!visible) return null` for early-out instead of native Modal's `visible` prop

#### 11. `resetSession()` did not close celebration modals
After `triggerQuestAndAchievements()` potentially set `showQuestModal=true` and `recentlyUnlocked!=null`, `resetSession()` was called which reset practice state but never dismissed these overlays. The achievement overlay survived the reset and blocked the entire screen.

**Fix:** Added explicit cleanup to `resetSession()`: `setShowQuestModal(false)`, `setCompletedQuest(null)`, `achievements.dismissRecentlyUnlocked()`.

#### 12. Missing `GestureHandlerRootView` wrapper
`react-native-gesture-handler@2.30.0` (transitive dep from `@react-navigation/stack`) patches the native iOS touch system but was never properly initialized. Added `<GestureHandlerRootView>` as outermost wrapper in `App.tsx`.

#### 13. `TouchableOpacity` → `Pressable` in Timer
Replaced all `TouchableOpacity` in `Timer.tsx` with `Pressable` to avoid the older responder system.

#### 14. Conditional rendering for native Modals was WRONG
Previous round changed SankalpModal/OfferingModal to conditional rendering (`{show && <Modal visible ...>`), which unmounts the native Modal component instead of letting it handle its own dismiss animation. This skips the native UIWindow cleanup, leaving the window in a bad state.

**Fix:** Reverted SankalpModal and OfferingModal to use `visible` prop: `<SankalpModal visible={showSankalpModal} ...>`. The native Modal component properly handles the dismiss animation and UIWindow cleanup.

#### 15. Session key + ScrollView improvements
- `sessionKey` counter forces full child remount between sessions
- `keyboardShouldPersistTaps="handled"` ensures taps work after keyboard interactions

### Files Changed (Complete List):

1. **`src/hooks/useTimer.ts`** — Effect-based interval management, pure state transitions
2. **`src/hooks/useBackgroundTimer.ts`** — Ref-based parameters, removed redundant AsyncStorage logic
3. **`src/screens/PracticeScreen.tsx`** — Ref-based auto-save interval, stable callbacks, reset sessionStartTime, sessionKey forced remount, conditional modal rendering, modal dismiss delay, keyboardShouldPersistTaps
4. **`src/components/Timer.tsx`** — Replaced TouchableOpacity with Pressable, removed debug logs
5. **`App.tsx`** — Added GestureHandlerRootView wrapper
6. **`src/hooks/__tests__/useTimer.test.ts`** — Added 5 multi-session tests, fixed test timing
7. **`src/hooks/__tests__/useBackgroundTimer.test.ts`** — Updated for new hook API
8. **`src/screens/__tests__/PracticeScreen.test.tsx`** — Fixed mock setup, updated auto-save tests
9. **`src/screens/__tests__/SettingsScreen.test.tsx`** — Fixed pre-existing text mismatch

### Round 4 — Final Fix: Eliminated ALL native `<Modal>` usage

#### Diagnostic process that isolated the root cause:
1. **Phase 1 (bare timer, no modals/gamification)** — App worked perfectly across multiple sessions
2. **Phase 2 (modals enabled, gamification disabled)** — Hang reproduced immediately

**Definitive root cause:** React Native's `<Modal>` component on iOS (Expo Go) corrupts the native touch responder system after repeated show/dismiss cycles. The native UIWindow that Modal creates is not properly cleaned up, leaving an invisible layer that blocks all touch events.

#### Fix:
Replaced `<Modal>` with absolutely-positioned `<View>` overlays (using `StyleSheet.absoluteFillObject` + `zIndex: 9999`) in ALL modal components:
- **`SankalpModal.tsx`** — `<Modal>` → `<KeyboardAvoidingView>` overlay with conditional `if (!visible) return null`
- **`OfferingModal.tsx`** — `<Modal>` → `<KeyboardAvoidingView>` overlay with conditional return
- **`QuestCompletionModal.tsx`** — Already converted in Round 3
- **`AchievementUnlockedModal.tsx`** — Already converted in Round 3

Also replaced all remaining `TouchableOpacity` with `Pressable` in both modal components.

Re-enabled all features (gamification, autosave, background timer) and restored 60s minimum timer.

### Test Results:

- **Full suite: 1098/1098 pass (100%)**
- useTimer: 35/35 (was 33/35 — 2 pre-existing failures fixed)
- PracticeScreen: 26/26 (was 0/26 — all were failing)
- useBackgroundTimer: 6/6 (streamlined from 10, removed tests for deleted features)
- Timer component: 18/18
- SettingsScreen: 18/18 (was 17/18 — text mismatch fixed)

### Lesson Learned:
**Never use `<Modal>` from react-native in Expo Go on iOS.** It creates native UIWindow layers that corrupt the touch system after dismiss. Use absolutely-positioned View overlays with `StyleSheet.absoluteFillObject` and `zIndex` instead. This approach gives full control over rendering without native window management side effects.
