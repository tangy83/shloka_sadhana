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

/** Times iOS is asked to show the permission prompt before giving up */
const MAX_PERMISSION_ATTEMPTS = 3;
/** Gap between prompt attempts, letting any in-flight system alert clear */
const PERMISSION_RETRY_MS = 1200;

/** Shared in-flight request, so simultaneous callers trigger a single prompt */
let inFlightLocation: Promise<UserLocation> | null = null;

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
/**
 * Wait helper for retrying a permission prompt iOS declined to present
 */
const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Ask for foreground location permission, coping with iOS silently dropping a
 * prompt requested while another system alert is still on screen (the app then
 * sees "undetermined" with no dialog shown). Retries a couple of times before
 * giving up, so the user actually gets asked on first launch.
 */
async function ensureForegroundPermission(): Promise<boolean> {
  const current = await Location.getForegroundPermissionsAsync();
  if (current.status === 'granted') {
    return true;
  }
  if (!current.canAskAgain) {
    return false;
  }

  for (let attempt = 0; attempt < MAX_PERMISSION_ATTEMPTS; attempt++) {
    const result = await Location.requestForegroundPermissionsAsync();
    if (result.status === 'granted') {
      return true;
    }
    // A decided answer (denied) is final — only an undetermined status means
    // the prompt never appeared and is worth asking for again.
    if (result.status !== 'undetermined') {
      return false;
    }
    if (attempt < MAX_PERMISSION_ATTEMPTS - 1) {
      await delay(PERMISSION_RETRY_MS);
    }
  }
  return false;
}

/**
 * Resolve the location to use for muhurat calculations
 */
async function resolveUserLocation(): Promise<UserLocation> {
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
    const granted = await ensureForegroundPermission();
    if (!granted) {
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
 * Get user's location for muhurat calculations
 * Priority: 1) Stored manual location 2) Device GPS 3) Default (Delhi)
 *
 * Several Home cards call this on mount; the in-flight request is shared so
 * iOS is only ever asked for permission once.
 *
 * @returns UserLocation with latitude, longitude, timezone, and optional city
 */
export async function getUserLocation(): Promise<UserLocation> {
  if (!inFlightLocation) {
    inFlightLocation = resolveUserLocation().finally(() => {
      inFlightLocation = null;
    });
  }
  return inFlightLocation;
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
