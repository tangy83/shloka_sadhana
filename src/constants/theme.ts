/**
 * Theme Constants
 * Shloka Sadhana - App Theme Configuration
 *
 * Ethnic Indian design language — saffron-forward, temple warmth:
 *   Dark  — Deep warm brown (#1E0E05) base, Saffron Flame (#E55B00) primary, Temple Gold (#FFD700) accent
 *   Light — Warm Cream (#FFF8E7) base, same saffron/gold primaries
 */

import { Colors } from './Colors';

export type ThemeMode = 'dark' | 'light' | 'system';

export interface Theme {
  background: string;
  surface: string;
  surfaceSecondary: string;
  surfaceElevated: string;
  text: string;
  textSecondary: string;
  textMeaning: string;
  primary: string;       // Saffron — sacred fire, action, active state
  primaryLight: string;  // Temple Gold — highlights, accents
  border: string;
  headerBackground: string; // Stack nav header background
  success: string;
  warning: string;
  error: string;
}

export const darkTheme: Theme = {
  background: Colors.background,       // Deepest sanctum — temple at midnight
  surface: '#2A1408',          // Warm brown — card surfaces, altar wood
  surfaceSecondary: Colors.surfaceElevated, // Raised warm brown — modals, dividers
  surfaceElevated: Colors.surfaceElevated,  // Elevated surface (same as secondary)
  text: Colors.text,             // Warm parchment cream — ancient manuscript
  textSecondary: Colors.textSecondary,    // Soft amber — secondary labels, icons
  textMeaning: Colors.textMeaning, // Slightly muted for English meanings
  primary: Colors.primary,          // Deep Saffron — sacred fire, primary action
  primaryLight: Colors.templeGold,     // Temple Gold — highlights, ॐ symbol, mala count
  border: Colors.border, // Soft gold boundary — breathable, warm
  headerBackground: '#2A1408',  // Warm brown — stack nav headers
  success: Colors.success,          // Green — streak achievement, completion
  warning: Colors.templeGold,          // Temple Gold — caution
  error: '#EF4444',            // Red — errors
};

export const lightTheme: Theme = {
  background: '#FFF8E7',    // Warm Cream — parchment, inviting
  surface: '#FFF0D0',       // Pale amber — elevated surfaces
  surfaceSecondary: '#FFE4B0', // Light moccasin — secondary surfaces
  surfaceElevated: '#FFD9A0',  // Deeper amber for elevated on light
  text: '#2C1200',          // Dark warm brown — on cream
  textSecondary: '#7B5E35', // Warm brown — secondary labels
  textMeaning: 'rgba(44, 18, 0, 0.75)', // Muted meaning text on cream
  primary: Colors.primary,       // Saffron — same across themes
  primaryLight: Colors.templeGold,  // Temple Gold — same across themes
  border: 'rgba(200, 120, 0, 0.20)', // Warm gold border on cream
  headerBackground: '#FFF0D0',  // Pale amber — stack nav headers on light
  success: '#2E7D32',       // Deeper green for legibility on cream
  warning: '#E65100',       // Deep saffron — visible on cream
  error: '#C62828',         // Deeper red for legibility on cream
};

/**
 * Shadow tokens — use these for elevation and depth.
 * Spread into StyleSheet objects directly.
 */
export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  modal: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
};

/**
 * Typography tokens — sacred text refinements.
 * Spread into Text style objects.
 */
export const typography = {
  sanskrit: {
    letterSpacing: 0.5,
  },
  transliteration: {
    fontStyle: 'italic' as const,
  },
};

/**
 * Glow tokens — for sacred numbers and achievement states.
 * Apply to Text when mala count >= 108 or streak milestones.
 */
export const glow = {
  gold: {
    textShadowColor: 'rgba(255, 215, 0, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  },
  saffron: {
    textShadowColor: 'rgba(255, 154, 42, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
};
