/**
 * Referral Screen
 * Shloka Sadhana - Phase 2A Week 18: Referral Program
 *
 * Displays user's referral code, stats, and leaderboard
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Clipboard,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { referralService } from '@/services/referralService';
import {
  UserReferralData,
  ReferralLeaderboardEntry,
  ReferralLink,
} from '@/types/referrals';
import auth from '@react-native-firebase/auth';

type Props = NativeStackScreenProps<RootStackParamList, 'Referral'>;

export const ReferralScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [referralData, setReferralData] = useState<UserReferralData | null>(null);
  const [referralLink, setReferralLink] = useState<ReferralLink | null>(null);
  const [leaderboard, setLeaderboard] = useState<ReferralLeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    const user = auth().currentUser;
    if (!user) {
      navigation.goBack();
      return;
    }

    try {
      setLoading(true);

      // Load user's referral data
      const data = await referralService.getUserReferralData(user.uid);

      if (data) {
        setReferralData(data);

        // Generate referral link
        const link = referralService.getReferralLink(data.referralCode);
        setReferralLink(link);
      }

      // Load leaderboard
      const leaderboardData = await referralService.getReferralLeaderboard(10);
      setLeaderboard(leaderboardData);

      // Find user's rank
      const rank = leaderboardData.findIndex((entry) => entry.userId === user.uid);
      setUserRank(rank >= 0 ? rank + 1 : null);
    } catch (error) {
      console.error('[ReferralScreen] Error loading data:', error);
      Alert.alert('Error', 'Failed to load referral data');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!referralData) return;

    Clipboard.setString(referralData.referralCode);
    Alert.alert('Copied!', 'Referral code copied to clipboard');
  };

  const handleShare = async () => {
    if (!referralLink) return;

    try {
      await Share.share({
        message: referralLink.shareText,
        url: referralLink.url,
      });
    } catch (error) {
      console.error('[ReferralScreen] Error sharing:', error);
    }
  };

  const renderLeaderboardItem = ({
    item,
    index,
  }: {
    item: ReferralLeaderboardEntry;
    index: number;
  }) => {
    const user = auth().currentUser;
    const isCurrentUser = item.userId === user?.uid;

    const getMedalIcon = (rank: number) => {
      if (rank === 1) return '🥇';
      if (rank === 2) return '🥈';
      if (rank === 3) return '🥉';
      return `${rank}.`;
    };

    return (
      <View
        style={[styles.leaderboardItem, isCurrentUser && styles.leaderboardItemCurrent]}
      >
        <Text style={styles.leaderboardRank}>{getMedalIcon(item.rank)}</Text>
        <View style={styles.leaderboardInfo}>
          <Text style={styles.leaderboardName}>
            {item.displayName}
            {isCurrentUser && ' (You)'}
          </Text>
          <Text style={styles.leaderboardStats}>
            {item.successfulReferrals} referrals • {item.xpEarned} XP
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading referral data...</Text>
      </View>
    );
  }

  if (!referralData || !referralLink) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No referral data found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <Text style={styles.title}>Invite Friends</Text>
      <Text style={styles.subtitle}>
        Share the joy of spiritual practice and earn rewards
      </Text>

      {/* Referral Code Card */}
      <View style={styles.codeCard}>
        <Text style={styles.codeLabel}>Your Referral Code</Text>
        <Text style={styles.code}>{referralData.referralCode}</Text>
        <View style={styles.codeActions}>
          <TouchableOpacity
            style={styles.copyButton}
            onPress={handleCopyCode}
            accessible={true}
            accessibilityLabel="Copy referral code"
            accessibilityRole="button"
          >
            <Text style={styles.copyButtonText}>📋 Copy Code</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
            accessible={true}
            accessibilityLabel="Share referral link"
            accessibilityRole="button"
          >
            <Text style={styles.shareButtonText}>📤 Share Link</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{referralData.totalReferrals}</Text>
          <Text style={styles.statLabel}>Total Referrals</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, styles.statValueSuccess]}>
            {referralData.successfulReferrals}
          </Text>
          <Text style={styles.statLabel}>Successful</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, styles.statValuePending]}>
            {referralData.pendingReferrals}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, styles.statValueXP]}>
            {referralData.xpEarned}
          </Text>
          <Text style={styles.statLabel}>XP Earned</Text>
        </View>
      </View>

      {/* How It Works */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        <View style={styles.step}>
          <Text style={styles.stepNumber}>1.</Text>
          <Text style={styles.stepText}>
            Share your referral code with friends
          </Text>
        </View>
        <View style={styles.step}>
          <Text style={styles.stepNumber}>2.</Text>
          <Text style={styles.stepText}>
            They sign up and complete their first practice
          </Text>
        </View>
        <View style={styles.step}>
          <Text style={styles.stepNumber}>3.</Text>
          <Text style={styles.stepText}>
            You both earn 50 XP + special badges!
          </Text>
        </View>
      </View>

      {/* Rewards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Unlock Rewards</Text>
        <View style={styles.reward}>
          <Text style={styles.rewardIcon}>🎯</Text>
          <View style={styles.rewardInfo}>
            <Text style={styles.rewardTitle}>5 Successful Referrals</Text>
            <Text style={styles.rewardDescription}>
              Unlock "Spiritual Guide" badge
            </Text>
          </View>
        </View>
        <View style={styles.reward}>
          <Text style={styles.rewardIcon}>🏆</Text>
          <View style={styles.rewardInfo}>
            <Text style={styles.rewardTitle}>10 Successful Referrals</Text>
            <Text style={styles.rewardDescription}>
              Unlock "Spiritual Teacher" badge
            </Text>
          </View>
        </View>
        <View style={styles.reward}>
          <Text style={styles.rewardIcon}>👑</Text>
          <View style={styles.rewardInfo}>
            <Text style={styles.rewardTitle}>25 Successful Referrals</Text>
            <Text style={styles.rewardDescription}>
              Unlock "Spiritual Guru" badge
            </Text>
          </View>
        </View>
      </View>

      {/* Leaderboard */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Referral Leaderboard</Text>
        {userRank && (
          <Text style={styles.userRankText}>
            Your rank: #{userRank}
          </Text>
        )}
        {leaderboard.length > 0 ? (
          <FlatList
            data={leaderboard}
            renderItem={renderLeaderboardItem}
            keyExtractor={(item) => item.userId}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        ) : (
          <Text style={styles.emptyText}>No leaderboard data yet</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: Layout.spacing.md,
    fontSize: 16,
    color: Colors.dark.textSecondary,
  },
  content: {
    padding: Layout.spacing.lg,
  },
  title: {
    fontSize: Layout.typography.h1,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: Layout.spacing.xs,
  },
  subtitle: {
    fontSize: Layout.typography.body,
    color: Colors.dark.textSecondary,
    marginBottom: Layout.spacing.xl,
  },
  codeCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.xl,
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  codeLabel: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: Layout.spacing.sm,
  },
  code: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Layout.spacing.lg,
    letterSpacing: 2,
  },
  codeActions: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
  },
  copyButton: {
    backgroundColor: Colors.dark.border,
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
  },
  copyButtonText: {
    fontSize: 16,
    color: Colors.dark.text,
    fontWeight: '600',
  },
  shareButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
  },
  shareButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.spacing.md,
    marginBottom: Layout.spacing.xl,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.dark.card,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: Layout.spacing.xs,
  },
  statValueSuccess: {
    color: '#4CAF50',
  },
  statValuePending: {
    color: Colors.primary,
  },
  statValueXP: {
    color: '#FFD700',
  },
  statLabel: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  section: {
    marginBottom: Layout.spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: Layout.spacing.md,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.md,
  },
  stepNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginRight: Layout.spacing.md,
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: Colors.dark.text,
    lineHeight: 24,
  },
  reward: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.sm,
  },
  rewardIcon: {
    fontSize: 32,
    marginRight: Layout.spacing.md,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 2,
  },
  rewardDescription: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  userRankText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: Layout.spacing.md,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
  },
  leaderboardItemCurrent: {
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}10`,
  },
  leaderboardRank: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginRight: Layout.spacing.md,
    minWidth: 40,
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 2,
  },
  leaderboardStats: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  separator: {
    height: Layout.spacing.sm,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    paddingVertical: Layout.spacing.xl,
  },
  errorText: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    paddingVertical: Layout.spacing.xl,
  },
});
