/**
 * Referral Code Input Component
 * Shloka Sadhana - Phase 2A Week 18: Referral Program
 *
 * Input field for entering referral code during onboarding
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { referralService } from '@/services/referralService';

interface ReferralCodeInputProps {
  onCodeValidated: (code: string) => void;
  onSkip: () => void;
}

export const ReferralCodeInput: React.FC<ReferralCodeInputProps> = ({
  onCodeValidated,
  onSkip,
}) => {
  const [code, setCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState('');

  const handleValidate = async () => {
    if (!code.trim()) {
      setError('Please enter a referral code');
      return;
    }

    setValidating(true);
    setError('');

    try {
      const isValid = await referralService.validateReferralCode(code.toUpperCase());

      if (isValid) {
        onCodeValidated(code.toUpperCase());
      } else {
        setError('Invalid referral code. Please check and try again.');
      }
    } catch (error) {
      console.error('[ReferralCodeInput] Validation error:', error);
      setError('Failed to validate code. Please try again.');
    } finally {
      setValidating(false);
    }
  };

  const handleCodeChange = (text: string) => {
    setCode(text.toUpperCase());
    setError('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Do you have a referral code?</Text>
      <Text style={styles.subtitle}>
        Enter a friend's code to get 50 XP when you complete your first practice!
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, error ? styles.inputError : null]}
          placeholder="Enter code (e.g., PRIYA2024)"
          placeholderTextColor={Colors.dark.textSecondary}
          value={code}
          onChangeText={handleCodeChange}
          autoCapitalize="characters"
          maxLength={12}
          editable={!validating}
          accessible={true}
          accessibilityLabel="Referral code input"
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.validateButton, validating && styles.buttonDisabled]}
          onPress={handleValidate}
          disabled={validating || !code.trim()}
          accessible={true}
          accessibilityLabel="Validate referral code"
          accessibilityRole="button"
        >
          {validating ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.validateButtonText}>Continue with Code</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={onSkip}
          disabled={validating}
          accessible={true}
          accessibilityLabel="Skip referral code"
          accessibilityRole="button"
        >
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: Layout.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    marginBottom: Layout.spacing.xl,
    textAlign: 'center',
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: Layout.spacing.lg,
  },
  input: {
    backgroundColor: Colors.dark.card,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    fontSize: 18,
    color: Colors.dark.text,
    borderWidth: 2,
    borderColor: Colors.dark.border,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 1,
  },
  inputError: {
    borderColor: '#F44336',
  },
  errorText: {
    fontSize: 14,
    color: '#F44336',
    marginTop: Layout.spacing.xs,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: Layout.spacing.md,
  },
  validateButton: {
    backgroundColor: Colors.primary,
    borderRadius: Layout.borderRadius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  validateButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  skipButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
  },
});
