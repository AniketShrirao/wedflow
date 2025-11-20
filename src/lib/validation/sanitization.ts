// Note: DOMPurify with jsdom doesn't work in Next.js API routes
// Using simple string sanitization instead

/**
 * Sanitization configuration for different content types
 */
const SANITIZATION_CONFIGS = {
    // Basic text content - allows minimal formatting
    basic: {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p'],
        ALLOWED_ATTR: [],
        KEEP_CONTENT: true,
        RETURN_DOM: false,
        RETURN_DOM_FRAGMENT: false,
        RETURN_DOM_IMPORT: false
    },

    // Rich text content - allows more formatting for descriptions
    rich: {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p', 'ul', 'ol', 'li', 'h3', 'h4'],
        ALLOWED_ATTR: [],
        KEEP_CONTENT: true,
        RETURN_DOM: false,
        RETURN_DOM_FRAGMENT: false,
        RETURN_DOM_IMPORT: false
    },

    // Plain text only - strips all HTML
    plain: {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
        KEEP_CONTENT: true,
        RETURN_DOM: false,
        RETURN_DOM_FRAGMENT: false,
        RETURN_DOM_IMPORT: false
    }
}

/**
 * Sanitize user input to prevent XSS attacks while preserving formatting
 */
export function sanitizeUserInput(
    input: string,
    type: 'basic' | 'rich' | 'plain' = 'basic'
): string {
    if (!input || typeof input !== 'string') {
        return ''
    }

    // Simple HTML stripping - DOMPurify doesn't work in Next.js API routes
    const trimmed = input.trim()

    if (type === 'plain') {
        // Strip all HTML tags
        return trimmed.replace(/<[^>]*>/g, '')
    }

    // For basic and rich, just escape dangerous characters
    return trimmed
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
}

/**
 * Sanitize and validate URL inputs
 */
export function sanitizeUrl(url: string): string | null {
    if (!url || typeof url !== 'string') {
        return null
    }

    try {
        const parsedUrl = new URL(url.trim())

        // Only allow HTTPS and HTTP protocols
        if (!['https:', 'http:'].includes(parsedUrl.protocol)) {
            return null
        }

        // Validate allowed domains for images and external content
        const allowedDomains = [
            'drive.google.com',
            'cdn.sanity.io',
            'images.unsplash.com',
            'maps.google.com',
            'maps.googleapis.com'
        ]

        const isAllowedDomain = allowedDomains.some(domain =>
            parsedUrl.hostname.includes(domain)
        )

        if (!isAllowedDomain) {
            return null
        }

        return parsedUrl.toString()
    } catch {
        return null
    }
}

/**
 * Sanitize UPI ID format
 */
export function sanitizeUpiId(upiId: string): string | null {
    if (!upiId || typeof upiId !== 'string') {
        return null
    }

    const cleaned = upiId.trim().toLowerCase()

    // Basic UPI ID format validation: username@provider
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/

    if (!upiRegex.test(cleaned)) {
        return null
    }

    return cleaned
}

/**
 * Sanitize phone number format
 */
export function sanitizePhoneNumber(phone: string): string | null {
    if (!phone || typeof phone !== 'string') {
        return null
    }

    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '')

    // Validate length (10-15 digits for international numbers)
    if (cleaned.length < 10 || cleaned.length > 15) {
        return null
    }

    return cleaned
}

/**
 * Sanitize and format date strings
 */
export function sanitizeDate(dateString: string): string | null {
    if (!dateString || typeof dateString !== 'string') {
        return null
    }

    try {
        const date = new Date(dateString.trim())

        if (isNaN(date.getTime())) {
            return null
        }

        // Return ISO string format
        return date.toISOString().split('T')[0]
    } catch {
        return null
    }
}

/**
 * Sanitize time format (HH:MM)
 */
export function sanitizeTime(timeString: string): string | null {
    if (!timeString || typeof timeString !== 'string') {
        return null
    }

    const cleaned = timeString.trim()
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/

    if (!timeRegex.test(cleaned)) {
        return null
    }

    // Ensure two-digit format
    const [hours, minutes] = cleaned.split(':')
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`
}

/**
 * Comprehensive data sanitization for wedding data objects
 */
export function sanitizeWeddingData(data: any): any {
    if (!data || typeof data !== 'object') {
        return {}
    }

    const sanitized: any = {}

    // Sanitize couple data
    if (data.couple) {
        sanitized.couple = {
            partner1_name: sanitizeUserInput(data.couple.partner1_name, 'plain'),
            partner2_name: sanitizeUserInput(data.couple.partner2_name, 'plain'),
            wedding_date: sanitizeDate(data.couple.wedding_date),
            couple_slug: sanitizeUserInput(data.couple.couple_slug, 'plain')
        }
    }

    // Sanitize events data
    if (data.events) {
        sanitized.events = {
            couple_intro: sanitizeUserInput(data.events.couple_intro, 'rich'),
            events: Array.isArray(data.events.events)
                ? data.events.events.map((event: any) => ({
                    name: sanitizeUserInput(event.name, 'plain'),
                    date: sanitizeDate(event.date),
                    time: sanitizeTime(event.time),
                    description: sanitizeUserInput(event.description, 'rich')
                }))
                : [],
            venues: Array.isArray(data.events.venues)
                ? data.events.venues.map((venue: any) => ({
                    name: sanitizeUserInput(venue.name, 'plain'),
                    address: sanitizeUserInput(venue.address, 'basic'),
                    description: sanitizeUserInput(venue.description, 'rich'),
                    google_maps_url: sanitizeUrl(venue.google_maps_url)
                }))
                : [],
            timeline: Array.isArray(data.events.timeline)
                ? data.events.timeline.map((item: any) => ({
                    time: sanitizeTime(item.time),
                    title: sanitizeUserInput(item.title, 'plain'),
                    description: sanitizeUserInput(item.description, 'basic')
                }))
                : []
        }
    }

    // Sanitize photos data
    if (data.photos) {
        sanitized.photos = {
            categories: Array.isArray(data.photos.categories)
                ? data.photos.categories.map((cat: string) => sanitizeUserInput(cat, 'plain'))
                : [],
            highlight_photos: Array.isArray(data.photos.highlight_photos)
                ? data.photos.highlight_photos.map((photo: any) => ({
                    name: sanitizeUserInput(photo.name, 'plain'),
                    public_url: sanitizeUrl(photo.public_url),
                    thumbnail_url: sanitizeUrl(photo.thumbnail_url),
                    category: sanitizeUserInput(photo.category, 'plain')
                }))
                : []
        }
    }

    // Sanitize gifts data
    if (data.gifts) {
        sanitized.gifts = {
            upi_id: sanitizeUpiId(data.gifts.upi_id),
            qr_code_url: sanitizeUrl(data.gifts.qr_code_url),
            custom_message: sanitizeUserInput(data.gifts.custom_message, 'basic')
        }
    }

    return sanitized
}