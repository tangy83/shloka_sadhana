/**
 * Activity Feed Item Component
 * Shloka Sadhana - Phase 2A Week 17: Friend Activity Feed
 *
 * Displays a single activity in the friend feed
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityFeedItem as ActivityFeedItemType, ReactionType } from '@/types/activityFeed';
import { activityService } from '@/services/activityService';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import auth from '@react-native-firebase/auth';
import type { RootStackParamList } from '@/types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ActivityFeedItemProps {
  activity: ActivityFeedItemType;
  onReactionChange?: () => void;
}

/**
 * ActivityFeedItem Component
 */
export const ActivityFeedItem: React.FC<ActivityFeedItemProps> = ({
  activity,
  onReactionChange,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const currentUser = auth().currentUser;
  const [isReacting, setIsReacting] = useState(false);

  // Get user's current reaction (if any)
  const userReaction = currentUser
    ? (activity.reactions[currentUser.uid] as ReactionType | undefined)
    : undefined;

  // Count reactions
  const reactionCounts = {
    celebrate: Object.values(activity.reactions).filter((r) => r === 'celebrate').length,
    fire: Object.values(activity.reactions).filter((r) => r === 'fire').length,
  };

  const totalReactions = reactionCounts.celebrate + reactionCounts.fire;

  // Handle reaction toggle
  const handleReaction = async (reaction: ReactionType) => {
    if (isReacting || !currentUser) return;

    try {
      setIsReacting(true);

      if (userReaction === reaction) {
        // Remove reaction if clicking same one
        await activityService.removeReaction(activity.id);
      } else {
        // Add or change reaction
        await activityService.addReaction(activity.id, reaction);
      }

      onReactionChange?.();
    } catch (error) {
      console.error('[ActivityFeedItem] Error updating reaction:', error);
    } finally {
      setIsReacting(false);
    }
  };

  // Navigate to user profile
  const handleUserPress = () => {
    navigation.navigate('UserProfile', { userId: activity.userId });
  };

  // Get activity message based on type
  const getMessage = (): string => {
    const { type, metadata } = activity;

    switch (type) {
      case 'practice':
        if (metadata.malaCount && metadata.malaCount > 0) {
          return `practiced ${metadata.shlokaName} (${metadata.malaCount} mala${
            metadata.malaCount > 1 ? 's' : ''
          })`;
        }
        return `practiced ${metadata.shlokaName}`;

      case 'achievement':
        return `unlocked ${metadata.achievementIcon} ${metadata.achievementName}`;

      case 'quest':
        return `completed ${metadata.questName}`;

      case 'milestone':
        if (metadata.milestoneType === 'practices') {
          return `reached ${metadata.milestoneValue} practice sessions`;
        } else if (metadata.milestoneType === 'malas') {
          return `completed ${metadata.milestoneValue} malas`;
        } else if (metadata.milestoneType === 'minutes') {
          return `practiced for ${metadata.milestoneValue} total minutes`;
        }
        return `reached a milestone`;

      case 'streak':
        return `achieved a ${metadata.streakDays}-day streak 🔥`;

      default:
        return 'had an activity';
    }
  };

  // Get activity icon
  const getIcon = (): string => {
    const { type, metadata } = activity;

    switch (type) {
      case 'practice':
        return '🙏';
      case 'achievement':
        return metadata.achievementIcon || '🏆';
      case 'quest':
        return '✅';
      case 'milestone':
        return '🎯';
      case 'streak':
        return '🔥';
      default:
        return '📝';
    }
  };

  // Format timestamp
  const getTimeAgo = (): string => {
    const now = new Date();
    const activityTime = new Date(activity.createdAt);
    const diffMs = now.getTime() - activityTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    const diffWeeks = Math.floor(diffDays / 7);
    return `${diffWeeks}w ago`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Avatar */}
        <TouchableOpacity onPress={handleUserPress} style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {activity.userDisplayName.charAt(0).toUpperCase()}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Activity Info */}
        <View style={styles.info}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleUserPress}>
              <Text style={styles.userName}>{activity.userDisplayName}</Text>
            </TouchableOpacity>
            <Text style={styles.time}>{getTimeAgo()}</Text>
          </View>

          <View style={styles.messageContainer}>
            <Text style={styles.icon}>{getIcon()}</Text>
            <Text style={styles.message}>{getMessage()}</Text>
          </View>

          {/* Reactions */}
          <View style={styles.reactions}>
            <TouchableOpacity
              style={[
                styles.reactionButton,
                userReaction === 'celebrate' && styles.reactionButtonActive,
              ]}
              onPress={() => handleReaction('celebrate')}
              disabled={isReacting}
              accessibilityRole="button"
              accessibilityLabel="Celebrate"
            >
              <Text style={styles.reactionIcon}>🎉</Text>
              {reactionCounts.celebrate > 0 && (
                <Text
                  style={[
                    styles.reactionCount,
                    userReaction === 'celebrate' && styles.reactionCountActive,
                  ]}
                >
                  {reactionCounts.celebrate}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.reactionButton,
                userReaction === 'fire' && styles.reactionButtonActive,
              ]}
              onPress={() => handleReaction('fire')}
              disabled={isReacting}
              accessibilityRole="button"
              accessibilityLabel="Fire"
            >
              <Text style={styles.reactionIcon}>🔥</Text>
              {reactionCounts.fire > 0 && (
                <Text
                  style={[
                    styles.reactionCount,
                    userReaction === 'fire' && styles.reactionCountActive,
                  ]}
                >
                  {reactionCounts.fire}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  avatarContainer: {
    marginRight: Layout.spacing.md,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  container: {
    backgroundColor: Colors.surface,
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
  },
  content: {
    flexDirection: 'row',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.xs,
  },
  icon: {
    fontSize: 16,
    marginRight: Layout.spacing.xs,
  },
  info: {
    flex: 1,
  },
  message: {
    color: Colors.text.primary,
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  messageContainer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginBottom: Layout.spacing.md,
  },
  reactionButton: {
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    flexDirection: 'row',
    marginRight: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
  },
  reactionButtonActive: {
    backgroundColor: Colors.surface,
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  reactionCount: {
    color: Colors.text.secondary,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: Layout.spacing.xs,
  },
  reactionCountActive: {
    color: Colors.primary,
  },
  reactionIcon: {
    fontSize: 18,
  },
  reactions: {
    flexDirection: 'row',
  },
  time: {
    color: Colors.text.secondary,
    fontSize: 13,
  },
  userName: {
    color: Colors.text.primary,
    fontSize: 15,
    fontWeight: '600',
  },
});
