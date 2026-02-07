/**
 * Audio Service
 * Shloka Sadhana - Audio Playback System
 *
 * Manages audio playback for shloka pronunciation using expo-av
 */

import { Audio, AVPlaybackStatus } from 'expo-av';

/**
 * Load audio from URL or local file
 * @param source - Audio URL string or require() object
 * @returns Promise<Audio.Sound | null> - Loaded sound object or null on error
 */
export const loadAudio = async (
  source: string | number
): Promise<Audio.Sound | null> => {
  try {
    const sourceObject = typeof source === 'string' ? { uri: source } : source;

    const { sound } = await Audio.Sound.createAsync(sourceObject, {
      shouldPlay: false,
    });

    return sound;
  } catch (error) {
    console.error('[Audio] Failed to load audio:', error);
    return null;
  }
};

/**
 * Play audio
 * @param sound - Sound object to play
 * @returns Promise<boolean> - True if successful
 */
export const playAudio = async (
  sound: Audio.Sound | null
): Promise<boolean> => {
  if (!sound) return false;

  try {
    await sound.playAsync();
    return true;
  } catch (error) {
    console.error('[Audio] Failed to play audio:', error);
    return false;
  }
};

/**
 * Pause audio
 * @param sound - Sound object to pause
 * @returns Promise<boolean> - True if successful
 */
export const pauseAudio = async (
  sound: Audio.Sound | null
): Promise<boolean> => {
  if (!sound) return false;

  try {
    await sound.pauseAsync();
    return true;
  } catch (error) {
    console.error('[Audio] Failed to pause audio:', error);
    return false;
  }
};

/**
 * Stop audio and reset position
 * @param sound - Sound object to stop
 * @returns Promise<boolean> - True if successful
 */
export const stopAudio = async (
  sound: Audio.Sound | null
): Promise<boolean> => {
  if (!sound) return false;

  try {
    await sound.stopAsync();
    return true;
  } catch (error) {
    console.error('[Audio] Failed to stop audio:', error);
    return false;
  }
};

/**
 * Unload audio and release resources
 * @param sound - Sound object to unload
 */
export const unloadAudio = async (
  sound: Audio.Sound | null
): Promise<void> => {
  if (!sound) return;

  try {
    await sound.unloadAsync();
  } catch (error) {
    console.error('[Audio] Failed to unload audio:', error);
  }
};

/**
 * Get current audio playback status
 * @param sound - Sound object
 * @returns Promise<AVPlaybackStatus | null> - Playback status or null on error
 */
export const getAudioStatus = async (
  sound: Audio.Sound | null
): Promise<AVPlaybackStatus | null> => {
  if (!sound) return null;

  try {
    const status = await sound.getStatusAsync();
    return status;
  } catch (error) {
    console.error('[Audio] Failed to get status:', error);
    return null;
  }
};

/**
 * Seek to specific position in audio
 * @param sound - Sound object
 * @param positionMillis - Position in milliseconds
 * @returns Promise<boolean> - True if successful
 */
export const seekAudio = async (
  sound: Audio.Sound | null,
  positionMillis: number
): Promise<boolean> => {
  if (!sound) return false;

  try {
    await sound.setPositionAsync(positionMillis);
    return true;
  } catch (error) {
    console.error('[Audio] Failed to seek:', error);
    return false;
  }
};
