/**
 * Responsive Image Component
 * Optimized image component with lazy loading and responsive sizing
 */

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { getResponsiveImageSizes, getDevicePixelRatio } from '@/lib/responsive/responsive-utils'

export interface ResponsiveImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  sizes?: string
  srcSet?: string
  priority?: boolean
  loading?: 'lazy' | 'eager'
  quality?: number
  className?: string
  style?: React.CSSProperties
  onLoad?: () => void
  onError?: () => void
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
}

export function ResponsiveImage({
  src,
  alt,
  width,
  height,
  sizes,
  srcSet,
  priority = false,
  loading = 'lazy',
  quality = 75,
  className = '',
  style,
  onLoad,
  onError,
  placeholder = 'blur',
  blurDataURL,
}: ResponsiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(priority)
  const imgRef = useRef<HTMLImageElement>(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || loading === 'eager') {
      setIsInView(true)
      return
    }

    if (!imgRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
      }
    )

    observer.observe(imgRef.current)

    return () => {
      observer.disconnect()
    }
  }, [priority, loading])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    onError?.()
  }

  // Generate optimized src for different screen densities
  const getOptimizedSrc = (baseSrc: string): string => {
    const dpr = getDevicePixelRatio()

    // If it's a Google Drive image, optimize it
    if (baseSrc.includes('drive.google.com')) {
      return baseSrc.replace(/\/view\?.*$/, '/preview')
    }

    // Add quality parameter if supported
    if (baseSrc.includes('?')) {
      return `${baseSrc}&q=${quality}&dpr=${dpr}`
    }

    return baseSrc
  }

  // Generate responsive sizes attribute
  const responsiveSizes = sizes || getResponsiveImageSizes()

  // Error fallback
  if (hasError) {
    return (
      <div
        className={`responsive-image-error ${className}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-neutral-200)',
          color: 'var(--color-neutral-600)',
          borderRadius: 'var(--radius-md)',
          width: width || '100%',
          height: height || 'auto',
          minHeight: '200px',
          ...style,
        }}
      >
        <span className="text-sm">Image unavailable</span>
      </div>
    )
  }

  return (
    <div
      className={`responsive-image-container ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Blur placeholder */}
      {placeholder === 'blur' && !isLoaded && (
        <div
          className="responsive-image-placeholder"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'var(--color-neutral-200)',
            backgroundImage: blurDataURL ? `url(${blurDataURL})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(10px)',
            transform: 'scale(1.1)',
          }}
        />
      )}

      {/* Actual image */}
      <img
        ref={imgRef}
        src={isInView ? getOptimizedSrc(src) : undefined}
        srcSet={isInView && srcSet ? srcSet : undefined}
        sizes={responsiveSizes}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={`responsive-image ${isLoaded ? 'loaded' : ''}`}
        style={{
          display: 'block',
          width: '100%',
          height: 'auto',
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
        }}
      />

      {/* Loading indicator */}
      {!isLoaded && !hasError && isInView && (
        <div
          className="responsive-image-loading"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--color-neutral-100)',
          }}
        >
          <div className="loading-spinner" />
        </div>
      )}
    </div>
  )
}

/**
 * Responsive Picture Component with multiple sources
 */
export interface ResponsivePictureProps {
  sources: Array<{
    srcSet: string
    media?: string
    type?: string
  }>
  fallbackSrc: string
  alt: string
  width?: number
  height?: number
  className?: string
  style?: React.CSSProperties
  loading?: 'lazy' | 'eager'
  onLoad?: () => void
  onError?: () => void
}

export function ResponsivePicture({
  sources,
  fallbackSrc,
  alt,
  width,
  height,
  className = '',
  style,
  loading = 'lazy',
  onLoad,
  onError,
}: ResponsivePictureProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    onError?.()
  }

  if (hasError) {
    return (
      <div
        className={`responsive-picture-error ${className}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-neutral-200)',
          color: 'var(--color-neutral-600)',
          borderRadius: 'var(--radius-md)',
          width: width || '100%',
          height: height || 'auto',
          minHeight: '200px',
          ...style,
        }}
      >
        <span className="text-sm">Image unavailable</span>
      </div>
    )
  }

  return (
    <picture className={`responsive-picture ${className}`} style={style}>
      {sources.map((source, index) => (
        <source
          key={index}
          srcSet={source.srcSet}
          media={source.media}
          type={source.type}
        />
      ))}
      <img
        src={fallbackSrc}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          display: 'block',
          width: '100%',
          height: 'auto',
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
        }}
      />
    </picture>
  )
}

/**
 * Responsive Background Image Component
 */
export interface ResponsiveBackgroundProps {
  src: string
  alt?: string
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
  overlay?: boolean
  overlayOpacity?: number
}

export function ResponsiveBackground({
  src,
  alt,
  children,
  className = '',
  style,
  overlay = false,
  overlayOpacity = 0.5,
}: ResponsiveBackgroundProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const img = new Image()
    img.src = src
    img.onload = () => setIsLoaded(true)
  }, [src])

  return (
    <div
      className={`responsive-background ${className}`}
      style={{
        position: 'relative',
        backgroundImage: isLoaded ? `url(${src})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        ...style,
      }}
      role="img"
      aria-label={alt}
    >
      {overlay && (
        <div
          className="responsive-background-overlay"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`,
          }}
        />
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  )
}
