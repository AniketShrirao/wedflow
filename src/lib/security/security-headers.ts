/**
 * Security headers middleware for enhanced protection
 */

import { NextRequest, NextResponse } from 'next/server';

export interface SecurityHeadersConfig {
    contentSecurityPolicy?: string;
    strictTransportSecurity?: string;
    xFrameOptions?: string;
    xContentTypeOptions?: string;
    referrerPolicy?: string;
    permissionsPolicy?: string;
    crossOriginEmbedderPolicy?: string;
    crossOriginOpenerPolicy?: string;
    crossOriginResourcePolicy?: string;
}

const defaultSecurityHeaders: SecurityHeadersConfig = {
    contentSecurityPolicy: [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://maps.googleapis.com https://www.google.com https://www.gstatic.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: blob: https://drive.google.com https://lh3.googleusercontent.com https://cdn.sanity.io https://maps.googleapis.com https://maps.gstatic.com https://streetviewpixels-pa.googleapis.com",
        "connect-src 'self' https://*.supabase.co https://api.twilio.com https://cdn.sanity.io https://maps.googleapis.com https://www.googleapis.com",
        "frame-src 'self' https://www.google.com https://maps.google.com",
        "media-src 'self' blob: data:",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "upgrade-insecure-requests"
    ].join('; '),
    strictTransportSecurity: 'max-age=31536000; includeSubDomains; preload',
    xFrameOptions: 'DENY',
    xContentTypeOptions: 'nosniff',
    referrerPolicy: 'strict-origin-when-cross-origin',
    permissionsPolicy: [
        'camera=()',
        'microphone=()',
        'geolocation=(self)',
        'payment=(self)',
        'usb=()',
        'magnetometer=()',
        'accelerometer=()',
        'gyroscope=()',
        'clipboard-read=(self)',
        'clipboard-write=(self)'
    ].join(', '),
    crossOriginEmbedderPolicy: 'credentialless',
    crossOriginOpenerPolicy: 'same-origin',
    crossOriginResourcePolicy: 'same-site'
};

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(
    response: NextResponse,
    config: SecurityHeadersConfig = {}
): NextResponse {
    const headers = { ...defaultSecurityHeaders, ...config };

    // Apply each header if configured
    Object.entries(headers).forEach(([key, value]) => {
        if (value) {
            const headerName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            response.headers.set(headerName, value);
        }
    });

    // Additional security headers
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('X-DNS-Prefetch-Control', 'off');
    response.headers.set('X-Download-Options', 'noopen');
    response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
    response.headers.set('Expect-CT', 'max-age=86400, enforce');

    // Remove potentially revealing headers
    response.headers.delete('X-Powered-By');
    response.headers.delete('Server');

    return response;
}

/**
 * Security headers middleware
 */
export function withSecurityHeaders(config: SecurityHeadersConfig = {}) {
    return function (
        handler: (req: NextRequest) => Promise<NextResponse>
    ) {
        return async (request: NextRequest) => {
            const response = await handler(request);
            return applySecurityHeaders(response, config);
        };
    };
}

/**
 * API-specific security headers
 */
export function withApiSecurityHeaders() {
    return withSecurityHeaders({
        // More restrictive CSP for API endpoints
        contentSecurityPolicy: "default-src 'none'; frame-ancestors 'none';",
        // Prevent caching of API responses
        // This will be handled by cache-control headers in individual routes
    });
}

/**
 * Public site security headers
 */
export function withPublicSiteSecurityHeaders() {
    return withSecurityHeaders({
        // Allow embedding for public wedding sites (but with restrictions)
        xFrameOptions: 'SAMEORIGIN',
        crossOriginResourcePolicy: 'cross-origin'
    });
}

/**
 * Development security headers (less restrictive)
 */
export function withDevelopmentSecurityHeaders() {
    if (process.env.NODE_ENV === 'production') {
        return withSecurityHeaders();
    }

    return withSecurityHeaders({
        contentSecurityPolicy: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob: *",
            "connect-src 'self' *",
            "frame-src 'self' *",
            "object-src 'none'"
        ].join('; '),
        strictTransportSecurity: undefined // Don't enforce HTTPS in development
    });
}

/**
 * Security audit utilities
 */
export class SecurityAuditor {
    /**
     * Check if response has proper security headers
     */
    static auditResponse(response: Response): {
        score: number;
        issues: string[];
        recommendations: string[];
    } {
        const issues: string[] = [];
        const recommendations: string[] = [];
        let score = 100;

        const headers = response.headers;

        // Check for essential security headers
        if (!headers.get('content-security-policy')) {
            issues.push('Missing Content-Security-Policy header');
            score -= 20;
        }

        if (!headers.get('strict-transport-security')) {
            issues.push('Missing Strict-Transport-Security header');
            score -= 15;
        }

        if (!headers.get('x-frame-options') && !headers.get('content-security-policy')?.includes('frame-ancestors')) {
            issues.push('Missing X-Frame-Options or frame-ancestors directive');
            score -= 10;
        }

        if (!headers.get('x-content-type-options')) {
            issues.push('Missing X-Content-Type-Options header');
            score -= 10;
        }

        if (!headers.get('referrer-policy')) {
            issues.push('Missing Referrer-Policy header');
            score -= 5;
        }

        // Check for potentially dangerous headers
        if (headers.get('x-powered-by')) {
            issues.push('X-Powered-By header reveals server information');
            score -= 5;
        }

        if (headers.get('server')) {
            issues.push('Server header reveals server information');
            score -= 5;
        }

        // Generate recommendations
        if (score < 90) {
            recommendations.push('Implement missing security headers');
        }

        if (score < 70) {
            recommendations.push('Review and strengthen Content Security Policy');
        }

        if (score < 50) {
            recommendations.push('Conduct comprehensive security review');
        }

        return {
            score: Math.max(0, score),
            issues,
            recommendations
        };
    }

    /**
     * Generate security report for a URL
     */
    static async generateSecurityReport(url: string): Promise<{
        url: string;
        timestamp: string;
        audit: ReturnType<typeof SecurityAuditor.auditResponse>;
        headers: Record<string, string>;
    }> {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            const audit = this.auditResponse(response);

            const headers: Record<string, string> = {};
            response.headers.forEach((value, key) => {
                headers[key] = value;
            });

            return {
                url,
                timestamp: new Date().toISOString(),
                audit,
                headers
            };
        } catch (error) {
            throw new Error(`Failed to generate security report: ${error}`);
        }
    }
}

/**
 * Content Security Policy violation reporting
 */
export function setupCSPReporting() {
    if (typeof window !== 'undefined') {
        document.addEventListener('securitypolicyviolation', (event) => {
            const violation = {
                documentURI: event.documentURI,
                referrer: event.referrer,
                blockedURI: event.blockedURI,
                violatedDirective: event.violatedDirective,
                originalPolicy: event.originalPolicy,
                sourceFile: event.sourceFile,
                lineNumber: event.lineNumber,
                columnNumber: event.columnNumber,
                timestamp: new Date().toISOString()
            };

            // Send violation report to monitoring endpoint
            fetch('/api/monitoring/csp-violations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(violation)
            }).catch(error => {
                console.error('Failed to report CSP violation:', error);
            });
        });
    }
}

