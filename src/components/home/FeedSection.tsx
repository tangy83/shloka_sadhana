/**
 * Feed Section Component
 * Shloka Sadhana - Phase 2A: Engagement Core
 *
 * Generic wrapper for feed sections with analytics tracking
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FeedSection as FeedSectionType } from '@/types/feed';
import { analyticsService } from '@/services/analytics';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';

interface FeedSectionProps {
  section: FeedSectionType;
  children: React.ReactNode;
  title?: string;
  showTitle?: boolean;
}

/**
 * FeedSection Component
 * Wraps section content with analytics tracking and optional title
 */
export const FeedSection: React.FC<FeedSectionProps> = ({
  section,
  children,
  title,
  showTitle = true,
}) => {
  // Track section view when mounted
  useEffect(() => {
    analyticsService.trackEvent('feed_section_viewed', {
      section_type: section.type,
      section_score: section.score,
      section_timestamp: section.timestamp,
    });
  }, [section.id]); // Only track once per section instance

  const getSectionTitle = (): string => {
    if (title) return title;

    // Default titles based on section type
    switch (section.type) {
      case 'resume_practice':
        return 'Continue Your Practice';
      case 'daily_quest':
        return "Today's Challenge";
      case 'streak_recovery':
        return 'Start a New Streak';
      case 'achievement_progress':
        return 'Almost There!';
      case 'recommended_shloka':
        return 'Recommended for You';
      case 'friend_activity':
        return 'Friend Activity';
      case 'group_challenge':
        return 'Group Challenge';
      case 'recently_practiced':
        return 'Recently Practiced';
      case 'verse_of_day':
        return 'Verse of the Day';
      case 'hindu_calendar':
        return 'Hindu Calendar';
      case 'daily_wisdom':
        return 'Daily Wisdom';
      default:
        return 'For You';
    }
  };

  return (
    <View style={styles.container}>
      {showTitle && (
        <Text style={styles.title}>{getSectionTitle()}</Text>
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Layout.spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.md,
  },
});
