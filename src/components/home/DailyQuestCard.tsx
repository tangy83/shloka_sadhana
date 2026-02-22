/**
 * DailyQuestCard
 * Shloka Sadhana — Today's featured quest progress card
 *
 * Shows the daily rotating quest with a progress bar and XP reward.
 * Rendered on HomeScreen between the stats and practice insights sections.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useQuestProgress } from '@/hooks/useQuestProgress';

export const DailyQuestCard: React.FC = () => {
  const { todayQuest, progress, isCompleted } = useQuestProgress();

  const pct = Math.min(100, (progress / todayQuest.target) * 100);

  const questIcon =
    todayQuest.type === 'practices'
      ? 'meditation'
      : todayQuest.type === 'malas'
      ? 'circle-outline'
      : 'fire';

  return (
    <View style={styles.card}>
      {/* Title row */}
      <View style={styles.titleRow}>
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons name={questIcon} size={20} color={Colors.primary} />
        </View>
        <Text style={styles.cardTitle}>Daily Quest</Text>
        {isCompleted && (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
            <Text style={styles.completedText}>Done!</Text>
          </View>
        )}
      </View>

      {/* Quest details */}
      <Text style={styles.questTitle}>{todayQuest.title}</Text>
      <Text style={styles.questDesc}>{todayQuest.description}</Text>

      {/* Progress bar */}
      <View style={styles.progressRow}>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${pct}%` }]} />
        </View>
        <Text style={styles.progressLabel}>
          {progress} / {todayQuest.target}
        </Text>
      </View>

      {/* XP reward */}
      <View style={styles.xpRow}>
        <MaterialCommunityIcons name="lightning-bolt" size={14} color={Colors.templeGold} />
        <Text style={styles.xpText}>+{todayQuest.xpReward} XP on completion</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    padding: 16,
  },
  cardTitle: {
    color: Colors.textSecondary,
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  completedBadge: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  completedText: {
    color: Colors.success,
    fontSize: 12,
    fontWeight: '700',
  },
  fill: {
    backgroundColor: Colors.primary,
    borderRadius: 4,
    height: 6,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
    borderRadius: 8,
    height: 34,
    justifyContent: 'center',
    marginRight: 10,
    width: 34,
  },
  progressLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
  },
  progressRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  questDesc: {
    color: Colors.textMeaning,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  questTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 12,
  },
  track: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 4,
    flex: 1,
    height: 6,
    overflow: 'hidden',
  },
  xpRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  xpText: {
    color: Colors.templeGold,
    fontSize: 12,
    fontWeight: '600',
  },
});
