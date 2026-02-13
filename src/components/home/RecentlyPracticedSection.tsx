/**
 * RecentlyPracticedSection Component
 * Shloka Sadhana - P0 #28 (Days 37-38)
 *
 * Displays recently practiced shlokas for quick repeat access
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUserStore } from '@/stores/useUserStore';
import { Colors } from '@/constants/Colors';
import { Layout, Spacing } from '@/constants/Layout';

/**
 * Recently Practiced Section
 * Shows horizontal scrollable list of last 5 practiced shlokas
 */
export const RecentlyPracticedSection: React.FC = () => {
  const navigation = useNavigation();
  const { recentlyPracticedShlokas } = useUserStore();

  // Don't render if no recent practices
  if (recentlyPracticedShlokas.length === 0) {
    return null;
  }

  /**
   * Navigate to practice screen with selected shloka
   */
  const handleShlokaPress = (shlokaId: string, shlokaName: string) => {
    navigation.navigate('Practice' as never, {
      shlokaId,
      shlokaName,
    } as never);
  };

  /**
   * Format last practiced time (e.g., "2 days ago")
   */
  const getTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const practiced = new Date(timestamp);
    const diffMs = now.getTime() - practiced.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return `${Math.floor(diffDays / 7)} weeks ago`;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Recently Practiced</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {recentlyPracticedShlokas.map((shloka) => (
          <TouchableOpacity
            key={shloka.id}
            style={styles.card}
            onPress={() => handleShlokaPress(shloka.id, shloka.name)}
            accessibilityRole="button"
            accessibilityLabel={`Practice ${shloka.name} again`}
            accessibilityHint={`Last practiced ${getTimeAgo(shloka.lastPracticed)}`}
          >
            <View style={styles.cardContent}>
              {/* Icon */}
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>🔁</Text>
              </View>

              {/* Shloka Name */}
              <Text style={styles.shlokaName} numberOfLines={2}>
                {shloka.name}
              </Text>

              {/* Last Practiced */}
              <Text style={styles.lastPracticed}>
                {getTimeAgo(shloka.lastPracticed)}
              </Text>

              {/* Practice Again CTA */}
              <View style={styles.ctaContainer}>
                <Text style={styles.ctaText}>Practice Again</Text>
                <Text style={styles.ctaArrow}>›</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  scrollContent: {
    paddingRight: Spacing.md, // Extra padding at end of scroll
  },
  card: {
    width: 160,
    backgroundColor: Colors.cardBackground,
    borderRadius: Layout.borderRadius,
    marginRight: Spacing.md,
    overflow: 'hidden',
  },
  cardContent: {
    padding: Spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 152, 0, 0.1)', // Primary orange tint
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  icon: {
    fontSize: 24,
  },
  shlokaName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
    minHeight: 40, // Reserve space for 2 lines
  },
  lastPracticed: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  ctaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
  },
  ctaArrow: {
    fontSize: 24,
    color: Colors.primary,
  },
});
