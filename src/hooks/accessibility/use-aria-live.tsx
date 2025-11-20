/**
 * ARIA Live Region Hook
 * Provides screen reader announcements for dynamic content changes
 */

import React, { useCallback, useRef, useEffect } from 'react';

export interface AriaLiveRegion {
  announce(message: string, priority?: 'polite' | 'assertive'): void;
  clear(): void;
}

export interface AriaLiveOptions {
  /**
   * Default priority for announcements
   * @default 'polite'
   */
  defaultPriority?: 'polite' | 'assertive';
  
  /**
   * Delay before clearing the announcement (in ms)
   * @default 1000
   */
  clearDelay?: number;
  
  /**
   * Whether to deduplicate consecutive identical messages
   * @default true
   */
  deduplicate?: boolean;
}

/**
 * Hook for managing ARIA live regions for screen reader announcements
 */
export function useAriaLive(options: AriaLiveOptions = {}): AriaLiveRegion {
  const {
    defaultPriority = 'polite',
    clearDelay = 1000,
    deduplicate = true,
  } = options;

  const politeRef = useRef<HTMLDivElement | null>(null);
  const assertiveRef = useRef<HTMLDivElement | null>(null);
  const lastMessageRef = useRef<string>('');
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const announce = useCallback(
    (message: string, priority: 'polite' | 'assertive' = defaultPriority) => {
      // Skip if message is identical to the last one and deduplication is enabled
      if (deduplicate && message === lastMessageRef.current) {
        return;
      }

      const element = priority === 'polite' ? politeRef.current : assertiveRef.current;
      
      if (element) {
        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // Set the message
        element.textContent = message;
        lastMessageRef.current = message;

        // Clear the message after delay
        timeoutRef.current = setTimeout(() => {
          element.textContent = '';
          lastMessageRef.current = '';
        }, clearDelay);
      }
    },
    [defaultPriority, clearDelay, deduplicate]
  );

  const clear = useCallback(() => {
    if (politeRef.current) politeRef.current.textContent = '';
    if (assertiveRef.current) assertiveRef.current.textContent = '';
    lastMessageRef.current = '';
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { announce, clear };
}

/**
 * Component for rendering ARIA live regions
 * Should be placed once in the app root
 */
export function AriaLiveRegions() {
  return (
    <>
      <div
        ref={(el: HTMLDivElement | null) => {
          if (el) {
            // Store reference globally for the hook to access
            (window as any).__ariaLivePolite = el;
          }
        }}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        data-testid="aria-live-polite"
      />
      <div
        ref={(el: HTMLDivElement | null) => {
          if (el) {
            // Store reference globally for the hook to access
            (window as any).__ariaLiveAssertive = el;
          }
        }}
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        data-testid="aria-live-assertive"
      />
    </>
  );
}

/**
 * Global announcement function that can be used outside of React components
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  if (typeof window === 'undefined') return;

  const element = priority === 'polite' 
    ? (window as any).__ariaLivePolite 
    : (window as any).__ariaLiveAssertive;

  if (element) {
    element.textContent = message;
    
    // Clear after 1 second
    setTimeout(() => {
      element.textContent = '';
    }, 1000);
  }
}