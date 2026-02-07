// Test setup for React Native Testing Library
// All dependencies are now installed, so we can enable mocks

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

// Mock Sentry (for production error tracking)
jest.mock('sentry-expo', () => ({
  init: jest.fn(),
  Native: {
    captureException: jest.fn(),
    captureMessage: jest.fn(),
  },
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
