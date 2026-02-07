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
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');
  const [isLoading, setIsLoading] = useState(true);

  // Load theme from storage on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await getItem<ThemeMode>(STORAGE_KEYS.THEME);
        if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light' || savedTheme === 'system')) {
          setThemeModeState(savedTheme);
        }
      } catch (error) {
        console.error('[Theme] Error loading theme:', error);
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
      console.error('[Theme] Error saving theme:', error);
    }
  };

  // Get current theme colors based on mode
  const theme = themeMode === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
