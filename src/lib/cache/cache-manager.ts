/**
 * Caching strategies for Sanity content and Google Drive API responses
 */

import { useState, useEffect, useCallback } from 'react';

export interface CacheEntry<T = any> {
    data: T;
    timestamp: number;
    ttl: number;
    key: string;
}

export interface CacheOptions {
    ttl?: number; // Time to live in milliseconds
    staleWhileRevalidate?: boolean;
    tags?: string[];
}

class CacheManager {
    private memoryCache = new Map<string, CacheEntry>();
    private maxMemoryEntries = 1000;
    private defaultTTL = 5 * 60 * 1000; // 5 minutes

    /**
     * Get cached data
     */
    async get<T>(key: string): Promise<T | null> {
        // Try memory cache first
        const memoryEntry = this.memoryCache.get(key);
        if (memoryEntry && this.isValid(memoryEntry)) {
            return memoryEntry.data;
        }

        // Try browser cache (if available)
        if (typeof window !== 'undefined' && 'caches' in window) {
            try {
                const cache = await caches.open('wedflow-api-cache');
                const response = await cache.match(key);

                if (response) {
                    const cacheData = await response.json();
                    if (this.isValid(cacheData)) {
                        // Update memory cache
                        this.memoryCache.set(key, cacheData);
                        return cacheData.data;
                    }
                }
            } catch (error) {
                console.error('Browser cache error:', error);
            }
        }

        return null;
    }

    /**
     * Set cached data
     */
    async set<T>(
        key: string,
        data: T,
        options: CacheOptions = {}
    ): Promise<void> {
        const ttl = options.ttl || this.defaultTTL;
        const entry: CacheEntry<T> = {
            data,
            timestamp: Date.now(),
            ttl,
            key
        };

        // Store in memory cache
        this.memoryCache.set(key, entry);
        this.cleanupMemoryCache();

        // Store in browser cache (if available)
        if (typeof window !== 'undefined' && 'caches' in window) {
            try {
                const cache = await caches.open('wedflow-api-cache');
                const response = new Response(JSON.stringify(entry), {
                    headers: {
                        'Content-Type': 'application/json',
                        'Cache-Control': `max-age=${Math.floor(ttl / 1000)}`
                    }
                });
                await cache.put(key, response);
            } catch (error) {
                console.error('Browser cache storage error:', error);
            }
        }
    }

    /**
     * Invalidate cache by key or tags
     */
    async invalidate(keyOrTags: string | string[]): Promise<void> {
        if (typeof keyOrTags === 'string') {
            // Invalidate specific key
            this.memoryCache.delete(keyOrTags);

            if (typeof window !== 'undefined' && 'caches' in window) {
                try {
                    const cache = await caches.open('wedflow-api-cache');
                    await cache.delete(keyOrTags);
                } catch (error) {
                    console.error('Browser cache invalidation error:', error);
                }
            }
        } else {
            // Invalidate by tags (simplified implementation)
            const keysToDelete: string[] = [];

            for (const [key, entry] of this.memoryCache.entries()) {
                // In a full implementation, you'd store tags with entries
                // For now, we'll use key patterns
                if (keyOrTags.some(tag => key.includes(tag))) {
                    keysToDelete.push(key);
                }
            }

            keysToDelete.forEach(key => this.memoryCache.delete(key));
        }
    }

    /**
     * Clear all cache
     */
    async clear(): Promise<void> {
        this.memoryCache.clear();

        if (typeof window !== 'undefined' && 'caches' in window) {
            try {
                await caches.delete('wedflow-api-cache');
            } catch (error) {
                console.error('Browser cache clear error:', error);
            }
        }
    }

    /**
     * Get cache statistics
     */
    getStats(): {
        memoryEntries: number;
        memorySize: number;
        hitRate: number;
    } {
        const memorySize = JSON.stringify([...this.memoryCache.values()]).length;

        return {
            memoryEntries: this.memoryCache.size,
            memorySize,
            hitRate: 0 // Would need hit/miss tracking for accurate rate
        };
    }

    /**
     * Check if cache entry is valid
     */
    private isValid(entry: CacheEntry): boolean {
        return Date.now() - entry.timestamp < entry.ttl;
    }

    /**
     * Clean up memory cache to prevent memory leaks
     */
    private cleanupMemoryCache(): void {
        if (this.memoryCache.size <= this.maxMemoryEntries) return;

        // Remove oldest entries
        const entries = [...this.memoryCache.entries()];
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

        const toRemove = entries.slice(0, entries.length - this.maxMemoryEntries);
        toRemove.forEach(([key]) => this.memoryCache.delete(key));
    }
}

// Global cache manager instance
export const cacheManager = new CacheManager();

/**
 * Sanity content cache wrapper
 */
export class SanityCacheWrapper {
    private cachePrefix = 'sanity:';
    private defaultTTL = 10 * 60 * 1000; // 10 minutes

    async getCachedContent<T>(
        query: string,
        params: any = {},
        options: CacheOptions = {}
    ): Promise<T | null> {
        const cacheKey = this.generateCacheKey(query, params);
        return await cacheManager.get<T>(cacheKey);
    }

    async setCachedContent<T>(
        query: string,
        params: any = {},
        data: T,
        options: CacheOptions = {}
    ): Promise<void> {
        const cacheKey = this.generateCacheKey(query, params);
        await cacheManager.set(cacheKey, data, {
            ttl: this.defaultTTL,
            ...options
        });
    }

    async invalidateContent(tags: string[]): Promise<void> {
        const cacheKeys = tags.map(tag => `${this.cachePrefix}${tag}`);
        await cacheManager.invalidate(cacheKeys);
    }

    private generateCacheKey(query: string, params: any): string {
        const paramString = JSON.stringify(params);
        const hash = btoa(`${query}:${paramString}`).slice(0, 16);
        return `${this.cachePrefix}${hash}`;
    }
}

/**
 * Google Drive API cache wrapper
 */
export class GoogleDriveCacheWrapper {
    private cachePrefix = 'gdrive:';
    private defaultTTL = 30 * 60 * 1000; // 30 minutes

    async getCachedDriveData<T>(
        endpoint: string,
        params: any = {},
        options: CacheOptions = {}
    ): Promise<T | null> {
        const cacheKey = this.generateCacheKey(endpoint, params);
        return await cacheManager.get<T>(cacheKey);
    }

    async setCachedDriveData<T>(
        endpoint: string,
        params: any = {},
        data: T,
        options: CacheOptions = {}
    ): Promise<void> {
        const cacheKey = this.generateCacheKey(endpoint, params);
        await cacheManager.set(cacheKey, data, {
            ttl: this.defaultTTL,
            ...options
        });
    }

    async invalidateDriveData(folderId: string): Promise<void> {
        await cacheManager.invalidate([`${this.cachePrefix}${folderId}`]);
    }

    private generateCacheKey(endpoint: string, params: any): string {
        const paramString = JSON.stringify(params);
        const hash = btoa(`${endpoint}:${paramString}`).slice(0, 16);
        return `${this.cachePrefix}${hash}`;
    }
}

// Export cache wrapper instances
export const sanityCache = new SanityCacheWrapper();
export const googleDriveCache = new GoogleDriveCacheWrapper();

/**
 * Cache-aware fetch wrapper
 */
export async function cachedFetch<T>(
    url: string,
    options: RequestInit & CacheOptions = {}
): Promise<T> {
    const { ttl, staleWhileRevalidate, tags, ...fetchOptions } = options;
    const cacheKey = `fetch:${url}:${JSON.stringify(fetchOptions)}`;

    // Try to get from cache first
    const cached = await cacheManager.get<T>(cacheKey);
    if (cached) {
        return cached;
    }

    // Fetch fresh data
    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Cache the response
    await cacheManager.set(cacheKey, data, { ttl, tags });

    return data;
}

/**
 * React hook for cached data
 */
export function useCachedData<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let mounted = true;

        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Try cache first
                const cached = await cacheManager.get<T>(key);
                if (cached && mounted) {
                    setData(cached);
                    setLoading(false);
                    return;
                }

                // Fetch fresh data
                const freshData = await fetcher();
                if (mounted) {
                    setData(freshData);
                    await cacheManager.set(key, freshData, options);
                }
            } catch (err) {
                if (mounted) {
                    setError(err instanceof Error ? err : new Error('Unknown error'));
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadData();

        return () => {
            mounted = false;
        };
    }, [key, fetcher, options]);

    const invalidate = useCallback(async () => {
        await cacheManager.invalidate(key);
        setData(null);
        setLoading(true);
    }, [key]);

    return { data, loading, error, invalidate };
}