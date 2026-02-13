/**
 * Auth Service
 * Shloka Sadhana - P0 #51 (Days 44-50)
 *
 * Handles user authentication with Firebase Auth
 * Supports: Google Sign-In, Apple Sign-In, Email/Password
 */

import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';

// Configure Google Sign-In
// TODO: Replace with your actual Web Client ID from Firebase Console
// Get it from: Firebase Console → Project Settings → Web app → Web client ID
GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID_HERE', // ← REPLACE THIS!
});

/**
 * Auth Service Class
 * Provides methods for all authentication operations
 */
class AuthService {
  /**
   * Get currently signed-in user
   * @returns User object or null if not signed in
   */
  getCurrentUser() {
    return auth().currentUser;
  }

  /**
   * Check if user is signed in
   * @returns boolean
   */
  isSignedIn(): boolean {
    return auth().currentUser !== null;
  }

  /**
   * Sign in with Google
   * Opens Google account picker, signs user in
   * @returns Promise<FirebaseAuthTypes.User>
   */
  async signInWithGoogle() {
    try {
      // Check if device supports Google Play Services (Android)
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Get Google credentials
      const { idToken } = await GoogleSignin.signIn();

      // Create Firebase credential from Google token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // Sign in with Firebase
      const userCredential = await auth().signInWithCredential(googleCredential);

      console.log('[Auth] Google sign-in successful:', userCredential.user.uid);
      return userCredential.user;
    } catch (error: any) {
      console.error('[Auth] Google sign-in error:', error);

      // Handle specific error codes
      if (error.code === 'sign_in_cancelled') {
        throw new Error('Sign in cancelled');
      } else if (error.code === 'in_progress') {
        throw new Error('Sign in already in progress');
      } else if (error.code === 'play_services_not_available') {
        throw new Error('Google Play Services not available');
      }

      throw error;
    }
  }

  /**
   * Sign in with Apple (iOS only)
   * Opens Apple Sign-In prompt with Face ID / Touch ID
   * @returns Promise<FirebaseAuthTypes.User>
   */
  async signInWithApple() {
    try {
      // Check if Apple Sign-In is available (iOS 13+)
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('Apple Sign-In not available on this device');
      }

      // Request Apple credentials
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // Get identity token
      const { identityToken } = credential;
      if (!identityToken) {
        throw new Error('Apple Sign-In failed: No identity token');
      }

      // Create Firebase credential from Apple token
      const appleCredential = auth.AppleAuthProvider.credential(identityToken);

      // Sign in with Firebase
      const userCredential = await auth().signInWithCredential(appleCredential);

      console.log('[Auth] Apple sign-in successful:', userCredential.user.uid);
      return userCredential.user;
    } catch (error: any) {
      console.error('[Auth] Apple sign-in error:', error);

      // Handle specific error codes
      if (error.code === 'ERR_CANCELED') {
        throw new Error('Sign in cancelled');
      } else if (error.code === 'ERR_INVALID_RESPONSE') {
        throw new Error('Invalid Apple Sign-In response');
      } else if (error.code === 'ERR_REQUEST_FAILED') {
        throw new Error('Apple Sign-In request failed');
      }

      throw error;
    }
  }

  /**
   * Sign in with email and password
   * @param email - User email
   * @param password - User password
   * @returns Promise<FirebaseAuthTypes.User>
   */
  async signInWithEmail(email: string, password: string) {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      console.log('[Auth] Email sign-in successful:', userCredential.user.uid);
      return userCredential.user;
    } catch (error: any) {
      console.error('[Auth] Email sign-in error:', error);

      // Handle specific error codes
      if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address');
      } else if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Incorrect password');
      } else if (error.code === 'auth/user-disabled') {
        throw new Error('This account has been disabled');
      }

      throw error;
    }
  }

  /**
   * Create new account with email and password
   * @param email - User email
   * @param password - User password
   * @returns Promise<FirebaseAuthTypes.User>
   */
  async createAccount(email: string, password: string) {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      console.log('[Auth] Account created successfully:', userCredential.user.uid);
      return userCredential.user;
    } catch (error: any) {
      console.error('[Auth] Account creation error:', error);

      // Handle specific error codes
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('An account already exists with this email');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak (minimum 6 characters)');
      }

      throw error;
    }
  }

  /**
   * Send password reset email
   * @param email - User email
   * @returns Promise<void>
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await auth().sendPasswordResetEmail(email);
      console.log('[Auth] Password reset email sent to:', email);
    } catch (error: any) {
      console.error('[Auth] Password reset error:', error);

      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address');
      }

      throw error;
    }
  }

  /**
   * Sign out current user
   * Also signs out of Google if applicable
   * @returns Promise<void>
   */
  async signOut() {
    try {
      // Sign out of Firebase
      await auth().signOut();

      // Also sign out of Google (if user signed in with Google)
      try {
        const isSignedIn = await GoogleSignin.isSignedIn();
        if (isSignedIn) {
          await GoogleSignin.signOut();
        }
      } catch (error) {
        // Ignore Google sign-out errors (user may not have signed in with Google)
        console.log('[Auth] Google sign-out skipped (not signed in with Google)');
      }

      console.log('[Auth] Sign out successful');
    } catch (error) {
      console.error('[Auth] Sign out error:', error);
      throw error;
    }
  }

  /**
   * Delete current user account
   * CAUTION: This is permanent and cannot be undone
   * @returns Promise<void>
   */
  async deleteAccount(): Promise<void> {
    try {
      const user = auth().currentUser;
      if (!user) {
        throw new Error('No user signed in');
      }

      await user.delete();
      console.log('[Auth] Account deleted:', user.uid);
    } catch (error: any) {
      console.error('[Auth] Delete account error:', error);

      // Re-authentication required for sensitive operations
      if (error.code === 'auth/requires-recent-login') {
        throw new Error('Please sign in again before deleting your account');
      }

      throw error;
    }
  }

  /**
   * Update user display name
   * @param displayName - New display name
   * @returns Promise<void>
   */
  async updateDisplayName(displayName: string): Promise<void> {
    try {
      const user = auth().currentUser;
      if (!user) {
        throw new Error('No user signed in');
      }

      await user.updateProfile({ displayName });
      console.log('[Auth] Display name updated:', displayName);
    } catch (error) {
      console.error('[Auth] Update display name error:', error);
      throw error;
    }
  }

  /**
   * Listen to auth state changes
   * Callback is called whenever user signs in or out
   * @param callback - Function to call on auth state change
   * @returns Unsubscribe function
   */
  onAuthStateChanged(callback: (user: any) => void) {
    return auth().onAuthStateChanged(callback);
  }

  /**
   * Get ID token for current user
   * Used for authenticated API requests
   * @returns Promise<string | null>
   */
  async getIdToken(): Promise<string | null> {
    try {
      const user = auth().currentUser;
      if (!user) {
        return null;
      }

      const token = await user.getIdToken();
      return token;
    } catch (error) {
      console.error('[Auth] Get ID token error:', error);
      return null;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
