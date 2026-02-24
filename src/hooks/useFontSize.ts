/**
 * useFontSize Hook
 * Shloka Sadhana - Font Size Settings
 *
 * Manages font size preference with persistence
 */

import { useState, useEffect } from 'react';
import { getItem, setItem } from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants/StorageKeys';

const MIN_FONT_SIZE = 0.8;
const MAX_FONT_SIZE = 1.5;
const DEFAULT_FONT_SIZE = 1.0;

export interface UseFontSizeReturn {
  fontSize: number;
  setFontSize: (size: number) => void;
  isLoading: boolean;
}

export const useFontSize = (): UseFontSizeReturn => {
  const [fontSize, setFontSizeState] = useState(DEFAULT_FONT_SIZE);
  const [isLoading, setIsLoading] = useState(true);

  // Load font size from storage on mount
  useEffect(() => {
    const loadFontSize = async () => {
      try {
        const saved = await getItem<number>(STORAGE_KEYS.FONT_SIZE);
        if (saved !== null && saved !== undefined) {
          setFontSizeState(saved);
        }
      } catch (error) {
        if (__DEV__) console.error('[FontSize] Error loading font size:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFontSize();
  }, []);

  // Set font size and persist to storage
  const setFontSize = async (size: number) => {
    try {
      // Clamp between min and max
      const clamped = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, size));
      setFontSizeState(clamped);
      await setItem(STORAGE_KEYS.FONT_SIZE, clamped);
    } catch (error) {
      if (__DEV__) console.error('[FontSize] Error saving font size:', error);
    }
  };

  return { fontSize, setFontSize, isLoading };
};
