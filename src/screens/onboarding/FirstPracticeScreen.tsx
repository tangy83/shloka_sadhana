/**
 * FirstPracticeScreen
 * Shloka Sadhana - Onboarding Screen 3
 *
 * Recommend first shloka based on user preferences
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { UserPreferences } from './OnboardingScreen';

interface FirstPracticeScreenProps {
  preferences: UserPreferences;
  onNext: () => void;
  onBack: () => void;
}

/**
 * Get recommended shloka based on user preferences
 */
function getRecommendedShloka(preferences: UserPreferences) {
  const { experienceLevel, dailyTime, preferredDeity } = preferences;

  // Deity-based recommendations
  if (preferredDeity === 'Shiva') {
    return {
      id: 'om-namah-shivaya',
      name: 'Om Namah Shivaya',
      duration: '5-10 min',
      description: 'Sacred five-syllable mantra dedicated to Lord Shiva',
    };
  } else if (preferredDeity === 'Vishnu') {
    return {
      id: 'vishnu-sahasranam',
      name: 'Vishnu Sahasranam (Excerpt)',
      duration: '10-15 min',
      description: 'Thousand names of Lord Vishnu',
    };
  } else if (preferredDeity === 'Devi') {
    return {
      id: 'durga-chalisa',
      name: 'Durga Chalisa',
      duration: '10-15 min',
      description: 'Forty verses in praise of Goddess Durga',
    };
  } else if (preferredDeity === 'Ganesha') {
    return {
      id: 'ganesha-mantra',
      name: 'Ganesha Mantra',
      duration: '5-10 min',
      description: 'Mantras to remove obstacles',
    };
  }

  // Default based on experience level and time
  if (experienceLevel === 'beginner' || dailyTime === '5-10') {
    return {
      id: 'gayatri-mantra',
      name: 'Gayatri Mantra',
      duration: '5-10 min',
      description: 'Universal prayer for wisdom and enlightenment',
    };
  } else if (dailyTime === '20+') {
    return {
      id: 'hanuman-chalisa',
      name: 'Hanuman Chalisa',
      duration: '15-20 min',
      description: 'Forty verses in praise of Lord Hanuman',
    };
  }

  // Default recommendation
  return {
    id: 'gayatri-mantra',
    name: 'Gayatri Mantra',
    duration: '5-10 min',
    description: 'Universal prayer for wisdom and enlightenment',
  };
}

/**
 * Screen 3: First Practice Setup
 */
export const FirstPracticeScreen: React.FC<FirstPracticeScreenProps> = ({
  preferences,
  onNext,
  onBack,
}) => {
  const recommendedShloka = getRecommendedShloka(preferences);

  /**
   * Start first practice with recommended shloka
   */
  const handleStartPractice = () => {
    onNext(); // Move to notification screen first
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>Let's start with something simple</Text>
        <Text style={styles.subtitle}>
          Based on your preferences, we recommend starting with:
        </Text>

        {/* Shloka Card */}
        <View style={styles.shlokaCard}>
          <View style={styles.shlokaHeader}>
            <Text style={styles.emoji}>📿</Text>
            <View style={styles.shlokaInfo}>
              <Text style={styles.shlokaName}>{recommendedShloka.name}</Text>
              <Text style={styles.shlokaDuration}>⏱️ {recommendedShloka.duration}</Text>
            </View>
          </View>
          <Text style={styles.shlokaDescription}>{recommendedShloka.description}</Text>

          {/* Why This Shloka */}
          <View style={styles.whySection}>
            <Text style={styles.whyTitle}>Why this shloka?</Text>
            <Text style={styles.whyText}>
              {preferences.experienceLevel === 'beginner'
                ? 'Perfect for beginners - simple and powerful'
                : preferences.preferredDeity
                ? `Dedicated to ${preferences.preferredDeity}, your preferred deity`
                : 'A universally recommended practice for all'}
            </Text>
          </View>
        </View>

        {/* Benefits */}
        <View style={styles.benefits}>
          <View style={styles.benefit}>
            <Text style={styles.benefitIcon}>✓</Text>
            <Text style={styles.benefitText}>Audio pronunciation guide</Text>
          </View>
          <View style={styles.benefit}>
            <Text style={styles.benefitIcon}>✓</Text>
            <Text style={styles.benefitText}>Line-by-line meaning</Text>
          </View>
          <View style={styles.benefit}>
            <Text style={styles.benefitIcon}>✓</Text>
            <Text style={styles.benefitText}>Track your progress</Text>
          </View>
        </View>
      </View>

      {/* CTA Button */}
      <TouchableOpacity
        style={styles.ctaButton}
        onPress={handleStartPractice}
        accessibilityRole="button"
        accessibilityLabel="Continue to notification setup"
      >
        <Text style={styles.ctaText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  backButton: {
    padding: 12,
  },
  backText: {
    color: '#FF9800',
    fontSize: 16,
  },
  benefit: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 12,
  },
  benefitIcon: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 12,
  },
  benefitText: {
    color: '#E0E0E0',
    fontSize: 15,
  },
  benefits: {
    marginTop: 24,
  },
  container: {
    backgroundColor: '#121212',
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  content: {
    flex: 1,
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
    fontSize: 40,
  },
  shlokaCard: {
    backgroundColor: '#1E1E1E',
    borderColor: '#FF9800',
    borderRadius: 16,
    borderWidth: 2,
    marginTop: 24,
    padding: 20,
  },
  shlokaDescription: {
    color: '#B0B0B0',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  shlokaDuration: {
    color: '#9E9E9E',
    fontSize: 13,
    marginTop: 4,
  },
  shlokaHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  shlokaInfo: {
    flex: 1,
    marginLeft: 16,
  },
  shlokaName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    color: '#9E9E9E',
    fontSize: 15,
    marginTop: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 20,
  },
  whySection: {
    backgroundColor: '#2A1F0F',
    borderRadius: 8,
    marginTop: 16,
    padding: 12,
  },
  whyText: {
    color: '#E0E0E0',
    fontSize: 13,
    lineHeight: 18,
  },
  whyTitle: {
    color: '#FF9800',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
});
