/**
 * Keyboard Navigation Hook
 * Provides utilities for implementing accessible keyboard navigation
 */

import { useCallback, useRef, useEffect, useState } from 'react';

export interface NavigationItem {
    id: string;
    element?: HTMLElement | null;
    disabled?: boolean;
    onSelect?: () => void;
    onFocus?: () => void;
    onBlur?: () => void;
}

export interface KeyboardNavigationOptions {
    /**
     * Navigation orientation
     * @default 'vertical'
     */
    orientation?: 'horizontal' | 'vertical' | 'both';

    /**
     * Whether navigation should wrap around
     * @default true
     */
    wrap?: boolean;

    /**
     * Whether to skip disabled items
     * @default true
     */
    skipDisabled?: boolean;

    /**
     * Custom key handlers
     */
    customKeys?: Record<string, (event: KeyboardEvent, currentIndex: number) => void>;

    /**
     * Whether to prevent default behavior for handled keys
     * @default true
     */
    preventDefault?: boolean;
}

export interface KeyboardNavigationReturn {
    focusedIndex: number;
    setFocusedIndex: (index: number) => void;
    handleKeyDown: (event: KeyboardEvent) => void;
    focusItem: (index: number) => void;
    focusNext: () => void;
    focusPrevious: () => void;
    focusFirst: () => void;
    focusLast: () => void;
    registerItem: (index: number, element: HTMLElement | null) => void;
    unregisterItem: (index: number) => void;
}

/**
 * Hook for managing keyboard navigation in lists, menus, and other components
 */
export function useKeyboardNavigation(
    items: NavigationItem[],
    options: KeyboardNavigationOptions = {}
): KeyboardNavigationReturn {
    const {
        orientation = 'vertical',
        wrap = true,
        skipDisabled = true,
        customKeys = {},
        preventDefault = true,
    } = options;

    const [focusedIndex, setFocusedIndex] = useState(0);
    const itemRefs = useRef<Map<number, HTMLElement | null>>(new Map());

    // Get valid (non-disabled) item indices
    const getValidIndices = useCallback(() => {
        return items
            .map((item, index) => ({ item, index }))
            .filter(({ item }) => !skipDisabled || !item.disabled)
            .map(({ index }) => index);
    }, [items, skipDisabled]);

    // Find next valid index
    const getNextIndex = useCallback((currentIndex: number, direction: 1 | -1) => {
        const validIndices = getValidIndices();
        if (validIndices.length === 0) return currentIndex;

        const currentValidIndex = validIndices.indexOf(currentIndex);
        let nextValidIndex = currentValidIndex + direction;

        if (wrap) {
            if (nextValidIndex >= validIndices.length) nextValidIndex = 0;
            if (nextValidIndex < 0) nextValidIndex = validIndices.length - 1;
        } else {
            nextValidIndex = Math.max(0, Math.min(validIndices.length - 1, nextValidIndex));
        }

        return validIndices[nextValidIndex] ?? currentIndex;
    }, [getValidIndices, wrap]);

    // Focus management functions
    const focusItem = useCallback((index: number) => {
        const element = itemRefs.current.get(index);
        if (element && (!skipDisabled || !items[index]?.disabled)) {
            element.focus();
            setFocusedIndex(index);
            items[index]?.onFocus?.();
        }
    }, [items, skipDisabled]);

    const focusNext = useCallback(() => {
        const nextIndex = getNextIndex(focusedIndex, 1);
        focusItem(nextIndex);
    }, [focusedIndex, getNextIndex, focusItem]);

    const focusPrevious = useCallback(() => {
        const nextIndex = getNextIndex(focusedIndex, -1);
        focusItem(nextIndex);
    }, [focusedIndex, getNextIndex, focusItem]);

    const focusFirst = useCallback(() => {
        const validIndices = getValidIndices();
        if (validIndices.length > 0) {
            focusItem(validIndices[0]);
        }
    }, [getValidIndices, focusItem]);

    const focusLast = useCallback(() => {
        const validIndices = getValidIndices();
        if (validIndices.length > 0) {
            focusItem(validIndices[validIndices.length - 1]);
        }
    }, [getValidIndices, focusItem]);

    // Key event handler
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            const { key } = event;
            let handled = false;

            // Check custom key handlers first
            if (customKeys[key]) {
                customKeys[key](event, focusedIndex);
                handled = true;
            } else {
                // Standard navigation keys
                switch (key) {
                    case 'ArrowDown':
                        if (orientation === 'vertical' || orientation === 'both') {
                            focusNext();
                            handled = true;
                        }
                        break;
                    case 'ArrowUp':
                        if (orientation === 'vertical' || orientation === 'both') {
                            focusPrevious();
                            handled = true;
                        }
                        break;
                    case 'ArrowRight':
                        if (orientation === 'horizontal' || orientation === 'both') {
                            focusNext();
                            handled = true;
                        }
                        break;
                    case 'ArrowLeft':
                        if (orientation === 'horizontal' || orientation === 'both') {
                            focusPrevious();
                            handled = true;
                        }
                        break;
                    case 'Home':
                        focusFirst();
                        handled = true;
                        break;
                    case 'End':
                        focusLast();
                        handled = true;
                        break;
                    case 'Enter':
                    case ' ':
                        const currentItem = items[focusedIndex];
                        if (currentItem && !currentItem.disabled) {
                            currentItem.onSelect?.();
                            handled = true;
                        }
                        break;
                }
            }

            if (handled && preventDefault) {
                event.preventDefault();
                event.stopPropagation();
            }
        },
        [
            customKeys,
            focusedIndex,
            orientation,
            focusNext,
            focusPrevious,
            focusFirst,
            focusLast,
            items,
            preventDefault,
        ]
    );

    // Item registration functions
    const registerItem = useCallback((index: number, element: HTMLElement | null) => {
        itemRefs.current.set(index, element);
    }, []);

    const unregisterItem = useCallback((index: number) => {
        itemRefs.current.delete(index);
    }, []);

    // Auto-focus the focused item when it changes
    useEffect(() => {
        const element = itemRefs.current.get(focusedIndex);
        if (element && document.activeElement !== element) {
            element.focus();
        }
    }, [focusedIndex]);

    return {
        focusedIndex,
        setFocusedIndex,
        handleKeyDown,
        focusItem,
        focusNext,
        focusPrevious,
        focusFirst,
        focusLast,
        registerItem,
        unregisterItem,
    };
}

/**
 * Hook for managing roving tabindex pattern
 */
export function useRovingTabIndex(
    items: NavigationItem[],
    options: KeyboardNavigationOptions = {}
) {
    const navigation = useKeyboardNavigation(items, options);

    // Get tabindex for an item
    const getTabIndex = useCallback((index: number) => {
        return index === navigation.focusedIndex ? 0 : -1;
    }, [navigation.focusedIndex]);

    // Get props for an item
    const getItemProps = useCallback((index: number) => {
        return {
            tabIndex: getTabIndex(index),
            onFocus: () => navigation.setFocusedIndex(index),
            onKeyDown: navigation.handleKeyDown,
            ref: (element: HTMLElement | null) => navigation.registerItem(index, element),
        };
    }, [getTabIndex, navigation]);

    return {
        ...navigation,
        getTabIndex,
        getItemProps,
    };
}