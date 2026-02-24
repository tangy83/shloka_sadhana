/**
 * ThemeContext
 * Shloka Sadhana - Theme Management
 *
 * Provides theme context for the entire app with persistence
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getItem, setItem } from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants/StorageKeys';
import { Theme, ThemeMode, darkTheme, lightTheme } from '@/constants/theme';

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  const [isLoading, setIsLoading] = useState(true);

  // Load theme from storage on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await getItem<ThemeMode>(STORAGE_KEYS.THEME);
        if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
          setThemeModeState(savedTheme);
        }
      } catch (error) {
        if (__DEV__) console.error('[Theme] Error loading theme:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  // Set theme and persist to storage
  const setThemeMode = async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode);
      await setItem(STORAGE_KEYS.THEME, mode);
    } catch (error) {
      if (__DEV__) console.error('[Theme] Error saving theme:', error);
    }
  };

  const theme: Theme = themeMode === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Fallback for tests or SSR — returns light theme defaults
    return { theme: lightTheme, themeMode: 'light', setThemeMode: () => {}, isLoading: false };
  }
  return context;
};
