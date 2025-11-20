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
        if (validatedData.event_type !== 'invitation_sent') {
            return createApiError('Invalid event type for this endpoint', 400)
        }

        // Process the webhook event
        console.log('Invitation sent webhook received:', {
            couple_id: validatedData.couple_id,
            guest_data: validatedData.data,
            timestamp: validatedData.timestamp
        })

        // Here you could:
        // 1. Update guest invitation status in database
        // 2. Send notifications to couple
        // 3. Update analytics/metrics
        // 4. Trigger other automation workflows

        // For N8N integration, you might want to forward this to other systems
        // or perform additional processing based on the invitation data

        return createApiResponse(
            { processed: true },
            {
                message: 'Invitation sent webhook processed successfully',
                status: 200
            }
        )

    } catch (error) {
        console.error('Error processing invitation sent webhook:', error)

        if (error instanceof Error && error.name === 'ZodError') {
            return createApiError('Invalid webhook data format', 400, error)
        }

        return createApiError('Webhook processing failed', 500)
    }
}