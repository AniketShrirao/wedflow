import { PublicWeddingData } from '@/lib/validation/schemas'

export interface DataIntegrityResult {
    isValid: boolean
    missingFields: string[]
    invalidFields: string[]
    warnings: string[]
    score: number // 0-100 completeness score
}

/**
 * Check data integrity and completeness for public wedding data
 */
export function checkPublicDataIntegrity(data: PublicWeddingData): DataIntegrityResult {
    const missingFields: string[] = []
    const invalidFields: string[] = []
    const warnings: string[] = []
    let score = 0
    const maxScore = 100

    // Check couple data (30 points)
    if (!data.couple) {
        missingFields.push('couple')
    } else {
        if (!data.couple.partner1_name) missingFields.push('couple.partner1_name')
        else score += 10

        if (!data.couple.partner2_name) missingFields.push('couple.partner2_name')
        else score += 10

        if (!data.couple.wedding_date) {
            warnings.push('Wedding date is not set')
        } else {
            score += 10
        }
    }

    // Check events data (25 points)
    if (!data.events) {
        missingFields.push('events')
    } else {
        if (!data.events.couple_intro || data.events.couple_intro.length < 10) {
            warnings.push('Couple introduction is very short or missing')
        } else {
            score += 10
        }

        if (!data.events.events || data.events.events.length === 0) {
            warnings.push('No wedding events are configured')
        } else {
            score += 10

            // Check event data quality
            const invalidEvents = data.events.events.filter(event =>
                !event.name || !event.date || !event.time
            )
            if (invalidEvents.length > 0) {
                invalidFields.push(`events.events (${invalidEvents.length} incomplete events)`)
            }
        }

        if (!data.events.venues || data.events.venues.length === 0) {
            warnings.push('No venue information is available')
        } else {
            score += 5
        }
    }

    // Check photos data (25 points)
    if (!data.photos) {
        warnings.push('Photo gallery is not configured')
    } else {
        if (!data.photos.highlight_photos || data.photos.highlight_photos.length === 0) {
            warnings.push('No highlight photos are set')
        } else {
            score += 15
        }

        if (!data.photos.categories || data.photos.categories.length === 0) {
            warnings.push('No photo categories are configured')
        } else {
            score += 10
        }
    }

    // Check gifts data (20 points)
    if (!data.gifts) {
        warnings.push('Gift portal is not configured')
    } else {
        if (!data.gifts.upi_id && !data.gifts.qr_code_url) {
            warnings.push('No payment methods are configured for gifts')
        } else {
            score += 15
        }

        if (!data.gifts.custom_message) {
            warnings.push('No custom gift message is set')
        } else {
            score += 5
        }
    }

    return {
        isValid: missingFields.length === 0 && invalidFields.length === 0,
        missingFields,
        invalidFields,
        warnings,
        score: Math.min(score, maxScore)
    }
}

/**
 * Generate user-friendly data status message
 */
export function getDataStatusMessage(result: DataIntegrityResult): string {
    if (result.score >= 90) {
        return "Your wedding site is complete and ready to share!"
    } else if (result.score >= 70) {
        return "Your wedding site looks great! Consider adding a few more details."
    } else if (result.score >= 50) {
        return "Your wedding site is taking shape. Add more information to make it complete."
    } else if (result.score >= 30) {
        return "Your wedding site needs more information to be ready for guests."
    } else {
        return "Your wedding site is just getting started. Add your details to make it shine!"
    }
}

/**
 * Check if specific section has sufficient data to display
 */
export function hasSufficientData(data: PublicWeddingData, section: string): boolean {
    switch (section) {
        case 'events':
            return !!(data.events?.events && data.events.events.length > 0)

        case 'venues':
            return !!(data.events?.venues && data.events.venues.length > 0)

        case 'timeline':
            return !!(data.events?.timeline && data.events.timeline.length > 0)

        case 'photos':
            return !!(data.photos?.highlight_photos && data.photos.highlight_photos.length > 0) ||
                !!(data.photos?.categories && data.photos.categories.some(cat => cat.length > 0))

        case 'gifts':
            return !!(data.gifts?.upi_id || data.gifts?.qr_code_url)

        default:
            return false
    }
}

/**
 * Get missing data suggestions for a section
 */
export function getMissingDataSuggestions(data: PublicWeddingData, section: string): string[] {
    const suggestions: string[] = []

    switch (section) {
        case 'events':
            if (!data.events?.events || data.events.events.length === 0) {
                suggestions.push('Add wedding ceremony and reception details')
            }
            if (!data.events?.couple_intro || data.events.couple_intro.length < 50) {
                suggestions.push('Write a longer couple introduction')
            }
            break

        case 'venues':
            if (!data.events?.venues || data.events.venues.length === 0) {
                suggestions.push('Add venue information with addresses')
            }
            break

        case 'photos':
            if (!data.photos?.highlight_photos || data.photos.highlight_photos.length === 0) {
                suggestions.push('Upload and select highlight photos')
            }
            if (!data.photos?.categories || data.photos.categories.length === 0) {
                suggestions.push('Organize photos into categories')
            }
            break

        case 'gifts':
            if (!data.gifts?.upi_id && !data.gifts?.qr_code_url) {
                suggestions.push('Add UPI ID or QR code for digital gifts')
            }
            if (!data.gifts?.custom_message) {
                suggestions.push('Add a personal message for gift givers')
            }
            break
    }

    return suggestions
}