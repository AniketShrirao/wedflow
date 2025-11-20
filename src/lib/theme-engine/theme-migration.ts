/**
 * Theme Migration System
 * Handles migration of existing themes to new theme engine format
 */

import { Theme, ThemeColors, ThemeTypography, ThemeLayout } from './theme-engine'
import { getContrastRatio } from '@/lib/accessibility/color-contrast'

/**
 * Legacy theme format (before theme engine enhancement)
 */
export interface LegacyTheme {
    id?: string
    name?: string
    primaryColor?: string
    secondaryColor?: string
    accentColor?: string
    backgroundColor?: string
    headingFont?: string
    bodyFont?: string
    layoutStyle?: string
    headerStyle?: string
}

/**
 * Migration result
 */
export interface MigrationResult {
    success: boolean
    theme?: Theme
    warnings: string[]
    errors: string[]
    changes: string[]
}

/**
 * Default fallback values for migration
 */
const MIGRATION_DEFAULTS = {
    colors: {
        primary: '#8B5A3C',
        secondary: '#F4E4C1',
        accent: '#D4A574',
        background: '#FFFFFF',
    },
    typography: {
        heading: 'Playfair Display, serif',
        body: 'Open Sans, sans-serif',
    },
    layout: {
        style: 'classic' as const,
        headerStyle: 'centered' as const,
    },
}

/**
 * Migrate legacy theme to new format
 */
export function migrateLegacyTheme(legacyTheme: LegacyTheme): MigrationResult {
    const warnings: string[] = []
    const errors: string[] = []
    const changes: string[] = []

    try {
        // Migrate colors
        const colors = migrateColors(legacyTheme, warnings, changes)

        // Migrate typography
        const typography = migrateTypography(legacyTheme, warnings, changes)

        // Migrate layout
        const layout = migrateLayout(legacyTheme, warnings, changes)

        // Create new theme
        const theme: Theme = {
            id: legacyTheme.id || `migrated-${Date.now()}`,
            name: legacyTheme.name || 'Migrated Theme',
            colors,
            typography,
            layout,
        }

        // Validate migrated theme
        validateMigratedTheme(theme, warnings, errors)

        return {
            success: errors.length === 0,
            theme,
            warnings,
            errors,
            changes,
        }
    } catch (error) {
        errors.push(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        return {
            success: false,
            warnings,
            errors,
            changes,
        }
    }
}

/**
 * Migrate color values
 */
function migrateColors(
    legacyTheme: LegacyTheme,
    warnings: string[],
    changes: string[]
): ThemeColors {
    const colors: ThemeColors = {
        primary: legacyTheme.primaryColor || MIGRATION_DEFAULTS.colors.primary,
        secondary: legacyTheme.secondaryColor || MIGRATION_DEFAULTS.colors.secondary,
        accent: legacyTheme.accentColor || MIGRATION_DEFAULTS.colors.accent,
        background: legacyTheme.backgroundColor || MIGRATION_DEFAULTS.colors.background,
    }

    // Validate and normalize color formats
    Object.entries(colors).forEach(([key, value]) => {
        if (!isValidColorFormat(value)) {
            warnings.push(`Invalid color format for ${key}: ${value}. Using default.`)
            colors[key as keyof ThemeColors] = MIGRATION_DEFAULTS.colors[key as keyof typeof MIGRATION_DEFAULTS.colors]
            changes.push(`Replaced invalid ${key} color with default`)
        } else if (!value.startsWith('#')) {
            // Normalize to hex format
            const normalized = normalizeColorToHex(value)
            if (normalized) {
                colors[key as keyof ThemeColors] = normalized
                changes.push(`Normalized ${key} color to hex format`)
            }
        }
    })

    // Check if any defaults were used
    Object.entries(colors).forEach(([key, value]) => {
        if (!legacyTheme[`${key}Color` as keyof LegacyTheme]) {
            changes.push(`Used default value for ${key} color`)
        }
    })

    return colors
}

/**
 * Migrate typography values
 */
function migrateTypography(
    legacyTheme: LegacyTheme,
    warnings: string[],
    changes: string[]
): ThemeTypography {
    const typography: ThemeTypography = {
        heading: legacyTheme.headingFont || MIGRATION_DEFAULTS.typography.heading,
        body: legacyTheme.bodyFont || MIGRATION_DEFAULTS.typography.body,
    }

    // Ensure fonts have fallbacks
    if (!hasFallbackFont(typography.heading)) {
        typography.heading = addFallbackFont(typography.heading, 'serif')
        changes.push('Added fallback font to heading typography')
    }

    if (!hasFallbackFont(typography.body)) {
        typography.body = addFallbackFont(typography.body, 'sans-serif')
        changes.push('Added fallback font to body typography')
    }

    // Check if any defaults were used
    if (!legacyTheme.headingFont) {
        changes.push('Used default value for heading font')
    }
    if (!legacyTheme.bodyFont) {
        changes.push('Used default value for body font')
    }

    return typography
}

/**
 * Migrate layout values
 */
function migrateLayout(
    legacyTheme: LegacyTheme,
    warnings: string[],
    changes: string[]
): ThemeLayout {
    const validLayoutStyles = ['classic', 'modern', 'elegant', 'rustic', 'minimalist']
    const validHeaderStyles = ['centered', 'left', 'split']

    let layoutStyle = legacyTheme.layoutStyle?.toLowerCase() || MIGRATION_DEFAULTS.layout.style
    let headerStyle = legacyTheme.headerStyle?.toLowerCase() || MIGRATION_DEFAULTS.layout.headerStyle

    // Validate layout style
    if (!validLayoutStyles.includes(layoutStyle)) {
        warnings.push(`Invalid layout style: ${layoutStyle}. Using default.`)
        layoutStyle = MIGRATION_DEFAULTS.layout.style
        changes.push('Replaced invalid layout style with default')
    }

    // Validate header style
    if (!validHeaderStyles.includes(headerStyle)) {
        warnings.push(`Invalid header style: ${headerStyle}. Using default.`)
        headerStyle = MIGRATION_DEFAULTS.layout.headerStyle
        changes.push('Replaced invalid header style with default')
    }

    // Check if any defaults were used
    if (!legacyTheme.layoutStyle) {
        changes.push('Used default value for layout style')
    }
    if (!legacyTheme.headerStyle) {
        changes.push('Used default value for header style')
    }

    return {
        style: layoutStyle as ThemeLayout['style'],
        headerStyle: headerStyle as ThemeLayout['headerStyle'],
    }
}

/**
 * Validate migrated theme for accessibility
 */
function validateMigratedTheme(
    theme: Theme,
    warnings: string[],
    errors: string[]
): void {
    // Check color contrast
    const primaryContrast = getContrastRatio(theme.colors.primary, theme.colors.background)
    if (primaryContrast < 4.5) {
        errors.push(
            `Primary color contrast ratio (${primaryContrast.toFixed(2)}) does not meet WCAG AA standards. ` +
            'Theme may need color adjustments.'
        )
    } else if (primaryContrast < 7) {
        warnings.push(
            `Primary color contrast ratio (${primaryContrast.toFixed(2)}) meets AA but not AAA standards. ` +
            'Consider improving contrast for better accessibility.'
        )
    }

    const accentContrast = getContrastRatio(theme.colors.accent, theme.colors.background)
    if (accentContrast < 4.5) {
        errors.push(
            `Accent color contrast ratio (${accentContrast.toFixed(2)}) does not meet WCAG AA standards. ` +
            'Theme may need color adjustments.'
        )
    }
}

/**
 * Batch migrate multiple themes
 */
export function batchMigrateThemes(
    legacyThemes: LegacyTheme[]
): {
    successful: Theme[]
    failed: Array<{ theme: LegacyTheme; result: MigrationResult }>
    summary: {
        total: number
        successful: number
        failed: number
        warnings: number
    }
} {
    const successful: Theme[] = []
    const failed: Array<{ theme: LegacyTheme; result: MigrationResult }> = []
    let totalWarnings = 0

    legacyThemes.forEach((legacyTheme) => {
        const result = migrateLegacyTheme(legacyTheme)
        totalWarnings += result.warnings.length

        if (result.success && result.theme) {
            successful.push(result.theme)
        } else {
            failed.push({ theme: legacyTheme, result })
        }
    })

    return {
        successful,
        failed,
        summary: {
            total: legacyThemes.length,
            successful: successful.length,
            failed: failed.length,
            warnings: totalWarnings,
        },
    }
}

/**
 * Generate migration report
 */
export function generateMigrationReport(result: MigrationResult): string {
    const lines: string[] = []

    lines.push('=== Theme Migration Report ===')
    lines.push('')
    lines.push(`Status: ${result.success ? 'SUCCESS' : 'FAILED'}`)
    lines.push('')

    if (result.changes.length > 0) {
        lines.push('Changes Made:')
        result.changes.forEach((change) => {
            lines.push(`  - ${change}`)
        })
        lines.push('')
    }

    if (result.warnings.length > 0) {
        lines.push('Warnings:')
        result.warnings.forEach((warning) => {
            lines.push(`  ⚠️  ${warning}`)
        })
        lines.push('')
    }

    if (result.errors.length > 0) {
        lines.push('Errors:')
        result.errors.forEach((error) => {
            lines.push(`  ❌ ${error}`)
        })
        lines.push('')
    }

    if (result.theme) {
        lines.push('Migrated Theme:')
        lines.push(`  ID: ${result.theme.id}`)
        lines.push(`  Name: ${result.theme.name}`)
        lines.push(`  Colors: ${JSON.stringify(result.theme.colors, null, 2)}`)
        lines.push(`  Typography: ${JSON.stringify(result.theme.typography, null, 2)}`)
        lines.push(`  Layout: ${JSON.stringify(result.theme.layout, null, 2)}`)
    }

    return lines.join('\n')
}

/**
 * Helper functions
 */

function isValidColorFormat(color: string): boolean {
    // Check for hex, rgb, rgba, hsl, hsla formats
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    const rgbRegex = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/
    const rgbaRegex = /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/
    const hslRegex = /^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/
    const hslaRegex = /^hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*[\d.]+\s*\)$/

    return (
        hexRegex.test(color) ||
        rgbRegex.test(color) ||
        rgbaRegex.test(color) ||
        hslRegex.test(color) ||
        hslaRegex.test(color)
    )
}

function normalizeColorToHex(color: string): string | null {
    // This is a simplified version - in production, use a color library
    // For now, just return null if not already hex
    if (color.startsWith('#')) return color
    return null
}

function hasFallbackFont(fontFamily: string): boolean {
    const fallbacks = ['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy']
    const fonts = fontFamily.split(',').map((f) => f.trim().toLowerCase())
    return fonts.some((font) => fallbacks.includes(font))
}

function addFallbackFont(fontFamily: string, fallback: string): string {
    return `${fontFamily}, ${fallback}`
}

/**
 * Export theme for backup before migration
 */
export function exportThemeBackup(theme: LegacyTheme): string {
    return JSON.stringify(
        {
            version: '1.0',
            exportDate: new Date().toISOString(),
            theme,
        },
        null,
        2
    )
}

/**
 * Import theme from backup
 */
export function importThemeBackup(backup: string): LegacyTheme | null {
    try {
        const parsed = JSON.parse(backup)
        if (parsed.version && parsed.theme) {
            return parsed.theme
        }
        return null
    } catch {
        return null
    }
}
