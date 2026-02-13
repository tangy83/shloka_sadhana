/**
 * LoginScreen
 * Shloka Sadhana - P0 #51 (Days 44-50)
 *
 * User authentication screen with Google, Apple, and Email sign-in
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
 * Login Screen Component
 * Provides multiple sign-in options: Google, Apple, Email
 */
export const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const { signInWithGoogle, signInWithApple, signInWithEmail } = useAuth();

  // Email/Password state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);

  // Loading states
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  /**
   * Handle Google Sign-In
   */
  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      await signInWithGoogle();
      // Navigation handled automatically by auth state change
    } catch (error: any) {
      console.error('[LoginScreen] Google sign-in error:', error);
      Alert.alert(
        'Sign In Failed',
        error.message || 'Could not sign in with Google. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  /**
   * Handle Apple Sign-In (iOS only)
   */
  const handleAppleSignIn = async () => {
    try {
      setAppleLoading(true);
      await signInWithApple();
      // Navigation handled automatically by auth state change
    } catch (error: any) {
      console.error('[LoginScreen] Apple sign-in error:', error);

      // Don't show alert if user cancelled
      if (error.message !== 'Sign in cancelled') {
        Alert.alert(
          'Sign In Failed',
          error.message || 'Could not sign in with Apple. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setAppleLoading(false);
    }
  };

  /**
   * Handle Email/Password Sign-In
   */
  const handleEmailSignIn = async () => {
    // Validation
    if (!email || !password) {
      Alert.alert('Missing Information', 'Please enter both email and password', [{ text: 'OK' }]);
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address', [{ text: 'OK' }]);
      return;
    }

    if (password.length < 6) {
      Alert.alert('Invalid Password', 'Password must be at least 6 characters', [{ text: 'OK' }]);
      return;
    }

    try {
      setEmailLoading(true);
      await signInWithEmail(email, password);
      // Navigation handled automatically by auth state change
    } catch (error: any) {
      console.error('[LoginScreen] Email sign-in error:', error);
      Alert.alert(
        'Sign In Failed',
        error.message || 'Could not sign in with email. Please check your credentials.',
        [{ text: 'OK' }]
      );
    } finally {
      setEmailLoading(false);
    }
  };

  /**
   * Navigate to Sign Up screen
   */
  const handleSignUpPress = () => {
    navigation.navigate('SignUp' as never);
  };

  /**
   * Navigate to Forgot Password screen
   */
  const handleForgotPassword = () => {
    // TODO: Create ForgotPasswordScreen in future
    Alert.alert(
      'Reset Password',
      'Password reset feature will be available soon. For now, please use Google or Apple Sign-In.',
      [{ text: 'OK' }]
    );
  };

  /**
   * Skip sign-in and continue to app
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
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Sign in to back up your data and sync across devices
          </Text>
        </View>

        {/* Social Sign-In Buttons */}
        <View style={styles.socialButtons}>
          {/* Google Sign-In */}
          <TouchableOpacity
            style={[styles.socialButton, styles.googleButton]}
            onPress={handleGoogleSignIn}
            disabled={googleLoading || appleLoading || emailLoading}
            accessibilityRole="button"
            accessibilityLabel="Sign in with Google"
          >
            <Text style={styles.socialButtonText}>
              {googleLoading ? 'Signing in...' : '🔍 Continue with Google'}
            </Text>
          </TouchableOpacity>

          {/* Apple Sign-In (iOS only) */}
          {Platform.OS === 'ios' && (
            <TouchableOpacity
              style={[styles.socialButton, styles.appleButton]}
              onPress={handleAppleSignIn}
              disabled={googleLoading || appleLoading || emailLoading}
              accessibilityRole="button"
              accessibilityLabel="Sign in with Apple"
            >
              <Text style={styles.socialButtonText}>
                {appleLoading ? 'Signing in...' : ' Continue with Apple'}
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
              placeholder="Password"
              placeholderTextColor={Colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!emailLoading}
              accessibilityLabel="Password input"
            />

            <TouchableOpacity
              style={[styles.primaryButton, emailLoading && styles.buttonDisabled]}
              onPress={handleEmailSignIn}
              disabled={emailLoading}
              accessibilityRole="button"
              accessibilityLabel="Sign in with email"
            >
              <Text style={styles.primaryButtonText}>
                {emailLoading ? 'Signing in...' : 'Sign In with Email'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={handleForgotPassword}
              accessibilityRole="button"
              accessibilityLabel="Forgot password"
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setShowEmailForm(true)}
            accessibilityRole="button"
            accessibilityLabel="Show email sign-in form"
          >
            <Text style={styles.secondaryButtonText}>Sign In with Email</Text>
          </TouchableOpacity>
        )}

        {/* Sign Up Link */}
        <TouchableOpacity
          style={styles.signUpLink}
          onPress={handleSignUpPress}
          accessibilityRole="button"
          accessibilityLabel="Create new account"
        >
          <Text style={styles.signUpLinkText}>
            Don't have an account? <Text style={styles.signUpLinkBold}>Sign Up</Text>
          </Text>
        </TouchableOpacity>

        {/* Skip Button */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          accessibilityRole="button"
          accessibilityLabel="Skip sign-in"
        >
          <Text style={styles.skipButtonText}>Continue without signing in</Text>
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
  forgotPassword: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: Colors.primary,
  },
  signUpLink: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  signUpLinkText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  signUpLinkBold: {
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
