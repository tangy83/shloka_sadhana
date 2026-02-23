/**
 * SatsangScreen
 * Shloka Sadhana - Spiritual Community
 *
 * Graceful "coming soon" stub — community features (group chanting,
 * shared sessions, Satsang circles) are planned for a future release.
 * No hardcoded data, no fake events.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * Satsang screen — graceful community coming-soon stub
 */
export const SatsangScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Satsang</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Spiritual Community</Text>
      </View>

      <ScrollView
        testID="satsang-scroll"
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero icon */}
        <View style={styles.heroSection}>
          <MaterialCommunityIcons
            name="bell-ring-outline"
            size={72}
            color={Colors.primary}
            style={styles.heroIcon}
          />
          <Text style={styles.omText}>ॐ</Text>
          <Text style={[styles.heroTitle, { color: theme.text }]}>
            Join a global community of practitioners
          </Text>
          <Text style={[styles.heroBody, { color: theme.textMeaning }]}>
            Community features — group chanting, shared sessions,
            and Satsang circles — are coming in a future update.
          </Text>
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: theme.divider }]} />

        {/* Feature preview cards */}
        <Text style={[styles.previewLabel, { color: theme.textSecondary }]}>Coming soon</Text>

        {[
          {
            icon: 'account-group-outline' as const,
            title: 'Group Chanting',
            desc: 'Chant together with practitioners worldwide in real time',
          },
          {
            icon: 'calendar-heart' as const,
            title: 'Satsang Events',
            desc: 'Join scheduled scripture study sessions and spiritual talks',
          },
          {
            icon: 'fire' as const,
            title: 'Shared Streaks',
            desc: 'Challenge friends to maintain daily practice streaks',
          },
        ].map((feature) => (
          <View key={feature.title} style={[styles.featureCard, { backgroundColor: theme.surface }]}>
            <MaterialCommunityIcons
              name={feature.icon}
              size={28}
              color={theme.textSecondary}
              style={styles.featureIcon}
            />
            <View style={styles.featureText}>
              <Text style={[styles.featureTitle, { color: theme.text }]}>{feature.title}</Text>
              <Text style={[styles.featureDesc, { color: theme.textMeaning }]}>{feature.desc}</Text>
            </View>
          </View>
        ))}

        {/* CTA — redirect to Practice */}
        <TouchableOpacity
          style={styles.ctaCard}
          onPress={() => navigation.navigate('Practice' as never)}
          accessibilityRole="button"
          accessibilityLabel="Start a personal practice session"
        >
          <MaterialCommunityIcons name="meditation" size={28} color={Colors.textOnColor} />
          <View style={styles.ctaText}>
            <Text style={styles.ctaTitle}>Start a Personal Session</Text>
            <Text style={styles.ctaSubtitle}>
              In the meantime, deepen your own practice
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color={Colors.textOnColor} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  ctaCard: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
    padding: 20,
  },
  ctaSubtitle: {
    color: Colors.background,
    fontSize: 13,
    opacity: 0.85,
  },
  ctaText: {
    flex: 1,
  },
  ctaTitle: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  divider: {
    backgroundColor: Colors.border,
    height: 1,
    marginBottom: 20,
    marginTop: 8,
  },
  featureCard: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
    padding: 16,
  },
  featureDesc: {
    color: Colors.textMeaning,
    fontSize: 13,
    lineHeight: 18,
  },
  featureIcon: {
    width: 32,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  heroBody: {
    color: Colors.textMeaning,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  heroIcon: {
    marginBottom: 16,
  },
  heroSection: {
    alignItems: 'center',
    paddingBottom: 24,
    paddingTop: 8,
  },
  heroTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  omText: {
    color: Colors.primaryLight,
    fontSize: 48,
    fontWeight: '700',
    marginBottom: 16,
  },
  previewLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  title: {
    color: Colors.text,
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
});
