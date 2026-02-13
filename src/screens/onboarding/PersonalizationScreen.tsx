/**
 * PersonalizationScreen
 * Shloka Sadhana - Onboarding Screen 2
 *
 * Personalization questions: experience level, daily time, preferred deity
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import type { UserPreferences } from './OnboardingScreen';

interface PersonalizationScreenProps {
  preferences: UserPreferences;
  onUpdatePreferences: (updates: Partial<UserPreferences>) => void;
  onNext: () => void;
  onBack: () => void;
}

/**
 * Screen 2: Personalization Questions
 */
export const PersonalizationScreen: React.FC<PersonalizationScreenProps> = ({
  preferences,
  onUpdatePreferences,
  onNext,
  onBack,
}) => {
  const experienceLevels = [
    { value: 'beginner' as const, label: 'Beginner', desc: 'New to chanting shlokas' },
    { value: 'intermediate' as const, label: 'Intermediate', desc: 'Familiar with some mantras' },
    { value: 'advanced' as const, label: 'Advanced', desc: 'Regular spiritual practice' },
  ];

  const dailyTimes = [
    { value: '5-10' as const, label: '5-10 minutes' },
    { value: '10-20' as const, label: '10-20 minutes' },
    { value: '20+' as const, label: '20+ minutes' },
    { value: 'flexible' as const, label: 'Flexible' },
  ];

  const deities = [
    { value: 'Shiva', label: 'Shiva', emoji: '🕉️' },
    { value: 'Vishnu', label: 'Vishnu', emoji: '🙏' },
    { value: 'Devi', label: 'Devi', emoji: '🌸' },
    { value: 'Ganesha', label: 'Ganesha', emoji: '🐘' },
    { value: 'none', label: 'No preference', emoji: '✨' },
  ];

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

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Title */}
        <Text style={styles.title}>Let's personalize your experience</Text>
        <Text style={styles.subtitle}>This helps us recommend the right shlokas for you</Text>

        {/* Question 1: Experience Level */}
        <View style={styles.section}>
          <Text style={styles.questionTitle}>What's your experience level?</Text>
          {experienceLevels.map((level) => (
            <TouchableOpacity
              key={level.value}
              style={[
                styles.option,
                preferences.experienceLevel === level.value && styles.optionSelected,
              ]}
              onPress={() => onUpdatePreferences({ experienceLevel: level.value })}
              accessibilityRole="button"
              accessibilityLabel={`Select ${level.label}`}
            >
              <View style={styles.optionContent}>
                <Text style={[
                  styles.optionLabel,
                  preferences.experienceLevel === level.value && styles.optionLabelSelected,
                ]}>
                  {level.label}
                </Text>
                <Text style={styles.optionDesc}>{level.desc}</Text>
              </View>
              {preferences.experienceLevel === level.value && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Question 2: Daily Time */}
        <View style={styles.section}>
          <Text style={styles.questionTitle}>How much time can you dedicate daily?</Text>
          {dailyTimes.map((time) => (
            <TouchableOpacity
              key={time.value}
              style={[
                styles.option,
                preferences.dailyTime === time.value && styles.optionSelected,
              ]}
              onPress={() => onUpdatePreferences({ dailyTime: time.value })}
              accessibilityRole="button"
              accessibilityLabel={`Select ${time.label}`}
            >
              <Text style={[
                styles.optionLabel,
                preferences.dailyTime === time.value && styles.optionLabelSelected,
              ]}>
                {time.label}
              </Text>
              {preferences.dailyTime === time.value && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Question 3: Preferred Deity (Optional) */}
        <View style={styles.section}>
          <Text style={styles.questionTitle}>Which deity resonates with you? (Optional)</Text>
          <View style={styles.deityGrid}>
            {deities.map((deity) => (
              <TouchableOpacity
                key={deity.value}
                style={[
                  styles.deityOption,
                  preferences.preferredDeity === deity.value && styles.deityOptionSelected,
                ]}
                onPress={() => onUpdatePreferences({ preferredDeity: deity.value })}
                accessibilityRole="button"
                accessibilityLabel={`Select ${deity.label}`}
              >
                <Text style={styles.deityEmoji}>{deity.emoji}</Text>
                <Text style={[
                  styles.deityLabel,
                  preferences.preferredDeity === deity.value && styles.deityLabelSelected,
                ]}>
                  {deity.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <TouchableOpacity
        style={styles.ctaButton}
        onPress={onNext}
        accessibilityRole="button"
        accessibilityLabel="Continue"
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
  checkmark: {
    color: '#FF9800',
    fontSize: 24,
    fontWeight: '700',
  },
  container: {
    backgroundColor: '#121212',
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
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
  deityEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  deityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  deityLabel: {
    color: '#E0E0E0',
    fontSize: 14,
    textAlign: 'center',
  },
  deityLabelSelected: {
    color: '#FF9800',
    fontWeight: '600',
  },
  deityOption: {
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderColor: '#3E3E3E',
    borderRadius: 12,
    borderWidth: 2,
    flex: 1,
    minWidth: '30%',
    paddingVertical: 16,
  },
  deityOptionSelected: {
    backgroundColor: '#2A1F0F',
    borderColor: '#FF9800',
  },
  option: {
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderColor: '#3E3E3E',
    borderRadius: 12,
    borderWidth: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionDesc: {
    color: '#9E9E9E',
    fontSize: 13,
    marginTop: 4,
  },
  optionLabel: {
    color: '#E0E0E0',
    fontSize: 16,
    fontWeight: '600',
  },
  optionLabelSelected: {
    color: '#FF9800',
  },
  optionSelected: {
    backgroundColor: '#2A1F0F',
    borderColor: '#FF9800',
  },
  questionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  subtitle: {
    color: '#9E9E9E',
    fontSize: 14,
    marginBottom: 32,
    marginTop: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
});
