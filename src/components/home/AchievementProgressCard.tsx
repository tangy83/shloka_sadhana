/**
 * Achievement Progress Card Component
 * Shloka Sadhana - Phase 2A: Engagement Core
 *
 * Displays near-completion achievements (≤3 away from unlock) on HomeScreen
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card } from '@/components/ui/Card';
import { achievementService } from '@/services/achievementService';
import { AchievementProgress } from '@/types/achievements';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';

interface AchievementProgressCardProps {
  nearCompletion: AchievementProgress[]; // Achievements ≤3 away
  onPress?: (achievementId: string) => void;
}

export const AchievementProgressCard: React.FC<AchievementProgressCardProps> = ({
  nearCompletion,
  onPress,
}) => {
  if (nearCompletion.length === 0) {
    return null; // No near-completion achievements to show
  }

  // Show top 3 near-completion achievements
  const topThree = nearCompletion.slice(0, 3);

  return (
    <Card
      style={styles.container}
      accessible={true}
      accessibilityLabel="Almost unlocked achievements"
      accessibilityRole="text"
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Almost There! 🎯</Text>
        <Text style={styles.subtitle}>
          {nearCompletion.length} achievement
          {nearCompletion.length > 1 ? 's' : ''} close to unlocking
        </Text>
      </View>

      {/* Achievement List */}
      <View style={styles.achievementList}>
        {topThree.map((progress) => {
          const achievement = achievementService.getAchievementById(
            progress.achievementId
          );
          if (!achievement) return null;

          const remaining = achievement.target - progress.progress;
          const rarityColor = achievementService.getRarityColor(
            achievement.rarity
          );

          return (
            <View
              key={achievement.id}
              style={styles.achievementItem}
              accessible={true}
              accessibilityLabel={`${achievement.name}. ${remaining} away from unlocking.`}
            >
              {/* Icon & Info */}
              <View style={styles.achievementInfo}>
                <View
                  style={[
                    styles.iconContainer,
                    { borderColor: rarityColor + '40' },
                  ]}
                >
                  <Text style={styles.icon}>{achievement.icon}</Text>
                </View>

                <View style={styles.textContainer}>
                  <Text style={styles.achievementName} numberOfLines={1}>
                    {achievement.name}
                  </Text>
                  <Text style={styles.remainingText}>
                    {remaining === 1
                      ? 'Just 1 more!'
                      : `${remaining} more to go`}
                  </Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${progress.percentComplete}%`,
                        backgroundColor: rarityColor,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {progress.progress} / {achievement.target}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* View All Link (if more than 3) */}
      {nearCompletion.length > 3 && (
        <View style={styles.footer}>
          <Text style={styles.viewAllText}>
            +{nearCompletion.length - 3} more achievements nearby
          </Text>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Layout.spacing.md,
    marginHorizontal: Layout.spacing.md,
    marginVertical: Layout.spacing.sm,
    backgroundColor: Colors.cardBackground,
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
  },
  header: {
    marginBottom: Layout.spacing.md,
  },
  title: {
    fontSize: Layout.typography.h3,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Layout.spacing.xxs,
  },
  subtitle: {
    fontSize: Layout.typography.caption,
    color: Colors.textSecondary,
  },
  achievementList: {
    gap: Layout.spacing.md,
  },
  achievementItem: {
    gap: Layout.spacing.sm,
  },
  achievementInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  achievementName: {
    fontSize: Layout.typography.body,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  remainingText: {
    fontSize: Layout.typography.caption,
    color: Colors.success,
    fontWeight: '600',
  },
  progressContainer: {
    marginLeft: 56, // Icon width + gap
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: Layout.borderRadius.full,
    overflow: 'hidden',
    marginBottom: Layout.spacing.xxs,
  },
  progressFill: {
    height: '100%',
    borderRadius: Layout.borderRadius.full,
  },
  progressText: {
    fontSize: Layout.typography.caption,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  footer: {
    marginTop: Layout.spacing.sm,
    paddingTop: Layout.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: Layout.typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
});
