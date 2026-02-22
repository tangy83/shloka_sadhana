/**
 * Location Utility Tests
 * Shloka Sadhana — User location for muhurat calculations
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import {
  getUserLocation,
  setUserLocation,
  clearUserLocation,
  getDefaultLocation,
  UserLocation,
} from '../location';
import { STORAGE_KEYS } from '../../constants/StorageKeys';

// expo-location is already mocked in jest.setup.js
const mockLocationModule = Location as jest.Mocked<typeof Location>;

describe('getDefaultLocation', () => {
  it('should return Delhi coordinates', () => {
    const loc = getDefaultLocation();

    expect(loc.latitude).toBe(28.6139);
    expect(loc.longitude).toBe(77.209);
  });

  it('should return Asia/Kolkata timezone', () => {
    const loc = getDefaultLocation();

    expect(loc.timezone).toBe('Asia/Kolkata');
  });

  it('should return Delhi as city', () => {
    const loc = getDefaultLocation();

    expect(loc.city).toBe('Delhi, India');
  });

  it('should return a UserLocation-shaped object', () => {
    const loc = getDefaultLocation();

    expect(typeof loc.latitude).toBe('number');
    expect(typeof loc.longitude).toBe('number');
    expect(typeof loc.timezone).toBe('string');
  });
});

describe('getUserLocation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>)
      .mockResolvedValue(null);
  });

  it('should return stored manual location when one is saved', async () => {
    const saved: UserLocation = {
      latitude: 19.076,
      longitude: 72.8777,
      timezone: 'Asia/Kolkata',
      city: 'Mumbai, India',
    };

    (AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>)
      .mockResolvedValue(JSON.stringify(saved));

    const result = await getUserLocation();

    expect(result.latitude).toBe(saved.latitude);
    expect(result.longitude).toBe(saved.longitude);
    expect(result.city).toBe(saved.city);
  });

  it('should fall back to GPS when no stored location exists', async () => {
    (AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>)
      .mockResolvedValue(null);

    // expo-location mock returns granted + coords 28.6139, 77.209
    const result = await getUserLocation();

    expect(result.latitude).toBe(28.6139);
    expect(result.longitude).toBe(77.209);
  });

  it('should fall back to Delhi when GPS permission is denied', async () => {
    (mockLocationModule.requestForegroundPermissionsAsync as jest.MockedFunction<
      typeof Location.requestForegroundPermissionsAsync
    >).mockResolvedValueOnce({ status: 'denied' } as never);

    const result = await getUserLocation();

    expect(result.latitude).toBe(28.6139);
    expect(result.longitude).toBe(77.209);
    expect(result.timezone).toBe('Asia/Kolkata');
  });

  it('should fall back to Delhi when GPS throws an error', async () => {
    (AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>)
      .mockResolvedValue(null);
    (mockLocationModule.requestForegroundPermissionsAsync as jest.MockedFunction<
      typeof Location.requestForegroundPermissionsAsync
    >).mockRejectedValueOnce(new Error('Location unavailable'));

    const result = await getUserLocation();

    expect(result.latitude).toBe(28.6139);
    expect(result.latitude).toBeDefined();
  });

  it('should return an object with latitude, longitude, timezone fields', async () => {
    const result = await getUserLocation();

    expect(result).toHaveProperty('latitude');
    expect(result).toHaveProperty('longitude');
    expect(result).toHaveProperty('timezone');
  });
});

describe('setUserLocation', () => {
  it('should save location to AsyncStorage', async () => {
    const location: UserLocation = {
      latitude: 12.9716,
      longitude: 77.5946,
      timezone: 'Asia/Kolkata',
      city: 'Bangalore, India',
    };

    await setUserLocation(location);

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEYS.USER_LOCATION,
      JSON.stringify(location)
    );
  });

  it('should rethrow when AsyncStorage.setItem fails', async () => {
    (AsyncStorage.setItem as jest.MockedFunction<typeof AsyncStorage.setItem>)
      .mockRejectedValueOnce(new Error('Write failed'));

    await expect(
      setUserLocation({ latitude: 0, longitude: 0, timezone: 'UTC' })
    ).rejects.toThrow('Write failed');
  });
});

describe('clearUserLocation', () => {
  it('should remove location from AsyncStorage', async () => {
    await clearUserLocation();

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.USER_LOCATION);
  });

  it('should rethrow when AsyncStorage.removeItem fails', async () => {
    (AsyncStorage.removeItem as jest.MockedFunction<typeof AsyncStorage.removeItem>)
      .mockRejectedValueOnce(new Error('Remove failed'));

    await expect(clearUserLocation()).rejects.toThrow('Remove failed');
  });
});
