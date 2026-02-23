/**
 * AboutScreen Tests
 * Shloka Sadhana — About the app screen
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { AboutScreen } from '../AboutScreen';

// Mock expo-constants
jest.mock('expo-constants', () => ({
  expoConfig: { version: '2.5.0' },
}));

// Mock ThemeContext — AboutScreen uses useTheme()
jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      background: '#FFF8F0',
      surface: '#FFF0D0',
      border: 'rgba(139,90,43,0.15)',
      text: '#4A2700',
      textSecondary: '#8B5A2B',
      textBright: '#2A1408',
      primary: '#FF9A2A',
    },
    themeMode: 'light',
    setThemeMode: jest.fn(),
    isLoading: false,
  }),
}));

describe('AboutScreen', () => {
  it('should render without crash', () => {
    expect(() => render(<AboutScreen />)).not.toThrow();
  });

  describe('App Identity', () => {
    it('should display the app name "Shloka Sadhana"', () => {
      render(<AboutScreen />);

      expect(screen.getByText('Shloka Sadhana')).toBeTruthy();
    });

    it('should display the app version from expo-constants', () => {
      render(<AboutScreen />);

      expect(screen.getByText('Version 2.5.0')).toBeTruthy();
    });

    it('should display the OM logo glyph', () => {
      render(<AboutScreen />);

      expect(screen.getByText('ॐ')).toBeTruthy();
    });
  });

  describe('Content Sections', () => {
    it('should display "Our Mission" section', () => {
      render(<AboutScreen />);

      expect(screen.getByText('Our Mission')).toBeTruthy();
    });

    it('should display "What We Offer" section', () => {
      render(<AboutScreen />);

      expect(screen.getByText('What We Offer')).toBeTruthy();
    });

    it('should display "Our Philosophy" section', () => {
      render(<AboutScreen />);

      expect(screen.getByText('Our Philosophy')).toBeTruthy();
    });

    it('should display "Authenticity" section', () => {
      render(<AboutScreen />);

      expect(screen.getByText('Authenticity')).toBeTruthy();
    });

    it('should display "Get In Touch" section', () => {
      render(<AboutScreen />);

      expect(screen.getByText('Get In Touch')).toBeTruthy();
    });
  });

  describe('Contact Info', () => {
    it('should display the email address', () => {
      render(<AboutScreen />);

      expect(screen.getByText(/contact@shlokasadhana.com/)).toBeTruthy();
    });

    it('should display the website', () => {
      render(<AboutScreen />);

      expect(screen.getByText(/www.shlokasadhana.com/)).toBeTruthy();
    });
  });

  describe('Footer', () => {
    it('should display the copyright notice', () => {
      render(<AboutScreen />);

      expect(screen.getByText(/© 2026 Shloka Sadhana/)).toBeTruthy();
    });

    it('should display the "Made with devotion" message', () => {
      render(<AboutScreen />);

      expect(screen.getByText(/Made with devotion/)).toBeTruthy();
    });
  });

  describe('Version Fallback', () => {
    it('should fall back to "1.0.0" when expoConfig is null', () => {
      jest.resetModules();
      jest.mock('expo-constants', () => ({
        expoConfig: null,
      }));
      // Re-mock ThemeContext after resetModules to avoid two-React-copies issue
      jest.mock('@/contexts/ThemeContext', () => ({
        useTheme: () => ({
          theme: {
            background: '#FFF8F0',
            surface: '#FFF0D0',
            border: 'rgba(139,90,43,0.15)',
            text: '#4A2700',
            textSecondary: '#8B5A2B',
            textBright: '#2A1408',
            primary: '#FF9A2A',
          },
          themeMode: 'light',
          setThemeMode: jest.fn(),
          isLoading: false,
        }),
      }));

      // Re-require with mocked module
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { AboutScreen: AboutScreenFresh } = require('../AboutScreen');
      render(<AboutScreenFresh />);

      expect(screen.getByText('Version 1.0.0')).toBeTruthy();
    });
  });
});
