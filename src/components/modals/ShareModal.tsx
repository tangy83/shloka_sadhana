/**
 * Share Modal Component
 * Shloka Sadhana - Phase 2A Week 16
 *
 * Modal for sharing achievements, quests, and milestones
 * Uses native share sheet (iOS/Android)
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { shareService, ShareableType } from '@/services/shareService';
import { Achievement } from '@/types/achievements';
import { Quest } from '@/types/quests';

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  shareType: ShareableType;
  data: {
    achievement?: Achievement;
    quest?: Quest;
    streakDays?: number;
    practiceMilestone?: number;
    userName?: string;
    currentStreak?: number;
    totalPractices?: number;
    questStreak?: number;
  };
}

/**
 * ShareModal Component
 * Provides share functionality via native share sheet
 */
export const ShareModal: React.FC<ShareModalProps> = ({
  visible,
  onClose,
  shareType,
  data,
}) => {
  const [isSharing, setIsSharing] = React.useState(false);

  const handleShare = async () => {
    setIsSharing(true);

    try {
      let result;

      switch (shareType) {
        case 'achievement':
          if (data.achievement) {
            result = await shareService.shareAchievement(
              data.achievement,
              {
                userName: data.userName,
                currentStreak: data.currentStreak || 0,
                totalPractices: data.totalPractices || 0,
              }
            );
          }
          break;

        case 'quest':
          if (data.quest) {
            result = await shareService.shareQuest(
              data.quest,
              {
                userName: data.userName,
                questStreak: data.questStreak || 0,
              }
            );
          }
          break;

        case 'streak':
          if (data.streakDays) {
            result = await shareService.shareStreak(
              data.streakDays,
              data.totalPractices || 0,
              data.userName
            );
          }
          break;

        case 'practice_milestone':
          if (data.practiceMilestone) {
            result = await shareService.sharePracticeMilestone(
              data.practiceMilestone,
              data.userName
            );
          }
          break;
      }

      // Close modal after share (whether success or cancelled)
      if (result) {
        onClose();
      }
    } catch (error) {
      console.error('[ShareModal] Error sharing:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const getTitle = (): string => {
    switch (shareType) {
      case 'achievement':
        return data.achievement ? `Share ${data.achievement.name}` : 'Share Achievement';
      case 'quest':
        return 'Share Quest Completion';
      case 'streak':
        return `Share ${data.streakDays}-Day Streak`;
      case 'practice_milestone':
        return `Share ${data.practiceMilestone} Practices`;
      default:
        return 'Share';
    }
  };

  const getDescription = (): string => {
    switch (shareType) {
      case 'achievement':
        return 'Let your friends know about your spiritual achievement!';
      case 'quest':
        return 'Celebrate completing your daily quest!';
      case 'streak':
        return 'Inspire others with your dedication!';
      case 'practice_milestone':
        return 'Share your practice journey with others!';
      default:
        return 'Share your progress';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
      accessibilityViewIsModal={true}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{getTitle()}</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Close share modal"
            >
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <Text style={styles.description}>{getDescription()}</Text>

          {/* Share Button */}
          <TouchableOpacity
            style={[styles.shareButton, isSharing && styles.shareButtonDisabled]}
            onPress={handleShare}
            disabled={isSharing}
            accessibilityRole="button"
            accessibilityLabel="Share via native share sheet"
          >
            <Text style={styles.shareButtonIcon}>📤</Text>
            <Text style={styles.shareButtonText}>
              {isSharing ? 'Opening Share...' : shareService.getShareButtonText()}
            </Text>
          </TouchableOpacity>

          {/* Info Text */}
          <Text style={styles.infoText}>
            Choose your preferred app from the share sheet
          </Text>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Cancel sharing"
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.lg,
  },
  modalContainer: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.xl,
    padding: Layout.spacing.xl,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text.primary,
    flex: 1,
  },
  closeButton: {
    padding: Layout.spacing.xs,
    marginRight: -Layout.spacing.xs,
  },
  closeIcon: {
    fontSize: 24,
    color: Colors.text.secondary,
  },
  description: {
    fontSize: 15,
    color: Colors.text.secondary,
    lineHeight: 22,
    marginBottom: Layout.spacing.xl,
  },
  shareButton: {
    backgroundColor: Colors.primary,
    borderRadius: Layout.borderRadius.lg,
    paddingVertical: Layout.spacing.lg,
    paddingHorizontal: Layout.spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Layout.spacing.sm,
    marginBottom: Layout.spacing.md,
  },
  shareButtonDisabled: {
    opacity: 0.6,
  },
  shareButtonIcon: {
    fontSize: 20,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 13,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Layout.spacing.lg,
    fontStyle: 'italic',
  },
  cancelButton: {
    paddingVertical: Layout.spacing.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
});
