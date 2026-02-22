/**
 * Color Palette
 * Shloka Sadhana - Spiritual Practice Companion
 *
 * Ethnic Indian design language — saffron-forward, temple warmth.
 * Primary family: Saffron Flame — sacred fire, energy, transformation.
 * Background family: Deep Warm Brown — temple sanctum at night, sacred depth.
 * Accent: Temple Gold — divine light, achievement.
 */

export const Colors = {
  // Primary — Saffron Flame (sacred fire)
  primary: '#E55B00',       // Deep Saffron — core action color
  primaryDark: '#C44A00',   // Pressed saffron state
  primaryLight: '#FFD700',  // Temple Gold for highlights

  // Background — Stratified warm browns (temple wood, sanctum depth)
  background: '#1E0E05',    // Darkest sanctum — primary app background
  backgroundLight: '#2A1408', // Warm brown — secondary surfaces
  surface: '#2A1408',       // Card / surface background
  surfaceLight: '#3A1D0D',  // Elevated surface — modals, raised cards
  surfaceElevated: '#3A1D0D', // Explicit elevated alias

  // Text — Warm manuscript tones
  text: '#FFF3E0',          // Warm parchment cream — primary text
  textSecondary: '#FFB74D', // Soft amber — secondary labels, icons
  textTertiary: 'rgba(255, 243, 224, 0.50)', // 50% cream — tertiary
  textDisabled: 'rgba(255, 243, 224, 0.35)', // 35% cream — disabled
  textMeaning: 'rgba(255, 243, 224, 0.9)',   // Slightly muted for English meanings
  sanskrit: '#FFF3E0',      // Sanskrit text — warm cream, letterSpacing 0.5
  transliteration: '#FFB74D', // Transliteration — soft amber italic

  // Semantic
  success: '#4CAF50',
  successDark: '#388E3C',
  error: '#EF4444',
  errorDark: '#C62828',
  warning: '#FFD700',       // Temple Gold doubles as warning
  info: '#7C4DFF',          // Spiritual violet for informational

  // Borders & dividers — soft, breathable
  border: 'rgba(255, 140, 0, 0.15)',      // Subtle warm gold boundary
  borderLight: 'rgba(255, 140, 0, 0.08)', // Ultra-subtle outline
  divider: 'rgba(255, 140, 0, 0.10)',

  // Overlays
  overlay: 'rgba(30, 14, 5, 0.85)',    // Deep brown overlay
  overlayLight: 'rgba(30, 14, 5, 0.55)',

  // Spiritual accent colors
  templeGold: '#FFD700',    // Achievements, mala count label
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
