/**
 * Group Detail Screen
 * Shloka Sadhana - Phase 2A Week 17: Group System
 *
 * Shows group details, members, and stats
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation';
import { groupService } from '@/services/groupService';
import { friendService } from '@/services/friendService';
import { challengeService } from '@/services/challengeService';
import { Group, GroupMember } from '@/types/groups';
import { Challenge } from '@/types/challenges';
import { Friend } from '@/types/social';
import { useGroupStore } from '@/stores/useGroupStore';
import { useSocialStore } from '@/stores/useSocialStore';
import { ChallengeCard } from '@/components/groups/ChallengeCard';
import { CreateChallengeModal } from '@/components/groups/CreateChallengeModal';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import auth from '@react-native-firebase/auth';

type Props = NativeStackScreenProps<RootStackParamList, 'GroupDetail'>;

type Tab = 'members' | 'challenges' | 'stats';

export const GroupDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { groupId } = route.params;

  const [activeTab, setActiveTab] = useState<Tab>('members');
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [challengeHistory, setChallengeHistory] = useState<Challenge[]>([]);
  const [showCreateChallengeModal, setShowCreateChallengeModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'member' | null>(null);

  const { leaveGroup } = useGroupStore();
  const { friends } = useSocialStore();

  const user = auth().currentUser;

  // Load group data
  const loadGroupData = async () => {
    try {
      const [groupData, membersData, role, activeCh, history] = await Promise.all([
        groupService.getGroup(groupId),
        groupService.getGroupMembers(groupId),
        user ? groupService.getUserRole(groupId, user.uid) : null,
        challengeService.getActiveChallenge(groupId),
        challengeService.getChallengeHistory(groupId, 5),
      ]);

      setGroup(groupData);
      setMembers(membersData);
      setUserRole(role);
      setActiveChallenge(activeCh);
      setChallengeHistory(history);
      setLoading(false);
    } catch (error) {
      console.error('[GroupDetailScreen] Error loading group data:', error);
      Alert.alert('Error', 'Failed to load group details');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroupData();
  }, [groupId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadGroupData();
    setRefreshing(false);
  };

  const handleInviteFriend = async () => {
    if (!group) return;

    // Get friends who are not in the group
    const memberIds = members.map((m) => m.userId);
    const availableFriends = friends.filter((f) => !memberIds.includes(f.userId));

    if (availableFriends.length === 0) {
      Alert.alert('No Friends Available', 'All your friends are already in this group or have pending invites.');
      return;
    }

    // Show friend selection (simplified for MVP - could use a modal with checkboxes)
    const friendOptions = availableFriends.map((f, index) => ({
      text: f.profile.displayName,
      onPress: async () => {
        try {
          await groupService.inviteToGroup(groupId, f.userId);
          Alert.alert('Success', `Invitation sent to ${f.profile.displayName}!`);
        } catch (error) {
          Alert.alert('Error', error instanceof Error ? error.message : 'Failed to send invite');
        }
      },
    }));

    Alert.alert(
      'Invite Friend',
      'Select a friend to invite:',
      [...friendOptions, { text: 'Cancel', style: 'cancel' }]
    );
  };

  const handleLeaveGroup = () => {
    if (!group) return;

    if (group.createdBy === user?.uid) {
      Alert.alert(
        'Cannot Leave',
        'You are the creator of this group. Transfer ownership or delete the group instead.'
      );
      return;
    }

    Alert.alert(
      'Leave Group',
      `Are you sure you want to leave "${group.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await leaveGroup(groupId);
              Alert.alert('Success', 'You have left the group');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', error instanceof Error ? error.message : 'Failed to leave group');
            }
          },
        },
      ]
    );
  };

  const handleMemberPress = (userId: string) => {
    if (userId !== user?.uid) {
      navigation.navigate('UserProfile', { userId });
    }
  };

  const handleCreateChallenge = () => {
    setShowCreateChallengeModal(true);
  };

  const handleChallengeCreated = async (data: any) => {
    try {
      await challengeService.createChallenge(groupId, data);
      await loadGroupData(); // Reload to show new challenge
      Alert.alert('Success', 'Challenge created!');
    } catch (error) {
      // Error already handled in modal
      throw error;
    }
  };

  const handleChallengePress = (challengeId: string) => {
    navigation.navigate('ChallengeDetail', { groupId, challengeId });
  };

  // Render Member Item
  const renderMemberItem = ({ item }: { item: GroupMember }) => (
    <TouchableOpacity
      style={styles.memberItem}
      onPress={() => handleMemberPress(item.userId)}
      disabled={item.userId === user?.uid}
      accessible={true}
      accessibilityLabel={`${item.displayName}, ${item.role === 'admin' ? 'Admin' : 'Member'}`}
      accessibilityRole="button"
    >
      {/* Avatar */}
      <View style={styles.memberAvatar}>
        <Text style={styles.memberAvatarText}>
          {item.displayName.charAt(0).toUpperCase()}
        </Text>
      </View>

      {/* Member Info */}
      <View style={styles.memberInfo}>
        <View style={styles.memberNameRow}>
          <Text style={styles.memberName}>{item.displayName}</Text>
          {item.role === 'admin' && (
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>Admin</Text>
            </View>
          )}
          {item.userId === user?.uid && (
            <Text style={styles.youText}> (You)</Text>
          )}
        </View>

        {/* Member Stats */}
        <View style={styles.memberStats}>
          <Text style={styles.memberStat}>{item.stats.practices} practices</Text>
          <Text style={styles.memberStat}> · </Text>
          <Text style={styles.memberStat}>{item.stats.malas} malas</Text>
          <Text style={styles.memberStat}> · </Text>
          <Text style={styles.memberStat}>{item.stats.minutes} min</Text>
        </View>
      </View>

      {/* Active Indicator */}
      {item.isActive && (
        <View style={styles.activeDot} />
      )}
    </TouchableOpacity>
  );

  if (loading || !group) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <View style={styles.header}>
          {/* Group Icon */}
          <View style={styles.groupIcon}>
            <Text style={styles.groupIconText}>{group.name.charAt(0).toUpperCase()}</Text>
          </View>

          {/* Group Name & Description */}
          <Text style={styles.groupName}>{group.name}</Text>
          <Text style={styles.groupDescription}>{group.description}</Text>

          {/* Privacy Badge */}
          <View style={styles.privacyBadge}>
            <Text style={styles.privacyText}>
              {group.privacy === 'public' ? '🌐 Public' : '🔒 Private'}
            </Text>
          </View>

          {/* Group Stats Summary */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{group.memberCount}</Text>
              <Text style={styles.statLabel}>Members</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{group.stats.totalPractices}</Text>
              <Text style={styles.statLabel}>Practices</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{group.stats.totalMalas}</Text>
              <Text style={styles.statLabel}>Malas</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{group.stats.totalMinutes}</Text>
              <Text style={styles.statLabel}>Minutes</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            {userRole && (
              <TouchableOpacity
                style={styles.inviteButton}
                onPress={handleInviteFriend}
                accessible={true}
                accessibilityLabel="Invite friend to group"
                accessibilityRole="button"
              >
                <Text style={styles.inviteButtonText}>Invite Friend</Text>
              </TouchableOpacity>
            )}
            {userRole && group.createdBy !== user?.uid && (
              <TouchableOpacity
                style={styles.leaveButton}
                onPress={handleLeaveGroup}
                accessible={true}
                accessibilityLabel="Leave group"
                accessibilityRole="button"
              >
                <Text style={styles.leaveButtonText}>Leave Group</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'members' && styles.activeTab]}
            onPress={() => setActiveTab('members')}
            accessible={true}
            accessibilityLabel="Members tab"
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'members' }}
          >
            <Text style={[styles.tabText, activeTab === 'members' && styles.activeTabText]}>
              Members
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'challenges' && styles.activeTab]}
            onPress={() => setActiveTab('challenges')}
            accessible={true}
            accessibilityLabel="Challenges tab"
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'challenges' }}
          >
            <Text style={[styles.tabText, activeTab === 'challenges' && styles.activeTabText]}>
              Challenges
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'stats' && styles.activeTab]}
            onPress={() => setActiveTab('stats')}
            accessible={true}
            accessibilityLabel="Statistics tab"
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'stats' }}
          >
            <Text style={[styles.tabText, activeTab === 'stats' && styles.activeTabText]}>
              Stats
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === 'members' ? (
          <View style={styles.membersList}>
            {members.map((member) => (
              <View key={member.userId}>{renderMemberItem({ item: member })}</View>
            ))}
          </View>
        ) : activeTab === 'challenges' ? (
          <View style={styles.challengesContent}>
            {/* Active Challenge */}
            {activeChallenge && (
              <ChallengeCard
                challenge={activeChallenge}
                onPress={() => handleChallengePress(activeChallenge.id)}
              />
            )}

            {/* Create Challenge Button (admins only) */}
            {userRole === 'admin' && !activeChallenge && (
              <TouchableOpacity
                style={styles.createChallengeButton}
                onPress={handleCreateChallenge}
              >
                <Text style={styles.createChallengeIcon}>🏆</Text>
                <Text style={styles.createChallengeText}>Create Challenge</Text>
              </TouchableOpacity>
            )}

            {/* Challenge History */}
            {challengeHistory.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Past Challenges</Text>
                {challengeHistory.map((ch) => (
                  <ChallengeCard
                    key={ch.id}
                    challenge={ch}
                    onPress={() => handleChallengePress(ch.id)}
                  />
                ))}
              </>
            )}

            {/* Empty State */}
            {!activeChallenge && challengeHistory.length === 0 && userRole !== 'admin' && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🏆</Text>
                <Text style={styles.emptyTitle}>No Challenges Yet</Text>
                <Text style={styles.emptyText}>
                  Group admins can create challenges to compete with members
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.statsContent}>
            <Text style={styles.sectionTitle}>Group Statistics</Text>

            <View style={styles.statCard}>
              <Text style={styles.statCardLabel}>Total Practices</Text>
              <Text style={styles.statCardValue}>{group.stats.totalPractices}</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statCardLabel}>Total Malas</Text>
              <Text style={styles.statCardValue}>{group.stats.totalMalas}</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statCardLabel}>Total Minutes</Text>
              <Text style={styles.statCardValue}>{group.stats.totalMinutes}</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statCardLabel}>Average per Member</Text>
              <Text style={styles.statCardValue}>
                {group.memberCount > 0
                  ? Math.round(group.stats.totalPractices / group.memberCount)
                  : 0}{' '}
                practices
              </Text>
            </View>

            <Text style={styles.sectionTitle}>Top Contributors</Text>
            {members
              .slice()
              .sort((a, b) => b.stats.practices - a.stats.practices)
              .slice(0, 5)
              .map((member, index) => (
                <View key={member.userId} style={styles.leaderboardItem}>
                  <Text style={styles.rank}>#{index + 1}</Text>
                  <Text style={styles.leaderboardName}>{member.displayName}</Text>
                  <Text style={styles.leaderboardScore}>{member.stats.practices} practices</Text>
                </View>
              ))}
          </View>
        )}
      </ScrollView>

      {/* Create Challenge Modal */}
      <CreateChallengeModal
        visible={showCreateChallengeModal}
        onClose={() => setShowCreateChallengeModal(false)}
        onCreate={handleChallengeCreated}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: Layout.typography.body,
    color: Colors.dark.textSecondary,
  },
  header: {
    padding: Layout.spacing.lg,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  groupIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Layout.spacing.md,
  },
  groupIconText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  groupName: {
    fontSize: Layout.typography.h1,
    fontWeight: 'bold',
    color: Colors.dark.text,
    textAlign: 'center',
    marginBottom: Layout.spacing.xs,
  },
  groupDescription: {
    fontSize: Layout.typography.body,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    marginBottom: Layout.spacing.sm,
  },
  privacyBadge: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: Layout.spacing.md,
  },
  privacyText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: Layout.spacing.md,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
  },
  inviteButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: Colors.primary,
    borderRadius: Layout.borderRadius.md,
    alignItems: 'center',
  },
  inviteButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  leaveButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: Colors.dark.border,
    borderRadius: Layout.borderRadius.md,
    alignItems: 'center',
  },
  leaveButtonText: {
    fontSize: 16,
    color: Colors.dark.text,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
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
  membersList: {
    padding: Layout.spacing.md,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.sm,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Layout.spacing.md,
  },
  memberAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  adminBadge: {
    marginLeft: 8,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  adminBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  youText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    fontStyle: 'italic',
  },
  memberStats: {
    flexDirection: 'row',
  },
  memberStat: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.success,
    marginLeft: Layout.spacing.sm,
  },
  statsContent: {
    padding: Layout.spacing.md,
  },
  sectionTitle: {
    fontSize: Layout.typography.h2,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginTop: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
  },
  statCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statCardLabel: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
  },
  statCardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.xs,
  },
  rank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginRight: Layout.spacing.md,
    width: 30,
  },
  leaderboardName: {
    flex: 1,
    fontSize: 16,
    color: Colors.dark.text,
  },
  leaderboardScore: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  challengesContent: {
    padding: Layout.spacing.md,
  },
  createChallengeButton: {
    backgroundColor: Colors.primary,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.xl,
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  createChallengeIcon: {
    fontSize: 48,
    marginBottom: Layout.spacing.sm,
  },
  createChallengeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    paddingVertical: Layout.spacing.xl,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Layout.spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: Layout.spacing.xs,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Layout.spacing.lg,
  },
});
