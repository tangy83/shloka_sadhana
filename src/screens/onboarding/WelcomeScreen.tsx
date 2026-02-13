/**
 * WelcomeScreen
 * Shloka Sadhana - Onboarding Screen 1
 *
 * Value proposition and app introduction
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface WelcomeScreenProps {
  onNext: () => void;
  onSkip: () => void;
}

/**
 * Screen 1: Value Proposition
 */
export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNext, onSkip }) => {
  return (
    <View style={styles.container}>
      {/* Skip Button */}
      <TouchableOpacity
        style={styles.skipButton}
        onPress={onSkip}
        accessibilityRole="button"
        accessibilityLabel="Skip onboarding"
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.content}>
        {/* Visual */}
        <View style={styles.visual}>
          <Text style={styles.emoji}>🙏</Text>
          <Text style={styles.visualSubtext}>🕉️ ✨ 📿</Text>
        </View>

        {/* Headline */}
        <Text style={styles.headline}>Practice Sacred Shlokas Daily</Text>

        {/* Subheadline */}
        <Text style={styles.subheadline}>
          Build a spiritual practice habit with guided meditation, streak tracking, and Hindu calendar insights
        </Text>

        {/* Benefits */}
        <View style={styles.benefits}>
          <View style={styles.benefit}>
            <Text style={styles.benefitEmoji}>📚</Text>
            <Text style={styles.benefitText}>Authentic Sanskrit texts</Text>
          </View>
          <View style={styles.benefit}>
            <Text style={styles.benefitEmoji}>🔥</Text>
            <Text style={styles.benefitText}>Daily streak tracking</Text>
          </View>
          <View style={styles.benefit}>
            <Text style={styles.benefitEmoji}>🌙</Text>
            <Text style={styles.benefitText}>Hindu calendar guidance</Text>
          </View>
        </View>
      </View>

      {/* CTA Button */}
      <TouchableOpacity
        style={styles.ctaButton}
        onPress={onNext}
        accessibilityRole="button"
        accessibilityLabel="Get Started"
      >
        <Text style={styles.ctaText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  benefit: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 16,
  },
  benefitEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  benefitText: {
    color: '#E0E0E0',
    fontSize: 16,
  },
  benefits: {
    marginTop: 32,
  },
  container: {
    backgroundColor: '#121212',
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  ctaButton: {
    backgroundColor: '#FF9800',
    borderRadius: 12,
    marginBottom: 80,
    paddingVertical: 16,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  emoji: {
    fontSize: 80,
    marginBottom: 8,
  },
  headline: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    marginTop: 32,
    textAlign: 'center',
  },
  skipButton: {
    alignSelf: 'flex-end',
    padding: 12,
  },
  skipText: {
    color: '#9E9E9E',
    fontSize: 16,
  },
  subheadline: {
    color: '#B0B0B0',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 16,
    textAlign: 'center',
  },
  visual: {
    alignItems: 'center',
  },
  visualSubtext: {
    fontSize: 32,
  },
});
