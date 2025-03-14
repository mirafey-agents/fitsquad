// Premium design system constants

// Color palette
export const colors = {
  // Primary colors - More sophisticated and premium palette
  primary: {
    dark: '#1E1E2C', // Deep navy/charcoal
    light: '#FFFFFF', // Pure white for cleaner look
  },
  // Accent colors - Refined and elegant
  accent: {
    coral: '#E94E77', // Sophisticated rose
    mint: '#2AB3A6', // Refined teal
  },
  // Supporting colors - Monochromatic scale
  gray: {
    100: '#F8FAFC',
    200: '#EEF2F6',
    300: '#E2E8F0',
    400: '#CBD5E1',
    500: '#94A3B8',
    600: '#64748B',
    700: '#475569',
    800: '#27364B',
    900: '#0F172A',
  },
  // Semantic colors - More subdued and professional
  semantic: {
    success: '#10B981', // Refined green
    warning: '#F59E0B', // Warm amber
    error: '#EF4444', // Bright red
    info: '#3B82F6', // Clear blue
  },
  // Transparent colors - Subtle overlays
  transparent: {
    dark: 'rgba(15, 23, 42, 0.8)',
    light: 'rgba(255, 255, 255, 0.8)',
    coral: 'rgba(233, 78, 119, 0.1)',
    mint: 'rgba(42, 179, 166, 0.1)',
  },
};

// Typography system
export const typography = {
  // Font sizes using a modular scale
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
  },
  // Font weights
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  // Line heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Spacing system
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
  '4xl': 64,
};

// Border radius
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Shadows - Enhanced for a more premium look
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Animation durations
export const animation = {
  fast: 100,
  normal: 200,
  slow: 300,
};

// Z-index
export const zIndex = {
  base: 0,
  elevated: 10,
  dropdown: 20,
  sticky: 30,
  drawer: 40,
  modal: 50,
  toast: 60,
};

// Screen dimensions
export const dimensions = {
  fullWidth: '100%',
  fullHeight: '100%',
  screenWidth: '100%',
  screenHeight: '100%',
};

// Touch targets
export const touchTargets = {
  min: 44,
};