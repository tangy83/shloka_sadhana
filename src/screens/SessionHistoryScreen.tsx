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
import { PracticeSession } from '@/types';
import { getSessions } from '@/utils/storage';

interface SessionHistoryScreenProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  navigation: any;
}

export const SessionHistoryScreen: React.FC<SessionHistoryScreenProps> = () => {
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<PracticeSession | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const loadedSessions = await getSessions();
      // Sort by timestamp descending (most recent first)
      const sortedSessions = loadedSessions.sort((a, b) => b.timestamp - a.timestamp);
      setSessions(sortedSessions);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Handle error silently, show empty state
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

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const getTotalStats = () => {
    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((sum, session) => sum + Math.floor(session.duration / 60), 0);
    return { totalSessions, totalMinutes };
  };

  const renderSession = ({ item }: { item: PracticeSession }) => (
    <TouchableOpacity
      testID="session-item"
      data-session-id={item.id}
      style={styles.sessionItem}
      onPress={() => setSelectedSession(item)}
    >
      <View style={styles.sessionHeader}>
        <Text style={styles.sessionDate}>{formatDate(item.timestamp)}</Text>
        <Text style={styles.sessionDuration}>{formatDuration(item.duration)}</Text>
      </View>
      <View style={styles.sessionDetails}>
        <Text style={styles.sessionMala}>{item.count} mala{item.count !== 1 ? 's' : ''}</Text>
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
                <Text style={styles.modalValue}>{formatDate(selectedSession.timestamp)}</Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Duration</Text>
                <Text style={styles.modalValue}>{formatDuration(selectedSession.duration)}</Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Mala Count</Text>
                <Text style={styles.modalValue}>{selectedSession.count}</Text>
              </View>

              {selectedSession.shlokaId && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Shloka</Text>
                  <Text style={styles.modalValue}>{selectedSession.shlokaId}</Text>
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

              {selectedSession.reflection && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Reflection</Text>
                  <Text style={styles.modalValue}>{selectedSession.reflection}</Text>
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
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    marginTop: 16,
    padding: 16,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    backgroundColor: '#121212',
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
    color: '#9E9E9E',
    fontSize: 14,
    textAlign: 'center',
  },
  emptyStateText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 16,
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    padding: 24,
  },
  modalLabel: {
    color: '#9E9E9E',
    fontSize: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  modalOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalSection: {
    marginBottom: 16,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
  },
  modalValue: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
  },
  sessionDate: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  sessionDetails: {
    gap: 4,
  },
  sessionDuration: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sessionItem: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
  },
  sessionMala: {
    color: '#9E9E9E',
    fontSize: 14,
  },
  sessionSankalp: {
    color: '#FFFFFF',
    fontSize: 14,
    fontStyle: 'italic',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#9E9E9E',
    fontSize: 12,
    marginTop: 4,
  },
  statValue: {
    color: '#4CAF50',
    fontSize: 24,
    fontWeight: '700',
  },
  statsContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    padding: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
  },
});
