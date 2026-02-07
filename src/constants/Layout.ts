/**
 * Layout Constants
 * Shloka Sadhana - Spiritual Practice Companion
 *
 * Design system values for consistent spacing, sizing, and responsive layouts
 * Based on 8pt grid system for harmonious proportions
 */

import { Dimensions, Platform } from 'react-native';

// ============================================================================
// Screen Dimensions
// ============================================================================

const window = Dimensions.get('window');
const screen = Dimensions.get('screen');

export const Layout = {
  window: {
    width: window.width,
    height: window.height,
  },
  screen: {
    width: screen.width,
    height: screen.height,
  },
  isSmallDevice: window.width < 375,
  isMediumDevice: window.width >= 375 && window.width < 414,
  isLargeDevice: window.width >= 414,
} as const;

// ============================================================================
// Spacing (8pt grid system)
// ============================================================================

export const Spacing = {
  xs: 4, // 4pt - Minimal spacing
  sm: 8, // 8pt - Small spacing
  md: 16, // 16pt - Medium spacing (default)
  lg: 24, // 24pt - Large spacing
  xl: 32, // 32pt - Extra large spacing
  xxl: 48, // 48pt - Extra extra large spacing
  xxxl: 64, // 64pt - Maximum spacing
} as const;

// ============================================================================
// Border Radius (rounded corners)
// ============================================================================

export const BorderRadius = {
  xs: 4, // Small radius - subtle rounding
  sm: 8, // Small-medium radius - buttons, inputs
  md: 12, // Medium radius - cards, containers
  lg: 16, // Large radius - prominent cards
  xl: 24, // Extra large radius - modals, sheets
  round: 9999, // Fully rounded - pills, avatar
} as const;

// ============================================================================
// Icon Sizes
// ============================================================================

export const IconSize = {
  xs: 16, // Extra small - inline icons
  sm: 20, // Small - list icons
  md: 24, // Medium - tab bar icons
  lg: 32, // Large - header icons
  xl: 48, // Extra large - feature icons
  xxl: 64, // Extra extra large - empty states
  xxxl: 96, // Maximum - splash, onboarding
} as const;

// ============================================================================
// Font Sizes (type scale)
// ============================================================================

export const FontSize = {
  xs: 12, // Caption, helper text
  sm: 14, // Body small, labels
  md: 16, // Body default
  lg: 18, // Body large, subheadings
  xl: 20, // H4
  xxl: 24, // H3
  xxxl: 28, // H2
  display: 34, // H1, display text
  hero: 48, // Hero text, splash
} as const;

// ============================================================================
// Touch Targets (iOS HIG: 44pt minimum)
// ============================================================================

export const TouchTarget = {
  min: 44, // Minimum touch target size (iOS HIG)
  comfortable: 48, // Comfortable touch target
  large: 56, // Large touch target (primary actions)
} as const;

// ============================================================================
// Container Widths (max widths for content)
// ============================================================================

export const Container = {
  sm: 320, // Small container - modals
  md: 480, // Medium container - forms
  lg: 640, // Large container - content
  xl: 768, // Extra large - tablets
} as const;

// ============================================================================
// Z-Index Layers (stacking order)
// ============================================================================

export const ZIndex = {
  base: 0, // Base content
  dropdown: 1000, // Dropdowns
  sticky: 1020, // Sticky headers
  fixed: 1030, // Fixed elements
  overlay: 1040, // Overlays, backdrops
  modal: 1050, // Modals
  popover: 1060, // Popovers, tooltips
  toast: 1070, // Toast notifications
} as const;

// ============================================================================
// Animation Durations (in milliseconds)
// ============================================================================

export const Duration = {
  fast: 150, // Fast animations - micro-interactions
  normal: 250, // Normal animations - default
  slow: 350, // Slow animations - page transitions
  slowest: 500, // Slowest animations - emphasis
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Scale value based on device width
 * Useful for responsive sizing
 */
export const scale = (size: number): number => {
  const baseWidth = 375; // iPhone X/11/12/13/14 base width
  return (Layout.window.width / baseWidth) * size;
};

/**
 * Scale value with max limit
 * Prevents over-scaling on large devices
 */
export const scaleModerate = (size: number, factor: number = 0.5): number => {
  return size + (scale(size) - size) * factor;
};

/**
 * Scale value for vertical spacing
 * Based on screen height
 */
export const verticalScale = (size: number): number => {
  const baseHeight = 812; // iPhone X/11 Pro base height
  return (Layout.window.height / baseHeight) * size;
};

/**
 * Check if device is iOS
 */
export const isIOS = Platform.OS === 'ios';

/**
 * Check if device is Android
 */
export const isAndroid = Platform.OS === 'android';

/**
 * Get safe padding for iOS notch/home indicator
 */
export const getSafeAreaPadding = () => ({
  top: isIOS ? 44 : 0, // Status bar + notch
  bottom: isIOS ? 34 : 0, // Home indicator
});

/**
 * Get platform-specific shadow
 */
export const getShadow = (elevation: number = 4) => {
  if (isIOS) {
    return {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: elevation / 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: elevation,
    };
  }
  return {
    elevation,
  };
};

// ============================================================================
// Export all constants
// ============================================================================

export default {
  Layout,
  Spacing,
  BorderRadius,
  IconSize,
  FontSize,
  TouchTarget,
  Container,
  ZIndex,
  Duration,
  scale,
  scaleModerate,
  verticalScale,
  isIOS,
  isAndroid,
  getSafeAreaPadding,
  getShadow,
};
