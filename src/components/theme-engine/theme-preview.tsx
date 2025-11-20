/**
 * Theme Preview Component
 * Provides real-time preview of theme changes
 */

'use client'

import React, { useEffect, useRef } from 'react'
import { Theme } from '@/lib/theme-engine/theme-engine'

export interface ThemePreviewProps {
  theme: Theme
  className?: string
  showValidation?: boolean
}

export function ThemePreview({ theme, className = '', showValidation = false }: ThemePreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!previewRef.current) return

    // Apply theme CSS variables to preview container
    const container = previewRef.current
    container.style.setProperty('--theme-primary', theme.colors.primary)
    container.style.setProperty('--theme-secondary', theme.colors.secondary)
    container.style.setProperty('--theme-accent', theme.colors.accent)
    container.style.setProperty('--theme-background', theme.colors.background)
    container.style.setProperty('--theme-font-heading', theme.typography.heading)
    container.style.setProperty('--theme-font-body', theme.typography.body)

    // Apply data attributes for layout
    container.setAttribute('data-layout-style', theme.layout.style)
    container.setAttribute('data-header-style', theme.layout.headerStyle)
  }, [theme])

  return (
    <div
      ref={previewRef}
      className={`theme-preview-container ${className}`}
      style={{
        backgroundColor: theme.colors.background,
        color: theme.colors.primary,
        fontFamily: theme.typography.body,
        padding: '2rem',
        borderRadius: '0.5rem',
        border: `1px solid ${theme.colors.secondary}`,
        minHeight: '400px',
      }}
    >
      {/* Hero Section Preview */}
      <div className="theme-hero mb-8">
        <h1
          style={{
            fontFamily: theme.typography.heading,
            color: theme.colors.primary,
            fontSize: '2.5rem',
            marginBottom: '1rem',
            textAlign: theme.layout.headerStyle === 'centered' ? 'center' : 'left',
          }}
        >
          Sarah & Michael
        </h1>
        <p
          style={{
            color: theme.colors.accent,
            fontSize: '1.25rem',
            marginBottom: '1.5rem',
            textAlign: theme.layout.headerStyle === 'centered' ? 'center' : 'left',
          }}
        >
          We're getting married!
        </p>
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: theme.layout.headerStyle === 'centered' ? 'center' : 'flex-start',
          }}
        >
          <button
            className="theme-button-primary"
            style={{
              backgroundColor: theme.colors.primary,
              color: theme.colors.background,
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              fontFamily: theme.typography.body,
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            View Details
          </button>
          <button
            className="theme-button-outline"
            style={{
              backgroundColor: 'transparent',
              color: theme.colors.primary,
              border: `2px solid ${theme.colors.primary}`,
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              fontFamily: theme.typography.body,
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            RSVP
          </button>
        </div>
      </div>

      {/* Event Card Preview */}
      <div
        className="theme-event-card"
        style={{
          backgroundColor: theme.colors.secondary,
          color: theme.colors.primary,
          padding: '1.5rem',
          borderRadius: '0.75rem',
          marginBottom: '1.5rem',
        }}
      >
        <h3
          style={{
            fontFamily: theme.typography.heading,
            fontSize: '1.5rem',
            marginBottom: '0.5rem',
          }}
        >
          Wedding Ceremony
        </h3>
        <p
          style={{
            color: theme.colors.accent,
            marginBottom: '0.5rem',
          }}
        >
          Saturday, June 15, 2024 at 4:00 PM
        </p>
        <p style={{ fontSize: '0.875rem' }}>
          Join us for our special day at the beautiful Garden Venue
        </p>
      </div>

      {/* Text Content Preview */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2
          style={{
            fontFamily: theme.typography.heading,
            color: theme.colors.primary,
            fontSize: '2rem',
            marginBottom: '1rem',
          }}
        >
          Our Story
        </h2>
        <p
          style={{
            fontFamily: theme.typography.body,
            color: theme.colors.primary,
            lineHeight: '1.6',
            marginBottom: '0.75rem',
          }}
        >
          We met in college and have been inseparable ever since. After years of adventures together,
          we're excited to start this new chapter of our lives.
        </p>
        <p
          style={{
            fontFamily: theme.typography.body,
            color: theme.colors.accent,
            lineHeight: '1.6',
          }}
        >
          We can't wait to celebrate with all of our friends and family!
        </p>
      </div>

      {/* Validation Indicators */}
      {showValidation && (
        <div
          style={{
            marginTop: '2rem',
            padding: '1rem',
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
          }}
        >
          <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Theme Preview</p>
          <p style={{ marginBottom: '0.25rem' }}>Layout: {theme.layout.style}</p>
          <p style={{ marginBottom: '0.25rem' }}>Header: {theme.layout.headerStyle}</p>
          <p>This is a preview of how your theme will look on your wedding site.</p>
        </div>
      )}
    </div>
  )
}

/**
 * Compact Theme Preview Card
 */
export interface ThemePreviewCardProps {
  theme: Theme
  isSelected?: boolean
  onClick?: () => void
  className?: string
}

export function ThemePreviewCard({
  theme,
  isSelected = false,
  onClick,
  className = '',
}: ThemePreviewCardProps) {
  return (
    <div
      className={`theme-preview-card ${isSelected ? 'selected' : ''} ${className}`}
      onClick={onClick}
      style={{
        backgroundColor: theme.colors.background,
        border: `2px solid ${isSelected ? theme.colors.primary : theme.colors.secondary}`,
        borderRadius: '0.5rem',
        padding: '1rem',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '0.75rem',
        }}
      >
        <div
          style={{
            width: '2rem',
            height: '2rem',
            backgroundColor: theme.colors.primary,
            borderRadius: '0.25rem',
          }}
          title="Primary Color"
        />
        <div
          style={{
            width: '2rem',
            height: '2rem',
            backgroundColor: theme.colors.secondary,
            borderRadius: '0.25rem',
          }}
          title="Secondary Color"
        />
        <div
          style={{
            width: '2rem',
            height: '2rem',
            backgroundColor: theme.colors.accent,
            borderRadius: '0.25rem',
          }}
          title="Accent Color"
        />
      </div>
      <h4
        style={{
          fontFamily: theme.typography.heading,
          color: theme.colors.primary,
          fontSize: '1rem',
          marginBottom: '0.25rem',
        }}
      >
        {theme.name}
      </h4>
      <p
        style={{
          fontFamily: theme.typography.body,
          color: theme.colors.accent,
          fontSize: '0.75rem',
        }}
      >
        {theme.layout.style} • {theme.layout.headerStyle}
      </p>
    </div>
  )
}

/**
 * Theme Comparison View
 */
export interface ThemeComparisonProps {
  themes: Theme[]
  className?: string
}

export function ThemeComparison({ themes, className = '' }: ThemeComparisonProps) {
  return (
    <div className={`theme-comparison ${className}`}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(themes.length, 3)}, 1fr)`,
          gap: '1rem',
        }}
      >
        {themes.map((theme) => (
          <ThemePreview key={theme.id} theme={theme} showValidation={false} />
        ))}
      </div>
    </div>
  )
}
