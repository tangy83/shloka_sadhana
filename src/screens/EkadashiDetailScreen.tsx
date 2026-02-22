/**
 * EkadashiDetailScreen
 * Shloka Sadhana - V3 Feature #10
 *
 * Detailed view of a specific Ekadashi with full Vrat Katha
 */

import React from 'react';
import { Colors } from '@/constants/Colors';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { getEkadashiByDate } from '@/utils/ekadashiCalendar';

type EkadashiDetailRouteParams = {
  EkadashiDetail: {
    date: string;
  };
};

/**
 * Formats ISO date (YYYY-MM-DD) to readable format (Month DD, YYYY)
 */
function formatDate(isoDate: string): string {
  const date = new Date(isoDate + 'T00:00:00');
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  return `${month} ${day}, ${year}`;
}

/**
 * EkadashiDetailScreen - Full details and Vrat Katha for an Ekadashi
 */
export const EkadashiDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<EkadashiDetailRouteParams, 'EkadashiDetail'>>();
  const { date } = route.params;

  // Load Ekadashi data
  const ekadashi = getEkadashiByDate(date);

  // Handle case where Ekadashi not found
  if (!ekadashi) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Ekadashi not found for {date}</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.icon}>ॐ</Text>
        <Text style={styles.title}>{ekadashi.name}</Text>
        <Text style={styles.titleHindi}>{ekadashi.name_hindi}</Text>
      </View>

      {/* Date & Paksha */}
      <View style={styles.section}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Date:</Text>
          <Text style={styles.infoValue}>{formatDate(ekadashi.date)}</Text>
        </View>
        {ekadashi.day && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Day:</Text>
            <Text style={styles.infoValue}>{ekadashi.day}</Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Paksha:</Text>
          <Text style={styles.infoValue}>{ekadashi.paksha}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Deity:</Text>
          <Text style={styles.infoValue}>{ekadashi.deity}</Text>
        </View>
      </View>

      {/* Significance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Significance</Text>
        <Text style={styles.sectionContent}>{ekadashi.significance}</Text>
      </View>

      {/* Benefits */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Benefits</Text>
        <Text style={styles.sectionContent}>{ekadashi.benefits}</Text>
      </View>

      {/* Vrat Katha (Story) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vrat Katha</Text>
        <View style={styles.vrataKathaContainer}>
          <Text style={styles.vrataKatha}>{ekadashi.vrat_katha}</Text>
        </View>
      </View>

      {/* Recommendations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How to Observe</Text>
        <Text style={styles.sectionContent}>
          • Fast from sunrise to sunrise (or at least avoid grains and beans){'\n'}
          • Chant Vishnu Sahasranama or read scriptures{'\n'}
          • Perform puja and offer prayers to Lord Vishnu{'\n'}
          • Practice meditation and spiritual contemplation{'\n'}
          • Break fast the next day after sunrise
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  errorContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  icon: {
    color: '#FFD700',
    fontSize: 56,
    fontWeight: '700',
    marginBottom: 16,
  },
  infoLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    width: 80,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoValue: {
    color: '#FFF8E7',
    flex: 1,
    fontSize: 14,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 20,
    padding: 20,
  },
  sectionContent: {
    color: 'rgba(255, 243, 224, 0.9)',
    fontSize: 15,
    lineHeight: 22,
  },
  sectionTitle: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  title: {
    color: '#FFF8E7',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  titleHindi: {
    color: Colors.textSecondary,
    fontSize: 18,
    textAlign: 'center',
  },
  vrataKatha: {
    color: 'rgba(255, 243, 224, 0.9)',
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  vrataKathaContainer: {
    borderLeftColor: Colors.primary,
    borderLeftWidth: 3,
    paddingLeft: 16,
  },
});
