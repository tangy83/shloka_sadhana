/**
 * Daily Quest Card Component
 * Shloka Sadhana - Phase 2A: Engagement Core
 *
 * Displays current daily quest on HomeScreen
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useQuestStore, getQuestProgressPercentage } from '@/stores/useQuestStore';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { Quest } from '@/types/quests';

interface DailyQuestCardProps {
  onPress?: () => void; // Navigate to quest details or start practice
}

export const DailyQuestCard: React.FC<DailyQuestCardProps> = ({ onPress }) => {
  const { currentQuest, stats } = useQuestStore();

  if (!currentQuest) {
    return null; // No quest to display
  }

  const progressPercentage = getQuestProgressPercentage(currentQuest);
  const isCompleted = currentQuest.status === 'completed';

  return (
    <Card
      style={styles.container}
      onPress={onPress}
      accessible={true}
      accessibilityLabel={`Daily quest: ${currentQuest.name}. ${progressPercentage}% complete.`}
      accessibilityRole="button"
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.label}>Daily Quest</Text>
          <Badge
            variant={getDifficultyVariant(currentQuest.difficulty)}
            size="small"
          >
            {currentQuest.difficulty.toUpperCase()}
          </Badge>
        </View>

        {/* XP Reward */}
        <View style={styles.xpBadge}>
          <Text style={styles.xpText}>+{currentQuest.xpReward} XP</Text>
        </View>
      </View>

      {/* Quest Name & Description */}
      <View style={styles.content}>
        <Text style={styles.questName}>{currentQuest.name}</Text>
        <Text style={styles.questDescription}>{currentQuest.description}</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progressPercentage}%`,
                backgroundColor: isCompleted ? Colors.success : Colors.primary,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {isCompleted
            ? 'Completed!'
            : `${currentQuest.progress} / ${currentQuest.target}`}
        </Text>
      </View>

      {/* Stats Footer */}
      <View style={styles.footer}>
        <View style={styles.stat}>
          <Text style={styles.statIcon}>🔥</Text>
          <Text style={styles.statText}>{stats.questStreak} day streak</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statIcon}>⭐</Text>
          <Text style={styles.statText}>{stats.totalXP} XP</Text>
        </View>
      </View>
    </Card>
  );
};

/**
 * Get badge variant based on difficulty
 */
const getDifficultyVariant = (
  difficulty: Quest['difficulty']
): 'primary' | 'success' | 'warning' | 'error' => {
  switch (difficulty) {
    case 'beginner':
      return 'success'; // Green
    case 'intermediate':
      return 'primary'; // Orange
    case 'advanced':
      return 'warning'; // Yellow
    case 'expert':
      return 'error'; // Red
    default:
      return 'primary';
  }
};

const styles = StyleSheet.create({
  container: {
    padding: Layout.spacing.md,
    marginHorizontal: Layout.spacing.md,
    marginVertical: Layout.spacing.sm,
    backgroundColor: Colors.cardBackground,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
  },
  label: {
    fontSize: Layout.typography.caption,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  xpBadge: {
    backgroundColor: Colors.primary + '20', // 20% opacity
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.md,
  },
  xpText: {
    fontSize: Layout.typography.caption,
    fontWeight: '700',
    color: Colors.primary,
  },
  content: {
    marginBottom: Layout.spacing.md,
  },
  questName: {
    fontSize: Layout.typography.h3,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  questDescription: {
    fontSize: Layout.typography.body,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  progressContainer: {
    marginBottom: Layout.spacing.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: Layout.borderRadius.full,
    overflow: 'hidden',
    marginBottom: Layout.spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: Layout.borderRadius.full,
    // Animated background would go here
  },
  progressText: {
    fontSize: Layout.typography.caption,
    color: Colors.textSecondary,
    textAlign: 'right',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Layout.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.xs,
  },
  statIcon: {
    fontSize: 16,
  },
  statText: {
    fontSize: Layout.typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});
