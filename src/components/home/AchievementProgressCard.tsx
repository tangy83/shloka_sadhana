/**
 * AchievementProgressCard
 * Shloka Sadhana — Achievement XP summary card
 *
 * Shows total XP earned and recently unlocked achievements (up to 3).
 * Rendered on HomeScreen below DailyQuestCard.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useAchievements } from '@/hooks/useAchievements';
import { ACHIEVEMENTS } from '@/data/achievements';

export const AchievementProgressCard: React.FC = () => {
  const { unlockedIds, xp, isLoading } = useAchievements();

  if (isLoading) return null;

  // Show the last 3 unlocked achievements (in definition order)
  const unlockedSet = new Set(unlockedIds);
  const recentAchievements = ACHIEVEMENTS.filter((a) => unlockedSet.has(a.id)).slice(-3);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <MaterialCommunityIcons name="trophy-outline" size={20} color={Colors.templeGold} />
        <Text style={styles.cardTitle}>Achievements</Text>
        <View style={styles.xpBadge}>
          <MaterialCommunityIcons name="lightning-bolt" size={13} color={Colors.templeGold} />
          <Text style={styles.xpText}>{xp} XP</Text>
        </View>
      </View>

      {/* Progress summary */}
      <Text style={styles.summary}>
        {unlockedIds.length} / {ACHIEVEMENTS.length} unlocked
      </Text>

      {/* Total progress bar */}
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${Math.min(100, (unlockedIds.length / ACHIEVEMENTS.length) * 100)}%` },
          ]}
        />
      </View>

      {/* Recent achievements */}
      {recentAchievements.length > 0 && (
        <View style={styles.recentList}>
          {recentAchievements.map((a) => (
            <View key={a.id} style={styles.recentItem}>
              <View style={styles.recentIcon}>
                <MaterialCommunityIcons name={a.icon as never} size={16} color={Colors.templeGold} />
              </View>
              <Text style={styles.recentTitle} numberOfLines={1}>
                {a.title}
              </Text>
              <Text style={styles.recentXp}>+{a.xpReward}</Text>
            </View>
          ))}
        </View>
      )}

      {unlockedIds.length === 0 && (
        <Text style={styles.emptyHint}>
          Complete a practice session to earn your first achievement.
        </Text>
      )}
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
  emptyHint: {
    color: Colors.textTertiary,
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 18,
    textAlign: 'center',
  },
  fill: {
    backgroundColor: Colors.templeGold,
    borderRadius: 4,
    height: 6,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  // eslint-disable-next-line react-native/no-color-literals
  recentIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    borderRadius: 8,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  recentItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  recentList: {
    gap: 8,
  },
  recentTitle: {
    color: Colors.text,
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  recentXp: {
    color: Colors.templeGold,
    fontSize: 12,
    fontWeight: '600',
  },
  summary: {
    color: Colors.textMeaning,
    fontSize: 13,
    marginBottom: 10,
  },
  track: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 4,
    height: 6,
    marginBottom: 14,
    overflow: 'hidden',
  },
  // eslint-disable-next-line react-native/no-color-literals
  xpBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  xpText: {
    color: Colors.templeGold,
    fontSize: 12,
    fontWeight: '700',
  },
});
