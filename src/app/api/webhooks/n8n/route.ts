import { NextRequest, NextResponse } from 'next/server'
import { getWebhookService } from '@/lib/webhooks/service'
import { webhookEventSchema } from '@/lib/api/schemas'
import { createApiError, createApiResponse } from '@/lib/api/middleware'

/**
 * General webhook endpoint for N8N integration
 * This endpoint can handle all webhook event types and forward them to N8N workflows
 */
export async function POST(request: NextRequest) {
    try {
        const webhookService = getWebhookService()

        // Get webhook signature and timestamp from headers
        const signature = request.headers.get('x-webhook-signature')
        const timestamp = request.headers.get('x-webhook-timestamp')

        if (!signature || !timestamp) {
            return createApiError('Missing webhook signature or timestamp', 401)
        }

        // Get raw payload for signature verification
        const payload = await request.text()

        // Verify webhook signature
        const webhookSecret = process.env.WEBHOOK_SECRET || 'default-webhook-secret'
        const isValidSignature = webhookService.verifySignature(payload, signature, webhookSecret)

        if (!isValidSignature) {
            return createApiError('Invalid webhook signature', 401)
        }

        // Parse and validate webhook data
        let webhookData
        try {
            webhookData = JSON.parse(payload)
        } catch (error) {
            return createApiError('Invalid JSON payload', 400)
        }

        const validatedData = webhookEventSchema.parse(webhookData)

        // Process the webhook event based on type
        console.log('N8N webhook received:', {
            event_type: validatedData.event_type,
            couple_id: validatedData.couple_id,
            data: validatedData.data,
            timestamp: validatedData.timestamp
        })

        // Route to appropriate handler based on event type
        switch (validatedData.event_type) {
            case 'invitation_sent':
                await handleInvitationSent(validatedData)
                break

            case 'photo_uploaded':
                await handlePhotoUploaded(validatedData)
                break

            case 'guest_updated':
                await handleGuestUpdated(validatedData)
                break

            case 'task_completed':
                await handleTaskCompleted(validatedData)
                break

            default:
                console.warn(`Unknown webhook event type: ${validatedData.event_type}`)
        }

        return createApiResponse(
            {
                processed: true,
                event_type: validatedData.event_type,
                couple_id: validatedData.couple_id
            },
            {
                message: 'N8N webhook processed successfully',
                status: 200
            }
        )

    } catch (error) {
        console.error('Error processing N8N webhook:', error)

        if (error instanceof Error && error.name === 'ZodError') {
            return createApiError('Invalid webhook data format', 400, error)
        }

        return createApiError('Webhook processing failed', 500)
    }
}

/**
 * Handle invitation sent events for N8N workflows
 */
async function handleInvitationSent(data: any) {
    console.log('Processing invitation sent for N8N:', data.data)

    // N8N workflow ideas:
    // - Send follow-up emails to guests
    // - Update CRM systems
    // - Track invitation delivery rates
    // - Send notifications to wedding planners
}

/**
 * Handle photo uploaded events for N8N workflows
 */
async function handlePhotoUploaded(data: any) {
    console.log('Processing photo uploaded for N8N:', data.data)

    // N8N workflow ideas:
    // - Backup photos to multiple cloud services
    // - Generate thumbnails and optimize images
    // - Send notifications to couple about new photos
    // - Update social media with new photos
    // - Trigger photo analysis and tagging
}

/**
 * Handle guest updated events for N8N workflows
 */
async function handleGuestUpdated(data: any) {
    console.log('Processing guest updated for N8N:', data.data)

    // N8N workflow ideas:
    // - Sync guest data with external systems
    // - Update seating arrangements
    // - Send personalized messages based on changes
    // - Update catering numbers
    // - Trigger RSVP follow-ups
}

/**
 * Handle task completed events for N8N workflows
 */
async function handleTaskCompleted(data: any) {
    console.log('Processing task completed for N8N:', data.data)

    // N8N workflow ideas:
    // - Send congratulations to couple
    // - Update project management tools
    // - Trigger next task recommendations
    // - Send progress reports to wedding planners
    // - Update timeline and milestone tracking
}