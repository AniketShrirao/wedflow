/**
 * Responsive Design Utilities
 * Provides utilities for mobile-first responsive design
 */

/**
 * Breakpoint definitions matching design tokens
 */
export const BREAKPOINTS = {
    xs: 475,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
} as const

export type Breakpoint = keyof typeof BREAKPOINTS

/**
 * Check if current viewport matches a breakpoint
 */
export function matchesBreakpoint(breakpoint: Breakpoint): boolean {
    if (typeof window === 'undefined') return false
    return window.innerWidth >= BREAKPOINTS[breakpoint]
}

/**
 * Get current breakpoint
 */
export function getCurrentBreakpoint(): Breakpoint {
    if (typeof window === 'undefined') return 'xs'

    const width = window.innerWidth

    if (width >= BREAKPOINTS['2xl']) return '2xl'
    if (width >= BREAKPOINTS.xl) return 'xl'
    if (width >= BREAKPOINTS.lg) return 'lg'
    if (width >= BREAKPOINTS.md) return 'md'
    if (width >= BREAKPOINTS.sm) return 'sm'
    return 'xs'
}

/**
 * Check if device is mobile
 */
export function isMobile(): boolean {
    if (typeof window === 'undefined') return false
    return window.innerWidth < BREAKPOINTS.md
}

/**
 * Check if device is tablet
 */
export function isTablet(): boolean {
    if (typeof window === 'undefined') return false
    const width = window.innerWidth
    return width >= BREAKPOINTS.md && width < BREAKPOINTS.lg
}

/**
 * Check if device is desktop
 */
export function isDesktop(): boolean {
    if (typeof window === 'undefined') return false
    return window.innerWidth >= BREAKPOINTS.lg
}

/**
 * Touch target size validation
 */
export const TOUCH_TARGET = {
    minimum: 44, // WCAG minimum touch target size
    recommended: 48, // Recommended for better UX
} as const

/**
 * Validate touch target size
 */
export function validateTouchTarget(
    width: number,
    height: number
): {
    isValid: boolean
    meetsMinimum: boolean
    meetsRecommended: boolean
    issues: string[]
} {
    const meetsMinimum = width >= TOUCH_TARGET.minimum && height >= TOUCH_TARGET.minimum
    const meetsRecommended = width >= TOUCH_TARGET.recommended && height >= TOUCH_TARGET.recommended

    const issues: string[] = []

    if (!meetsMinimum) {
        if (width < TOUCH_TARGET.minimum) {
            issues.push(`Width ${width}px is below minimum ${TOUCH_TARGET.minimum}px`)
        }
        if (height < TOUCH_TARGET.minimum) {
            issues.push(`Height ${height}px is below minimum ${TOUCH_TARGET.minimum}px`)
        }
    } else if (!meetsRecommended) {
        if (width < TOUCH_TARGET.recommended) {
            issues.push(`Width ${width}px is below recommended ${TOUCH_TARGET.recommended}px`)
        }
        if (height < TOUCH_TARGET.recommended) {
            issues.push(`Height ${height}px is below recommended ${TOUCH_TARGET.recommended}px`)
        }
    }

    return {
        isValid: meetsMinimum,
        meetsMinimum,
        meetsRecommended,
        issues,
    }
}

/**
 * Responsive value selector
 */
export function getResponsiveValue<T>(values: {
    xs?: T
    sm?: T
    md?: T
    lg?: T
    xl?: T
    '2xl'?: T
}): T | undefined {
    const breakpoint = getCurrentBreakpoint()

    // Return the value for current breakpoint or the closest smaller one
    const breakpointOrder: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs']
    const currentIndex = breakpointOrder.indexOf(breakpoint)

    for (let i = currentIndex; i < breakpointOrder.length; i++) {
        const bp = breakpointOrder[i]
        if (values[bp] !== undefined) {
            return values[bp]
        }
    }

    return undefined
}

/**
 * Generate responsive class names
 */
export function generateResponsiveClasses(
    baseClass: string,
    breakpoints?: Partial<Record<Breakpoint, string>>
): string {
    const classes = [baseClass]

    if (breakpoints) {
        Object.entries(breakpoints).forEach(([bp, className]) => {
            if (className) {
                classes.push(`${bp}:${className}`)
            }
        })
    }

    return classes.join(' ')
}

/**
 * Viewport size categories
 */
export type ViewportSize = 'mobile' | 'tablet' | 'desktop'

/**
 * Get viewport size category
 */
export function getViewportSize(): ViewportSize {
    if (isMobile()) return 'mobile'
    if (isTablet()) return 'tablet'
    return 'desktop'
}

/**
 * Responsive image sizes
 */
export function getResponsiveImageSizes(
    sizes?: Partial<Record<Breakpoint, string>>
): string {
    const defaultSizes = {
        xs: '100vw',
        sm: '100vw',
        md: '50vw',
        lg: '33vw',
        xl: '25vw',
    }

    const finalSizes = { ...defaultSizes, ...sizes }

    // Generate sizes attribute string
    const sizeStrings: string[] = []

    Object.entries(finalSizes).forEach(([bp, size]) => {
        const breakpoint = bp as Breakpoint
        if (BREAKPOINTS[breakpoint]) {
            sizeStrings.push(`(min-width: ${BREAKPOINTS[breakpoint]}px) ${size}`)
        }
    })

    // Add default size
    sizeStrings.push('100vw')

    return sizeStrings.join(', ')
}

/**
 * Text scaling for accessibility
 */
export const TEXT_SCALE = {
    minimum: 16, // Minimum font size for body text
    large: 18, // Large text threshold for WCAG
    heading: {
        h1: { mobile: 32, tablet: 40, desktop: 48 },
        h2: { mobile: 28, tablet: 32, desktop: 36 },
        h3: { mobile: 24, tablet: 28, desktop: 32 },
        h4: { mobile: 20, tablet: 24, desktop: 28 },
        h5: { mobile: 18, tablet: 20, desktop: 24 },
        h6: { mobile: 16, tablet: 18, desktop: 20 },
    },
} as const

/**
 * Get responsive font size
 */
export function getResponsiveFontSize(
    element: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body'
): number {
    if (element === 'body') {
        return TEXT_SCALE.minimum
    }

    const viewportSize = getViewportSize()
    const sizes = TEXT_SCALE.heading[element]

    switch (viewportSize) {
        case 'mobile':
            return sizes.mobile
        case 'tablet':
            return sizes.tablet
        case 'desktop':
            return sizes.desktop
    }
}

/**
 * Spacing scale for responsive design
 */
export function getResponsiveSpacing(
    size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
): {
    mobile: number
    tablet: number
    desktop: number
} {
    const scales = {
        xs: { mobile: 8, tablet: 12, desktop: 16 },
        sm: { mobile: 16, tablet: 24, desktop: 32 },
        md: { mobile: 24, tablet: 32, desktop: 48 },
        lg: { mobile: 32, tablet: 48, desktop: 64 },
        xl: { mobile: 48, tablet: 64, desktop: 96 },
    }

    return scales[size]
}

/**
 * Container max-width for responsive layouts
 */
export function getContainerMaxWidth(size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'): number | string {
    const sizes = {
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
        full: '100%',
    }

    return size ? sizes[size] : sizes.xl
}

/**
 * Grid columns for responsive layouts
 */
export function getResponsiveGridColumns(): {
    mobile: number
    tablet: number
    desktop: number
} {
    return {
        mobile: 1,
        tablet: 2,
        desktop: 3,
    }
}

/**
 * Check if touch device
 */
export function isTouchDevice(): boolean {
    if (typeof window === 'undefined') return false

    return (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore
        navigator.msMaxTouchPoints > 0
    )
}

/**
 * Get device pixel ratio
 */
export function getDevicePixelRatio(): number {
    if (typeof window === 'undefined') return 1
    return window.devicePixelRatio || 1
}

/**
 * Check if high DPI display
 */
export function isHighDPI(): boolean {
    return getDevicePixelRatio() >= 2
}

/**
 * Responsive utility classes generator
 */
export function generateResponsiveUtilities(
    property: string,
    values: Partial<Record<Breakpoint, string | number>>
): Record<string, string> {
    const utilities: Record<string, string> = {}

    Object.entries(values).forEach(([bp, value]) => {
        const breakpoint = bp as Breakpoint
        const className = breakpoint === 'xs' ? property : `${breakpoint}:${property}`
        utilities[className] = String(value)
    })

    return utilities
}

/**
 * Media query helper
 */
export function createMediaQuery(breakpoint: Breakpoint, type: 'min' | 'max' = 'min'): string {
    const width = BREAKPOINTS[breakpoint]
    return `(${type}-width: ${width}px)`
}

/**
 * Check if media query matches
 */
export function matchesMediaQuery(query: string): boolean {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
}

/**
 * Orientation detection
 */
export function getOrientation(): 'portrait' | 'landscape' {
    if (typeof window === 'undefined') return 'portrait'

    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
}

/**
 * Safe area insets for notched devices
 */
export function getSafeAreaInsets(): {
    top: number
    right: number
    bottom: number
    left: number
} {
    if (typeof window === 'undefined' || !CSS.supports('padding-top: env(safe-area-inset-top)')) {
        return { top: 0, right: 0, bottom: 0, left: 0 }
    }

    const computedStyle = getComputedStyle(document.documentElement)

    return {
        top: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)')) || 0,
        right: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)')) || 0,
        bottom: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)')) || 0,
        left: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)')) || 0,
    }
}
