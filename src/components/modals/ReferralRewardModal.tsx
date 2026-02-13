/**
 * Referral Reward Modal
 * Shloka Sadhana - Phase 2A Week 18: Referral Program
 *
 * Celebration modal shown when referral rewards are awarded
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { REFERRAL_REWARD_THRESHOLDS } from '@/types/referrals';

interface ReferralRewardModalProps {
  visible: boolean;
  onClose: () => void;
  rewardType: 'referee' | 'referrer';
  successfulReferrals?: number; // For referrer milestones
}

export const ReferralRewardModal: React.FC<ReferralRewardModalProps> = ({
  visible,
  onClose,
  rewardType,
  successfulReferrals = 0,
}) => {
  const getRefereeContent = () => ({
    title: '🎉 Welcome Reward!',
    message: `You've been referred to Shloka Sadhana! Completing your first practice has earned you:`,
    rewards: [
      `${REFERRAL_REWARD_THRESHOLDS.REFEREE_SIGNUP.xp} XP`,
      '"Welcomed by Community" badge',
    ],
  });

  const getReferrerContent = () => {
    // Check for badge milestones
    let badgeUnlocked = null;
    if (successfulReferrals === REFERRAL_REWARD_THRESHOLDS.REFERRER_GUIDE.count) {
      badgeUnlocked = {
        badge: REFERRAL_REWARD_THRESHOLDS.REFERRER_GUIDE.badge,
        name: 'Spiritual Guide',
        icon: '🎯',
      };
    } else if (successfulReferrals === REFERRAL_REWARD_THRESHOLDS.REFERRER_TEACHER.count) {
      badgeUnlocked = {
        badge: REFERRAL_REWARD_THRESHOLDS.REFERRER_TEACHER.badge,
        name: 'Spiritual Teacher',
        icon: '🏆',
      };
    } else if (successfulReferrals === REFERRAL_REWARD_THRESHOLDS.REFERRER_GURU.count) {
      badgeUnlocked = {
        badge: REFERRAL_REWARD_THRESHOLDS.REFERRER_GURU.badge,
        name: 'Spiritual Guru',
        icon: '👑',
      };
    }

    const rewards = [`${REFERRAL_REWARD_THRESHOLDS.REFERRER_FIRST.xp} XP`];
    if (badgeUnlocked) {
      rewards.push(`"${badgeUnlocked.name}" badge ${badgeUnlocked.icon}`);
    }

    return {
      title: badgeUnlocked ? '🏆 Milestone Unlocked!' : '✨ Referral Reward!',
      message: badgeUnlocked
        ? `Congratulations! ${successfulReferrals} successful referrals earned you:`
        : 'Your friend completed their first practice! You earned:',
      rewards,
    };
  };

  const content = rewardType === 'referee' ? getRefereeContent() : getReferrerContent();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      accessibilityViewIsModal={true}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>{content.title}</Text>
          <Text style={styles.message}>{content.message}</Text>

          <View style={styles.rewardsContainer}>
            {content.rewards.map((reward, index) => (
              <View key={index} style={styles.rewardItem}>
                <Text style={styles.rewardIcon}>✓</Text>
                <Text style={styles.rewardText}>{reward}</Text>
              </View>
            ))}
          </View>

          {rewardType === 'referee' && (
            <Text style={styles.note}>
              Keep practicing to unlock more achievements and help your friend earn rewards too!
            </Text>
          )}

          {rewardType === 'referrer' && (
            <Text style={styles.note}>
              Keep inviting friends to unlock more rewards!
            </Text>
          )}

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            accessible={true}
            accessibilityLabel="Close"
            accessibilityRole="button"
          >
            <Text style={styles.closeButtonText}>Awesome!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: Colors.dark.card,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.xl,
    width: '85%',
    maxWidth: 400,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.dark.text,
    textAlign: 'center',
    marginBottom: Layout.spacing.md,
  },
  message: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    marginBottom: Layout.spacing.lg,
    lineHeight: 24,
  },
  rewardsContainer: {
    backgroundColor: Colors.dark.background,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  rewardIcon: {
    fontSize: 20,
    color: Colors.primary,
    marginRight: Layout.spacing.sm,
  },
  rewardText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    flex: 1,
  },
  note: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    marginBottom: Layout.spacing.lg,
    fontStyle: 'italic',
  },
  closeButton: {
    backgroundColor: Colors.primary,
    borderRadius: Layout.borderRadius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
