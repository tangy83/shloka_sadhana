/**
 * Color Palette
 * Shloka Sadhana - Spiritual Practice Companion
 *
 * Ethnic Indian design language.
 * Primary family: Saffron — sacred fire, energy, transformation.
 * Background family: Deep Indigo — night sky, meditative stillness.
 * Accent: Temple Gold — divine light, achievement.
 */

export const Colors = {
  // Primary — Saffron (sacred fire)
  primary: '#FF6B35',       // Saffron — core action color
  primaryDark: '#CC4A18',   // Deeper saffron for pressed states
  primaryLight: '#FFD700',  // Temple Gold for highlights

  // Background — Deep Indigo (meditative space)
  background: '#1A0A2E',    // Deep Indigo — dark mode base
  backgroundLight: '#2D1B4E', // Elevated indigo — secondary surfaces
  surface: '#2D1B4E',       // Card/surface background
  surfaceLight: '#3D2560',  // Lighter surface for emphasis

  // Text — Warm Cream (ancient manuscript)
  text: '#FFF8E7',          // Warm Cream — primary text on dark
  textSecondary: '#C9A96E', // Warm amber — secondary labels
  textTertiary: 'rgba(255, 248, 231, 0.5)', // 50% cream — tertiary
  textDisabled: 'rgba(255, 248, 231, 0.35)', // 35% cream — disabled

  // Semantic
  success: '#4CAF50',
  successDark: '#388E3C',
  error: '#EF4444',
  errorDark: '#C62828',
  warning: '#FFD700',       // Temple Gold doubles as warning
  info: '#7C4DFF',          // Spiritual violet for informational

  // Borders & dividers
  border: '#3D2560',
  borderLight: 'rgba(201, 169, 110, 0.15)', // Subtle warm gold border
  divider: 'rgba(201, 169, 110, 0.12)',

  // Overlays
  overlay: 'rgba(26, 10, 46, 0.8)',   // Deep Indigo overlay
  overlayLight: 'rgba(26, 10, 46, 0.5)',

  // Spiritual accent colors
  templeGold: '#FFD700',    // Achievements, mala count label
  lotusPink: '#E91E8C',     // Special moments, lotus motif
  moonPhase: '#FFE8A3',     // Moon/calendar elements
  sanskrit: '#FFF8E7',      // Sanskrit text — warm cream, slightly larger
  transliteration: '#C9A96E', // Transliteration — warm amber

  // Gradient (saffron flame)
  gradientStart: '#FF6B35',
  gradientEnd: '#CC4A18',
} as const;

export type ColorKey = keyof typeof Colors;

export const withOpacity = (color: string, opacity: number): string => {
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  if (color.startsWith('rgba')) {
    return color.replace(/[\d.]+\)$/g, `${opacity})`);
  }
  return color;
};
