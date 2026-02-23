/**
 * sacredAnimations.ts
 * Shloka Sadhana — Sacred animation helpers (RN Animated API)
 *
 * Uses React Native's built-in Animated API with useNativeDriver: true
 * throughout — no third-party animation runtime needed, no Expo Go
 * version-mismatch risk.
 *
 * Motion philosophy: A diya flame. A temple bell vibration. A breath.
 */

import { Easing } from 'react-native';
import { AccessibilityInfo } from 'react-native';

// ─── Reduced Motion Guard ──────────────────────────────────────────────────

/**
 * checkReducedMotion
 * Resolves to true when the OS "Reduce Motion" accessibility setting is on.
 * Call once on component mount; store result in local state.
 */
export const checkReducedMotion = (): Promise<boolean> => {
  return AccessibilityInfo.isReduceMotionEnabled();
};

// ─── Shared Easing Curves ──────────────────────────────────────────────────

/** easeOutCubic — used for screen transitions and diya glow */
export const EASE_OUT_CUBIC = Easing.bezier(0.25, 0.46, 0.45, 0.94);

/** easeOutQuint — used for ring expansion */
export const EASE_OUT_QUINT = Easing.out(Easing.poly(5));

// ─── Shared Timing Configs ─────────────────────────────────────────────────

/** Diya glow intensity transition — slow, like a flame settling */
export const DIYA_DURATION = 1200;

/** Press animation */
export const PRESS_DURATION = 100;

/** Screen entry */
export const SCREEN_ENTRY_DURATION = 180;

/** Mala ring expansion */
export const RING_DURATION = 800;

/** Particle travel */
export const PARTICLE_DURATION = 720;
export const PARTICLE_DELAY = 80;
export const PARTICLE_DISTANCE = 48;
