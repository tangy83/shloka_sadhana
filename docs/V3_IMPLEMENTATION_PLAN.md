# V3 Pre-Launch Implementation Plan
## Shloka Sadhana - Features to Complete Before iOS/Android Release

**Document Version:** 2.0
**Created:** February 6, 2026
**Last Updated:** February 6, 2026
**Status:** Planning Phase
**Target Completion:** 4-6 weeks

---

## Executive Summary

This document outlines the **V3 features** that must be completed before launching Shloka Sadhana on the iOS App Store and Google Play Store.

**Implementation Strategy:** Easiest to hardest - close out quick wins first to build momentum, then tackle complex features.

**Current Status:** 🎉 **ALL 9 CORE FEATURES COMPLETE (100%)!** V3 is LAUNCH-READY! 🚀

**Total Estimated Effort:** 0 days remaining - Ready for App Store/Google Play submission!

---

## V3 Core Features (Pre-Launch) - Ordered by Effort (Easiest First)

| Order | # | Feature | Effort | Type | Dependencies | Status |
|-------|---|---------|--------|------|--------------|--------|
| 1 | 24 | **Sankalp Help/Examples** | 0.5 day | Quick Win | None | ✅ COMPLETE |
| 2 | 13 | **Streak Recovery Message** | 0.5-1 day | Quick Win | None | ✅ COMPLETE |
| 3 | 23 | **Upcoming Festivals List** | 1-2 days | Small | None | ✅ COMPLETE |
| 4 | 22 | **Muhurat on Home (Best Times)** | 1-2 days | Small | None | ✅ COMPLETE |
| 5 | 21 | **Verse of the Day** | 1-2 days | Small | Needs #3 (can do in parallel) | ✅ COMPLETE |
| 6 | 20 | **Daily Shloka Recommendation** | 1-2 days | Small | Needs #3 (can do in parallel) | ✅ COMPLETE |
| 7 | 5 | **OTA Updates (EAS)** | 2-3 days | Medium | None | ✅ COMPLETE |
| 8 | 3 | **Content Metadata & Structure** | 2-3 days | Medium (Foundational) | None | ✅ COMPLETE |
| 9 | 18 | **Background Timer Support** | 2-3 days | Medium | None | ✅ COMPLETE |
| 10 | 2 | **Ekadashi Calendar & Details** | 3-4 days | Large | Needs #3 for recommendations | ✅ COMPLETE |

**Total Remaining:** 🎊 **ZERO! ALL FEATURES COMPLETE!** 🎊

---

## Post-Launch Features (Backlog)

| # | Feature | Effort | Type | Priority | Notes |
|---|---------|--------|------|----------|-------|
| 7 | **Donations & Payments (Stripe)** | 3-5 days | Large | Medium | Moved from V3. Requires backend setup. Can be added post-launch. |
| NEW | **Contact Us / Feedback / Feature Suggestions** | 1-2 days | Small | High | In-app feedback form, contact information, feature request submission. Essential for user engagement post-launch. |

**Backlog Total:** 4-7 days (2 features)

---

## Development Guidelines & Best Practices

**Purpose:** Consolidate all development best practices, coding standards, and quality assurance processes from V2 implementation to ensure smooth V3 development.

**Source:** Derived from V2's 656 passing tests, ISSUES_LOG.md learnings, and established patterns.

---

### 1. Test-Driven Development (TDD) Workflow

**Core Principle:** Write tests BEFORE implementing features. V2 achieved 656 tests with 100% TDD approach.

**Red-Green-Refactor Cycle:**

```
1. RED: Write a failing test
   - Define expected behavior
   - Write test that validates behavior
   - Run test → should FAIL (no implementation yet)

2. GREEN: Write minimal code to pass
   - Implement just enough to make test pass
   - Run test → should PASS
   - Don't optimize yet

3. REFACTOR: Improve code quality
   - Clean up implementation
   - Remove duplication
   - Improve readability
   - Run tests → should still PASS
```

**Example from V2 (useStreak hook):**

```typescript
// STEP 1: RED - Write failing test
it('should start a new streak when completing for the first time', async () => {
  mockStorage.getStreak.mockResolvedValue(null);
  mockStorage.saveStreak.mockResolvedValue();

  const { result } = renderHook(() => useStreak());

  await waitFor(() => expect(result.current.isLoading).toBe(false));

  await act(async () => {
    await result.current.markTodayComplete();
  });

  expect(result.current.currentStreak).toBe(1); // This will fail initially
});

// STEP 2: GREEN - Implement minimal code
export function useStreak() {
  const [currentStreak, setCurrentStreak] = useState(0);

  async function markTodayComplete() {
    setCurrentStreak(1); // Simplest implementation
    await storage.saveStreak({ currentStreak: 1, ... });
  }

  return { currentStreak, markTodayComplete };
}

// STEP 3: REFACTOR - Add full logic, edge cases, etc.
```

**When to Write Tests:**
- ✅ **Always BEFORE implementation** (TDD)
- ✅ **For every function, hook, component**
- ✅ **For edge cases and error handling**
- ✅ **For bug fixes** (regression tests)

**Target for V3:** 700+ tests (44+ new tests across 11 features)

---

### 2. Testing Strategy & Coverage

**Testing Pyramid:**

```
           /\
          /  \  E2E Tests (Detox)
         /----\  - Critical user flows
        /      \  - 3-5 key scenarios
       /--------\
      / Integration\ - Cross-component tests
     /    Tests    \  - Hook + Storage
    /--------------\  - Screen + Navigation
   /                \
  /   Unit Tests     \ - Utils, hooks, components
 /____________________\ - 90%+ of test suite
```

**Test File Structure:**

```
src/
├── hooks/
│   ├── useStreak.ts
│   └── __tests__/
│       └── useStreak.test.ts
├── utils/
│   ├── dateUtils.ts
│   └── __tests__/
│       └── dateUtils.test.ts
├── components/
│   ├── home/
│   │   ├── StreakCard.tsx
│   │   └── __tests__/
│   │       └── StreakCard.test.tsx
```

**Test File Naming:**
- Unit tests: `{filename}.test.ts` or `{filename}.test.tsx`
- Integration tests: `{feature}.integration.test.ts`
- E2E tests: `{flow}.e2e.test.ts` (in `e2e/` directory)

**What to Test:**

**Unit Tests (90% of tests):**
- ✅ Pure functions (utils): All inputs/outputs, edge cases
- ✅ Hooks: State changes, effects, async operations
- ✅ Components: Rendering, props, user interactions, accessibility
- ✅ Data transformations

**Integration Tests (8% of tests):**
- ✅ Hook + Storage (e.g., useStreak + AsyncStorage)
- ✅ Screen + Navigation
- ✅ Component + API calls

**E2E Tests (2% of tests):**
- ✅ Critical user flows:
  - Home → Practice → Complete Session → Streak Updates
  - Home → Library → Detail → Practice
  - Settings → Notification → Save

**Test Coverage Targets:**
- Statements: 85%+
- Branches: 80%+
- Functions: 90%+
- Lines: 85%+

**Run Coverage Report:**
```bash
npm run test:coverage
```

---

### 3. Mock Setup Best Practices (Learned from Issues Log)

**Issue #3 Learning:** Always use explicit factory functions with `jest.mock()`.

**❌ WRONG (leads to undefined mocks):**
```typescript
import * as dateUtils from '../../utils/dateUtils';
jest.mock('../../utils/dateUtils');
const mockGetTodayISO = dateUtils.getTodayISO as jest.MockedFunction<typeof dateUtils.getTodayISO>;
// mockGetTodayISO is undefined!
```

**✅ CORRECT (explicit mock factory):**
```typescript
import { getTodayISO } from '../../utils/dateUtils';

jest.mock('../../utils/dateUtils', () => ({
  getTodayISO: jest.fn(),
}));

const mockGetTodayISO = getTodayISO as jest.MockedFunction<typeof getTodayISO>;

// In tests:
beforeEach(() => {
  jest.clearAllMocks();
  mockGetTodayISO.mockReturnValue('2026-02-05');
});
```

**Mock AsyncStorage:**
```typescript
import { storage } from '../../utils/storage';

jest.mock('../../utils/storage');
const mockStorage = storage as jest.Mocked<typeof storage>;

// In tests:
mockStorage.getStreak.mockResolvedValue({ currentStreak: 5, ... });
```

**Always `jest.clearAllMocks()` in `beforeEach`:**
```typescript
beforeEach(() => {
  jest.clearAllMocks(); // Reset all mocks before each test
});
```

---

### 4. TypeScript Strict Mode Standards

**Configuration:** `tsconfig.json` has strict mode enabled (V2 standard).

**Enforced Rules:**
- `strict: true` - All strict checks
- `noImplicitAny: true` - No implicit any types
- `strictNullChecks: true` - Null/undefined must be explicit
- `noUnusedLocals: true` - No unused variables
- `noUnusedParameters: true` - No unused parameters
- `noImplicitReturns: true` - All code paths must return
- `noFallthroughCasesInSwitch: true` - Explicit break/return in switches

**Type Safety Best Practices:**

**✅ DO:**
```typescript
interface Shloka {
  id: string;
  name: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced'; // Union types
  durationMinutes: number;
}

async function getShloka(id: string): Promise<Shloka | null> {
  const data = await storage.getShloka(id);
  return data ?? null; // Explicit null handling
}
```

**❌ DON'T:**
```typescript
function getShloka(id) { // Missing type
  return storage.getShloka(id); // Return type unclear
}
```

**Handling Optional Values:**
```typescript
// Use optional chaining and nullish coalescing
const duration = shloka?.durationMinutes ?? 0;
const tags = shloka?.tags ?? [];

// Type guards for narrowing
if (shloka && shloka.sections) {
  // TypeScript knows shloka.sections is defined here
  return shloka.sections[0];
}
```

**Type-Check Command:**
```bash
npm run type-check
```
Run this before committing to catch type errors.

---

### 5. ESLint Rules & Code Quality

**Configuration:** `.eslintrc.js` (V2 standard)

**Key Rules:**
- `@typescript-eslint/no-unused-vars`: Error (with `_` prefix ignore)
- `react/react-in-jsx-scope`: Off (React 17+)
- `react-native/no-inline-styles`: Warn
- `react-native/no-color-literals`: Warn
- `react-native/no-raw-text`: Off

**Linting Command:**
```bash
npm run lint
```

**Auto-Fix:**
```bash
npx eslint . --ext .ts,.tsx --fix
```

**Pre-Commit Checklist:**
- [ ] `npm run lint` → No errors
- [ ] `npm run type-check` → No errors
- [ ] `npm test` → All tests passing

---

### 6. ISSUES_LOG.md - Bug Tracking Protocol

**Purpose:** Document EVERY issue, error, or unexpected behavior during development.

**Rules (from ISSUES_LOG.md):**
1. Log EVERY issue, no matter how small
2. Append-only (never delete entries)
3. Include context, root cause, and fix
4. Use auto-incrementing issue numbers

**Template:**
```markdown
### Issue #X: [Brief Description]
**Date:** YYYY-MM-DD HH:MM
**Feature:** [Feature being implemented]
**Phase:** [Red/Green/Refactor/Manual Testing]
**Platform:** [iOS/Android/Both/N/A]
**Encountered During:** [Specific step]

**Problem:**
[Detailed description of what went wrong]

**Root Cause:**
[Why it happened - be specific]

**Fix Applied:**
[How it was resolved - include code snippets if relevant]

**Prevention:**
[How to avoid this in future implementations]

**Related Files:**
- [List of files modified/affected]

**Test Impact:**
- Tests failed: [count]
- Tests fixed: [count]
- New tests added: [count]

---
```

**When to Log:**
- ❌ Test fails unexpectedly
- ❌ Runtime error in development
- ❌ Build fails
- ❌ Dependency incompatibility
- ❌ Unexpected behavior (even if fixed quickly)
- ❌ Configuration issues

**Key Learnings from V2 Issues:**
- **Issue #1:** Expo SDK 54 needs `import.meta` and `structuredClone` polyfills in Jest
- **Issue #2:** `sentry-expo` v7.0.1 has `__extends` runtime errors in Expo Go (deferred)
- **Issue #3:** Always use explicit `jest.mock()` factory functions
- **Issue #4:** Metro needs custom `tslib` alias for Hermes compatibility

**After Fixing an Issue:**
1. Log it in ISSUES_LOG.md
2. Write a regression test
3. Update documentation if pattern is common

---

### 7. File Naming & Structure Conventions

**File Naming:**
- **Components:** PascalCase - `StreakCard.tsx`, `DailyRecommendation.tsx`
- **Hooks:** camelCase with `use` prefix - `useStreak.ts`, `useBackgroundTimer.ts`
- **Utils:** camelCase - `dateUtils.ts`, `shlokaRecommendations.ts`
- **Types:** PascalCase - `Shloka`, `PracticeSession`
- **Constants:** UPPER_SNAKE_CASE - `DAY_DEITY_MAP`, `SANKALP_EXAMPLES`
- **Tests:** Match source file - `useStreak.test.ts`, `StreakCard.test.tsx`

**Directory Structure:**
```
src/
├── components/
│   ├── common/          # Reusable UI components
│   ├── home/            # Home screen components
│   ├── library/         # Library screen components
│   └── modals/          # Modal components
├── screens/             # Screen components
├── navigation/          # React Navigation setup
├── hooks/               # Custom React hooks
│   └── __tests__/
├── utils/               # Utility functions
│   └── __tests__/
├── data/                # Static data (JSON)
├── types/               # TypeScript type definitions
├── constants/           # Constants (colors, labels, maps)
└── __tests__/           # Root-level tests (sanity, setup)
```

**Import Path Aliases:**
- Use `@/` for absolute imports from `src/`
- Example: `import { storage } from '@/utils/storage';`

---

### 8. Git Workflow & Commit Messages

**Branch Naming:**
- Features: `feature/sankalp-help`, `feature/ekadashi-calendar`
- Bugfixes: `fix/streak-calculation`, `fix/timer-background`
- Refactors: `refactor/recommendation-engine`

**Commit Message Format:**
```
<type>(<scope>): <subject>

<body - optional>

<footer - optional>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `test`: Add/update tests
- `refactor`: Code refactoring (no behavior change)
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `chore`: Maintenance (dependencies, build config)

**Examples:**
```
feat(home): add daily shloka recommendation component

- Implements getRecommendedShloka() with day-of-week logic
- Adds DailyRecommendation.tsx component
- Includes 15 unit tests

Closes #3
```

```
fix(timer): persist elapsed time on app background

- Adds useBackgroundTimer hook with AppState listener
- Saves active practice to AsyncStorage on background
- Restores elapsed time on foreground return

Fixes #42
```

```
test(streak): add edge case tests for streak calculation

- Test streak breaks after missing day
- Test no double-counting if practiced today
- Test longest streak updates correctly
```

**Commit Frequency:**
- Commit after each TDD cycle (Red → Green → Refactor)
- Commit when tests pass (Green phase)
- Small, focused commits (one feature/fix per commit)

---

### 9. Code Review Standards

**Before Requesting Review:**
- [ ] All tests passing (`npm test`)
- [ ] No linting errors (`npm run lint`)
- [ ] No type errors (`npm run type-check`)
- [ ] Code formatted consistently
- [ ] No `console.log` statements (use proper logging)
- [ ] No commented-out code
- [ ] Updated ISSUES_LOG.md if bugs encountered
- [ ] Added tests for new features (TDD)

**Review Checklist (Reviewer):**
- [ ] Tests cover all edge cases
- [ ] No performance issues (unnecessary re-renders, memory leaks)
- [ ] TypeScript types are accurate (no `any`)
- [ ] Error handling is comprehensive
- [ ] Accessibility labels present (screen readers)
- [ ] Dark theme styles correct
- [ ] No hardcoded strings (use constants or i18n)
- [ ] AsyncStorage keys follow convention (`@shloka_sadhana:*`)

---

### 10. Regression Testing Protocol

**Daily Regression Tests:**
```bash
npm test
```
- Run full test suite after each feature
- Ensure all 656 V2 tests still pass (no regressions)
- V3 target: 700+ tests passing

**Weekly Full App Testing:**
- Test on iOS simulator (iPhone 15 Pro)
- Test on Android emulator (Pixel 7)
- Test on physical iPhone (if available)
- Test on physical Android (if available)

**Critical User Flows (Manual Testing):**
1. **Home → Practice → Complete:**
   - Open app → See streak
   - Tap "Begin Practice"
   - Start timer, count chants
   - Complete session
   - Verify streak increments

2. **Library → Detail → Practice:**
   - Browse library
   - Tap shloka (e.g., Hanuman Chalisa)
   - View verses, meanings
   - Tap "Start Practice"
   - Practice and complete

3. **Background Timer:**
   - Start practice session
   - Press Home button (background app)
   - Wait 30 seconds
   - Return to app
   - Verify elapsed time accurate

4. **Settings → Notifications:**
   - Enable notifications
   - Set reminder time
   - Verify notification scheduled

**Regression Test Suites:**
- `npm test` - All unit tests
- Manual flows - Critical paths
- Device testing - iOS & Android
- Accessibility audit - VoiceOver & TalkBack

---

### 11. Performance Standards

**Targets:**
- App launch (cold start): < 2 seconds
- Screen navigation: < 300ms
- Recommendation engine: < 100ms
- AsyncStorage reads: < 50ms
- UI interactions: < 16ms (60 FPS)

**Performance Testing Tools:**
- React DevTools Profiler (check for unnecessary re-renders)
- Flipper (network, storage inspection)
- Xcode Instruments (iOS memory/CPU)
- Android Studio Profiler (Android memory/CPU)

**Optimization Best Practices:**
- Use `React.memo()` for expensive components
- Use `useMemo()` and `useCallback()` appropriately (not excessively)
- Avoid inline functions in render (causes re-renders)
- Lazy load screens with `React.lazy()` (future enhancement)
- Optimize images (use WebP, compress)

---

### 12. Accessibility Standards (WCAG 2.1 Level AA)

**Requirements:**
- ✅ All interactive elements have accessibility labels
- ✅ Color contrast ratio ≥ 4.5:1 (text) and ≥ 3:1 (UI components)
- ✅ Touch targets ≥ 44x44 points
- ✅ Screen reader support (VoiceOver, TalkBack)
- ✅ Dynamic type support (font scaling)

**Accessibility Labels:**
```tsx
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Start practice session"
  accessibilityHint="Begins timer and mala counter"
  accessibilityRole="button"
  onPress={handleStartPractice}
>
  <Text>Begin Practice</Text>
</TouchableOpacity>
```

**Testing Accessibility:**
- iOS: Enable VoiceOver (Settings → Accessibility → VoiceOver)
- Android: Enable TalkBack (Settings → Accessibility → TalkBack)
- Test navigation with screen reader (all screens)
- Test font scaling (Settings → Display → Text Size → Larger)

---

### 13. Daily Development Checklist

**Start of Day:**
- [ ] Pull latest changes: `git pull origin main`
- [ ] Install dependencies: `npm install` (if package.json changed)
- [ ] Run tests: `npm test` (ensure starting clean)

**During Development:**
- [ ] Follow TDD: Red → Green → Refactor
- [ ] Write tests BEFORE implementation
- [ ] Log issues in ISSUES_LOG.md immediately
- [ ] Commit after each Green phase

**End of Day:**
- [ ] Run full test suite: `npm test`
- [ ] Run linter: `npm run lint`
- [ ] Run type-check: `npm run type-check`
- [ ] Commit all changes (clean working directory)
- [ ] Push to remote: `git push origin <branch>`

**Weekly:**
- [ ] Review ISSUES_LOG.md for patterns
- [ ] Update test coverage report
- [ ] Device testing (iOS + Android)
- [ ] Demo completed features to team

---

### 14. Key Commands Reference

**Development:**
```bash
npm start                # Start Expo dev server
npm run ios              # Run on iOS simulator
npm run android          # Run on Android emulator
```

**Testing:**
```bash
npm test                 # Run all tests (single run)
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report
```

**Code Quality:**
```bash
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript compiler (no emit)
```

**Debugging:**
```bash
npx react-devtools       # Open React DevTools
```

---

### 15. Summary - V3 Development Standards

**Core Principles from V2 Success (656 tests passing):**
1. ✅ **TDD Always** - Tests before implementation
2. ✅ **TypeScript Strict** - No implicit any, null checks
3. ✅ **Log All Issues** - ISSUES_LOG.md for every bug
4. ✅ **Mock Explicitly** - Use factory functions with jest.mock()
5. ✅ **Test Exhaustively** - Unit, integration, E2E
6. ✅ **No Regressions** - All V2 tests must pass
7. ✅ **Accessibility First** - WCAG AA, VoiceOver/TalkBack tested
8. ✅ **Performance Monitored** - <2s launch, 60 FPS UI

**V3 Quality Targets:**
- 700+ tests passing (44+ new tests) - **This is a MINIMUM baseline, not a restriction. Write as many tests as needed for comprehensive coverage. Quality over arbitrary limits.**
- 0 regressions from V2
- 85%+ code coverage
- 0 TypeScript errors
- 0 ESLint errors
- WCAG 2.1 AA compliance
- <2s app launch time

**Non-Negotiables:**
- ❌ No code without tests
- ❌ No commits with failing tests
- ❌ No TypeScript `any` types
- ❌ No accessibility violations
- ❌ No unlogged issues
- ❌ No inconsistent naming (check existing patterns FIRST)

---

### 16. Naming Consistency Protocol - CRITICAL

**Problem:** Creating variables, components, functions, or files with new names without checking existing codebase patterns leads to inconsistency and costly refactoring.

**The Issue:**
```typescript
// ❌ BAD: You create a new component without checking existing code
export function RecommendationCard() { ... }

// Later you discover the codebase already uses:
export function DailyRecommendation() { ... }

// Now you have to refactor everything - tests, imports, file names!
```

**The Solution: ALWAYS Check Before Creating**

**BEFORE writing any new code, do this:**

1. **Search for Similar Patterns:**
   ```bash
   # Search for existing naming patterns
   grep -r "Recommendation" src/
   grep -r "Daily" src/
   grep -r "useStreak\|usePractice\|useTimer" src/hooks/
   ```

2. **Check Existing File Naming:**
   ```bash
   # List similar components
   ls src/components/home/
   ls src/utils/
   ls src/hooks/
   ```

3. **Review Existing Interfaces/Types:**
   ```typescript
   // Check src/types/ for existing patterns
   // If you see: interface PracticeSession { ... }
   // Don't create: interface SessionPractice { ... }
   // Use the existing pattern!
   ```

**Checklist Before Creating New Code:**

- [ ] **Check naming pattern** - Search codebase for similar concepts
- [ ] **Check file structure** - Look at similar files in same directory
- [ ] **Check existing types** - Review `src/types/` for related interfaces
- [ ] **Check existing constants** - Review `src/constants/` for naming style
- [ ] **Check existing utils** - Look for similar utility functions
- [ ] **Check existing hooks** - Look for similar custom hooks

**Common Inconsistencies to Avoid:**

**Variable Naming:**
```typescript
// ❌ INCONSISTENT
const streakData = ...
const practiceInfo = ...
const sessionDetails = ...

// ✅ CONSISTENT (pick one pattern and stick to it)
const streakData = ...
const practiceData = ...
const sessionData = ...
```

**Component Naming:**
```typescript
// ❌ INCONSISTENT
<StreakCard />
<PracticeComponent />
<SessionView />

// ✅ CONSISTENT (all use same suffix pattern)
<StreakCard />
<PracticeCard />
<SessionCard />
```

**Function Naming:**
```typescript
// ❌ INCONSISTENT
function getStreak() { ... }
function fetchPracticeData() { ... }
function retrieveSession() { ... }

// ✅ CONSISTENT (all use same verb)
function getStreak() { ... }
function getPractice() { ... }
function getSession() { ... }
```

**Hook Naming:**
```typescript
// ❌ INCONSISTENT
function useStreak() { ... }
function practiceHook() { ... }
function timerLogic() { ... }

// ✅ CONSISTENT (all follow use* convention)
function useStreak() { ... }
function usePractice() { ... }
function useTimer() { ... }
```

**AsyncStorage Keys:**
```typescript
// ❌ INCONSISTENT
'@shloka_sadhana:streak'
'SHLOKA_PRACTICE_DATA'
'session-info'

// ✅ CONSISTENT (follow established pattern)
'@shloka_sadhana:streak'
'@shloka_sadhana:practice'
'@shloka_sadhana:session'
```

**Real Example from V2:**
```typescript
// Existing pattern in codebase:
const { currentStreak, longestStreak } = useStreak();
const { sessions } = usePractice();

// ❌ WRONG: Creating inconsistent naming
const { streakCurrent, streakLongest } = useStreakData();

// ✅ RIGHT: Follow existing pattern
const { currentStreak, longestStreak } = useStreak();
```

**When Adding to Existing Code:**

**Before:**
```typescript
// Step 1: Read the existing file
const shloka = getShlokaById(id);

// Step 2: Check the naming pattern used
// They use: getShlokaById, getShlokaByCategory, etc.

// Step 3: Follow the same pattern for your new function
const festivals = getFestivalsByMonth(month); // ✅ Consistent!

// ❌ DON'T create: const festivals = retrieveMonthFestivals(month);
```

**Refactoring Due to Inconsistency is Costly:**

If you create inconsistent names, you'll have to:
1. Rename the variable/component/function
2. Update all imports across multiple files
3. Update all tests
4. Update all type definitions
5. Update documentation
6. Re-run full test suite
7. **Log the issue in ISSUES_LOG.md** (wasted time!)

**Prevention > Refactoring:**
- **2 minutes** to check existing patterns
- **2 hours** to refactor after creating inconsistent names

**Commands to Find Patterns:**
```bash
# Before creating a new streak-related function:
grep -r "streak" src/ --include="*.ts" --include="*.tsx" | grep "function\|const.*="

# Before creating a new component:
ls src/components/home/

# Before creating a new hook:
ls src/hooks/

# Before creating a new type:
grep -r "interface.*Shloka\|type.*Shloka" src/types/
```

**Best Practice:**
> **"Look before you code"** - Always review existing patterns before creating new variables, components, functions, or files. Consistency is maintainability.

**Add to Daily Checklist:**
- [ ] Before creating ANY new code, search for similar existing patterns
- [ ] Use `grep`, `ls`, or IDE search to find naming conventions
- [ ] Match the existing style exactly (casing, verbs, suffixes)
- [ ] When in doubt, ask team or check recent PRs

**If You Find Inconsistency in Existing Code:**
1. Don't add to the inconsistency
2. Pick the MOST COMMON pattern
3. Follow that pattern for new code
4. Optionally: Create a refactoring task to fix old inconsistencies (low priority)

---

## Implementation Phases

### 🎯 Phase 1: Quick Wins (Days 1-2) - Ship 2 Features Fast!

**Goal:** Build momentum by shipping 2 features in 2 days

---

#### 1.1 Sankalp Help/Examples ⚡ (0.5 day - DAY 1 MORNING)
**Priority:** HIGH - Improves onboarding
**Dependencies:** None
**Effort:** 0.5 day (3-4 hours)

**What to Build:**
Add "What's a sankalp?" help text and optional example sankalpas in the SankalpModal to guide new users.

**Tasks:**
- [ ] **Morning (2-3 hours): Add Help Text**
  - [ ] Open `SankalpModal.tsx` component
  - [ ] Add "What's a sankalp?" link or (?) icon button
  - [ ] Create help text (2-3 sentences):
    ```
    A sankalp is a heartfelt intention you set before practice.
    It dedicates your practice to a person, cause, or your own spiritual growth.
    You can skip if you prefer.
    ```
  - [ ] Add collapsible section or modal for explanation
  - [ ] Add first-time-only full explanation (show once, then link only)
  - [ ] Store `sankalp_explanation_seen` in AsyncStorage
  - [ ] Test: First open shows full explanation, subsequent opens show link only

- [ ] **Afternoon (2-3 hours): Example Sankalpas (Optional but Recommended)**
  - [ ] Create `@/constants/SankalpExamples.ts`:
    ```typescript
    export const SANKALP_EXAMPLES = {
      personal: [
        "For my spiritual growth and inner peace",
        "For strength and courage to face today's challenges"
      ],
      family: [
        "For the health and happiness of my family",
        "For my parents' well-being and long life"
      ],
      universal: [
        "For world peace and the welfare of all beings",
        "For the end of suffering for all living creatures"
      ],
      spiritual: [
        "As an offering to the Divine",
        "For deeper connection with the Supreme"
      ]
    };
    ```
  - [ ] Add "Need inspiration?" button in SankalpModal
  - [ ] Show category-based examples in expandable section or bottom sheet
  - [ ] Add "Use this" button for each example (pre-fills text field)
  - [ ] Still allow custom text input
  - [ ] Write tests for help text and example selection
  - [ ] Run `npm test` - ensure all tests pass

**Acceptance Criteria:**
- ✅ "What's a sankalp?" help available in modal
- ✅ First-time users see full explanation automatically
- ✅ Returning users can tap link to see help again
- ✅ 5+ example sankalpas by category (personal, family, universal, spiritual)
- ✅ "Use this" quick-select works and pre-fills text
- ✅ All existing sankalp tests still pass

**Files to Create/Edit:**
- Edit: `src/components/modals/SankalpModal.tsx`
- Create: `src/constants/SankalpExamples.ts`
- Edit: `src/utils/storage.ts` (for `sankalp_explanation_seen` key)

---

#### 1.2 Streak Recovery Message ⚡ (0.5-1 day - DAY 1 AFTERNOON + DAY 2 MORNING)
**Priority:** MEDIUM - Retention feature
**Dependencies:** None
**Effort:** 0.5-1 day (4-6 hours)

**What to Build:**
Show an encouraging message on HomeScreen when a user's streak breaks, motivating them to start again.

**Tasks:**
- [ ] **Afternoon Day 1 (2-3 hours): Detection Logic**
  - [ ] Create `@/utils/streakRecovery.ts`:
    ```typescript
    import AsyncStorage from '@react-native-async-storage/async-storage';

    const LAST_BROKEN_KEY = '@shloka_sadhana:last_streak_broken';

    export async function shouldShowRecoveryMessage(
      currentStreak: number,
      longestStreak: number
    ): Promise<boolean> {
      // Only show if streak is broken (0) and user had a streak before (longestStreak > 0)
      if (currentStreak > 0 || longestStreak === 0) return false;

      // Optional: Show only once per break (check last shown date)
      const lastShown = await AsyncStorage.getItem(LAST_BROKEN_KEY);
      const today = new Date().toISOString().split('T')[0];

      return lastShown !== today; // Show once per day when broken
    }

    export async function markRecoveryMessageShown(): Promise<void> {
      const today = new Date().toISOString().split('T')[0];
      await AsyncStorage.setItem(LAST_BROKEN_KEY, today);
    }
    ```
  - [ ] Write tests for `shouldShowRecoveryMessage()` with different scenarios:
    - Current streak 0, longest 7 → should show
    - Current streak 5, longest 10 → should NOT show
    - Current streak 0, longest 0 → should NOT show (never had streak)

- [ ] **Morning Day 2 (2-3 hours): UI Implementation**
  - [ ] Open `HomeScreen.tsx`
  - [ ] Import `useStreak` hook to get `currentStreak` and `longestStreak`
  - [ ] Import `shouldShowRecoveryMessage` and `markRecoveryMessageShown`
  - [ ] Add state: `const [showRecovery, setShowRecovery] = useState(false);`
  - [ ] In `useEffect`, check if message should show:
    ```typescript
    useEffect(() => {
      async function checkRecovery() {
        const show = await shouldShowRecoveryMessage(currentStreak, longestStreak);
        setShowRecovery(show);
      }
      checkRecovery();
    }, [currentStreak, longestStreak]);
    ```
  - [ ] Add recovery message card/banner component (below streak display):
    ```tsx
    {showRecovery && (
      <RecoveryMessageCard
        longestStreak={longestStreak}
        onDismiss={async () => {
          await markRecoveryMessageShown();
          setShowRecovery(false);
        }}
      />
    )}
    ```
  - [ ] Create `RecoveryMessageCard` component:
    - Copy: "Your best was **{longestStreak} days** – you can reach it again. Start a new streak today! 🙏"
    - Style: Warm colors (orange/gold), not red/alarming
    - Optional: Dismissible X button (calls `onDismiss`)
    - Accessible label: "Streak recovery encouragement"
  - [ ] Style consistently with HomeScreen theme (dark mode)
  - [ ] Write component tests
  - [ ] Run full test suite

**Acceptance Criteria:**
- ✅ Message shows when `currentStreak === 0` and `longestStreak > 0`
- ✅ Message displays longest streak number prominently
- ✅ Message does NOT show when `longestStreak === 0` (never had streak)
- ✅ Message shows only once per day when broken (not repeatedly)
- ✅ Tone is encouraging and supportive, not guilt-inducing
- ✅ Optional: Dismissible (user can hide until tomorrow)
- ✅ Accessible (screen reader announces message)
- ✅ All tests passing

**Files to Create/Edit:**
- Create: `src/utils/streakRecovery.ts`
- Create: `src/components/home/RecoveryMessageCard.tsx`
- Edit: `src/screens/HomeScreen.tsx`
- Create: `src/utils/__tests__/streakRecovery.test.ts`

---

### 🚀 Phase 2: Small Features (Days 2-6) - Cultural Depth

**Goal:** Add spiritual content features using existing infrastructure

---

#### 2.1 Upcoming Festivals List (1-2 days - DAYS 2-3)
**Priority:** MEDIUM - Cultural depth
**Dependencies:** None (uses existing `festivalCalendar.ts`)
**Effort:** 1-2 days

**What to Build:**
Display next 2-4 weeks of Hindu festivals on HomeScreen to keep users connected to spiritual calendar.

**Tasks:**
- [ ] **Day 2 Afternoon (3-4 hours): Festival Data & Logic**
  - [ ] Open `@/utils/festivalCalendar.ts` (verify it exists)
  - [ ] Implement or verify `getUpcomingFestivals(fromDate, count)` function:
    ```typescript
    export function getUpcomingFestivals(
      fromDate: Date = new Date(),
      count: number = 5
    ): Festival[] {
      const allFestivals = loadFestivals(); // from festivals.json
      const upcoming = allFestivals
        .filter(f => new Date(f.date) >= fromDate)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, count);
      return upcoming;
    }
    ```
  - [ ] Verify `@/data/festivals.json` has data for 2026:
    - Maha Shivaratri, Holi, Ram Navami, Hanuman Jayanti
    - Navaratri (both), Diwali, etc.
    - Each festival: `{ name, date, significance, deity }`
  - [ ] Write tests for `getUpcomingFestivals()`:
    - Mock current date, verify correct festivals returned
    - Test sorting (earliest first)
    - Test count limit (returns max 5)
    - Test empty state (no upcoming festivals)

- [ ] **Day 3 Morning (3-4 hours): UI Implementation**
  - [ ] Create `@/components/home/UpcomingFestivals.tsx` component
  - [ ] Fetch festivals in `useEffect`:
    ```typescript
    const [festivals, setFestivals] = useState<Festival[]>([]);

    useEffect(() => {
      const upcoming = getUpcomingFestivals(new Date(), 5);
      setFestivals(upcoming);
    }, []);
    ```
  - [ ] Render card/list on HomeScreen:
    - Header: "Upcoming Festivals 🪔"
    - List format (3-5 festivals):
      - "**Maha Shivaratri** – Mar 8, 2026"
      - "**Holi** – Mar 25, 2026"
    - Font: Medium weight for festival name, regular for date
    - Icon: Optional small deity icon or emoji
  - [ ] Empty state: "No upcoming festivals in the next month"
  - [ ] Add to HomeScreen (below Paanchang or Muhurat section)
  - [ ] Optional: Tap to view detail (navigate to FestivalDetail or show modal) - defer to V3.1
  - [ ] Refresh at midnight (use same midnight refresh as Paanchang)
  - [ ] Write component tests
  - [ ] Verify accessibility (each festival item has semantic label)

**Acceptance Criteria:**
- ✅ Home displays next 3-5 festivals (name + date)
- ✅ List sorted by date (soonest first)
- ✅ Data comes from existing `festivalCalendar.ts` and `festivals.json`
- ✅ Dates accurate for 2026 Hindu calendar
- ✅ Empty state shown when no festivals in next 30 days
- ✅ Refreshes daily at midnight
- ✅ Accessible (screen reader reads festival names and dates)
- ✅ All tests passing

**Files to Create/Edit:**
- Edit: `src/utils/festivalCalendar.ts` (verify/add `getUpcomingFestivals`)
- Create: `src/components/home/UpcomingFestivals.tsx`
- Edit: `src/screens/HomeScreen.tsx` (add component)
- Verify: `src/data/festivals.json` (2026 data)

---

#### 2.2 Muhurat on Home - Best Times (1-2 days - DAYS 3-4)
**Priority:** MEDIUM - Cultural depth
**Dependencies:** None (uses existing `muhurat.ts`)
**Effort:** 1-2 days

**What to Build:**
Display auspicious times (Brahma Muhurta, Abhijit, Rahu Kaal) on Home with activity labels, **location-aware and timezone-accurate**.

**Tasks:**
- [ ] **Day 3 Afternoon (3-4 hours): Location & Timezone Logic**
  - [ ] Install location library: `npx expo install expo-location`
  - [ ] Create `@/utils/location.ts`:
    ```typescript
    import * as Location from 'expo-location';
    import AsyncStorage from '@react-native-async-storage/async-storage';

    const LOCATION_KEY = '@shloka_sadhana:user_location';
    const DEFAULT_LOCATION = { latitude: 28.6139, longitude: 77.2090 }; // Delhi

    export interface UserLocation {
      latitude: number;
      longitude: number;
      timezone: string;
      city?: string;
    }

    export async function getUserLocation(): Promise<UserLocation> {
      // Check if user has set location in settings
      const stored = await AsyncStorage.getItem(LOCATION_KEY);
      if (stored) return JSON.parse(stored);

      // Try to get device location (with permission)
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          return { ...DEFAULT_LOCATION, timezone: 'Asia/Kolkata' };
        }

        const location = await Location.getCurrentPositionAsync({});
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        return {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          timezone
        };
      } catch (error) {
        // Fallback to default
        return { ...DEFAULT_LOCATION, timezone: 'Asia/Kolkata' };
      }
    }

    export async function setUserLocation(location: UserLocation): Promise<void> {
      await AsyncStorage.setItem(LOCATION_KEY, JSON.stringify(location));
    }
    ```
  - [ ] Update `@/utils/muhurat.ts` to accept location and timezone:
    ```typescript
    export function getMuhuratForDate(
      date: Date,
      location: { latitude: number; longitude: number },
      timezone: string = 'Asia/Kolkata'
    ): MuhuratTimes {
      // Calculate sunrise/sunset for location
      const { sunrise, sunset } = calculateSunTimes(date, location, timezone);

      // Calculate Brahma Muhurta (1.5 hours before sunrise)
      const brahmaMuhurta = {
        start: new Date(sunrise.getTime() - 90 * 60 * 1000),
        end: sunrise
      };

      // Calculate Abhijit Muhurta (noon ± 24 min)
      const noon = new Date(date);
      noon.setHours(12, 0, 0, 0);
      const abhijitMuhurat = {
        start: new Date(noon.getTime() - 24 * 60 * 1000),
        end: new Date(noon.getTime() + 24 * 60 * 1000)
      };

      // Calculate Rahu Kaal (day-dependent, location-aware)
      const rahuKaal = calculateRahuKaal(date, sunrise, sunset);

      return { brahmaMuhurta, abhijitMuhurat, rahuKaal };
    }
    ```
  - [ ] Implement or verify `calculateSunTimes()` using `suncalc` library:
    - `npm install suncalc`
    - Use SunCalc to get accurate sunrise/sunset for location
  - [ ] Write tests for location-aware calculations

- [ ] **Day 4 Morning (2-3 hours): Activity Labels**
  - [ ] Create `@/constants/MuhuratLabels.ts`:
    ```typescript
    export const MUHURAT_ACTIVITIES = {
      brahmaMuhurta: {
        title: 'Best for Spiritual Practice',
        description: 'Meditation, chanting, yoga, study',
        icon: '🕉️',
        color: '#FF9800' // Orange
      },
      abhijitMuhurat: {
        title: 'Best for Important Tasks',
        description: 'Work, decisions, buying, new ventures',
        icon: '⭐',
        color: '#4CAF50' // Green
      },
      rahuKaal: {
        title: 'Avoid for New Ventures',
        description: 'Not ideal for starting new things',
        icon: '⚠️',
        color: '#9E9E9E', // Gray (neutral, not red)
        tone: 'gentle' // Non-alarming
      }
    };
    ```

- [ ] **Day 4 Afternoon (2-3 hours): UI Implementation**
  - [ ] Create `@/components/home/MuhuratTimes.tsx` component
  - [ ] Fetch muhurat times in `useEffect`:
    ```typescript
    const [muhurat, setMuhurat] = useState<MuhuratTimes | null>(null);

    useEffect(() => {
      async function loadMuhurat() {
        const location = await getUserLocation();
        const times = getMuhuratForDate(new Date(), location, location.timezone);
        setMuhurat(times);
      }
      loadMuhurat();
    }, []);
    ```
  - [ ] Add "Auspicious Times Today" section to HomeScreen (inside or below PaanchangCard)
  - [ ] Display 2-3 muhurat times with activity labels:
    ```
    🕉️ Best for practice: 5:30–6:00 AM (Brahma Muhurta)
    ⭐ Best for important tasks: 11:36 AM–12:24 PM (Abhijit)
    ⚠️ Avoid for new ventures: 3:00–4:30 PM (Rahu Kaal)
    ```
  - [ ] Format times in 12-hour format with AM/PM
  - [ ] Use activity descriptions from `MuhuratLabels`
  - [ ] Refresh at midnight
  - [ ] Write component tests

- [ ] **Day 4 (Optional): Settings Integration**
  - [ ] Add "Location" setting in SettingsScreen:
    - Auto-detect (default)
    - Manual entry (city or lat/long)
    - Show current location: "Delhi, India (detected)"
  - [ ] Add toggle: "Show Rahu Kaal" (on/off, default: on)
  - [ ] Save preferences to AsyncStorage
  - [ ] Update muhurat display based on settings

**Acceptance Criteria:**
- ✅ Home displays at least 2 muhurat times (Brahma and Abhijit)
- ✅ Each muhurat labeled by activity (practice, tasks, etc.)
- ✅ **Times are location-aware** (uses device location or default)
- ✅ **Times are timezone-accurate** (calculates for user's timezone)
- ✅ Sunrise/sunset calculated correctly for location using SunCalc
- ✅ Rahu Kaal shown with gentle "avoid" language (optional toggle)
- ✅ Refreshes daily at midnight
- ✅ Copy is clear, concise, respectful
- ✅ Optional: Settings allow changing location
- ✅ All tests passing

**Files to Create/Edit:**
- Install: `expo-location`, `suncalc`
- Create: `src/utils/location.ts`
- Edit: `src/utils/muhurat.ts` (add location/timezone params)
- Create: `src/constants/MuhuratLabels.ts`
- Create: `src/components/home/MuhuratTimes.tsx`
- Edit: `src/screens/HomeScreen.tsx` (add component)
- Optional Edit: `src/screens/SettingsScreen.tsx` (location settings)

---

#### 2.3 Verse of the Day (1-2 days - DAYS 5-6)
**Priority:** MEDIUM - Focus feature
**Dependencies:** Content Metadata (#3) - can implement in parallel, metadata will enhance later
**Effort:** 1-2 days

**What to Build:**
For multi-verse shlokas, highlight one "Verse of the Day" to help users focus on a single verse.

**Tasks:**
- [ ] **Day 5 (3-4 hours): Verse Selection Logic**
  - [ ] Create `@/utils/verseOfTheDay.ts`:
    ```typescript
    import { Shloka, ShlokaSection } from '@/types/shloka';

    function hashCode(str: string): number {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return Math.abs(hash);
    }

    export function getVerseOfTheDay(
      shloka: Shloka,
      date: Date = new Date()
    ): ShlokaSection | null {
      if (!shloka.sections || shloka.sections.length === 0) return null;
      if (shloka.sections.length === 1) return shloka.sections[0];

      // Deterministic selection based on date + shlokaId
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
      const seed = `${dateStr}-${shloka.id}`;
      const index = hashCode(seed) % shloka.sections.length;

      return shloka.sections[index];
    }
    ```
  - [ ] Write tests for `getVerseOfTheDay()`:
    - Test with multi-verse shloka (Hanuman Chalisa, Vishnu Sahasranam)
    - Test with single-verse shloka (Gayatri)
    - Test determinism (same date + shloka = same verse)
    - Test different dates (should select different verses)

- [ ] **Day 6 (3-4 hours): UI Implementation - Option A (Home)**
  - [ ] Create `@/components/home/VerseOfTheDay.tsx`
  - [ ] Fetch verse for "recommended shloka" or chosen shloka:
    ```typescript
    const [verse, setVerse] = useState<ShlokaSection | null>(null);
    const [shloka, setShloka] = useState<Shloka | null>(null);

    useEffect(() => {
      // Get recommended shloka (from Phase 2.5) or default to Hanuman Chalisa
      const recommendedShloka = getRecommendedShloka(...) || getShlokaById('hanuman-chalisa');
      const todaysVerse = getVerseOfTheDay(recommendedShloka);

      setShloka(recommendedShloka);
      setVerse(todaysVerse);
    }, []);
    ```
  - [ ] Display verse card on HomeScreen:
    - Header: "Verse of the Day ✨"
    - Subheader: "From {shloka.name}"
    - Sanskrit text (larger font)
    - Transliteration (italic)
    - Meaning (regular)
    - Tap to view full shloka (navigate to ShlokaDetailScreen)
  - [ ] Style: Prominent card, beautiful typography
  - [ ] Add to HomeScreen (below Daily Recommendation or as separate card)

- [ ] **Day 6 (Alternate): UI Implementation - Option B (ShlokaDetail)**
  - [ ] Edit `ShlokaDetailScreen.tsx`
  - [ ] Highlight "Verse of the day" at top of verse list:
    - Badge: "⭐ Verse of the Day"
    - Expanded by default
    - Other verses collapsed
  - [ ] Add subtle highlighting (border or background color)

- [ ] **Day 6: Testing**
  - [ ] Write component tests
  - [ ] Test verse changes daily (mock different dates)
  - [ ] Test tap navigation to ShlokaDetail
  - [ ] Verify accessibility

**Acceptance Criteria:**
- ✅ One verse per day selected deterministically (same for all users on same day)
- ✅ Displays Sanskrit, transliteration, and meaning
- ✅ Available on Home or ShlokaDetail (or both - choose one for MVP)
- ✅ Labeled "Verse of the Day" clearly
- ✅ Tapping navigates to full shloka (ShlokaDetailScreen)
- ✅ Changes daily at midnight
- ✅ Single-verse shlokas handled (show that one verse)
- ✅ Accessible (screen reader reads verse)
- ✅ All tests passing

**Files to Create/Edit:**
- Create: `src/utils/verseOfTheDay.ts`
- Create: `src/components/home/VerseOfTheDay.tsx` (Option A)
- OR Edit: `src/screens/ShlokaDetailScreen.tsx` (Option B)
- Edit: `src/screens/HomeScreen.tsx` (add component for Option A)

---

#### 2.4 Daily Shloka Recommendation (1-2 days - DAYS 6-7)
**Priority:** HIGH - Engagement
**Dependencies:** Content Metadata (#3) - can implement basic version now, enhance with metadata later
**Effort:** 1-2 days

**What to Build:**
"Today's Recommendation" on Home that suggests a shloka based on day of week, with smart logic coming later from metadata.

**Tasks:**
- [ ] **Day 6 Afternoon (3-4 hours): Basic Recommendation Logic**
  - [ ] Create `@/utils/shlokaRecommendations.ts` (simple version for now):
    ```typescript
    import { Shloka } from '@/types/shloka';
    import { getAllShlokas } from '@/data/shlokas';

    type DayOfWeek = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

    function getDayOfWeek(date: Date = new Date()): DayOfWeek {
      const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      return days[date.getDay()];
    }

    // Simple day-of-week mapping (will be enhanced by metadata in Phase 3.2)
    const DAY_SHLOKA_MAP: Record<DayOfWeek, string> = {
      sunday: 'gayatri-mantra', // Universal
      monday: 'vishnu-sahasranam', // Future: Shiva content
      tuesday: 'hanuman-chalisa', // Hanuman's day
      wednesday: 'gayatri-mantra', // Universal
      thursday: 'vishnu-sahasranam', // Vishnu's day
      friday: 'vishnu-sahasranam', // Future: Lakshmi content
      saturday: 'hanuman-chalisa' // Hanuman's day
    };

    export function getDailyRecommendation(date: Date = new Date()): Shloka | null {
      const day = getDayOfWeek(date);
      const shlokaId = DAY_SHLOKA_MAP[day];

      const allShlokas = getAllShlokas();
      return allShlokas.find(s => s.id === shlokaId) || allShlokas[0];
    }

    export function getRecommendationReason(date: Date = new Date()): string {
      const day = getDayOfWeek(date);
      const reasons: Record<DayOfWeek, string> = {
        sunday: 'Universal mantra for all days',
        monday: 'Auspicious for spiritual practice',
        tuesday: 'Tuesday is Hanuman\'s day',
        wednesday: 'Universal mantra for all days',
        thursday: 'Thursday is Vishnu\'s day',
        friday: 'Auspicious for devotion',
        saturday: 'Saturday is Hanuman\'s day'
      };
      return reasons[day];
    }
    ```
  - [ ] Write tests for day-based recommendations

- [ ] **Day 7 Morning (3-4 hours): UI Implementation**
  - [ ] Create `@/components/home/DailyRecommendation.tsx`
  - [ ] Fetch recommendation in `useEffect`:
    ```typescript
    const [recommended, setRecommended] = useState<Shloka | null>(null);
    const [reason, setReason] = useState<string>('');

    useEffect(() => {
      const shloka = getDailyRecommendation();
      const reasonText = getRecommendationReason();
      setRecommended(shloka);
      setReason(reasonText);
    }, []);
    ```
  - [ ] Add "Today's Recommendation" card on HomeScreen (prominent placement, top of content area)
  - [ ] Display:
    - Header: "Today's Recommendation 🙏"
    - Shloka name (large, bold): "Hanuman Chalisa"
    - Deity: "Lord Hanuman"
    - Duration: "10 min"
    - Reason: "Tuesday is Hanuman's day"
    - Benefits: "Courage & Strength" (from shloka description)
    - Button: "Start Practice" → navigates to ShlokaDetailScreen
  - [ ] Style: Eye-catching card with primary color accent
  - [ ] Tap anywhere on card opens ShlokaDetailScreen

- [ ] **Day 7 Afternoon (1-2 hours): Testing & Polish**
  - [ ] Test recommendation changes daily:
    - Mock different days (Tuesday → Hanuman, Thursday → Vishnu)
  - [ ] Test navigation to ShlokaDetail
  - [ ] Test with missing shloka (fallback to first shloka)
  - [ ] Write component tests
  - [ ] Verify accessibility

**Acceptance Criteria:**
- ✅ "Today's Recommendation" displayed prominently on Home
- ✅ Recommendation based on day-of-week (Tuesday → Hanuman, Thursday → Vishnu)
- ✅ Shows shloka name, deity, duration, reason, benefits
- ✅ Tapping anywhere opens ShlokaDetailScreen for that shloka
- ✅ Changes daily at midnight (deterministic per day)
- ✅ Fallback works (if shloka missing, show first available)
- ✅ Accessible (screen reader reads recommendation)
- ✅ All tests passing
- ✅ NOTE: Will be enhanced with metadata (Ekadashi, festivals, user history) in Phase 3.2

**Files to Create/Edit:**
- Create: `src/utils/shlokaRecommendations.ts`
- Create: `src/components/home/DailyRecommendation.tsx`
- Edit: `src/screens/HomeScreen.tsx` (add component at top)

---

### ⚙️ Phase 3: Medium Features (Days 8-13) - Infrastructure

**Goal:** Build critical technical infrastructure (OTA, metadata, background timer)

---

#### 3.1 OTA Updates - EAS Update (2-3 days - DAYS 8-10)
**Priority:** CRITICAL - Enables post-launch fixes
**Dependencies:** None
**Effort:** 2-3 days

**What to Build:**
Set up Expo's Over-The-Air (OTA) update system to push JavaScript and content updates without app store review.

**Tasks:**
- [ ] **Day 8 (4-6 hours): EAS Setup & Configuration**
  - [ ] Install EAS CLI globally: `npm install -g eas-cli`
  - [ ] Login to Expo: `eas login`
  - [ ] Initialize EAS: `eas init` (if not already done)
  - [ ] Configure updates: `eas update:configure`
  - [ ] Update `app.json` with update configuration:
    ```json
    {
      "expo": {
        "updates": {
          "enabled": true,
          "checkAutomatically": "ON_LOAD",
          "fallbackToCacheTimeout": 0,
          "url": "https://u.expo.dev/[your-project-id]"
        },
        "runtimeVersion": {
          "policy": "sdkVersion"
        }
      }
    }
    ```
  - [ ] Create `eas.json` for update channels:
    ```json
    {
      "build": {
        "production": {
          "channel": "production"
        },
        "preview": {
          "channel": "preview"
        }
      }
    }
    ```
  - [ ] Set up 3 update channels: `production`, `staging`, `preview`
  - [ ] Test publishing first update: `eas update --branch preview --message "Test OTA update"`
  - [ ] Verify update appears in Expo dashboard

- [ ] **Day 9 (4-6 hours): Update Flow Implementation**
  - [ ] Install updates library: `npx expo install expo-updates`
  - [ ] Create `@/utils/updates.ts`:
    ```typescript
    import * as Updates from 'expo-updates';

    export async function checkForUpdates(): Promise<{
      isAvailable: boolean;
      manifest?: Updates.Manifest;
    }> {
      try {
        const update = await Updates.checkForUpdateAsync();
        return {
          isAvailable: update.isAvailable,
          manifest: update.manifest
        };
      } catch (error) {
        console.error('Error checking for updates:', error);
        return { isAvailable: false };
      }
    }

    export async function fetchAndApplyUpdate(): Promise<boolean> {
      try {
        const { isNew } = await Updates.fetchUpdateAsync();
        if (isNew) {
          await Updates.reloadAsync(); // Apply update (restarts app)
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error fetching update:', error);
        return false;
      }
    }
    ```
  - [ ] Update `App.tsx` or root `_layout.tsx`:
    ```typescript
    import { useEffect } from 'react';
    import { checkForUpdates, fetchAndApplyUpdate } from '@/utils/updates';

    export default function App() {
      useEffect(() => {
        async function handleUpdates() {
          // Skip in development
          if (__DEV__) return;

          const { isAvailable } = await checkForUpdates();
          if (isAvailable) {
            // Download in background
            await fetchAndApplyUpdate();
            // Update will apply on next restart (automatic)
          }
        }

        handleUpdates();
      }, []);

      return <RootNavigator />;
    }
    ```
  - [ ] Test update check on app launch (use preview channel)
  - [ ] Verify offline mode works (no crash if no network)

- [ ] **Day 10 (4-6 hours): Testing & Rollout Strategy**
  - [ ] Test update flow on iOS simulator:
    1. Build app with `eas build --platform ios --profile preview`
    2. Install on simulator
    3. Publish update: `eas update --branch preview --message "Test update"`
    4. Close and reopen app
    5. Verify update downloads and applies
  - [ ] Test update flow on Android emulator (same steps)
  - [ ] Test on physical device (TestFlight or internal testing track)
  - [ ] Document rollout process:
    ```bash
    # Step 1: Preview (internal testing)
    eas update --branch preview --message "Bug fix: XYZ"

    # Step 2: Staging (beta users)
    eas update --branch staging --message "Bug fix: XYZ"

    # Step 3: Production (all users, staged rollout)
    eas update --branch production --message "Bug fix: XYZ"
    ```
  - [ ] Document rollback process:
    ```bash
    # Rollback to previous update
    eas update:rollback --branch production
    ```
  - [ ] Test staged rollout (10% → 100%) in Expo dashboard
  - [ ] Set up monitoring for update success/failure rates (optional)

**Acceptance Criteria:**
- ✅ EAS Update configured and working
- ✅ App checks for updates on launch (in production builds only)
- ✅ Updates download in background (non-blocking)
- ✅ Updates apply on next app restart (automatic)
- ✅ Offline mode works (app doesn't crash if no network)
- ✅ Three update channels set up (production, staging, preview)
- ✅ Rollout process documented (preview → staging → production)
- ✅ Rollback process documented and tested
- ✅ Tested on iOS simulator, Android emulator, and physical device
- ✅ No crashes or errors in update flow

**Files to Create/Edit:**
- Install: `expo-updates`
- Create: `src/utils/updates.ts`
- Edit: `App.tsx` or `app/_layout.tsx` (add update check)
- Edit: `app.json` (update configuration)
- Create/Edit: `eas.json` (channel configuration)

**Documentation:**
- Document OTA workflow in README or separate DEPLOYMENT.md
- Include rollback procedures
- Include testing checklist

---

#### 3.2 Content Metadata & Structure (2-3 days - DAYS 10-12)
**Priority:** CRITICAL - Powers recommendations
**Dependencies:** None (foundational)
**Effort:** 2-3 days

**What to Build:**
Add rich metadata to shloka data model to power smart recommendations, filtering, and personalization.

**Tasks:**
- [ ] **Day 10 Afternoon (3-4 hours): Data Model Extension**
  - [ ] Edit `@/types/shloka.ts` and extend `Shloka` interface:
    ```typescript
    type DayOfWeek = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

    interface Shloka {
      // ... existing fields (id, name, deity, description, etc.)

      // NEW: Day of week recommendations
      recommendedDays?: DayOfWeek[]; // e.g., ['tuesday', 'saturday'] for Hanuman

      // NEW: Festival associations
      associatedFestivals?: string[]; // e.g., ['hanuman-jayanti', 'ram-navami']

      // NEW: Ekadashi relevance
      ekadashiRelevant?: boolean; // true for Vishnu/Krishna shlokas

      // NEW: Difficulty level
      difficulty: 'beginner' | 'intermediate' | 'advanced';

      // NEW: Duration (explicit)
      durationMinutes: number; // e.g., 3, 10, 25
      durationCategory: 'quick' | 'medium' | 'long'; // <5min, 5-15min, 15+min

      // NEW: Practice type
      practiceType: 'mantra' | 'stotra' | 'chalisa' | 'sahasranama' | 'suktam';

      // NEW: Tradition/lineage
      tradition?: 'vaishnava' | 'shaiva' | 'shakta' | 'smartha' | 'universal';

      // NEW: Tags for search and filtering
      tags: string[]; // e.g., ['courage', 'strength', 'obstacles', 'devotion']

      // NEW: Recommended for (use cases)
      recommendedFor: string[]; // e.g., ['morning', 'evening', 'before-sleep', 'fasting-days']
    }
    ```
  - [ ] Create `@/constants/DayDeityMap.ts`:
    ```typescript
    export const DAY_DEITY_MAP = {
      sunday: { deity: 'Surya (Sun)', color: '#FF5722' },
      monday: { deity: 'Shiva', color: '#9C27B0' },
      tuesday: { deity: 'Hanuman', color: '#FF9800' },
      wednesday: { deity: 'Vishnu/Ganesha', color: '#2196F3' },
      thursday: { deity: 'Vishnu/Guru', color: '#FFC107' },
      friday: { deity: 'Lakshmi/Devi', color: '#E91E63' },
      saturday: { deity: 'Hanuman/Shani', color: '#FF9800' }
    };
    ```

- [ ] **Day 11 (6-8 hours): Populate Metadata for Existing Shlokas**
  - [ ] Edit `@/data/shlokas.ts` (or `shlokas.json`) and add metadata to all 3 shlokas:
    ```typescript
    // Hanuman Chalisa
    {
      id: 'hanuman-chalisa',
      name: 'Hanuman Chalisa',
      deity: 'Hanuman',
      recommendedDays: ['tuesday', 'saturday'],
      associatedFestivals: ['hanuman-jayanti'],
      ekadashiRelevant: false,
      difficulty: 'beginner',
      durationMinutes: 10,
      durationCategory: 'medium',
      practiceType: 'chalisa',
      tradition: 'universal',
      tags: ['courage', 'strength', 'obstacles', 'devotion', 'protection'],
      recommendedFor: ['morning', 'anytime', 'challenges'],
      // ... existing fields
    }

    // Vishnu Sahasranam
    {
      id: 'vishnu-sahasranam',
      name: 'Vishnu Sahasranam',
      deity: 'Vishnu',
      recommendedDays: ['thursday'],
      associatedFestivals: ['vaikuntha-ekadashi', 'vishnu-jayanti'],
      ekadashiRelevant: true,
      difficulty: 'intermediate',
      durationMinutes: 25,
      durationCategory: 'long',
      practiceType: 'sahasranama',
      tradition: 'vaishnava',
      tags: ['peace', 'protection', 'spiritual-growth', 'ekadashi', 'vishnu'],
      recommendedFor: ['morning', 'before-sleep', 'ekadashi', 'fasting-days'],
      // ... existing fields
    }

    // Gayatri Mantra
    {
      id: 'gayatri-mantra',
      name: 'Gayatri Mantra',
      deity: 'Universal (Savitri)',
      recommendedDays: [], // Any day
      associatedFestivals: [],
      ekadashiRelevant: false,
      difficulty: 'beginner',
      durationMinutes: 3,
      durationCategory: 'quick',
      practiceType: 'mantra',
      tradition: 'universal',
      tags: ['wisdom', 'clarity', 'illumination', 'beginner-friendly', 'universal'],
      recommendedFor: ['morning', 'sandhya', 'sunrise', 'sunset', 'daily'],
      // ... existing fields
    }
    ```
  - [ ] Verify TypeScript compiles with no errors
  - [ ] Run tests to ensure no breakage: `npm test`

- [ ] **Day 12 (4-6 hours): Enhanced Recommendation Engine**
  - [ ] Update `@/utils/shlokaRecommendations.ts` (replace simple version from Phase 2.4):
    ```typescript
    interface RecommendationContext {
      currentDay: DayOfWeek;
      isEkadashi: boolean;
      upcomingFestival?: string; // festival ID
      userLevel?: 'beginner' | 'intermediate' | 'advanced';
      preferredDuration?: 'quick' | 'medium' | 'long';
      userHistory?: string[]; // Recently practiced shloka IDs
    }

    export function getRecommendedShloka(
      context: RecommendationContext
    ): Shloka | null {
      const allShlokas = getAllShlokas();

      // Priority 1: Upcoming festival (within 3 days)
      if (context.upcomingFestival) {
        const festivalMatch = allShlokas.filter(s =>
          s.associatedFestivals?.includes(context.upcomingFestival!)
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

      let candidates = dayShlokas.length ? dayShlokas : allShlokas;

      // Filter by user level
      if (context.userLevel) {
        candidates = candidates.filter(s => s.difficulty === context.userLevel);
      }

      // Filter by duration
      if (context.preferredDuration) {
        candidates = candidates.filter(s => s.durationCategory === context.preferredDuration);
      }

      // Exclude recently practiced (last 7 days)
      if (context.userHistory?.length) {
        candidates = candidates.filter(s => !context.userHistory!.includes(s.id));
      }

      // Fallback to Gayatri (beginner, universal)
      return candidates[0] || allShlokas.find(s => s.id === 'gayatri-mantra') || null;
    }
    ```
  - [ ] Write comprehensive tests for recommendation engine:
    - Test festival priority (Hanuman Jayanti → Hanuman Chalisa)
    - Test Ekadashi priority (Ekadashi → Vishnu Sahasranam)
    - Test day-of-week (Tuesday → Hanuman, Thursday → Vishnu)
    - Test difficulty filtering (beginner only)
    - Test duration filtering (quick only)
    - Test history exclusion (avoid recently practiced)
    - Test fallback (if all filters fail, return Gayatri)

- [ ] **Day 12 Afternoon: Update Daily Recommendation**
  - [ ] Update `DailyRecommendation.tsx` to use enhanced engine:
    ```typescript
    const context: RecommendationContext = {
      currentDay: getDayOfWeek(),
      isEkadashi: checkIfEkadashi(new Date()), // from Ekadashi feature
      upcomingFestival: getNextFestival(new Date(), 3)?.id,
      userLevel: 'beginner', // TODO: get from settings
      userHistory: getRecentSessions(7).map(s => s.shlokaId)
    };
    const recommended = getRecommendedShloka(context);
    ```
  - [ ] Test recommendations with different contexts

**Acceptance Criteria:**
- ✅ Shloka interface extended with 10+ new metadata fields
- ✅ All 3 existing shlokas (Hanuman, Vishnu, Gayatri) have complete metadata
- ✅ `getRecommendedShloka()` implemented with priority logic
- ✅ Recommendation engine handles all contexts (festival, Ekadashi, day, level, duration, history)
- ✅ Day-deity mapping constants defined
- ✅ Comprehensive tests passing (20+ new tests)
- ✅ TypeScript compiles with no errors
- ✅ All existing tests still pass (no regression)
- ✅ Daily Recommendation feature updated to use enhanced engine

**Files to Create/Edit:**
- Edit: `src/types/shloka.ts` (extend interface)
- Create: `src/constants/DayDeityMap.ts`
- Edit: `src/data/shlokas.ts` (add metadata to 3 shlokas)
- Edit: `src/utils/shlokaRecommendations.ts` (enhanced engine)
- Edit: `src/components/home/DailyRecommendation.tsx` (use enhanced engine)
- Create: `src/utils/__tests__/shlokaRecommendations.test.ts`

---

#### 3.3 Background Timer Support (2-3 days - DAYS 12-14)
**Priority:** CRITICAL - Prevents session loss
**Dependencies:** None
**Effort:** 2-3 days

**What to Build:**
Keep timer running (or persist elapsed time) when app is backgrounded so users don't lose sessions.

**Tasks:**
- [ ] **Day 12 Afternoon (2-3 hours): Persistence Logic**
  - [ ] Create `@/hooks/useBackgroundTimer.ts`:
    ```typescript
    import { useEffect, useRef } from 'react';
    import { AppState, AppStateStatus } from 'react-native';
    import { saveActivePractice, loadActivePractice } from '@/utils/practiceStorage';

    export function useBackgroundTimer(
      isActive: boolean,
      elapsedSeconds: number,
      isPaused: boolean,
      onRestore: (elapsed: number) => void
    ) {
      const appState = useRef(AppState.currentState);
      const backgroundTime = useRef<number>(0);

      useEffect(() => {
        const subscription = AppState.addEventListener('change', handleAppStateChange);

        // On mount, check if there's a session to restore
        async function checkRestore() {
          const saved = await loadActivePractice();
          if (saved?.isActive && saved.startTime) {
            const now = Date.now();
            const elapsed = Math.floor((now - saved.startTime) / 1000) - (saved.pausedDuration || 0);
            onRestore(Math.max(0, elapsed));
          }
        }
        checkRestore();

        return () => {
          subscription.remove();
        };
      }, []);

      async function handleAppStateChange(nextAppState: AppStateStatus) {
        // Going to background
        if (appState.current.match(/active/) && nextAppState.match(/inactive|background/)) {
          if (isActive) {
            backgroundTime.current = Date.now();
            await saveActivePractice({
              isActive: true,
              startTime: Date.now() - elapsedSeconds * 1000,
              pausedDuration: isPaused ? elapsedSeconds : 0,
              elapsedSeconds
            });
          }
        }

        // Coming to foreground
        if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
          if (isActive && backgroundTime.current > 0) {
            const timeInBackground = Date.now() - backgroundTime.current;
            if (!isPaused) {
              // Add background time to elapsed (timer was running)
              onRestore(elapsedSeconds + Math.floor(timeInBackground / 1000));
            }
            backgroundTime.current = 0;
          }
        }

        appState.current = nextAppState;
      }
    }
    ```
  - [ ] Update `@/utils/practiceStorage.ts` to include new fields:
    ```typescript
    interface ActivePractice {
      isActive: boolean;
      startTime: number; // timestamp
      pausedDuration: number; // seconds
      elapsedSeconds: number;
      count?: number;
      shlokaId?: string;
      sankalp?: string;
    }
    ```

- [ ] **Day 13 (4-6 hours): Integration with PracticeScreen**
  - [ ] Edit `PracticeScreen.tsx` to use `useBackgroundTimer`:
    ```typescript
    const [elapsed, setElapsed] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isActive, setIsActive] = useState(false);

    useBackgroundTimer(
      isActive,
      elapsed,
      isPaused,
      (restoredElapsed) => {
        setElapsed(restoredElapsed);
      }
    );
    ```
  - [ ] Ensure count (mala counter) is also saved:
    ```typescript
    await saveActivePractice({
      isActive,
      startTime: Date.now() - elapsed * 1000,
      pausedDuration: isPaused ? elapsed : 0,
      elapsedSeconds: elapsed,
      count: malaCount,
      shlokaId: currentShloka?.id,
      sankalp: todaysSankalp
    });
    ```
  - [ ] On session completion, clear saved state:
    ```typescript
    await clearActivePractice();
    ```

- [ ] **Day 14 (4-6 hours): App Termination & Restore**
  - [ ] On app reopen, check for saved session:
    ```typescript
    useEffect(() => {
      async function checkForSavedSession() {
        const saved = await loadActivePractice();
        if (saved?.isActive) {
          // Prompt user: "You have a session in progress. Resume?"
          Alert.alert(
            'Resume Session?',
            'You have an active practice session. Would you like to continue?',
            [
              {
                text: 'No',
                onPress: async () => await clearActivePractice(),
                style: 'cancel'
              },
              {
                text: 'Yes',
                onPress: () => {
                  // Restore session state
                  setElapsed(saved.elapsedSeconds);
                  setMalaCount(saved.count || 0);
                  setSankalp(saved.sankalp || '');
                  setIsActive(true);
                  // Navigate to PracticeScreen if not already there
                }
              }
            ]
          );
        }
      }
      checkForSavedSession();
    }, []);
    ```

- [ ] **Day 14 Afternoon: Testing**
  - [ ] Test backgrounding (Home button) → return → elapsed correct
  - [ ] Test app switching → return → elapsed correct
  - [ ] Test locking device → unlock → elapsed correct
  - [ ] Test pausing → background → return → remains paused
  - [ ] Test app termination (swipe up) → reopen → "Resume?" prompt
  - [ ] Test completing session → no restore on reopen
  - [ ] Write tests (may need E2E with Detox for full coverage)
  - [ ] Verify all existing practice tests still pass

**Acceptance Criteria:**
- ✅ Timer persists when app goes to background
- ✅ Elapsed time accurate when returning (even after minutes)
- ✅ Paused state preserved across background/foreground
- ✅ Count (mala counter) preserved
- ✅ Sankalp preserved
- ✅ App termination → "Resume session?" prompt on reopen
- ✅ Completing session clears background state
- ✅ No duplicate active sessions
- ✅ All tests passing

**Files to Create/Edit:**
- Create: `src/hooks/useBackgroundTimer.ts`
- Edit: `src/utils/practiceStorage.ts` (add `ActivePractice` fields)
- Edit: `src/screens/PracticeScreen.tsx` (integrate hook)
- Edit: `App.tsx` or `_layout.tsx` (check for saved session on mount)

---

### 🏗️ Phase 4: Large Features (Days 15-22) - Cultural Depth & Monetization

**Goal:** Build major features (Ekadashi calendar, Donations)

---

#### 4.1 Ekadashi Calendar & Details (3-4 days - DAYS 15-18)
**Priority:** HIGH - Core spiritual feature
**Dependencies:** Content Metadata (#3) for recommendations
**Effort:** 3-4 days

**What to Build:**
12-month rolling calendar of Ekadashi dates with names, significance, **stories/legends**, fasting guidelines, and recommended practices.

**Tasks:**
- [ ] **Day 15 (6-8 hours): Data & Calculations**
  - [ ] Research Ekadashi calculation (lunar calendar):
    - Use Drik Panchang algorithm or similar
    - Ekadashi = 11th day of lunar fortnight (Shukla/Krishna Paksha)
  - [ ] Create `@/utils/ekadashiCalendar.ts`:
    ```typescript
    interface Ekadashi {
      name: string;
      date: Date;
      paksha: 'shukla' | 'krishna';
      significance: string;
      story: string; // Full story/legend
      fastingGuidelines: string[];
      paranaTime: { start: string; end: string }; // Breaking fast timing
      recommendedShlokas: string[]; // shloka IDs
    }

    export function getEkadashiDates(
      startDate: Date = new Date(),
      count: number = 24 // 12 months = ~24 Ekadashis
    ): Ekadashi[] {
      // Load pre-calculated dates from JSON
      const allEkadashis = loadEkadashiData();
      return allEkadashis
        .filter(e => e.date >= startDate)
        .slice(0, count);
    }

    export function checkIfEkadashi(date: Date = new Date()): boolean {
      const ekadashis = getEkadashiDates(date, 1);
      const dateStr = date.toISOString().split('T')[0];
      return ekadashis.some(e => e.date.toISOString().split('T')[0] === dateStr);
    }
    ```
  - [ ] Create `@/data/ekadashi.json` with 24+ months of data (2026-2027):
    ```json
    [
      {
        "name": "Nirjala Ekadashi",
        "date": "2026-06-12",
        "paksha": "shukla",
        "significance": "Most austere Ekadashi, equal to all 24 Ekadashis",
        "story": "Long story: Bhima, unable to fast regularly, asked sage Vyasa for a way to observe one Ekadashi that equals all. Vyasa told him about Nirjala Ekadashi, where one must fast completely without even water. Bhima successfully observed this fast, demonstrating that determination and devotion can overcome physical limitations...",
        "fastingGuidelines": [
          "Complete fast (no food, no water)",
          "Stay awake the night before",
          "Chant Vishnu mantras"
        ],
        "paranaTime": { "start": "05:30", "end": "08:15" },
        "recommendedShlokas": ["vishnu-sahasranam"]
      },
      {
        "name": "Vaikuntha Ekadashi",
        "date": "2026-12-22",
        "paksha": "shukla",
        "significance": "Gates of Vaikuntha (Vishnu's abode) are open",
        "story": "Story about Lord Vishnu defeating demon Muran...",
        "fastingGuidelines": ["..."],
        "paranaTime": { "start": "06:00", "end": "09:00" },
        "recommendedShlokas": ["vishnu-sahasranam"]
      }
      // ... 22+ more Ekadashis
    ]
    ```
  - [ ] Populate stories for at least 10 major Ekadashis:
    - Nirjala, Vaikuntha, Putrada, Kamada, Mohini, Apara, Pandava, etc.
  - [ ] Write tests for Ekadashi calculations

- [ ] **Day 16 (6-8 hours): Ekadashi Calendar Screen**
  - [ ] Create `EkadashiCalendarScreen.tsx`
  - [ ] Add navigation:
    - Option A: New tab in bottom navigation (Paanchang tab → Ekadashi subtab)
    - Option B: Button on HomeScreen → EkadashiCalendarScreen
  - [ ] Display next 12 months (24 Ekadashis) in list/card format:
    - Each card: Name, Date, Paksha (Shukla/Krishna), Moon emoji
    - "Today" badge if today is Ekadashi
    - Countdown: "In 5 days"
    - Special badge for major Ekadashis (Nirjala, Vaikuntha)
  - [ ] Add filters (optional):
    - All Ekadashis
    - Shukla Paksha only
    - Krishna Paksha only
  - [ ] Make each Ekadashi tappable → navigates to EkadashiDetailScreen
  - [ ] Add refresh button to reload dates
  - [ ] Style with dark theme, cards, icons

- [ ] **Day 17 (6-8 hours): Ekadashi Detail Screen**
  - [ ] Create `EkadashiDetailScreen.tsx`
  - [ ] Accept ekadashiId as route param
  - [ ] Display full details in sections:
    ```
    Header:
    - Name: "Nirjala Ekadashi"
    - Date: "June 12, 2026"
    - Paksha: "Shukla (waxing moon) 🌔"

    Story Section:
    - Full story/legend (scrollable text)
    - Well-formatted paragraphs
    - Optional: Illustrations (future)

    Significance:
    - Bullet points of benefits and meaning

    Fasting Guidelines:
    - Checklist format:
      - ☐ Complete fast (no food, no water)
      - ☐ Stay awake the night before
      - ☐ Chant Vishnu mantras

    Parana (Breaking Fast):
    - Timing: "Break fast between 5:30 AM - 8:15 AM"
    - Note: "After sunrise, check local timings"

    Recommended Practices:
    - List of shlokas (from metadata)
    - "Vishnu Sahasranam" (tap to view detail)
    - Button: "Practice Now" → ShlokaDetailScreen
    ```
  - [ ] Add share button (share Ekadashi name and date)
  - [ ] Add "Set Reminder" button (notification 1 day before)
  - [ ] Style beautifully (cards, sections, icons, colors)

- [ ] **Day 18 (4-6 hours): Home Integration & Testing**
  - [ ] Add Ekadashi banner to HomeScreen (when today is Ekadashi):
    ```tsx
    {isEkadashi && (
      <EkadashiBanner
        ekadashi={todaysEkadashi}
        onPress={() => navigate('EkadashiDetail', { id: todaysEkadashi.id })}
      />
    )}
    ```
  - [ ] Banner shows: "Today is {Ekadashi Name} 🌕 · View details"
  - [ ] Optional: "Next Ekadashi in X days" widget on Home
  - [ ] Optional: Ekadashi notifications:
    - 1 day before: "Tomorrow is {Name}"
    - Morning of: "Today is {Name}"
    - Parana time: "Time to break your fast"
    - Settings toggle to enable/disable
  - [ ] Write comprehensive tests:
    - Ekadashi calculation accuracy
    - Calendar screen rendering
    - Detail screen with story display
    - Navigation flows
    - Empty states
  - [ ] Test with physical devices (verify dates are accurate)
  - [ ] Run full test suite

**Acceptance Criteria:**
- ✅ EkadashiCalendarScreen shows next 12 months (24 Ekadashis)
- ✅ Each Ekadashi has name, date, Paksha, significance
- ✅ EkadashiDetailScreen shows **full story/legend** (300-500 words)
- ✅ Stories included for at least 10 major Ekadashis
- ✅ Fasting guidelines clear and actionable (checklist format)
- ✅ Parana timing calculated (based on sunrise, location-aware)
- ✅ Recommended shlokas linked (from metadata - Vishnu content)
- ✅ "Practice Now" button navigates to ShlokaDetailScreen
- ✅ Home banner shows on Ekadashi days
- ✅ Navigation: Home → Calendar → Detail → Practice
- ✅ Optional: Ekadashi reminders work (1 day before, day of, parana time)
- ✅ All tests passing

**Files to Create/Edit:**
- Create: `src/utils/ekadashiCalendar.ts`
- Create: `src/data/ekadashi.json` (with stories!)
- Create: `src/screens/EkadashiCalendarScreen.tsx`
- Create: `src/screens/EkadashiDetailScreen.tsx`
- Create: `src/components/home/EkadashiBanner.tsx`
- Edit: `src/screens/HomeScreen.tsx` (add banner)
- Edit: `src/navigation/` (add new screens to navigator)

---

#### 4.2 Donations & Payments - Stripe (3-5 days - DAYS 19-23)
**Priority:** HIGH - Sustainability
**Dependencies:** None (but needs backend setup)
**Effort:** 3-5 days

**What to Build:**
Voluntary Dana (donation) system using Stripe for one-time and recurring donations.

**Tasks:**
- [ ] **Day 19 (6-8 hours): Stripe Setup & Backend**
  - [ ] Install Stripe SDK: `npm install @stripe/stripe-react-native`
  - [ ] Add Stripe publishable key to `.env`:
    ```
    EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
    ```
  - [ ] Set up backend (choose one):
    - **Option A: Firebase Functions** (recommended)
    - **Option B: Simple Node.js server** (Heroku, Railway, DigitalOcean)
  - [ ] Create backend endpoint: `POST /api/create-payment-intent`
    ```javascript
    // Firebase Function example
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    exports.createPaymentIntent = async (req, res) => {
      const { amount, currency = 'usd', recurring = false } = req.body;

      if (recurring) {
        // Create subscription (monthly)
        // ... subscription logic
      } else {
        // One-time payment
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amount * 100, // Convert dollars to cents
          currency,
          metadata: {
            app: 'Shloka Sadhana',
            platform: 'mobile'
          }
        });
        return res.json({ clientSecret: paymentIntent.client_secret });
      }
    };
    ```
  - [ ] Create webhook endpoint: `POST /api/stripe-webhook`
    ```javascript
    exports.handleWebhook = async (req, res) => {
      const sig = req.headers['stripe-signature'];
      const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        // Record donation in database
        await recordDonation(paymentIntent);
        // Send thank-you email (optional: SendGrid, Mailgun)
        await sendThankYouEmail(paymentIntent);
      }

      res.json({ received: true });
    };
    ```
  - [ ] Set up Stripe products in dashboard:
    - One-time: $2, $5, $10, $20, $50, Custom
  - [ ] Test backend with Stripe test API key
  - [ ] Test webhook with Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhook`

- [ ] **Day 20 (6-8 hours): Donation Screen UI**
  - [ ] Create `DonationScreen.tsx`
  - [ ] Add navigation from SettingsScreen:
    - Button: "❤️ Support This App"
    - Subtitle: "Help keep Shloka Sadhana free for everyone"
  - [ ] Design donation screen:
    ```
    Header: "Support Shloka Sadhana 🙏"

    Impact Statement:
    "Shloka Sadhana is free for everyone, with no ads or paywalls.
    Your voluntary contributions help us:
    • Keep all features free forever
    • Add more shlokas and mantras
    • Maintain cloud sync servers
    • Build new features
    • Support development costs"

    Choose Amount:
    [  $2  ] [  $5  ] [  $10  ] [  $20  ] [  $50  ]

    Or enter custom amount:
    [ $_______ ]

    ( ) One-time    ( ) Monthly

    [   Donate with ❤️   ]

    Payment Methods:
    💳 Cards  🍎 Apple Pay  🤖 Google Pay

    "137 supporters this month"
    ```
  - [ ] Add amount selection state:
    ```typescript
    const [amount, setAmount] = useState<number | null>(null);
    const [customAmount, setCustomAmount] = useState('');
    const [recurring, setRecurring] = useState(false);
    ```
  - [ ] Style with dark theme, warm colors (orange/gold)

- [ ] **Day 21 (6-8 hours): Payment Flow**
  - [ ] Integrate Stripe payment sheet:
    ```typescript
    import { useStripe } from '@stripe/stripe-react-native';

    const { initPaymentSheet, presentPaymentSheet } = useStripe();

    async function handleDonate() {
      if (!amount) return;

      setLoading(true);

      try {
        // 1. Create payment intent on backend
        const response = await fetch('https://yourbackend.com/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount,
            currency: 'usd',
            recurring
          })
        });
        const { clientSecret } = await response.json();

        // 2. Initialize payment sheet
        const { error: initError } = await initPaymentSheet({
          paymentIntentClientSecret: clientSecret,
          merchantDisplayName: 'Shloka Sadhana',
          applePay: { merchantCountryCode: 'US' },
          googlePay: { merchantCountryCode: 'US', testEnv: __DEV__ }
        });

        if (initError) {
          Alert.alert('Error', initError.message);
          return;
        }

        // 3. Present payment sheet
        const { error: paymentError } = await presentPaymentSheet();

        if (paymentError) {
          Alert.alert('Payment cancelled', paymentError.message);
        } else {
          // Success!
          navigation.navigate('DonationSuccess', { amount });
        }
      } catch (error) {
        Alert.alert('Error', 'Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    ```
  - [ ] Handle loading states (show spinner during payment)
  - [ ] Handle errors gracefully (clear messages, non-alarming)
  - [ ] Test with Stripe test cards:
    - Success: `4242 4242 4242 4242`
    - Decline: `4000 0000 0000 0002`

- [ ] **Day 22 (4-6 hours): Thank You Flow & Polish**
  - [ ] Create `DonationSuccessScreen.tsx`:
    ```
    🙏 Thank You!

    Your generous contribution of $10.00 means the world to us.

    Together, we're helping people maintain their spiritual practice.

    May your practice bring you peace and fulfillment.

    Receipt sent to your email.

    [   Continue   ]
    ```
  - [ ] Add animation (confetti or gentle fade-in)
  - [ ] Optional: Badge in user profile (if auth is implemented later)
  - [ ] Backend: Send receipt email via Stripe (automatic) or SendGrid
  - [ ] Test full flow:
    - Settings → Donate → Select amount → Enter card → Success → Thank you
  - [ ] Test Apple Pay on physical iPhone
  - [ ] Test Google Pay on physical Android
  - [ ] Verify webhook receives events and logs correctly

- [ ] **Day 23 (4-6 hours): Privacy, Terms, Testing**
  - [ ] Update Privacy Policy (create if doesn't exist):
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
  - [ ] Update Terms of Service:
    - Donations are voluntary
    - All features remain free
    - Refund policy: Contact support for refund requests
  - [ ] Add Privacy Policy and Terms links on DonationScreen
  - [ ] Write UI tests (not payment flow, as Stripe is external)
  - [ ] Document donation workflow for team
  - [ ] Run full test suite
  - [ ] Verify all features still free (no paywalls)

**Acceptance Criteria:**
- ✅ DonationScreen accessible from Settings
- ✅ User can select preset ($2-$50) or custom amount (min $1)
- ✅ One-time donations work with Stripe payment sheet
- ✅ Apple Pay works on iOS (tested on physical device)
- ✅ Google Pay works on Android (tested on physical device)
- ✅ Card payments work with test cards
- ✅ Thank-you screen shows after successful payment
- ✅ Receipt email sent automatically (Stripe or backend)
- ✅ Error handling for failed payments (clear, non-alarming)
- ✅ Privacy Policy and Terms of Service updated
- ✅ All app features remain free (no paywalls, donations are truly voluntary)
- ✅ Backend webhook logs donations correctly
- ✅ Tests passing (UI tests, not payment flow)

**Files to Create/Edit:**
- Install: `@stripe/stripe-react-native`
- Create: `src/screens/DonationScreen.tsx`
- Create: `src/screens/DonationSuccessScreen.tsx`
- Edit: `src/screens/SettingsScreen.tsx` (add "Support This App" button)
- Create: Backend endpoints (Firebase Functions or Node.js)
- Edit: `.env` (add Stripe keys)
- Edit: Privacy Policy and Terms of Service documents
- Create: `src/utils/__tests__/donation.test.tsx` (UI tests)

---

## Testing & Quality Assurance

### Regression Testing (Daily)
- [ ] Run full test suite after each feature: `npm test`
- [ ] Target: 700+ tests passing by end of V3 (current: 656)
- [ ] No regressions (all V2 tests still pass)

### Integration Testing (Weekly)
- [ ] Test cross-feature flows:
  - Home → Ekadashi Calendar → Detail → Practice shloka → Complete session → Streak updates
  - Home → Daily Recommendation → Practice → Background app → Return → Complete
  - Settings → Donation → Complete payment → Thank you → Return to Home
  - Home → Muhurat times (check location-aware) → Festivals list → Ekadashi banner (if today)

### Device Testing (After Each Phase)
- [ ] iOS Simulator (iPhone 15 Pro, iOS 17+)
- [ ] Android Emulator (Pixel 7, Android 13+)
- [ ] Physical iPhone (test Apple Pay, location services, notifications, background timer)
- [ ] Physical Android device (test Google Pay, location services, notifications, background timer)

### Accessibility Testing (Phase 4 Complete)
- [ ] VoiceOver (iOS) walkthrough: Home → Ekadashi → Donation → Practice
- [ ] TalkBack (Android) walkthrough: same flows
- [ ] Color contrast check (WCAG AA): All new screens
- [ ] Font scaling test: iOS accessibility settings → larger text
- [ ] Ensure all buttons, cards have semantic labels

### Performance Testing (End of Development)
- [ ] App launch time < 2 seconds (cold start)
- [ ] Recommendation engine < 100ms
- [ ] Ekadashi calendar rendering < 500ms
- [ ] Donation screen Stripe initialization < 1 second
- [ ] No memory leaks (React DevTools Profiler)
- [ ] Battery usage: Background timer doesn't drain battery excessively

---

## Launch Readiness Checklist

### Critical Blockers (Must Complete Before Submission)

**Still Required:**
- [ ] **Privacy Policy** (1-2 days)
  - Create comprehensive policy
  - Include: AsyncStorage data, donation data (Stripe), location data (muhurat), notification data
  - Host on public URL (GitHub Pages, website, or in-app WebView)
  - Add link to Settings → Privacy Policy
  - Add link to App Store/Play Store listings

- [ ] **App Icon** (1-2 days)
  - Design professional app icon (spiritual theme)
  - iOS: 1024x1024 PNG (no transparency, no rounded corners)
  - Android: 512x512 PNG (can have transparency)
  - Theme: Om symbol, Mala beads, Lotus, or abstract spiritual design
  - Test on device (ensure visibility on Home screen)

- [ ] **Screenshots** (1 day)
  - iOS: 6.7" (1290x2796), 6.5" (1284x2778), 5.5" (1242x2208)
  - Android: At least 2, up to 8 (1080x1920 or higher)
  - Capture screens:
    1. Home with streak, recommendations, festivals, Ekadashi banner
    2. Shloka Library
    3. Practice session with mala counter
    4. Ekadashi Calendar
    5. Ekadashi Detail with story
    6. Session history
  - Add device frames (Screely.com or Figma)
  - Ensure no placeholder text or dev data

- [ ] **Developer Accounts** (1 day setup + 1-2 days activation)
  - Apple Developer Program: $99/year (https://developer.apple.com/programs/)
  - Google Play Developer: $25 one-time (https://play.google.com/console/signup)
  - Wait for account activation (1-2 days)

- [ ] **Store Metadata** (1 day)
  - **App Name:** "Shloka Sadhana" (check availability on App Store and Play Store)
  - **Subtitle (iOS):** "Spiritual Practice Companion" (30 chars max)
  - **Short Description (Android):** (80 chars)
  - **Full Description:** 4000 chars (draft exists in APP_STORE_CHECKLIST.md)
  - **Keywords (iOS):** 100 chars (e.g., "mantra, meditation, hinduism, chanting, yoga, spiritual, practice, shloka, prayer, devotion")
  - **Category:** Lifestyle or Health & Fitness
  - **Age Rating:** 4+ (Everyone)
  - **Support Email:** your-email@domain.com
  - **Privacy Policy URL:** (from above)

**Technical Setup:**
- [ ] **EAS Build Configuration** (1 day)
  - Configure `eas.json` for production builds
  - Set up iOS credentials: `eas credentials`
  - Set up Android keystore: `eas credentials`
  - Run production builds: `eas build --platform all --profile production`
  - Test on TestFlight (iOS) and Play Store internal testing (Android)
  - Fix any build errors or warnings

### Final Pre-Submission (Week 6)
- [ ] Full regression testing (all features V2 + V3)
- [ ] Beta testing: 5-10 users via TestFlight / Play Store internal testing
- [ ] Fix all critical bugs
- [ ] Verify all 700+ tests passing
- [ ] Performance benchmarks met
- [ ] Accessibility audit complete (VoiceOver + TalkBack tested)
- [ ] Privacy policy and Terms finalized and live
- [ ] App icon and screenshots finalized
- [ ] Store listings complete (app name, description, keywords)
- [ ] Stripe donations tested with real payments (test mode)
- [ ] OTA updates tested (push an update, verify it applies)
- [ ] Background timer tested on multiple devices

---

## Timeline & Milestones

### Recommended Schedule (6 weeks total)

**Week 1: Quick Wins + Small Features (Days 1-7)**
- Days 1-2: Sankalp Help + Streak Recovery (Phase 1)
- Days 2-3: Upcoming Festivals (Phase 2.1)
- Days 3-4: Muhurat on Home (Phase 2.2)
- Days 5-6: Verse of the Day (Phase 2.3)
- Days 6-7: Daily Shloka Recommendation (Phase 2.4)
- **Milestone:** 6 features shipped ✅

**Week 2: Medium Features - Infrastructure (Days 8-14)**
- Days 8-10: OTA Updates (Phase 3.1)
- Days 10-12: Content Metadata (Phase 3.2)
- Days 12-14: Background Timer (Phase 3.3)
- **Milestone:** Critical infrastructure complete ✅

**Week 3-4: Large Features (Days 15-23)**
- Days 15-18: Ekadashi Calendar & Details (Phase 4.1)
- Days 19-23: Donations & Payments (Phase 4.2)
- **Milestone:** All 11 V3 features complete ✅

**Week 5: Testing & Polish (Days 24-28)**
- Days 24-25: Full regression testing
- Days 26-27: Device testing (iOS and Android physical devices)
- Day 28: Accessibility audit + performance testing
- **Milestone:** App tested and polished ✅

**Week 6: Launch Prep (Days 29-35)**
- Days 29-30: Privacy Policy + Terms of Service
- Days 31-32: App Icon + Screenshots
- Days 33-34: Store metadata + EAS production builds
- Day 35: TestFlight / Play Store internal testing
- Day 36: Final bug fixes
- **Milestone:** Ready for submission! 🚀

---

## Risk Management

### High Risk Items

**1. Stripe Payment Integration (Days 19-23)**
- **Risk:** Complex backend setup, real payment testing, Apple/Google Pay testing on devices
- **Mitigation:** Start backend early (Day 19), use Stripe test environment extensively, test on physical devices
- **Fallback:** Can launch without donations initially, add in V3.1 post-launch via OTA update

**2. Background Timer on iOS (Days 12-14)**
- **Risk:** iOS restrictions on background execution, app termination edge cases
- **Mitigation:** Use AppState API correctly, save state to AsyncStorage frequently, test on physical devices extensively
- **Fallback:** Show "Session lost" warning and simplify to manual resume only

**3. Ekadashi Calculation Accuracy (Day 15)**
- **Risk:** Lunar calendar calculations are complex, regional variations exist
- **Mitigation:** Use pre-calculated dates from authoritative source (Drik Panchang), allow for manual corrections
- **Fallback:** Use JSON data with pre-calculated dates for next 2 years (no runtime calculation)

### Medium Risk Items

**4. Location Services for Muhurat (Days 3-4)**
- **Risk:** Location permissions, GPS accuracy, timezone handling across regions
- **Mitigation:** Graceful fallback to default location (Delhi), handle permission denial, test across timezones
- **Fallback:** Use default location (Delhi) and allow manual override in Settings

**5. EAS Update Configuration (Days 8-10)**
- **Risk:** First time using Expo's OTA system, potential misconfiguration
- **Mitigation:** Follow Expo docs precisely, test on preview channel extensively, have rollback plan
- **Fallback:** Launch without OTA initially, add in V3.1 (but strongly recommended for launch)

### Low Risk Items

**6. Quick Wins (Days 1-2)**
- **Risk:** Low - mostly UI work, no complex logic
- **Mitigation:** Simple implementation, quick testing

**7. Daily Recommendation & Verse of the Day (Days 6-7)**
- **Risk:** Low - deterministic algorithms, no external dependencies
- **Mitigation:** Comprehensive unit tests

---

## Success Criteria

### Must-Have (Launch Blockers)
- ✅ All 11 V3 features implemented and tested
- ✅ All 700+ tests passing (V2 + V3)
- ✅ App icon, screenshots, privacy policy complete
- ✅ Developer accounts active (Apple + Google)
- ✅ EAS production builds working (iOS and Android)
- ✅ No critical bugs
- ✅ Performance benchmarks met (launch < 2s, smooth scrolling, no memory leaks)
- ✅ Background timer works on physical devices (iOS and Android)
- ✅ Stripe donations tested with test payments
- ✅ OTA updates tested and working

### Should-Have (High Priority)
- ✅ Beta testing with 5-10 users complete
- ✅ Accessibility audit passed (WCAG AA)
- ✅ Location-aware muhurat times tested across timezones
- ✅ Ekadashi stories included for 10+ major Ekadashis
- ✅ All store metadata finalized

### Nice-to-Have (Can defer to V3.1 post-launch)
- 📝 10+ beta users feedback incorporated
- 📝 Additional Ekadashi stories (can add more via OTA)
- 📝 Monthly recurring donations (can start with one-time only)
- 📝 Ekadashi notifications (can add via OTA)

---

## Post-Launch Plan (V3.1)

**Week 1-2 Post-Launch:**
- Monitor crash reports (Sentry, Bugsnag, or Firebase Crashlytics)
- Gather user feedback (reviews, support emails)
- Hot-fix critical bugs via OTA updates
- Monitor donation conversion rates
- Celebrate launch! 🎉

**Week 3-4 Post-Launch (V3.1):**
- P2 features from backlog:
  - Library Favorites Filter (1-2 days)
  - Library Search (2-3 days)
  - Quiet Hours for Reminders (1 day)
  - Weekly Practice Digest (1-2 days)
- Add more Ekadashi stories via OTA (no app store update needed)
- Performance optimizations based on real usage data

**Month 2-3 (V3.2):**
- P1 features deferred from V3:
  - User Authentication & Cloud Sync (5-7 days) - if high user demand
  - Audio Mantra Playback (5-7 days) - if high engagement
- Content expansion: Add 5-10 more shlokas
- Advanced analytics (if cloud sync is implemented)

---

## Resources & References

### Documentation
- [Shloka Sadhana PRD](PRD.md)
- [Product Backlog](BACKLOG.md)
- [App Store Checklist](APP_STORE_CHECKLIST.md)

### External Resources
- [EAS Update Docs](https://docs.expo.dev/eas-update/introduction/)
- [Stripe React Native SDK](https://stripe.com/docs/payments/accept-a-payment?platform=react-native)
- [Expo Location API](https://docs.expo.dev/versions/latest/sdk/location/)
- [Expo App State](https://docs.expo.dev/versions/latest/react-native/appstate/)
- [SunCalc Library](https://github.com/mourner/suncalc) - For sunrise/sunset calculations
- [Drik Panchang](https://www.drikpanchang.com/) - Ekadashi dates reference
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Tools
- EAS CLI: `npm install -g eas-cli`
- Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhook`
- React Native Testing Library
- Detox (E2E testing - optional)

---

## Notes

**Key Changes in V2.0:**
- ✅ **Reordered by effort** (easiest to hardest) instead of dependency-based
- ✅ **Muhurat enhanced** with location and timezone awareness (SunCalc + Expo Location)
- ✅ **Ekadashi stories** added to feature requirements
- ✅ Quick wins first (Sankalp Help, Streak Recovery) - ship in 2 days!
- ✅ Cultural features next (Festivals, Muhurat, Verse, Recommendation) - build momentum
- ✅ Infrastructure features (OTA, Metadata, Background Timer) - critical but complex
- ✅ Large features last (Ekadashi, Donations) - tackle with momentum

**Estimated Total Effort:**
- Development: 19-28 days (4-6 weeks)
- Testing & Polish: 1 week
- Launch Prep: 1 week
- **Total: 6-8 weeks to production launch**

**Critical Path (Cannot be parallelized):**
1. Quick Wins (Days 1-2) → Build momentum ⚡
2. Small Features (Days 2-7) → User-facing improvements 🚀
3. Medium Features (Days 8-14) → Infrastructure (OTA enables post-launch iteration, Metadata powers recommendations, Background Timer prevents session loss)
4. Large Features (Days 15-23) → Ekadashi (spiritual depth), Donations (sustainability)
5. Testing (Days 24-28) → Polish & bug fixes
6. Launch Prep (Days 29-35) → App Store requirements

**Next Steps:**
1. Review and approve this plan
2. Set target launch date (e.g., April 1, 2026 = 8 weeks from now)
3. **Day 1 Morning: Start with Sankalp Help** (easiest, 3-4 hours)
4. **Day 1 Afternoon: Streak Recovery** (0.5-1 day)
5. Ship 2 features in first 2 days! 🎉
6. Continue with small features (Festivals, Muhurat, etc.)
7. Daily standups to track progress
8. Weekly demos of completed features

---

**Document Control:**
- **Version:** 2.0
- **Last Updated:** February 6, 2026
- **Changes from v1.0:**
  - Reordered features by effort (easiest first)
  - Enhanced muhurat with location/timezone awareness
  - Added Ekadashi stories requirement
  - Added detailed day-by-day breakdown for each feature
- **Next Review:** Weekly during implementation
- **Owner:** Development Team
- **Approvers:** Product Manager, Lead Developer
