/**
 * LoginScreen Tests
 * Shloka Sadhana - Authentication
 *
 * Tests for the Login screen: social sign-in, email form toggle,
 * validation, error handling, and navigation.
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { Alert, Platform } from 'react-native';
import { LoginScreen } from '../LoginScreen';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

// Override the global navigation mock so individual tests can re-configure it
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

describe('LoginScreen', () => {
  let mockNavigate: jest.Mock;
  let mockGoBack: jest.Mock;
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    mockNavigate = jest.fn();
    mockGoBack = jest.fn();

    mockUseNavigation.mockReturnValue({
      navigate: mockNavigate,
      goBack: mockGoBack,
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
      render(<LoginScreen />);
      expect(screen.getByText(/Welcome Back/i)).toBeTruthy();
    });

    it('shows the screen subtitle', () => {
      render(<LoginScreen />);
      expect(screen.getByText(/Sign in to back up your data/i)).toBeTruthy();
    });

    it('shows the Google sign-in button', () => {
      render(<LoginScreen />);
      expect(screen.getByLabelText('Sign in with Google')).toBeTruthy();
    });

    it('shows the email toggle button before form is expanded', () => {
      render(<LoginScreen />);
      expect(screen.getByLabelText('Show email sign-in form')).toBeTruthy();
    });

    it('shows the Sign Up link', () => {
      render(<LoginScreen />);
      expect(screen.getByLabelText('Create new account')).toBeTruthy();
    });

    it('shows the Skip button', () => {
      render(<LoginScreen />);
      expect(screen.getByLabelText('Skip sign-in')).toBeTruthy();
    });
  });

  // -------------------------------------------------------------------------
  // Apple Sign-In (platform-conditional)
  // -------------------------------------------------------------------------

  describe('Apple Sign-In Button', () => {
    it('shows Apple sign-in button on iOS', () => {
      const originalOS = Platform.OS;
      Object.defineProperty(Platform, 'OS', { get: () => 'ios', configurable: true });

      render(<LoginScreen />);
      expect(screen.getByLabelText('Sign in with Apple')).toBeTruthy();

      Object.defineProperty(Platform, 'OS', { get: () => originalOS, configurable: true });
    });

    it('does not show Apple sign-in button on Android', () => {
      const originalOS = Platform.OS;
      Object.defineProperty(Platform, 'OS', { get: () => 'android', configurable: true });

      render(<LoginScreen />);
      expect(screen.queryByLabelText('Sign in with Apple')).toBeNull();

      Object.defineProperty(Platform, 'OS', { get: () => originalOS, configurable: true });
    });
  });

  // -------------------------------------------------------------------------
  // Email Form Toggle
  // -------------------------------------------------------------------------

  describe('Email Form Toggle', () => {
    it('does not show email/password inputs before toggle', () => {
      render(<LoginScreen />);
      expect(screen.queryByLabelText('Email input')).toBeNull();
      expect(screen.queryByLabelText('Password input')).toBeNull();
    });

    it('shows email and password inputs after pressing toggle button', () => {
      render(<LoginScreen />);
      fireEvent.press(screen.getByLabelText('Show email sign-in form'));

      expect(screen.getByLabelText('Email input')).toBeTruthy();
      expect(screen.getByLabelText('Password input')).toBeTruthy();
    });

    it('shows the sign-in submit button after toggle', () => {
      render(<LoginScreen />);
      fireEvent.press(screen.getByLabelText('Show email sign-in form'));
      expect(screen.getByLabelText('Sign in with email')).toBeTruthy();
    });

    it('shows Forgot Password link after toggle', () => {
      render(<LoginScreen />);
      fireEvent.press(screen.getByLabelText('Show email sign-in form'));
      expect(screen.getByLabelText('Forgot password')).toBeTruthy();
    });
  });

  // -------------------------------------------------------------------------
  // Google Sign-In
  // -------------------------------------------------------------------------

  describe('Google Sign-In', () => {
    it('calls signInWithGoogle when Google button is pressed', async () => {
      const signInWithGoogle = jest.fn(() => Promise.resolve());
      mockUseAuth.mockReturnValue(buildAuthMock({ signInWithGoogle }));

      render(<LoginScreen />);
      await act(async () => {
        fireEvent.press(screen.getByLabelText('Sign in with Google'));
      });

      expect(signInWithGoogle).toHaveBeenCalledTimes(1);
    });

    it('shows an Alert when signInWithGoogle rejects', async () => {
      const signInWithGoogle = jest.fn(() =>
        Promise.reject(new Error('Network error')),
      );
      mockUseAuth.mockReturnValue(buildAuthMock({ signInWithGoogle }));

      render(<LoginScreen />);
      await act(async () => {
        fireEvent.press(screen.getByLabelText('Sign in with Google'));
      });

      expect(alertSpy).toHaveBeenCalledWith(
        'Sign In Failed',
        'Network error',
        expect.any(Array),
      );
    });
  });

  // -------------------------------------------------------------------------
  // Apple Sign-In
  // -------------------------------------------------------------------------

  describe('Apple Sign-In', () => {
    it('calls signInWithApple when Apple button is pressed on iOS', async () => {
      const originalOS = Platform.OS;
      Object.defineProperty(Platform, 'OS', { get: () => 'ios', configurable: true });

      const signInWithApple = jest.fn(() => Promise.resolve());
      mockUseAuth.mockReturnValue(buildAuthMock({ signInWithApple }));

      render(<LoginScreen />);
      await act(async () => {
        fireEvent.press(screen.getByLabelText('Sign in with Apple'));
      });

      expect(signInWithApple).toHaveBeenCalledTimes(1);
      Object.defineProperty(Platform, 'OS', { get: () => originalOS, configurable: true });
    });

    it('does not show alert if Apple sign-in is cancelled', async () => {
      const originalOS = Platform.OS;
      Object.defineProperty(Platform, 'OS', { get: () => 'ios', configurable: true });

      const signInWithApple = jest.fn(() =>
        Promise.reject(new Error('Sign in cancelled')),
      );
      mockUseAuth.mockReturnValue(buildAuthMock({ signInWithApple }));

      render(<LoginScreen />);
      await act(async () => {
        fireEvent.press(screen.getByLabelText('Sign in with Apple'));
      });

      expect(alertSpy).not.toHaveBeenCalled();
      Object.defineProperty(Platform, 'OS', { get: () => originalOS, configurable: true });
    });
  });

  // -------------------------------------------------------------------------
  // Email / Password Sign-In
  // -------------------------------------------------------------------------

  describe('Email Sign-In', () => {
    const expandEmailForm = () => {
      fireEvent.press(screen.getByLabelText('Show email sign-in form'));
    };

    it('calls signInWithEmail with correct credentials on submit', async () => {
      const signInWithEmail = jest.fn(() => Promise.resolve());
      mockUseAuth.mockReturnValue(buildAuthMock({ signInWithEmail }));

      render(<LoginScreen />);
      expandEmailForm();

      fireEvent.changeText(screen.getByLabelText('Email input'), 'user@example.com');
      fireEvent.changeText(screen.getByLabelText('Password input'), 'password123');

      await act(async () => {
        fireEvent.press(screen.getByLabelText('Sign in with email'));
      });

      expect(signInWithEmail).toHaveBeenCalledWith('user@example.com', 'password123');
    });

    it('shows alert when email is empty', async () => {
      render(<LoginScreen />);
      expandEmailForm();

      await act(async () => {
        fireEvent.press(screen.getByLabelText('Sign in with email'));
      });

      expect(alertSpy).toHaveBeenCalledWith(
        'Missing Information',
        expect.any(String),
        expect.any(Array),
      );
    });

    it('shows alert for invalid email format', async () => {
      render(<LoginScreen />);
      expandEmailForm();

      fireEvent.changeText(screen.getByLabelText('Email input'), 'not-an-email');
      fireEvent.changeText(screen.getByLabelText('Password input'), 'password123');

      await act(async () => {
        fireEvent.press(screen.getByLabelText('Sign in with email'));
      });

      expect(alertSpy).toHaveBeenCalledWith(
        'Invalid Email',
        expect.any(String),
        expect.any(Array),
      );
    });

    it('shows alert for password shorter than 6 characters', async () => {
      render(<LoginScreen />);
      expandEmailForm();

      fireEvent.changeText(screen.getByLabelText('Email input'), 'user@example.com');
      fireEvent.changeText(screen.getByLabelText('Password input'), '12345');

      await act(async () => {
        fireEvent.press(screen.getByLabelText('Sign in with email'));
      });

      expect(alertSpy).toHaveBeenCalledWith(
        'Invalid Password',
        expect.any(String),
        expect.any(Array),
      );
    });

    it('shows alert when signInWithEmail rejects', async () => {
      const signInWithEmail = jest.fn(() =>
        Promise.reject(new Error('Wrong password')),
      );
      mockUseAuth.mockReturnValue(buildAuthMock({ signInWithEmail }));

      render(<LoginScreen />);
      expandEmailForm();

      fireEvent.changeText(screen.getByLabelText('Email input'), 'user@example.com');
      fireEvent.changeText(screen.getByLabelText('Password input'), 'password123');

      await act(async () => {
        fireEvent.press(screen.getByLabelText('Sign in with email'));
      });

      expect(alertSpy).toHaveBeenCalledWith(
        'Sign In Failed',
        'Wrong password',
        expect.any(Array),
      );
    });
  });

  // -------------------------------------------------------------------------
  // Navigation
  // -------------------------------------------------------------------------

  describe('Navigation', () => {
    it('navigates to SignUp when Sign Up link is pressed', () => {
      render(<LoginScreen />);
      fireEvent.press(screen.getByLabelText('Create new account'));
      expect(mockNavigate).toHaveBeenCalledWith('SignUp');
    });

    it('navigates to MainTabs when Skip button is pressed', () => {
      render(<LoginScreen />);
      fireEvent.press(screen.getByLabelText('Skip sign-in'));
      expect(mockNavigate).toHaveBeenCalledWith('MainTabs');
    });

    it('shows Reset Password alert when Forgot Password is pressed', () => {
      render(<LoginScreen />);
      fireEvent.press(screen.getByLabelText('Show email sign-in form'));
      fireEvent.press(screen.getByLabelText('Forgot password'));

      expect(alertSpy).toHaveBeenCalledWith(
        'Reset Password',
        expect.any(String),
        expect.any(Array),
      );
    });
  });
});
