/**
 * Location Utility
 * Shloka Sadhana - V3 Feature #4
 *
 * Utility functions for getting user location for muhurat calculations
 */

import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants/StorageKeys';

const DEFAULT_LOCATION = {
  latitude: 28.6139,
  longitude: 77.209,
  timezone: 'Asia/Kolkata',
  city: 'Delhi, India',
};

export interface UserLocation {
  latitude: number;
  longitude: number;
  timezone: string;
  city?: string;
}

/**
 * Get user's location for muhurat calculations
 * Priority: 1) Stored manual location 2) Device GPS 3) Default (Delhi)
 *
 * @returns UserLocation with latitude, longitude, timezone, and optional city
 */
export async function getUserLocation(): Promise<UserLocation> {
  // Check if user has manually set location in settings
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.USER_LOCATION);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    if (__DEV__) console.error('[location] Failed to load stored location:', error);
  }

  // Try to get device location (with permission)
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      if (__DEV__) console.log('[location] Permission not granted, using default location');
      return DEFAULT_LOCATION;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      timezone,
    };
  } catch (error) {
    if (__DEV__) console.error('[location] Failed to get device location:', error);
    // Fallback to default
    return DEFAULT_LOCATION;
  }
}

/**
 * Save user's manually set location to AsyncStorage
 * Used when user sets location in Settings
 *
 * @param location - User location to save
 */
export async function setUserLocation(location: UserLocation): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_LOCATION, JSON.stringify(location));
  } catch (error) {
    if (__DEV__) console.error('[location] Failed to save location:', error);
    throw error;
  }
}

/**
 * Clear user's saved location (revert to auto-detect)
 */
export async function clearUserLocation(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_LOCATION);
  } catch (error) {
    if (__DEV__) console.error('[location] Failed to clear location:', error);
    throw error;
  }
}

/**
 * Get default location (Delhi, India)
 * Used as fallback when location cannot be determined
 */
export function getDefaultLocation(): UserLocation {
  return DEFAULT_LOCATION;
}
