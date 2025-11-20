/**
 * Focus Management Hook
 * Provides utilities for managing focus in modal dialogs and dynamic content
 */

import React, { useCallback, useRef, useEffect, useState } from 'react';

export interface FocusableElement extends HTMLElement {
    focus(): void;
}

export interface FocusTrapOptions {
    /**
     * Whether the focus trap is active
     * @default true
     */
    enabled?: boolean;

    /**
     * Element to focus when trap is activated
     */
    initialFocus?: HTMLElement | (() => HTMLElement | null);

    /**
     * Element to focus when trap is deactivated
     */
    returnFocus?: HTMLElement | (() => HTMLElement | null);

    /**
     * Whether to include elements with tabindex="-1"
     * @default false
     */
    includeNegativeTabIndex?: boolean;

    /**
     * Custom selector for focusable elements
     */
    focusableSelector?: string;
}

export interface FocusManagementReturn {
    trapRef: React.RefObject<HTMLElement | null>;
    activate: () => void;
    deactivate: () => void;
    focusFirst: () => void;
    focusLast: () => void;
    getFocusableElements: () => HTMLElement[];
}

// Default selector for focusable elements
const DEFAULT_FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
    'audio[controls]',
    'video[controls]',
    'details > summary',
].join(', ');

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(
    container: HTMLElement,
    options: {
        includeNegativeTabIndex?: boolean;
        selector?: string;
    } = {}
): HTMLElement[] {
    const {
        includeNegativeTabIndex = false,
        selector = DEFAULT_FOCUSABLE_SELECTOR,
    } = options;

    let focusableSelector = selector;

    if (includeNegativeTabIndex) {
        focusableSelector += ', [tabindex="-1"]';
    }

    const elements = Array.from(
        container.querySelectorAll<HTMLElement>(focusableSelector)
    );

    return elements.filter(element => {
        // Check if element is visible and not disabled
        const style = window.getComputedStyle(element);
        return (
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            !element.hasAttribute('disabled') &&
            !element.getAttribute('aria-disabled')
        );
    });
}

/**
 * Hook for managing focus traps in modal dialogs
 */
export function useFocusTrap(options: FocusTrapOptions = {}): FocusManagementReturn {
    const {
        enabled = true,
        initialFocus,
        returnFocus,
        includeNegativeTabIndex = false,
        focusableSelector = DEFAULT_FOCUSABLE_SELECTOR,
    } = options;

    const trapRef = useRef<HTMLElement>(null);
    const previousActiveElement = useRef<HTMLElement | null>(null);
    const isActive = useRef(false);

    const getFocusableElementsInTrap = useCallback(() => {
        if (!trapRef.current) return [];

        return getFocusableElements(trapRef.current, {
            includeNegativeTabIndex,
            selector: focusableSelector,
        });
    }, [includeNegativeTabIndex, focusableSelector]);

    const focusFirst = useCallback(() => {
        const elements = getFocusableElementsInTrap();
        if (elements.length > 0) {
            elements[0].focus();
        }
    }, [getFocusableElementsInTrap]);

    const focusLast = useCallback(() => {
        const elements = getFocusableElementsInTrap();
        if (elements.length > 0) {
            elements[elements.length - 1].focus();
        }
    }, [getFocusableElementsInTrap]);

    const handleTabKey = useCallback((event: KeyboardEvent) => {
        if (!enabled || !isActive.current || event.key !== 'Tab') return;

        const elements = getFocusableElementsInTrap();
        if (elements.length === 0) return;

        const firstElement = elements[0];
        const lastElement = elements[elements.length - 1];
        const activeElement = document.activeElement as HTMLElement;

        if (event.shiftKey) {
            // Shift + Tab
            if (activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            }
        } else {
            // Tab
            if (activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }
    }, [enabled, getFocusableElementsInTrap]);

    const handleEscapeKey = useCallback((event: KeyboardEvent) => {
        if (!enabled || !isActive.current || event.key !== 'Escape') return;

        // Allow custom escape handling by not preventing default
        // The parent component should handle deactivation
    }, [enabled]);

    const activate = useCallback(() => {
        if (!enabled || isActive.current) return;

        // Store the currently focused element
        previousActiveElement.current = document.activeElement as HTMLElement;
        isActive.current = true;

        // Focus initial element
        if (initialFocus) {
            const element = typeof initialFocus === 'function' ? initialFocus() : initialFocus;
            if (element) {
                element.focus();
            } else {
                focusFirst();
            }
        } else {
            focusFirst();
        }

        // Add event listeners
        document.addEventListener('keydown', handleTabKey);
        document.addEventListener('keydown', handleEscapeKey);
    }, [enabled, initialFocus, focusFirst, handleTabKey, handleEscapeKey]);

    const deactivate = useCallback(() => {
        if (!isActive.current) return;

        isActive.current = false;

        // Remove event listeners
        document.removeEventListener('keydown', handleTabKey);
        document.removeEventListener('keydown', handleEscapeKey);

        // Return focus
        if (returnFocus) {
            const element = typeof returnFocus === 'function' ? returnFocus() : returnFocus;
            if (element) {
                element.focus();
            }
        } else if (previousActiveElement.current) {
            previousActiveElement.current.focus();
        }

        previousActiveElement.current = null;
    }, [returnFocus, handleTabKey, handleEscapeKey]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (isActive.current) {
                deactivate();
            }
        };
    }, [deactivate]);

    return {
        trapRef,
        activate,
        deactivate,
        focusFirst,
        focusLast,
        getFocusableElements: getFocusableElementsInTrap,
    };
}

/**
 * Hook for managing focus restoration
 */
export function useFocusRestore() {
    const previousActiveElement = useRef<HTMLElement | null>(null);

    const saveFocus = useCallback(() => {
        previousActiveElement.current = document.activeElement as HTMLElement;
    }, []);

    const restoreFocus = useCallback(() => {
        if (previousActiveElement.current) {
            previousActiveElement.current.focus();
            previousActiveElement.current = null;
        }
    }, []);

    return { saveFocus, restoreFocus };
}

/**
 * Hook for managing focus within a specific element
 */
export function useFocusWithin(): {
    ref: React.RefObject<HTMLElement | null>;
    isFocusWithin: boolean;
} {
    const [isFocusWithin, setIsFocusWithin] = useState(false);
    const ref = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const handleFocusIn = (event: FocusEvent) => {
            if (element.contains(event.target as Node)) {
                setIsFocusWithin(true);
            }
        };

        const handleFocusOut = (event: FocusEvent) => {
            if (!element.contains(event.relatedTarget as Node)) {
                setIsFocusWithin(false);
            }
        };

        document.addEventListener('focusin', handleFocusIn);
        document.addEventListener('focusout', handleFocusOut);

        return () => {
            document.removeEventListener('focusin', handleFocusIn);
            document.removeEventListener('focusout', handleFocusOut);
        };
    }, []);

    return {
        ref,
        isFocusWithin
    };
}