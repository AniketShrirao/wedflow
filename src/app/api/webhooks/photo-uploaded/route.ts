import { NextRequest, NextResponse } from 'next/server'
import { getWebhookService } from '@/lib/webhooks/service'
import { webhookEventSchema } from '@/lib/api/schemas'
import { createApiError, createApiResponse } from '@/lib/api/middleware'

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

        // Verify event type
        if (validatedData.event_type !== 'photo_uploaded') {
            return createApiError('Invalid event type for this endpoint', 400)
        }

        // Process the webhook event
        console.log('Photo uploaded webhook received:', {
            couple_id: validatedData.couple_id,
            photo_data: validatedData.data,
            timestamp: validatedData.timestamp
        })

        // Here you could:
        // 1. Update photo collection in database
        // 2. Trigger photo processing (thumbnails, optimization)
        // 3. Send notifications to couple about new photos
        // 4. Update photo gallery cache
        // 5. Trigger backup processes

        // For N8N integration, you might want to:
        // - Send notifications to couple via email/SMS
        // - Update social media or other platforms
        // - Trigger photo analysis or tagging workflows

        return createApiResponse(
            { processed: true },
            {
                message: 'Photo uploaded webhook processed successfully',
                status: 200
            }
        )

    } catch (error) {
        console.error('Error processing photo uploaded webhook:', error)

        if (error instanceof Error && error.name === 'ZodError') {
            return createApiError('Invalid webhook data format', 400, error)
        }

        return createApiError('Webhook processing failed', 500)
    }
}