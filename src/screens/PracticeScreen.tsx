/**
 * PracticeScreen
 * Shloka Sadhana - Main Practice Screen
 *
 * Integrates Timer, MalaCounter, and modals for complete practice flow
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MandalaBackground, DiyaGlow } from '@/components/sacred';
import type { DiyaIntensity } from '@/components/sacred';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Timer } from '@/components/Timer';
import { MalaCounter } from '@/components/MalaCounter';
import { SankalpModal } from '@/components/SankalpModal';
import { OfferingModal } from '@/components/OfferingModal';
import { useTimer } from '@/hooks/useTimer';
import { useStreak } from '@/hooks/useStreak';
import { useBackgroundTimer } from '@/hooks/useBackgroundTimer';
import {
  loadActivePractice,
  saveActivePractice,
  clearActivePractice,
  savePracticeToHistory,
} from '@/utils/practiceStorage';
import { loadGoal, updateGoalProgress, resetGoalIfExpired } from '@/utils/goalsStorage';
import { CompletedPractice, PracticeGoal } from '@/types/practice';
import { RootStackParamList } from '@/types';
import { shadows } from '@/constants/theme';
import { Colors } from '@/constants/Colors';

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

  const [malaCount, setMalaCount] = useState(0);
  const [sankalp, setSankalp] = useState('');
  const [offering, setOffering] = useState('');
  const [showSankalpModal, setShowSankalpModal] = useState(false);
  const [showOfferingModal, setShowOfferingModal] = useState(false);
  const [hasShownSankalp, setHasShownSankalp] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null);
  const [initialElapsedSeconds, setInitialElapsedSeconds] = useState(0);
  const [goal, setGoal] = useState<PracticeGoal | null>(null);

  const timer = useTimer({
    onComplete: (_elapsedSeconds) => {
      // Show offering modal when practice completes
      setShowOfferingModal(true);
    },
    initialElapsedSeconds,
  });

  const streak = useStreak();

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
  }, []);

  // Load practice goal on mount and reset if expired
  useEffect(() => {
    const loadPracticeGoal = async () => {
      const today = new Date().toISOString();
      await resetGoalIfExpired(today);
      const currentGoal = await loadGoal();
      setGoal(currentGoal);
    };
    loadPracticeGoal();
  }, []);

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
  }, [timer.status, timer.elapsedSeconds, malaCount, sankalp, sessionStartTime, shlokaId]);

  /**
   * Show Sankalp modal when timer starts (only once per session)
   */
  useEffect(() => {
    if (timer.status === 'running' && !hasShownSankalp) {
      setShowSankalpModal(true);
      setHasShownSankalp(true);
    }
  }, [timer.status, hasShownSankalp]);

  /**
   * Show Offering modal when practice completes
   */
  useEffect(() => {
    if (timer.status === 'completed') {
      setShowOfferingModal(true);
    }
  }, [timer.status]);

  /**
   * Handle Sankalp confirmation
   */
  const handleSankalpConfirm = (text: string) => {
    setSankalp(text);
    setShowSankalpModal(false);
  };

  /**
   * Handle Sankalp skip
   */
  const handleSankalpSkip = () => {
    setSankalp('');
    setShowSankalpModal(false);
  };

  /**
   * Handle Offering confirmation
   */
  const handleOfferingConfirm = async (text: string, sessionNotes: string) => {
    setOffering(text);
    setShowOfferingModal(false);

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

    // Mark today as complete in streak
    streak.markTodayComplete();

    // Update goal progress and refresh goal display
    await updateGoalProgress();
    const refreshedGoal = await loadGoal();
    setGoal(refreshedGoal);

    // Reset for next session
    resetSession();
  };

  /**
   * Handle Offering skip
   */
  const handleOfferingSkip = async () => {
    setOffering('');
    setShowOfferingModal(false);

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

    // Mark today as complete in streak even if skipped
    streak.markTodayComplete();

    // Update goal progress and refresh goal display
    await updateGoalProgress();
    const refreshedGoal = await loadGoal();
    setGoal(refreshedGoal);

    // Reset for next session
    resetSession();
  };

  /**
   * Reset session state
   */
  const resetSession = () => {
    setMalaCount(0);
    setSankalp('');
    setOffering('');
    setHasShownSankalp(false);
  };

  /**
   * Handle mala count changes
   */
  const handleMalaCountChange = (count: number) => {
    setMalaCount(count);
  };

  // Show loading state while streak data is loading
  if (streak.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E55B00" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const diyaIntensity: DiyaIntensity =
    timer.status === 'running' ? 'active'
      : timer.status === 'paused' ? 'paused'
        : 'idle';

  return (
    <View style={styles.container}>
      {/* Sacred decorative layer — geometry and ambient light */}
      <MandalaBackground />
      <DiyaGlow intensity={diyaIntensity} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Practice</Text>

          {/* Streak Display */}
          <View style={styles.streakContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <MaterialCommunityIcons name="fire" size={20} color="#FF9A2A" />
              <Text style={styles.streakText}>{streak.currentStreak} day streak</Text>
            </View>
            {streak.isStreakAtRisk && !streak.isPracticedToday && (
              <Text style={styles.warningText}>
                Practice today to keep your streak!
              </Text>
            )}
          </View>
        </View>

        {/* Goal Progress Bar — shown only when a goal is active */}
        {goal && goal.isActive && (
          <View style={styles.goalBar}>
            <View style={styles.goalBarHeader}>
              <Text style={styles.goalBarLabel}>
                {goal.type === 'daily' ? "Today's Goal" : "Weekly Goal"}
              </Text>
              <Text style={styles.goalBarCount}>
                {goal.currentProgress} / {goal.targetSessions} sessions
              </Text>
            </View>
            <View style={styles.goalTrack}>
              <View
                style={[
                  styles.goalFill,
                  {
                    width: `${Math.min(100, (goal.currentProgress / goal.targetSessions) * 100)}%`,
                  },
                ]}
              />
            </View>
          </View>
        )}

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E0E05',
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
    backgroundColor: '#1E0E05',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: '#FFF3E0',
    fontSize: 18,
    marginTop: 16,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 24,
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  streakContainer: {
    backgroundColor: '#2A1408',
    borderColor: 'rgba(255, 140, 0, 0.15)',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    ...shadows.card,
  },
  streakText: {
    color: '#FFF3E0',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  timerSection: {
    marginBottom: 32,
  },
  title: {
    color: '#FFF3E0',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 16,
  },
  warningText: {
    color: '#FFB74D',
    fontSize: 14,
    marginTop: 8,
  },
  goalBar: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    padding: 14,
  },
  goalBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  goalBarLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  goalBarCount: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  goalTrack: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 4,
    height: 6,
    overflow: 'hidden',
  },
  goalFill: {
    backgroundColor: Colors.primary,
    borderRadius: 4,
    height: 6,
  },
});
