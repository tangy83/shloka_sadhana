/**
 * RecommendedShlokaCard Component
 * Shloka Sadhana - V3 Feature #6
 *
 * Displays intelligently recommended shloka based on day/user history
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getDailyRecommendation, ShlokaRecommendation } from '@/utils/shlokaRecommendation';
import { getTodayISO } from '@/utils/dateUtils';

/**
 * RecommendedShlokaCard component - displays daily shloka recommendation
 */
export const RecommendedShlokaCard: React.FC = () => {
  const navigation = useNavigation();
  const [recommendation, setRecommendation] = useState<ShlokaRecommendation | null>(null);

  useEffect(() => {
    try {
      const today = getTodayISO();
      const rec = getDailyRecommendation(today);
      setRecommendation(rec);
    } catch (error) {
      console.error('[RecommendedShlokaCard] Failed to load recommendation:', error);
      // Graceful degradation - component won't render
    }
  }, []);

  if (!recommendation) {
    return null;
  }

  const handlePress = () => {
    // Navigate to shloka detail screen
    // @ts-expect-error - Navigation types not fully defined
    navigation.navigate('ShlokaDetail', { shlokaId: recommendation.shloka.id });
  };

  const { shloka, reason } = recommendation;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`View ${shloka.name} details`}
      testID="recommended-shloka-card"
    >
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Recommended for You</Text>
        </View>
        {shloka.category && (
          <Text style={styles.category}>{shloka.category}</Text>
        )}
      </View>

      {/* Shloka Name */}
      <Text style={styles.name}>{shloka.name}</Text>

      {/* Deity */}
      <Text style={styles.deity}>{shloka.deity}</Text>

      {/* Reason */}
      <View style={styles.reasonContainer}>
        <Text style={styles.reasonIcon}>💡</Text>
        <Text style={styles.reason}>{reason}</Text>
      </View>

      {/* Description */}
      <Text style={styles.description} numberOfLines={2}>
        {shloka.description}
      </Text>

      {/* Benefits */}
      <View style={styles.benefitsContainer}>
        <Text style={styles.benefitsLabel}>Benefits:</Text>
        <Text style={styles.benefits} numberOfLines={1}>
          {shloka.benefits}
        </Text>
      </View>

      {/* Duration & Best Time */}
      <View style={styles.meta}>
        <View style={styles.metaItem}>
          <Text style={styles.metaIcon}>⏱️</Text>
          <Text style={styles.metaText}>{shloka.duration}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaIcon}>🌅</Text>
          <Text style={styles.metaText}>{shloka.bestTime}</Text>
        </View>
      </View>

      {/* CTA */}
      <View style={styles.cta}>
        <Text style={styles.ctaText}>Start Practice</Text>
        <Text style={styles.ctaArrow}>›</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: '#FF9800',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#121212',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  benefits: {
    color: '#9E9E9E',
    flex: 1,
    fontSize: 13,
  },
  benefitsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  benefitsLabel: {
    color: '#FF9800',
    fontSize: 13,
    fontWeight: '600',
  },
  category: {
    color: '#9E9E9E',
    fontSize: 12,
    fontStyle: 'italic',
  },
  container: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
  },
  cta: {
    alignItems: 'center',
    backgroundColor: '#FF9800',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 14,
  },
  ctaArrow: {
    color: '#121212',
    fontSize: 24,
    fontWeight: '300',
  },
  ctaText: {
    color: '#121212',
    fontSize: 16,
    fontWeight: '700',
  },
  deity: {
    color: '#FF9800',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  description: {
    color: '#BDBDBD',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  meta: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  metaIcon: {
    fontSize: 16,
  },
  metaItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  metaText: {
    color: '#9E9E9E',
    fontSize: 13,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  reason: {
    color: '#BDBDBD',
    flex: 1,
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  reasonContainer: {
    alignItems: 'flex-start',
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    padding: 12,
  },
  reasonIcon: {
    fontSize: 18,
  },
});
