'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { ThemeConfig, SanityService } from '@/lib/sanity/service'

interface ThemeContextType {
  theme: ThemeConfig
  setTheme: (theme: ThemeConfig) => void
  applyTheme: (templateId: string) => Promise<void>
  resetToDefault: () => void
  isLoading: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: React.ReactNode
  initialTheme?: ThemeConfig
}

export function ThemeProvider({ children, initialTheme }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeConfig>(
    initialTheme || SanityService.getDefaultTheme()
  )
  const [isLoading, setIsLoading] = useState(false)

  const setTheme = (newTheme: ThemeConfig) => {
    setThemeState(newTheme)
    applyThemeToDOM(newTheme)
    
    // Store theme in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('wedflow-theme', JSON.stringify(newTheme))
    }
  }

  const applyTheme = async (templateId: string) => {
    setIsLoading(true)
    try {
      const template = await SanityService.getWeddingTemplate(templateId)
      if (template) {
        const themeConfig = SanityService.extractThemeConfig(template)
        setTheme(themeConfig)
      }
    } catch (error) {
      console.error('Error applying theme:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetToDefault = () => {
    const defaultTheme = SanityService.getDefaultTheme()
    setTheme(defaultTheme)
  }

  const applyThemeToDOM = (themeConfig: ThemeConfig) => {
    if (typeof window === 'undefined') return

    const root = document.documentElement
    
    // Apply CSS custom properties
    root.style.setProperty('--color-primary', themeConfig.colors.primary)
    root.style.setProperty('--color-secondary', themeConfig.colors.secondary)
    root.style.setProperty('--color-accent', themeConfig.colors.accent)
    root.style.setProperty('--color-background', themeConfig.colors.background)
    
    // Apply font families
    root.style.setProperty('--font-heading', themeConfig.fonts.heading)
    root.style.setProperty('--font-body', themeConfig.fonts.body)
    
    // Apply layout classes
    root.setAttribute('data-layout-style', themeConfig.layout.style)
    root.setAttribute('data-header-style', themeConfig.layout.headerStyle)
  }

  // Load theme from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('wedflow-theme')
      if (savedTheme) {
        try {
          const parsedTheme = JSON.parse(savedTheme)
          setThemeState(parsedTheme)
          applyThemeToDOM(parsedTheme)
        } catch (error) {
          console.error('Error parsing saved theme:', error)
        }
      } else {
        // Apply initial theme to DOM
        applyThemeToDOM(theme)
      }
    }
  }, [])

  const value: ThemeContextType = {
    theme,
    setTheme,
    applyTheme,
    resetToDefault,
    isLoading
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}