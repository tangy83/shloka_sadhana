/**
 * PracticeScreen
 * Shloka Sadhana - Main Practice Screen
 *
 * Integrates Timer, MalaCounter, and modals for complete practice flow
 * Now uses Zustand stores for state management
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, AccessibilityInfo } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Timer } from '@/components/Timer';
import { MalaCounter } from '@/components/MalaCounter';
import { SankalpModal } from '@/components/SankalpModal';
import { OfferingModal } from '@/components/OfferingModal';
import { QuestCompletionModal } from '@/components/modals/QuestCompletionModal';
import { useTimer } from '@/hooks/useTimer';
import { useBackgroundTimer } from '@/hooks/useBackgroundTimer';
import { usePracticeStore } from '@/stores/usePracticeStore';
import { useUserStore } from '@/stores/useUserStore';
import { useQuestStore } from '@/stores/useQuestStore';
import { useGroupStore } from '@/stores/useGroupStore';
import {
  loadActivePractice,
  saveActivePractice,
  clearActivePractice,
  savePracticeToHistory,
} from '@/utils/practiceStorage';
import { CompletedPractice } from '@/types/practice';
import { QuestProgressUpdate } from '@/types/quests';
import { RootStackParamList } from '@/types';
import { analyticsService } from '@/services/analytics';
import { AnalyticsEvents, AnalyticsProperties } from '@/constants/AnalyticsEvents';
import { activityService } from '@/services/activityService';
import { challengeService } from '@/services/challengeService';
import { referralService } from '@/services/referralService';
import auth from '@react-native-firebase/auth';

type PracticeRouteProp = RouteProp<RootStackParamList, 'Practice'>;

/**
 * Main practice screen
 * Orchestrates the practice session flow:
 * 1. Show Sankalp modal when starting
 * 2. Track time and mala count during practice
 * 3. Show Offering modal on completion
 * 4. Update streak after completion
 */
export const PracticeScreen: React.FC = () => {
  const route = useRoute<PracticeRouteProp>();
  const { shlokaId, shlokaName } = route.params || {};

  // Practice store - replaces 9 useState instances
  const {
    malaCount,
    sankalp,
    offering,
    showSankalpModal,
    showOfferingModal,
    hasShownSankalp,
    sessionStartTime,
    setMalaCount,
    setSankalp,
    setOffering,
    toggleSankalpModal,
    toggleOfferingModal,
    setHasShownSankalp,
    setSessionStartTime,
    resetSession,
    saveSessionToStorage,
  } = usePracticeStore();

  // User store - for streak data and practice time tracking
  const {
    currentStreak,
    updateStreak,
    addRecentlyPracticed,
    recordPracticeTime, // P0 #45: Track practice times for smart notifications
  } = useUserStore();

  // Local state for initial elapsed seconds (needed for timer initialization)
  const [initialElapsedSeconds, setInitialElapsedSeconds] = React.useState(0);

  // Track if practice has been started (for analytics - differentiate start from resume)
  const hasTrackedStart = useRef(false);

  const timer = useTimer({
    onComplete: (_elapsedSeconds) => {
      // Show offering modal when practice completes
      toggleOfferingModal(true);
    },
    initialElapsedSeconds,
  });

  // V3 Feature #9: Background Timer Support
  // Persist timer state when app is backgrounded and restore when foregrounded
  useBackgroundTimer(
    timer.status === 'running',
    timer.elapsedSeconds,
    timer.status === 'paused',
    (restoredElapsed) => {
      // Restore elapsed time from background
      timer.setElapsedSeconds(restoredElapsed);
    }
  );

  /**
   * Load saved practice session on mount
   */
  useEffect(() => {
    const loadSavedSession = async () => {
      const savedSession = await loadActivePractice();
      if (savedSession) {
        setMalaCount(savedSession.malaCount);
        setSankalp(savedSession.sankalp || '');
        setSessionStartTime(savedSession.startTime);
        setInitialElapsedSeconds(savedSession.elapsedSeconds);
        setHasShownSankalp(true); // Don't show sankalp modal again
      } else {
        // Set start time for new session when timer starts
        setSessionStartTime(new Date().toISOString());
      }
    };
    loadSavedSession();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Auto-save practice session when timer is running or paused
   */
  useEffect(() => {
    const savePracticeSession = async () => {
      if (timer.status === 'running' || timer.status === 'paused') {
        await saveActivePractice({
          isActive: timer.status === 'running',
          startTime: sessionStartTime || new Date().toISOString(),
          pausedTime: timer.status === 'paused' ? new Date().toISOString() : null,
          elapsedSeconds: timer.elapsedSeconds,
          malaCount,
          selectedShlokaId: shlokaId || null,
          sankalp: sankalp || null,
        });
      }
    };
    savePracticeSession();
  }, [timer.status, timer.elapsedSeconds, malaCount, sankalp, sessionStartTime, shlokaId]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Track practice start (analytics)
   */
  useEffect(() => {
    if (timer.status === 'running' && !hasTrackedStart.current) {
      // Track practice started event
      analyticsService.trackEvent(AnalyticsEvents.PRACTICE_STARTED, {
        [AnalyticsProperties.SHLOKA_ID]: shlokaId || 'none',
        [AnalyticsProperties.SHLOKA_NAME]: shlokaName || 'General Practice',
        [AnalyticsProperties.HAS_SANKALP]: !!sankalp,
      });
      hasTrackedStart.current = true;
    }
  }, [timer.status, shlokaId, shlokaName, sankalp]);

  /**
   * Show Sankalp modal when timer starts (only once per session)
   */
  useEffect(() => {
    if (timer.status === 'running' && !hasShownSankalp) {
      toggleSankalpModal(true);
      setHasShownSankalp(true);
    }
  }, [timer.status, hasShownSankalp, toggleSankalpModal, setHasShownSankalp]);

  /**
   * Show Offering modal when practice completes
   */
  useEffect(() => {
    if (timer.status === 'completed') {
      toggleOfferingModal(true);
    }
  }, [timer.status, toggleOfferingModal]);

  /**
   * Handle Sankalp confirmation
   */
  const handleSankalpConfirm = (text: string) => {
    setSankalp(text);
    toggleSankalpModal(false);

    // Track sankalp set
    analyticsService.trackEvent(AnalyticsEvents.SANKALP_SET, {
      [AnalyticsProperties.SHLOKA_ID]: shlokaId || 'none',
      [AnalyticsProperties.HAS_SANKALP]: true,
    });
  };

  /**
   * Handle Sankalp skip
   */
  const handleSankalpSkip = () => {
    setSankalp('');
    toggleSankalpModal(false);

    // Track sankalp skipped
    analyticsService.trackEvent(AnalyticsEvents.SANKALP_SKIPPED, {
      [AnalyticsProperties.SHLOKA_ID]: shlokaId || 'none',
    });
  };

  /**
   * Handle Offering confirmation
   */
  const handleOfferingConfirm = async (text: string, sessionNotes: string) => {
    setOffering(text);
    toggleOfferingModal(false);

    // Track offering made
    analyticsService.trackEvent(AnalyticsEvents.OFFERING_MADE, {
      [AnalyticsProperties.SHLOKA_ID]: shlokaId || 'none',
      [AnalyticsProperties.DURATION_SECONDS]: timer.elapsedSeconds,
      [AnalyticsProperties.HAS_OFFERING]: true,
    });

    // Track practice completed
    analyticsService.trackEvent(AnalyticsEvents.PRACTICE_COMPLETED, {
      [AnalyticsProperties.SHLOKA_ID]: shlokaId || 'none',
      [AnalyticsProperties.SHLOKA_NAME]: shlokaName || 'General Practice',
      [AnalyticsProperties.DURATION_SECONDS]: timer.elapsedSeconds,
      [AnalyticsProperties.MALA_COUNT]: malaCount,
      [AnalyticsProperties.HAS_SANKALP]: !!sankalp,
      [AnalyticsProperties.HAS_OFFERING]: true,
    });

    // Save completed practice to history
    const completedPractice: CompletedPractice = {
      id: `practice-${Date.now()}`,
      date: new Date().toISOString(),
      duration: timer.elapsedSeconds,
      malaCount,
      shlokaId: shlokaId || null,
      shlokaName: shlokaName || null,
      sankalp: sankalp || null,
      offering: text || null,
      notes: sessionNotes || null,
    };
    await savePracticeToHistory(completedPractice);

    // Clear active practice from storage
    await clearActivePractice();

    // Update streak in user store
    const completionTime = new Date().toISOString();
    await updateStreak(completionTime);

    // P0 #45: Record practice time for smart notifications
    recordPracticeTime(completionTime);

    // Phase 2A: Update quest progress
    const questUpdate: QuestProgressUpdate = {
      practiceCompleted: true,
      duration: timer.elapsedSeconds,
      malaCount,
      hasSankalp: !!sankalp,
      shlokaId: shlokaId || undefined,
    };
    const questCompleted = await useQuestStore.getState().updateProgress(questUpdate);

    if (questCompleted) {
      console.log('[PracticeScreen] Quest completed! 🎉');
      // Quest completion modal will be shown automatically by the store
    }

    // Announce completion to screen readers
    const minutes = Math.floor(timer.elapsedSeconds / 60);
    const streakMessage = currentStreak > 0
      ? `Your streak is now ${currentStreak + 1} days!`
      : 'Great job starting your practice journey!';
    AccessibilityInfo.announceForAccessibility(
      `Practice completed! ${minutes} minutes of practice. ${streakMessage}`
    );

    // Add to recently practiced
    if (shlokaId && shlokaName) {
      addRecentlyPracticed(shlokaId, shlokaName);
    }

    // Phase 2A Week 17: Post practice activity to friend feeds (non-blocking)
    if (auth().currentUser && shlokaName) {
      activityService
        .postPracticeActivity(shlokaName, timer.elapsedSeconds, malaCount)
        .catch((error) => {
          console.error('[PracticeScreen] Error posting practice activity:', error);
          // Non-blocking - don't interrupt user flow
        });
    }

    // Phase 2A Week 17: Update group stats for all user's groups (non-blocking)
    useGroupStore
      .getState()
      .updateGroupStatsAfterPractice(completedPractice)
      .catch((error) => {
        console.error('[PracticeScreen] Error updating group stats:', error);
        // Non-blocking - don't interrupt user flow
      });

    // Phase 2A Week 18: Update challenge progress for all active challenges (non-blocking)
    if (auth().currentUser) {
      const userGroups = useGroupStore.getState().myGroups;
      userGroups.forEach(async (group) => {
        if (group.activeChallenge) {
          challengeService
            .updateChallengeProgress(
              group.id,
              group.activeChallenge.id,
              auth().currentUser!.uid,
              completedPractice
            )
            .catch((error) => {
              console.error('[PracticeScreen] Error updating challenge progress:', error);
              // Non-blocking - don't interrupt user flow
            });
        }
      });
    }

    // Phase 2A Week 18: Award referral rewards if this is first practice (non-blocking)
    if (auth().currentUser) {
      const { totalPractices } = useUserStore.getState();

      // Check if this was the first practice (totalPractices was 0, now will be 1)
      if (totalPractices === 1) {
        referralService
          .awardReferralRewards(auth().currentUser!.uid)
          .then(() => {
            console.log('[PracticeScreen] Referral rewards awarded for first practice');
          })
          .catch((error) => {
            console.error('[PracticeScreen] Error awarding referral rewards:', error);
            // Non-blocking - don't interrupt user flow
          });
      }
    }

    // P0 #50: Background sync to cloud (non-blocking)
    useUserStore.getState().syncToCloud().catch((error) => {
      console.error('[PracticeScreen] Background sync error:', error);
    });

    // Reset for next session
    resetSession();
    hasTrackedStart.current = false; // Reset for next practice
  };

  /**
   * Handle Offering skip
   */
  const handleOfferingSkip = async () => {
    setOffering('');
    toggleOfferingModal(false);

    // Track offering skipped
    analyticsService.trackEvent(AnalyticsEvents.OFFERING_SKIPPED, {
      [AnalyticsProperties.SHLOKA_ID]: shlokaId || 'none',
      [AnalyticsProperties.DURATION_SECONDS]: timer.elapsedSeconds,
    });

    // Track practice completed (even though offering skipped)
    analyticsService.trackEvent(AnalyticsEvents.PRACTICE_COMPLETED, {
      [AnalyticsProperties.SHLOKA_ID]: shlokaId || 'none',
      [AnalyticsProperties.SHLOKA_NAME]: shlokaName || 'General Practice',
      [AnalyticsProperties.DURATION_SECONDS]: timer.elapsedSeconds,
      [AnalyticsProperties.MALA_COUNT]: malaCount,
      [AnalyticsProperties.HAS_SANKALP]: !!sankalp,
      [AnalyticsProperties.HAS_OFFERING]: false,
    });

    // Save completed practice to history (even if offering skipped)
    const completedPractice: CompletedPractice = {
      id: `practice-${Date.now()}`,
      date: new Date().toISOString(),
      duration: timer.elapsedSeconds,
      malaCount,
      shlokaId: shlokaId || null,
      shlokaName: shlokaName || null,
      sankalp: sankalp || null,
      offering: null,
      notes: null,
    };
    await savePracticeToHistory(completedPractice);

    // Clear active practice from storage
    await clearActivePractice();

    // Update streak even if skipped
    const completionTime = new Date().toISOString();
    await updateStreak(completionTime);

    // P0 #45: Record practice time for smart notifications
    recordPracticeTime(completionTime);

    // Phase 2A: Update quest progress (even if offering skipped)
    const questUpdate: QuestProgressUpdate = {
      practiceCompleted: true,
      duration: timer.elapsedSeconds,
      malaCount,
      hasSankalp: !!sankalp,
      shlokaId: shlokaId || undefined,
    };
    const questCompleted = await useQuestStore.getState().updateProgress(questUpdate);

    if (questCompleted) {
      console.log('[PracticeScreen] Quest completed! 🎉');
      // Quest completion modal will be shown automatically by the store
    }

    // Announce completion to screen readers
    const minutes = Math.floor(timer.elapsedSeconds / 60);
    const streakMessage = currentStreak > 0
      ? `Your streak is now ${currentStreak + 1} days!`
      : 'Great job starting your practice journey!';
    AccessibilityInfo.announceForAccessibility(
      `Practice completed! ${minutes} minutes of practice. ${streakMessage}`
    );

    // Add to recently practiced
    if (shlokaId && shlokaName) {
      addRecentlyPracticed(shlokaId, shlokaName);
    }

    // Phase 2A Week 17: Post practice activity to friend feeds (non-blocking)
    if (auth().currentUser && shlokaName) {
      activityService
        .postPracticeActivity(shlokaName, timer.elapsedSeconds, malaCount)
        .catch((error) => {
          console.error('[PracticeScreen] Error posting practice activity:', error);
          // Non-blocking - don't interrupt user flow
        });
    }

    // Phase 2A Week 17: Update group stats for all user's groups (non-blocking)
    useGroupStore
      .getState()
      .updateGroupStatsAfterPractice(completedPractice)
      .catch((error) => {
        console.error('[PracticeScreen] Error updating group stats:', error);
        // Non-blocking - don't interrupt user flow
      });

    // Phase 2A Week 18: Update challenge progress for all active challenges (non-blocking)
    if (auth().currentUser) {
      const userGroups = useGroupStore.getState().myGroups;
      userGroups.forEach(async (group) => {
        if (group.activeChallenge) {
          challengeService
            .updateChallengeProgress(
              group.id,
              group.activeChallenge.id,
              auth().currentUser!.uid,
              completedPractice
            )
            .catch((error) => {
              console.error('[PracticeScreen] Error updating challenge progress:', error);
              // Non-blocking - don't interrupt user flow
            });
        }
      });
    }

    // Phase 2A Week 18: Award referral rewards if this is first practice (non-blocking)
    if (auth().currentUser) {
      const { totalPractices } = useUserStore.getState();

      // Check if this was the first practice (totalPractices was 0, now will be 1)
      if (totalPractices === 1) {
        referralService
          .awardReferralRewards(auth().currentUser!.uid)
          .then(() => {
            console.log('[PracticeScreen] Referral rewards awarded for first practice');
          })
          .catch((error) => {
            console.error('[PracticeScreen] Error awarding referral rewards:', error);
            // Non-blocking - don't interrupt user flow
          });
      }
    }

    // P0 #50: Background sync to cloud (non-blocking)
    useUserStore.getState().syncToCloud().catch((error) => {
      console.error('[PracticeScreen] Background sync error:', error);
    });

    // Reset for next session
    resetSession();
    hasTrackedStart.current = false; // Reset for next practice
  };

  /**
   * Handle mala count changes
   */
  const handleMalaCountChange = (count: number) => {
    const previousCount = malaCount;
    setMalaCount(count);

    // Track when mala is completed (multiples of 108)
    if (count > 0 && count % 108 === 0 && count > previousCount) {
      const malaNumber = count / 108;
      analyticsService.trackEvent(AnalyticsEvents.MALA_COMPLETED, {
        [AnalyticsProperties.SHLOKA_ID]: shlokaId || 'none',
        [AnalyticsProperties.MALA_COUNT]: malaNumber,
      });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Practice</Text>

          {/* Streak Display */}
          <View style={styles.streakContainer}>
            <Text style={styles.streakText}>
              🔥 {currentStreak} day streak
            </Text>
          </View>
        </View>

        {/* Timer */}
        <View style={styles.timerSection}>
          <Timer onComplete={timer.complete} />
        </View>

        {/* Mala Counter */}
        <View style={styles.counterSection}>
          <MalaCounter onChange={handleMalaCountChange} />
        </View>
      </ScrollView>

      {/* Sankalp Modal */}
      <SankalpModal
        visible={showSankalpModal}
        initialValue={sankalp}
        onConfirm={handleSankalpConfirm}
        onSkip={handleSankalpSkip}
      />

      {/* Offering Modal */}
      <OfferingModal
        visible={showOfferingModal}
        elapsedTime={timer.formattedTime}
        initialValue={offering}
        onConfirm={handleOfferingConfirm}
        onSkip={handleOfferingSkip}
      />

      {/* Quest Completion Modal - Phase 2A */}
      <QuestCompletionModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#121212',
    flex: 1,
  },
  counterSection: {
    marginBottom: 32,
  },
  header: {
    marginBottom: 32,
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: '#121212',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginTop: 16,
  },
  scrollContent: {
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  streakContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
  },
  streakText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  timerSection: {
    marginBottom: 32,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 16,
  },
  warningText: {
    color: '#FF9800',
    fontSize: 14,
    marginTop: 8,
  },
});
