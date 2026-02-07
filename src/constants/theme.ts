/**
 * Theme Constants
 * Shloka Sadhana - App Theme Configuration
 *
 * Defines color schemes for dark and light themes
 */

export type ThemeMode = 'dark' | 'light' | 'system';

export interface Theme {
  background: string;
  surface: string;
  surfaceSecondary: string;
  text: string;
  textSecondary: string;
  primary: string;
  primaryLight: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}

export const darkTheme: Theme = {
  background: '#121212',
  surface: '#1E1E1E',
  surfaceSecondary: '#2A2A2A',
  text: '#FFFFFF',
  textSecondary: '#9E9E9E',
  primary: '#FF9800',
  primaryLight: '#FFA726',
  border: '#2A2A2A',
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
};

export const lightTheme: Theme = {
  background: '#FFFFFF',
  surface: '#F5F5F5',
  surfaceSecondary: '#E0E0E0',
  text: '#000000',
  textSecondary: '#616161',
  primary: '#FF9800',
  primaryLight: '#FFA726',
  border: '#E0E0E0',
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
};
