/**
 * DiyaGlow
 * Shloka Sadhana — Ambient diya (oil lamp) radial glow
 *
 * Simulates the warm aura of an oil lamp placed just below the visible frame —
 * light rising upward. Uses SVG RadialGradient: a true radial emanation from
 * a focal point cannot be achieved with LinearGradient.
 *
 * The gradient origin sits at the bottom-center of the 220px tall element,
 * creating the illusion of a diya flame rising from beneath the screen edge.
 *
 * Intensity animates via RN Animated (opacity on the wrapper View, which runs
 * on the native composited layer via useNativeDriver: true).
 */

import React, { memo, useEffect, useRef } from 'react';
import { StyleSheet, Animated } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { DIYA_DURATION, EASE_OUT_CUBIC } from '@/animations/sacredAnimations';

export type DiyaIntensity = 'idle' | 'active' | 'paused';

interface DiyaGlowProps {
  intensity?: DiyaIntensity;
  reducedMotion?: boolean;
}

const INTENSITY_MAP: Record<DiyaIntensity, number> = {
  idle: 0.05,
  active: 0.12,
  paused: 0.07,
};

export const DiyaGlow = memo(({ intensity = 'idle', reducedMotion = false }: DiyaGlowProps) => {
  const opacityAnim = useRef(new Animated.Value(INTENSITY_MAP.idle)).current;

  useEffect(() => {
    const target = INTENSITY_MAP[intensity];
    if (reducedMotion) {
      opacityAnim.setValue(target);
      return;
    }
    Animated.timing(opacityAnim, {
      toValue: target,
      duration: DIYA_DURATION,
      easing: EASE_OUT_CUBIC,
      useNativeDriver: true,
    }).start();
  }, [intensity, reducedMotion]);

  return (
    <Animated.View
      style={[styles.container, { opacity: opacityAnim }]}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Svg
        width="100%"
        height="220"
        preserveAspectRatio="none"
      >
        <Defs>
          {/*
            RadialGradient: origin at bottom-center (cy="100%").
            Radiates inward+upward, like a lamp flame rising from below.
          */}
          <RadialGradient
            id="diyaGradient"
            cx="50%"
            cy="100%"
            r="80%"
            fx="50%"
            fy="100%"
          >
            <Stop offset="0%" stopColor="#FFD700" stopOpacity="1" />
            <Stop offset="20%" stopColor="#FF9A2A" stopOpacity="0.9" />
            <Stop offset="50%" stopColor="#E55B00" stopOpacity="0.45" />
            <Stop offset="80%" stopColor="#C24B00" stopOpacity="0.15" />
            <Stop offset="100%" stopColor="#1E0E05" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="220" fill="url(#diyaGradient)" />
      </Svg>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    height: 220,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 0,
  },
});
