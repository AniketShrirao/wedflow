/**
 * Theme Consistency Checker
 * Ensures theme is applied consistently across all public site components
 */

import { Theme } from './theme-engine'

export interface ConsistencyCheckResult {
    isConsistent: boolean
    issues: ConsistencyIssue[]
    recommendations: string[]
}

export interface ConsistencyIssue {
    component: string
    property: string
    expected: string
    actual: string
    severity: 'error' | 'warning'
}

/**
 * Check if theme is applied consistently across the DOM
 */
export function checkThemeConsistency(theme: Theme): ConsistencyCheckResult {
    if (typeof window === 'undefined') {
        return {
            isConsistent: true,
            issues: [],
            recommendations: [],
        }
    }

    const issues: ConsistencyIssue[] = []
    const recommendations: string[] = []

    // Check CSS custom properties
    const root = document.documentElement
    const computedStyle = getComputedStyle(root)

    // Verify theme CSS variables are set
    const themeVars = {
        '--theme-primary': theme.colors.primary,
        '--theme-secondary': theme.colors.secondary,
        '--theme-accent': theme.colors.accent,
        '--theme-background': theme.colors.background,
        '--theme-font-heading': theme.typography.heading,
        '--theme-font-body': theme.typography.body,
    }

    Object.entries(themeVars).forEach(([property, expectedValue]) => {
        const actualValue = computedStyle.getPropertyValue(property).trim()

        if (!actualValue) {
            issues.push({
                component: 'root',
                property,
                expected: expectedValue,
                actual: 'not set',
                severity: 'error',
            })
        } else if (actualValue !== expectedValue) {
            issues.push({
                component: 'root',
                property,
                expected: expectedValue,
                actual: actualValue,
                severity: 'warning',
            })
        }
    })

    // Check data attributes
    const layoutStyle = root.getAttribute('data-layout-style')
    const headerStyle = root.getAttribute('data-header-style')

    if (layoutStyle !== theme.layout.style) {
        issues.push({
            component: 'root',
            property: 'data-layout-style',
            expected: theme.layout.style,
            actual: layoutStyle || 'not set',
            severity: 'error',
        })
    }

    if (headerStyle !== theme.layout.headerStyle) {
        issues.push({
            component: 'root',
            property: 'data-header-style',
            expected: theme.layout.headerStyle,
            actual: headerStyle || 'not set',
            severity: 'error',
        })
    }

    // Check theme-aware components
    checkThemeComponents(issues, recommendations)

    // Generate recommendations
    if (issues.length > 0) {
        recommendations.push('Re-apply the theme to ensure all properties are set correctly')
    }

    if (issues.some((i) => i.property.includes('font'))) {
        recommendations.push('Verify that theme fonts are loaded and available')
    }

    return {
        isConsistent: issues.filter((i) => i.severity === 'error').length === 0,
        issues,
        recommendations,
    }
}

/**
 * Check theme-aware components in the DOM
 */
function checkThemeComponents(issues: ConsistencyIssue[], recommendations: string[]): void {
    // Check for theme class usage
    const themeClasses = [
        'theme-primary',
        'theme-secondary',
        'theme-accent',
        'theme-bg-primary',
        'theme-bg-secondary',
        'theme-bg-accent',
        'theme-text-primary',
        'theme-text-secondary',
        'theme-text-accent',
        'theme-button-primary',
        'theme-button-secondary',
        'theme-button-outline',
    ]

    const usedThemeClasses = new Set<string>()

    themeClasses.forEach((className) => {
        const elements = document.querySelectorAll(`.${className}`)
        if (elements.length > 0) {
            usedThemeClasses.add(className)
        }
    })

    // Check if theme sections exist
    const themeSections = [
        'theme-hero',
        'theme-photo-gallery',
        'theme-events',
        'theme-gift-portal',
    ]

    themeSections.forEach((sectionClass) => {
        const section = document.querySelector(`.${sectionClass}`)
        if (section) {
            // Verify section has proper styling
            const computedStyle = getComputedStyle(section)
            const backgroundColor = computedStyle.backgroundColor

            if (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') {
                recommendations.push(
                    `Section .${sectionClass} has transparent background. Ensure theme styles are applied.`
                )
            }
        }
    })
}

/**
 * Monitor theme consistency in real-time
 */
export class ThemeConsistencyMonitor {
    private observer: MutationObserver | null = null
    private theme: Theme | null = null
    private onInconsistency?: (result: ConsistencyCheckResult) => void

    constructor(onInconsistency?: (result: ConsistencyCheckResult) => void) {
        this.onInconsistency = onInconsistency
    }

    /**
     * Start monitoring theme consistency
     */
    start(theme: Theme): void {
        if (typeof window === 'undefined') return

        this.theme = theme
        this.stop() // Stop any existing observer

        // Create mutation observer to watch for DOM changes
        this.observer = new MutationObserver(() => {
            this.checkConsistency()
        })

        // Observe changes to attributes and child elements
        this.observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-layout-style', 'data-header-style', 'style'],
            childList: true,
            subtree: true,
        })

        // Initial check
        this.checkConsistency()
    }

    /**
     * Stop monitoring
     */
    stop(): void {
        if (this.observer) {
            this.observer.disconnect()
            this.observer = null
        }
    }

    /**
     * Check consistency and notify if issues found
     */
    private checkConsistency(): void {
        if (!this.theme) return

        const result = checkThemeConsistency(this.theme)

        if (!result.isConsistent && this.onInconsistency) {
            this.onInconsistency(result)
        }
    }
}

/**
 * Fix theme inconsistencies automatically
 */
export function fixThemeInconsistencies(theme: Theme): {
    fixed: number
    remaining: ConsistencyIssue[]
} {
    if (typeof window === 'undefined') {
        return { fixed: 0, remaining: [] }
    }

    const result = checkThemeConsistency(theme)
    let fixed = 0

    const root = document.documentElement

    result.issues.forEach((issue) => {
        if (issue.component === 'root') {
            if (issue.property.startsWith('--')) {
                // Fix CSS custom property
                root.style.setProperty(issue.property, issue.expected)
                fixed++
            } else if (issue.property.startsWith('data-')) {
                // Fix data attribute
                root.setAttribute(issue.property, issue.expected)
                fixed++
            }
        }
    })

    // Re-check after fixes
    const newResult = checkThemeConsistency(theme)

    return {
        fixed,
        remaining: newResult.issues,
    }
}

/**
 * Generate consistency report
 */
export function generateConsistencyReport(result: ConsistencyCheckResult): string {
    const lines: string[] = []

    lines.push('=== Theme Consistency Report ===')
    lines.push('')
    lines.push(`Status: ${result.isConsistent ? 'CONSISTENT' : 'INCONSISTENT'}`)
    lines.push(`Issues Found: ${result.issues.length}`)
    lines.push('')

    if (result.issues.length > 0) {
        lines.push('Issues:')
        result.issues.forEach((issue) => {
            const icon = issue.severity === 'error' ? '❌' : '⚠️'
            lines.push(`  ${icon} ${issue.component}.${issue.property}`)
            lines.push(`     Expected: ${issue.expected}`)
            lines.push(`     Actual: ${issue.actual}`)
            lines.push('')
        })
    }

    if (result.recommendations.length > 0) {
        lines.push('Recommendations:')
        result.recommendations.forEach((rec) => {
            lines.push(`  💡 ${rec}`)
        })
        lines.push('')
    }

    return lines.join('\n')
}

/**
 * Validate theme application on page load
 */
export function validateThemeOnLoad(theme: Theme): Promise<ConsistencyCheckResult> {
    return new Promise((resolve) => {
        if (typeof window === 'undefined') {
            resolve({
                isConsistent: true,
                issues: [],
                recommendations: [],
            })
            return
        }

        // Wait for DOM to be fully loaded
        if (document.readyState === 'complete') {
            resolve(checkThemeConsistency(theme))
        } else {
            window.addEventListener('load', () => {
                // Give a small delay for styles to apply
                setTimeout(() => {
                    resolve(checkThemeConsistency(theme))
                }, 100)
            })
        }
    })
}
