# Production Setup Guide

## Overview
This guide covers production infrastructure setup for Shloka Sadhana, including error tracking, monitoring, and deployment configuration.

---

## 1. Sentry Error Tracking

### Setup Steps:

1. **Create Sentry Account**
   - Go to https://sentry.io/signup/
   - Create a new account (free tier available)

2. **Create New Project**
   - Click "Create Project"
   - Platform: React Native
   - Project name: `shloka-sadhana`
   - Copy the DSN (Data Source Name)

3. **Configure Environment Variables**
   ```bash
   # Copy example env file
   cp .env.example .env

   # Add your Sentry DSN
   SENTRY_DSN=https://your-key@sentry.io/your-project-id
   ```

4. **Update app.json**
   ```json
   {
     "expo": {
       "extra": {
         "sentryDsn": "YOUR_SENTRY_DSN_HERE"
       }
     }
   }
   ```

### Sentry Features Enabled:

- ✅ **Crash Reporting**: Automatic error capture
- ✅ **Performance Monitoring**: 20% transaction sampling
- ✅ **Breadcrumbs**: User action tracking before errors
- ✅ **Release Tracking**: Version-based error grouping
- ✅ **Native Crash Handling**: iOS/Android native crashes
- ✅ **Source Maps**: Readable stack traces (configured in EAS Build)

### Error Categories:
- Storage errors (AsyncStorage operations)
- Network errors (API calls - Phase 2)
- Navigation errors (React Navigation)
- Practice session errors (timer, mala counter)
- Notification errors (scheduling, permissions)
- Audio errors (playback issues)
- Calendar errors (Hindu calendar calculations)

---

## 2. Error Boundary Implementation

### Usage:

The `ErrorBoundary` component is already integrated in `App.tsx`:

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

<ErrorBoundary>
  <YourApp />
</ErrorBoundary>
```

### Features:
- ✅ Catches React component errors
- ✅ Displays user-friendly fallback UI
- ✅ Logs errors to Sentry in production
- ✅ Shows error details in development
- ✅ "Try Again" button to reset error state

### Custom Fallback UI (Optional):
```tsx
<ErrorBoundary
  fallback={(error, resetError) => (
    <CustomErrorScreen error={error} onReset={resetError} />
  )}
>
  <YourApp />
</ErrorBoundary>
```

---

## 3. Error Logging Utilities

### Usage Examples:

```typescript
import {
  logAppError,
  logStorageError,
  logPracticeError,
  ErrorCategory,
  ErrorSeverity
} from '@/utils/errorLogger';

// Generic error logging
try {
  // Some operation
} catch (error) {
  logAppError(
    error as Error,
    ErrorCategory.PRACTICE,
    ErrorSeverity.HIGH,
    { sessionId: '123', shlokaId: 'bhagavad-gita' }
  );
}

// Specific error logging
try {
  await AsyncStorage.setItem(key, value);
} catch (error) {
  logStorageError(error as Error, 'write', key);
}

// Practice session error
try {
  await savePracticeSession(session);
} catch (error) {
  logPracticeError(error as Error, {
    sessionId: session.id,
    shlokaId: session.shlokaId,
    duration: session.duration,
  });
}
```

### Async Error Handling:
```typescript
import { handleAsync } from '@/utils/errorLogger';

// Wraps async operations with automatic error logging
const { data, error } = await handleAsync(
  () => fetchSomeData(),
  ErrorCategory.NETWORK,
  ErrorSeverity.MEDIUM
);

if (error) {
  // Handle error
  return;
}

// Use data
```

---

## 4. Production Checklist

### Before First Production Build:

- [ ] Set up Sentry account and project
- [ ] Add Sentry DSN to environment variables
- [ ] Update app.json with Sentry DSN
- [ ] Test error reporting in staging/preview build
- [ ] Verify source maps are uploaded (EAS Build handles this)
- [ ] Set up Sentry alerts for critical errors
- [ ] Configure release tracking in Sentry

### Environment Variables:
```bash
# .env (DO NOT commit this file)
SENTRY_DSN=https://your-key@sentry.io/your-project-id
NODE_ENV=production
```

### app.json Configuration:
```json
{
  "expo": {
    "extra": {
      "sentryDsn": "YOUR_SENTRY_DSN_HERE"
    },
    "plugins": [
      "sentry-expo"
    ],
    "hooks": {
      "postPublish": [
        {
          "file": "sentry-expo/upload-sourcemaps",
          "config": {
            "organization": "your-org",
            "project": "shloka-sadhana"
          }
        }
      ]
    }
  }
}
```

---

## 5. Monitoring Best Practices

### Error Severity Guidelines:

1. **FATAL**: App crashes, can't recover
   - Examples: Native crashes, critical initialization failures
   - Action: Immediate fix required

2. **HIGH**: Core functionality broken
   - Examples: Can't save practice sessions, streak not tracking
   - Action: Fix within 24 hours

3. **MEDIUM**: Feature degradation
   - Examples: Notifications not working, audio playback issues
   - Action: Fix within 3-5 days

4. **LOW**: Minor issues, non-blocking
   - Examples: Analytics not tracking, UI glitches
   - Action: Fix in next release

### Breadcrumb Strategy:

Use breadcrumbs to track user journey before errors:
```typescript
import { addBreadcrumb } from '@/utils/sentry';

// Track important user actions
addBreadcrumb('Practice session started', 'practice', 'info', {
  shlokaId: 'bhagavad-gita',
  duration: 0,
});

addBreadcrumb('Mala count updated', 'practice', 'info', {
  count: 54,
});
```

---

## 6. Testing Error Tracking

### Development Mode:
- Errors logged to console only
- Sentry disabled in `__DEV__` mode
- Full error details visible

### Testing in Production Build:
```bash
# Create preview build to test Sentry
eas build --profile preview --platform ios

# Or use expo-dev-client
npm run start -- --dev-client
```

### Trigger Test Error:
```typescript
// Add this button temporarily to test error boundary
<Button
  onPress={() => { throw new Error('Test error'); }}
  title="Trigger Error"
/>
```

---

## 7. Privacy & Data Security

### User Privacy:
- ✅ No PII (Personally Identifiable Information) logged
- ✅ Anonymous user IDs only (guest-first app)
- ✅ Error messages sanitized (no user input in logs)
- ✅ Sentry configured with data scrubbing

### Data Retention:
- Errors retained for 90 days (Sentry default)
- Can be adjusted in Sentry settings
- Compliant with privacy regulations (GDPR, CCPA)

---

## 8. Cost Estimation

### Sentry Free Tier:
- 5,000 events/month
- 1 project
- 30-day data retention
- Sufficient for MVP launch

### Paid Plans (if needed):
- Growth: $26/month (50,000 events)
- Business: $80/month (150,000 events)
- Scales based on app usage

---

## 9. Next Steps (Phase 5 - Deployment)

1. Set up EAS Build configuration
2. Configure iOS certificates
3. Configure Android signing
4. Set up CI/CD pipeline
5. Create staging environment
6. Set up TestFlight (iOS)
7. Set up Play Store Internal Testing (Android)

---

## Support & Resources

- **Sentry Docs**: https://docs.sentry.io/platforms/react-native/
- **Expo + Sentry**: https://docs.expo.dev/guides/using-sentry/
- **EAS Build**: https://docs.expo.dev/build/introduction/
- **Error Boundary**: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary

---

**Status**: Phase 0.6 Complete ✅
**Next Phase**: Phase 1 - Core Infrastructure (AsyncStorage service, date utilities)
