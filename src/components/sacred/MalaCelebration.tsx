/**
 * MalaCelebration
 * Shloka Sadhana — Mala completion celebration overlay
 *
 * Three gold ember sparks rise from the centre, like embers lifting off a diya flame.
 * A gold ring expands outward and fades — like a temple bell's vibration in the air.
 * Heavy haptic grounds the moment.
 *
 * This is not confetti. This is not celebration in the modern sense.
 * This is an acknowledgement — brief, dignified, gold.
 *
 * Uses RN Animated with useNativeDriver: true throughout:
 * all transforms and opacity run on the native composited layer.
 */

import React, { memo, useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  EASE_OUT_QUINT,
  PARTICLE_DISTANCE,
  PARTICLE_DELAY,
  PARTICLE_DURATION,
  RING_DURATION,
} from '@/animations/sacredAnimations';

interface MalaCelebrationProps {
  active: boolean;
  reducedMotion?: boolean;
}

export const MalaCelebration = memo(({ active, reducedMotion = false }: MalaCelebrationProps) => {
  // Ring
  const ringScale = useRef(new Animated.Value(0)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;

  // Particle 0 — straight up
  const p0y = useRef(new Animated.Value(0)).current;
  const p0op = useRef(new Animated.Value(0)).current;

  // Particle 1 — up-left
  const p1x = useRef(new Animated.Value(0)).current;
  const p1y = useRef(new Animated.Value(0)).current;
  const p1op = useRef(new Animated.Value(0)).current;

  // Particle 2 — up-right
  const p2x = useRef(new Animated.Value(0)).current;
  const p2y = useRef(new Animated.Value(0)).current;
  const p2op = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) return;

    // Heavy haptic — the moment of completion deserves to be felt
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Reset all values to start position
    ringScale.setValue(0);
    ringOpacity.setValue(1);
    p0y.setValue(0); p0op.setValue(0);
    p1x.setValue(0); p1y.setValue(0); p1op.setValue(0);
    p2x.setValue(0); p2y.setValue(0); p2op.setValue(0);

    if (reducedMotion) return; // Haptic only — respect user preference

    const hDist = PARTICLE_DISTANCE * 0.7; // horizontal travel for angled particles

    Animated.parallel([
      // ── Ring expand and fade ──
      Animated.timing(ringScale, {
        toValue: 1.5,
        duration: RING_DURATION,
        easing: EASE_OUT_QUINT,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(100),
        Animated.timing(ringOpacity, {
          toValue: 0,
          duration: 700,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),

      // ── Particle 0: straight up ──
      Animated.sequence([
        Animated.delay(PARTICLE_DELAY),
        Animated.timing(p0y, {
          toValue: -PARTICLE_DISTANCE,
          duration: PARTICLE_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(PARTICLE_DELAY),
        Animated.timing(p0op, { toValue: 1, duration: 80, useNativeDriver: true }),
        Animated.timing(p0op, { toValue: 0, duration: 640, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]),

      // ── Particle 1: up-left ──
      Animated.sequence([
        Animated.delay(PARTICLE_DELAY),
        Animated.timing(p1x, {
          toValue: -hDist,
          duration: PARTICLE_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(PARTICLE_DELAY),
        Animated.timing(p1y, {
          toValue: -PARTICLE_DISTANCE,
          duration: PARTICLE_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(PARTICLE_DELAY),
        Animated.timing(p1op, { toValue: 1, duration: 80, useNativeDriver: true }),
        Animated.timing(p1op, { toValue: 0, duration: 640, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]),

      // ── Particle 2: up-right ──
      Animated.sequence([
        Animated.delay(PARTICLE_DELAY),
        Animated.timing(p2x, {
          toValue: hDist,
          duration: PARTICLE_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(PARTICLE_DELAY),
        Animated.timing(p2y, {
          toValue: -PARTICLE_DISTANCE,
          duration: PARTICLE_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(PARTICLE_DELAY),
        Animated.timing(p2op, { toValue: 1, duration: 80, useNativeDriver: true }),
        Animated.timing(p2op, { toValue: 0, duration: 640, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]),
    ]).start();
  }, [active]);

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Expanding gold ring */}
      <Animated.View
        style={[
          styles.ring,
          {
            opacity: ringOpacity,
            transform: [{ scale: ringScale }],
          },
        ]}
      />

      {/* Ember spark — straight up */}
      <Animated.View
        style={[
          styles.particle,
          {
            opacity: p0op,
            transform: [{ translateY: p0y }],
          },
        ]}
      />

      {/* Ember spark — up-left */}
      <Animated.View
        style={[
          styles.particle,
          {
            opacity: p1op,
            transform: [{ translateX: p1x }, { translateY: p1y }],
          },
        ]}
      />

      {/* Ember spark — up-right */}
      <Animated.View
        style={[
          styles.particle,
          {
            opacity: p2op,
            transform: [{ translateX: p2x }, { translateY: p2y }],
          },
        ]}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 10,
  },
  particle: {
    backgroundColor: '#FFD700',
    borderRadius: 4,
    height: 8,
    position: 'absolute',
    width: 8,
  },
  ring: {
    borderColor: '#FFD700',
    borderRadius: 60,
    borderWidth: 2,
    height: 120,
    position: 'absolute',
    width: 120,
  },
});
