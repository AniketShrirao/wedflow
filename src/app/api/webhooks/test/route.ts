import { NextRequest } from 'next/server'
import { withAuth, createApiResponse, createApiError, AuthenticatedRequest } from '@/lib/api/middleware'
import { testWebhookEndpoint, generateTestData } from '@/lib/webhooks/testing'
import { z } from 'zod'

const testWebhookSchema = z.object({
    url: z.string().url('Invalid webhook URL'),
    secret: z.string().min(1, 'Secret is required'),
    event_type: z.enum(['invitation_sent', 'photo_uploaded', 'guest_updated', 'task_completed']),
    test_data: z.record(z.any()).optional()
})

/**
 * Test webhook endpoint with sample data
 * This is useful for testing webhook integrations and N8N workflows
 */
export async function POST(request: NextRequest) {
    const authHandler = await withAuth(async (authRequest: AuthenticatedRequest) => {
        try {
            const body = await authRequest.json()
            const validatedData = testWebhookSchema.parse(body)

            // Generate test event if not provided
            const testEvent = generateTestData(validatedData.event_type, authRequest.couple.id, validatedData.test_data)

            // Test the webhook endpoint
            const result = await testWebhookEndpoint(
                validatedData.url,
                testEvent,
                validatedData.secret
            )

            return createApiResponse(result, {
                message: `Webhook test for ${validatedData.event_type} completed`
            })

        } catch (error) {
            console.error('Error testing webhook:', error)

            if (error instanceof z.ZodError) {
                return createApiError('Validation failed', 400, error.errors)
            }

            return createApiError('Failed to test webhook', 500)
        }
    })

    return authHandler(request)
}

/**
 * Get webhook test information
 */
export async function GET(request: NextRequest) {
    const authHandler = await withAuth(async (_authRequest: AuthenticatedRequest) => {
        try {
            const testInfo = {
                description: 'Test webhook endpoints with sample data',
                endpoint: '/api/webhooks/test',
                method: 'POST',
                authentication: 'Required (Bearer token)',
                request_body: {
                    url: 'Webhook endpoint URL (required)',
                    secret: 'Webhook secret for signature verification (required)',
                    event_type: 'Event type to test (required)',
                    test_data: 'Custom test data (optional, will generate if not provided)'
                },
                supported_events: [
                    'invitation_sent',
                    'photo_uploaded',
                    'guest_updated',
                    'task_completed'
                ],
                example_request: {
                    url: 'https://your-n8n-instance.com/webhook/wedflow',
                    secret: 'your-webhook-secret',
                    event_type: 'invitation_sent',
                    test_data: {
                        guest_name: 'John Doe',
                        phone: '+1234567890',
                        invitation_method: 'whatsapp'
                    }
                },
                example_response: {
                    success: true,
                    event_type: 'invitation_sent',
                    response_time: 150,
                    status_code: 200,
                    request_payload: {
                        event: 'invitation_sent',
                        timestamp: '2024-01-15T10:30:00Z',
                        data: {}
                    },
                    response_body: {
                        received: true,
                        processed: true
                    }
                },
                webhook_payload_format: {
                    event: 'Event type (invitation_sent, photo_uploaded, etc.)',
                    timestamp: 'ISO 8601 timestamp',
                    couple_id: 'Unique couple identifier',
                    data: 'Event-specific data object',
                    signature: 'HMAC-SHA256 signature for verification'
                }
            }

            return createApiResponse(testInfo, {
                message: 'Webhook test information retrieved successfully'
            })

        } catch (error) {
            console.error('Error getting webhook test info:', error)
            return createApiError('Failed to get webhook test information', 500)
        }
    })

    return authHandler(request)
}