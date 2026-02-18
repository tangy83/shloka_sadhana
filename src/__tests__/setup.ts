// Test setup for React Native Testing Library
// All dependencies are now installed, so we can enable mocks

// Mock @/constants/Layout — augment the real Layout object with borderRadius/spacing aliases
// Several screens access Layout.borderRadius.lg / Layout.spacing.md which don't exist on
// the real Layout export (those are exported as separate BorderRadius/Spacing constants).
jest.mock('@/constants/Layout', () => {
  const actual = jest.requireActual('@/constants/Layout');
  return {
    ...actual,
    Layout: {
      ...actual.Layout,
      borderRadius: actual.BorderRadius,
      spacing: actual.Spacing,
    },
  };
});

// Mock expo-status-bar
jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('notification-id')),
  cancelScheduledNotificationAsync: jest.fn(() => Promise.resolve()),
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted', granted: true, canAskAgain: true, expires: 'never' })
  ),
  requestPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted', granted: true, canAskAgain: true, expires: 'never' })
  ),
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

// Mock expo-av (for future audio features)
jest.mock('expo-av', () => ({
  Audio: {
    Sound: jest.fn(() => ({
      loadAsync: jest.fn(() => Promise.resolve({ status: {} })),
      playAsync: jest.fn(() => Promise.resolve({ status: {} })),
      stopAsync: jest.fn(() => Promise.resolve({ status: {} })),
      unloadAsync: jest.fn(() => Promise.resolve({ status: {} })),
      setPositionAsync: jest.fn(() => Promise.resolve({ status: {} })),
    })),
    setAudioModeAsync: jest.fn(() => Promise.resolve()),
  },
}));

// Mock Sentry (virtual: true handles the case where sentry-expo is not installed)
jest.mock('sentry-expo', () => ({
  init: jest.fn(),
  Native: {
    captureException: jest.fn(),
    captureMessage: jest.fn(),
  },
}), { virtual: true });

// Mock @sentry/react-native (used by src/utils/sentry.ts)
jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  setUser: jest.fn(),
  setTag: jest.fn(),
  withScope: jest.fn(),
  Severity: { Error: 'error', Warning: 'warning' },
}));

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
    addListener: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
    key: 'test-route',
    name: 'TestScreen',
  }),
  useFocusEffect: jest.fn(),
  NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock @react-native-community/netinfo
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(() =>
    Promise.resolve({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
      details: {},
    })
  ),
  addEventListener: jest.fn(() => jest.fn()), // Returns unsubscribe function
}));

// ─── Firebase Mocks ───────────────────────────────────────────────────────────

// Mock @react-native-firebase/auth
// Used as: import auth from '@react-native-firebase/auth'
// Called as: auth().currentUser, auth().signInWithEmailAndPassword(), etc.
// Also has static providers: auth.GoogleAuthProvider.credential()
const mockAuthUser = {
  uid: 'test-uid-123',
  email: 'test@example.com',
  displayName: 'Test User',
  getIdToken: jest.fn(() => Promise.resolve('mock-id-token')),
  updateProfile: jest.fn(() => Promise.resolve()),
  delete: jest.fn(() => Promise.resolve()),
};

const mockAuthInstance = {
  currentUser: null as typeof mockAuthUser | null,
  signInWithEmailAndPassword: jest.fn(() =>
    Promise.resolve({ user: mockAuthUser })
  ),
  createUserWithEmailAndPassword: jest.fn(() =>
    Promise.resolve({ user: mockAuthUser })
  ),
  signInWithCredential: jest.fn(() =>
    Promise.resolve({ user: mockAuthUser })
  ),
  signOut: jest.fn(() => Promise.resolve()),
  sendPasswordResetEmail: jest.fn(() => Promise.resolve()),
  onAuthStateChanged: jest.fn((callback: (user: null) => void) => {
    callback(null); // Default: no user signed in
    return jest.fn(); // Return unsubscribe function
  }),
};

const mockAuthFn = jest.fn(() => mockAuthInstance);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(mockAuthFn as any).GoogleAuthProvider = {
  credential: jest.fn((idToken: string) => ({ providerId: 'google.com', idToken })),
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(mockAuthFn as any).AppleAuthProvider = {
  credential: jest.fn((identityToken: string) => ({ providerId: 'apple.com', identityToken })),
};

jest.mock('@react-native-firebase/auth', () => ({
  __esModule: true,
  default: mockAuthFn,
}));

// Mock @react-native-firebase/firestore
// Used as: import firestore from '@react-native-firebase/firestore'
// Called as: firestore().collection('x').doc('y').get/set/update()
const mockBatch = {
  set: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  commit: jest.fn(() => Promise.resolve()),
};

const mockDocRef = {
  get: jest.fn(() =>
    Promise.resolve({
      exists: false,
      data: jest.fn(() => null),
      id: 'mock-doc-id',
    })
  ),
  set: jest.fn(() => Promise.resolve()),
  update: jest.fn(() => Promise.resolve()),
  delete: jest.fn(() => Promise.resolve()),
  collection: jest.fn(),
};

const mockCollectionRef = {
  doc: jest.fn(() => mockDocRef),
  add: jest.fn(() => Promise.resolve({ id: 'new-doc-id' })),
  get: jest.fn(() => Promise.resolve({ docs: [], empty: true })),
  where: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
};

// Allow collection().doc().collection() chaining
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(mockDocRef as any).collection = jest.fn(() => mockCollectionRef);

const mockFirestoreInstance = {
  collection: jest.fn(() => mockCollectionRef),
  batch: jest.fn(() => mockBatch),
};

const mockFirestoreFn = jest.fn(() => mockFirestoreInstance);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(mockFirestoreFn as any).FieldValue = {
  serverTimestamp: jest.fn(() => 'mock-server-timestamp'),
  arrayUnion: jest.fn((...args: unknown[]) => args),
  arrayRemove: jest.fn((...args: unknown[]) => args),
  increment: jest.fn((n: number) => n),
};

jest.mock('@react-native-firebase/firestore', () => ({
  __esModule: true,
  default: mockFirestoreFn,
}));

// Mock @react-native-firebase/remote-config
jest.mock('@react-native-firebase/remote-config', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    fetchAndActivate: jest.fn(() => Promise.resolve(true)),
    getValue: jest.fn(() => ({ asBoolean: () => false, asString: () => '', asNumber: () => 0 })),
    setDefaults: jest.fn(() => Promise.resolve()),
    setConfigSettings: jest.fn(() => Promise.resolve()),
  })),
}));

// Mock @react-native-firebase/analytics
jest.mock('@react-native-firebase/analytics', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    logEvent: jest.fn(() => Promise.resolve()),
    setCurrentScreen: jest.fn(() => Promise.resolve()),
    setUserId: jest.fn(() => Promise.resolve()),
    setUserProperties: jest.fn(() => Promise.resolve()),
  })),
}));

// Mock @react-native-google-signin/google-signin
jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(() => Promise.resolve()),
    signIn: jest.fn(() => Promise.resolve({ idToken: 'mock-google-id-token' })),
    signOut: jest.fn(() => Promise.resolve()),
    isSignedIn: jest.fn(() => Promise.resolve(false)),
  },
}));

// Mock expo-apple-authentication
jest.mock('expo-apple-authentication', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(false)),
  signInAsync: jest.fn(() => Promise.resolve({ identityToken: 'mock-apple-token' })),
  AppleAuthenticationScope: {
    FULL_NAME: 'FULL_NAME',
    EMAIL: 'EMAIL',
  },
}));

// Mock @/contexts/AuthContext — provides a default mock useAuth() so screens that call
// useAuth() don't throw "must be used within an AuthProvider".
// Individual test files can override with jest.mock('@/contexts/AuthContext', ...) if needed.
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(() => ({
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
  })),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Note: To customize Firebase mocks in individual test files, import the mocked module:
//   import auth from '@react-native-firebase/auth';
//   (auth as jest.Mock).mockReturnValue({ currentUser: mockUser, ... })
// or call jest.mocked(auth)() to get the instance returned by auth().

// Silence console warnings in tests (optional)
global.console = {
  ...console,
  // Uncomment to suppress console output in tests
  // log: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Reset all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});
