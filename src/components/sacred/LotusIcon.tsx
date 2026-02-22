/**
 * LotusIcon
 * Shloka Sadhana — Sacred lotus line-art icon
 *
 * A double-ring lotus: 8 outer petals (stroke only) and 8 inner petals
 * (with a whisper of fill), offset by 22.5° to create the classic
 * double-bloom silhouette seen in temple iconography.
 *
 * Use sparingly: empty states, session completion, wisdom detail header.
 * Never more than one per screen.
 */

import React, { memo } from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface LotusIconProps {
  size?: number;
  color?: string;
}

// Petal paths in a 100×100 viewBox centred at (50,50)
// Outer petal: tip reaches (50,20) — radius 30 from center
const OUTER_PETAL = 'M 50 50 C 54.5 46 53.6 35.5 50 20 C 46.4 35.5 45.5 46 50 50 Z';

// Inner petal: tip reaches (50,33) — radius 17 from center, offset by 22.5°
const INNER_PETAL = 'M 50 50 C 52.5 47.5 52 41 50 33 C 48 41 47.5 47.5 50 50 Z';

const OUTER_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];
const INNER_ANGLES = [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5];

export const LotusIcon = memo(({ size = 56, color = '#D4AF37' }: LotusIconProps) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      accessibilityLabel="Lotus"
      accessibilityRole="image"
    >
      {/* Inner petals — slightly filled, lower opacity, rotated 22.5° offset */}
      {INNER_ANGLES.map((angle) => (
        <Path
          key={`ip${angle}`}
          d={INNER_PETAL}
          fill={color}
          fillOpacity="0.15"
          stroke={color}
          strokeWidth="1"
          opacity="0.5"
          transform={`rotate(${angle}, 50, 50)`}
        />
      ))}

      {/* Outer petals — stroke only, full presence */}
      {OUTER_ANGLES.map((angle) => (
        <Path
          key={`op${angle}`}
          d={OUTER_PETAL}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          opacity="0.85"
          transform={`rotate(${angle}, 50, 50)`}
        />
      ))}

      {/* Centre dot */}
      <Circle cx="50" cy="50" r="3" fill={color} opacity="0.9" />
    </Svg>
  );
});
