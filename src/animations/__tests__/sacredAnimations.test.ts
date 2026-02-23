/**
 * sacredAnimations Tests
 * Shloka Sadhana — Sacred animation constants and helpers
 */

import { AccessibilityInfo } from 'react-native';
import {
  checkReducedMotion,
  EASE_OUT_CUBIC,
  EASE_OUT_QUINT,
  DIYA_DURATION,
  PRESS_DURATION,
  SCREEN_ENTRY_DURATION,
  RING_DURATION,
  PARTICLE_DURATION,
  PARTICLE_DELAY,
  PARTICLE_DISTANCE,
} from '../sacredAnimations';

// Spy on AccessibilityInfo rather than mocking all of react-native
// (jest.requireActual('react-native') triggers TurboModule errors in Expo Go Jest)
beforeEach(() => {
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('checkReducedMotion', () => {
  it('should return a Promise', () => {
    const result = checkReducedMotion();
    expect(result).toBeInstanceOf(Promise);
  });

  it('should resolve to a boolean', async () => {
    const result = await checkReducedMotion();
    expect(typeof result).toBe('boolean');
  });

  it('should resolve to false when reduce motion is off', async () => {
    const result = await checkReducedMotion();
    expect(result).toBe(false);
  });
});

describe('Easing Curves', () => {
  it('EASE_OUT_CUBIC should be defined', () => {
    expect(EASE_OUT_CUBIC).toBeDefined();
  });

  it('EASE_OUT_QUINT should be defined', () => {
    expect(EASE_OUT_QUINT).toBeDefined();
  });

  it('EASE_OUT_CUBIC should be a function (Easing.bezier returns a function)', () => {
    expect(typeof EASE_OUT_CUBIC).toBe('function');
  });

  it('EASE_OUT_QUINT should be a function', () => {
    expect(typeof EASE_OUT_QUINT).toBe('function');
  });
});

describe('Timing Constants', () => {
  it('DIYA_DURATION should be 1200ms', () => {
    expect(DIYA_DURATION).toBe(1200);
  });

  it('PRESS_DURATION should be 100ms', () => {
    expect(PRESS_DURATION).toBe(100);
  });

  it('SCREEN_ENTRY_DURATION should be 180ms', () => {
    expect(SCREEN_ENTRY_DURATION).toBe(180);
  });

  it('RING_DURATION should be 800ms', () => {
    expect(RING_DURATION).toBe(800);
  });

  it('PARTICLE_DURATION should be 720ms', () => {
    expect(PARTICLE_DURATION).toBe(720);
  });

  it('PARTICLE_DELAY should be 80ms', () => {
    expect(PARTICLE_DELAY).toBe(80);
  });

  it('PARTICLE_DISTANCE should be 48', () => {
    expect(PARTICLE_DISTANCE).toBe(48);
  });

  it('DIYA_DURATION should be the longest animation (slowest, flame-like)', () => {
    expect(DIYA_DURATION).toBeGreaterThan(PRESS_DURATION);
    expect(DIYA_DURATION).toBeGreaterThan(SCREEN_ENTRY_DURATION);
  });

  it('PRESS_DURATION should be the shortest (immediate response)', () => {
    expect(PRESS_DURATION).toBeLessThan(SCREEN_ENTRY_DURATION);
    expect(PRESS_DURATION).toBeLessThan(RING_DURATION);
  });
});
