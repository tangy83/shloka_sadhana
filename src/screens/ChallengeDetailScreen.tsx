/**
 * Challenge Detail Screen
 * Shloka Sadhana - Phase 2A Week 18: Group Challenges
 *
 * Shows full challenge details and real-time leaderboard
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation';
import { Challenge, ChallengeProgress } from '@/types/challenges';
import { challengeService } from '@/services/challengeService';
import { ChallengeLeaderboard } from '@/components/groups/ChallengeLeaderboard';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import auth from '@react-native-firebase/auth';

type Props = NativeStackScreenProps<RootStackParamList, 'ChallengeDetail'>;

export const ChallengeDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { groupId, challengeId } = route.params;

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [userProgress, setUserProgress] = useState<ChallengeProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const user = auth().currentUser;

  useEffect(() => {
    loadChallengeData();
  }, [groupId, challengeId]);

  const loadChallengeData = async () => {
    try {
      setLoading(true);

      const [challengeData, progressData] = await Promise.all([
        challengeService.getChallenge(groupId, challengeId),
        user
          ? challengeService.getUserProgress(groupId, challengeId, user.uid)
          : Promise.resolve(null),
      ]);

      setChallenge(challengeData);
      setUserProgress(progressData);
    } catch (error) {
      console.error('[ChallengeDetailScreen] Error loading challenge:', error);
      Alert.alert('Error', 'Failed to load challenge details');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadChallengeData();
    setRefreshing(false);
  };

  const handleCancelChallenge = () => {
    if (!challenge) return;

    Alert.alert(
      'Cancel Challenge',
      'Are you sure you want to cancel this challenge? This cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await challengeService.cancelChallenge(groupId, challengeId);
              Alert.alert('Success', 'Challenge cancelled');
              navigation.goBack();
            } catch (error) {
              Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'Failed to cancel challenge'
              );
            }
          },
        },
      ]
    );
  };

  if (loading || !challenge) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const description = challengeService.getChallengeDescription(challenge);
  const timeRemaining = challengeService.getTimeRemaining(challenge);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        {/* Challenge Type Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>
            {challenge.type === 'practices'
              ? '🙏'
              : challenge.type === 'malas'
              ? '📿'
              : challenge.type === 'minutes'
              ? '⏱️'
              : '🔥'}
          </Text>
        </View>

        <Text style={styles.description}>{description}</Text>

        {/* Status */}
        {challenge.status === 'active' ? (
          <View style={styles.activeStatus}>
            <Text style={styles.statusText}>⏳ {timeRemaining}</Text>
          </View>
        ) : challenge.status === 'completed' ? (
          <View style={styles.completedStatus}>
            <Text style={styles.statusText}>✅ Completed</Text>
          </View>
        ) : (
          <View style={styles.cancelledStatus}>
            <Text style={styles.statusText}>❌ Cancelled</Text>
          </View>
        )}

        {/* Challenge Info */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Duration</Text>
            <Text style={styles.infoValue}>{challenge.duration} days</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Participants</Text>
            <Text style={styles.infoValue}>{challenge.participantCount}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Goal</Text>
            <Text style={styles.infoValue}>{challenge.goal}</Text>
          </View>
        </View>
      </View>

      {/* Your Progress */}
      {userProgress && challenge.status === 'active' && (
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Your Progress</Text>

          <View style={styles.progressStats}>
            <View style={styles.progressStat}>
              <Text style={styles.progressStatValue}>{userProgress.score}</Text>
              <Text style={styles.progressStatLabel}>Current Score</Text>
            </View>
            <View style={styles.progressStat}>
              <Text style={styles.progressStatValue}>
                {userProgress.rank > 0 ? `#${userProgress.rank}` : '-'}
              </Text>
              <Text style={styles.progressStatLabel}>Your Rank</Text>
            </View>
            <View style={styles.progressStat}>
              <Text style={styles.progressStatValue}>{userProgress.percentToGoal}%</Text>
              <Text style={styles.progressStatLabel}>To Goal</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                { width: `${Math.min(userProgress.percentToGoal, 100)}%` },
              ]}
            />
          </View>
        </View>
      )}

      {/* Winners (for completed challenges) */}
      {challenge.status === 'completed' && challenge.winners.length > 0 && (
        <View style={styles.winnersCard}>
          <Text style={styles.winnersTitle}>🏆 Champions</Text>
          <Text style={styles.winnersSubtitle}>
            {challenge.winners.length} {challenge.winners.length === 1 ? 'winner' : 'winners'}
          </Text>
          {userProgress?.isWinner && (
            <View style={styles.yourWinBadge}>
              <Text style={styles.yourWinText}>You finished in top 3! 🎉</Text>
            </View>
          )}
        </View>
      )}

      {/* Leaderboard */}
      <ChallengeLeaderboard
        groupId={groupId}
        challengeId={challengeId}
        enableRealtime={challenge.status === 'active'}
      />

      {/* Admin Actions */}
      {challenge.status === 'active' && challenge.createdBy === user?.uid && (
        <View style={styles.adminActions}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancelChallenge}>
            <Text style={styles.cancelButtonText}>Cancel Challenge</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Challenge Info Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Created by {challenge.createdByName} on{' '}
          {new Date(challenge.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </ScrollView>
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
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Layout.spacing.md,
  },
  icon: {
    fontSize: 40,
  },
  description: {
    fontSize: Layout.typography.h2,
    fontWeight: 'bold',
    color: Colors.dark.text,
    textAlign: 'center',
    marginBottom: Layout.spacing.sm,
  },
  activeStatus: {
    backgroundColor: Colors.primary + '20',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: Layout.spacing.md,
  },
  completedStatus: {
    backgroundColor: Colors.success + '20',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: Layout.spacing.md,
  },
  cancelledStatus: {
    backgroundColor: Colors.dark.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: Layout.spacing.md,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  progressCard: {
    margin: Layout.spacing.lg,
    backgroundColor: Colors.dark.card,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.lg,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: Layout.spacing.md,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Layout.spacing.md,
  },
  progressStat: {
    alignItems: 'center',
  },
  progressStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  progressStatLabel: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: Colors.dark.border,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 6,
  },
  winnersCard: {
    margin: Layout.spacing.lg,
    marginTop: 0,
    backgroundColor: Colors.dark.card,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.lg,
    alignItems: 'center',
  },
  winnersTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: Layout.spacing.xs,
  },
  winnersSubtitle: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
  },
  yourWinBadge: {
    marginTop: Layout.spacing.md,
    backgroundColor: Colors.primary + '20',
    borderRadius: Layout.borderRadius.md,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  yourWinText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  adminActions: {
    padding: Layout.spacing.lg,
  },
  cancelButton: {
    backgroundColor: Colors.dark.border,
    borderRadius: Layout.borderRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: Colors.dark.text,
    fontWeight: '600',
  },
  footer: {
    padding: Layout.spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
  },
});
