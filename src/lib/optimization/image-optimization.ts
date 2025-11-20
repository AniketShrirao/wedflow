/**
 * Image optimization utilities for photo galleries and public site performance
 */

import { useState, useEffect } from 'react';

export interface ImageOptimizationOptions {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpeg' | 'png';
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
    blur?: number;
    progressive?: boolean;
}

export interface OptimizedImage {
    src: string;
    width: number;
    height: number;
    format: string;
    size: number;
    placeholder?: string;
}

class ImageOptimizer {
    private cdnBaseUrl = process.env.NEXT_PUBLIC_CDN_URL || '';
    private defaultQuality = 80;
    private supportedFormats = ['webp', 'avif', 'jpeg', 'png'];

    /**
     * Generate optimized image URL for Google Drive images
     */
    optimizeGoogleDriveImage(
        driveUrl: string,
        options: ImageOptimizationOptions = {}
    ): string {
        try {
            // Extract file ID from Google Drive URL
            const fileId = this.extractGoogleDriveFileId(driveUrl);
            if (!fileId) return driveUrl;

            const {
                width = 800,
                height,
                quality = this.defaultQuality,
                format = 'webp'
            } = options;

            // Use Google Drive's built-in image transformation
            let optimizedUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;

            // Add size parameters if supported
            if (width || height) {
                const sizeParam = width && height ? `=${width}x${height}` : width ? `=w${width}` : `=h${height}`;
                optimizedUrl += sizeParam;
            }

            return optimizedUrl;
        } catch (error) {
            console.error('Failed to optimize Google Drive image:', error);
            return driveUrl;
        }
    }

    /**
     * Generate responsive image srcset for different screen sizes
     */
    generateResponsiveSrcSet(
        originalUrl: string,
        options: ImageOptimizationOptions = {}
    ): string {
        const breakpoints = [320, 640, 768, 1024, 1280, 1920];
        const { quality = this.defaultQuality, format = 'webp' } = options;

        const srcSet = breakpoints
            .map(width => {
                const optimizedUrl = this.optimizeGoogleDriveImage(originalUrl, {
                    ...options,
                    width,
                    quality,
                    format
                });
                return `${optimizedUrl} ${width}w`;
            })
            .join(', ');

        return srcSet;
    }

    /**
     * Generate blur placeholder for progressive loading
     */
    async generateBlurPlaceholder(imageUrl: string): Promise<string> {
        try {
            // Generate a low-quality, small version for blur placeholder
            const placeholderUrl = this.optimizeGoogleDriveImage(imageUrl, {
                width: 20,
                height: 20,
                quality: 20,
                blur: 10
            });

            // In production, you might want to generate base64 data URLs
            // For now, return the low-quality URL
            return placeholderUrl;
        } catch (error) {
            console.error('Failed to generate blur placeholder:', error);
            return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPgo=';
        }
    }

    /**
     * Preload critical images for better performance
     */
    preloadCriticalImages(imageUrls: string[]): void {
        if (typeof window === 'undefined') return;

        imageUrls.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = url;
            document.head.appendChild(link);
        });
    }

    /**
     * Lazy load images with intersection observer
     */
    setupLazyLoading(): void {
        if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
            return;
        }

        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target as HTMLImageElement;
                    const src = img.dataset.src;
                    const srcset = img.dataset.srcset;

                    if (src) {
                        img.src = src;
                        img.removeAttribute('data-src');
                    }

                    if (srcset) {
                        img.srcset = srcset;
                        img.removeAttribute('data-srcset');
                    }

                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        // Observe all lazy images
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    /**
     * Extract Google Drive file ID from various URL formats
     */
    private extractGoogleDriveFileId(url: string): string | null {
        const patterns = [
            /\/file\/d\/([a-zA-Z0-9-_]+)/,
            /id=([a-zA-Z0-9-_]+)/,
            /\/([a-zA-Z0-9-_]+)\/view/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }

        return null;
    }

    /**
     * Calculate optimal image dimensions based on container and device
     */
    calculateOptimalDimensions(
        containerWidth: number,
        containerHeight: number,
        devicePixelRatio: number = 1
    ): { width: number; height: number } {
        const width = Math.ceil(containerWidth * devicePixelRatio);
        const height = Math.ceil(containerHeight * devicePixelRatio);

        // Cap maximum dimensions to prevent excessive bandwidth usage
        const maxWidth = 2048;
        const maxHeight = 2048;

        return {
            width: Math.min(width, maxWidth),
            height: Math.min(height, maxHeight)
        };
    }

    /**
     * Compress image quality based on connection speed
     */
    getAdaptiveQuality(): number {
        if (typeof navigator === 'undefined') return this.defaultQuality;

        // Use Network Information API if available
        const connection = (navigator as any).connection;
        if (connection) {
            switch (connection.effectiveType) {
                case 'slow-2g':
                case '2g':
                    return 40;
                case '3g':
                    return 60;
                case '4g':
                default:
                    return this.defaultQuality;
            }
        }

        return this.defaultQuality;
    }

    /**
     * Get best supported image format for the browser
     */
    getBestSupportedFormat(): string {
        if (typeof window === 'undefined') return 'jpeg';

        // Check for AVIF support
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;

        try {
            if (canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0) {
                return 'avif';
            }
        } catch (e) {
            // AVIF not supported
        }

        // Check for WebP support
        try {
            if (canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
                return 'webp';
            }
        } catch (e) {
            // WebP not supported
        }

        return 'jpeg';
    }
}

// Export singleton instance
export const imageOptimizer = new ImageOptimizer();

/**
 * React hook for optimized images
 */
export function useOptimizedImage(
    src: string,
    options: ImageOptimizationOptions = {}
) {
    const [optimizedSrc, setOptimizedSrc] = useState<string>(src);
    const [placeholder, setPlaceholder] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const optimizeSrc = async () => {
            try {
                const optimized = imageOptimizer.optimizeGoogleDriveImage(src, {
                    quality: imageOptimizer.getAdaptiveQuality(),
                    format: imageOptimizer.getBestSupportedFormat() as any,
                    ...options
                });

                const blurPlaceholder = await imageOptimizer.generateBlurPlaceholder(src);

                setOptimizedSrc(optimized);
                setPlaceholder(blurPlaceholder);
            } catch (error) {
                console.error('Failed to optimize image:', error);
                setOptimizedSrc(src);
            } finally {
                setIsLoading(false);
            }
        };

        optimizeSrc();
    }, [src, options]);

    return {
        src: optimizedSrc,
        placeholder,
        isLoading,
        srcSet: imageOptimizer.generateResponsiveSrcSet(src, options)
    };
}

/**
 * Performance monitoring for images
 */
export function trackImagePerformance(imageUrl: string, loadTime: number) {
    if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'image_load_time', {
            custom_parameter_1: imageUrl,
            value: loadTime
        });
    }

    // Send to performance monitoring
    fetch('/api/monitoring/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'image_load_time',
            value: loadTime,
            unit: 'ms',
            context: { url: imageUrl }
        })
    }).catch(error => {
        console.error('Failed to track image performance:', error);
    });
}