/**
 * Challenge Card Component
 * Shloka Sadhana - Phase 2A Week 18: Group Challenges
 *
 * Displays active challenge info with progress
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Challenge } from '@/types/challenges';
import { challengeService } from '@/services/challengeService';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';

interface Props {
  challenge: Challenge;
  userScore?: number;
  userRank?: number;
  onPress: () => void;
}

export const ChallengeCard: React.FC<Props> = ({
  challenge,
  userScore = 0,
  userRank,
  onPress,
}) => {
  const timeRemaining = challengeService.getTimeRemaining(challenge);
  const description = challengeService.getChallengeDescription(challenge);
  const progressPercent = Math.min(Math.round((userScore / challenge.goal) * 100), 100);

  // Get challenge type icon
  const getTypeIcon = () => {
    switch (challenge.type) {
      case 'practices':
        return '🙏';
      case 'malas':
        return '📿';
      case 'minutes':
        return '⏱️';
      case 'consistency':
        return '🔥';
      default:
        return '🏆';
    }
  };

  // Get status badge
  const getStatusBadge = () => {
    if (challenge.status === 'completed') {
      return (
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Completed</Text>
        </View>
      );
    }

    if (challenge.status === 'cancelled') {
      return (
        <View style={[styles.statusBadge, styles.cancelledBadge]}>
          <Text style={styles.statusText}>Cancelled</Text>
        </View>
      );
    }

    return (
      <View style={[styles.statusBadge, styles.activeBadge]}>
        <Text style={[styles.statusText, styles.activeText]}>Active</Text>
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      accessible={true}
      accessibilityLabel={`Challenge: ${description}`}
      accessibilityRole="button"
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{getTypeIcon()}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>{description}</Text>
          <Text style={styles.timeRemaining}>{timeRemaining}</Text>
        </View>
        {getStatusBadge()}
      </View>

      {/* Progress */}
      {challenge.status === 'active' && (
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Your Progress</Text>
            <Text style={styles.progressValue}>
              {userScore}/{challenge.goal}
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
          </View>

          {/* Rank */}
          {userRank && (
            <View style={styles.rankContainer}>
              <Text style={styles.rankLabel}>Your Rank: </Text>
              <Text style={styles.rankValue}>#{userRank}</Text>
            </View>
          )}
        </View>
      )}

      {/* Winners */}
      {challenge.status === 'completed' && challenge.winners.length > 0 && (
        <View style={styles.winnersSection}>
          <Text style={styles.winnersLabel}>🏆 Winners</Text>
          <Text style={styles.winnersCount}>{challenge.winners.length} champions</Text>
        </View>
      )}

      {/* Participants */}
      <View style={styles.footer}>
        <Text style={styles.participantsText}>
          {challenge.participantCount} {challenge.participantCount === 1 ? 'participant' : 'participants'}
        </Text>
        <Text style={styles.viewDetailsText}>View Details →</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.card,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
    borderWidth: 2,
    borderColor: Colors.primary + '30',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Layout.spacing.md,
  },
  icon: {
    fontSize: 24,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  timeRemaining: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  statusBadge: {
    backgroundColor: Colors.dark.border,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  activeBadge: {
    backgroundColor: Colors.primary + '20',
  },
  cancelledBadge: {
    backgroundColor: Colors.dark.border,
  },
  statusText: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    fontWeight: '600',
  },
  activeText: {
    color: Colors.primary,
  },
  progressSection: {
    marginBottom: Layout.spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.xs,
  },
  progressLabel: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  progressValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.dark.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Layout.spacing.sm,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankLabel: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  rankValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  winnersSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Layout.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    marginBottom: Layout.spacing.sm,
  },
  winnersLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  winnersCount: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Layout.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  participantsText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  viewDetailsText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
});
