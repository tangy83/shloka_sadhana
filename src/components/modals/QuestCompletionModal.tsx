/**
 * Quest Completion Modal
 * Shloka Sadhana - Phase 2A: Engagement Core
 *
 * Celebration modal shown when user completes daily quest
 * Enhanced with social sharing (Week 16)
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Modal from 'react-native-modal';
import { Button } from '@/components/ui/Button';
import { ShareModal } from './ShareModal';
import { useQuestStore } from '@/stores/useQuestStore';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';

export const QuestCompletionModal: React.FC = () => {
  const {
    showCompletionModal,
    lastCompletedQuest,
    lastReward,
    setShowCompletionModal,
    stats,
  } = useQuestStore();

  // Share modal state
  const [showShareModal, setShowShareModal] = useState(false);

  // Animated value for XP counter
  const xpAnimation = React.useRef(new Animated.Value(0)).current;

  // Animate XP on modal open
  useEffect(() => {
    if (showCompletionModal && lastReward) {
      xpAnimation.setValue(0);
      Animated.spring(xpAnimation, {
        toValue: lastReward.xp,
        useNativeDriver: true,
        tension: 20,
        friction: 7,
      }).start();
    }
  }, [showCompletionModal, lastReward]);

  const handleClose = () => {
    setShowCompletionModal(false);
  };

  if (!lastCompletedQuest || !lastReward) {
    return null;
  }

  return (
    <Modal
      isVisible={showCompletionModal}
      onBackdropPress={handleClose}
      onBackButtonPress={handleClose}
      animationIn="zoomIn"
      animationOut="zoomOut"
      backdropOpacity={0.7}
      useNativeDriver={true}
      accessible={true}
      accessibilityLabel="Quest completed celebration"
      accessibilityRole="dialog"
    >
      <View style={styles.container}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.successIcon}>🎉</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Quest Complete!</Text>

        {/* Quest Name */}
        <Text style={styles.questName}>{lastCompletedQuest.name}</Text>

        {/* Reward Message */}
        <Text style={styles.message}>{lastReward.message}</Text>

        {/* XP Reward */}
        <View style={styles.xpContainer}>
          <View style={styles.xpBadge}>
            <Text style={styles.xpLabel}>XP Earned</Text>
            <Animated.Text
              style={[
                styles.xpValue,
                {
                  transform: [
                    {
                      scale: xpAnimation.interpolate({
                        inputRange: [0, lastReward.xp],
                        outputRange: [0.5, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              +{lastReward.xp}
            </Animated.Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>⚡</Text>
            <Text style={styles.statLabel}>Difficulty</Text>
            <Text style={styles.statValue}>
              {lastCompletedQuest.difficulty.toUpperCase()}
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statIcon}>⏱️</Text>
            <Text style={styles.statLabel}>Time</Text>
            <Text style={styles.statValue}>
              {getCompletionTime(lastCompletedQuest)}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            variant="primary"
            onPress={handleClose}
            accessibilityLabel="Awesome, close modal"
          >
            Awesome! 🙏
          </Button>

          {/* Share Button - Phase 2A Week 16 */}
          <Button
            variant="secondary"
            onPress={() => setShowShareModal(true)}
            accessibilityLabel="Share quest completion"
          >
            📤 Share Quest
          </Button>
        </View>
      </View>

      {/* Share Modal - Phase 2A Week 16 */}
      <ShareModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        shareType="quest"
        data={{
          quest: lastCompletedQuest,
          questStreak: stats.questStreak,
        }}
      />
    </Modal>
  );
};

/**
 * Calculate quest completion time
 */
const getCompletionTime = (quest: any): string => {
  if (!quest.completedAt) return 'Unknown';

  const start = new Date(quest.startedAt).getTime();
  const end = new Date(quest.completedAt).getTime();
  const minutes = Math.floor((end - start) / (1000 * 60));

  if (minutes < 1) return '< 1 min';
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.xl,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: Layout.spacing.md,
  },
  successIcon: {
    fontSize: 80,
  },
  title: {
    fontSize: Layout.typography.h1,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
    textAlign: 'center',
  },
  questName: {
    fontSize: Layout.typography.h3,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: Layout.spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: Layout.typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Layout.spacing.lg,
  },
  xpContainer: {
    width: '100%',
    marginBottom: Layout.spacing.lg,
  },
  xpBadge: {
    backgroundColor: Colors.primary + '20',
    borderRadius: Layout.borderRadius.lg,
    paddingVertical: Layout.spacing.lg,
    paddingHorizontal: Layout.spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
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
    fontSize: 48,
    fontWeight: '800',
    color: Colors.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: Layout.spacing.xl,
    backgroundColor: Colors.cardBackground,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: Layout.spacing.xs,
  },
  statLabel: {
    fontSize: Layout.typography.caption,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.xxs,
  },
  statValue: {
    fontSize: Layout.typography.body,
    fontWeight: '700',
    color: Colors.text,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Layout.spacing.sm,
  },
  buttonContainer: {
    width: '100%',
    gap: Layout.spacing.sm,
  },
});
