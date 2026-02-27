import { z } from 'zod'

// Base validation schemas for wedding data
export const EventDataSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1, 'Event name is required').max(100, 'Event name must be less than 100 characters'),
    date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date format'),
    time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    description: z.string().max(500, 'Description must be less than 500 characters').optional(),
    venue_id: z.string().uuid().optional(),
    couple_id: z.string().uuid()
})

export const VenueDataSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1, 'Venue name is required').max(100, 'Venue name must be less than 100 characters'),
    address: z.string().min(1, 'Address is required').max(200, 'Address must be less than 200 characters'),
    description: z.string().max(500, 'Description must be less than 500 characters').optional(),
    google_maps_url: z.string().url('Invalid Google Maps URL').optional(),
    couple_id: z.string().uuid()
})

export const PhotoDataSchema = z.object({
    id: z.string().uuid().optional(),
    filename: z.string().min(1, 'Photo filename is required').optional(),
    public_url: z.string().url('Invalid photo URL').nullable().optional(),
    category: z.string().min(1, 'Photo category is required'),
    is_highlighted: z.boolean().default(false).optional()
})

export const GiftDataSchema = z.object({
    id: z.string().uuid().optional(),
    upi_id: z.string()
        .regex(/^[\w.-]+@[\w.-]+$/, 'Invalid UPI ID format')
        .optional()
        .nullable(),
    qr_code_url: z.string().url('Invalid QR code URL').optional().nullable(),
    custom_message: z.string().max(200, 'Custom message must be less than 200 characters').optional().nullable(),
    couple_id: z.string().uuid()
})

export const CoupleDataSchema = z.object({
    id: z.string().uuid().optional(),
    partner1_name: z.string().min(1, 'Partner 1 name is required').max(50, 'Name must be less than 50 characters'),
    partner2_name: z.string().min(1, 'Partner 2 name is required').max(50, 'Name must be less than 50 characters'),
    wedding_date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid wedding date').nullable(),
    couple_slug: z.string().min(1, 'Couple slug is required').max(50, 'Slug must be less than 50 characters'),
    couple_intro: z.string().max(1000, 'Introduction must be less than 1000 characters').optional()
})

export const TimelineItemSchema = z.object({
    id: z.string().uuid().optional(),
    time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    title: z.string().min(1, 'Timeline item title is required').max(100, 'Title must be less than 100 characters'),
    description: z.string().max(300, 'Description must be less than 300 characters').optional(),
    couple_id: z.string().uuid()
})

// Composite schemas for API responses
export const PublicWeddingDataSchema = z.object({
    couple: CoupleDataSchema.pick({
        partner1_name: true,
        partner2_name: true,
        wedding_date: true,
        couple_slug: true
    }),
    events: z.object({
        couple_intro: z.string().default(''),
        events: z.array(EventDataSchema).default([]),
        venues: z.array(VenueDataSchema).default([]),
        timeline: z.array(TimelineItemSchema).default([])
    }),
    photos: z.object({
        categories: z.array(z.string()).default([]),
        highlight_photos: z.array(PhotoDataSchema).default([])
    }).nullable(),
    gifts: GiftDataSchema.pick({
        upi_id: true,
        qr_code_url: true,
        custom_message: true
    }).nullable()
})

// Validation result types
export interface ValidationResult<T = any> {
    isValid: boolean
    data?: T
    errors: ValidationError[]
    warnings: ValidationWarning[]
}

export interface ValidationError {
    field: string
    message: string
    code: string
}

export interface ValidationWarning {
    field: string
    message: string
    suggestion?: string
}

// Type exports for use in components
export type EventData = z.infer<typeof EventDataSchema>
export type VenueData = z.infer<typeof VenueDataSchema>
export type PhotoData = z.infer<typeof PhotoDataSchema>
export type GiftData = z.infer<typeof GiftDataSchema>
export type CoupleData = z.infer<typeof CoupleDataSchema>
export type TimelineItem = z.infer<typeof TimelineItemSchema>
export type PublicWeddingData = z.infer<typeof PublicWeddingDataSchema>