/**
 * Remote Config Service
 * Shloka Sadhana - Phase 2A: Feature Flags
 *
 * Firebase Remote Config for gradual feature rollout
 */

import remoteConfig from '@react-native-firebase/remote-config';

/**
 * Feature flags for Phase 2A features
 */
export interface FeatureFlags {
  // Quest System (Week 13-14)
  daily_quests_enabled: boolean;
  personalized_feed_enabled: boolean;

  // Recommendations (Week 15)
  enhanced_recommendations_enabled: boolean;

  // Social Sharing (Week 16)
  social_sharing_enabled: boolean;
  friend_system_enabled: boolean;

  // Activity Feed (Week 17)
  activity_feed_enabled: boolean;
  group_system_enabled: boolean;

  // Challenges & Referrals (Week 18)
  group_challenges_enabled: boolean;
  referral_program_enabled: boolean;

  // Experimental features
  ml_recommendations_enabled: boolean;
  push_notifications_enabled: boolean;
}

/**
 * Default values for feature flags
 * Used when Remote Config fetch fails or for initial state
 */
const DEFAULT_FLAGS: FeatureFlags = {
  // Phase 2A features - disabled by default for gradual rollout
  daily_quests_enabled: false,
  personalized_feed_enabled: false,
  enhanced_recommendations_enabled: false,
  social_sharing_enabled: false,
  friend_system_enabled: false,
  activity_feed_enabled: false,
  group_system_enabled: false,
  group_challenges_enabled: false,
  referral_program_enabled: false,

  // Experimental
  ml_recommendations_enabled: false,
  push_notifications_enabled: true, // Keep notifications on
};

class RemoteConfigService {
  private initialized = false;

  /**
   * Initialize Remote Config with defaults
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('[RemoteConfig] Already initialized');
      return;
    }

    try {
      // Set defaults
      await remoteConfig().setDefaults(DEFAULT_FLAGS);

      // Set config settings
      await remoteConfig().setConfigSettings({
        minimumFetchIntervalMillis: 3600000, // 1 hour (production)
        // Use 0 for development to fetch immediately
        // minimumFetchIntervalMillis: 0,
      });

      // Fetch and activate
      await remoteConfig().fetchAndActivate();

      this.initialized = true;
      console.log('[RemoteConfig] Initialized successfully');
    } catch (error) {
      console.error('[RemoteConfig] Initialization error:', error);
      // Fall back to defaults
    }
  }

  /**
   * Get all feature flags
   */
  getFeatureFlags(): FeatureFlags {
    if (!this.initialized) {
      console.warn('[RemoteConfig] Not initialized, using defaults');
      return DEFAULT_FLAGS;
    }

    try {
      const flags: FeatureFlags = {
        daily_quests_enabled: remoteConfig().getBoolean('daily_quests_enabled'),
        personalized_feed_enabled: remoteConfig().getBoolean('personalized_feed_enabled'),
        enhanced_recommendations_enabled: remoteConfig().getBoolean(
          'enhanced_recommendations_enabled'
        ),
        social_sharing_enabled: remoteConfig().getBoolean('social_sharing_enabled'),
        friend_system_enabled: remoteConfig().getBoolean('friend_system_enabled'),
        activity_feed_enabled: remoteConfig().getBoolean('activity_feed_enabled'),
        group_system_enabled: remoteConfig().getBoolean('group_system_enabled'),
        group_challenges_enabled: remoteConfig().getBoolean('group_challenges_enabled'),
        referral_program_enabled: remoteConfig().getBoolean('referral_program_enabled'),
        ml_recommendations_enabled: remoteConfig().getBoolean('ml_recommendations_enabled'),
        push_notifications_enabled: remoteConfig().getBoolean('push_notifications_enabled'),
      };

      return flags;
    } catch (error) {
      console.error('[RemoteConfig] Error getting flags:', error);
      return DEFAULT_FLAGS;
    }
  }

  /**
   * Get a specific feature flag
   */
  isFeatureEnabled(feature: keyof FeatureFlags): boolean {
    if (!this.initialized) {
      return DEFAULT_FLAGS[feature];
    }

    try {
      return remoteConfig().getBoolean(feature);
    } catch (error) {
      console.error(`[RemoteConfig] Error getting flag ${feature}:`, error);
      return DEFAULT_FLAGS[feature];
    }
  }

  /**
   * Refresh feature flags from server
   * Call this when app comes to foreground
   */
  async refresh(): Promise<void> {
    try {
      const fetchedRemotely = await remoteConfig().fetchAndActivate();

      if (fetchedRemotely) {
        console.log('[RemoteConfig] New config fetched and activated');
      } else {
        console.log('[RemoteConfig] Config already up to date');
      }
    } catch (error) {
      console.error('[RemoteConfig] Error refreshing config:', error);
    }
  }

  /**
   * Get all config values (for debugging)
   */
  getAllValues(): Record<string, any> {
    if (!this.initialized) {
      return DEFAULT_FLAGS;
    }

    try {
      const allValues = remoteConfig().getAll();
      const values: Record<string, any> = {};

      Object.keys(allValues).forEach((key) => {
        values[key] = allValues[key].asString();
      });

      return values;
    } catch (error) {
      console.error('[RemoteConfig] Error getting all values:', error);
      return DEFAULT_FLAGS;
    }
  }

  /**
   * Force fetch config (for testing)
   * Use with caution - respects minimum fetch interval
   */
  async forceFetch(): Promise<void> {
    try {
      await remoteConfig().fetch(0); // Force immediate fetch
      await remoteConfig().activate();
      console.log('[RemoteConfig] Force fetch completed');
    } catch (error) {
      console.error('[RemoteConfig] Error in force fetch:', error);
    }
  }
}

export const remoteConfigService = new RemoteConfigService();
