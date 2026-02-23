/**
 * AppText — Text primitive
 * Shloka Sadhana
 *
 * Drop-in replacement for RN's <Text>. Kept as a named export so all
 * theme-color style arrays across the app continue to work unchanged.
 */

import React from 'react';
import { Text, TextProps } from 'react-native';

export const AppText: React.FC<TextProps> = (props) => <Text {...props} />;
