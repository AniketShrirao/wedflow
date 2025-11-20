import { ZodSchema, ZodError } from 'zod'
import { ValidationResult, ValidationError, ValidationWarning, PublicWeddingDataSchema } from './schemas'
import { sanitizeWeddingData } from './sanitization'

/**
 * Generic validation function that handles Zod schema validation
 */
export function validateData<T>(
    data: unknown,
    schema: ZodSchema<T>,
    sanitize: boolean = true
): ValidationResult<T> {
    try {
        // Sanitize data first if requested
        const processedData = sanitize ? sanitizeWeddingData(data) : data

        // Validate with Zod schema
        const validatedData = schema.parse(processedData)

        return {
            isValid: true,
            data: validatedData,
            errors: [],
            warnings: []
        }
    } catch (error) {
        if (error instanceof ZodError) {
            const errors: ValidationError[] = error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message,
                code: err.code
            }))

            return {
                isValid: false,
                errors,
                warnings: []
            }
        }

        // Handle unexpected errors
        return {
            isValid: false,
            errors: [{
                field: 'unknown',
                message: 'An unexpected validation error occurred',
                code: 'unknown_error'
            }],
            warnings: []
        }
    }
}

/**
 * Validate API response data integrity
 */
export function validateApiResponse<T>(
    response: unknown,
    schema: ZodSchema<T>
): ValidationResult<T> {
    // Don't sanitize API responses as they should already be clean
    return validateData(response, schema, false)
}

/**
 * Validate user input with sanitization
 */
export function validateUserInput<T>(
    input: unknown,
    schema: ZodSchema<T>
): ValidationResult<T> {
    // Always sanitize user input
    return validateData(input, schema, true)
}

/**
 * Check data integrity between two objects
 */
export function checkDataIntegrity<T>(
    source: T,
    target: T,
    criticalFields: (keyof T)[]
): { isIntact: boolean; missingFields: string[]; mismatchedFields: string[] } {
    const missingFields: string[] = []
    const mismatchedFields: string[] = []

    for (const field of criticalFields) {
        const sourceValue = source[field]
        const targetValue = target[field]

        // Check if field is missing in target
        if (sourceValue !== undefined && targetValue === undefined) {
            missingFields.push(String(field))
            continue
        }

        // Check if values don't match
        if (sourceValue !== targetValue) {
            mismatchedFields.push(String(field))
        }
    }

    return {
        isIntact: missingFields.length === 0 && mismatchedFields.length === 0,
        missingFields,
        mismatchedFields
    }
}

/**
 * Generate validation warnings for data quality issues
 */
export function generateDataWarnings(data: any): ValidationWarning[] {
    const warnings: ValidationWarning[] = []

    // Check for missing optional but recommended fields
    if (data.couple) {
        if (!data.couple.wedding_date) {
            warnings.push({
                field: 'couple.wedding_date',
                message: 'Wedding date is not set',
                suggestion: 'Add a wedding date to improve the guest experience'
            })
        }
    }

    if (data.events) {
        if (!data.events.couple_intro || data.events.couple_intro.length < 50) {
            warnings.push({
                field: 'events.couple_intro',
                message: 'Couple introduction is very short or missing',
                suggestion: 'Add a longer introduction to personalize your wedding site'
            })
        }

        if (!data.events.events || data.events.events.length === 0) {
            warnings.push({
                field: 'events.events',
                message: 'No events are configured',
                suggestion: 'Add wedding events to help guests plan their attendance'
            })
        }
    }

    if (!data.photos || !data.photos.highlight_photos || data.photos.highlight_photos.length === 0) {
        warnings.push({
            field: 'photos.highlight_photos',
            message: 'No highlight photos are set',
            suggestion: 'Add some photos to make your wedding site more engaging'
        })
    }

    if (!data.gifts || (!data.gifts.upi_id && !data.gifts.qr_code_url)) {
        warnings.push({
            field: 'gifts',
            message: 'No gift payment options are configured',
            suggestion: 'Add UPI ID or QR code to allow guests to send gifts digitally'
        })
    }

    return warnings
}

/**
 * Comprehensive validation for public wedding data
 */
export function validatePublicWeddingData(data: unknown): ValidationResult {
    const result = validateUserInput(data, PublicWeddingDataSchema)

    if (result.isValid && result.data) {
        // Add data quality warnings
        const warnings = generateDataWarnings(result.data)
        result.warnings = warnings
    }

    return result
}

// Re-export schemas for convenience
export * from './schemas'