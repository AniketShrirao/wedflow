/**
 * Enhanced Theme Engine - Dynamic Theming System
 * Provides theme validation, application, and accessibility compliance
 */

import { getContrastRatio } from '@/lib/accessibility/color-contrast'

export interface ThemeColors {
    primary: string
    secondary: string
    accent: string
    background: string
}

export interface ThemeTypography {
    heading: string
    body: string
}

export interface ThemeLayout {
    style: 'classic' | 'modern' | 'elegant' | 'rustic' | 'minimalist'
    headerStyle: 'centered' | 'left' | 'split'
}

export interface Theme {
    id: string
    name: string
    colors: ThemeColors
    typography: ThemeTypography
    layout: ThemeLayout
    accessibility?: AccessibilityOverrides
}

export interface AccessibilityOverrides {
    highContrast?: boolean
    reducedMotion?: boolean
    largeText?: boolean
}

export interface ThemeValidationResult {
    isValid: boolean
    errors: ThemeValidationError[]
    warnings: ThemeValidationWarning[]
    accessibilityScore: number
}

export interface ThemeValidationError {
    field: string
    message: string
    severity: 'error' | 'warning'
}

export interface ThemeValidationWarning {
    field: string
    message: string
    suggestion?: string
}

export interface ThemePreview {
    cssVariables: Record<string, string>
    dataAttributes: Record<string, string>
    previewHtml: string
}

/**
 * Enhanced Theme Engine Class
 */
export class ThemeEngine {
    private static instance: ThemeEngine
    private currentTheme: Theme | null = null
    private validationCache = new Map<string, ThemeValidationResult>()

    private constructor() { }

    static getInstance(): ThemeEngine {
        if (!ThemeEngine.instance) {
            ThemeEngine.instance = new ThemeEngine()
        }
        return ThemeEngine.instance
    }

    /**
     * Apply theme to the DOM with validation
     */
    async applyTheme(theme: Theme): Promise<{ success: boolean; errors?: string[] }> {
        try {
            // Validate theme before applying
            const validation = await this.validateTheme(theme)

            if (!validation.isValid) {
                const criticalErrors = validation.errors.filter(e => e.severity === 'error')
                if (criticalErrors.length > 0) {
                    return {
                        success: false,
                        errors: criticalErrors.map(e => e.message)
                    }
                }
            }

            // Apply CSS custom properties
            this.applyCSSVariables(theme)

            // Apply data attributes for layout
            this.applyDataAttributes(theme)

            // Store current theme
            this.currentTheme = theme

            // Persist theme
            this.persistTheme(theme)

            // Announce theme change to screen readers
            this.announceThemeChange(theme.name)

            return { success: true }
        } catch (error) {
            console.error('Error applying theme:', error)
            return {
                success: false,
                errors: ['Failed to apply theme due to an unexpected error']
            }
        }
    }

    /**
     * Validate theme for accessibility compliance
     */
    async validateTheme(theme: Theme): Promise<ThemeValidationResult> {
        const cacheKey = this.getThemeCacheKey(theme)

        if (this.validationCache.has(cacheKey)) {
            return this.validationCache.get(cacheKey)!
        }

        const errors: ThemeValidationError[] = []
        const warnings: ThemeValidationWarning[] = []
        let accessibilityScore = 100

        // Validate color contrast ratios
        const contrastValidation = this.validateColorContrast(theme.colors)
        errors.push(...contrastValidation.errors)
        warnings.push(...contrastValidation.warnings)
        accessibilityScore -= contrastValidation.penaltyPoints

        // Validate color format
        const colorFormatValidation = this.validateColorFormats(theme.colors)
        errors.push(...colorFormatValidation.errors)
        warnings.push(...colorFormatValidation.warnings)

        // Validate typography accessibility
        const typographyValidation = this.validateTypography(theme.typography)
        errors.push(...typographyValidation.errors)
        warnings.push(...typographyValidation.warnings)
        accessibilityScore -= typographyValidation.penaltyPoints

        // Validate layout accessibility
        const layoutValidation = this.validateLayout(theme.layout)
        warnings.push(...layoutValidation.warnings)

        const result: ThemeValidationResult = {
            isValid: errors.length === 0,
            errors,
            warnings,
            accessibilityScore: Math.max(0, accessibilityScore)
        }

        this.validationCache.set(cacheKey, result)
        return result
    }

    /**
     * Generate theme preview
     */
    generateThemePreview(theme: Theme): ThemePreview {
        const cssVariables = this.generateCSSVariables(theme)
        const dataAttributes = this.generateDataAttributes(theme)
        const previewHtml = this.generatePreviewHTML(theme)

        return {
            cssVariables,
            dataAttributes,
            previewHtml
        }
    }

    /**
     * Reset to default theme
     */
    resetToDefault(): void {
        const defaultTheme = this.getDefaultTheme()
        this.applyTheme(defaultTheme)
    }

    /**
     * Get current theme
     */
    getCurrentTheme(): Theme | null {
        return this.currentTheme
    }

    /**
     * Private Methods
     */

    private applyCSSVariables(theme: Theme): void {
        if (typeof window === 'undefined') return

        const root = document.documentElement
        const variables = this.generateCSSVariables(theme)

        Object.entries(variables).forEach(([property, value]) => {
            root.style.setProperty(property, value)
        })
    }

    private applyDataAttributes(theme: Theme): void {
        if (typeof window === 'undefined') return

        const root = document.documentElement
        const attributes = this.generateDataAttributes(theme)

        Object.entries(attributes).forEach(([attribute, value]) => {
            root.setAttribute(attribute, value)
        })
    }

    private generateCSSVariables(theme: Theme): Record<string, string> {
        return {
            '--theme-primary': theme.colors.primary,
            '--theme-secondary': theme.colors.secondary,
            '--theme-accent': theme.colors.accent,
            '--theme-background': theme.colors.background,
            '--theme-font-heading': theme.typography.heading,
            '--theme-font-body': theme.typography.body,
        }
    }

    private generateDataAttributes(theme: Theme): Record<string, string> {
        return {
            'data-layout-style': theme.layout.style,
            'data-header-style': theme.layout.headerStyle,
            'data-theme-id': theme.id,
        }
    }

    private generatePreviewHTML(theme: Theme): string {
        return `
      <div class="theme-preview" style="
        background-color: ${theme.colors.background};
        color: ${theme.colors.primary};
        font-family: ${theme.typography.body};
        padding: 2rem;
        border-radius: 0.5rem;
        border: 1px solid ${theme.colors.secondary};
      ">
        <h1 style="
          font-family: ${theme.typography.heading};
          color: ${theme.colors.primary};
          margin-bottom: 1rem;
        ">Sarah & Michael</h1>
        <p style="
          color: ${theme.colors.accent};
          margin-bottom: 1rem;
        ">We're getting married!</p>
        <button style="
          background-color: ${theme.colors.primary};
          color: ${theme.colors.background};
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 0.25rem;
          font-family: ${theme.typography.body};
        ">View Details</button>
      </div>
    `
    }

    private validateColorContrast(colors: ThemeColors): {
        errors: ThemeValidationError[]
        warnings: ThemeValidationWarning[]
        penaltyPoints: number
    } {
        const errors: ThemeValidationError[] = []
        const warnings: ThemeValidationWarning[] = []
        let penaltyPoints = 0

        // Check primary text on background
        const primaryContrast = getContrastRatio(colors.primary, colors.background)
        if (primaryContrast < 4.5) {
            errors.push({
                field: 'colors.primary',
                message: `Primary color contrast ratio (${primaryContrast.toFixed(2)}) does not meet WCAG AA standards (4.5:1)`,
                severity: 'error'
            })
            penaltyPoints += 30
        } else if (primaryContrast < 7) {
            warnings.push({
                field: 'colors.primary',
                message: `Primary color contrast ratio (${primaryContrast.toFixed(2)}) does not meet WCAG AAA standards (7:1)`,
                suggestion: 'Consider using a darker or lighter shade for better accessibility'
            })
            penaltyPoints += 10
        }

        // Check accent text on background
        const accentContrast = getContrastRatio(colors.accent, colors.background)
        if (accentContrast < 4.5) {
            errors.push({
                field: 'colors.accent',
                message: `Accent color contrast ratio (${accentContrast.toFixed(2)}) does not meet WCAG AA standards (4.5:1)`,
                severity: 'error'
            })
            penaltyPoints += 20
        }

        // Check secondary background readability
        const secondaryContrast = getContrastRatio(colors.primary, colors.secondary)
        if (secondaryContrast < 3) {
            warnings.push({
                field: 'colors.secondary',
                message: `Secondary background may not provide sufficient contrast for text`,
                suggestion: 'Ensure secondary color provides adequate contrast when used as background'
            })
            penaltyPoints += 5
        }

        return { errors, warnings, penaltyPoints }
    }

    private validateColorFormats(colors: ThemeColors): {
        errors: ThemeValidationError[]
        warnings: ThemeValidationWarning[]
    } {
        const errors: ThemeValidationError[] = []
        const warnings: ThemeValidationWarning[] = []

        const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$|^rgb\(|^rgba\(|^hsl\(|^hsla\(/

        Object.entries(colors).forEach(([key, value]) => {
            if (!colorRegex.test(value)) {
                errors.push({
                    field: `colors.${key}`,
                    message: `Invalid color format: ${value}`,
                    severity: 'error'
                })
            }
        })

        return { errors, warnings }
    }

    private validateTypography(typography: ThemeTypography): {
        errors: ThemeValidationError[]
        warnings: ThemeValidationWarning[]
        penaltyPoints: number
    } {
        const errors: ThemeValidationError[] = []
        const warnings: ThemeValidationWarning[] = []
        let penaltyPoints = 0

        // Check if fonts are web-safe or have fallbacks
        const webSafeFonts = [
            'Arial', 'Helvetica', 'Times New Roman', 'Times', 'Courier New', 'Courier',
            'Verdana', 'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS',
            'Trebuchet MS', 'Arial Black', 'Impact', 'sans-serif', 'serif', 'monospace'
        ]

        if (!this.hasFallbackFont(typography.heading, webSafeFonts)) {
            warnings.push({
                field: 'typography.heading',
                message: 'Heading font may not have adequate fallbacks',
                suggestion: 'Add fallback fonts like "serif" or "sans-serif"'
            })
            penaltyPoints += 5
        }

        if (!this.hasFallbackFont(typography.body, webSafeFonts)) {
            warnings.push({
                field: 'typography.body',
                message: 'Body font may not have adequate fallbacks',
                suggestion: 'Add fallback fonts like "serif" or "sans-serif"'
            })
            penaltyPoints += 5
        }

        return { errors, warnings, penaltyPoints }
    }

    private validateLayout(layout: ThemeLayout): {
        warnings: ThemeValidationWarning[]
    } {
        const warnings: ThemeValidationWarning[] = []

        // Check for mobile-friendly layouts
        if (layout.headerStyle === 'split') {
            warnings.push({
                field: 'layout.headerStyle',
                message: 'Split header layout may not be optimal for mobile devices',
                suggestion: 'Consider how this layout will adapt on smaller screens'
            })
        }

        return { warnings }
    }

    private hasFallbackFont(fontFamily: string, webSafeFonts: string[]): boolean {
        const fonts = fontFamily.split(',').map(f => f.trim().replace(/['"]/g, ''))
        return fonts.some(font => webSafeFonts.includes(font))
    }

    private persistTheme(theme: Theme): void {
        if (typeof window === 'undefined') return

        try {
            localStorage.setItem('wedflow-theme', JSON.stringify(theme))
        } catch (error) {
            console.warn('Failed to persist theme to localStorage:', error)
        }
    }

    private announceThemeChange(themeName: string): void {
        if (typeof window === 'undefined') return

        // Create announcement for screen readers
        const announcement = document.createElement('div')
        announcement.setAttribute('aria-live', 'polite')
        announcement.setAttribute('aria-atomic', 'true')
        announcement.className = 'sr-only'
        announcement.textContent = `Theme changed to ${themeName}`

        document.body.appendChild(announcement)

        // Remove announcement after it's been read
        setTimeout(() => {
            document.body.removeChild(announcement)
        }, 1000)
    }

    private getThemeCacheKey(theme: Theme): string {
        return `${theme.id}-${JSON.stringify(theme.colors)}-${JSON.stringify(theme.typography)}-${JSON.stringify(theme.layout)}`
    }

    private getDefaultTheme(): Theme {
        return {
            id: 'default',
            name: 'Classic Wedding',
            colors: {
                primary: '#8B5A3C',
                secondary: '#F4E4C1',
                accent: '#D4A574',
                background: '#FFFFFF'
            },
            typography: {
                heading: 'Playfair Display, serif',
                body: 'Open Sans, sans-serif'
            },
            layout: {
                style: 'classic',
                headerStyle: 'centered'
            }
        }
    }
}

/**
 * Theme Engine Utilities
 */
export const themeEngine = ThemeEngine.getInstance()

/**
 * React Hook for Theme Engine
 */
export function useThemeEngine() {
    return {
        applyTheme: (theme: Theme) => themeEngine.applyTheme(theme),
        validateTheme: (theme: Theme) => themeEngine.validateTheme(theme),
        generatePreview: (theme: Theme) => themeEngine.generateThemePreview(theme),
        resetToDefault: () => themeEngine.resetToDefault(),
        getCurrentTheme: () => themeEngine.getCurrentTheme(),
    }
}