/**
 * Friends Screen
 * Shloka Sadhana - Phase 2A Week 16-17: Friend System + Activity Feed
 *
 * Main friends screen with three tabs:
 * - Activity: Friend activity feed with reactions
 * - Friends: List of all friends with current streaks
 * - Requests: Incoming and outgoing friend requests
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSocialStore } from '@/stores/useSocialStore';
import { ActivityFeed } from '@/components/social/ActivityFeed';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { analyticsService } from '@/services/analytics';
import { AnalyticsEvents } from '@/constants/AnalyticsEvents';
import type { RootStackParamList } from '@/types/navigation';
import type { Friend, FriendRequest } from '@/types/social';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type Tab = 'activity' | 'friends' | 'requests';

/**
 * FriendsScreen Component
 */
export const FriendsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [activeTab, setActiveTab] = useState<Tab>('activity');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    friends,
    friendsLoading,
    incomingRequests,
    outgoingRequests,
    requestsLoading,
    stats,
    loadFriends,
    loadRequests,
    loadSocialStats,
    acceptFriendRequest,
    declineFriendRequest,
    cancelFriendRequest,
  } = useSocialStore();

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([loadFriends(), loadRequests(), loadSocialStats()]);
    };

    loadData();

    // Track screen view
    analyticsService.trackEvent(AnalyticsEvents.SCREEN_VIEWED, {
      screen_name: 'FriendsScreen',
    });
  }, []);

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([loadFriends(), loadRequests(), loadSocialStats()]);
    } catch (error) {
      console.error('[FriendsScreen] Error refreshing:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Navigate to user search
  const handleSearch = () => {
    navigation.navigate('UserSearch');
    analyticsService.trackEvent('friend_search_opened');
  };

  // Navigate to friend profile
  const handleFriendPress = (friend: Friend) => {
    navigation.navigate('UserProfile', { userId: friend.userId });
    analyticsService.trackEvent('friend_profile_viewed', {
      friend_user_id: friend.userId,
    });
  };

  // Accept friend request
  const handleAcceptRequest = async (request: FriendRequest) => {
    try {
      await acceptFriendRequest(request.id);
      analyticsService.trackEvent('friend_request_accepted', {
        from_user_id: request.fromUserId,
      });
    } catch (error) {
      console.error('[FriendsScreen] Error accepting request:', error);
      alert('Failed to accept friend request. Please try again.');
    }
  };

  // Decline friend request
  const handleDeclineRequest = async (request: FriendRequest) => {
    try {
      await declineFriendRequest(request.id);
      analyticsService.trackEvent('friend_request_declined', {
        from_user_id: request.fromUserId,
      });
    } catch (error) {
      console.error('[FriendsScreen] Error declining request:', error);
      alert('Failed to decline friend request. Please try again.');
    }
  };

  // Cancel friend request
  const handleCancelRequest = async (request: FriendRequest) => {
    try {
      await cancelFriendRequest(request.id);
      analyticsService.trackEvent('friend_request_cancelled', {
        to_user_id: request.toUserId,
      });
    } catch (error) {
      console.error('[FriendsScreen] Error cancelling request:', error);
      alert('Failed to cancel friend request. Please try again.');
    }
  };

  // Render friend item
  const renderFriendItem = ({ item }: { item: Friend }) => (
    <TouchableOpacity
      style={styles.friendItem}
      onPress={() => handleFriendPress(item)}
      accessibilityRole="button"
      accessibilityLabel={`View ${item.profile.displayName}'s profile`}
    >
      <View style={styles.friendAvatar}>
        {item.profile.photoURL ? (
          <Text style={styles.friendAvatarText}>
            {item.profile.displayName.charAt(0).toUpperCase()}
          </Text>
        ) : (
          <Text style={styles.friendAvatarText}>
            {item.profile.displayName.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.profile.displayName}</Text>
        <View style={styles.friendStats}>
          <Text style={styles.friendStatText}>
            🔥 {item.profile.currentStreak} day streak
          </Text>
          <Text style={styles.friendStatDivider}>•</Text>
          <Text style={styles.friendStatText}>
            🎯 {item.profile.totalPractices} practices
          </Text>
        </View>
        {item.profile.favoriteDeity && (
          <Text style={styles.friendDeity}>🙏 {item.profile.favoriteDeity}</Text>
        )}
      </View>
      <Text style={styles.friendChevron}>›</Text>
    </TouchableOpacity>
  );

  // Render incoming request
  const renderIncomingRequest = ({ item }: { item: FriendRequest }) => (
    <View style={styles.requestItem}>
      <View style={styles.requestAvatar}>
        <Text style={styles.requestAvatarText}>
          {item.fromUserProfile.displayName.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.requestInfo}>
        <Text style={styles.requestName}>{item.fromUserProfile.displayName}</Text>
        <Text style={styles.requestTime}>
          {getRelativeTime(new Date(item.createdAt))}
        </Text>
      </View>
      <View style={styles.requestActions}>
        <TouchableOpacity
          style={[styles.requestButton, styles.acceptButton]}
          onPress={() => handleAcceptRequest(item)}
          accessibilityRole="button"
          accessibilityLabel="Accept friend request"
        >
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.requestButton, styles.declineButton]}
          onPress={() => handleDeclineRequest(item)}
          accessibilityRole="button"
          accessibilityLabel="Decline friend request"
        >
          <Text style={styles.declineButtonText}>Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render outgoing request
  const renderOutgoingRequest = ({ item }: { item: FriendRequest }) => (
    <View style={styles.requestItem}>
      <View style={styles.requestAvatar}>
        <Text style={styles.requestAvatarText}>?</Text>
      </View>
      <View style={styles.requestInfo}>
        <Text style={styles.requestName}>Friend request sent</Text>
        <Text style={styles.requestTime}>
          {getRelativeTime(new Date(item.createdAt))}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.requestButton, styles.cancelButton]}
        onPress={() => handleCancelRequest(item)}
        accessibilityRole="button"
        accessibilityLabel="Cancel friend request"
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );

  // Empty state for friends
  const renderEmptyFriends = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>👥</Text>
      <Text style={styles.emptyTitle}>No friends yet</Text>
      <Text style={styles.emptyDescription}>
        Search for friends to practice together and share your spiritual journey
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={handleSearch}>
        <Text style={styles.emptyButtonText}>Find Friends</Text>
      </TouchableOpacity>
    </View>
  );

  // Empty state for requests
  const renderEmptyRequests = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📬</Text>
      <Text style={styles.emptyTitle}>No friend requests</Text>
      <Text style={styles.emptyDescription}>
        When someone sends you a friend request, it will appear here
      </Text>
    </View>
  );

  // Loading state
  const isLoading = friendsLoading || requestsLoading;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Friends</Text>
        <TouchableOpacity
          onPress={handleSearch}
          style={styles.searchButton}
          accessibilityRole="button"
          accessibilityLabel="Search for friends"
        >
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.friendCount}</Text>
          <Text style={styles.statLabel}>Friends</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.pendingRequests}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.sentRequests}</Text>
          <Text style={styles.statLabel}>Sent</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'activity' && styles.activeTab]}
          onPress={() => setActiveTab('activity')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'activity' }}
        >
          <Text
            style={[styles.tabText, activeTab === 'activity' && styles.activeTabText]}
          >
            Activity
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
          onPress={() => setActiveTab('friends')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'friends' }}
        >
          <Text
            style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}
          >
            Friends ({friends.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
          onPress={() => setActiveTab('requests')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'requests' }}
        >
          <Text
            style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}
          >
            Requests ({incomingRequests.length + outgoingRequests.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading && !isRefreshing && activeTab !== 'activity' ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : activeTab === 'activity' ? (
        <ActivityFeed enableRealtime={true} />
      ) : activeTab === 'friends' ? (
        <FlatList
          data={friends}
          renderItem={renderFriendItem}
          keyExtractor={(item) => item.userId}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyFriends}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
            />
          }
        />
      ) : (
        <FlatList
          data={[
            ...incomingRequests.map((r) => ({ ...r, type: 'incoming' })),
            ...outgoingRequests.map((r) => ({ ...r, type: 'outgoing' })),
          ]}
          renderItem={({ item }) =>
            item.type === 'incoming'
              ? renderIncomingRequest({ item })
              : renderOutgoingRequest({ item })
          }
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyRequests}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
            />
          }
        />
      )}
    </View>
  );
};

/**
 * Get relative time string (e.g., "2 hours ago")
 */
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  const diffWeeks = Math.floor(diffDays / 7);
  return `${diffWeeks}w ago`;
}

const styles = StyleSheet.create({
  acceptButton: {
    backgroundColor: Colors.primary,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  activeTab: {
    borderBottomColor: Colors.primary,
    borderBottomWidth: 2,
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
  },
  cancelButtonText: {
    color: Colors.text.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  declineButton: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
  },
  declineButtonText: {
    color: Colors.text.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    borderRadius: Layout.borderRadius.lg,
    marginTop: Layout.spacing.lg,
    paddingHorizontal: Layout.spacing.xl,
    paddingVertical: Layout.spacing.md,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
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
  friendAvatar: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  friendAvatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  friendChevron: {
    color: Colors.text.secondary,
    fontSize: 24,
  },
  friendDeity: {
    color: Colors.text.secondary,
    fontSize: 13,
    marginTop: Layout.spacing.xs,
  },
  friendInfo: {
    flex: 1,
    marginLeft: Layout.spacing.md,
  },
  friendItem: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
  },
  friendName: {
    color: Colors.text.primary,
    fontSize: 17,
    fontWeight: '600',
    marginBottom: Layout.spacing.xs,
  },
  friendStatDivider: {
    color: Colors.text.secondary,
    marginHorizontal: Layout.spacing.sm,
  },
  friendStatText: {
    color: Colors.text.secondary,
    fontSize: 13,
  },
  friendStats: {
    flexDirection: 'row',
  },
  header: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.spacing.lg,
    paddingTop: Layout.spacing.xxl,
    paddingVertical: Layout.spacing.md,
  },
  listContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  requestActions: {
    flexDirection: 'row',
    gap: Layout.spacing.sm,
  },
  requestAvatar: {
    alignItems: 'center',
    backgroundColor: Colors.border,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  requestAvatarText: {
    color: Colors.text.secondary,
    fontSize: 18,
    fontWeight: '600',
  },
  requestButton: {
    borderRadius: Layout.borderRadius.md,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
  },
  requestInfo: {
    flex: 1,
    marginLeft: Layout.spacing.md,
  },
  requestItem: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
  },
  requestName: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Layout.spacing.xs,
  },
  requestTime: {
    color: Colors.text.secondary,
    fontSize: 13,
  },
  searchButton: {
    padding: Layout.spacing.sm,
  },
  searchIcon: {
    fontSize: 22,
  },
  statDivider: {
    backgroundColor: Colors.border,
    height: 40,
    width: 1,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    color: Colors.text.secondary,
    fontSize: 13,
    marginTop: Layout.spacing.xs,
  },
  statValue: {
    color: Colors.text.primary,
    fontSize: 24,
    fontWeight: '700',
  },
  statsContainer: {
    backgroundColor: Colors.surface,
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingVertical: Layout.spacing.lg,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: Layout.spacing.md,
  },
  tabContainer: {
    backgroundColor: Colors.surface,
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
  },
  tabText: {
    color: Colors.text.secondary,
    fontSize: 15,
    fontWeight: '500',
  },
  title: {
    color: Colors.text.primary,
    fontSize: 28,
    fontWeight: '700',
  },
});
