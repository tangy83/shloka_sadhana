/**
 * HomeScreen
 * Shloka Sadhana - Main Dashboard
 *
 * Main home screen with dashboard, quick actions, and overview
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
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
import { shouldShowRecoveryMessage, markRecoveryMessageShown } from '@/utils/streakRecovery';

/**
 * Home screen - main dashboard
 */
export const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>Shloka Sadhana</Text>
        <Text style={styles.welcomeText}>Welcome back!</Text>
      </View>

      <ScrollView
        testID="home-scroll"
        contentContainerStyle={styles.scrollContent}
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
                <Text style={styles.resumeButtonEmoji}>▶️</Text>
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
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionButton}
              testID="quick-action-button"
              accessibilityRole="button"
              accessibilityLabel="Start Practice"
              onPress={() => navigation.navigate('Practice' as never)}
            >
              <Text style={styles.actionEmoji}>🙏</Text>
              <Text style={styles.actionText}>Start Practice</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              testID="quick-action-button"
              accessibilityRole="button"
              accessibilityLabel="Browse Library"
              onPress={() => navigation.navigate('Library' as never)}
            >
              <Text style={styles.actionEmoji}>📚</Text>
              <Text style={styles.actionText}>Browse Library</Text>
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
            style={styles.ekadashiButton}
            onPress={() => navigation.navigate('EkadashiCalendar' as never)}
            accessibilityRole="button"
            accessibilityLabel="View Ekadashi Calendar"
          >
            <View style={styles.ekadashiButtonContent}>
              <Text style={styles.ekadashiButtonEmoji}>🕉️</Text>
              <View style={styles.ekadashiButtonTextContainer}>
                <Text style={styles.ekadashiButtonTitle}>Ekadashi Calendar</Text>
                <Text style={styles.ekadashiButtonSubtitle}>
                  View all Ekadashi dates & details
                </Text>
              </View>
              <Text style={styles.ekadashiButtonArrow}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Festivals - V3 Feature #3 */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.festivalsButton}
            onPress={() => navigation.navigate('FestivalsList' as never)}
            accessibilityRole="button"
            accessibilityLabel="View Hindu Festivals"
          >
            <View style={styles.festivalsButtonContent}>
              <Text style={styles.festivalsButtonEmoji}>🪔</Text>
              <View style={styles.festivalsButtonTextContainer}>
                <Text style={styles.festivalsButtonTitle}>Upcoming Festivals</Text>
                <Text style={styles.festivalsButtonSubtitle}>
                  View Hindu festival calendar
                </Text>
              </View>
              <Text style={styles.festivalsButtonArrow}>›</Text>
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
          <Text style={styles.sectionTitle}>Your Journey</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>🔥</Text>
              <Text style={styles.statValue}>{userStats.currentStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>🎯</Text>
              <Text style={styles.statValue}>{userStats.totalPractices}</Text>
              <Text style={styles.statLabel}>Total Practices</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>⏱️</Text>
              <Text style={styles.statValue}>{userStats.minutesPracticed}</Text>
              <Text style={styles.statLabel}>Minutes</Text>
            </View>
          </View>
        </View>

        {/* View History Link */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => navigation.navigate('SessionHistory' as never)}
            accessibilityRole="button"
            accessibilityLabel="View practice history"
          >
            <Text style={styles.historyButtonEmoji}>📜</Text>
            <Text style={styles.historyButtonText}>View Practice History</Text>
            <Text style={styles.historyButtonArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Weekly & Monthly Stats */}
        {!statsLoading && (weeklyStats || monthlyStats) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Practice Insights</Text>
            <View style={styles.periodStatsContainer}>
              {/* Weekly Stats */}
              <View style={styles.periodStatCard}>
                <Text style={styles.periodStatTitle}>This Week</Text>
                <View style={styles.periodStatRow}>
                  <Text style={styles.periodStatLabel}>Sessions:</Text>
                  <Text style={styles.periodStatValue}>{weeklyStats?.totalSessions || 0}</Text>
                </View>
                <View style={styles.periodStatRow}>
                  <Text style={styles.periodStatLabel}>Minutes:</Text>
                  <Text style={styles.periodStatValue}>{weeklyStats?.totalMinutes || 0}</Text>
                </View>
                <View style={styles.periodStatRow}>
                  <Text style={styles.periodStatLabel}>Malas:</Text>
                  <Text style={styles.periodStatValue}>{weeklyStats?.totalMalas || 0}</Text>
                </View>
              </View>

              {/* Monthly Stats */}
              <View style={styles.periodStatCard}>
                <Text style={styles.periodStatTitle}>This Month</Text>
                <View style={styles.periodStatRow}>
                  <Text style={styles.periodStatLabel}>Sessions:</Text>
                  <Text style={styles.periodStatValue}>{monthlyStats?.totalSessions || 0}</Text>
                </View>
                <View style={styles.periodStatRow}>
                  <Text style={styles.periodStatLabel}>Minutes:</Text>
                  <Text style={styles.periodStatValue}>{monthlyStats?.totalMinutes || 0}</Text>
                </View>
                <View style={styles.periodStatRow}>
                  <Text style={styles.periodStatLabel}>Malas:</Text>
                  <Text style={styles.periodStatValue}>{monthlyStats?.totalMalas || 0}</Text>
                </View>
              </View>
            </View>

            {/* Longest Streak */}
            {longestStreak > 0 && (
              <View style={styles.streakHighlightCard}>
                <Text style={styles.streakHighlightEmoji}>⭐</Text>
                <View style={styles.streakHighlightText}>
                  <Text style={styles.streakHighlightLabel}>Longest Streak</Text>
                  <Text style={styles.streakHighlightValue}>{longestStreak} days</Text>
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
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    flex: 1,
    justifyContent: 'center',
    minHeight: 100,
    padding: 20,
  },
  actionEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  appTitle: {
    color: '#FF9800',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  container: {
    backgroundColor: '#121212',
    flex: 1,
  },
  ekadashiButton: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
  },
  historyButton: {
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    flexDirection: 'row',
    padding: 16,
  },
  historyButtonArrow: {
    color: '#FF9800',
    fontSize: 24,
    fontWeight: '300',
    marginLeft: 'auto',
  },
  historyButtonEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  historyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  ekadashiButtonArrow: {
    color: '#FF9800',
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
    color: '#9E9E9E',
    fontSize: 13,
  },
  ekadashiButtonTextContainer: {
    flex: 1,
  },
  ekadashiButtonTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  festivalsButton: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
  },
  festivalsButtonArrow: {
    color: '#FF9800',
    fontSize: 32,
    fontWeight: '300',
  },
  festivalsButtonContent: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  festivalsButtonEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  festivalsButtonSubtitle: {
    color: '#9E9E9E',
    fontSize: 13,
  },
  festivalsButtonTextContainer: {
    flex: 1,
  },
  festivalsButtonTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  periodStatCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    flex: 1,
    padding: 16,
  },
  periodStatLabel: {
    color: '#9E9E9E',
    fontSize: 13,
  },
  periodStatRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  periodStatTitle: {
    color: '#FF9800',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  periodStatValue: {
    color: '#FFFFFF',
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
    backgroundColor: '#FF9800',
    borderRadius: 16,
    padding: 20,
  },
  resumeButtonContent: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  resumeButtonEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  resumeButtonSubtitle: {
    color: '#1E1E1E',
    fontSize: 14,
    fontWeight: '500',
  },
  resumeButtonTextContainer: {
    flex: 1,
  },
  resumeButtonTitle: {
    color: '#121212',
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
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    flex: 1,
    padding: 16,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  statLabel: {
    color: '#9E9E9E',
    fontSize: 11,
    textAlign: 'center',
  },
  statValue: {
    color: '#FF9800',
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
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    flexDirection: 'row',
    padding: 16,
  },
  streakHighlightEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  streakHighlightLabel: {
    color: '#9E9E9E',
    fontSize: 13,
    marginBottom: 4,
  },
  streakHighlightText: {
    flex: 1,
  },
  streakHighlightValue: {
    color: '#FF9800',
    fontSize: 20,
    fontWeight: '700',
  },
  welcomeText: {
    color: '#9E9E9E',
    fontSize: 16,
  },
});
