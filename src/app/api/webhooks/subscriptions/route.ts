import { NextRequest } from 'next/server'
import { withAuth, createApiResponse, createApiError, AuthenticatedRequest } from '@/lib/api/middleware'
import { z } from 'zod'

const createSubscriptionSchema = z.object({
    url: z.string().url('Invalid webhook URL'),
    events: z.array(z.enum(['invitation_sent', 'photo_uploaded', 'guest_updated', 'task_completed'])).min(1, 'At least one event type is required'),
    description: z.string().optional()
})

/**
 * Get webhook subscriptions for the authenticated couple
 */
export async function GET(request: NextRequest) {
    const authHandler = await withAuth(async (_authRequest: AuthenticatedRequest) => {
        try {
            // For now, return mock data since we don't have a subscriptions table yet
            // In a full implementation, this would query the webhook_subscriptions table
            const mockSubscriptions = [
                {
                    id: 'n8n-default',
                    url: process.env.N8N_WEBHOOK_URL || 'https://example.com/webhook',
                    events: ['invitation_sent', 'photo_uploaded', 'guest_updated', 'task_completed'],
                    description: 'N8N automation webhook',
                    active: true,
                    created_at: new Date().toISOString()
                }
            ].filter(sub => sub.url !== 'https://example.com/webhook') // Only show if N8N URL is configured

            return createApiResponse(mockSubscriptions, {
                message: 'Webhook subscriptions retrieved successfully'
            })

        } catch (error) {
            console.error('Error fetching webhook subscriptions:', error)
            return createApiError('Failed to fetch webhook subscriptions', 500)
        }
    })

    return authHandler(request)
}

/**
 * Create a new webhook subscription
 */
export async function POST(request: NextRequest) {
    const authHandler = await withAuth(async (authRequest: AuthenticatedRequest) => {
        try {
            const body = await authRequest.json()
            const validatedData = createSubscriptionSchema.parse(body)

            // Generate a secret for this subscription
            const crypto = require('crypto')
            const secret = crypto.randomBytes(32).toString('hex')

            // In a full implementation, this would insert into webhook_subscriptions table
            const newSubscription = {
                id: crypto.randomUUID(),
                couple_id: authRequest.couple.id,
                url: validatedData.url,
                events: validatedData.events,
                description: validatedData.description || '',
                secret: secret,
                active: true,
                created_at: new Date().toISOString()
            }

            console.log('Created webhook subscription:', newSubscription)

            return createApiResponse(newSubscription, {
                message: 'Webhook subscription created successfully',
                status: 201
            })

        } catch (error) {
            console.error('Error creating webhook subscription:', error)

            if (error instanceof z.ZodError) {
                return createApiError('Validation failed', 400, error.errors)
            }

            return createApiError('Failed to create webhook subscription', 500)
        }
    })

    return authHandler(request)
}