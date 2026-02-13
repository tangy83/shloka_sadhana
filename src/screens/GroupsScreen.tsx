/**
 * Groups Screen
 * Shloka Sadhana - Phase 2A Week 17: Group System
 *
 * Browse groups with "My Groups" and "Discover" tabs
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation';
import { useGroupStore } from '@/stores/useGroupStore';
import { Group, GroupDiscoveryItem, GroupInvite } from '@/types/groups';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Props {
  navigation: NavigationProp;
}

type Tab = 'myGroups' | 'discover' | 'invites';

export const GroupsScreen: React.FC<Props> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<Tab>('myGroups');
  const [refreshing, setRefreshing] = useState(false);

  const {
    myGroups,
    myGroupsLoading,
    publicGroups,
    discoveryLoading,
    groupInvites,
    invitesLoading,
    loadMyGroups,
    loadPublicGroups,
    loadGroupInvites,
    joinGroup,
    acceptInvite,
    declineInvite,
  } = useGroupStore();

  // Load data on mount
  useEffect(() => {
    loadMyGroups();
    loadPublicGroups();
    loadGroupInvites();
  }, []);

  // Refresh on tab change
  useEffect(() => {
    if (activeTab === 'myGroups') {
      loadMyGroups();
    } else if (activeTab === 'discover') {
      loadPublicGroups();
    } else if (activeTab === 'invites') {
      loadGroupInvites();
    }
  }, [activeTab]);

  const handleRefresh = async () => {
    setRefreshing(true);

    if (activeTab === 'myGroups') {
      await loadMyGroups();
    } else if (activeTab === 'discover') {
      await loadPublicGroups();
    } else if (activeTab === 'invites') {
      await loadGroupInvites();
    }

    setRefreshing(false);
  };

  const handleGroupPress = (groupId: string) => {
    navigation.navigate('GroupDetail', { groupId });
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      await joinGroup(groupId);
      Alert.alert('Success', 'You have joined the group!');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to join group');
    }
  };

  const handleAcceptInvite = async (inviteId: string) => {
    try {
      await acceptInvite(inviteId);
      Alert.alert('Success', 'You have joined the group!');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to accept invite');
    }
  };

  const handleDeclineInvite = async (inviteId: string) => {
    try {
      await declineInvite(inviteId);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to decline invite');
    }
  };

  const handleCreateGroup = () => {
    navigation.navigate('CreateGroup');
  };

  // Render Group Card (My Groups)
  const renderGroupCard = ({ item }: { item: Group }) => (
    <TouchableOpacity
      style={styles.groupCard}
      onPress={() => handleGroupPress(item.id)}
      accessible={true}
      accessibilityLabel={`Group: ${item.name}`}
      accessibilityRole="button"
    >
      {/* Group Icon */}
      <View style={styles.groupIcon}>
        <Text style={styles.groupIconText}>{item.name.charAt(0).toUpperCase()}</Text>
      </View>

      {/* Group Info */}
      <View style={styles.groupInfo}>
        <Text style={styles.groupName}>{item.name}</Text>
        <Text style={styles.groupDescription} numberOfLines={2}>
          {item.description}
        </Text>

        {/* Stats */}
        <View style={styles.groupStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.memberCount}</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.stats.totalPractices}</Text>
            <Text style={styles.statLabel}>Practices</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.stats.totalMinutes}</Text>
            <Text style={styles.statLabel}>Minutes</Text>
          </View>
        </View>
      </View>

      {/* Privacy Badge */}
      {item.privacy === 'private' && (
        <View style={styles.privateBadge}>
          <Text style={styles.privateBadgeText}>🔒 Private</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  // Render Discovery Card
  const renderDiscoveryCard = ({ item }: { item: GroupDiscoveryItem }) => (
    <View style={styles.groupCard}>
      {/* Group Icon */}
      <View style={styles.groupIcon}>
        <Text style={styles.groupIconText}>{item.name.charAt(0).toUpperCase()}</Text>
      </View>

      {/* Group Info */}
      <View style={styles.groupInfo}>
        <Text style={styles.groupName}>{item.name}</Text>
        <Text style={styles.groupDescription} numberOfLines={2}>
          {item.description}
        </Text>

        {/* Stats */}
        <View style={styles.groupStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.memberCount}</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.stats.totalPractices}</Text>
            <Text style={styles.statLabel}>Practices</Text>
          </View>
        </View>

        {/* Join/View Button */}
        {item.isMember ? (
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => handleGroupPress(item.id)}
          >
            <Text style={styles.viewButtonText}>View Group</Text>
          </TouchableOpacity>
        ) : item.hasPendingInvite ? (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingText}>Invite Pending</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.joinButton}
            onPress={() => handleJoinGroup(item.id)}
          >
            <Text style={styles.joinButtonText}>Join Group</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Render Invite Card
  const renderInviteCard = ({ item }: { item: GroupInvite }) => (
    <View style={styles.inviteCard}>
      <View style={styles.inviteInfo}>
        <Text style={styles.inviteGroupName}>{item.groupName}</Text>
        <Text style={styles.inviteFrom}>Invited by {item.fromUserName}</Text>
        <Text style={styles.inviteDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.inviteActions}>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => handleAcceptInvite(item.id)}
        >
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.declineButton}
          onPress={() => handleDeclineInvite(item.id)}
        >
          <Text style={styles.declineButtonText}>Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Empty States
  const renderEmptyMyGroups = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>👥</Text>
      <Text style={styles.emptyTitle}>No Groups Yet</Text>
      <Text style={styles.emptyDescription}>
        Create a group or join a public group to start practicing with others!
      </Text>
      <TouchableOpacity style={styles.createButton} onPress={handleCreateGroup}>
        <Text style={styles.createButtonText}>Create Group</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyDiscover = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🔍</Text>
      <Text style={styles.emptyTitle}>No Public Groups</Text>
      <Text style={styles.emptyDescription}>
        Be the first to create a public group!
      </Text>
    </View>
  );

  const renderEmptyInvites = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>✉️</Text>
      <Text style={styles.emptyTitle}>No Invites</Text>
      <Text style={styles.emptyDescription}>
        You'll see group invitations from friends here
      </Text>
    </View>
  );

  const isLoading = myGroupsLoading || discoveryLoading || invitesLoading;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Groups</Text>
        {activeTab === 'myGroups' && (
          <TouchableOpacity
            style={styles.createIconButton}
            onPress={handleCreateGroup}
            accessible={true}
            accessibilityLabel="Create new group"
            accessibilityRole="button"
          >
            <Text style={styles.createIcon}>➕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'myGroups' && styles.activeTab]}
          onPress={() => setActiveTab('myGroups')}
          accessible={true}
          accessibilityLabel="My Groups tab"
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'myGroups' }}
        >
          <Text style={[styles.tabText, activeTab === 'myGroups' && styles.activeTabText]}>
            My Groups
          </Text>
          {myGroups.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{myGroups.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'discover' && styles.activeTab]}
          onPress={() => setActiveTab('discover')}
          accessible={true}
          accessibilityLabel="Discover groups tab"
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'discover' }}
        >
          <Text style={[styles.tabText, activeTab === 'discover' && styles.activeTabText]}>
            Discover
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'invites' && styles.activeTab]}
          onPress={() => setActiveTab('invites')}
          accessible={true}
          accessibilityLabel="Group invitations tab"
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'invites' }}
        >
          <Text style={[styles.tabText, activeTab === 'invites' && styles.activeTabText]}>
            Invites
          </Text>
          {groupInvites.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{groupInvites.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'myGroups' ? (
        <FlatList
          data={myGroups}
          renderItem={renderGroupCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={!isLoading ? renderEmptyMyGroups : null}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
        />
      ) : activeTab === 'discover' ? (
        <FlatList
          data={publicGroups}
          renderItem={renderDiscoveryCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={!isLoading ? renderEmptyDiscover : null}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
        />
      ) : (
        <FlatList
          data={groupInvites}
          renderItem={renderInviteCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={!isLoading ? renderEmptyInvites : null}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  title: {
    fontSize: Layout.typography.h1,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  createIconButton: {
    padding: Layout.spacing.xs,
  },
  createIcon: {
    fontSize: 24,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: Layout.typography.body,
    color: Colors.dark.textSecondary,
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  badge: {
    marginLeft: Layout.spacing.xs,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  listContent: {
    padding: Layout.spacing.md,
  },
  groupCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
    flexDirection: 'row',
  },
  groupIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Layout.spacing.md,
  },
  groupIconText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: Layout.typography.h3,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: Layout.spacing.xs,
  },
  groupDescription: {
    fontSize: Layout.typography.body,
    color: Colors.dark.textSecondary,
    marginBottom: Layout.spacing.sm,
  },
  groupStats: {
    flexDirection: 'row',
    marginTop: Layout.spacing.xs,
  },
  statItem: {
    marginRight: Layout.spacing.lg,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  privateBadge: {
    position: 'absolute',
    top: Layout.spacing.sm,
    right: Layout.spacing.sm,
    backgroundColor: Colors.dark.border,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  privateBadgeText: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  viewButton: {
    marginTop: Layout.spacing.sm,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.dark.border,
    borderRadius: Layout.borderRadius.md,
    alignSelf: 'flex-start',
  },
  viewButtonText: {
    fontSize: 14,
    color: Colors.dark.text,
    fontWeight: '600',
  },
  joinButton: {
    marginTop: Layout.spacing.sm,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.primary,
    borderRadius: Layout.borderRadius.md,
    alignSelf: 'flex-start',
  },
  joinButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  pendingBadge: {
    marginTop: Layout.spacing.sm,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.dark.border,
    borderRadius: Layout.borderRadius.md,
    alignSelf: 'flex-start',
  },
  pendingText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  inviteCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inviteInfo: {
    flex: 1,
  },
  inviteGroupName: {
    fontSize: Layout.typography.h3,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: Layout.spacing.xs,
  },
  inviteFrom: {
    fontSize: Layout.typography.body,
    color: Colors.dark.textSecondary,
    marginBottom: 4,
  },
  inviteDate: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  inviteActions: {
    flexDirection: 'column',
  },
  acceptButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.primary,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Layout.spacing.xs,
  },
  acceptButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  declineButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.dark.border,
    borderRadius: Layout.borderRadius.md,
  },
  declineButtonText: {
    fontSize: 14,
    color: Colors.dark.text,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: Layout.spacing.lg,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Layout.spacing.md,
  },
  emptyTitle: {
    fontSize: Layout.typography.h2,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: Layout.spacing.sm,
  },
  emptyDescription: {
    fontSize: Layout.typography.body,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    marginBottom: Layout.spacing.lg,
  },
  createButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: Colors.primary,
    borderRadius: Layout.borderRadius.md,
  },
  createButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
