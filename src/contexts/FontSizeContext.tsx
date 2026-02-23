/**
 * FontSizeContext
 * Shloka Sadhana - Font Size Management
 *
 * Promotes useFontSize hook to a React context so font scale is
 * available app-wide without prop drilling or duplicate storage reads.
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useFontSize } from '@/hooks/useFontSize';

interface FontSizeContextType {
  fontScale: number;
  setFontScale: (v: number) => void;
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

export const FontSizeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { fontSize: fontScale, setFontSize: setFontScale } = useFontSize();

  return (
    <FontSizeContext.Provider value={{ fontScale, setFontScale }}>
      {children}
    </FontSizeContext.Provider>
  );
};

export const useFontScale = (): FontSizeContextType => {
  const context = useContext(FontSizeContext);
  if (!context) {
    // Fallback for tests or SSR — returns neutral scale
    return { fontScale: 1.0, setFontScale: () => {} };
  }
  return context;
};
