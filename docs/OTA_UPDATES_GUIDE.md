# OTA Updates Guide - Shloka Sadhana
## V3 Feature #7: Over-The-Air Updates via Expo EAS

**Last Updated:** February 7, 2026

---

## Overview

Shloka Sadhana uses **Expo Application Services (EAS)** for Over-The-Air (OTA) updates. This allows you to push code updates directly to users without going through App Store/Google Play review.

---

## What Can Be Updated via OTA?

### ✅ **YES - JavaScript/React Native Code:**
- UI changes (colors, layout, text)
- New screens or components
- Business logic
- Content updates (shlokas, festivals, etc.)
- Bug fixes in JS code
- Navigation changes
- State management

### ❌ **NO - Native Code/Config:**
- Changes to `app.json` configuration
- New native dependencies
- Changes to permissions
- App icon or splash screen
- Native code (Swift/Kotlin)

**For native changes, you must submit new builds to App Store/Google Play.**

---

## Setup (Already Complete)

The following setup has already been completed:

1. ✅ `eas-cli` installed globally
2. ✅ `expo-updates` package installed
3. ✅ `eas.json` configuration created
4. ✅ `app.json` updated with updates config
5. ✅ `useAppUpdates` hook created
6. ✅ Integrated into `App.tsx`

---

## How to Push Updates

### Prerequisites

1. **Link Project to EAS (One-time)**
   ```bash
   # Login to Expo account
   npx eas-cli login

   # Initialize project (if not done)
   npx eas init

   # This will:
   # - Create an EAS project
   # - Generate a project ID
   # - Update app.json with the project ID
   ```

2. **Build and Submit Initial App**
   ```bash
   # Build for iOS
   npx eas build --platform ios --profile production

   # Build for Android
   npx eas build --platform android --profile production

   # Submit to stores
   npx eas submit --platform ios
   npx eas submit --platform android
   ```

### Pushing Updates

**After users have installed the app from stores:**

```bash
# Make your code changes (e.g., fix typo, add content, etc.)
# Then push the update:

npx eas update --branch production --message "Fixed Gayatri Mantra translation"
```

**That's it!** Users will get the update next time they open the app.

---

## Update Channels

We have 3 update channels configured:

### 1. **Production Channel**
```bash
npx eas update --branch production --message "Your update message"
```
- For live users
- Stable, tested code only
- Auto-applies to all users

### 2. **Preview Channel**
```bash
npx eas update --branch preview --message "Testing new feature"
```
- For internal testing
- Test updates before pushing to production
- Limited to test devices

### 3. **Development Channel**
```bash
npx eas update --branch development --message "Experimental feature"
```
- For active development
- Experimental features
- Developers only

---

## How Updates Work

### Automatic Updates (Current Implementation)

1. **User opens app**
2. `useAppUpdates` hook checks for updates
3. If update available → Downloads in background
4. App reloads automatically with new code
5. User sees updated app immediately

**No user action required!**

### Update Flow Diagram

```
App Launch
    ↓
useAppUpdates.checkForUpdates()
    ↓
┌─────────────────────┐
│ Update Available?   │
└─────────────────────┘
    ↓               ↓
   YES             NO
    ↓               ↓
fetchUpdate()    Continue
    ↓               normally
reloadApp()
    ↓
Updated!
```

---

## Example Workflow

### Scenario: Fix Typo in Shloka

**1. Find the typo:**
```typescript
// src/data/shlokas_content.json
{
  "name": "Gaytri Mantra"  // ❌ Typo!
}
```

**2. Fix it:**
```typescript
{
  "name": "Gayatri Mantra"  // ✅ Fixed!
}
```

**3. Test locally:**
```bash
npm start
# Verify fix in app
```

**4. Push update:**
```bash
npx eas update --branch production --message "Fixed typo in Gayatri Mantra name"
```

**5. Result:**
- Update published in ~2 minutes
- All users get fix next time they open app
- No App Store review needed
- No waiting period

---

## Update Best Practices

### 1. **Test Before Publishing**
```bash
# Always test in preview first
npx eas update --branch preview --message "Test fix"

# Test on device
# If good, push to production
npx eas update --branch production --message "Fix verified"
```

### 2. **Write Clear Messages**
```bash
# ✅ Good message
npx eas update --branch production --message "Fixed pause button not working in timer"

# ❌ Bad message
npx eas update --branch production --message "bug fix"
```

### 3. **Version Tracking**
```bash
# Include version in commit
git commit -m "Fix timer pause bug - OTA v1.0.1"
git push

# Then push update
npx eas update --branch production --message "Fix timer pause bug - v1.0.1"
```

### 4. **Rollback if Needed**
```bash
# List recent updates
npx eas update:list --branch production

# Rollback to previous update
npx eas update:rollback --branch production
```

---

## Monitoring Updates

### Check Update Status
```bash
# View all updates for production channel
npx eas update:list --branch production

# View details of specific update
npx eas update:view [update-id]
```

### View Analytics
```bash
# See how many users have received update
npx eas update:analytics --branch production
```

---

## Troubleshooting

### Issue: Update not received by users

**Check:**
1. Did you push to correct channel? (`--branch production`)
2. Is app using same channel in `eas.json`?
3. Is user on latest native build from App Store?
4. Check app logs for update errors

**Solution:**
```bash
# Verify update was published
npx eas update:list --branch production

# Check latest update
npx eas update:view [latest-update-id]
```

### Issue: App crashes after update

**Immediate Fix:**
```bash
# Rollback to previous version
npx eas update:rollback --branch production
```

**Permanent Fix:**
1. Find and fix the bug
2. Test in preview channel
3. Push fixed update to production

---

## Update Configuration

### Current Settings (app.json)

```json
{
  "updates": {
    "enabled": true,
    "checkAutomatically": "ON_LOAD",  // Check on app launch
    "fallbackToCacheTimeout": 0,       // Always try update first
    "url": "https://u.expo.dev/[project-id]"
  },
  "runtimeVersion": {
    "policy": "appVersion"  // Updates tied to app version
  }
}
```

### Update Channels (eas.json)

```json
{
  "update": {
    "production": {
      "channel": "production"
    },
    "preview": {
      "channel": "preview"
    },
    "development": {
      "channel": "development"
    }
  }
}
```

---

## Common Update Scenarios

### 1. **Content Update** (Most Common)
```bash
# Add new shloka to shlokas_content.json
# Add new festival to festivals.json
# Update translation text

npx eas update --branch production --message "Added Durga Chalisa and Navratri festival"
```

### 2. **Bug Fix**
```bash
# Fix timer logic
# Fix UI rendering issue
# Fix navigation bug

npx eas update --branch production --message "Fixed timer not pausing correctly"
```

### 3. **Feature Enhancement**
```bash
# Add new UI component
# Improve existing feature
# Add new screen

npx eas update --branch production --message "Enhanced streak display with animations"
```

### 4. **Emergency Hotfix**
```bash
# Critical bug needs immediate fix

# 1. Fix the bug
# 2. Test quickly
# 3. Push immediately
npx eas update --branch production --message "HOTFIX: Crash on app launch"

# 4. Monitor rollout
npx eas update:analytics --branch production
```

---

## Cost & Limits

**Expo EAS Pricing:**
- Free tier: Limited updates per month
- Production tier: ~$99/month
  - Unlimited updates
  - Priority support
  - Advanced analytics

**Current Plan:** Free tier (sufficient for initial launch)

---

## Next Steps

1. **Link project to EAS:**
   ```bash
   npx eas init
   ```

2. **Build initial app:**
   ```bash
   npx eas build --platform all --profile production
   ```

3. **Submit to stores:**
   ```bash
   npx eas submit --platform all
   ```

4. **Start pushing updates:**
   ```bash
   npx eas update --branch production --message "First OTA update!"
   ```

---

## Support & Documentation

- **Expo EAS Docs:** https://docs.expo.dev/eas-update/introduction/
- **Update Best Practices:** https://docs.expo.dev/eas-update/best-practices/
- **Troubleshooting:** https://docs.expo.dev/eas-update/troubleshooting/

---

**Feature #7 Status:** ✅ **COMPLETE**
**Implementation Date:** February 7, 2026
**All V3 Features:** 🎉 **100% COMPLETE!**
