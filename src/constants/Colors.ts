/**
 * Color Palette
 * Shloka Sadhana - Spiritual Practice Companion
 *
 * Ethnic Indian design language — saffron-forward, temple warmth.
 * Primary family: Saffron Flame — sacred fire, energy, transformation.
 * Background family: Warm Parchment — temple manuscript by day.
 * Accent: Temple Gold — divine light, achievement (decorative/glow only).
 */

export const Colors = {
  // Primary — Saffron Flame (sacred fire) — unchanged across themes
  primary: '#E55B00',       // Deep Saffron — core action color
  primaryDark: '#C44A00',   // Pressed saffron state
  primaryLight: '#FF9A2A',  // Lighter saffron for highlights

  // Background — Warm parchment (temple manuscript by day)
  background: '#FFF3E0',       // Warm parchment cream — primary app background
  backgroundLight: '#FFF8E7',  // Lighter cream — subtle background variation
  surface: '#FFF0D5',          // Pale amber — card / surface background
  surfaceLight: '#FFECC8',     // More elevated surface
  surfaceElevated: '#FFE4B5',  // Moccasin — modals, raised cards

  // Text — Deep warm ink (dark on cream)
  text: '#1E0E05',             // Deep dark sanctum brown — primary text
  textBright: '#2A1408',       // Prominent text — slightly lighter than text
  textOnColor: '#FFF8E7',      // Cream label — for use on saffron/colored surfaces (buttons)
  textSecondary: '#7B5E35',    // Warm medium brown — secondary labels, icons
  textTertiary: 'rgba(30, 14, 5, 0.50)',  // 50% dark — tertiary
  textDisabled: 'rgba(30, 14, 5, 0.35)',  // 35% dark — disabled
  textMeaning: 'rgba(30, 14, 5, 0.75)',   // Slightly muted for English meanings
  sanskrit: '#1E0E05',         // Sanskrit text — deep dark ink, letterSpacing 0.5
  transliteration: '#7B5E35',  // Transliteration — warm brown italic

  // Semantic
  success: '#4CAF50',
  successDark: '#388E3C',
  error: '#EF4444',
  errorDark: '#C62828',
  warning: '#E65100',          // Deep saffron — visible on cream
  info: '#7C4DFF',             // Spiritual violet for informational

  // Borders & dividers — warm brown, breathable
  border: 'rgba(139, 90, 43, 0.20)',       // Warm brown boundary
  borderLight: 'rgba(139, 90, 43, 0.10)',  // Ultra-subtle outline
  divider: 'rgba(139, 90, 43, 0.12)',

  // Overlays — cream-based for light theme
  overlay: 'rgba(255, 243, 224, 0.85)',    // Cream overlay
  overlayLight: 'rgba(255, 243, 224, 0.55)',
  scrim: 'rgba(0, 0, 0, 0.50)',            // Modal/dialog dimming layer

  // Spiritual accent colors — decorative/glow only
  templeGold: '#FFD700',    // Achievements, mala count glow (decorative)
  lotusPink: '#E91E8C',     // Special moments, lotus motif
  moonPhase: '#FFE8A3',     // Moon / calendar elements
  glowGold: 'rgba(255, 215, 0, 0.8)', // Gold text-shadow for sacred number glow

  // Gradient — Saffron Flame (left → right, warm to deep)
  gradientStart: '#FF9A2A',
  gradientEnd: '#E55B00',
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
