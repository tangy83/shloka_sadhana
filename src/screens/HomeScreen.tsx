/**
 * HomeScreen
 * Shloka Sadhana - Main Dashboard
 *
 * Main home screen with dashboard, quick actions, and overview
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useStreak } from '@/hooks/useStreak';
import { useStats } from '@/hooks/useStats';
import { loadActivePractice, getPracticeStats } from '@/utils/practiceStorage';
import { PracticeSession, PracticeStats } from '@/types/practice';
import { PaanchangCard } from '@/components/PaanchangCard';
import { RecoveryMessageCard } from '@/components/home/RecoveryMessageCard';
import { MuhuratTimes } from '@/components/home/MuhuratTimes';
import { EkadashiBanner } from '@/components/home/EkadashiBanner';
import { VerseOfTheDayCard } from '@/components/home/VerseOfTheDayCard';
import { RecommendedShlokaCard } from '@/components/home/RecommendedShlokaCard';
import { DailyWisdomCard } from '@/components/home/DailyWisdomCard';
import { DailyQuestCard } from '@/components/home/DailyQuestCard';
import { AchievementProgressCard } from '@/components/home/AchievementProgressCard';
import { shouldShowRecoveryMessage, markRecoveryMessageShown } from '@/utils/streakRecovery';
import { MandalaBackground, DiyaGlow } from '@/components/sacred';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { AppText } from '@/components/primitives/AppText';
import { useUserProfile } from '@/hooks/useUserProfile';

/**
 * Home screen - main dashboard
 */
export const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { profile } = useUserProfile();
  const { currentStreak } = useStreak();
  const { weeklyStats, monthlyStats, longestStreak, isLoading: statsLoading } = useStats();

  const [activePractice, setActivePractice] = useState<PracticeSession | null>(null);
  const [stats, setStats] = useState<PracticeStats | null>(null);
  const [showRecoveryMessage, setShowRecoveryMessage] = useState(false);

  // Load active practice and statistics on mount
  useEffect(() => {
    const loadData = async () => {
      const practice = await loadActivePractice();
      const practiceStats = await getPracticeStats();
      setActivePractice(practice);
      setStats(practiceStats);
    };
    loadData();
  }, []);

  // Check if recovery message should be shown
  useEffect(() => {
    async function checkRecoveryMessage() {
      if (statsLoading) return; // Wait for stats to load

      const shouldShow = await shouldShowRecoveryMessage(currentStreak, longestStreak);
      setShowRecoveryMessage(shouldShow);
    }

    checkRecoveryMessage();
  }, [currentStreak, longestStreak, statsLoading]);

  // Handle recovery message dismissal
  const handleDismissRecovery = async () => {
    setShowRecoveryMessage(false);
    await markRecoveryMessageShown();
  };

  // User stats - now using real data from storage
  const userStats = {
    currentStreak,
    totalPractices: stats?.totalPractices || 0,
    minutesPracticed: stats?.totalMinutes || 0,
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Sacred decorative layer — absolute, below all content */}
      <MandalaBackground />
      <DiyaGlow intensity="idle" />

      {/* Header */}
      <View style={[styles.header, styles.elevated]}>
        <View style={styles.headerRow}>
          <View>
            <AppText style={styles.appTitle}>Shloka Sadhana</AppText>
            <AppText style={[styles.welcomeText, { color: theme.textSecondary }]}>
              {profile.displayName
                ? `Welcome back, ${profile.displayName} ${profile.avatarEmoji}`
                : 'Welcome back!'}
            </AppText>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings' as never)}
            accessibilityRole="button"
            accessibilityLabel="Open Settings"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialCommunityIcons name="cog-outline" size={26} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        testID="home-scroll"
        contentContainerStyle={styles.scrollContent}
        style={styles.elevated}
      >
        {/* Resume Practice Button */}
        {activePractice && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.resumeButton}
              onPress={() => navigation.navigate('Practice' as never)}
              accessibilityRole="button"
              accessibilityLabel="Resume Practice"
            >
              <View style={styles.resumeButtonContent}>
                <Ionicons name="play-circle" size={36} color={Colors.background} style={styles.resumeButtonIcon} />
                <View style={styles.resumeButtonTextContainer}>
                  <Text style={styles.resumeButtonTitle}>Resume Practice</Text>
                  <Text style={styles.resumeButtonSubtitle}>
                    {activePractice.malaCount} beads • {Math.floor(activePractice.elapsedSeconds / 60)}:{String(activePractice.elapsedSeconds % 60).padStart(2, '0')} elapsed
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textBright }]}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.surface }]}
              testID="quick-action-button"
              accessibilityRole="button"
              accessibilityLabel="Start Practice"
              onPress={() => navigation.navigate('Practice' as never)}
            >
              <MaterialCommunityIcons name="meditation" size={36} color={Colors.primary} style={styles.actionIcon} />
              <Text style={[styles.actionText, { color: theme.textBright }]}>Start Practice</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.surface }]}
              testID="quick-action-button"
              accessibilityRole="button"
              accessibilityLabel="Browse Library"
              onPress={() => navigation.navigate('Library' as never)}
            >
              <MaterialCommunityIcons name="book-open-variant" size={36} color={Colors.primary} style={styles.actionIcon} />
              <Text style={[styles.actionText, { color: theme.textBright }]}>Browse Library</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hindu Calendar (Paanchang) */}
        <View style={styles.section}>
          <PaanchangCard />
        </View>

        {/* Auspicious Times - V3 Feature #4 */}
        <View style={styles.section}>
          <MuhuratTimes />
        </View>

        {/* Ekadashi Banner - V3 Feature #10 */}
        <View style={styles.section}>
          <EkadashiBanner />
        </View>

        {/* Ekadashi Calendar - V3 Feature #10 */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.ekadashiButton, { backgroundColor: theme.surface }]}
            onPress={() => navigation.navigate('EkadashiCalendar' as never)}
            accessibilityRole="button"
            accessibilityLabel="View Ekadashi Calendar"
          >
            <View style={styles.ekadashiButtonContent}>
              <Text style={styles.ekadashiButtonEmoji}>ॐ</Text>
              <View style={styles.ekadashiButtonTextContainer}>
                <Text style={[styles.ekadashiButtonTitle, { color: theme.textBright }]}>Ekadashi Calendar</Text>
                <Text style={[styles.ekadashiButtonSubtitle, { color: theme.textSecondary }]}>
                  View all Ekadashi dates & details
                </Text>
              </View>
              <Text style={[styles.ekadashiButtonArrow, { color: theme.primary }]}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Festivals - V3 Feature #3 */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.festivalsButton, { backgroundColor: theme.surface }]}
            onPress={() => navigation.navigate('FestivalsList' as never)}
            accessibilityRole="button"
            accessibilityLabel="View Hindu Festivals"
          >
            <View style={styles.festivalsButtonContent}>
              <MaterialCommunityIcons name="candle" size={32} color={Colors.primary} style={styles.festivalsButtonIcon} />
              <View style={styles.festivalsButtonTextContainer}>
                <Text style={[styles.festivalsButtonTitle, { color: theme.textBright }]}>Upcoming Festivals</Text>
                <Text style={[styles.festivalsButtonSubtitle, { color: theme.textSecondary }]}>
                  View Hindu festival calendar
                </Text>
              </View>
              <Text style={[styles.festivalsButtonArrow, { color: theme.primary }]}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Verse of the Day - V3 Feature #5 */}
        <View style={styles.section}>
          <VerseOfTheDayCard />
        </View>

        {/* Recommended Shloka - V3 Feature #6 */}
        <View style={styles.section}>
          <RecommendedShlokaCard />
        </View>

        {/* Streak Recovery Message */}
        {showRecoveryMessage && (
          <RecoveryMessageCard
            longestStreak={longestStreak}
            onDismiss={handleDismissRecovery}
          />
        )}

        {/* Your Journey Stats */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textBright }]}>Your Journey</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
              <MaterialCommunityIcons name="fire" size={24} color={theme.primary} style={styles.statIcon} />
              <Text style={[styles.statValue, { color: theme.primary }]}>{userStats.currentStreak}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Day Streak</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
              <MaterialCommunityIcons name="calendar-check-outline" size={24} color={theme.primary} style={styles.statIcon} />
              <Text style={[styles.statValue, { color: theme.primary }]}>{userStats.totalPractices}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Practices</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
              <MaterialCommunityIcons name="timer-outline" size={24} color={theme.primary} style={styles.statIcon} />
              <Text style={[styles.statValue, { color: theme.primary }]}>{userStats.minutesPracticed}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Minutes</Text>
            </View>
          </View>
        </View>

        {/* View History Link */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.historyButton, { backgroundColor: theme.surface }]}
            onPress={() => navigation.navigate('SessionHistory' as never)}
            accessibilityRole="button"
            accessibilityLabel="View practice history"
          >
            <MaterialCommunityIcons name="history" size={20} color={theme.textSecondary} style={styles.historyButtonIcon} />
            <Text style={[styles.historyButtonText, { color: theme.textBright }]}>View Practice History</Text>
            <Text style={[styles.historyButtonArrow, { color: theme.primary }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Weekly & Monthly Stats */}
        {/* Daily Quest + Achievements */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textBright }]}>Daily Quest</Text>
          <DailyQuestCard />
          <AchievementProgressCard />
        </View>

        {!statsLoading && (weeklyStats || monthlyStats) && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textBright }]}>Practice Insights</Text>
            <View style={styles.periodStatsContainer}>
              {/* Weekly Stats */}
              <View style={[styles.periodStatCard, { backgroundColor: theme.surface }]}>
                <Text style={[styles.periodStatTitle, { color: theme.primary }]}>This Week</Text>
                <View style={styles.periodStatRow}>
                  <Text style={[styles.periodStatLabel, { color: theme.textSecondary }]}>Sessions:</Text>
                  <AppText style={[styles.periodStatValue, { color: theme.textBright }]}>{weeklyStats?.totalSessions || 0}</AppText>
                </View>
                <View style={styles.periodStatRow}>
                  <Text style={[styles.periodStatLabel, { color: theme.textSecondary }]}>Minutes:</Text>
                  <AppText style={[styles.periodStatValue, { color: theme.textBright }]}>{weeklyStats?.totalMinutes || 0}</AppText>
                </View>
                <View style={styles.periodStatRow}>
                  <Text style={[styles.periodStatLabel, { color: theme.textSecondary }]}>Malas:</Text>
                  <AppText style={[styles.periodStatValue, { color: theme.textBright }]}>{weeklyStats?.totalMalas || 0}</AppText>
                </View>
              </View>

              {/* Monthly Stats */}
              <View style={[styles.periodStatCard, { backgroundColor: theme.surface }]}>
                <Text style={[styles.periodStatTitle, { color: theme.primary }]}>This Month</Text>
                <View style={styles.periodStatRow}>
                  <Text style={[styles.periodStatLabel, { color: theme.textSecondary }]}>Sessions:</Text>
                  <AppText style={[styles.periodStatValue, { color: theme.textBright }]}>{monthlyStats?.totalSessions || 0}</AppText>
                </View>
                <View style={styles.periodStatRow}>
                  <Text style={[styles.periodStatLabel, { color: theme.textSecondary }]}>Minutes:</Text>
                  <AppText style={[styles.periodStatValue, { color: theme.textBright }]}>{monthlyStats?.totalMinutes || 0}</AppText>
                </View>
                <View style={styles.periodStatRow}>
                  <Text style={[styles.periodStatLabel, { color: theme.textSecondary }]}>Malas:</Text>
                  <AppText style={[styles.periodStatValue, { color: theme.textBright }]}>{monthlyStats?.totalMalas || 0}</AppText>
                </View>
              </View>
            </View>

            {/* Longest Streak */}
            {longestStreak > 0 && (
              <View style={[styles.streakHighlightCard, { backgroundColor: theme.surface }]}>
                <Ionicons name="star" size={32} color="#FFD700" style={styles.streakHighlightIcon} />
                <View style={styles.streakHighlightText}>
                  <Text style={[styles.streakHighlightLabel, { color: theme.textSecondary }]}>Longest Streak</Text>
                  <Text style={[styles.streakHighlightValue, { color: theme.primary }]}>{longestStreak} days</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Daily Wisdom - Enhanced */}
        <View style={styles.section}>
          <DailyWisdomCard />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    flex: 1,
    justifyContent: 'center',
    minHeight: 100,
    padding: 20,
  },
  actionIcon: {
    marginBottom: 8,
  },
  actionText: {
    color: Colors.textBright,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  appTitle: {
    color: Colors.primary,
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  ekadashiButton: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
  },
  ekadashiButtonArrow: {
    color: Colors.primary,
    fontSize: 32,
    fontWeight: '300',
  },
  ekadashiButtonContent: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  ekadashiButtonEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  ekadashiButtonSubtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  ekadashiButtonTextContainer: {
    flex: 1,
  },
  ekadashiButtonTitle: {
    color: Colors.textBright,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  elevated: {
    zIndex: 1,
  },
  festivalsButton: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
  },
  festivalsButtonArrow: {
    color: Colors.primary,
    fontSize: 32,
    fontWeight: '300',
  },
  festivalsButtonContent: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  festivalsButtonIcon: {
    marginRight: 16,
  },
  festivalsButtonSubtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  festivalsButtonTextContainer: {
    flex: 1,
  },
  festivalsButtonTitle: {
    color: Colors.textBright,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  headerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyButton: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    flexDirection: 'row',
    padding: 16,
  },
  historyButtonArrow: {
    color: Colors.primary,
    fontSize: 24,
    fontWeight: '300',
    marginLeft: 'auto',
  },
  historyButtonIcon: {
    marginRight: 12,
  },
  historyButtonText: {
    color: Colors.textBright,
    fontSize: 15,
    fontWeight: '500',
  },
  periodStatCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    flex: 1,
    padding: 16,
  },
  periodStatLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  periodStatRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  periodStatTitle: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  periodStatValue: {
    color: Colors.textBright,
    fontSize: 16,
    fontWeight: '600',
  },
  periodStatsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  resumeButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 20,
  },
  resumeButtonContent: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  resumeButtonIcon: {
    marginRight: 16,
  },
  resumeButtonSubtitle: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: '500',
  },
  resumeButtonTextContainer: {
    flex: 1,
  },
  resumeButtonTitle: {
    color: Colors.background,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: Colors.textBright,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    flex: 1,
    padding: 16,
  },
  statIcon: {
    marginBottom: 8,
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    textAlign: 'center',
  },
  statValue: {
    color: Colors.primary,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  streakHighlightCard: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    flexDirection: 'row',
    padding: 16,
  },
  streakHighlightIcon: {
    marginRight: 16,
  },
  streakHighlightLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginBottom: 4,
  },
  streakHighlightText: {
    flex: 1,
  },
  streakHighlightValue: {
    color: Colors.primary,
    fontSize: 20,
    fontWeight: '700',
  },
  welcomeText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
});
