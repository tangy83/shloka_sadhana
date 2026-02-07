/**
 * Color Palette
 * Shloka Sadhana - Spiritual Practice Companion
 *
 * Design: Dark theme with warm, spiritual colors
 * Inspired by sacred fire, moonlight, and ancient manuscripts
 */

export const Colors = {
  // Primary colors (spiritual fire/flame)
  primary: '#E87E04', // Orange - sacred fire, energy, transformation
  primaryDark: '#B45309', // Darker orange for pressed states
  primaryLight: '#FBBF24', // Lighter orange for highlights

  // Background colors (dark, meditative)
  background: '#1a1a2e', // Deep blue-gray - night sky, meditation
  backgroundLight: '#16213e', // Slightly lighter for elevated surfaces
  surface: '#0f3460', // Card/surface background
  surfaceLight: '#16213e', // Lighter surface for emphasis

  // Text colors (manuscript, ancient text)
  text: '#E8D5B7', // Cream/beige - ancient manuscript
  textSecondary: 'rgba(232, 213, 183, 0.7)', // 70% opacity
  textTertiary: 'rgba(232, 213, 183, 0.5)', // 50% opacity
  textDisabled: 'rgba(232, 213, 183, 0.38)', // 38% opacity

  // Semantic colors
  success: '#10B981', // Green - streak achievement, completion
  successDark: '#059669', // Darker green for pressed states
  error: '#EF4444', // Red - errors, warnings
  errorDark: '#DC2626',
  warning: '#F59E0B', // Amber - caution
  info: '#3B82F6', // Blue - informational

  // Borders & dividers
  border: 'rgba(232, 213, 183, 0.1)', // 10% opacity for subtle borders
  borderLight: 'rgba(232, 213, 183, 0.05)', // 5% opacity for very subtle
  divider: 'rgba(232, 213, 183, 0.12)', // 12% opacity for dividers

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.5)', // Modal/drawer backdrop
  overlayLight: 'rgba(0, 0, 0, 0.3)', // Lighter overlay

  // Special colors
  moonPhase: '#FFE8A3', // Golden yellow for moon
  sanskrit: '#F5DEB3', // Wheat color for Sanskrit text
  transliteration: '#D4AF37', // Gold for transliteration

  // Gradient colors (for future use)
  gradientStart: '#E87E04',
  gradientEnd: '#B45309',
} as const;

// Type for color keys
export type ColorKey = keyof typeof Colors;

// Helper to get color with opacity
export const withOpacity = (color: string, opacity: number): string => {
  // If color is hex, convert to rgba
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  // If already rgba, replace opacity
  if (color.startsWith('rgba')) {
    return color.replace(/[\d.]+\)$/g, `${opacity})`);
  }
  return color;
};
