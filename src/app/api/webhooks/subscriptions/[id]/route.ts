import { NextRequest } from 'next/server'
import { withAuth, createApiResponse, createApiError, AuthenticatedRequest } from '@/lib/api/middleware'
import { z } from 'zod'

const updateSubscriptionSchema = z.object({
    url: z.string().url('Invalid webhook URL').optional(),
    events: z.array(z.enum(['invitation_sent', 'photo_uploaded', 'guest_updated', 'task_completed'])).min(1, 'At least one event type is required').optional(),
    description: z.string().optional(),
    active: z.boolean().optional()
})

/**
 * Get a specific webhook subscription
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const authHandler = await withAuth(async (authRequest: AuthenticatedRequest) => {
        try {
            const { id } = await params

            // Mock implementation - in a real app, this would query the database
            if (id === 'n8n-default' && process.env.N8N_WEBHOOK_URL) {
                const subscription = {
                    id: 'n8n-default',
                    couple_id: authRequest.couple.id,
                    url: process.env.N8N_WEBHOOK_URL,
                    events: ['invitation_sent', 'photo_uploaded', 'guest_updated', 'task_completed'],
                    description: 'N8N automation webhook',
                    active: true,
                    created_at: new Date().toISOString()
                }

                return createApiResponse(subscription, {
                    message: 'Webhook subscription retrieved successfully'
                })
            }

            return createApiError('Webhook subscription not found', 404)

        } catch (error) {
            console.error('Error fetching webhook subscription:', error)
            return createApiError('Failed to fetch webhook subscription', 500)
        }
    })

    return authHandler(request)
}

/**
 * Update a webhook subscription
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const authHandler = await withAuth(async (authRequest: AuthenticatedRequest) => {
        try {
            const { id } = await params
            const body = await authRequest.json()
            const validatedData = updateSubscriptionSchema.parse(body)

            // Mock implementation - in a real app, this would update the database
            if (id === 'n8n-default') {
                const updatedSubscription = {
                    id: 'n8n-default',
                    couple_id: authRequest.couple.id,
                    url: validatedData.url || process.env.N8N_WEBHOOK_URL,
                    events: validatedData.events || ['invitation_sent', 'photo_uploaded', 'guest_updated', 'task_completed'],
                    description: validatedData.description || 'N8N automation webhook',
                    active: validatedData.active !== undefined ? validatedData.active : true,
                    updated_at: new Date().toISOString()
                }

                console.log('Updated webhook subscription:', updatedSubscription)

                return createApiResponse(updatedSubscription, {
                    message: 'Webhook subscription updated successfully'
                })
            }

            return createApiError('Webhook subscription not found', 404)

        } catch (error) {
            console.error('Error updating webhook subscription:', error)

            if (error instanceof z.ZodError) {
                return createApiError('Validation failed', 400, error.errors)
            }

            return createApiError('Failed to update webhook subscription', 500)
        }
    })

    return authHandler(request)
}

/**
 * Delete a webhook subscription
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const authHandler = await withAuth(async (_authRequest: AuthenticatedRequest) => {
        try {
            const { id } = await params

            // Mock implementation - in a real app, this would delete from database
            if (id === 'n8n-default') {
                console.log('Deleted webhook subscription:', id)

                return createApiResponse(null, {
                    message: 'Webhook subscription deleted successfully'
                })
            }

            return createApiError('Webhook subscription not found', 404)

        } catch (error) {
            console.error('Error deleting webhook subscription:', error)
            return createApiError('Failed to delete webhook subscription', 500)
        }
    })

    return authHandler(request)
}