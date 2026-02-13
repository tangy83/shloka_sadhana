# Firebase Remote Config Setup Guide
**Shloka Sadhana - Phase 2A Feature Flags**

## Overview

Firebase Remote Config enables gradual rollout of Phase 2A features without requiring app updates. This allows us to:
- Enable features for specific user segments (e.g., 10% → 50% → 100%)
- A/B test features
- Quickly disable features if issues arise
- Control feature access by platform, country, or user properties

---

## Firebase Console Setup

### 1. Enable Remote Config

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project: "Shloka Sadhana"
3. Left sidebar → Remote Config → Get started

### 2. Create Feature Flag Parameters

For each Phase 2A feature, create a boolean parameter:

| Parameter Name | Type | Default Value | Description |
|---|---|---|---|
| `daily_quests_enabled` | Boolean | `false` | Week 13-14: Quest system |
| `personalized_feed_enabled` | Boolean | `false` | Week 14: Dynamic home feed |
| `enhanced_recommendations_enabled` | Boolean | `false` | Week 15: ML recommendations |
| `social_sharing_enabled` | Boolean | `false` | Week 16: Share achievements |
| `friend_system_enabled` | Boolean | `false` | Week 16: Friends & requests |
| `activity_feed_enabled` | Boolean | `false` | Week 17: Friend activity feed |
| `group_system_enabled` | Boolean | `false` | Week 17: Groups & members |
| `group_challenges_enabled` | Boolean | `false` | Week 18: Group challenges |
| `referral_program_enabled` | Boolean | `false` | Week 18: Referral codes |
| `ml_recommendations_enabled` | Boolean | `false` | Experimental: Advanced ML |
| `push_notifications_enabled` | Boolean | `true` | Keep notifications on |

**Steps to add each parameter:**
1. Click "Add parameter"
2. Parameter key: (use exact names above)
3. Default value: `false` (or `true` for notifications)
4. Description: Copy from table
5. Click "Save"

### 3. Create Conditions (Optional)

Use conditions to target specific user segments:

**Example: 10% Rollout**
```
Condition name: phase_2a_beta_10_percent
Applies if: Random percentile number <= 10
```

**Example: Internal Testing**
```
Condition name: internal_testers
Applies if: User in audience "Internal Testers"
```

**Example: Platform-specific**
```
Condition name: ios_users
Applies if: Platform == iOS
```

### 4. Set Conditional Values

For each parameter, you can set different values based on conditions:

**Example for `daily_quests_enabled`:**
- **Default value**: `false` (all users)
- **Condition: internal_testers** → `true`
- **Condition: phase_2a_beta_10_percent** → `true`

This creates a gradual rollout:
1. Start: Internal testers only
2. Week 1: 10% of users
3. Week 2: 50% of users
4. Week 3: 100% of users

### 5. Publish Configuration

After adding all parameters and conditions:
1. Click "Publish changes"
2. Add description: "Phase 2A feature flags - initial setup"
3. Confirm publish

---

## Gradual Rollout Strategy

### Week 13-18 Rollout Schedule

| Week | Feature | Rollout |
|---|---|---|
| 13 | Quest System | Internal → 10% → 50% → 100% |
| 14 | Personalized Feed | Internal → 25% → 100% |
| 15 | Enhanced Recommendations | Internal → 50% → 100% |
| 16 | Social Sharing | Internal → 25% → 100% |
| 16 | Friend System | Internal → 10% → 50% → 100% |
| 17 | Activity Feed | Internal → 25% → 100% |
| 17 | Group System | Internal → 10% → 50% → 100% |
| 18 | Group Challenges | Internal → 25% → 100% |
| 18 | Referral Program | Internal → 50% → 100% |

**Recommended Cadence:**
- **Internal (5-10 users)**: 3 days monitoring
- **10% (50-100 users)**: 1 week monitoring
- **50% (250-500 users)**: 1 week monitoring
- **100% (all users)**: Fully launched

### Success Criteria for Rollout

Before increasing rollout percentage, verify:
- ✅ Crash-free rate >99.5%
- ✅ Feature usage >30% of enabled users
- ✅ No critical bug reports
- ✅ Performance metrics stable (app launch time, memory)

---

## Code Usage

### Using Feature Flags in Components

```typescript
import { useFeatureFlag } from '@/hooks/useFeatureFlags';

export const HomeScreen = () => {
  const isQuestsEnabled = useFeatureFlag('daily_quests_enabled');
  const isFeedEnabled = useFeatureFlag('personalized_feed_enabled');

  return (
    <View>
      {isQuestsEnabled && <DailyQuestCard />}
      {isFeedEnabled ? <PersonalizedFeed /> : <StaticFeed />}
    </View>
  );
};
```

### Getting All Flags

```typescript
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

export const DebugScreen = () => {
  const { flags, loading } = useFeatureFlags();

  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <View>
      <Text>Quest System: {flags.daily_quests_enabled ? 'ON' : 'OFF'}</Text>
      <Text>Friends: {flags.friend_system_enabled ? 'ON' : 'OFF'}</Text>
    </View>
  );
};
```

### Conditional Navigation

```typescript
import { remoteConfigService } from '@/services/remoteConfig';

const handleSharePress = () => {
  if (remoteConfigService.isFeatureEnabled('social_sharing_enabled')) {
    navigation.navigate('ShareModal');
  } else {
    Alert.alert('Coming Soon', 'Social sharing will be available soon!');
  }
};
```

---

## Testing

### Test Feature Flags Locally

**Option 1: Override defaults in code (for development)**
```typescript
// In remoteConfig.ts, change DEFAULT_FLAGS:
const DEFAULT_FLAGS: FeatureFlags = {
  daily_quests_enabled: true, // Enable for local testing
  personalized_feed_enabled: true,
  // ...
};
```

**Option 2: Force fetch from Firebase (respects Remote Config settings)**
```typescript
import { remoteConfigService } from '@/services/remoteConfig';

// In a debug screen or useEffect
await remoteConfigService.forceFetch();
```

**Option 3: Use Firebase Console "Test on Device"**
1. Go to Remote Config → Settings
2. Add your device's Firebase Installation ID
3. Set test values for this device
4. Force fetch in app

### Verify Feature Flags Working

Add a debug screen to verify flags:

```typescript
export const DebugFlagsScreen = () => {
  const { flags } = useFeatureFlags();

  return (
    <ScrollView>
      <Text style={styles.title}>Feature Flags</Text>
      {Object.entries(flags).map(([key, value]) => (
        <Text key={key}>
          {key}: {value ? '✅ ON' : '❌ OFF'}
        </Text>
      ))}
    </ScrollView>
  );
};
```

---

## Monitoring

### Firebase Console Metrics

Monitor in Firebase Console → Remote Config → Analytics:
- **Fetch count**: How many times config was fetched
- **Active users**: Users with each flag enabled
- **Error rate**: Failed fetches

### Custom Analytics

Track flag state in app analytics:

```typescript
import { analyticsService } from '@/services/analytics';

// After Remote Config loads
const flags = remoteConfigService.getFeatureFlags();
analyticsService.trackEvent('remote_config_loaded', {
  daily_quests_enabled: flags.daily_quests_enabled,
  friend_system_enabled: flags.friend_system_enabled,
  // ... other flags
});
```

---

## Troubleshooting

### Flags not updating?

**Check minimum fetch interval:**
```typescript
// In remoteConfig.ts, reduce interval for testing:
minimumFetchIntervalMillis: 0, // Fetch immediately (dev only)
```

**Force fetch:**
```typescript
await remoteConfigService.forceFetch();
```

**Clear app data:**
- iOS: Delete app and reinstall
- Android: Settings → Apps → Shloka Sadhana → Clear data

### Default values being used?

Check initialization:
```typescript
// Should log "Initialized successfully"
console.log('[RemoteConfig] Initialized successfully');
```

If initialization fails, app falls back to `DEFAULT_FLAGS` in `remoteConfig.ts`.

### Feature not showing?

1. **Check flag value** in Firebase Console
2. **Check condition** (is user in target segment?)
3. **Check component** (is it reading the correct flag?)
4. **Force refresh** app state (pull-to-refresh or restart app)

---

## Best Practices

1. **Always have defaults**: Define sensible defaults in code for offline scenarios
2. **Feature flag granularity**: One flag per feature, not per screen
3. **Cleanup old flags**: Remove flags after 100% rollout (6-8 weeks post-launch)
4. **Document flag purpose**: Add descriptions in Firebase Console
5. **Test both states**: Test with feature ON and OFF
6. **Monitor post-rollout**: Watch crash reports and user feedback for 48h after enabling
7. **Rollback plan**: Be prepared to disable flags if issues arise

---

## Emergency Rollback

If a feature causes issues:

1. **Disable in Firebase Console**:
   - Go to Remote Config
   - Set flag to `false`
   - Publish immediately (takes effect in ~1 hour for most users)

2. **Force app refresh** (optional):
   - Send push notification asking users to restart app
   - Or wait for natural app backgrounding/foregrounding

3. **Monitor recovery**:
   - Check crash rate drops
   - Verify user complaints stop

---

## Next Steps

After setup:
1. ✅ Create all 11 parameters in Firebase Console
2. ✅ Set up conditions for 10%, 50% rollout
3. ✅ Test with internal testers first
4. ✅ Monitor metrics during rollout
5. ✅ Gradually increase percentage based on success criteria
