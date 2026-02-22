/**
 * TermsOfServiceScreen
 * Shloka Sadhana - Terms of Service
 *
 * Terms and conditions for using the app
 */

import React from 'react';
import { Colors } from '@/constants/Colors';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

/**
 * TermsOfServiceScreen - Terms of service details
 */
export const TermsOfServiceScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Terms of Service</Text>
        <Text style={styles.lastUpdated}>Last Updated: February 7, 2026</Text>
      </View>

      {/* Introduction */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Agreement to Terms</Text>
        <Text style={styles.paragraph}>
          By downloading, installing, or using Shloka Sadhana (&quot;the App&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, please do not use the App.
        </Text>
      </View>

      {/* License */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>License to Use</Text>
        <Text style={styles.paragraph}>
          We grant you a limited, non-exclusive, non-transferable, revocable license to use the App for personal, non-commercial purposes in accordance with these Terms. This license does not include the right to:{'\n\n'}
          • Modify, copy, or distribute the App{'\n'}
          • Reverse engineer or decompile the App{'\n'}
          • Remove any copyright or proprietary notices{'\n'}
          • Use the App for commercial purposes
        </Text>
      </View>

      {/* Content and Intellectual Property */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Content and Intellectual Property</Text>
        <Text style={styles.paragraph}>
          All shlokas, mantras, and spiritual content in the App are derived from ancient Hindu scriptures and sacred texts. While these texts are in the public domain, our specific compilation, translation, commentary, and presentation are protected by copyright.{'\n\n'}
          The App&apos;s design, features, and functionality are owned by Shloka Sadhana and are protected by international copyright, trademark, and other intellectual property laws.
        </Text>
      </View>

      {/* User Responsibilities */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User Responsibilities</Text>
        <Text style={styles.paragraph}>
          You agree to:{'\n\n'}
          • Use the App in a respectful and lawful manner{'\n'}
          • Respect the spiritual nature of the content{'\n'}
          • Not misuse or attempt to harm the App{'\n'}
          • Not share your account or access credentials{'\n'}
          • Comply with all applicable laws and regulations
        </Text>
      </View>

      {/* Spiritual Guidance Disclaimer */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Spiritual Guidance Disclaimer</Text>
        <Text style={styles.paragraph}>
          Shloka Sadhana provides spiritual content for educational and devotional purposes. The App is not a substitute for professional spiritual guidance, religious counseling, or medical advice. Always consult with qualified teachers, priests, or healthcare professionals for personal spiritual or health matters.
        </Text>
      </View>

      {/* Accuracy of Content */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Accuracy of Content</Text>
        <Text style={styles.paragraph}>
          While we strive to provide accurate translations and interpretations of sacred texts, we cannot guarantee the absolute accuracy of all content. Different schools of thought may have varying interpretations. We encourage users to consult with spiritual teachers for deeper understanding.
        </Text>
      </View>

      {/* Limitation of Liability */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          To the fullest extent permitted by law, Shloka Sadhana and its developers shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from:{'\n\n'}
          • Your use or inability to use the App{'\n'}
          • Any errors or omissions in the content{'\n'}
          • Any unauthorized access to or use of our servers{'\n'}
          • Any interruption or cessation of the App
        </Text>
      </View>

      {/* App Availability */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Availability</Text>
        <Text style={styles.paragraph}>
          We do not guarantee that the App will be available at all times or that it will be error-free. We reserve the right to modify, suspend, or discontinue the App at any time without notice.
        </Text>
      </View>

      {/* Updates and Changes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Updates and Changes</Text>
        <Text style={styles.paragraph}>
          We may release updates to the App from time to time. These updates may include new features, bug fixes, or changes to existing functionality. You are responsible for keeping your App updated to the latest version.
        </Text>
      </View>

      {/* Termination */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Termination</Text>
        <Text style={styles.paragraph}>
          We reserve the right to terminate or suspend your access to the App immediately, without prior notice, for any reason, including breach of these Terms. Upon termination, you must cease all use of the App and delete it from your device.
        </Text>
      </View>

      {/* Governing Law */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Governing Law</Text>
        <Text style={styles.paragraph}>
          These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Shloka Sadhana operates, without regard to its conflict of law provisions.
        </Text>
      </View>

      {/* Changes to Terms */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Changes to Terms</Text>
        <Text style={styles.paragraph}>
          We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new Terms on this page and updating the &quot;Last Updated&quot; date. Your continued use of the App after changes constitutes acceptance of the new Terms.
        </Text>
      </View>

      {/* Contact Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have any questions about these Terms of Service, please contact us at:{'\n\n'}
          Email: legal@shlokasadhana.com{'\n'}
          Website: www.shlokasadhana.com/terms
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          By using Shloka Sadhana, you agree to these terms.{'\n'}
          © 2026 Shloka Sadhana
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
