import { z } from 'zod'

// Guest schemas
export const createGuestSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits').max(20, 'Phone number too long'),
    email: z.string().email('Invalid email format').optional().or(z.literal('')),
    group_name: z.string().max(50, 'Group name too long').optional().or(z.literal(''))
})

export const updateGuestSchema = createGuestSchema.extend({
    invite_status: z.enum(['pending', 'sent', 'viewed']).optional()
})

export const bulkImportGuestsSchema = z.object({
    guests: z.array(createGuestSchema).min(1, 'At least one guest is required')
})

// Vendor contact schemas
export const createVendorContactSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits').max(20, 'Phone number too long'),
    email: z.string().email('Invalid email format').optional().or(z.literal('')),
    category: z.enum(['decorator', 'event_coordinator', 'hall_manager', 'transport', 'photographer', 'caterer']),
    notes: z.string().max(500, 'Notes too long').optional().or(z.literal(''))
})

export const updateVendorContactSchema = createVendorContactSchema

// Event details schemas
export const eventItemSchema = z.object({
    id: z.string(),
    name: z.string().min(1, 'Event name is required'),
    date: z.string(),
    time: z.string(),
    description: z.string().optional()
})

export const venueSchema = z.object({
    id: z.string(),
    name: z.string().min(1, 'Venue name is required'),
    address: z.string().min(1, 'Address is required'),
    description: z.string().optional(),
    coordinates: z.object({
        lat: z.number(),
        lng: z.number()
    }).optional()
})

export const timelineItemSchema = z.object({
    id: z.string(),
    time: z.string(),
    event: z.string().min(1, 'Event is required'),
    description: z.string().optional()
})

export const updateEventDetailsSchema = z.object({
    couple_intro: z.string().max(1000, 'Introduction too long').optional(),
    events: z.array(eventItemSchema).optional(),
    venues: z.array(venueSchema).optional(),
    timeline: z.array(timelineItemSchema).optional()
})

// Photo collection schemas
export const photoCategorySchema = z.object({
    id: z.string(),
    name: z.string(),
    photos: z.array(z.object({
        id: z.string(),
        url: z.string().url('Invalid photo URL'),
        thumbnail: z.string().url('Invalid thumbnail URL').optional()
    }))
})

export const updatePhotoCollectionSchema = z.object({
    drive_folder_url: z.string().url('Invalid Google Drive URL').optional(),
    categories: z.array(photoCategorySchema).optional(),
    highlight_photos: z.array(z.string()).optional()
})

// Gift settings schemas
export const updateGiftSettingsSchema = z.object({
    upi_id: z.string()
        .regex(/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/, 'Invalid UPI ID format')
        .optional()
        .or(z.literal('')),
    qr_code_url: z.string().url('Invalid QR code URL').optional().or(z.literal('')),
    custom_message: z.string().max(500, 'Message too long').optional().or(z.literal(''))
})

// Todo task schemas
export const createTodoTaskSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    description: z.string().max(1000, 'Description too long').optional().or(z.literal('')),
    category: z.string().min(1, 'Category is required').max(50, 'Category too long'),
    due_date: z.string().datetime().optional().or(z.literal(''))
})

export const updateTodoTaskSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
    description: z.string().max(1000, 'Description too long').optional(),
    category: z.string().min(1, 'Category is required').max(50, 'Category too long').optional(),
    completed: z.boolean().optional(),
    due_date: z.string().datetime().optional().or(z.literal(''))
})

// Webhook schemas
export const webhookEventSchema = z.object({
    event_type: z.enum(['invitation_sent', 'photo_uploaded', 'guest_updated', 'task_completed']),
    couple_id: z.string().uuid(),
    data: z.record(z.any()),
    timestamp: z.string().datetime()
})

// Query parameter schemas
export const paginationSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10)
})

export const guestQuerySchema = paginationSchema.extend({
    search: z.string().optional(),
    group: z.string().optional(),
    status: z.enum(['pending', 'sent', 'viewed']).optional()
})

export const contactQuerySchema = paginationSchema.extend({
    search: z.string().optional(),
    category: z.enum(['decorator', 'event_coordinator', 'hall_manager', 'transport', 'photographer', 'caterer']).optional()
})

export const todoQuerySchema = paginationSchema.extend({
    category: z.string().optional(),
    completed: z.coerce.boolean().optional()
})

// Webhook signature verification schema
export const webhookSignatureSchema = z.object({
    signature: z.string(),
    timestamp: z.string(),
    payload: z.string()
})