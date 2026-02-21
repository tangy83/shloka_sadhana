/**
 * Theme Constants
 * Shloka Sadhana - App Theme Configuration
 *
 * Ethnic Indian design language:
 *   Dark  — Deep Indigo (#1A0A2E) base, Saffron (#FF6B35) primary, Temple Gold (#FFD700) accent
 *   Light — Warm Cream (#FFF8E7) base, same saffron/gold primaries
 */

export type ThemeMode = 'dark' | 'light' | 'system';

export interface Theme {
  background: string;
  surface: string;
  surfaceSecondary: string;
  text: string;
  textSecondary: string;
  primary: string;       // Saffron — sacred fire, action, active state
  primaryLight: string;  // Temple Gold — highlights, accents
  border: string;
  success: string;
  warning: string;
  error: string;
}

export const darkTheme: Theme = {
  background: '#1A0A2E',    // Deep Indigo — night sky, meditative space
  surface: '#2D1B4E',       // Elevated indigo — cards, surfaces
  surfaceSecondary: '#3D2560', // Deeper indigo — modals, overlays
  text: '#FFF8E7',          // Warm Cream — ancient manuscript warmth
  textSecondary: '#C9A96E', // Warm gold-amber — secondary labels
  primary: '#FF6B35',       // Saffron — sacred fire, action
  primaryLight: '#FFD700',  // Temple Gold — highlights, mala count
  border: '#3D2560',        // Indigo border — subtle, warm
  success: '#4CAF50',       // Green — streak achievement, completion
  warning: '#FFD700',       // Temple Gold — caution
  error: '#EF4444',         // Red — errors
};

export const lightTheme: Theme = {
  background: '#FFF8E7',    // Warm Cream — parchment, inviting
  surface: '#FFF0D0',       // Pale amber — elevated surfaces
  surfaceSecondary: '#FFE4B0', // Light moccasin — secondary surfaces
  text: '#1A0A2E',          // Deep Indigo — on cream
  textSecondary: '#7B5E35', // Warm brown — secondary labels
  primary: '#FF6B35',       // Saffron — same across themes
  primaryLight: '#FFD700',  // Temple Gold — same across themes
  border: '#E8C880',        // Warm gold border
  success: '#2E7D32',       // Deeper green for legibility on cream
  warning: '#E65100',       // Deep saffron — visible on cream
  error: '#C62828',         // Deeper red for legibility on cream
};
