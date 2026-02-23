/**
 * TrishulIcon
 * Shloka Sadhana — Sacred trishul (trident) line-art icon
 *
 * The divine trident of Shiva: three prongs, a cross-bar, a vertical shaft,
 * and a small base knob. The side prongs carry a subtle bezier curve —
 * distinguishing this from a garden fork and giving it the organic quality
 * of a hand-forged sacred weapon.
 *
 * Use only as a single accent: Ekadashi screen, deity-associated shloka details.
 * Maximum size: 32px.
 */

import React, { memo } from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface TrishulIconProps {
  size?: number;
  color?: string;
}

// Trishul geometry in a 32×32 viewBox
const TRISHUL_PATH = [
  'M 16 26 L 16 12',       // shaft
  'M 10 14 L 22 14',       // cross-bar
  'M 16 12 L 16 4',        // centre prong (tallest)
  'M 16 12 C 16 10 11 9 9 6 L 8 4',   // left prong — slight inward curve
  'M 16 12 C 16 10 21 9 23 6 L 24 4', // right prong — mirror
].join(' ');

export const TrishulIcon = memo(({ size = 32, color = '#D4AF37' }: TrishulIconProps) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      accessibilityLabel="Trishul"
      accessibilityRole="image"
    >
      <Path
        d={TRISHUL_PATH}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Base knob — a small filled circle at the foot of the shaft */}
      <Circle
        cx="16"
        cy="26"
        r="2.5"
        fill={color}
        fillOpacity="0.5"
        stroke={color}
        strokeWidth="0.75"
      />
    </Svg>
  );
});
TrishulIcon.displayName = 'TrishulIcon';
