/**
 * Auth Service Tests
 * Tests for sign-in, sign-out, account creation, error handling
 */

import { authService } from '@/services/auth';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockGoogleSignin = GoogleSignin as jest.Mocked<typeof GoogleSignin>;
const mockApple = AppleAuthentication as jest.Mocked<typeof AppleAuthentication>;

const MOCK_USER = {
  uid: 'test-uid-123',
  email: 'test@example.com',
  displayName: 'Test User',
  getIdToken: jest.fn(() => Promise.resolve('mock-token')),
  updateProfile: jest.fn(() => Promise.resolve()),
  delete: jest.fn(() => Promise.resolve()),
};

function setupAuthMock(currentUser: typeof MOCK_USER | null = null) {
  mockAuth.mockReturnValue({
    currentUser,
    signInWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: MOCK_USER })),
    createUserWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: MOCK_USER })),
    signInWithCredential: jest.fn(() => Promise.resolve({ user: MOCK_USER })),
    signOut: jest.fn(() => Promise.resolve()),
    sendPasswordResetEmail: jest.fn(() => Promise.resolve()),
    onAuthStateChanged: jest.fn((cb: (user: null) => void) => { cb(null); return jest.fn(); }),
  } as any);
}

describe('authService — getCurrentUser / isSignedIn', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return null when no user is signed in', () => {
    setupAuthMock(null);
    expect(authService.getCurrentUser()).toBeNull();
  });

  it('should return the current user when signed in', () => {
    setupAuthMock(MOCK_USER);
    expect(authService.getCurrentUser()).toEqual(MOCK_USER);
  });

  it('should report not signed in when currentUser is null', () => {
    setupAuthMock(null);
    expect(authService.isSignedIn()).toBe(false);
  });

  it('should report signed in when currentUser exists', () => {
    setupAuthMock(MOCK_USER);
    expect(authService.isSignedIn()).toBe(true);
  });
});

describe('authService — signInWithEmail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupAuthMock(null);
  });

  it('should sign in with email and password and return user', async () => {
    const user = await authService.signInWithEmail('test@example.com', 'password123');
    expect(user).toEqual(MOCK_USER);
    expect(auth().signInWithEmailAndPassword).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('should throw user-friendly message for invalid email', async () => {
    mockAuth.mockReturnValue({
      ...auth(),
      signInWithEmailAndPassword: jest.fn(() =>
        Promise.reject({ code: 'auth/invalid-email', message: 'Invalid email' })
      ),
    } as any);

    await expect(authService.signInWithEmail('bad-email', 'pass')).rejects.toThrow('Invalid email address');
  });

  it('should throw user-friendly message for wrong password', async () => {
    mockAuth.mockReturnValue({
      ...auth(),
      signInWithEmailAndPassword: jest.fn(() =>
        Promise.reject({ code: 'auth/wrong-password', message: 'Wrong password' })
      ),
    } as any);

    await expect(authService.signInWithEmail('test@example.com', 'wrong')).rejects.toThrow('Incorrect password');
  });

  it('should throw user-friendly message for user not found', async () => {
    mockAuth.mockReturnValue({
      ...auth(),
      signInWithEmailAndPassword: jest.fn(() =>
        Promise.reject({ code: 'auth/user-not-found', message: 'User not found' })
      ),
    } as any);

    await expect(authService.signInWithEmail('noone@example.com', 'pass')).rejects.toThrow('No account found with this email');
  });
});

describe('authService — createAccount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupAuthMock(null);
  });

  it('should create account and return user', async () => {
    const user = await authService.createAccount('new@example.com', 'password123');
    expect(user).toEqual(MOCK_USER);
    expect(auth().createUserWithEmailAndPassword).toHaveBeenCalledWith('new@example.com', 'password123');
  });

  it('should throw user-friendly message for duplicate email', async () => {
    mockAuth.mockReturnValue({
      ...auth(),
      createUserWithEmailAndPassword: jest.fn(() =>
        Promise.reject({ code: 'auth/email-already-in-use', message: 'Email in use' })
      ),
    } as any);

    await expect(authService.createAccount('existing@example.com', 'pass')).rejects.toThrow(
      'An account already exists with this email'
    );
  });

  it('should throw user-friendly message for weak password', async () => {
    mockAuth.mockReturnValue({
      ...auth(),
      createUserWithEmailAndPassword: jest.fn(() =>
        Promise.reject({ code: 'auth/weak-password', message: 'Weak password' })
      ),
    } as any);

    await expect(authService.createAccount('test@example.com', '123')).rejects.toThrow(
      'Password is too weak'
    );
  });
});

describe('authService — signOut', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupAuthMock(MOCK_USER);
  });

  it('should sign out of Firebase', async () => {
    mockGoogleSignin.isSignedIn.mockResolvedValue(false);

    await authService.signOut();

    expect(auth().signOut).toHaveBeenCalled();
  });

  it('should also sign out of Google if signed in with Google', async () => {
    mockGoogleSignin.isSignedIn.mockResolvedValue(true);

    await authService.signOut();

    expect(mockGoogleSignin.signOut).toHaveBeenCalled();
  });

  it('should not fail if Google sign-out errors (not signed in with Google)', async () => {
    mockGoogleSignin.isSignedIn.mockRejectedValue(new Error('Not signed in'));

    await expect(authService.signOut()).resolves.not.toThrow();
  });
});

describe('authService — sendPasswordResetEmail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupAuthMock(null);
  });

  it('should send password reset email', async () => {
    await authService.sendPasswordResetEmail('test@example.com');
    expect(auth().sendPasswordResetEmail).toHaveBeenCalledWith('test@example.com');
  });

  it('should throw user-friendly message for user not found', async () => {
    mockAuth.mockReturnValue({
      ...auth(),
      sendPasswordResetEmail: jest.fn(() =>
        Promise.reject({ code: 'auth/user-not-found', message: 'User not found' })
      ),
    } as any);

    await expect(authService.sendPasswordResetEmail('noone@example.com')).rejects.toThrow(
      'No account found with this email'
    );
  });
});

describe('authService — deleteAccount', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should delete the current user account', async () => {
    setupAuthMock(MOCK_USER);

    await authService.deleteAccount();

    expect(MOCK_USER.delete).toHaveBeenCalled();
  });

  it('should throw if no user is signed in', async () => {
    setupAuthMock(null);

    await expect(authService.deleteAccount()).rejects.toThrow('No user signed in');
  });

  it('should throw user-friendly message requiring re-authentication', async () => {
    const userWithDeleteError = {
      ...MOCK_USER,
      delete: jest.fn(() =>
        Promise.reject({ code: 'auth/requires-recent-login', message: 'Requires recent login' })
      ),
    };
    setupAuthMock(userWithDeleteError as any);

    await expect(authService.deleteAccount()).rejects.toThrow(
      'Please sign in again before deleting your account'
    );
  });
});

describe('authService — updateDisplayName', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should update display name for signed-in user', async () => {
    setupAuthMock(MOCK_USER);

    await authService.updateDisplayName('New Name');

    expect(MOCK_USER.updateProfile).toHaveBeenCalledWith({ displayName: 'New Name' });
  });

  it('should throw if no user is signed in', async () => {
    setupAuthMock(null);

    await expect(authService.updateDisplayName('Name')).rejects.toThrow('No user signed in');
  });
});

describe('authService — getIdToken', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return token for signed-in user', async () => {
    setupAuthMock(MOCK_USER);

    const token = await authService.getIdToken();

    expect(token).toBe('mock-token');
  });

  it('should return null when no user is signed in', async () => {
    setupAuthMock(null);

    const token = await authService.getIdToken();

    expect(token).toBeNull();
  });
});
