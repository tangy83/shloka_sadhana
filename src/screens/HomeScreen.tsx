/**
 * HomeScreen
 * Shloka Sadhana - Main Dashboard
 *
 * Main home screen with personalized feed (Phase 2A Week 14)
 * Uses dynamic feed service with relevance-based section ordering
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useUserStore } from '@/stores/useUserStore';
import { useQuestStore } from '@/stores/useQuestStore';
import { useAchievementStore } from '@/stores/useAchievementStore';
import { loadActivePractice, getPracticeStats } from '@/utils/practiceStorage';
import { PracticeSession, PracticeStats } from '@/types/practice';
import { FeedSection, FeedSectionType } from '@/types/feed';
import { FeedSection as FeedSectionWrapper } from '@/components/home/FeedSection';
import { PaanchangCard } from '@/components/PaanchangCard';
import { RecoveryMessageCard } from '@/components/home/RecoveryMessageCard';
import { MuhuratTimes } from '@/components/home/MuhuratTimes';
import { EkadashiBanner } from '@/components/home/EkadashiBanner';
import { VerseOfTheDayCard } from '@/components/home/VerseOfTheDayCard';
import { RecommendedShlokaCard } from '@/components/home/RecommendedShlokaCard';
import { DailyWisdomCard } from '@/components/home/DailyWisdomCard';
import { RecentlyPracticedSection } from '@/components/home/RecentlyPracticedSection';
import { DailyQuestCard } from '@/components/home/DailyQuestCard';
import { AchievementProgressCard } from '@/components/home/AchievementProgressCard';
import { shouldShowRecoveryMessage, markRecoveryMessageShown } from '@/utils/streakRecovery';
import { analyticsService } from '@/services/analytics';
import { AnalyticsEvents, AnalyticsProperties } from '@/constants/AnalyticsEvents';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';

/**
 * Home screen - main dashboard with personalized feed
 */
export const HomeScreen: React.FC = () => {
  const navigation = useNavigation();

  // User store
  const {
    currentStreak,
    longestStreak,
    totalPractices,
    totalMinutes,
    loadUserData,
    refreshFeed,
    shouldRefreshFeed: checkShouldRefreshFeed,
    cachedFeed,
  } = useUserStore();

  // Quest store
  const { currentQuest, stats: questStats } = useQuestStore();

  // Achievement store
  const { getNearCompletion } = useAchievementStore();

  const [activePractice, setActivePractice] = useState<PracticeSession | null>(null);
  const [stats, setStats] = useState<PracticeStats | null>(null);
  const [showRecoveryMessage, setShowRecoveryMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Track screen view when Home screen is focused
  useFocusEffect(
    React.useCallback(() => {
      analyticsService.trackScreen('Home');
    }, [])
  );

  // Load user data and generate feed on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      // Load user data from store
      await loadUserData();

      // Load active practice
      const practice = await loadActivePractice();
      setActivePractice(practice);

      // Load practice stats
      const practiceStats = await getPracticeStats();
      setStats(practiceStats);

      // Initialize quest system
      await useQuestStore.getState().initializeQuest();

      // Generate feed if needed
      if (checkShouldRefreshFeed()) {
        await refreshFeed();
      }

      setIsLoading(false);
    };
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Check if recovery message should be shown
  useEffect(() => {
    async function checkRecoveryMessage() {
      if (isLoading) return; // Wait for data to load

      const shouldShow = await shouldShowRecoveryMessage(currentStreak, longestStreak);
      setShowRecoveryMessage(shouldShow);
    }

    checkRecoveryMessage();
  }, [currentStreak, longestStreak, isLoading]);

  // Handle pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);

    try {
      // Reload user data
      await loadUserData();

      // Reload quest data
      await useQuestStore.getState().initializeQuest();

      // Regenerate feed
      await refreshFeed();

      // Track analytics
      analyticsService.trackEvent('feed_refreshed', {
        manual_refresh: true,
      });
    } catch (error) {
      console.error('[HomeScreen] Error refreshing feed:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [loadUserData, refreshFeed]);

  // Handle recovery message dismissal
  const handleDismissRecovery = async () => {
    setShowRecoveryMessage(false);
    await markRecoveryMessageShown();
  };

  // User stats for components
  const userStats = {
    currentStreak,
    totalPractices: totalPractices || 0,
    minutesPracticed: totalMinutes || 0,
  };

  /**
   * Render feed section based on type
   * Maps FeedSectionType to corresponding component
   */
  const renderFeedSection = ({ item: section }: { item: FeedSection }) => {
    const sectionType = section.type;

    switch (sectionType) {
      case 'resume_practice':
        // Only show if active practice exists
        if (!activePractice) return null;
        return (
          <FeedSectionWrapper section={section} showTitle={false}>
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
                    {activePractice.malaCount} beads •{' '}
                    {Math.floor(activePractice.elapsedSeconds / 60)}:
                    {String(activePractice.elapsedSeconds % 60).padStart(2, '0')} elapsed
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </FeedSectionWrapper>
        );

      case 'daily_quest':
        // Only show if active quest exists
        if (!currentQuest || currentQuest.status !== 'active') return null;
        return (
          <FeedSectionWrapper section={section}>
            <DailyQuestCard quest={currentQuest} questStats={questStats} />
          </FeedSectionWrapper>
        );

      case 'streak_recovery':
        // Show recovery message if applicable
        if (!showRecoveryMessage) return null;
        return (
          <FeedSectionWrapper section={section} showTitle={false}>
            <RecoveryMessageCard
              longestStreak={longestStreak}
              onDismiss={handleDismissRecovery}
            />
          </FeedSectionWrapper>
        );

      case 'achievement_progress':
        return (
          <FeedSectionWrapper section={section}>
            <AchievementProgressCard
              nearCompletion={getNearCompletion({
                practiceStats: {
                  currentStreak,
                  totalPractices,
                  totalMalas: stats?.totalMalas || 0,
                },
                questStats: {
                  totalCompleted: questStats.totalCompleted,
                },
              })}
            />
          </FeedSectionWrapper>
        );

      case 'recommended_shloka':
        return (
          <FeedSectionWrapper section={section}>
            <RecommendedShlokaCard />
          </FeedSectionWrapper>
        );

      case 'recently_practiced':
        return (
          <FeedSectionWrapper section={section} showTitle={false}>
            <RecentlyPracticedSection />
          </FeedSectionWrapper>
        );

      case 'verse_of_day':
        return (
          <FeedSectionWrapper section={section} showTitle={false}>
            <VerseOfTheDayCard />
          </FeedSectionWrapper>
        );

      case 'hindu_calendar':
        return (
          <FeedSectionWrapper section={section} showTitle={false}>
            <PaanchangCard />
            <View style={{ marginTop: Layout.spacing.md }}>
              <MuhuratTimes />
            </View>
            <View style={{ marginTop: Layout.spacing.md }}>
              <EkadashiBanner />
            </View>
          </FeedSectionWrapper>
        );

      case 'daily_wisdom':
        return (
          <FeedSectionWrapper section={section} showTitle={false}>
            <DailyWisdomCard />
          </FeedSectionWrapper>
        );

      // Placeholder for future social features (Week 16+)
      case 'friend_activity':
      case 'group_challenge':
        return null;

      default:
        return null;
    }
  };

  /**
   * Render header component (always shown at top)
   */
  const ListHeaderComponent = () => (
    <>
      {/* App Header */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>Shloka Sadhana</Text>
        <Text style={styles.welcomeText}>Welcome back!</Text>
      </View>

      {/* Quick Actions (always at top) */}
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
    </>
  );

  /**
   * Render footer component (Your Journey stats - always at bottom)
   */
  const ListFooterComponent = () => (
    <>
      {/* Your Journey Stats (always at bottom) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Journey</Text>
        <View style={styles.statsGrid}>
          {/* Current Streak */}
          <View
            style={styles.statCard}
            accessible={true}
            accessibilityLabel={`Current streak: ${userStats.currentStreak} days`}
            accessibilityRole="text"
          >
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={styles.statValue}>{userStats.currentStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>

          {/* Total Practices */}
          <View
            style={styles.statCard}
            accessible={true}
            accessibilityLabel={`Total practices: ${userStats.totalPractices}`}
            accessibilityRole="text"
          >
            <Text style={styles.statEmoji}>🎯</Text>
            <Text style={styles.statValue}>{userStats.totalPractices}</Text>
            <Text style={styles.statLabel}>Total Practices</Text>
          </View>

          {/* Minutes Practiced */}
          <View
            style={styles.statCard}
            accessible={true}
            accessibilityLabel={`Minutes practiced: ${userStats.minutesPracticed}`}
            accessibilityRole="text"
          >
            <Text style={styles.statEmoji}>⏱️</Text>
            <Text style={styles.statValue}>{userStats.minutesPracticed}</Text>
            <Text style={styles.statLabel}>Minutes</Text>
          </View>
        </View>
      </View>

      {/* Bottom spacing */}
      <View style={{ height: Layout.spacing.xl }} />
    </>
  );

  // Get feed sections (fallback to empty if not loaded)
  const feedSections = cachedFeed?.sections || [];

  return (
    <View style={styles.container}>
      <FlatList
        testID="home-feed"
        data={feedSections}
        renderItem={renderFeedSection}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={ListFooterComponent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
            title="Pull to refresh feed"
            titleColor={Colors.text.secondary}
          />
        }
        contentContainerStyle={styles.listContent}
        removeClippedSubviews={true} // Performance optimization
        maxToRenderPerBatch={5}
        windowSize={5}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: Layout.spacing.xl,
    paddingHorizontal: Layout.spacing.md,
    paddingBottom: Layout.spacing.lg,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text.primary,
    marginBottom: Layout.spacing.xs,
  },
  welcomeText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  section: {
    marginBottom: Layout.spacing.lg,
    paddingHorizontal: Layout.spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Layout.spacing.md,
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Layout.spacing.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionEmoji: {
    fontSize: 36,
    marginBottom: Layout.spacing.sm,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },

  // Resume Practice Button
  resumeButton: {
    backgroundColor: Colors.primary,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resumeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resumeButtonEmoji: {
    fontSize: 32,
    marginRight: Layout.spacing.md,
  },
  resumeButtonTextContainer: {
    flex: 1,
  },
  resumeButtonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: Layout.spacing.xs,
  },
  resumeButtonSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },

  // Your Journey Stats
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Layout.spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statEmoji: {
    fontSize: 28,
    marginBottom: Layout.spacing.xs,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Layout.spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});
