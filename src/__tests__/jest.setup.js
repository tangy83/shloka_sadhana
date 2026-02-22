// Jest setup file to fix Expo SDK 54 import.meta issues
// This runs before setupFilesAfterEnv

// Mock import.meta for Expo (Expo SDK 54 uses import.meta)
if (!global.import) {
  global.import = {
    meta: {
      url: '',
      resolve: (specifier) => specifier,
    },
  };
}

// Mock __ExpoImportMetaRegistry for Expo winter runtime
global.__ExpoImportMetaRegistry = {
  register: () => {},
  resolve: () => undefined,
};

// Mock structuredClone for Expo SDK 54
if (!global.structuredClone) {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

// Suppress React Native warnings in tests
global.__reanimatedWorkletInit = () => {};

// Mock expo-linear-gradient (theme refactor — gradient CTAs)
jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return {
    LinearGradient: View,
  };
});

// Mock expo-location (V3 Feature #4)
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: {
      latitude: 28.6139,
      longitude: 77.209,
    },
  }),
  Accuracy: {
    Balanced: 4,
  },
}));
