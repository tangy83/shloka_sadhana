/**
 * MandalaBackground
 * Shloka Sadhana — Sacred geometric mandala overlay
 *
 * A yantra-inspired composition: concentric circles, overlapping rotated squares,
 * radiating lines, and an inner petal ring. Drawn in temple gold at opacity 0.05
 * so it reads as architectural texture, not decoration.
 *
 * Static only. Never animated. Never inside a ScrollView.
 * Memoized — renders once and never again.
 */

import React, { memo } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Svg, { Circle, Line, Polygon, Ellipse, G } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 120% of screen width so geometry fills edge-to-edge even on narrow phones
const SVG_SIZE = SCREEN_WIDTH * 1.2;
const SVG_OFFSET = -(SVG_SIZE - SCREEN_WIDTH) / 2;

const CX = 200;
const CY = 200;
const STROKE = '#D4AF37';

// 16 radiating lines, every 22.5° — precomputed at module load
const RADIANT_LINES = Array.from({ length: 16 }, (_, i) => {
  const rad = (i * 22.5 * Math.PI) / 180;
  return {
    x2: CX + 192 * Math.cos(rad),
    y2: CY + 192 * Math.sin(rad),
  };
});

// 8 inner petals (ellipses) at r=60, every 45° — each rotated to point outward
const PETAL_POSITIONS = Array.from({ length: 8 }, (_, i) => {
  const deg = i * 45;
  const rad = (deg * Math.PI) / 180;
  return {
    cx: CX + 60 * Math.cos(rad),
    cy: CY + 60 * Math.sin(rad),
    rotate: deg,
  };
});

export const MandalaBackground = memo(() => {
  return (
    <View
      style={styles.container}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Svg
        width={SVG_SIZE}
        height={SVG_SIZE}
        viewBox="0 0 400 400"
      >
        {/* Layer 1: Concentric circles — the rings of a mala */}
        {[40, 80, 120, 160, 192].map((r) => (
          <Circle
            key={`c${r}`}
            cx={CX}
            cy={CY}
            r={r}
            fill="none"
            stroke={STROKE}
            strokeWidth="1"
          />
        ))}

        {/* Layer 2: Overlapping rotated squares — yantra geometry */}
        {[0, 22.5, 45].map((rot) => (
          <Polygon
            key={`sq${rot}`}
            points="110,110 290,110 290,290 110,290"
            fill="none"
            stroke={STROKE}
            strokeWidth="1"
            transform={`rotate(${rot}, ${CX}, ${CY})`}
          />
        ))}

        {/* Layer 3: Radiating lines — like light from a lamp */}
        <G opacity="0.6">
          {RADIANT_LINES.map((pt, i) => (
            <Line
              key={`l${i}`}
              x1={CX}
              y1={CY}
              x2={pt.x2}
              y2={pt.y2}
              stroke={STROKE}
              strokeWidth="0.75"
            />
          ))}
        </G>

        {/* Layer 4: Inner petal ring — the lotus at the centre */}
        {PETAL_POSITIONS.map((p, i) => (
          <Ellipse
            key={`p${i}`}
            cx={p.cx}
            cy={p.cy}
            rx="8"
            ry="18"
            fill="none"
            stroke={STROKE}
            strokeWidth="1"
            transform={`rotate(${p.rotate}, ${p.cx}, ${p.cy})`}
          />
        ))}

        {/* Centre point */}
        <Circle cx={CX} cy={CY} r="4" fill={STROKE} />
      </Svg>
    </View>
  );
});
MandalaBackground.displayName = 'MandalaBackground';

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    left: SVG_OFFSET,
    opacity: 0.08,
    overflow: 'hidden',
    zIndex: -1,
  },
});
