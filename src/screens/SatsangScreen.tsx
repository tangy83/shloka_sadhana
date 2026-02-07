/**
 * SatsangScreen
 * Shloka Sadhana - Spiritual Community
 *
 * Screen for community features, events, and spiritual calendar
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

interface CommunityEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'online' | 'local' | 'global';
  description: string;
}

// Sample events data
const upcomingEvents: CommunityEvent[] = [
  {
    id: 'event-1',
    title: 'Group Gayatri Mantra Chanting',
    date: 'Feb 10, 2026',
    time: '6:00 AM',
    type: 'online',
    description: '108 times collective chanting',
  },
  {
    id: 'event-2',
    title: 'Meditation Circle',
    date: 'Feb 12, 2026',
    time: '7:00 PM',
    type: 'local',
    description: 'Guided meditation session',
  },
  {
    id: 'event-3',
    title: 'Bhagavad Gita Discussion',
    date: 'Feb 15, 2026',
    time: '5:00 PM',
    type: 'online',
    description: 'Chapter 2 - Karma Yoga',
  },
];

/**
 * Satsang screen for community and spiritual events
 */
export const SatsangScreen: React.FC = () => {
  /**
   * Get event type display
   */
  const getEventTypeDisplay = (type: CommunityEvent['type']): { emoji: string; text: string } => {
    const typeMap: Record<CommunityEvent['type'], { emoji: string; text: string }> = {
      online: { emoji: '🌐', text: 'Online' },
      local: { emoji: '📍', text: 'Local' },
      global: { emoji: '🌍', text: 'Global' },
    };
    return typeMap[type];
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Satsang</Text>
        <Text style={styles.subtitle}>Spiritual Community</Text>
      </View>

      <ScrollView
        testID="satsang-scroll"
        contentContainerStyle={styles.scrollContent}
      >
        {/* Community Stats */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Global Practitioners</Text>
          <Text style={styles.statsCount} testID="practitioners-count">
            10,847
          </Text>
          <Text style={styles.statsSubtext}>Practicing daily meditation</Text>
        </View>

        {/* Upcoming Events */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          {upcomingEvents.map((event) => {
            const eventType = getEventTypeDisplay(event.type);
            return (
              <View key={event.id} style={styles.eventCard} testID="event-card">
                {/* Event Type Badge */}
                <View style={styles.eventTypeBadge}>
                  <Text style={styles.eventTypeEmoji} testID="event-type">
                    {eventType.emoji}
                  </Text>
                  <Text style={styles.eventTypeText} testID="event-type">
                    {eventType.text}
                  </Text>
                </View>

                {/* Event Title */}
                <Text style={styles.eventTitle} testID="event-title">
                  {event.title}
                </Text>

                {/* Event Description */}
                <Text style={styles.eventDescription}>{event.description}</Text>

                {/* Event Date and Time */}
                <View style={styles.eventMeta}>
                  <Text style={styles.eventDate} testID="event-date">
                    📅 {event.date}
                  </Text>
                  <Text style={styles.eventTime}>🕐 {event.time}</Text>
                </View>
              </View>
            );
          })}
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#121212',
    flex: 1,
  },
  eventCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    marginBottom: 16,
    padding: 20,
  },
  eventDate: {
    color: '#9E9E9E',
    fontSize: 13,
  },
  eventDescription: {
    color: '#BDBDBD',
    fontSize: 14,
    marginBottom: 12,
  },
  eventMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  eventTime: {
    color: '#9E9E9E',
    fontSize: 13,
  },
  eventTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  eventTypeBadge: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  eventTypeEmoji: {
    fontSize: 16,
  },
  eventTypeText: {
    color: '#FF9800',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  header: {
    padding: 20,
    paddingTop: 60,
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
  statsCard: {
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    marginBottom: 24,
    padding: 24,
  },
  statsCount: {
    color: '#FF9800',
    fontSize: 48,
    fontWeight: '700',
    marginBottom: 8,
  },
  statsSubtext: {
    color: '#BDBDBD',
    fontSize: 14,
  },
  statsTitle: {
    color: '#9E9E9E',
    fontSize: 14,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  subtitle: {
    color: '#9E9E9E',
    fontSize: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
});
