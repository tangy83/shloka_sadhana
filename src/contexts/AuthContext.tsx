/**
 * AuthContext
 * Shloka Sadhana - P0 #51 (Days 44-50)
 *
 * React Context for managing authentication state across the app
 * Provides auth methods and user state to all components
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/services/auth';
import { useUserStore } from '@/stores/useUserStore';
import { useSettingsStore } from '@/stores/useSettingsStore';

/**
 * Auth Context Type
 * Defines all auth-related data and methods available to components
 */
interface AuthContextType {
  // Auth state
  user: any | null;              // Current user object from Firebase
  loading: boolean;              // True while checking auth state on app start

  // Sign-in methods
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;

  // Account management
  createAccount: (email: string, password: string) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  updateDisplayName: (displayName: string) => Promise<void>;
}

/**
 * Create Auth Context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth Provider Props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth Provider Component
 * Wraps the app to provide auth state and methods
 *
 * Usage:
 * ```tsx
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * ```
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Listen to auth state changes
   * Runs on mount and whenever user signs in/out
   */
  useEffect(() => {
    console.log('[AuthContext] Setting up auth state listener');

    const unsubscribe = authService.onAuthStateChanged(async (user) => {
      console.log('[AuthContext] Auth state changed:', user ? user.uid : 'null');
      setUser(user);
      setLoading(false);

      // P0 #50: Trigger cloud sync when user signs in
      if (user) {
        console.log('[AuthContext] User signed in, loading data from cloud...');

        // Load user data from Firestore
        try {
          await useUserStore.getState().loadFromCloud();
          await useSettingsStore.getState().loadFromCloud();
          console.log('[AuthContext] Cloud data loaded successfully');
        } catch (error) {
          console.error('[AuthContext] Error loading cloud data:', error);
          // Don't block sign-in if cloud sync fails
        }
      }
    });

    // Cleanup listener on unmount
    return () => {
      console.log('[AuthContext] Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);

  /**
   * Sign in with Google
   * Opens Google account picker
   */
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      await authService.signInWithGoogle();
      // User state will update automatically via onAuthStateChanged
    } catch (error: any) {
      console.error('[AuthContext] Google sign-in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign in with Apple (iOS only)
   * Opens Apple Sign-In with Face ID / Touch ID
   */
  const signInWithApple = async () => {
    try {
      setLoading(true);
      await authService.signInWithApple();
      // User state will update automatically via onAuthStateChanged
    } catch (error: any) {
      console.error('[AuthContext] Apple sign-in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign in with email and password
   */
  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      await authService.signInWithEmail(email, password);
      // User state will update automatically via onAuthStateChanged
    } catch (error: any) {
      console.error('[AuthContext] Email sign-in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create new account with email and password
   */
  const createAccount = async (email: string, password: string) => {
    try {
      setLoading(true);
      await authService.createAccount(email, password);
      // User state will update automatically via onAuthStateChanged
    } catch (error: any) {
      console.error('[AuthContext] Account creation error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Send password reset email
   */
  const sendPasswordResetEmail = async (email: string) => {
    try {
      await authService.sendPasswordResetEmail(email);
    } catch (error: any) {
      console.error('[AuthContext] Password reset error:', error);
      throw error;
    }
  };

  /**
   * Sign out current user
   */
  const signOut = async () => {
    try {
      setLoading(true);
      await authService.signOut();
      // User state will update automatically via onAuthStateChanged
    } catch (error: any) {
      console.error('[AuthContext] Sign out error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete current user account
   * CAUTION: Permanent action
   */
  const deleteAccount = async () => {
    try {
      setLoading(true);
      await authService.deleteAccount();
      // User state will update automatically via onAuthStateChanged
    } catch (error: any) {
      console.error('[AuthContext] Delete account error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update user display name
   */
  const updateDisplayName = async (displayName: string) => {
    try {
      await authService.updateDisplayName(displayName);
      // Refresh user state
      setUser(authService.getCurrentUser());
    } catch (error: any) {
      console.error('[AuthContext] Update display name error:', error);
      throw error;
    }
  };

  /**
   * Context value
   * All auth state and methods available to consumers
   */
  const value: AuthContextType = {
    user,
    loading,
    signInWithGoogle,
    signInWithApple,
    signInWithEmail,
    createAccount,
    sendPasswordResetEmail,
    signOut,
    deleteAccount,
    updateDisplayName,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * useAuth Hook
 * Access auth context from any component
 *
 * Usage:
 * ```tsx
 * const { user, signInWithGoogle, signOut } = useAuth();
 *
 * if (user) {
 *   return <Text>Signed in as: {user.email}</Text>;
 * }
 * ```
 *
 * @throws Error if used outside AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
