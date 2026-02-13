/**
 * User Profile Screen
 * Shloka Sadhana - Phase 2A Week 16: Friend System
 *
 * View a friend's public profile with stats and achievements
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSocialStore } from '@/stores/useSocialStore';
import { friendService } from '@/services/friendService';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { analyticsService } from '@/services/analytics';
import type { RootStackParamList } from '@/types/navigation';
import type { UserProfile } from '@/types/social';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type UserProfileRouteProp = RouteProp<RootStackParamList, 'UserProfile'>;

/**
 * UserProfileScreen Component
 */
export const UserProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<UserProfileRouteProp>();
  const { userId } = route.params;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [friendshipStatus, setFriendshipStatus] = useState<
    'none' | 'friends' | 'request_sent' | 'request_received'
  >('none');

  const {
    friends,
    sendFriendRequest,
    removeFriend,
    acceptFriendRequest,
    loadFriends,
  } = useSocialStore();

  // Load profile data
  useEffect(() => {
    loadProfile();

    // Track screen view
    analyticsService.trackEvent('user_profile_viewed', {
      viewed_user_id: userId,
    });
  }, [userId]);

  // Check friendship status
  useEffect(() => {
    const isFriend = friends.some((f) => f.userId === userId);
    if (isFriend) {
      setFriendshipStatus('friends');
    } else {
      // Check for pending requests (would need to query Firestore)
      setFriendshipStatus('none');
    }
  }, [friends, userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const userProfile = await friendService.getUserProfile(userId);
      setProfile(userProfile);
    } catch (error) {
      console.error('[UserProfileScreen] Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile. Please try again.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  // Handle sending friend request
  const handleSendRequest = async () => {
    if (!profile) return;

    try {
      await sendFriendRequest(userId);
      setFriendshipStatus('request_sent');
      Alert.alert('Success', `Friend request sent to ${profile.displayName}!`);

      analyticsService.trackEvent('friend_request_sent', {
        to_user_id: userId,
        source: 'profile_screen',
      });
    } catch (error: any) {
      console.error('[UserProfileScreen] Error sending request:', error);
      if (error.message?.includes('already sent')) {
        Alert.alert('Already Sent', 'You have already sent a friend request to this user.');
      } else {
        Alert.alert('Error', 'Failed to send friend request. Please try again.');
      }
    }
  };

  // Handle removing friend
  const handleRemoveFriend = async () => {
    if (!profile) return;

    Alert.alert(
      'Remove Friend',
      `Are you sure you want to remove ${profile.displayName} from your friends?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFriend(userId);
              setFriendshipStatus('none');
              Alert.alert('Removed', `${profile.displayName} has been removed from your friends.`);

              analyticsService.trackEvent('friend_removed', {
                friend_user_id: userId,
                source: 'profile_screen',
              });

              // Go back after removing
              navigation.goBack();
            } catch (error) {
              console.error('[UserProfileScreen] Error removing friend:', error);
              Alert.alert('Error', 'Failed to remove friend. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile.displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.displayName}>{profile.displayName}</Text>
          {profile.favoriteDeity && (
            <Text style={styles.favoriteDeity}>🙏 Devotee of {profile.favoriteDeity}</Text>
          )}
        </View>

        {/* Stats Grid */}
        {profile.privacySettings.showStreak || profile.privacySettings.showPractices ? (
          <View style={styles.statsGrid}>
            {profile.privacySettings.showStreak && (
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>🔥</Text>
                <Text style={styles.statValue}>{profile.currentStreak}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
            )}
            {profile.privacySettings.showPractices && (
              <>
                <View style={styles.statCard}>
                  <Text style={styles.statIcon}>🎯</Text>
                  <Text style={styles.statValue}>{profile.totalPractices}</Text>
                  <Text style={styles.statLabel}>Practices</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statIcon}>⏱️</Text>
                  <Text style={styles.statValue}>
                    {Math.floor(profile.totalMinutes / 60)}h
                  </Text>
                  <Text style={styles.statLabel}>Total Time</Text>
                </View>
              </>
            )}
          </View>
        ) : (
          <View style={styles.privateContainer}>
            <Text style={styles.privateIcon}>🔒</Text>
            <Text style={styles.privateText}>This user's stats are private</Text>
          </View>
        )}

        {/* Action Button */}
        <View style={styles.actionContainer}>
          {friendshipStatus === 'friends' ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.removeFriendButton]}
              onPress={handleRemoveFriend}
              accessibilityRole="button"
              accessibilityLabel="Remove friend"
            >
              <Text style={styles.removeFriendButtonText}>Remove Friend</Text>
            </TouchableOpacity>
          ) : friendshipStatus === 'request_sent' ? (
            <View style={[styles.actionButton, styles.requestSentButton]}>
              <Text style={styles.requestSentButtonText}>Friend Request Sent</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, styles.addFriendButton]}
              onPress={handleSendRequest}
              accessibilityRole="button"
              accessibilityLabel="Send friend request"
            >
              <Text style={styles.addFriendButtonText}>Add Friend</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.aboutItem}>
            <Text style={styles.aboutLabel}>Joined</Text>
            <Text style={styles.aboutValue}>
              {new Date(profile.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </View>
          {profile.favoriteDeity && (
            <View style={styles.aboutItem}>
              <Text style={styles.aboutLabel}>Favorite Deity</Text>
              <Text style={styles.aboutValue}>{profile.favoriteDeity}</Text>
            </View>
          )}
        </View>

        {/* Privacy Notice */}
        {!profile.privacySettings.allowFriendRequests && (
          <View style={styles.privacyNotice}>
            <Text style={styles.privacyNoticeIcon}>ℹ️</Text>
            <Text style={styles.privacyNoticeText}>
              This user is not accepting friend requests at this time.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  aboutItem: {
    backgroundColor: Colors.surface,
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
  },
  aboutLabel: {
    color: Colors.text.secondary,
    fontSize: 15,
  },
  aboutValue: {
    color: Colors.text.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: Layout.borderRadius.lg,
    paddingVertical: Layout.spacing.md,
  },
  actionContainer: {
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.lg,
  },
  addFriendButton: {
    backgroundColor: Colors.primary,
  },
  addFriendButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 48,
    height: 96,
    justifyContent: 'center',
    marginBottom: Layout.spacing.md,
    width: 96,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '600',
  },
  backButton: {
    padding: Layout.spacing.sm,
  },
  backIcon: {
    color: Colors.primary,
    fontSize: 32,
    fontWeight: '300',
  },
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  content: {
    paddingBottom: Layout.spacing.xxxl,
  },
  displayName: {
    color: Colors.text.primary,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: Layout.spacing.xs,
  },
  favoriteDeity: {
    color: Colors.text.secondary,
    fontSize: 16,
  },
  header: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.spacing.md,
    paddingTop: Layout.spacing.xxl,
    paddingVertical: Layout.spacing.sm,
  },
  headerSpacer: {
    width: 44,
  },
  headerTitle: {
    color: Colors.text.primary,
    fontSize: 20,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: Colors.background,
    flex: 1,
    justifyContent: 'center',
  },
  privacyNotice: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    marginHorizontal: Layout.spacing.lg,
    marginTop: Layout.spacing.lg,
    padding: Layout.spacing.md,
  },
  privacyNoticeIcon: {
    fontSize: 20,
    marginRight: Layout.spacing.sm,
  },
  privacyNoticeText: {
    color: Colors.text.secondary,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  privateContainer: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.xxxl,
  },
  privateIcon: {
    fontSize: 48,
    marginBottom: Layout.spacing.md,
  },
  privateText: {
    color: Colors.text.secondary,
    fontSize: 16,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.xxl,
  },
  removeFriendButton: {
    backgroundColor: Colors.surface,
    borderColor: Colors.error || '#FF3B30',
    borderWidth: 1,
  },
  removeFriendButtonText: {
    color: Colors.error || '#FF3B30',
    fontSize: 17,
    fontWeight: '600',
  },
  requestSentButton: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
  },
  requestSentButtonText: {
    color: Colors.text.secondary,
    fontSize: 17,
    fontWeight: '600',
  },
  section: {
    marginTop: Layout.spacing.lg,
  },
  sectionTitle: {
    color: Colors.text.primary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.lg,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    flex: 1,
    paddingVertical: Layout.spacing.lg,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: Layout.spacing.sm,
  },
  statLabel: {
    color: Colors.text.secondary,
    fontSize: 13,
    marginTop: Layout.spacing.xs,
  },
  statValue: {
    color: Colors.text.primary,
    fontSize: 24,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.lg,
  },
});
