/**
 * Theme Constants
 * Shloka Sadhana - App Theme Configuration
 *
 * Ethnic Indian design language — saffron-forward, temple warmth:
 *   Dark  — Deep warm brown (#1E0E05) base, Saffron Flame (#E55B00) primary, Temple Gold (#FFD700) accent
 *   Light — Warm Cream (#FFF3E0) base, same saffron/gold primaries
 */

import { Colors } from './Colors';

export type ThemeMode = 'dark' | 'light';

export interface Theme {
  background: string;
  surface: string;
  surfaceSecondary: string;
  surfaceElevated: string;
  text: string;
  textBright: string;       // prominent text (headings, display text)
  textSecondary: string;
  textTertiary: string;     // 50% alpha text
  textDisabled: string;     // 35% alpha text
  textMeaning: string;
  primary: string;          // Saffron — sacred fire, action, active state
  primaryLight: string;     // Temple Gold — highlights, accents
  border: string;
  divider: string;          // subtle divider lines
  headerBackground: string; // Stack nav header background
  success: string;
  warning: string;
  error: string;
}

// darkTheme — direct contrast inversion of lightTheme.
// Light parchment backgrounds → deep sanctum darks.
// Dark brown text → bright parchment creams (mirroring the light palette roles).
export const darkTheme: Theme = {
  // Backgrounds: mirror of light creams (#FFF3E0 → #120A02, pale amber → #1C0F04)
  background: '#120A02',              // Deepest sanctum — darkest warm brown
  surface: '#1E1108',                 // Card surface — one step lighter
  surfaceSecondary: '#2A1A0A',        // Modals, section backgrounds
  surfaceElevated: '#3A2410',         // Raised elements — clearly distinct from surface

  // Text: inverted from light brown palette → warm creams
  text: '#FFF3E0',                    // Mirror of light background — primary body text
  textBright: '#FFFAF2',              // Mirror of light textBright — headings, display
  textSecondary: '#C4956A',           // Lighter warm brown — visible on dark, mirrors #7B5E35
  textTertiary: 'rgba(255, 243, 224, 0.50)',
  textDisabled: 'rgba(255, 243, 224, 0.35)',
  textMeaning: 'rgba(255, 243, 224, 0.85)',

  // Primary — same saffron as light (sacred fire doesn't change)
  primary: '#E55B00',
  primaryLight: '#FFD700',

  // Borders: warm amber tint, visible against dark surfaces
  border: 'rgba(196, 149, 106, 0.25)',  // Mirrors light border hue, adjusted for dark
  divider: 'rgba(196, 149, 106, 0.15)',

  headerBackground: '#1E1108',        // Matches surface — seamless header/card boundary

  success: '#66BB6A',                 // Slightly lighter green — legible on dark
  warning: '#FFD700',
  error: '#EF5350',                   // Slightly lighter red — legible on dark
};

// lightTheme — wired to Colors.* so it auto-reflects the light palette defaults.
export const lightTheme: Theme = {
  background: Colors.background,           // #FFF3E0 warm parchment cream
  surface: Colors.surface,                 // #FFF0D5 pale amber
  surfaceSecondary: Colors.surfaceLight,   // #FFECC8
  surfaceElevated: Colors.surfaceElevated, // #FFE4B5 moccasin
  text: Colors.text,                       // #1E0E05 deep dark brown
  textBright: Colors.textBright,           // #2A1408 prominent dark text
  textSecondary: Colors.textSecondary,     // #7B5E35 warm medium brown
  textTertiary: Colors.textTertiary,       // rgba(30,14,5,0.50)
  textDisabled: Colors.textDisabled,       // rgba(30,14,5,0.35)
  textMeaning: Colors.textMeaning,         // rgba(30,14,5,0.75)
  primary: Colors.primary,                 // #E55B00 — same across themes
  primaryLight: Colors.templeGold,         // #FFD700 — same across themes
  border: Colors.border,                   // rgba(139,90,43,0.20)
  divider: Colors.divider,                 // rgba(139,90,43,0.12)
  headerBackground: '#FFF0D0',             // Pale amber — stack nav headers on light
  success: '#2E7D32',                      // Deeper green for legibility on cream
  warning: Colors.warning,                 // #E65100 deep saffron — visible on cream
  error: '#C62828',                        // Deeper red for legibility on cream
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
