/**
 * SessionHistoryScreen
 * Shloka Sadhana - Practice Session History
 *
 * Displays past practice sessions with details
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { CompletedPractice } from '@/types/practice';
import { loadPracticeHistory } from '@/utils/practiceStorage';
import { Colors } from '@/constants/Colors';

interface SessionHistoryScreenProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  navigation: any;
}

export const SessionHistoryScreen: React.FC<SessionHistoryScreenProps> = () => {
  const [sessions, setSessions] = useState<CompletedPractice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<CompletedPractice | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const loadedSessions = await loadPracticeHistory();
      // Sort by date descending (most recent first)
      const sortedSessions = loadedSessions.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setSessions(sortedSessions);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const getTotalStats = () => {
    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((sum, session) => sum + Math.floor(session.duration / 60), 0);
    return { totalSessions, totalMinutes };
  };

  const renderSession = ({ item }: { item: CompletedPractice }) => (
    <TouchableOpacity
      testID="session-item"
      style={styles.sessionItem}
      onPress={() => setSelectedSession(item)}
    >
      <View style={styles.sessionHeader}>
        <Text style={styles.sessionDate}>{formatDate(item.date)}</Text>
        <Text style={styles.sessionDuration}>{formatDuration(item.duration)}</Text>
      </View>
      <View style={styles.sessionDetails}>
        <Text style={styles.sessionMala}>{item.malaCount} mala{item.malaCount !== 1 ? 's' : ''}</Text>
        {item.sankalp && <Text style={styles.sessionSankalp}>🙏 {item.sankalp}</Text>}
      </View>
    </TouchableOpacity>
  );

  const renderModal = () => {
    if (!selectedSession) return null;

    return (
      <Modal
        testID="session-detail-modal"
        visible={!!selectedSession}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedSession(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Session Details</Text>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Date</Text>
                <Text style={styles.modalValue}>{formatDate(selectedSession.date)}</Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Duration</Text>
                <Text style={styles.modalValue}>{formatDuration(selectedSession.duration)}</Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Mala Count</Text>
                <Text style={styles.modalValue}>{selectedSession.malaCount}</Text>
              </View>

              {selectedSession.shlokaName && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Shloka</Text>
                  <Text style={styles.modalValue}>{selectedSession.shlokaName}</Text>
                </View>
              )}

              {selectedSession.sankalp && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Sankalp</Text>
                  <Text style={styles.modalValue}>{selectedSession.sankalp}</Text>
                </View>
              )}

              {selectedSession.offering && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Offering</Text>
                  <Text style={styles.modalValue}>{selectedSession.offering}</Text>
                </View>
              )}

              {selectedSession.notes && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Notes</Text>
                  <Text style={styles.modalValue}>{selectedSession.notes}</Text>
                </View>
              )}
            </ScrollView>

            <TouchableOpacity
              testID="close-modal-button"
              style={styles.closeButton}
              onPress={() => setSelectedSession(null)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator testID="loading-indicator" size="large" color="#4CAF50" />
      </View>
    );
  }

  const { totalSessions, totalMinutes } = getTotalStats();

  return (
    <View style={styles.container}>
      <Text testID="history-title" style={styles.title}>
        Session History
      </Text>

      {totalSessions > 0 && (
        <View testID="stats-summary" style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalSessions}</Text>
            <Text style={styles.statLabel}>Total Sessions</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalMinutes}</Text>
            <Text style={styles.statLabel}>Total Minutes</Text>
          </View>
        </View>
      )}

      {sessions.length === 0 ? (
        <View testID="empty-state" style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No sessions yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Complete your first practice session to see it here
          </Text>
        </View>
      ) : (
        <FlatList
          testID="session-list"
          data={sessions}
          renderItem={renderSession}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}

      {renderModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  closeButton: {
    alignItems: 'center',
    backgroundColor: Colors.success,
    borderRadius: 12,
    marginTop: 16,
    padding: 16,
  },
  closeButtonText: {
    color: Colors.textBright,
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    backgroundColor: Colors.background,
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyStateSubtext: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  emptyStateText: {
    color: Colors.textBright,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 16,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    padding: 24,
  },
  modalLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  // eslint-disable-next-line react-native/no-color-literals
  modalOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // extra-dark overlay for bottom sheet
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalSection: {
    marginBottom: 16,
  },
  modalTitle: {
    color: Colors.textBright,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
  },
  modalValue: {
    color: Colors.textBright,
    fontSize: 16,
    lineHeight: 24,
  },
  sessionDate: {
    color: Colors.textBright,
    fontSize: 16,
    fontWeight: '600',
  },
  sessionDetails: {
    gap: 4,
  },
  sessionDuration: {
    color: Colors.success,
    fontSize: 16,
    fontWeight: '600',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sessionItem: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
  },
  sessionMala: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  sessionSankalp: {
    color: Colors.textBright,
    fontSize: 14,
    fontStyle: 'italic',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  statValue: {
    color: Colors.success,
    fontSize: 24,
    fontWeight: '700',
  },
  statsContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    padding: 16,
  },
  title: {
    color: Colors.textBright,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
  },
});
