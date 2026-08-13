/**
 * SatsangScreen
 * Shloka Sadhana - Spiritual Community
 *
 * A self-contained reflection on the practice of satsang (keeping company with
 * truth), with a CTA into a personal practice session. Static devotional
 * content only — no external services and nothing advertised as forthcoming.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';

const SATSANG_NOTES = [
  {
    icon: 'account-group-outline' as const,
    title: 'What Satsang Means',
    desc: 'Satsang is the practice of keeping company with truth — through sacred sound, scripture, and sincere reflection.',
  },
  {
    icon: 'book-open-variant' as const,
    title: 'Practice in Good Company',
    desc: 'Chanting shlokas recited for millennia joins your voice to an unbroken lineage of practitioners.',
  },
  {
    icon: 'fire' as const,
    title: 'Consistency Is Devotion',
    desc: 'A few minutes each day, held with intention, deepens the heart faster than occasional long sessions.',
  },
];

/**
 * Satsang screen — a reflection on practising in the company of truth.
 */
export const SatsangScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Satsang</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>In the company of truth</Text>
      </View>

      <ScrollView
        testID="satsang-scroll"
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero */}
        <View style={styles.heroSection}>
          <Text style={styles.omText}>ॐ</Text>
          <Text style={[styles.heroTitle, { color: theme.text }]}>
            Practise in the presence of the sacred
          </Text>
          <Text style={[styles.heroBody, { color: theme.textMeaning }]}>
            Satsang means gathering in the presence of truth. Wherever you are,
            your daily practice is part of a living tradition.
          </Text>
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: theme.divider }]} />

        {/* Reflections */}
        {SATSANG_NOTES.map((note) => (
          <View key={note.title} style={[styles.featureCard, { backgroundColor: theme.surface }]}>
            <MaterialCommunityIcons
              name={note.icon}
              size={28}
              color={Colors.primary}
              style={styles.featureIcon}
            />
            <View style={styles.featureText}>
              <Text style={[styles.featureTitle, { color: theme.text }]}>{note.title}</Text>
              <Text style={[styles.featureDesc, { color: theme.textMeaning }]}>{note.desc}</Text>
            </View>
          </View>
        ))}

        {/* CTA — start a personal practice session */}
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
              Deepen your own practice today
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
