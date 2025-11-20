/**
 * Utility Class Generator
 * Provides type-safe utility class generation using design tokens
 */

/**
 * Spacing utilities using design tokens
 */
export const spacing = {
    p: (size: number) => `p-${size}`,
    px: (size: number) => `px-${size}`,
    py: (size: number) => `py-${size}`,
    pt: (size: number) => `pt-${size}`,
    pr: (size: number) => `pr-${size}`,
    pb: (size: number) => `pb-${size}`,
    pl: (size: number) => `pl-${size}`,
    m: (size: number) => `m-${size}`,
    mx: (size: number) => `mx-${size}`,
    my: (size: number) => `my-${size}`,
    mt: (size: number) => `mt-${size}`,
    mr: (size: number) => `mr-${size}`,
    mb: (size: number) => `mb-${size}`,
    ml: (size: number) => `ml-${size}`,
    gap: (size: number) => `gap-${size}`,
} as const

/**
 * Typography utilities using design tokens
 */
export const typography = {
    size: (size: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl') => `text-${size}`,
    weight: (weight: 'thin' | 'light' | 'normal' | 'medium' | 'semibold' | 'bold') => `font-${weight}`,
    leading: (height: 'none' | 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose') => `leading-${height}`,
    align: (alignment: 'left' | 'center' | 'right') => `text-${alignment}`,
} as const

/**
 * Color utilities using design tokens
 */
export const colors = {
    text: (color: 'primary' | 'secondary' | 'tertiary' | 'disabled' | 'inverse' | 'success' | 'warning' | 'error' | 'info') => `text-${color}`,
    bg: (color: 'primary' | 'secondary' | 'surface' | 'background' | 'success' | 'warning' | 'error' | 'info') => `bg-${color}`,
    border: (color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info') => `border-${color}`,
} as const

/**
 * Layout utilities
 */
export const layout = {
    display: (type: 'block' | 'inline' | 'inline-block' | 'flex' | 'grid' | 'hidden') => type === 'hidden' ? 'hidden' : type,
    flex: {
        direction: (dir: 'row' | 'col') => `flex-${dir}`,
        align: (align: 'start' | 'center' | 'end') => `items-${align}`,
        justify: (justify: 'start' | 'center' | 'end' | 'between') => `justify-${justify}`,
    },
    grid: {
        cols: (cols: number) => `grid-cols-${cols}`,
    },
    position: (pos: 'relative' | 'absolute' | 'fixed' | 'sticky') => pos,
    container: (size?: 'sm' | 'md' | 'lg' | 'xl' | 'fluid') => size ? `container-${size}` : 'container',
} as const

/**
 * Border utilities
 */
export const borders = {
    radius: (size: 'none' | 'sm' | 'base' | 'md' | 'lg' | 'xl' | 'full') => size === 'none' ? 'rounded-none' : `rounded-${size === 'base' ? '' : size}`,
    width: (width: 0 | 1 | 2) => width === 0 ? 'border-0' : `border-${width}`,
    side: (side: 't' | 'r' | 'b' | 'l') => `border-${side}`,
} as const

/**
 * Shadow utilities
 */
export const shadows = {
    size: (size: 'xs' | 'sm' | 'base' | 'md' | 'lg' | 'xl') => size === 'base' ? 'shadow' : `shadow-${size}`,
} as const

/**
 * Animation utilities
 */
export const animations = {
    transition: (type?: 'colors' | 'transform' | 'opacity') => type ? `transition-${type}` : 'transition',
    duration: (duration: 75 | 100 | 150 | 200 | 300 | 500) => `duration-${duration}`,
    ease: (easing: 'linear' | 'in' | 'out' | 'in-out') => `ease-${easing}`,
} as const

/**
 * Accessibility utilities
 */
export const a11y = {
    srOnly: () => 'sr-only',
    srOnlyFocusable: () => 'sr-only-focusable',
    focusVisible: () => 'focus-visible',
    touchTarget: (large?: boolean) => large ? 'touch-target-large' : 'touch-target',
} as const

/**
 * Responsive utilities
 */
export const responsiveUtils = {
    breakpoint: (bp: 'xs' | 'sm' | 'md' | 'lg' | 'xl', className: string) => `${bp}\\:${className}`,
} as const

/**
 * Theme utilities
 */
export const theme = {
    color: (type: 'primary' | 'secondary' | 'accent') => `theme-${type}`,
    bg: (type: 'primary' | 'secondary' | 'accent' | 'background') => `theme-bg-${type}`,
    text: (type: 'primary' | 'secondary' | 'accent') => `theme-text-${type}`,
    border: (type: 'primary' | 'secondary' | 'accent') => `theme-border-${type}`,
    font: (type: 'heading' | 'body') => `theme-font-${type}`,
    button: (variant: 'primary' | 'secondary' | 'outline') => `theme-button-${variant}`,
    section: (type?: 'hero' | 'photo-gallery' | 'events' | 'gift-portal') => type ? `theme-${type}` : 'theme-section',
} as const

/**
 * Combine multiple utility classes
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ')
}

/**
 * Generate responsive utility classes
 */
export function generateResponsiveClasses(
    base: string,
    breakpoints?: {
        xs?: string
        sm?: string
        md?: string
        lg?: string
        xl?: string
    }
): string {
    const classes = [base]

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
 * Generate state-based utility classes
 */
export function withStates(
    base: string,
    states?: {
        hover?: string
        focus?: string
        active?: string
        disabled?: string
    }
): string {
    const classes = [base]

    if (states) {
        if (states.hover) classes.push(`hover:${states.hover}`)
        if (states.focus) classes.push(`focus:${states.focus}`)
        if (states.active) classes.push(`active:${states.active}`)
        if (states.disabled) classes.push(`disabled:${states.disabled}`)
    }

    return classes.join(' ')
}

/**
 * Common component class patterns
 */
export const components = {
    button: {
        base: () => cn(
            'btn',
            'inline-flex',
            'items-center',
            'justify-center',
            'touch-target',
            'transition',
            'focus-visible'
        ),
        primary: () => cn(components.button.base(), 'btn-primary'),
        secondary: () => cn(components.button.base(), 'btn-secondary'),
        outline: () => cn(components.button.base(), 'btn-outline'),
    },
    card: {
        base: () => cn('card', 'rounded-lg', 'shadow-sm', 'transition'),
    },
    input: {
        base: () => cn(
            'w-full',
            'px-3',
            'py-2',
            'border',
            'rounded-md',
            'focus:ring',
            'transition'
        ),
    },
    section: {
        base: () => cn('section', 'py-16'),
        container: () => cn('container', 'mx-auto'),
    },
} as const

/**
 * Performance utilities
 */
export const performance = {
    willChange: (property: 'auto' | 'scroll' | 'contents' | 'transform') => `will-change-${property}`,
    contain: (type: 'none' | 'strict' | 'content' | 'size' | 'layout' | 'style' | 'paint') => `contain-${type}`,
    lazy: () => 'lazy-image',
    blurPlaceholder: () => 'blur-placeholder',
} as const
