/**
 * Challenge Leaderboard Component
 * Shloka Sadhana - Phase 2A Week 18: Group Challenges
 *
 * Real-time leaderboard with rankings and scores
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { ChallengeLeaderboardEntry } from '@/types/challenges';
import { challengeService } from '@/services/challengeService';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';

interface Props {
  groupId: string;
  challengeId: string;
  enableRealtime?: boolean;
}

export const ChallengeLeaderboard: React.FC<Props> = ({
  groupId,
  challengeId,
  enableRealtime = true,
}) => {
  const [entries, setEntries] = useState<ChallengeLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [groupId, challengeId]);

  useEffect(() => {
    if (!enableRealtime) return;

    // Real-time listener
    const unsubscribe = challengeService.onLeaderboardChange(
      groupId,
      challengeId,
      (updatedEntries) => {
        setEntries(updatedEntries);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [groupId, challengeId, enableRealtime]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const leaderboard = await challengeService.getLeaderboard(groupId, challengeId);
      setEntries(leaderboard);
    } catch (error) {
      console.error('[ChallengeLeaderboard] Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number): string => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return '';
    }
  };

  const renderLeaderboardItem = ({ item }: { item: ChallengeLeaderboardEntry }) => (
    <View
      style={[
        styles.leaderboardItem,
        item.isCurrentUser && styles.currentUserItem,
        item.rank <= 3 && styles.topThreeItem,
      ]}
    >
      {/* Rank */}
      <View style={styles.rankColumn}>
        {item.rank <= 3 ? (
          <Text style={styles.rankIcon}>{getRankIcon(item.rank)}</Text>
        ) : (
          <Text style={styles.rankNumber}>#{item.rank}</Text>
        )}
      </View>

      {/* Avatar */}
      <View style={styles.avatarColumn}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.displayName.charAt(0).toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Name */}
      <View style={styles.nameColumn}>
        <Text
          style={[styles.displayName, item.isCurrentUser && styles.currentUserText]}
          numberOfLines={1}
        >
          {item.displayName}
          {item.isCurrentUser && ' (You)'}
        </Text>
      </View>

      {/* Score */}
      <View style={styles.scoreColumn}>
        <Text style={styles.score}>{item.score}</Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🏆</Text>
      <Text style={styles.emptyText}>No participants yet</Text>
      <Text style={styles.emptySubtext}>Complete a practice to join the leaderboard!</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Leaderboard</Text>
        {enableRealtime && (
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Live</Text>
          </View>
        )}
      </View>

      {/* Leaderboard */}
      <FlatList
        data={entries}
        renderItem={renderLeaderboardItem}
        keyExtractor={(item) => item.userId}
        ListEmptyComponent={renderEmptyState}
        scrollEnabled={false} // Parent scroll handles it
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.card,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
  },
  loadingContainer: {
    padding: Layout.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
    paddingBottom: Layout.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '20',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
    marginRight: 4,
  },
  liveText: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: Layout.spacing.sm,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  currentUserItem: {
    backgroundColor: Colors.primary + '10',
    borderRadius: Layout.borderRadius.md,
    paddingHorizontal: Layout.spacing.sm,
    marginHorizontal: -Layout.spacing.sm,
    borderBottomWidth: 0,
  },
  topThreeItem: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    paddingLeft: Layout.spacing.sm - 3,
  },
  rankColumn: {
    width: 50,
    alignItems: 'center',
  },
  rankIcon: {
    fontSize: 24,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.textSecondary,
  },
  avatarColumn: {
    marginRight: Layout.spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  nameColumn: {
    flex: 1,
  },
  displayName: {
    fontSize: 16,
    color: Colors.dark.text,
  },
  currentUserText: {
    fontWeight: 'bold',
    color: Colors.primary,
  },
  scoreColumn: {
    marginLeft: Layout.spacing.md,
    minWidth: 60,
    alignItems: 'flex-end',
  },
  score: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  emptyState: {
    paddingVertical: Layout.spacing.xl,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Layout.spacing.md,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: Layout.spacing.xs,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
  },
});
