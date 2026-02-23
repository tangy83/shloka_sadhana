/**
 * ThemeContext Tests
 * Shloka Sadhana - Theme Management
 *
 * Tests for theme context and useTheme hook
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { ThemeProvider, useTheme } from '../ThemeContext';
import { darkTheme, lightTheme } from '@/constants/theme';
import * as storage from '@/utils/storage';

// Mock storage
jest.mock('@/utils/storage');

const mockGetItem = storage.getItem as jest.MockedFunction<typeof storage.getItem>;
const mockSetItem = storage.setItem as jest.MockedFunction<typeof storage.setItem>;

describe('ThemeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetItem.mockResolvedValue(null);
    mockSetItem.mockResolvedValue(true);
  });

  describe('useTheme Hook', () => {
    it('should provide light theme by default', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.theme).toEqual(lightTheme);
      expect(result.current.themeMode).toBe('light');
    });

    it('should load theme mode from storage', async () => {
      mockGetItem.mockResolvedValue('light');

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.theme).toEqual(lightTheme);
      expect(result.current.themeMode).toBe('light');
    });

    it('should switch to light theme', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setThemeMode('light');
      });

      expect(result.current.theme).toEqual(lightTheme);
      expect(result.current.themeMode).toBe('light');
      expect(mockSetItem).toHaveBeenCalledWith('@shloka_sadhana:theme', 'light');
    });

    it('should switch to dark theme', async () => {
      mockGetItem.mockResolvedValue('light');

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setThemeMode('dark');
      });

      expect(result.current.theme).toEqual(darkTheme);
      expect(result.current.themeMode).toBe('dark');
      expect(mockSetItem).toHaveBeenCalledWith('@shloka_sadhana:theme', 'dark');
    });

    it('should ignore unknown stored theme values and use default', async () => {
      // 'system' is no longer a valid ThemeMode — stored value should be ignored
      mockGetItem.mockResolvedValue('system' as never);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Unknown value is rejected; default 'light' is used
      expect(result.current.themeMode).toBe('light');
      expect(result.current.theme).toBeDefined();
      expect(result.current.theme.background).toBeTruthy();
    });

    it('should persist theme mode to storage when changed', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setThemeMode('light');
      });

      expect(mockSetItem).toHaveBeenCalledWith('@shloka_sadhana:theme', 'light');
    });
  });
});
