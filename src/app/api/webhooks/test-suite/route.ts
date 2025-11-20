import { NextRequest } from 'next/server'
import { withAuth, createApiResponse, createApiError, AuthenticatedRequest } from '@/lib/api/middleware'
import { runWebhookTestSuite, testWebhookEndpoint, generateTestData } from '@/lib/webhooks/testing'
import { z } from 'zod'

const testSuiteSchema = z.object({
    url: z.string().url('Invalid webhook URL'),
    secret: z.string().min(1, 'Secret is required'),
    events: z.array(z.enum(['invitation_sent', 'photo_uploaded', 'guest_updated', 'task_completed'])).optional()
})

const singleTestSchema = z.object({
    url: z.string().url('Invalid webhook URL'),
    secret: z.string().min(1, 'Secret is required'),
    event_type: z.enum(['invitation_sent', 'photo_uploaded', 'guest_updated', 'task_completed']),
    test_data: z.record(z.any()).optional()
})

/**
 * Run webhook test suite or single webhook test
 */
export async function POST(request: NextRequest) {
    const authHandler = await withAuth(async (authRequest: AuthenticatedRequest) => {
        try {
            const body = await authRequest.json()
            const { test_type = 'suite' } = body

            if (test_type === 'single') {
                // Run single webhook test
                const validatedData = singleTestSchema.parse(body)

                const testEvent = generateTestData(validatedData.event_type, authRequest.couple.id, validatedData.test_data)

                const result = await testWebhookEndpoint(
                    validatedData.url,
                    testEvent,
                    validatedData.secret
                )

                return createApiResponse(result, {
                    message: `Single webhook test for ${validatedData.event_type} completed`
                })
            } else {
                // Run full test suite
                const validatedData = testSuiteSchema.parse(body)

                const events = validatedData.events || ['invitation_sent', 'photo_uploaded', 'guest_updated', 'task_completed']

                const results = await runWebhookTestSuite(
                    'test-suite',
                    validatedData.url,
                    validatedData.secret,
                    authRequest.couple.id
                )

                return createApiResponse(results, {
                    message: 'Webhook test suite completed'
                })
            }

        } catch (error) {
            console.error('Error running webhook tests:', error)

            if (error instanceof z.ZodError) {
                return createApiError('Validation failed', 400, error.errors)
            }

            return createApiError('Failed to run webhook tests', 500)
        }
    })

    return authHandler(request)
}

/**
 * Get webhook test information and examples
 */
export async function GET(request: NextRequest) {
    const authHandler = await withAuth(async (_authRequest: AuthenticatedRequest) => {
        try {
            const testInfo = {
                description: 'Webhook testing suite for validating webhook integrations',
                endpoints: {
                    test_suite: {
                        method: 'POST',
                        description: 'Run complete webhook test suite',
                        required_fields: ['url', 'secret'],
                        optional_fields: ['events'],
                        example: {
                            url: 'https://your-webhook-endpoint.com/webhook',
                            secret: 'your-webhook-secret',
                            events: ['invitation_sent', 'photo_uploaded']
                        }
                    },
                    single_test: {
                        method: 'POST',
                        description: 'Run single webhook test',
                        required_fields: ['url', 'secret', 'event_type', 'test_type'],
                        optional_fields: ['test_data'],
                        example: {
                            test_type: 'single',
                            url: 'https://your-webhook-endpoint.com/webhook',
                            secret: 'your-webhook-secret',
                            event_type: 'invitation_sent',
                            test_data: {
                                guest_name: 'Test Guest',
                                phone: '+1234567890'
                            }
                        }
                    }
                },
                supported_events: [
                    'invitation_sent',
                    'photo_uploaded',
                    'guest_updated',
                    'task_completed'
                ],
                response_format: {
                    success: true,
                    results: [
                        {
                            event_type: 'invitation_sent',
                            success: true,
                            response_time: 150,
                            status_code: 200,
                            response_body: {}
                        }
                    ],
                    summary: {
                        total_tests: 4,
                        successful_tests: 4,
                        failed_tests: 0,
                        average_response_time: 125
                    }
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