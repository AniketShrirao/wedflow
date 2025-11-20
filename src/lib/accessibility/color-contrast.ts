/**
 * Color Contrast Validation Utilities
 * Provides functions for validating WCAG color contrast requirements
 */

import { WCAG_CONTRAST_RATIOS } from '@/types/design-tokens';

export interface ColorContrastResult {
    ratio: number;
    level: 'AA' | 'AAA' | 'fail';
    isLargeText: boolean;
    passes: {
        AA: boolean;
        AAA: boolean;
    };
}

export interface ColorAnalysis {
    hex: string;
    rgb: { r: number; g: number; b: number };
    hsl: { h: number; s: number; l: number };
    luminance: number;
    isLight: boolean;
}

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    // Remove # if present
    hex = hex.replace('#', '');

    // Handle 3-digit hex
    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
    }

    if (hex.length !== 6) return null;

    const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

/**
 * Calculate relative luminance according to WCAG 2.1
 */
export function getRelativeLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);

    if (!rgb1 || !rgb2) return 1;

    const l1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
    const l2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Analyze color contrast between foreground and background
 */
export function analyzeColorContrast(
    foreground: string,
    background: string,
    isLargeText: boolean = false
): ColorContrastResult {
    const ratio = getContrastRatio(foreground, background);

    const normalThreshold = WCAG_CONTRAST_RATIOS.normal; // 4.5:1
    const largeThreshold = WCAG_CONTRAST_RATIOS.large;   // 3:1
    const enhancedThreshold = WCAG_CONTRAST_RATIOS.enhanced; // 7:1

    const requiredRatio = isLargeText ? largeThreshold : normalThreshold;
    const enhancedRequiredRatio = isLargeText ? normalThreshold : enhancedThreshold;

    const passesAA = ratio >= requiredRatio;
    const passesAAA = ratio >= enhancedRequiredRatio;

    let level: 'AA' | 'AAA' | 'fail' = 'fail';
    if (passesAAA) {
        level = 'AAA';
    } else if (passesAA) {
        level = 'AA';
    }

    return {
        ratio: Math.round(ratio * 100) / 100,
        level,
        isLargeText,
        passes: {
            AA: passesAA,
            AAA: passesAAA,
        },
    };
}

/**
 * Analyze a single color
 */
export function analyzeColor(hex: string): ColorAnalysis | null {
    const rgb = hexToRgb(hex);
    if (!rgb) return null;

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const luminance = getRelativeLuminance(rgb.r, rgb.g, rgb.b);
    const isLight = luminance > 0.5;

    return {
        hex: hex.startsWith('#') ? hex : `#${hex}`,
        rgb,
        hsl,
        luminance,
        isLight,
    };
}

/**
 * Find the best contrasting color from a palette
 */
export function findBestContrast(
    background: string,
    palette: string[],
    isLargeText: boolean = false
): { color: string; ratio: number } | null {
    let bestColor = null;
    let bestRatio = 0;

    for (const color of palette) {
        const ratio = getContrastRatio(color, background);
        if (ratio > bestRatio) {
            bestRatio = ratio;
            bestColor = color;
        }
    }

    if (!bestColor) return null;

    const requiredRatio = isLargeText ? WCAG_CONTRAST_RATIOS.large : WCAG_CONTRAST_RATIOS.normal;

    return bestRatio >= requiredRatio ? { color: bestColor, ratio: bestRatio } : null;
}

/**
 * Generate accessible color variations
 */
export function generateAccessibleVariations(
    baseColor: string,
    targetBackground: string,
    isLargeText: boolean = false
): string[] {
    const variations: string[] = [];
    const rgb = hexToRgb(baseColor);

    if (!rgb) return variations;

    const requiredRatio = isLargeText ? WCAG_CONTRAST_RATIOS.large : WCAG_CONTRAST_RATIOS.normal;

    // Try different lightness adjustments
    for (let adjustment = -100; adjustment <= 100; adjustment += 10) {
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        const newL = Math.max(0, Math.min(100, hsl.l + adjustment));

        // Convert back to RGB (simplified)
        const newRgb = hslToRgb(hsl.h, hsl.s, newL);
        const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);

        const ratio = getContrastRatio(newHex, targetBackground);
        if (ratio >= requiredRatio) {
            variations.push(newHex);
        }
    }

    return [...new Set(variations)]; // Remove duplicates
}

/**
 * Convert HSL to RGB
 */
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
    h /= 360;
    s /= 100;
    l /= 100;

    const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    };

    let r, g, b;

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

/**
 * Convert RGB to hex
 */
function rgbToHex(r: number, g: number, b: number): string {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Validate color palette accessibility
 */
export function validateColorPalette(
    colors: Record<string, string>,
    combinations: Array<{ foreground: string; background: string; isLargeText?: boolean }>
): {
    isValid: boolean;
    results: Array<{
        foreground: string;
        background: string;
        result: ColorContrastResult;
    }>;
    violations: Array<{
        foreground: string;
        background: string;
        result: ColorContrastResult;
    }>;
} {
    const results: Array<{
        foreground: string;
        background: string;
        result: ColorContrastResult;
    }> = [];

    const violations: Array<{
        foreground: string;
        background: string;
        result: ColorContrastResult;
    }> = [];

    for (const { foreground, background, isLargeText = false } of combinations) {
        const fgColor = colors[foreground];
        const bgColor = colors[background];

        if (fgColor && bgColor) {
            const result = analyzeColorContrast(fgColor, bgColor, isLargeText);

            const entry = { foreground, background, result };
            results.push(entry);

            if (!result.passes.AA) {
                violations.push(entry);
            }
        }
    }

    return {
        isValid: violations.length === 0,
        results,
        violations,
    };
}