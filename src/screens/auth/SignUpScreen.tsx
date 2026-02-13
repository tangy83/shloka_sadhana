/**
 * SignUpScreen
 * Shloka Sadhana - P0 #51 (Days 44-50)
 *
 * Account creation screen with Google, Apple, and Email sign-up
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/Colors';
import { Spacing, Layout } from '@/constants/Layout';

/**
 * Sign Up Screen Component
 * Provides account creation with Google, Apple, Email
 */
export const SignUpScreen: React.FC = () => {
  const navigation = useNavigation();
  const { signInWithGoogle, signInWithApple, createAccount } = useAuth();

  // Email/Password state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);

  // Loading states
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  /**
   * Handle Google Sign-Up
   * Uses same flow as sign-in (Firebase handles account creation)
   */
  const handleGoogleSignUp = async () => {
    try {
      setGoogleLoading(true);
      await signInWithGoogle();
      // Navigation handled automatically by auth state change
    } catch (error: any) {
      console.error('[SignUpScreen] Google sign-up error:', error);
      Alert.alert(
        'Sign Up Failed',
        error.message || 'Could not sign up with Google. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  /**
   * Handle Apple Sign-Up (iOS only)
   * Uses same flow as sign-in (Firebase handles account creation)
   */
  const handleAppleSignUp = async () => {
    try {
      setAppleLoading(true);
      await signInWithApple();
      // Navigation handled automatically by auth state change
    } catch (error: any) {
      console.error('[SignUpScreen] Apple sign-up error:', error);

      // Don't show alert if user cancelled
      if (error.message !== 'Sign in cancelled') {
        Alert.alert(
          'Sign Up Failed',
          error.message || 'Could not sign up with Apple. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setAppleLoading(false);
    }
  };

  /**
   * Handle Email/Password Sign-Up
   */
  const handleEmailSignUp = async () => {
    // Validation
    if (!email || !password || !confirmPassword) {
      Alert.alert(
        'Missing Information',
        'Please fill in all fields',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address', [{ text: 'OK' }]);
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        'Weak Password',
        'Password must be at least 6 characters',
        [{ text: 'OK' }]
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        'Password Mismatch',
        'Passwords do not match. Please try again.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setEmailLoading(true);
      await createAccount(email, password);
      // Navigation handled automatically by auth state change
    } catch (error: any) {
      console.error('[SignUpScreen] Email sign-up error:', error);
      Alert.alert(
        'Sign Up Failed',
        error.message || 'Could not create account. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setEmailLoading(false);
    }
  };

  /**
   * Navigate to Login screen
   */
  const handleLoginPress = () => {
    navigation.navigate('Login' as never);
  };

  /**
   * Skip sign-up and continue to app
   */
  const handleSkip = () => {
    navigation.navigate('MainTabs' as never);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Sign up to save your progress and sync across devices
          </Text>
        </View>

        {/* Social Sign-Up Buttons */}
        <View style={styles.socialButtons}>
          {/* Google Sign-Up */}
          <TouchableOpacity
            style={[styles.socialButton, styles.googleButton]}
            onPress={handleGoogleSignUp}
            disabled={googleLoading || appleLoading || emailLoading}
            accessibilityRole="button"
            accessibilityLabel="Sign up with Google"
          >
            <Text style={styles.socialButtonText}>
              {googleLoading ? 'Creating account...' : '🔍 Continue with Google'}
            </Text>
          </TouchableOpacity>

          {/* Apple Sign-Up (iOS only) */}
          {Platform.OS === 'ios' && (
            <TouchableOpacity
              style={[styles.socialButton, styles.appleButton]}
              onPress={handleAppleSignUp}
              disabled={googleLoading || appleLoading || emailLoading}
              accessibilityRole="button"
              accessibilityLabel="Sign up with Apple"
            >
              <Text style={styles.socialButtonText}>
                {appleLoading ? 'Creating account...' : ' Continue with Apple'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Email/Password Form */}
        {showEmailForm ? (
          <View style={styles.emailForm}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={Colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!emailLoading}
              accessibilityLabel="Email input"
            />

            <TextInput
              style={styles.input}
              placeholder="Password (min. 6 characters)"
              placeholderTextColor={Colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!emailLoading}
              accessibilityLabel="Password input"
            />

            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor={Colors.textSecondary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!emailLoading}
              accessibilityLabel="Confirm password input"
            />

            <TouchableOpacity
              style={[styles.primaryButton, emailLoading && styles.buttonDisabled]}
              onPress={handleEmailSignUp}
              disabled={emailLoading}
              accessibilityRole="button"
              accessibilityLabel="Create account with email"
            >
              <Text style={styles.primaryButtonText}>
                {emailLoading ? 'Creating account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.privacyText}>
              By signing up, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setShowEmailForm(true)}
            accessibilityRole="button"
            accessibilityLabel="Show email sign-up form"
          >
            <Text style={styles.secondaryButtonText}>Sign Up with Email</Text>
          </TouchableOpacity>
        )}

        {/* Login Link */}
        <TouchableOpacity
          style={styles.loginLink}
          onPress={handleLoginPress}
          accessibilityRole="button"
          accessibilityLabel="Go to login screen"
        >
          <Text style={styles.loginLinkText}>
            Already have an account? <Text style={styles.loginLinkBold}>Sign In</Text>
          </Text>
        </TouchableOpacity>

        {/* Skip Button */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          accessibilityRole="button"
          accessibilityLabel="Skip sign-up"
        >
          <Text style={styles.skipButtonText}>Continue without signing up</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: 80,
    paddingBottom: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  socialButtons: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  socialButton: {
    paddingVertical: 16,
    paddingHorizontal: Spacing.lg,
    borderRadius: Layout.borderRadius,
    alignItems: 'center',
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
  },
  appleButton: {
    backgroundColor: '#000000',
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginHorizontal: Spacing.md,
  },
  emailForm: {
    gap: Spacing.md,
  },
  input: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Layout.borderRadius,
    paddingVertical: 16,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: Spacing.lg,
    borderRadius: Layout.borderRadius,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: Colors.cardBackground,
    paddingVertical: 16,
    paddingHorizontal: Spacing.lg,
    borderRadius: Layout.borderRadius,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  privacyText: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  loginLinkText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  loginLinkBold: {
    color: Colors.primary,
    fontWeight: '600',
  },
  skipButton: {
    alignItems: 'center',
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  skipButtonText: {
    fontSize: 14,
    color: Colors.textTertiary,
  },
});
