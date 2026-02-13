/**
 * Achievement Unlocked Modal
 * Shloka Sadhana - Phase 2A: Engagement Core
 *
 * Celebration modal shown when user unlocks an achievement
 * Enhanced with social sharing (Week 16)
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Modal from 'react-native-modal';
import { Button } from '@/components/ui/Button';
import { ShareModal } from './ShareModal';
import { useAchievementStore } from '@/stores/useAchievementStore';
import { useUserStore } from '@/stores/useUserStore';
import { achievementService } from '@/services/achievementService';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';

export const AchievementUnlockedModal: React.FC = () => {
  const { showUnlockModal, currentUnlock, dismissUnlockModal } =
    useAchievementStore();
  const { currentStreak, totalPractices } = useUserStore();

  // Share modal state
  const [showShareModal, setShowShareModal] = useState(false);

  // Animated values
  const scaleAnimation = React.useRef(new Animated.Value(0)).current;
  const xpAnimation = React.useRef(new Animated.Value(0)).current;

  // Animate on modal open
  useEffect(() => {
    if (showUnlockModal && currentUnlock) {
      // Reset animations
      scaleAnimation.setValue(0);
      xpAnimation.setValue(0);

      // Animate icon scale
      Animated.spring(scaleAnimation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();

      // Animate XP counter
      Animated.spring(xpAnimation, {
        toValue: currentUnlock.xpReward,
        useNativeDriver: false,
        tension: 20,
        friction: 7,
      }).start();
    }
  }, [showUnlockModal, currentUnlock]);

  if (!currentUnlock) {
    return null;
  }

  const rarityColor = achievementService.getRarityColor(currentUnlock.rarity);

  return (
    <Modal
      isVisible={showUnlockModal}
      onBackdropPress={dismissUnlockModal}
      onBackButtonPress={dismissUnlockModal}
      animationIn="bounceIn"
      animationOut="zoomOut"
      backdropOpacity={0.8}
      useNativeDriver={true}
      accessible={true}
      accessibilityLabel="Achievement unlocked celebration"
      accessibilityRole="dialog"
    >
      <View style={styles.container}>
        {/* Achievement Unlocked Header */}
        <Text style={styles.header}>Achievement Unlocked!</Text>

        {/* Animated Achievement Icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              borderColor: rarityColor,
              transform: [{ scale: scaleAnimation }],
            },
          ]}
        >
          <Text style={styles.achievementIcon}>{currentUnlock.icon}</Text>
        </Animated.View>

        {/* Achievement Name */}
        <Text style={styles.achievementName}>{currentUnlock.name}</Text>

        {/* Rarity Badge */}
        <View
          style={[styles.rarityBadge, { backgroundColor: rarityColor + '20' }]}
        >
          <Text style={[styles.rarityText, { color: rarityColor }]}>
            {achievementService.getRarityDisplayName(currentUnlock.rarity)}
          </Text>
        </View>

        {/* Description */}
        <Text style={styles.description}>{currentUnlock.description}</Text>

        {/* XP Reward */}
        <View style={styles.xpContainer}>
          <Text style={styles.xpLabel}>XP Earned</Text>
          <Animated.Text
            style={[
              styles.xpValue,
              {
                color: rarityColor,
              },
            ]}
          >
            +{Math.round(xpAnimation as any)}
          </Animated.Text>
        </View>

        {/* Category */}
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryLabel}>Category</Text>
          <Text style={styles.categoryValue}>
            {getCategoryDisplayName(currentUnlock.category)}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            variant="primary"
            onPress={dismissUnlockModal}
            accessibilityLabel="Continue and celebrate achievement"
          >
            {currentUnlock.rarity === 'legendary'
              ? 'Legendary! 👑'
              : currentUnlock.rarity === 'epic'
              ? 'Epic! ⚡'
              : 'Awesome! 🎉'}
          </Button>

          {/* Share Button - Phase 2A Week 16 */}
          <Button
            variant="secondary"
            onPress={() => setShowShareModal(true)}
            accessibilityLabel="Share this achievement"
          >
            📤 Share Achievement
          </Button>
        </View>
      </View>

      {/* Share Modal - Phase 2A Week 16 */}
      <ShareModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        shareType="achievement"
        data={{
          achievement: currentUnlock,
          currentStreak,
          totalPractices,
        }}
      />
    </Modal>
  );
};

/**
 * Get category display name
 */
const getCategoryDisplayName = (category: string): string => {
  const names: Record<string, string> = {
    streak: 'Practice Streak',
    practice: 'Total Practices',
    mala: 'Mala Count',
    quest: 'Quest Completion',
    social: 'Social Connection',
    group: 'Group Participation',
  };
  return names[category] || category;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.xl,
    alignItems: 'center',
  },
  header: {
    fontSize: Layout.typography.h2,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: Layout.spacing.lg,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  achievementIcon: {
    fontSize: 60,
  },
  achievementName: {
    fontSize: Layout.typography.h1,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
    textAlign: 'center',
  },
  rarityBadge: {
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.full,
    marginBottom: Layout.spacing.md,
  },
  rarityText: {
    fontSize: Layout.typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  description: {
    fontSize: Layout.typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Layout.spacing.lg,
  },
  xpContainer: {
    width: '100%',
    backgroundColor: Colors.cardBackground,
    borderRadius: Layout.borderRadius.md,
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.lg,
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  xpLabel: {
    fontSize: Layout.typography.caption,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Layout.spacing.xs,
  },
  xpValue: {
    fontSize: 40,
    fontWeight: '800',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
    marginBottom: Layout.spacing.xl,
  },
  categoryLabel: {
    fontSize: Layout.typography.caption,
    color: Colors.textSecondary,
  },
  categoryValue: {
    fontSize: Layout.typography.body,
    fontWeight: '700',
    color: Colors.text,
  },
  buttonContainer: {
    width: '100%',
    gap: Layout.spacing.sm,
  },
});
