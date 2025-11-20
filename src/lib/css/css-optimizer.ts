/**
 * CSS Optimization Utilities
 * Provides utilities for CSS bundle optimization and analysis
 */

/**
 * Get critical CSS classes that should always be included
 */
export const getCriticalCSSClasses = (): string[] => {
    return [
        // Accessibility classes
        'sr-only',
        'sr-only-focusable',
        'focus-visible',
        'skip-link',
        'touch-target',
        'aria-live-region',

        // Layout classes
        'container',
        'section',
        'flex',
        'grid',

        // Interactive states
        'interactive',
        'loading-skeleton',

        // Error handling
        'error-indicator',
        'success-indicator',
        'warning-indicator',

        // Performance
        'lazy-image',
        'blur-placeholder',
    ]
}

/**
 * Get theme-related CSS classes that are dynamically applied
 */
export const getThemeCSSClasses = (): string[] => {
    return [
        'theme-primary',
        'theme-secondary',
        'theme-accent',
        'theme-bg-primary',
        'theme-bg-secondary',
        'theme-bg-accent',
        'theme-bg-background',
        'theme-text-primary',
        'theme-text-secondary',
        'theme-text-accent',
        'theme-border-primary',
        'theme-border-secondary',
        'theme-border-accent',
        'theme-font-heading',
        'theme-font-body',
        'theme-button-primary',
        'theme-button-secondary',
        'theme-button-outline',
        'theme-section',
        'theme-hero',
        'theme-photo-gallery',
        'theme-events',
        'theme-event-card',
        'theme-gift-portal',
        'theme-invalid-contrast',
    ]
}

/**
 * Analyze CSS usage in the application
 * This can be used during build time to identify unused styles
 */
export interface CSSUsageReport {
    totalClasses: number
    usedClasses: number
    unusedClasses: string[]
    coverage: number
}

/**
 * Generate CSS usage report (for development/analysis)
 */
export function generateCSSUsageReport(
    definedClasses: string[],
    usedClasses: string[]
): CSSUsageReport {
    const unusedClasses = definedClasses.filter(
        (cls) => !usedClasses.includes(cls)
    )

    const coverage = (usedClasses.length / definedClasses.length) * 100

    return {
        totalClasses: definedClasses.length,
        usedClasses: usedClasses.length,
        unusedClasses,
        coverage: Math.round(coverage * 100) / 100,
    }
}

/**
 * CSS Custom Property utilities
 */
export const cssVarUtils = {
    /**
     * Get CSS custom property value
     */
    getVar(property: string, element?: HTMLElement): string {
        if (typeof window === 'undefined') return ''

        const el = element || document.documentElement
        return getComputedStyle(el).getPropertyValue(property).trim()
    },

    /**
     * Set CSS custom property value
     */
    setVar(property: string, value: string, element?: HTMLElement): void {
        if (typeof window === 'undefined') return

        const el = element || document.documentElement
        el.style.setProperty(property, value)
    },

    /**
     * Remove CSS custom property
     */
    removeVar(property: string, element?: HTMLElement): void {
        if (typeof window === 'undefined') return

        const el = element || document.documentElement
        el.style.removeProperty(property)
    },

    /**
     * Get all CSS custom properties from an element
     */
    getAllVars(element?: HTMLElement): Record<string, string> {
        if (typeof window === 'undefined') return {}

        const el = element || document.documentElement
        const styles = getComputedStyle(el)
        const vars: Record<string, string> = {}

        // Get all CSS custom properties
        for (let i = 0; i < styles.length; i++) {
            const property = styles[i]
            if (property.startsWith('--')) {
                vars[property] = styles.getPropertyValue(property).trim()
            }
        }

        return vars
    },
}

/**
 * Optimize CSS loading by preloading critical stylesheets
 */
export function preloadCriticalCSS(href: string): void {
    if (typeof window === 'undefined') return

    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'style'
    link.href = href
    link.onload = function () {
        // @ts-ignore
        this.onload = null
        // @ts-ignore
        this.rel = 'stylesheet'
    }
    document.head.appendChild(link)
}

/**
 * Lazy load non-critical CSS
 */
export function lazyLoadCSS(href: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined') {
            resolve()
            return
        }

        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = href
        link.onload = () => resolve()
        link.onerror = () => reject(new Error(`Failed to load CSS: ${href}`))
        document.head.appendChild(link)
    })
}

/**
 * Check if CSS custom properties are supported
 */
export function supportsCSSCustomProperties(): boolean {
    if (typeof window === 'undefined') return false

    return window.CSS && window.CSS.supports && window.CSS.supports('--test', '0')
}

/**
 * Get CSS bundle size estimate (for development)
 */
export interface CSSBundleInfo {
    totalSize: number
    gzippedSize: number
    files: Array<{
        name: string
        size: number
    }>
}

/**
 * Minify inline CSS (basic minification)
 */
export function minifyCSS(css: string): string {
    return css
        // Remove comments
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // Remove whitespace
        .replace(/\s+/g, ' ')
        // Remove spaces around special characters
        .replace(/\s*([{}:;,>+~])\s*/g, '$1')
        // Remove trailing semicolons
        .replace(/;}/g, '}')
        .trim()
}

/**
 * Extract critical CSS for above-the-fold content
 */
export function extractCriticalCSS(html: string, css: string): string {
    // This is a simplified version - in production, use a tool like critical or critters
    const usedSelectors = new Set<string>()

    // Extract class names from HTML
    const classMatches = html.matchAll(/class="([^"]*)"/g)
    for (const match of classMatches) {
        const classes = match[1].split(/\s+/)
        classes.forEach(cls => usedSelectors.add(`.${cls}`))
    }

    // Extract ID selectors from HTML
    const idMatches = html.matchAll(/id="([^"]*)"/g)
    for (const match of idMatches) {
        usedSelectors.add(`#${match[1]}`)
    }

    // Filter CSS to only include used selectors
    // This is a very basic implementation
    const cssRules = css.split('}')
    const criticalCSS = cssRules
        .filter(rule => {
            const selector = rule.split('{')[0]?.trim()
            if (!selector) return false

            // Check if any used selector matches
            for (const usedSelector of usedSelectors) {
                if (selector.includes(usedSelector)) {
                    return true
                }
            }
            return false
        })
        .join('}')

    return criticalCSS
}
