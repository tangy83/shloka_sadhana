/**
 * PrivacyPolicyScreen
 * Shloka Sadhana - Privacy Policy
 *
 * Privacy policy and data handling information
 */

import React from 'react';
import { Colors } from '@/constants/Colors';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * PrivacyPolicyScreen - Privacy policy details
 */
export const PrivacyPolicyScreen: React.FC = () => {
  const { theme } = useTheme();
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textBright }]}>Privacy Policy</Text>
        <Text style={[styles.lastUpdated, { color: theme.textSecondary }]}>Last Updated: February 7, 2026</Text>
      </View>

      {/* Introduction */}
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={styles.sectionTitle}>Introduction</Text>
        <Text style={[styles.paragraph, { color: theme.textMeaning }]}>
          Sadhana (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application.
        </Text>
      </View>

      {/* Information We Collect */}
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={styles.sectionTitle}>Information We Collect</Text>
        <Text style={[styles.paragraph, { color: theme.textMeaning }]}>
          We collect and store the following information locally on your device:{'\n\n'}
          • Practice history and session data{'\n'}
          • Streak and statistics information{'\n'}
          • App preferences and settings{'\n'}
          • Favorite shlokas and bookmarks{'\n'}
          • Notification preferences
        </Text>
      </View>

      {/* How We Use Information */}
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={styles.sectionTitle}>How We Use Your Information</Text>
        <Text style={[styles.paragraph, { color: theme.textMeaning }]}>
          We use the information we collect to:{'\n\n'}
          • Provide and maintain app functionality{'\n'}
          • Track your spiritual practice progress{'\n'}
          • Send daily reminder notifications (if enabled){'\n'}
          • Personalize your experience{'\n'}
          • Improve our app and services
        </Text>
      </View>

      {/* Data Storage */}
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={styles.sectionTitle}>Data Storage</Text>
        <Text style={[styles.paragraph, { color: theme.textMeaning }]}>
          All your data is stored locally on your device. We do not transmit your personal practice data to any external servers. Your information remains private and under your control. You can delete all app data at any time through the Settings menu.
        </Text>
      </View>

      {/* Location Information */}
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={styles.sectionTitle}>Location Information</Text>
        <Text style={[styles.paragraph, { color: theme.textMeaning }]}>
          We may request access to your location to calculate accurate auspicious times (muhurat) based on your geographical coordinates. This information is used only for calculations and is not stored or transmitted.
        </Text>
      </View>

      {/* Notifications */}
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <Text style={[styles.paragraph, { color: theme.textMeaning }]}>
          If you enable daily reminders, we will use your device&apos;s notification system to send you practice reminders. You can disable notifications at any time through the app settings or your device settings.
        </Text>
      </View>

      {/* Third-Party Services */}
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={styles.sectionTitle}>Third-Party Services</Text>
        <Text style={[styles.paragraph, { color: theme.textMeaning }]}>
          Our app does not currently integrate with any third-party analytics or advertising services. We respect your privacy and do not share your data with third parties.
        </Text>
      </View>

      {/* Children's Privacy */}
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={styles.sectionTitle}>Children&apos;s Privacy</Text>
        <Text style={[styles.paragraph, { color: theme.textMeaning }]}>
          Our app is suitable for all ages. We do not knowingly collect personal information from children. All data is stored locally on the device and is not transmitted to external servers.
        </Text>
      </View>

      {/* Data Security */}
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={styles.sectionTitle}>Data Security</Text>
        <Text style={[styles.paragraph, { color: theme.textMeaning }]}>
          We implement appropriate security measures to protect your information stored locally on your device. However, please note that no method of electronic storage is 100% secure.
        </Text>
      </View>

      {/* Your Rights */}
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={styles.sectionTitle}>Your Rights</Text>
        <Text style={[styles.paragraph, { color: theme.textMeaning }]}>
          You have the right to:{'\n\n'}
          • Access your data stored in the app{'\n'}
          • Delete all your data through app settings{'\n'}
          • Opt out of notifications{'\n'}
          • Uninstall the app to remove all local data
        </Text>
      </View>

      {/* Changes to Privacy Policy */}
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={styles.sectionTitle}>Changes to This Privacy Policy</Text>
        <Text style={[styles.paragraph, { color: theme.textMeaning }]}>
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date.
        </Text>
      </View>

      {/* Contact Us */}
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={styles.sectionTitle}>Contact Us</Text>
        <Text style={[styles.paragraph, { color: theme.textMeaning }]}>
          If you have any questions about this Privacy Policy, please contact us at:{'\n\n'}
          Email: info@contextfirstai.com{'\n'}
          Website: https://www.contextfirstai.com/
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.textSecondary }]}>
          Your privacy is important to us.{'\n'}
          © 2026 Sadhana
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
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
    marginBottom: 24,
    paddingBottom: 24,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  lastUpdated: {
    color: Colors.textSecondary,
    fontSize: 14,
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
  title: {
    color: Colors.textBright,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
});
