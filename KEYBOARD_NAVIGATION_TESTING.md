# Keyboard Navigation Testing Guide
## Shloka Sadhana - Accessibility Testing

**Status**: ✅ Implemented
**Date**: 2026-02-09
**Phase**: Phase 1 Week 6 - Accessibility (P0 #11)

---

## What Was Implemented

### Enhanced UI Components

All interactive UI components now have keyboard focus support with visible focus indicators:

#### 1. **Button Component** ([src/components/ui/Button.tsx](src/components/ui/Button.tsx))
- ✅ Focus handlers (onFocus/onBlur)
- ✅ Variant-specific focus indicators:
  - **Ghost variant**: 2px border + subtle shadow
  - **Other variants**: 3px border ring
- ✅ Focus color: Primary orange (#FF9800)

#### 2. **Card Component** ([src/components/ui/Card.tsx](src/components/ui/Card.tsx))
- ✅ Focus support for pressable cards
- ✅ Focus indicator: 2px border + shadow
- ✅ Non-pressable cards (View only) - no focus needed

#### 3. **Input Component** ([src/components/ui/Input.tsx](src/components/ui/Input.tsx))
- ✅ Already had focus support
- ✅ Focus indicator: 2px border color change to primary orange
- ✅ Error state: Red border (takes precedence over focus)

#### 4. **ListItem Component** ([src/components/ui/ListItem.tsx](src/components/ui/ListItem.tsx))
- ✅ Focus handlers added
- ✅ Focus indicator: Left border accent (3px) + subtle background tint
- ✅ Disabled state: No focus

#### 5. **MalaCounter Component** ([src/components/MalaCounter.tsx](src/components/MalaCounter.tsx))
- ✅ Replaced TouchableOpacity with Pressable
- ✅ Created CounterButton sub-component with focus support
- ✅ Focus indicator on all 3 buttons (-, +, Reset)
- ✅ Focus ring: 3px border + shadow (orange #FF9800)

#### 6. **Timer Component** ([src/components/Timer.tsx](src/components/Timer.tsx))
- ✅ Replaced TouchableOpacity with Pressable
- ✅ Created TimerButton sub-component with focus support
- ✅ Focus indicator on all buttons (Start, Pause, Resume, Reset, Complete)
- ✅ Focus ring: 3px border + shadow (orange #FF9800)
- ✅ Disabled state (Complete button when < 60s): No focus

---

## How to Test Keyboard Navigation

### Setup Requirements

**iOS:**
1. Connect a Bluetooth keyboard to your iOS device
   - Settings → Bluetooth → Pair keyboard
2. OR use iOS Simulator + Mac keyboard
   - Xcode → Product → Build For → Running → iPhone Simulator

**Android:**
1. Connect a Bluetooth keyboard to your Android device
   - Settings → Connected devices → Pair new device
2. OR use Android Emulator + PC keyboard
   - Android Studio → AVD Manager → Start emulator

### Testing Procedure

#### Basic Navigation

1. **Tab Navigation**
   - Press `Tab` to move focus forward through interactive elements
   - Press `Shift + Tab` to move focus backward
   - **Expected**: Focus indicator (orange border) appears on each focusable element in logical order

2. **Enter/Space to Activate**
   - Navigate to a button using `Tab`
   - Press `Enter` or `Space` to activate the button
   - **Expected**: Button press handler fires (same as touch)

3. **Arrow Keys** (some components)
   - Use arrow keys to navigate within components (depends on component implementation)

---

### Screen-by-Screen Testing Checklist

#### ✅ Home Screen
- [ ] Tab through cards (Verse of the Day, Paanchang, Daily Wisdom)
- [ ] Focus indicator visible on each card
- [ ] Enter/Space activates card navigation

#### ✅ Practice Screen (Most Critical)

**Timer Controls:**
- [ ] Tab to "Start" button - focus visible
- [ ] Enter/Space starts timer
- [ ] Tab to "Pause" button - focus visible
- [ ] Tab to "Reset" button - focus visible
- [ ] Tab to "Complete" button - focus visible (only after 60s)
- [ ] Complete button disabled (no focus) when < 60s

**Mala Counter:**
- [ ] Tab to "-" (decrement) button - focus visible
- [ ] Enter/Space decrements count
- [ ] Tab to "+" (increment) button - focus visible
- [ ] Enter/Space increments count (haptic feedback)
- [ ] Tab to "Reset" button (only visible when count > 0) - focus visible
- [ ] Enter/Space resets count to 0

**Modals:**
- [ ] Tab to "Set Intention" button - focus visible
- [ ] Opens SankalpModal - focus trapped inside modal
- [ ] Tab through modal input and buttons
- [ ] Close modal - focus returns to trigger button

#### ✅ Library Screen
- [ ] Tab through shloka list items
- [ ] Each list item shows focus indicator (left orange border + background tint)
- [ ] Enter/Space navigates to shloka detail
- [ ] Tab order: top to bottom

#### ✅ Settings Screen
- [ ] Tab through all settings rows
- [ ] Focus indicator on each list item
- [ ] Enter/Space activates navigation (About, Privacy, Terms)
- [ ] Tab through toggle switches (if using custom switch component)

#### ✅ Onboarding Flow
- [ ] Tab through all buttons on each screen
- [ ] "Get Started", "Back", "Continue", "Skip" buttons - focus visible
- [ ] Deity selection cards - focus visible
- [ ] Time picker - keyboard accessible (native component)

---

### Visual Focus Indicator Standards

All focus indicators should be:
- ✅ **Visible**: Clearly distinguishable from unfocused state
- ✅ **Consistent**: Use primary orange color (#FF9800)
- ✅ **Sufficient contrast**: Border + shadow for visibility
- ✅ **Not obtrusive**: Subtle shadow (opacity 0.4-0.6)

**Good Examples:**
```typescript
// Button focus indicator (all variants except ghost)
{
  borderWidth: 3,
  borderColor: Colors.primary, // #FF9800
  paddingVertical: -1, // Compensate for border
  paddingHorizontal: -1,
}

// Card focus indicator
{
  borderWidth: 2,
  borderColor: Colors.primary,
  shadowColor: Colors.primary,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.4,
  shadowRadius: 4,
  elevation: 4, // Android
}

// ListItem focus indicator (more subtle, list-appropriate)
{
  backgroundColor: 'rgba(255, 152, 0, 0.1)', // 10% orange tint
  borderLeftWidth: 3,
  borderLeftColor: Colors.primary,
}
```

---

## Known Limitations

1. **React Native Keyboard Navigation**: Not as mature as web accessibility. Some limitations exist:
   - Tab order is automatic (can't manually set tabIndex in most cases)
   - Some native components (like DateTimePicker) may have limited keyboard support

2. **Modal Focus Management**: Focus trap is basic. For production, consider using a library like `react-native-aria` for more robust modal focus management.

3. **Complex Components**: ScrollView keyboard navigation is limited. Consider adding keyboard shortcuts (e.g., Page Up/Down) for long lists if needed.

---

## Testing Matrix

| Component | Tab Focus | Visual Indicator | Enter/Space Activation | Focus Trap (Modals) |
|-----------|-----------|------------------|------------------------|---------------------|
| Button    | ✅        | ✅               | ✅                     | N/A                 |
| Card      | ✅        | ✅               | ✅                     | N/A                 |
| Input     | ✅        | ✅               | ✅ (native)            | N/A                 |
| ListItem  | ✅        | ✅               | ✅                     | N/A                 |
| MalaCounter | ✅      | ✅               | ✅                     | N/A                 |
| Timer     | ✅        | ✅               | ✅                     | N/A                 |
| Modal     | ✅        | ✅               | ✅                     | ⚠️ Basic (needs improvement) |

---

## Common Issues and Fixes

### Issue 1: Focus indicator not visible
**Symptom**: Pressing Tab does nothing visible
**Cause**: Component not using Pressable, or missing onFocus/onBlur handlers
**Fix**: Replace TouchableOpacity with Pressable, add focus state

### Issue 2: Tab order is incorrect
**Symptom**: Tab skips elements or goes in wrong order
**Cause**: Component layout (flex order) determines tab order
**Fix**: Adjust component layout (top-to-bottom, left-to-right), or use `tabIndex` if supported

### Issue 3: Focus indicator too subtle
**Symptom**: Hard to see which element is focused
**Cause**: Insufficient border width or contrast
**Fix**: Increase border width (3px recommended), add shadow for visibility

### Issue 4: Enter key doesn't activate
**Symptom**: Tab works but Enter/Space doesn't trigger action
**Cause**: Pressable not handling keyboard events properly
**Fix**: Ensure `accessibilityRole="button"` is set

---

## Next Steps

After validating keyboard navigation:

1. **P0 #12: Screen Reader Optimization** (Days 28-30)
   - Audit all accessibility labels and hints
   - Add announcements for state changes
   - Group related elements

2. **P0 #13: Focus Management** (Day 31)
   - Improve modal focus trap (use library)
   - Return focus on modal close
   - Navigation focus management

3. **P0 #15: Accessible Modals** (Day 32)
   - Add `accessibilityViewIsModal={true}`
   - Escape key to close
   - Proper role="dialog"

---

## Resources

- [React Native Accessibility Docs](https://reactnative.dev/docs/accessibility)
- [iOS VoiceOver Guide](https://support.apple.com/guide/iphone/turn-on-and-practice-voiceover-iph3e2e415f/ios)
- [Android TalkBack Guide](https://support.google.com/accessibility/android/answer/6283677)
- [WCAG 2.4.7: Focus Visible](https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html)

---

**Testing Status**: ⏳ Pending Manual Testing
**Estimated Testing Time**: 30-45 minutes
**Priority**: High (P0 Critical)
