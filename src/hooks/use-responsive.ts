/**
 * Responsive Design Hooks
 * React hooks for responsive design and viewport detection
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
    Breakpoint,
    BREAKPOINTS,
    getCurrentBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
    getViewportSize,
    ViewportSize,
    isTouchDevice,
    getOrientation,
    matchesMediaQuery,
} from '@/lib/responsive/responsive-utils'

/**
 * Hook to get current breakpoint
 */
export function useBreakpoint(): Breakpoint {
    const [breakpoint, setBreakpoint] = useState<Breakpoint>(() => {
        if (typeof window === 'undefined') return 'md'
        return getCurrentBreakpoint()
    })

    useEffect(() => {
        const handleResize = () => {
            setBreakpoint(getCurrentBreakpoint())
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return breakpoint
}

/**
 * Hook to check if viewport matches a specific breakpoint
 */
export function useMatchBreakpoint(targetBreakpoint: Breakpoint): boolean {
    const [matches, setMatches] = useState(() => {
        if (typeof window === 'undefined') return false
        return window.innerWidth >= BREAKPOINTS[targetBreakpoint]
    })

    useEffect(() => {
        const handleResize = () => {
            setMatches(window.innerWidth >= BREAKPOINTS[targetBreakpoint])
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [targetBreakpoint])

    return matches
}

/**
 * Hook to check if device is mobile
 */
export function useIsMobile(): boolean {
    const [mobile, setMobile] = useState(() => {
        if (typeof window === 'undefined') return false
        return isMobile()
    })

    useEffect(() => {
        const handleResize = () => {
            setMobile(isMobile())
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return mobile
}

/**
 * Hook to check if device is tablet
 */
export function useIsTablet(): boolean {
    const [tablet, setTablet] = useState(() => {
        if (typeof window === 'undefined') return false
        return isTablet()
    })

    useEffect(() => {
        const handleResize = () => {
            setTablet(isTablet())
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return tablet
}

/**
 * Hook to check if device is desktop
 */
export function useIsDesktop(): boolean {
    const [desktop, setDesktop] = useState(() => {
        if (typeof window === 'undefined') return true
        return isDesktop()
    })

    useEffect(() => {
        const handleResize = () => {
            setDesktop(isDesktop())
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return desktop
}

/**
 * Hook to get viewport size category
 */
export function useViewportSize(): ViewportSize {
    const [size, setSize] = useState<ViewportSize>(() => {
        if (typeof window === 'undefined') return 'desktop'
        return getViewportSize()
    })

    useEffect(() => {
        const handleResize = () => {
            setSize(getViewportSize())
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return size
}

/**
 * Hook to get viewport dimensions
 */
export function useViewportDimensions(): {
    width: number
    height: number
} {
    const [dimensions, setDimensions] = useState(() => {
        if (typeof window === 'undefined') {
            return { width: 1024, height: 768 }
        }
        return {
            width: window.innerWidth,
            height: window.innerHeight,
        }
    })

    useEffect(() => {
        const handleResize = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            })
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return dimensions
}

/**
 * Hook to check if device is touch-enabled
 */
export function useIsTouchDevice(): boolean {
    const [isTouch, setIsTouch] = useState(() => {
        if (typeof window === 'undefined') return false
        return isTouchDevice()
    })

    useEffect(() => {
        // Touch capability doesn't change, but we check on mount
        setIsTouch(isTouchDevice())
    }, [])

    return isTouch
}

/**
 * Hook to get device orientation
 */
export function useOrientation(): 'portrait' | 'landscape' {
    const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(() => {
        if (typeof window === 'undefined') return 'portrait'
        return getOrientation()
    })

    useEffect(() => {
        const handleResize = () => {
            setOrientation(getOrientation())
        }

        const handleOrientationChange = () => {
            setOrientation(getOrientation())
        }

        window.addEventListener('resize', handleResize)
        window.addEventListener('orientationchange', handleOrientationChange)

        return () => {
            window.removeEventListener('resize', handleResize)
            window.removeEventListener('orientationchange', handleOrientationChange)
        }
    }, [])

    return orientation
}

/**
 * Hook to match media query
 */
export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(() => {
        if (typeof window === 'undefined') return false
        return matchesMediaQuery(query)
    })

    useEffect(() => {
        const mediaQuery = window.matchMedia(query)

        const handleChange = (e: MediaQueryListEvent) => {
            setMatches(e.matches)
        }

        // Modern browsers
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleChange)
            return () => mediaQuery.removeEventListener('change', handleChange)
        }
        // Legacy browsers
        else {
            // @ts-ignore
            mediaQuery.addListener(handleChange)
            // @ts-ignore
            return () => mediaQuery.removeListener(handleChange)
        }
    }, [query])

    return matches
}

/**
 * Hook for responsive value selection
 */
export function useResponsiveValue<T>(values: {
    xs?: T
    sm?: T
    md?: T
    lg?: T
    xl?: T
    '2xl'?: T
}): T | undefined {
    const breakpoint = useBreakpoint()

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
 * Hook for debounced resize events
 */
export function useDebouncedResize(
    callback: () => void,
    delay: number = 250
): void {
    useEffect(() => {
        let timeoutId: NodeJS.Timeout

        const handleResize = () => {
            clearTimeout(timeoutId)
            timeoutId = setTimeout(callback, delay)
        }

        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize)
            clearTimeout(timeoutId)
        }
    }, [callback, delay])
}

/**
 * Hook for element dimensions
 */
export function useElementDimensions<T extends HTMLElement>(): {
    ref: React.RefObject<T | null>
    dimensions: { width: number; height: number }
} {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
    const ref = useRef<T>(null)

    useEffect(() => {
        if (!ref.current) return

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect
                setDimensions({ width, height })
            }
        })

        resizeObserver.observe(ref.current)

        return () => {
            resizeObserver.disconnect()
        }
    }, [])

    return { ref, dimensions }
}

/**
 * Hook for container queries (when supported)
 */
export function useContainerQuery(
    query: string
): {
    ref: React.RefObject<HTMLDivElement | null>
    matches: boolean
} {
    const [matches, setMatches] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!ref.current) return

        // Check if container queries are supported
        if (!('container' in document.documentElement.style)) {
            // Fallback to regular media query
            setMatches(matchesMediaQuery(query))
            return
        }

        // Use ResizeObserver as a fallback for container query detection
        const resizeObserver = new ResizeObserver(() => {
            // This is a simplified implementation
            // In production, use a proper container query polyfill
            setMatches(matchesMediaQuery(query))
        })

        resizeObserver.observe(ref.current)

        return () => {
            resizeObserver.disconnect()
        }
    }, [query])

    return { ref, matches }
}

/**
 * Hook for preferred color scheme
 */
export function usePreferredColorScheme(): 'light' | 'dark' {
    const [scheme, setScheme] = useState<'light' | 'dark'>(() => {
        if (typeof window === 'undefined') return 'light'
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    })

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

        const handleChange = (e: MediaQueryListEvent) => {
            setScheme(e.matches ? 'dark' : 'light')
        }

        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleChange)
            return () => mediaQuery.removeEventListener('change', handleChange)
        }

        return undefined
    }, [])

    return scheme
}
