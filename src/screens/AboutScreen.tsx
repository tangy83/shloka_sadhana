/**
 * AboutScreen
 * Shloka Sadhana - About the App
 *
 * Information about Shloka Sadhana app
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Constants from 'expo-constants';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * AboutScreen - Information about the app
 */
export const AboutScreen: React.FC = () => {
  const { theme } = useTheme();
  const appVersion = Constants.expoConfig?.version || '1.0.0';

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      {/* App Icon/Logo */}
      <View style={styles.header}>
        <Text style={styles.logo}>ॐ</Text>
        <Text style={styles.appName}>Sadhana</Text>
        <Text style={[styles.version, { color: theme.textSecondary }]}>Version {appVersion}</Text>
      </View>

      {/* Mission Section */}
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={styles.sectionTitle}>Our Mission</Text>
        <Text style={[styles.paragraph, { color: theme.textMeaning }]}>
          Sadhana is dedicated to preserving and promoting the sacred practice of mantra chanting and spiritual devotion. Our mission is to make ancient Hindu wisdom accessible to everyone, helping practitioners deepen their spiritual journey through daily practice and mindfulness.
        </Text>
      </View>

      {/* Features Section */}
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={styles.sectionTitle}>What We Offer</Text>
        <Text style={[styles.paragraph, { color: theme.textMeaning }]}>
          • Comprehensive library of authentic shlokas and mantras{'\n'}
          • Guided meditation and chanting sessions{'\n'}
          • Track your spiritual progress with streaks and statistics{'\n'}
          • Daily wisdom from ancient Hindu scriptures{'\n'}
          • Hindu calendar with auspicious times and festivals{'\n'}
          • Ekadashi calendar with detailed vrat kathas{'\n'}
          • Community satsang and spiritual events
        </Text>
      </View>

      {/* Philosophy Section */}
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={styles.sectionTitle}>Our Philosophy</Text>
        <Text style={[styles.paragraph, { color: theme.textMeaning }]}>
          We believe in the transformative power of consistent spiritual practice. Through daily chanting and meditation, we aim to help practitioners achieve inner peace, mental clarity, and spiritual growth. Sadhana combines traditional wisdom with modern technology to create a seamless spiritual experience.
        </Text>
      </View>

      {/* Authenticity Section */}
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={styles.sectionTitle}>Authenticity</Text>
        <Text style={[styles.paragraph, { color: theme.textMeaning }]}>
          All shlokas, mantras, and wisdom quotes in our app are drawn from traditional sacred texts, including the Bhagavad Gita, Vedas, Upanishads, and the words of revered saints. The Sanskrit texts are presented in their traditional form; the English renderings and explanations are our own, written to be accessible for daily practice. Traditions may interpret verses differently — if you spot an error, please let us know.
        </Text>
      </View>

      {/* Contact Section */}
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={styles.sectionTitle}>Get In Touch</Text>
        <Text style={[styles.paragraph, { color: theme.textMeaning }]}>
          We welcome your feedback, suggestions, and questions. Feel free to reach out to us at:{'\n\n'}
          Email: info@contextfirstai.com{'\n'}
          Website: https://www.contextfirstai.com/
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.textSecondary }]}>
          Made with devotion and dedication{'\n'}
          © 2026 Sadhana
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  appName: {
    color: Colors.primary,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
    paddingHorizontal: 20,
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
    marginBottom: 24,
    paddingBottom: 24,
    paddingTop: 40,
  },
  logo: {
    color: Colors.templeGold,
    fontSize: 72,
    fontWeight: '700',
    marginBottom: 16,
  },
  paragraph: {
    color: Colors.textMeaning,
    fontSize: 15,
    lineHeight: 24,
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 20,
    padding: 20,
  },
  sectionTitle: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  version: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
});
