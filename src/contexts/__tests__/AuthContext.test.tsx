/**
 * AuthContext Tests
 */
import React from 'react';
import { render, act } from '@testing-library/react-native';
import { Text } from 'react-native';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/auth';
import { useUserStore } from '@/stores/useUserStore';
import { useSettingsStore } from '@/stores/useSettingsStore';

// DO NOT use the global mock from setup.ts — override it for this file
jest.mock('@/contexts/AuthContext', () => jest.requireActual('@/contexts/AuthContext'));

jest.mock('@/services/auth');
jest.mock('@/stores/useUserStore', () => ({
  useUserStore: {
    getState: jest.fn(() => ({
      loadFromCloud: jest.fn(() => Promise.resolve()),
    })),
  },
}));
jest.mock('@/stores/useSettingsStore', () => ({
  useSettingsStore: {
    getState: jest.fn(() => ({
      loadFromCloud: jest.fn(() => Promise.resolve()),
    })),
  },
}));

const mockAuthService = authService as jest.Mocked<typeof authService>;

// Consumer component for testing useAuth
const AuthConsumer: React.FC = () => {
  const { user, loading } = useAuth();
  return (
    <>
      <Text testID="user">{user ? user.email : 'null'}</Text>
      <Text testID="loading">{loading ? 'true' : 'false'}</Text>
    </>
  );
};

describe('AuthContext \u2014 useAuth hook', () => {
  it('should throw if used outside AuthProvider', () => {
    // Suppress the console.error from React about errors in render
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<AuthConsumer />)).toThrow(
      'useAuth must be used within an AuthProvider'
    );
    consoleSpy.mockRestore();
  });
});

describe('AuthContext \u2014 AuthProvider', () => {
  let authStateCallback: ((user: any) => void) | null = null;

  beforeEach(() => {
    jest.clearAllMocks();
    authStateCallback = null;
    mockAuthService.onAuthStateChanged.mockImplementation((cb) => {
      authStateCallback = cb;
      return jest.fn(); // unsubscribe
    });
  });

  it('should start with loading=true, then false after auth resolves', async () => {
    const { getByTestId } = render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await act(async () => {
      authStateCallback!(null);
    });

    expect(getByTestId('loading').props.children).toBe('false');
    expect(getByTestId('user').props.children).toBe('null');
  });

  it('should set user when auth state changes to a signed-in user', async () => {
    const mockUser = { uid: 'user-1', email: 'test@example.com' };
    const { getByTestId } = render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await act(async () => {
      authStateCallback!(mockUser);
    });

    expect(getByTestId('user').props.children).toBe('test@example.com');
  });

  it('should call loadFromCloud on UserStore and SettingsStore when user signs in', async () => {
    const mockUser = { uid: 'user-1', email: 'test@example.com' };
    const mockUserLoadFromCloud = jest.fn(() => Promise.resolve());
    const mockSettingsLoadFromCloud = jest.fn(() => Promise.resolve());

    (useUserStore.getState as jest.Mock).mockReturnValue({ loadFromCloud: mockUserLoadFromCloud });
    (useSettingsStore.getState as jest.Mock).mockReturnValue({ loadFromCloud: mockSettingsLoadFromCloud });

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await act(async () => {
      authStateCallback!(mockUser);
    });

    expect(mockUserLoadFromCloud).toHaveBeenCalled();
    expect(mockSettingsLoadFromCloud).toHaveBeenCalled();
  });

  it('should NOT call loadFromCloud when user signs out', async () => {
    const mockUserLoadFromCloud = jest.fn(() => Promise.resolve());
    (useUserStore.getState as jest.Mock).mockReturnValue({ loadFromCloud: mockUserLoadFromCloud });

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await act(async () => {
      authStateCallback!(null); // null = signed out
    });

    expect(mockUserLoadFromCloud).not.toHaveBeenCalled();
  });
});

describe('AuthContext \u2014 Sign-in methods', () => {
  let authStateCallback: ((user: any) => void) | null = null;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthService.onAuthStateChanged.mockImplementation((cb) => {
      authStateCallback = cb;
      return jest.fn();
    });
  });

  const renderWithProvider = () => {
    const SignInTester: React.FC = () => {
      const auth = useAuth();
      return (
        <>
          <Text testID="signInWithGoogle" onPress={() => auth.signInWithGoogle()}>Google</Text>
          <Text testID="signInWithEmail" onPress={() => auth.signInWithEmail('a@b.com', 'pass')}>Email</Text>
          <Text testID="signOut" onPress={() => auth.signOut()}>SignOut</Text>
          <Text testID="createAccount" onPress={() => auth.createAccount('a@b.com', 'pass')}>Create</Text>
        </>
      );
    };

    return render(
      <AuthProvider>
        <SignInTester />
      </AuthProvider>
    );
  };

  it('should call authService.signInWithGoogle when signInWithGoogle is called', async () => {
    mockAuthService.signInWithGoogle.mockResolvedValue(undefined);
    const { getByTestId } = renderWithProvider();

    await act(async () => {
      authStateCallback!(null);
      getByTestId('signInWithGoogle').props.onPress();
    });

    expect(mockAuthService.signInWithGoogle).toHaveBeenCalled();
  });

  it('should call authService.signInWithEmail when signInWithEmail is called', async () => {
    mockAuthService.signInWithEmail.mockResolvedValue(undefined);
    const { getByTestId } = renderWithProvider();

    await act(async () => {
      authStateCallback!(null);
      getByTestId('signInWithEmail').props.onPress();
    });

    expect(mockAuthService.signInWithEmail).toHaveBeenCalledWith('a@b.com', 'pass');
  });

  it('should call authService.signOut when signOut is called', async () => {
    mockAuthService.signOut.mockResolvedValue(undefined);
    const { getByTestId } = renderWithProvider();

    await act(async () => {
      authStateCallback!(null);
      getByTestId('signOut').props.onPress();
    });

    expect(mockAuthService.signOut).toHaveBeenCalled();
  });

  it('should call authService.createAccount when createAccount is called', async () => {
    mockAuthService.createAccount.mockResolvedValue(undefined);
    const { getByTestId } = renderWithProvider();

    await act(async () => {
      authStateCallback!(null);
      getByTestId('createAccount').props.onPress();
    });

    expect(mockAuthService.createAccount).toHaveBeenCalledWith('a@b.com', 'pass');
  });
});
