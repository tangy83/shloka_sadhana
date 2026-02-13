/**
 * Activity Feed Component
 * Shloka Sadhana - Phase 2A Week 17: Friend Activity Feed
 *
 * Displays scrollable feed of friend activities with real-time updates
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { ActivityFeedItem as ActivityFeedItemType } from '@/types/activityFeed';
import { activityService } from '@/services/activityService';
import { ActivityFeedItem } from './ActivityFeedItem';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { analyticsService } from '@/services/analytics';

interface ActivityFeedProps {
  limit?: number;
  enableRealtime?: boolean;
}

/**
 * ActivityFeed Component
 */
export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  limit = 50,
  enableRealtime = true,
}) => {
  const [activities, setActivities] = useState<ActivityFeedItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load activities
  const loadActivities = async (silent: boolean = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      setError(null);

      const feed = await activityService.getActivityFeed({ limit });
      setActivities(feed);

      console.log(`[ActivityFeed] Loaded ${feed.length} activities`);
    } catch (err) {
      console.error('[ActivityFeed] Error loading activities:', err);
      setError('Failed to load activity feed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadActivities();

    // Track screen view
    analyticsService.trackEvent('activity_feed_viewed');
  }, []);

  // Real-time updates (optional)
  useEffect(() => {
    if (!enableRealtime) return;

    try {
      const unsubscribe = activityService.onActivityFeedChange((updatedActivities) => {
        setActivities(updatedActivities);
      });

      return () => {
        unsubscribe();
      };
    } catch (error) {
      console.error('[ActivityFeed] Error setting up real-time listener:', error);
      // Fall back to manual refresh
    }
  }, [enableRealtime]);

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadActivities(true);
    setRefreshing(false);
  };

  // Handle reaction change (reload to show updated reactions)
  const handleReactionChange = () => {
    loadActivities(true);
  };

  // Render activity item
  const renderActivity = ({ item }: { item: ActivityFeedItemType }) => (
    <ActivityFeedItem activity={item} onReactionChange={handleReactionChange} />
  );

  // Empty state
  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>👥</Text>
        <Text style={styles.emptyTitle}>No activities yet</Text>
        <Text style={styles.emptyDescription}>
          When your friends practice, unlock achievements, or complete quests, their activities
          will appear here
        </Text>
      </View>
    );
  };

  // Error state
  if (error && !loading && !refreshing) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>😔</Text>
        <Text style={styles.errorTitle}>Oops!</Text>
        <Text style={styles.errorMessage}>{error}</Text>
      </View>
    );
  }

  // Loading state
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading activities...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={activities}
      renderItem={renderActivity}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={renderEmpty}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={Colors.primary}
        />
      }
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={5}
      initialNumToRender={10}
    />
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Layout.spacing.xl,
    paddingVertical: Layout.spacing.xxxl,
  },
  emptyDescription: {
    color: Colors.text.secondary,
    fontSize: 15,
    lineHeight: 22,
    marginTop: Layout.spacing.sm,
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Layout.spacing.md,
  },
  emptyTitle: {
    color: Colors.text.primary,
    fontSize: 20,
    fontWeight: '600',
  },
  errorContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Layout.spacing.xl,
    paddingVertical: Layout.spacing.xxxl,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: Layout.spacing.md,
  },
  errorMessage: {
    color: Colors.text.secondary,
    fontSize: 15,
    lineHeight: 22,
    marginTop: Layout.spacing.sm,
    textAlign: 'center',
  },
  errorTitle: {
    color: Colors.text.primary,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: Layout.spacing.xs,
  },
  listContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: Layout.spacing.xxxl,
  },
  loadingText: {
    color: Colors.text.secondary,
    fontSize: 15,
    marginTop: Layout.spacing.md,
  },
});
