/**
 * Accessibility Provider Component
 * Provides global accessibility context and utilities
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AriaLiveRegions, announceToScreenReader } from '@/hooks/accessibility/use-aria-live';
import type { AccessibilityConfig } from '@/types/design-tokens';

interface AccessibilityContextValue {
  config: AccessibilityConfig;
  updateConfig: (updates: Partial<AccessibilityConfig>) => void;
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  isKeyboardNavigation: boolean;
  setKeyboardNavigation: (enabled: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

export interface AccessibilityProviderProps {
  children: React.ReactNode;
  initialConfig?: Partial<AccessibilityConfig>;
}

const DEFAULT_CONFIG: AccessibilityConfig = {
  announcements: true,
  reducedMotion: false,
  highContrast: false,
  focusVisible: true,
  screenReaderOptimizations: true,
};

export function AccessibilityProvider({ 
  children, 
  initialConfig = {} 
}: AccessibilityProviderProps) {
  const [config, setConfig] = useState<AccessibilityConfig>({
    ...DEFAULT_CONFIG,
    ...initialConfig,
  });
  
  const [isKeyboardNavigation, setIsKeyboardNavigation] = useState(false);

  // Detect user preferences
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQueries = {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
      highContrast: window.matchMedia('(prefers-contrast: high)'),
    };

    const updatePreferences = () => {
      setConfig(prev => ({
        ...prev,
        reducedMotion: mediaQueries.reducedMotion.matches,
        highContrast: mediaQueries.highContrast.matches,
      }));
    };

    // Initial check
    updatePreferences();

    // Listen for changes
    Object.values(mediaQueries).forEach(mq => {
      mq.addEventListener('change', updatePreferences);
    });

    return () => {
      Object.values(mediaQueries).forEach(mq => {
        mq.removeEventListener('change', updatePreferences);
      });
    };
  }, []);

  // Keyboard navigation detection
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        setIsKeyboardNavigation(true);
        document.body.classList.add('keyboard-navigation-active');
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardNavigation(false);
      document.body.classList.remove('keyboard-navigation-active');
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Apply CSS custom properties based on config
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;

    // Apply reduced motion
    if (config.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Apply high contrast
    if (config.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Apply focus visible
    if (config.focusVisible) {
      root.classList.add('focus-visible-enabled');
    } else {
      root.classList.remove('focus-visible-enabled');
    }
  }, [config]);

  const updateConfig = useCallback((updates: Partial<AccessibilityConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (config.announcements) {
      announceToScreenReader(message, priority);
    }
  }, [config.announcements]);

  const contextValue: AccessibilityContextValue = {
    config,
    updateConfig,
    announce,
    isKeyboardNavigation,
    setKeyboardNavigation: setIsKeyboardNavigation,
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      <AriaLiveRegions />
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility(): AccessibilityContextValue {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

/**
 * Hook for managing motion preferences
 */
export function useReducedMotion(): boolean {
  const { config } = useAccessibility();
  return config.reducedMotion;
}

/**
 * Hook for managing high contrast preferences
 */
export function useHighContrast(): boolean {
  const { config } = useAccessibility();
  return config.highContrast;
}

/**
 * Hook for keyboard navigation state
 */
export function useKeyboardNavigation(): {
  isKeyboardNavigation: boolean;
  setKeyboardNavigation: (enabled: boolean) => void;
} {
  const { isKeyboardNavigation, setKeyboardNavigation } = useAccessibility();
  return { 
    isKeyboardNavigation, 
    setKeyboardNavigation 
  };
}

/**
 * Hook for screen reader announcements
 */
export function useScreenReader(): {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  isEnabled: boolean;
} {
  const { announce, config } = useAccessibility();
  return {
    announce,
    isEnabled: config.screenReaderOptimizations,
  };
}