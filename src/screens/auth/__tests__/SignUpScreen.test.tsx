/**
 * SignUpScreen Tests
 * Shloka Sadhana - Authentication
 *
 * Tests for the Sign Up screen: social sign-up buttons, email form,
 * validation (including password mismatch), error handling, and navigation.
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { Alert, Platform } from 'react-native';
import { SignUpScreen } from '../SignUpScreen';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

// Override the global navigation mock
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
    addListener: jest.fn(),
  })),
  useFocusEffect: jest.fn(),
  NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseNavigation = useNavigation as jest.MockedFunction<typeof useNavigation>;

/** Helper: build a fresh auth mock with safe defaults + overrides */
const buildAuthMock = (overrides: Partial<ReturnType<typeof useAuth>> = {}) => ({
  user: null,
  loading: false,
  signInWithGoogle: jest.fn(() => Promise.resolve()),
  signInWithApple: jest.fn(() => Promise.resolve()),
  signInWithEmail: jest.fn(() => Promise.resolve()),
  createAccount: jest.fn(() => Promise.resolve()),
  sendPasswordResetEmail: jest.fn(() => Promise.resolve()),
  signOut: jest.fn(() => Promise.resolve()),
  deleteAccount: jest.fn(() => Promise.resolve()),
  updateDisplayName: jest.fn(() => Promise.resolve()),
  ...overrides,
});

describe('SignUpScreen', () => {
  let mockNavigate: jest.Mock;
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    mockNavigate = jest.fn();

    mockUseNavigation.mockReturnValue({
      navigate: mockNavigate,
      goBack: jest.fn(),
      setOptions: jest.fn(),
      addListener: jest.fn(),
    } as any);

    mockUseAuth.mockReturnValue(buildAuthMock());
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------

  describe('Initial Render', () => {
    it('renders without crashing', () => {
      render(<SignUpScreen />);
      expect(screen.getByText(/Create Account/i)).toBeTruthy();
    });

    it('shows the Create Account heading', () => {
      render(<SignUpScreen />);
      expect(screen.getAllByText(/Create Account/i).length).toBeGreaterThan(0);
    });

    it('shows the subtitle', () => {
      render(<SignUpScreen />);
      expect(screen.getByText(/Sign up to save your progress/i)).toBeTruthy();
    });

    it('shows the Google sign-up button', () => {
      render(<SignUpScreen />);
      expect(screen.getByLabelText('Sign up with Google')).toBeTruthy();
    });

    it('shows the email toggle button before form is expanded', () => {
      render(<SignUpScreen />);
      expect(screen.getByLabelText('Show email sign-up form')).toBeTruthy();
    });

    it('shows the Already have an account link', () => {
      render(<SignUpScreen />);
      expect(screen.getByLabelText('Go to login screen')).toBeTruthy();
    });

    it('shows the Skip button', () => {
      render(<SignUpScreen />);
      expect(screen.getByLabelText('Skip sign-up')).toBeTruthy();
    });
  });

  // -------------------------------------------------------------------------
  // Apple Sign-Up (platform-conditional)
  // -------------------------------------------------------------------------

  describe('Apple Sign-Up Button', () => {
    it('shows Apple sign-up button on iOS', () => {
      const originalOS = Platform.OS;
      Object.defineProperty(Platform, 'OS', { get: () => 'ios', configurable: true });

      render(<SignUpScreen />);
      expect(screen.getByLabelText('Sign up with Apple')).toBeTruthy();

      Object.defineProperty(Platform, 'OS', { get: () => originalOS, configurable: true });
    });

    it('does not show Apple sign-up button on Android', () => {
      const originalOS = Platform.OS;
      Object.defineProperty(Platform, 'OS', { get: () => 'android', configurable: true });

      render(<SignUpScreen />);
      expect(screen.queryByLabelText('Sign up with Apple')).toBeNull();

      Object.defineProperty(Platform, 'OS', { get: () => originalOS, configurable: true });
    });
  });

  // -------------------------------------------------------------------------
  // Email Form Toggle
  // -------------------------------------------------------------------------

  describe('Email Form Toggle', () => {
    it('does not show email/password inputs before toggle', () => {
      render(<SignUpScreen />);
      expect(screen.queryByLabelText('Email input')).toBeNull();
      expect(screen.queryByLabelText('Password input')).toBeNull();
      expect(screen.queryByLabelText('Confirm password input')).toBeNull();
    });

    it('shows email, password, and confirm-password inputs after toggle', () => {
      render(<SignUpScreen />);
      fireEvent.press(screen.getByLabelText('Show email sign-up form'));

      expect(screen.getByLabelText('Email input')).toBeTruthy();
      expect(screen.getByLabelText('Password input')).toBeTruthy();
      expect(screen.getByLabelText('Confirm password input')).toBeTruthy();
    });

    it('shows the Create Account submit button after toggle', () => {
      render(<SignUpScreen />);
      fireEvent.press(screen.getByLabelText('Show email sign-up form'));
      expect(screen.getByLabelText('Create account with email')).toBeTruthy();
    });

    it('shows privacy/terms text after toggle', () => {
      render(<SignUpScreen />);
      fireEvent.press(screen.getByLabelText('Show email sign-up form'));
      expect(screen.getByText(/Terms of Service/i)).toBeTruthy();
    });
  });

  // -------------------------------------------------------------------------
  // Google Sign-Up
  // -------------------------------------------------------------------------

  describe('Google Sign-Up', () => {
    it('calls signInWithGoogle when Google button is pressed', async () => {
      const signInWithGoogle = jest.fn(() => Promise.resolve());
      mockUseAuth.mockReturnValue(buildAuthMock({ signInWithGoogle }));

      render(<SignUpScreen />);
      await act(async () => {
        fireEvent.press(screen.getByLabelText('Sign up with Google'));
      });

      expect(signInWithGoogle).toHaveBeenCalledTimes(1);
    });

    it('shows an Alert when signInWithGoogle rejects', async () => {
      const signInWithGoogle = jest.fn(() =>
        Promise.reject(new Error('Google service unavailable')),
      );
      mockUseAuth.mockReturnValue(buildAuthMock({ signInWithGoogle }));

      render(<SignUpScreen />);
      await act(async () => {
        fireEvent.press(screen.getByLabelText('Sign up with Google'));
      });

      expect(alertSpy).toHaveBeenCalledWith(
        'Sign Up Failed',
        'Google service unavailable',
        expect.any(Array),
      );
    });
  });

  // -------------------------------------------------------------------------
  // Email / Password Sign-Up
  // -------------------------------------------------------------------------

  describe('Email Sign-Up', () => {
    const expandEmailForm = () => {
      fireEvent.press(screen.getByLabelText('Show email sign-up form'));
    };

    const fillForm = (email: string, password: string, confirmPassword: string) => {
      fireEvent.changeText(screen.getByLabelText('Email input'), email);
      fireEvent.changeText(screen.getByLabelText('Password input'), password);
      fireEvent.changeText(screen.getByLabelText('Confirm password input'), confirmPassword);
    };

    it('calls createAccount with correct credentials on submit', async () => {
      const createAccount = jest.fn(() => Promise.resolve());
      mockUseAuth.mockReturnValue(buildAuthMock({ createAccount }));

      render(<SignUpScreen />);
      expandEmailForm();
      fillForm('user@example.com', 'password123', 'password123');

      await act(async () => {
        fireEvent.press(screen.getByLabelText('Create account with email'));
      });

      expect(createAccount).toHaveBeenCalledWith('user@example.com', 'password123');
    });

    it('shows alert when fields are empty', async () => {
      render(<SignUpScreen />);
      expandEmailForm();

      await act(async () => {
        fireEvent.press(screen.getByLabelText('Create account with email'));
      });

      expect(alertSpy).toHaveBeenCalledWith(
        'Missing Information',
        expect.any(String),
        expect.any(Array),
      );
    });

    it('shows alert for invalid email format', async () => {
      render(<SignUpScreen />);
      expandEmailForm();
      fillForm('not-an-email', 'password123', 'password123');

      await act(async () => {
        fireEvent.press(screen.getByLabelText('Create account with email'));
      });

      expect(alertSpy).toHaveBeenCalledWith(
        'Invalid Email',
        expect.any(String),
        expect.any(Array),
      );
    });

    it('shows alert for password shorter than 6 characters', async () => {
      render(<SignUpScreen />);
      expandEmailForm();
      fillForm('user@example.com', '12345', '12345');

      await act(async () => {
        fireEvent.press(screen.getByLabelText('Create account with email'));
      });

      expect(alertSpy).toHaveBeenCalledWith(
        'Weak Password',
        expect.any(String),
        expect.any(Array),
      );
    });

    it('shows alert when passwords do not match', async () => {
      render(<SignUpScreen />);
      expandEmailForm();
      fillForm('user@example.com', 'password123', 'differentpass');

      await act(async () => {
        fireEvent.press(screen.getByLabelText('Create account with email'));
      });

      expect(alertSpy).toHaveBeenCalledWith(
        'Password Mismatch',
        expect.any(String),
        expect.any(Array),
      );
    });

    it('shows alert when createAccount rejects', async () => {
      const createAccount = jest.fn(() =>
        Promise.reject(new Error('Email already in use')),
      );
      mockUseAuth.mockReturnValue(buildAuthMock({ createAccount }));

      render(<SignUpScreen />);
      expandEmailForm();
      fillForm('taken@example.com', 'password123', 'password123');

      await act(async () => {
        fireEvent.press(screen.getByLabelText('Create account with email'));
      });

      expect(alertSpy).toHaveBeenCalledWith(
        'Sign Up Failed',
        'Email already in use',
        expect.any(Array),
      );
    });
  });

  // -------------------------------------------------------------------------
  // Navigation
  // -------------------------------------------------------------------------

  describe('Navigation', () => {
    it('navigates to Login when "Sign In" link is pressed', () => {
      render(<SignUpScreen />);
      fireEvent.press(screen.getByLabelText('Go to login screen'));
      expect(mockNavigate).toHaveBeenCalledWith('Login');
    });

    it('navigates to MainTabs when Skip button is pressed', () => {
      render(<SignUpScreen />);
      fireEvent.press(screen.getByLabelText('Skip sign-up'));
      expect(mockNavigate).toHaveBeenCalledWith('MainTabs');
    });
  });
});
