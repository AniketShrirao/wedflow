/**
 * Design Token Utilities
 * Helper functions for working with design tokens and ensuring accessibility compliance
 */

import { WCAG_CONTRAST_RATIOS, type ContrastRatio } from '@/types/design-tokens';

/**
 * Get CSS custom property value
 */
export function getCSSCustomProperty(property: string): string {
    if (typeof window === 'undefined') return '';
    return getComputedStyle(document.documentElement).getPropertyValue(property).trim();
}

/**
 * Set CSS custom property value
 */
export function setCSSCustomProperty(property: string, value: string): void {
    if (typeof window === 'undefined') return;
    document.documentElement.style.setProperty(property, value);
}

/**
 * Convert hex color to RGB values
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.1 specification
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
 * Returns a value between 1 and 21
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
 * Check if color combination meets WCAG contrast requirements
 */
export function meetsContrastRequirement(
    foreground: string,
    background: string,
    level: 'normal' | 'large' | 'enhanced' = 'normal'
): boolean {
    const ratio = getContrastRatio(foreground, background);
    return ratio >= WCAG_CONTRAST_RATIOS[level];
}

/**
 * Validate color accessibility across all combinations
 */
export function validateColorAccessibility(colors: Record<string, string>): {
    isValid: boolean;
    violations: Array<{
        foreground: string;
        background: string;
        ratio: number;
        required: number;
    }>;
} {
    const violations: Array<{
        foreground: string;
        background: string;
        ratio: number;
        required: number;
    }> = [];

    // Common color combinations to check
    const combinations = [
        { fg: 'text-primary', bg: 'background', level: 'normal' as const },
        { fg: 'text-secondary', bg: 'background', level: 'normal' as const },
        { fg: 'text-inverse', bg: 'interactive-primary', level: 'normal' as const },
        { fg: 'text-inverse', bg: 'interactive-secondary', level: 'normal' as const },
    ];

    combinations.forEach(({ fg, bg, level }) => {
        const fgColor = colors[fg];
        const bgColor = colors[bg];

        if (fgColor && bgColor) {
            const ratio = getContrastRatio(fgColor, bgColor);
            const required = WCAG_CONTRAST_RATIOS[level];

            if (ratio < required) {
                violations.push({
                    foreground: fg,
                    background: bg,
                    ratio,
                    required,
                });
            }
        }
    });

    return {
        isValid: violations.length === 0,
        violations,
    };
}

/**
 * Generate accessible color variations
 */
export function generateAccessibleVariation(
    baseColor: string,
    targetBackground: string,
    targetRatio: number = WCAG_CONTRAST_RATIOS.normal
): string | null {
    const baseRgb = hexToRgb(baseColor);
    const bgRgb = hexToRgb(targetBackground);

    if (!baseRgb || !bgRgb) return null;

    // Simple approach: adjust lightness
    let { r, g, b } = baseRgb;
    const bgLuminance = getRelativeLuminance(bgRgb.r, bgRgb.g, bgRgb.b);

    // Try making it darker or lighter
    for (let adjustment = 0; adjustment <= 255; adjustment += 5) {
        // Try darker first
        const darkerR = Math.max(0, r - adjustment);
        const darkerG = Math.max(0, g - adjustment);
        const darkerB = Math.max(0, b - adjustment);

        const darkerLuminance = getRelativeLuminance(darkerR, darkerG, darkerB);
        const darkerRatio = (Math.max(darkerLuminance, bgLuminance) + 0.05) /
            (Math.min(darkerLuminance, bgLuminance) + 0.05);

        if (darkerRatio >= targetRatio) {
            return `#${darkerR.toString(16).padStart(2, '0')}${darkerG.toString(16).padStart(2, '0')}${darkerB.toString(16).padStart(2, '0')}`;
        }

        // Try lighter
        const lighterR = Math.min(255, r + adjustment);
        const lighterG = Math.min(255, g + adjustment);
        const lighterB = Math.min(255, b + adjustment);

        const lighterLuminance = getRelativeLuminance(lighterR, lighterG, lighterB);
        const lighterRatio = (Math.max(lighterLuminance, bgLuminance) + 0.05) /
            (Math.min(lighterLuminance, bgLuminance) + 0.05);

        if (lighterRatio >= targetRatio) {
            return `#${lighterR.toString(16).padStart(2, '0')}${lighterG.toString(16).padStart(2, '0')}${lighterB.toString(16).padStart(2, '0')}`;
        }
    }

    return null;
}

/**
 * Get responsive spacing value
 */
export function getResponsiveSpacing(
    base: string,
    breakpoints?: { [key: string]: string }
): string {
    if (!breakpoints) return `var(--spacing-${base})`;

    let css = `var(--spacing-${base})`;

    Object.entries(breakpoints).forEach(([breakpoint, value]) => {
        css += `; @media (min-width: var(--breakpoint-${breakpoint})) { var(--spacing-${value}) }`;
    });

    return css;
}

/**
 * Create CSS custom property name
 */
export function createCSSProperty(category: string, name: string, variant?: string): string {
    const parts = ['--', category, name];
    if (variant) parts.push(variant);
    return parts.join('-');
}

/**
 * Validate design token structure
 */
export function validateDesignTokens(tokens: any): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    // Check required categories
    const requiredCategories = ['colors', 'typography', 'spacing', 'shadows', 'borderRadius'];
    requiredCategories.forEach(category => {
        if (!tokens[category]) {
            errors.push(`Missing required category: ${category}`);
        }
    });

    // Check color scales
    if (tokens.colors) {
        const requiredColorScales = ['primary', 'secondary', 'neutral'];
        requiredColorScales.forEach(scale => {
            if (!tokens.colors[scale]) {
                errors.push(`Missing required color scale: ${scale}`);
            } else {
                const requiredShades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
                requiredShades.forEach(shade => {
                    if (!tokens.colors[scale][shade]) {
                        errors.push(`Missing shade ${shade} in ${scale} color scale`);
                    }
                });
            }
        });
    }

    // Check typography
    if (tokens.typography) {
        if (!tokens.typography.fontFamilies) {
            errors.push('Missing typography.fontFamilies');
        }
        if (!tokens.typography.fontSizes) {
            errors.push('Missing typography.fontSizes');
        }
        if (!tokens.typography.fontWeights) {
            errors.push('Missing typography.fontWeights');
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}