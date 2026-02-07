# TDD Workflow - React Native + Expo
# Shloka Sadhana - Mandatory Process for All Changes

**CRITICAL: This workflow MUST be followed for EVERY code change, no exceptions.**

This document is specifically tailored for **React Native with Expo** development.

---

## 🔴 Red-Green-Refactor Cycle (Mandatory)

### Phase 1: RED - Write Failing Tests First
**Before writing ANY implementation code:**

1. **Create test file(s)**
   - Component tests: `src/screens/[ScreenName]/[ScreenName].test.tsx`
   - Component tests: `src/components/[category]/[ComponentName]/[ComponentName].test.tsx`
   - Hook tests: `src/hooks/[hookName].test.ts`
   - Utility tests: `src/utils/[utilityName].test.ts`
   - E2E tests: `e2e/[feature].spec.ts` (Detox/Maestro)

2. **Write test cases that WILL FAIL**
   - Test the desired behavior, not current behavior
   - Use clear, descriptive test names
   - Cover edge cases and error scenarios
   - Include assertions for expected results

3. **Run tests and VERIFY they FAIL**
   ```bash
   # Run specific test file
   npm test src/hooks/useStreak.test.ts

   # Run in watch mode (RECOMMENDED during TDD)
   npm run test:watch

   # Run all tests
   npm test

   # Run with coverage
   npm run test:coverage
   ```

4. **Document test failure in ISSUES_LOG.md**
   - Log expected vs actual behavior
   - Note why test fails (implementation not done yet)

---

### Phase 2: GREEN - Implement Fix to Pass Tests

1. **Implement MINIMAL code to make tests pass**
   - Only write code needed for tests to pass
   - No extra features or "nice-to-haves"
   - Keep it simple

2. **Run tests continuously**
   - Run after each small change
   - Fix one test at a time
   - Document any issues in ISSUES_LOG.md

3. **Achieve 100% test passage**
   - All tests must pass
   - No skipped tests
   - No pending tests

4. **Log any implementation issues encountered**
   - Update ISSUES_LOG.md with each problem
   - Include root cause analysis
   - Document fix applied

---

### Phase 3: REFACTOR - Improve Code Quality (Optional)

1. **Refactor only if needed**
   - Keep tests passing throughout refactoring
   - Run tests after each refactor
   - Log any issues in ISSUES_LOG.md

2. **Verify no regression**
   - All existing tests still pass
   - No new bugs introduced
   - Performance not degraded

---

## 📋 Issue Logging Requirements

**EVERY issue encountered MUST be logged in:**
`ISSUES_LOG.md` (create in project root if it doesn't exist)

### Log Entry Format
```markdown
### Issue #[AUTO_INCREMENT]: [Brief Description]
**Date:** YYYY-MM-DD HH:MM
**Feature:** [Feature/fix being implemented]
**Phase:** [Red/Green/Refactor]
**Platform:** [iOS/Android/Both]
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

---

## 🛡️ AsyncStorage Safety Protocol

### Before ANY AsyncStorage changes:

1. **Data Structure Planning**
   - Define TypeScript interfaces for stored data
   - Plan data versioning strategy (for future migrations)
   - Document what data is stored and why

2. **Safe AsyncStorage Access Pattern**
   ```typescript
   import AsyncStorage from '@react-native-async-storage/async-storage';

   // Always use try-catch for AsyncStorage access
   const saveData = async <T>(key: string, data: T): Promise<boolean> => {
     try {
       const jsonValue = JSON.stringify(data);
       await AsyncStorage.setItem(key, jsonValue);
       return true;
     } catch (error) {
       console.error(`Failed to save ${key}:`, error);
       return false;
     }
   };

   const loadData = async <T>(key: string, defaultValue: T): Promise<T> => {
     try {
       const jsonValue = await AsyncStorage.getItem(key);
       return jsonValue != null ? JSON.parse(jsonValue) : defaultValue;
     } catch (error) {
       console.error(`Failed to load ${key}:`, error);
       return defaultValue;
     }
   };
   ```

3. **Data Validation**
   - Always validate data loaded from AsyncStorage
   - Use TypeScript type guards or Zod for validation
   - Provide sensible defaults for missing/corrupted data

4. **Testing AsyncStorage**
   - Mock AsyncStorage in tests (use `@react-native-async-storage/async-storage/jest/async-storage-mock`)
   - Test save/load functionality
   - Test error cases (quota exceeded, corrupted data)
   - Test default values
   - Test async behavior with `async/await`

---

## ✅ Testing Requirements by Change Type

### React Native Component Changes
**Required Tests:**
- [ ] Unit tests (component rendering with React Native Testing Library)
- [ ] User interaction tests (press, scroll, swipe)
- [ ] State management tests (useState, useEffect, useContext)
- [ ] Error handling tests
- [ ] Loading state tests
- [ ] Conditional rendering tests
- [ ] Accessibility tests (accessibilityLabel, testID)
- [ ] Platform-specific rendering (iOS vs Android if applicable)

### Custom Hook Changes
**Required Tests:**
- [ ] Hook rendering tests (using `renderHook` from @testing-library/react-native)
- [ ] State updates tests
- [ ] Side effects tests (useEffect cleanup)
- [ ] Error handling tests
- [ ] Dependencies array tests
- [ ] Async operations tests (with `act` and `waitFor`)

### Utility Function Changes
**Required Tests:**
- [ ] Pure function logic tests
- [ ] Edge case tests (null, undefined, empty values)
- [ ] Error handling tests
- [ ] Input validation tests
- [ ] Async function tests (if applicable)

### AsyncStorage Integration Changes
**Required Tests:**
- [ ] Save functionality tests
- [ ] Load functionality tests
- [ ] Default value tests
- [ ] Error handling tests (storage errors, parse errors)
- [ ] Data persistence tests across component remounts
- [ ] Async behavior tests (use `async/await` in tests)
- [ ] Mock AsyncStorage correctly in setup

### Date/Time Calculation Changes (Moon Phase, Hindu Calendar)
**Required Tests:**
- [ ] Unit tests (date calculations)
- [ ] Edge case tests (month boundaries, year boundaries)
- [ ] Mock Date.now() for consistent testing (use `jest.setSystemTime()`)
- [ ] Test with various dates (past, present, future)
- [ ] Cultural accuracy tests (verify Hindu calendar calculations)

### Navigation Changes
**Required Tests:**
- [ ] Navigation flow tests
- [ ] Route parameter passing tests
- [ ] Deep linking tests (if applicable)
- [ ] Type-safe navigation tests

---

## 🚫 Non-Negotiable Rules

### 1. No Implementation Without Tests
- NEVER write implementation code before tests
- NEVER skip writing tests "I'll add them later"
- NEVER commit untested code

### 2. All Tests Must Pass
- 100% test passage required before moving forward
- No "temporarily disabled" tests
- No "TODO: fix this test" comments
- Fix failing tests immediately

### 3. Log ALL Issues
- Every bug, every error, every unexpected behavior
- Even if you fix it in 2 minutes
- Even if it seems trivial
- ISSUES_LOG.md is append-only (never delete entries)
- Include context: what were you trying to do, what went wrong, how you fixed it
- Note platform-specific issues (iOS vs Android)

### 4. Component Isolation
- Always test components in isolation
- Mock external dependencies (API calls, AsyncStorage, navigation, etc.)
- Use React Native Testing Library best practices
- Test behavior, not implementation details
- Mock native modules (expo-haptics, expo-notifications, etc.)

### 5. Existing Functionality Must Not Break
- Run ALL existing tests after changes
- Verify no regression
- Check dependent features
- Log any breaking changes in ISSUES_LOG.md
- Test on BOTH iOS and Android if changes affect native code

---

## 📊 Test Coverage Standards

### Minimum Coverage Requirements
- **Critical paths:** 100% (AsyncStorage, streak calculation, timer logic)
- **Business logic:** 95% (hooks, utilities)
- **UI components:** 80% (screens, components)
- **Navigation:** 75%
- **Overall project:** 75% minimum

### Coverage Commands
```bash
# Run tests with coverage
npm run test:coverage

# View coverage report in browser
open coverage/index.html

# Check coverage thresholds (fails if below minimum)
npm test -- --coverage --coverageThreshold='{"global":{"statements":75,"branches":75,"functions":75,"lines":75}}'
```

---

## 🔄 Continuous Testing During Implementation

### Run Tests After EVERY Change
```bash
# Quick test (watch mode) - RECOMMENDED during TDD
npm run test:watch

# Full test suite
npm test

# Specific test file
npm test src/hooks/useStreak.test.ts

# With coverage
npm run test:coverage

# Update snapshots (if using snapshot testing)
npm test -- -u
```

### Watch for:
- New test failures (regression)
- Console warnings/errors
- React Native Testing Library warnings (wrong queries, act warnings)
- useEffect dependency warnings
- Memory leaks (timers not cleaned up, event listeners not removed)
- Async act warnings (wrap state updates in `act()`)
- Platform-specific warnings

---

## 🎯 React Native Testing Library Best Practices

### Query Priorities (in order of preference)
1. **getByTestId** - Most reliable for RN (set `testID` prop)
2. **getByText** - For text content
3. **getByPlaceholderText** - For TextInput components
4. **getByRole** - Limited support in RN (use with caution)

### Example Test Pattern
```typescript
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    const { getByTestId } = render(<MyComponent />);
    expect(getByTestId('my-component')).toBeTruthy();
  });

  it('should handle button press', async () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(<MyComponent onPress={onPressMock} />);

    const button = getByTestId('my-button');
    fireEvent.press(button);

    await waitFor(() => {
      expect(onPressMock).toHaveBeenCalledTimes(1);
    });
  });

  it('should handle async state updates', async () => {
    const { getByTestId, getByText } = render(<MyComponent />);

    const button = getByTestId('load-button');
    fireEvent.press(button);

    // Wait for loading to finish
    await waitFor(() => {
      expect(getByText('Loaded!')).toBeTruthy();
    });
  });
});
```

### Mocking Native Modules
```typescript
// In jest.config.js or setup file
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
}));

jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));
```

---

## 📝 Commit Message Format (When User Approves)

```
[type]: [Brief description]

TDD Phase: [Red/Green/Refactor]
Tests: [X passed, Y failed before fix]
Coverage: [XX%]
Platform: [iOS/Android/Both]

Changes:
- [List main changes]

Issues Logged:
- Issue #[N]: [Brief description]

Platform-Specific Notes:
- [Any iOS or Android specific considerations]

Refs: #[issue-number] (if applicable)
```

**Types:** feat, fix, refactor, test, docs, style, chore

---

## 🎯 Quick Checklist Before Requesting User Approval

- [ ] All TDD tests written and initially failing (Red phase)
- [ ] Implementation complete and all tests passing (Green phase)
- [ ] Code refactored for quality (if needed)
- [ ] ALL issues logged in ISSUES_LOG.md
- [ ] No existing tests broken
- [ ] Test coverage meets minimum standards (75%+)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Tested on iOS simulator/device (if on Mac)
- [ ] Tested on Android emulator/device
- [ ] AsyncStorage changes have user approval
- [ ] No security vulnerabilities introduced
- [ ] Performance impact assessed
- [ ] Accessibility verified (VoiceOver/TalkBack if applicable)
- [ ] Documentation updated (if needed)

---

## ⚡ Quick Reference Commands

```bash
# Start development server
npx expo start

# Run on iOS
npx expo start --ios

# Run on Android
npx expo start --android

# Start TDD cycle (RECOMMENDED)
npm run test:watch

# Run specific test
npm test src/hooks/useStreak.test.ts

# Check coverage
npm run test:coverage

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
eas build --platform ios
eas build --platform android

# View issues log
cat ISSUES_LOG.md

# Clear AsyncStorage (testing)
npx expo start --clear
```

---

## 🆘 When Things Go Wrong

1. **Tests won't pass**
   - Log issue in ISSUES_LOG.md
   - Review test expectations vs implementation
   - Check for typos, logic errors
   - Check React Native Testing Library console warnings
   - Verify component is rendering correctly
   - Check if using correct queries (testID, getByText, etc.)
   - Verify mocks are set up correctly
   - Ask user if requirements unclear

2. **AsyncStorage issues**
   - Check if AsyncStorage is mocked in tests (see setup.ts)
   - Verify try-catch blocks are in place
   - Test with corrupted data
   - Test quota exceeded scenarios (rare on mobile)
   - Ensure async/await used correctly
   - Log issue in ISSUES_LOG.md

3. **Existing tests break (regression)**
   - DO NOT disable tests
   - Log as regression in ISSUES_LOG.md
   - Identify what changed (component, hook, state)
   - Fix implementation or update tests (document why)
   - Run full test suite to ensure no other breaks
   - Check if changes affect both iOS and Android
   - Document decision in log

4. **React Native Testing Library errors (act warnings, queries)**
   - Use proper async utilities (`waitFor`, `findBy*`)
   - Wrap state updates in `act()` if needed (usually automatic)
   - Use `testID` for reliable queries in React Native
   - Avoid testing implementation details
   - Handle async operations with `async/await`
   - Log issue and resolution in ISSUES_LOG.md

5. **Platform-specific issues (iOS vs Android)**
   - Test on BOTH platforms during development
   - Log platform-specific behavior in ISSUES_LOG.md
   - Use Platform API for conditional logic if needed
   - Check Expo documentation for platform differences
   - Note in tests which platform(s) affected

6. **Native module mocking issues**
   - Verify mock is set up in `src/__tests__/setup.ts`
   - Check mock implementation matches module API
   - Ensure jest.mock() is called before imports
   - Refer to Expo documentation for proper mocking
   - Log issue in ISSUES_LOG.md

7. **Not sure how to test React Native features**
   - Log question in ISSUES_LOG.md
   - Research React Native Testing Library docs
   - Check Expo testing best practices
   - Look at similar component tests in the codebase
   - Ask user for guidance

---

## 🔍 Debugging Tests

### View test output
```bash
# Run tests with verbose output
npm test -- --verbose

# Run single test file with debugging
npm test -- src/hooks/useStreak.test.ts --verbose

# Debug with console.log (visible in test output)
console.log('Debug:', value);
```

### Common Test Failures

**"Cannot find element with testID"**
- Solution: Verify testID prop is set on component
- Solution: Check spelling and case sensitivity

**"act() warning"**
- Solution: Wrap state updates in `act()` or use `waitFor()`
- Solution: Use `async/await` for async operations

**"AsyncStorage is not mocked"**
- Solution: Check `src/__tests__/setup.ts` has mock
- Solution: Verify jest.config.js includes setupFilesAfterEnv

**"Navigation mock not working"**
- Solution: Mock @react-navigation/native in setup or test file
- Solution: Provide mock functions for navigate, goBack, etc.

---

**Remember: TDD is not optional. It's a requirement. Every. Single. Time.**

**React Native Specific: Test on both iOS and Android. Mock native modules correctly. Use testID for reliable queries.**
