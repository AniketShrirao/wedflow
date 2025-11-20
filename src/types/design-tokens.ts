/**
 * Design Token Type Definitions
 * Provides type safety for design token usage throughout the application
 */

export interface ColorScale {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string; // Base color
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
}

export interface SemanticColors {
    success: ColorScale;
    warning: ColorScale;
    error: ColorScale;
    info: ColorScale;
}

export interface DesignTokens {
    colors: {
        primary: ColorScale;
        secondary: ColorScale;
        accent: ColorScale;
        neutral: ColorScale;
        semantic: SemanticColors;
    };
    typography: {
        fontFamilies: {
            heading: string;
            body: string;
            mono: string;
        };
        fontSizes: {
            xs: string;
            sm: string;
            base: string;
            lg: string;
            xl: string;
            '2xl': string;
            '3xl': string;
            '4xl': string;
            '5xl': string;
            '6xl': string;
            '7xl': string;
            '8xl': string;
            '9xl': string;
        };
        fontWeights: {
            thin: number;
            extralight: number;
            light: number;
            normal: number;
            medium: number;
            semibold: number;
            bold: number;
            extrabold: number;
            black: number;
        };
        lineHeights: {
            none: number;
            tight: number;
            snug: number;
            normal: number;
            relaxed: number;
            loose: number;
        };
    };
    spacing: {
        [key: string]: string;
    };
    shadows: {
        xs: string;
        sm: string;
        base: string;
        md: string;
        lg: string;
        xl: string;
        '2xl': string;
        inner: string;
    };
    borderRadius: {
        none: string;
        sm: string;
        base: string;
        md: string;
        lg: string;
        xl: string;
        '2xl': string;
        '3xl': string;
        full: string;
    };
    zIndex: {
        hide: number;
        auto: string;
        base: number;
        docked: number;
        dropdown: number;
        sticky: number;
        banner: number;
        overlay: number;
        modal: number;
        popover: number;
        skiplink: number;
        toast: number;
        tooltip: number;
    };
    breakpoints: {
        xs: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
        '2xl': string;
    };
    animation: {
        duration: {
            75: string;
            100: string;
            150: string;
            200: string;
            300: string;
            500: string;
            700: string;
            1000: string;
        };
        easing: {
            linear: string;
            in: string;
            out: string;
            inOut: string;
        };
    };
}

export interface ThemeColors {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: {
        primary: string;
        secondary: string;
        tertiary: string;
        disabled: string;
        inverse: string;
    };
    border: {
        primary: string;
        secondary: string;
        focus: string;
    };
    interactive: {
        primary: string;
        primaryHover: string;
        primaryActive: string;
        secondary: string;
        secondaryHover: string;
        secondaryActive: string;
    };
}

export interface AccessibilityConfig {
    announcements: boolean;
    reducedMotion: boolean;
    highContrast: boolean;
    focusVisible: boolean;
    screenReaderOptimizations: boolean;
}

export interface ContrastRatio {
    normal: number; // 4.5:1 for WCAG AA
    large: number;  // 3:1 for WCAG AA large text
    enhanced: number; // 7:1 for WCAG AAA
}

export const WCAG_CONTRAST_RATIOS: ContrastRatio = {
    normal: 4.5,
    large: 3.0,
    enhanced: 7.0,
} as const;

export type ColorToken = keyof ColorScale;
export type SpacingToken = keyof DesignTokens['spacing'];
export type FontSizeToken = keyof DesignTokens['typography']['fontSizes'];
export type FontWeightToken = keyof DesignTokens['typography']['fontWeights'];
export type ShadowToken = keyof DesignTokens['shadows'];
export type RadiusToken = keyof DesignTokens['borderRadius'];
export type BreakpointToken = keyof DesignTokens['breakpoints'];