/**
 * PracticeScreen
 * Shloka Sadhana - Main Practice Screen
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MandalaBackground, DiyaGlow } from '@/components/sacred';
import type { DiyaIntensity } from '@/components/sacred';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Timer } from '@/components/Timer';
import { MalaCounter } from '@/components/MalaCounter';
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
import { useTheme } from '@/contexts/ThemeContext';
import { AppText } from '@/components/primitives/AppText';
import { useQuestProgress } from '@/hooks/useQuestProgress';
import { useAchievements } from '@/hooks/useAchievements';
import { QuestCompletionModal } from '@/components/QuestCompletionModal';
import { AchievementUnlockedModal } from '@/components/AchievementUnlockedModal';
import { Quest } from '@/data/quests';
import { getPracticeStats } from '@/utils/practiceStorage';

type PracticeRouteProp = RouteProp<RootStackParamList, 'Practice'>;

export const PracticeScreen: React.FC = () => {
  const route = useRoute<PracticeRouteProp>();
  const { theme } = useTheme();
  const { shlokaId, shlokaName } = route.params || {};

  const [malaCount, setMalaCount] = useState(0);
  const [sankalp, setSankalp] = useState('');
  const [offering, setOffering] = useState('');
  const [showOfferingModal, setShowOfferingModal] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null);
  const [initialElapsedSeconds, setInitialElapsedSeconds] = useState(0);
  const [goal, setGoal] = useState<PracticeGoal | null>(null);
  const [sessionKey, setSessionKey] = useState(0);

  const timer = useTimer({ initialElapsedSeconds });

  const streak = useStreak();
  const questProgress = useQuestProgress();
  const achievements = useAchievements();
  const [showQuestModal, setShowQuestModal] = useState(false);
  const [completedQuest, setCompletedQuest] = useState<Quest | null>(null);

  useBackgroundTimer(
    timer.status === 'running',
    timer.elapsedSeconds,
    timer.status === 'paused',
    (restoredElapsed) => { timer.setElapsedSeconds(restoredElapsed); }
  );

  useEffect(() => {
    const loadSavedSession = async () => {
      const savedSession = await loadActivePractice();
      if (savedSession) {
        setMalaCount(savedSession.malaCount);
        setSankalp(savedSession.sankalp || '');
        setSessionStartTime(savedSession.startTime);
        setInitialElapsedSeconds(savedSession.elapsedSeconds);
        timer.setElapsedSeconds(savedSession.elapsedSeconds);
      } else {
        setSessionStartTime(new Date().toISOString());
      }
    };
    loadSavedSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadPracticeGoal = async () => {
      const today = new Date().toISOString();
      await resetGoalIfExpired(today);
      const currentGoal = await loadGoal();
      setGoal(currentGoal);
    };
    loadPracticeGoal();
  }, []);

  // Refs for auto-save
  const autoSaveRef = useRef({
    status: timer.status,
    elapsedSeconds: timer.elapsedSeconds,
    malaCount,
    sankalp,
    sessionStartTime,
    shlokaId,
  });
  autoSaveRef.current = {
    status: timer.status,
    elapsedSeconds: timer.elapsedSeconds,
    malaCount,
    sankalp,
    sessionStartTime,
    shlokaId,
  };

  useEffect(() => {
    if (timer.status !== 'running' && timer.status !== 'paused') return;
    if (timer.status === 'paused') {
      const s = autoSaveRef.current;
      saveActivePractice({
        isActive: false,
        startTime: s.sessionStartTime || new Date().toISOString(),
        pausedTime: new Date().toISOString(),
        elapsedSeconds: s.elapsedSeconds,
        malaCount: s.malaCount,
        selectedShlokaId: s.shlokaId || null,
        sankalp: s.sankalp || null,
      });
      return;
    }
    const id = setInterval(() => {
      const s = autoSaveRef.current;
      if (s.status === 'running') {
        saveActivePractice({
          isActive: true,
          startTime: s.sessionStartTime || new Date().toISOString(),
          pausedTime: null,
          elapsedSeconds: s.elapsedSeconds,
          malaCount: s.malaCount,
          selectedShlokaId: s.shlokaId || null,
          sankalp: s.sankalp || null,
        });
      }
    }, 5000);
    return () => clearInterval(id);
  }, [timer.status]);

  useEffect(() => {
    if (timer.status === 'completed') {
      setShowOfferingModal(true);
    }
  }, [timer.status]);

  const handleOfferingConfirm = async (text: string, sessionNotes: string) => {
    setOffering(text);
    setShowOfferingModal(false);

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
    await clearActivePractice();
    streak.markTodayComplete();
    await updateGoalProgress();
    const refreshedGoal = await loadGoal();
    setGoal(refreshedGoal);
    await triggerQuestAndAchievements();

    resetSession();
  };

  const handleOfferingSkip = async () => {
    setOffering('');
    setShowOfferingModal(false);

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
    await clearActivePractice();
    streak.markTodayComplete();
    await updateGoalProgress();
    const refreshedGoal = await loadGoal();
    setGoal(refreshedGoal);
    await triggerQuestAndAchievements();

    resetSession();
  };

  const resetSession = () => {
    setMalaCount(0);
    setSankalp('');
    setOffering('');
    setInitialElapsedSeconds(0);
    setSessionStartTime(new Date().toISOString());
    setSessionKey((k) => k + 1);
    setShowOfferingModal(false);
    setShowQuestModal(false);
    setCompletedQuest(null);
    achievements.dismissRecentlyUnlocked();
    clearActivePractice();
    timer.reset();
  };

  const triggerQuestAndAchievements = async () => {
    const wasCompleted = questProgress.isCompleted;
    await questProgress.incrementProgress(1);
    if (!wasCompleted && questProgress.todayQuest) {
      const newProgress = questProgress.progress + 1;
      if (newProgress >= questProgress.todayQuest.target) {
        setCompletedQuest(questProgress.todayQuest);
        setShowQuestModal(true);
      }
    }
    const stats = await getPracticeStats();
    await achievements.checkAndUnlock({
      totalPractices: stats.totalPractices,
      currentStreak: streak.currentStreak,
      totalMalas: stats.totalMalas,
    });
  };

  const handleMalaCountChange = useCallback((count: number) => {
    setMalaCount(count);
  }, []);

  const handleDismissQuestModal = useCallback(() => {
    setShowQuestModal(false);
  }, []);

  if (streak.isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#E55B00" />
        <Text style={[styles.loadingText, { color: theme.text }]}>Loading...</Text>
      </View>
    );
  }

  const diyaIntensity: DiyaIntensity =
    timer.status === 'running' ? 'active'
      : timer.status === 'paused' ? 'paused'
        : 'idle';

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <MandalaBackground />
      <DiyaGlow intensity={diyaIntensity} />

      <ScrollView
        key={sessionKey}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <AppText style={[styles.title, { color: theme.text }]}>Practice</AppText>

          <View style={[styles.streakContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.streakRow}>
              <MaterialCommunityIcons name="fire" size={20} color="#FF9A2A" />
              <Text style={[styles.streakText, { color: theme.text }]}>{streak.currentStreak} day streak</Text>
            </View>
            {streak.isStreakAtRisk && !streak.isPracticedToday && (
              <Text style={[styles.warningText, { color: theme.textSecondary }]}>
                Practice today to keep your streak!
              </Text>
            )}
          </View>
        </View>

        {goal && goal.isActive && (
          <View style={[styles.goalBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.goalBarHeader}>
              <Text style={[styles.goalBarLabel, { color: theme.textSecondary }]}>
                {goal.type === 'daily' ? "Today's Goal" : "Weekly Goal"}
              </Text>
              <Text style={[styles.goalBarCount, { color: theme.text }]}>
                {goal.currentProgress} / {goal.targetSessions} sessions
              </Text>
            </View>
            <View style={[styles.goalTrack, { backgroundColor: theme.surfaceElevated }]}>
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

        <View style={styles.timerSection}>
          <Timer
            status={timer.status}
            elapsedSeconds={timer.elapsedSeconds}
            formattedTime={timer.formattedTime}
            canComplete={timer.canComplete}
            onStart={timer.start}
            onPause={timer.pause}
            onResume={timer.resume}
            onReset={timer.reset}
            onComplete={timer.complete}
          />
        </View>

        <View style={styles.counterSection}>
          <MalaCounter onChange={handleMalaCountChange} />
        </View>
      </ScrollView>

      <OfferingModal
        visible={showOfferingModal}
        elapsedTime={timer.formattedTime}
        initialValue={offering}
        onConfirm={handleOfferingConfirm}
        onSkip={handleOfferingSkip}
      />
      <QuestCompletionModal
        visible={showQuestModal}
        quest={completedQuest}
        onDismiss={handleDismissQuestModal}
      />
      <AchievementUnlockedModal
        visible={achievements.recentlyUnlocked !== null}
        achievement={achievements.recentlyUnlocked}
        onDismiss={achievements.dismissRecentlyUnlocked}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  counterSection: {
    marginBottom: 32,
  },
  goalBar: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    padding: 14,
  },
  goalBarCount: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600',
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
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  goalFill: {
    backgroundColor: Colors.primary,
    borderRadius: 4,
    height: 6,
  },
  goalTrack: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 4,
    height: 6,
    overflow: 'hidden',
  },
  header: {
    marginBottom: 32,
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: Colors.background,
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: Colors.text,
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
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    ...shadows.card,
  },
  streakRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  streakText: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  timerSection: {
    marginBottom: 32,
  },
  title: {
    color: Colors.text,
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 16,
  },
  warningText: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
  },
});
