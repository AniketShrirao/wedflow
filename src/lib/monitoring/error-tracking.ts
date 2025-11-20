/**
 * Error tracking and monitoring utilities for production environment
 */

export interface ErrorContext {
    userId?: string;
    coupleId?: string;
    url?: string;
    userAgent?: string;
    timestamp: string;
    environment: string;
    version?: string;
}

export interface ErrorReport {
    message: string;
    stack?: string;
    level: 'error' | 'warning' | 'info';
    context: ErrorContext;
    fingerprint?: string;
}

class ErrorTracker {
    private isProduction = process.env.NODE_ENV === 'production';
    private apiEndpoint = process.env.ERROR_TRACKING_ENDPOINT;

    /**
     * Capture and report errors
     */
    async captureError(error: Error, context: Partial<ErrorContext> = {}) {
        const errorReport: ErrorReport = {
            message: error.message,
            stack: error.stack,
            level: 'error',
            context: {
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV || 'development',
                version: process.env.npm_package_version,
                ...context
            },
            fingerprint: this.generateFingerprint(error)
        };

        // Log to console in development
        if (!this.isProduction) {
            console.error('Error captured:', errorReport);
            return;
        }

        // Send to monitoring service in production
        try {
            await this.sendToMonitoring(errorReport);
        } catch (monitoringError) {
            console.error('Failed to send error to monitoring:', monitoringError);
        }

        // Store critical errors in database
        if (this.isCriticalError(error)) {
            await this.storeCriticalError(errorReport);
        }
    }

    /**
     * Capture performance metrics
     */
    async capturePerformance(metric: {
        name: string;
        value: number;
        unit: string;
        context?: Record<string, any>;
    }) {
        if (!this.isProduction) {
            console.log('Performance metric:', metric);
            return;
        }

        try {
            await fetch('/api/monitoring/performance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...metric,
                    timestamp: new Date().toISOString(),
                    environment: process.env.NODE_ENV
                })
            });
        } catch (error) {
            console.error('Failed to capture performance metric:', error);
        }
    }

    /**
     * Generate error fingerprint for deduplication
     */
    private generateFingerprint(error: Error): string {
        const key = `${error.name}:${error.message}:${error.stack?.split('\n')[1] || ''}`;
        return btoa(key).slice(0, 16);
    }

    /**
     * Check if error is critical
     */
    private isCriticalError(error: Error): boolean {
        const criticalPatterns = [
            /database/i,
            /authentication/i,
            /payment/i,
            /security/i,
            /unauthorized/i
        ];

        return criticalPatterns.some(pattern =>
            pattern.test(error.message) || pattern.test(error.stack || '')
        );
    }

    /**
     * Send error to external monitoring service
     */
    private async sendToMonitoring(errorReport: ErrorReport) {
        if (!this.apiEndpoint) return;

        await fetch(this.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.ERROR_TRACKING_TOKEN}`
            },
            body: JSON.stringify(errorReport)
        });
    }

    /**
     * Store critical errors in database for immediate attention
     */
    private async storeCriticalError(errorReport: ErrorReport) {
        try {
            await fetch('/api/monitoring/critical-errors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(errorReport)
            });
        } catch (error) {
            console.error('Failed to store critical error:', error);
        }
    }

    /**
     * Capture warning-level issues
     */
    async captureWarning(message: string, context: Partial<ErrorContext> = {}) {
        const warningReport: ErrorReport = {
            message,
            level: 'warning',
            context: {
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV || 'development',
                ...context
            }
        };

        if (!this.isProduction) {
            console.warn('Warning captured:', warningReport);
            return;
        }

        try {
            await this.sendToMonitoring(warningReport);
        } catch (error) {
            console.error('Failed to send warning to monitoring:', error);
        }
    }

    /**
     * Capture info-level events
     */
    async captureInfo(message: string, context: Partial<ErrorContext> = {}) {
        const infoReport: ErrorReport = {
            message,
            level: 'info',
            context: {
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV || 'development',
                ...context
            }
        };

        if (!this.isProduction) {
            console.info('Info captured:', infoReport);
            return;
        }

        try {
            await this.sendToMonitoring(infoReport);
        } catch (error) {
            console.error('Failed to send info to monitoring:', error);
        }
    }
}

// Global error tracker instance
export const errorTracker = new ErrorTracker();

/**
 * Global error handler for unhandled errors
 */
export function setupGlobalErrorHandling() {
    if (typeof window !== 'undefined') {
        // Client-side error handling
        window.addEventListener('error', (event) => {
            errorTracker.captureError(event.error, {
                url: window.location.href,
                userAgent: navigator.userAgent
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            errorTracker.captureError(
                new Error(`Unhandled Promise Rejection: ${event.reason}`),
                {
                    url: window.location.href,
                    userAgent: navigator.userAgent
                }
            );
        });
    } else {
        // Server-side error handling
        process.on('uncaughtException', (error) => {
            errorTracker.captureError(error, {
                environment: 'server'
            });
        });

        process.on('unhandledRejection', (reason) => {
            errorTracker.captureError(
                new Error(`Unhandled Promise Rejection: ${reason}`),
                {
                    environment: 'server'
                }
            );
        });
    }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
    private static instance: PerformanceMonitor;
    private metrics: Map<string, number> = new Map();

    static getInstance(): PerformanceMonitor {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor();
        }
        return PerformanceMonitor.instance;
    }

    /**
     * Start timing a operation
     */
    startTiming(name: string): void {
        this.metrics.set(name, Date.now());
    }

    /**
     * End timing and report metric
     */
    endTiming(name: string, context?: Record<string, any>): void {
        const startTime = this.metrics.get(name);
        if (!startTime) return;

        const duration = Date.now() - startTime;
        this.metrics.delete(name);

        errorTracker.capturePerformance({
            name,
            value: duration,
            unit: 'ms',
            context
        });
    }

    /**
     * Measure page load performance
     */
    measurePageLoad(): void {
        if (typeof window === 'undefined') return;

        window.addEventListener('load', () => {
            const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

            if (navigation) {
                errorTracker.capturePerformance({
                    name: 'page_load_time',
                    value: navigation.loadEventEnd - navigation.fetchStart,
                    unit: 'ms',
                    context: {
                        url: window.location.href,
                        type: navigation.type
                    }
                });

                errorTracker.capturePerformance({
                    name: 'dom_content_loaded',
                    value: navigation.domContentLoadedEventEnd - navigation.fetchStart,
                    unit: 'ms',
                    context: {
                        url: window.location.href
                    }
                });
            }
        });
    }

    /**
     * Measure API response times
     */
    measureApiCall(url: string, method: string, duration: number, status: number): void {
        errorTracker.capturePerformance({
            name: 'api_response_time',
            value: duration,
            unit: 'ms',
            context: {
                url,
                method,
                status
            }
        });
    }
}

export const performanceMonitor = PerformanceMonitor.getInstance();