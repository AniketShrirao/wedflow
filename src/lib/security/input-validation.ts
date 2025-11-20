/**
 * Input validation and sanitization utilities
 */

import { z } from 'zod';

// Common validation schemas
export const commonSchemas = {
    email: z.string().email('Invalid email format').max(255),
    phone: z.string().regex(/^\+?[\d\s\-\(\)]{10,20}$/, 'Invalid phone number format'),
    name: z.string().min(1, 'Name is required').max(100, 'Name too long').regex(/^[a-zA-Z\s\-'\.]+$/, 'Invalid characters in name'),
    slug: z.string().regex(/^[a-z0-9\-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens').min(3).max(50),
    url: z.string().url('Invalid URL format').max(2048),
    uuid: z.string().uuid('Invalid UUID format'),
    text: z.string().max(5000, 'Text too long'),
    html: z.string().max(10000, 'HTML content too long'),
    date: z.string().datetime('Invalid date format'),
    positiveInt: z.number().int().positive('Must be a positive integer'),
    nonNegativeInt: z.number().int().min(0, 'Must be non-negative')
};

// Guest validation schema
export const guestSchema = z.object({
    name: commonSchemas.name,
    phone: commonSchemas.phone,
    email: commonSchemas.email.optional(),
    group_name: z.string().max(50, 'Group name too long').optional()
});

// Vendor contact validation schema
export const vendorContactSchema = z.object({
    name: commonSchemas.name,
    phone: commonSchemas.phone,
    email: commonSchemas.email.optional(),
    category: z.enum(['decorator', 'event_coordinator', 'hall_manager', 'transport', 'photographer', 'caterer']),
    notes: z.string().max(1000, 'Notes too long').optional()
});

// Event details validation schema
export const eventDetailsSchema = z.object({
    couple_intro: z.string().max(2000, 'Introduction too long').optional(),
    events: z.array(z.object({
        name: z.string().min(1, 'Event name required').max(100),
        date: commonSchemas.date,
        time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
        description: z.string().max(500, 'Description too long').optional(),
        venue: z.string().max(200, 'Venue name too long').optional()
    })).max(10, 'Too many events'),
    venues: z.array(z.object({
        name: z.string().min(1, 'Venue name required').max(200),
        address: z.string().min(1, 'Address required').max(500),
        description: z.string().max(1000, 'Description too long').optional(),
        google_maps_url: commonSchemas.url.optional()
    })).max(5, 'Too many venues'),
    timeline: z.array(z.object({
        time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
        event: z.string().min(1, 'Event required').max(100),
        description: z.string().max(200, 'Description too long').optional()
    })).max(20, 'Too many timeline items')
});

// Photo collection validation schema
export const photoCollectionSchema = z.object({
    drive_folder_url: commonSchemas.url,
    categories: z.array(z.object({
        name: z.string().min(1, 'Category name required').max(50),
        folder_id: z.string().min(1, 'Folder ID required').max(100)
    })).max(10, 'Too many categories'),
    highlight_photos: z.array(z.string().max(200)).max(20, 'Too many highlight photos')
});

// Gift settings validation schema
export const giftSettingsSchema = z.object({
    upi_id: z.string().regex(/^[\w\.\-]+@[\w\-]+$/, 'Invalid UPI ID format').max(100),
    qr_code_url: commonSchemas.url.optional(),
    custom_message: z.string().max(500, 'Message too long').optional()
});

// Todo task validation schema
export const todoTaskSchema = z.object({
    title: z.string().min(1, 'Title required').max(200),
    description: z.string().max(1000, 'Description too long').optional(),
    category: z.string().min(1, 'Category required').max(50),
    due_date: commonSchemas.date.optional()
});

// Couple profile validation schema
export const coupleProfileSchema = z.object({
    partner1_name: commonSchemas.name,
    partner2_name: commonSchemas.name,
    wedding_date: commonSchemas.date.optional(),
    couple_slug: commonSchemas.slug
});

/**
 * HTML sanitization to prevent XSS attacks
 */
export class HTMLSanitizer {
    private allowedTags = [
        'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'blockquote', 'a'
    ];

    private allowedAttributes: Record<string, string[]> = {
        'a': ['href', 'title'],
        '*': ['class']
    };

    /**
     * Sanitize HTML content to prevent XSS
     */
    sanitize(html: string): string {
        if (!html) return '';

        // Remove script tags and their content
        html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

        // Remove dangerous attributes
        html = html.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, ''); // Remove event handlers
        html = html.replace(/\s*javascript\s*:/gi, ''); // Remove javascript: URLs
        html = html.replace(/\s*data\s*:/gi, ''); // Remove data: URLs
        html = html.replace(/\s*vbscript\s*:/gi, ''); // Remove vbscript: URLs

        // Remove dangerous tags
        const dangerousTags = ['script', 'object', 'embed', 'form', 'input', 'textarea', 'button', 'select', 'option', 'iframe', 'frame', 'frameset', 'meta', 'link', 'style'];
        dangerousTags.forEach(tag => {
            const regex = new RegExp(`<\\/?${tag}\\b[^>]*>`, 'gi');
            html = html.replace(regex, '');
        });

        return html;
    }

    /**
     * Strip all HTML tags
     */
    stripTags(html: string): string {
        return html.replace(/<[^>]*>/g, '');
    }

    /**
     * Escape HTML entities
     */
    escapeHtml(text: string): string {
        const entityMap: Record<string, string> = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '/': '&#x2F;'
        };

        return text.replace(/[&<>"'\/]/g, (char) => entityMap[char]);
    }
}

/**
 * SQL injection prevention utilities
 */
export class SQLSanitizer {
    private dangerousPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/gi,
        /(--|\/\*|\*\/|;|'|"|`)/g,
        /(\bOR\b|\bAND\b).*?[=<>]/gi
    ];

    /**
     * Check if input contains potential SQL injection patterns
     */
    containsSQLInjection(input: string): boolean {
        return this.dangerousPatterns.some(pattern => pattern.test(input));
    }

    /**
     * Sanitize input to prevent SQL injection
     */
    sanitize(input: string): string {
        // Remove dangerous SQL keywords and characters
        let sanitized = input;

        this.dangerousPatterns.forEach(pattern => {
            sanitized = sanitized.replace(pattern, '');
        });

        return sanitized.trim();
    }
}

/**
 * File upload validation
 */
export class FileValidator {
    private allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    private allowedDocumentTypes = ['application/pdf', 'text/plain', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    private maxImageSize = 10 * 1024 * 1024; // 10MB
    private maxDocumentSize = 5 * 1024 * 1024; // 5MB

    /**
     * Validate uploaded file
     */
    validateFile(file: File, type: 'image' | 'document'): { valid: boolean; error?: string } {
        const allowedTypes = type === 'image' ? this.allowedImageTypes : this.allowedDocumentTypes;
        const maxSize = type === 'image' ? this.maxImageSize : this.maxDocumentSize;

        // Check file type
        if (!allowedTypes.includes(file.type)) {
            return {
                valid: false,
                error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
            };
        }

        // Check file size
        if (file.size > maxSize) {
            return {
                valid: false,
                error: `File too large. Maximum size: ${Math.round(maxSize / 1024 / 1024)}MB`
            };
        }

        // Check file name for dangerous characters
        if (/[<>:"/\\|?*]/.test(file.name)) {
            return {
                valid: false,
                error: 'File name contains invalid characters'
            };
        }

        return { valid: true };
    }

    /**
     * Generate safe file name
     */
    generateSafeFileName(originalName: string): string {
        const extension = originalName.split('.').pop()?.toLowerCase() || '';
        const baseName = originalName.replace(/\.[^/.]+$/, '');
        const safeName = baseName.replace(/[^a-zA-Z0-9\-_]/g, '_').substring(0, 50);
        const timestamp = Date.now();

        return `${safeName}_${timestamp}.${extension}`;
    }
}

// Export singleton instances
export const htmlSanitizer = new HTMLSanitizer();
export const sqlSanitizer = new SQLSanitizer();
export const fileValidator = new FileValidator();

/**
 * Comprehensive input validation middleware
 */
export function validateInput<T>(schema: z.ZodSchema<T>) {
    return (data: unknown): { success: true; data: T } | { success: false; errors: string[] } => {
        try {
            const validatedData = schema.parse(data);
            return { success: true, data: validatedData };
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
                return { success: false, errors };
            }
            return { success: false, errors: ['Validation failed'] };
        }
    };
}

/**
 * Rate limiting by IP address
 */
export class RateLimiter {
    private requests = new Map<string, { count: number; resetTime: number }>();
    private cleanupInterval: NodeJS.Timeout;

    constructor(
        private maxRequests: number = 100,
        private windowMs: number = 15 * 60 * 1000 // 15 minutes
    ) {
        // Clean up expired entries every 5 minutes
        this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }

    /**
     * Check if request is allowed
     */
    isAllowed(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
        const now = Date.now();
        const windowStart = now - this.windowMs;

        let requestData = this.requests.get(identifier);

        // Reset if window has passed
        if (!requestData || requestData.resetTime < now) {
            requestData = {
                count: 0,
                resetTime: now + this.windowMs
            };
        }

        const allowed = requestData.count < this.maxRequests;

        if (allowed) {
            requestData.count++;
            this.requests.set(identifier, requestData);
        }

        return {
            allowed,
            remaining: Math.max(0, this.maxRequests - requestData.count),
            resetTime: requestData.resetTime
        };
    }

    /**
     * Clean up expired entries
     */
    private cleanup(): void {
        const now = Date.now();
        for (const [key, data] of this.requests.entries()) {
            if (data.resetTime < now) {
                this.requests.delete(key);
            }
        }
    }

    /**
     * Destroy rate limiter and cleanup
     */
    destroy(): void {
        clearInterval(this.cleanupInterval);
        this.requests.clear();
    }
}

// Export default rate limiter instance
export const defaultRateLimiter = new RateLimiter();