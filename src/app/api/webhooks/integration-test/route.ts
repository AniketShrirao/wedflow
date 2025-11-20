import { NextRequest } from 'next/server'
import { withAuth, createApiResponse, createApiError, AuthenticatedRequest } from '@/lib/api/middleware'
import { getWebhookService } from '@/lib/webhooks/service'

/**
 * Integration test endpoint that simulates real webhook scenarios
 * This endpoint tests the complete webhook flow from trigger to delivery
 */
export async function POST(request: NextRequest) {
    const authHandler = await withAuth(async (authRequest: AuthenticatedRequest) => {
        try {
            const body = await authRequest.json()
            const { scenario = 'full_flow' } = body

            const webhookService = getWebhookService()
            const coupleId = authRequest.couple.id

            const testResults: any[] = []

            switch (scenario) {
                case 'full_flow':
                    // Test complete webhook flow
                    testResults.push(await testInvitationFlow(webhookService, coupleId))
                    testResults.push(await testPhotoUploadFlow(webhookService, coupleId))
                    testResults.push(await testGuestUpdateFlow(webhookService, coupleId))
                    testResults.push(await testTaskCompletionFlow(webhookService, coupleId))
                    break

                case 'invitation_flow':
                    testResults.push(await testInvitationFlow(webhookService, coupleId))
                    break

                case 'photo_flow':
                    testResults.push(await testPhotoUploadFlow(webhookService, coupleId))
                    break

                case 'guest_flow':
                    testResults.push(await testGuestUpdateFlow(webhookService, coupleId))
                    break

                case 'task_flow':
                    testResults.push(await testTaskCompletionFlow(webhookService, coupleId))
                    break

                default:
                    return createApiError('Invalid test scenario', 400)
            }

            const overallSuccess = testResults.every(result => result.success)
            const totalDuration = testResults.reduce((sum, result) => sum + result.duration, 0)

            return createApiResponse({
                scenario,
                results: testResults,
                summary: {
                    total_tests: testResults.length,
                    successful_tests: testResults.filter(r => r.success).length,
                    failed_tests: testResults.filter(r => !r.success).length,
                    overall_success: overallSuccess,
                    total_duration: totalDuration
                }
            }, {
                message: `Integration test scenario '${scenario}' completed`
            })

        } catch (error) {
            console.error('Error running integration test:', error)
            return createApiError('Integration test failed', 500)
        }
    })

    return authHandler(request)
}

/**
 * Test invitation sent webhook flow
 */
async function testInvitationFlow(webhookService: any, coupleId: string) {
    const startTime = Date.now()

    try {
        const guestData = {
            id: 'test-guest-id',
            name: 'Integration Test Guest',
            phone: '+1234567890',
            invitation_method: 'whatsapp'
        }

        await webhookService.triggerInvitationSent(coupleId, guestData)

        return {
            test: 'invitation_sent',
            success: true,
            duration: Date.now() - startTime,
            data: guestData
        }
    } catch (error) {
        return {
            test: 'invitation_sent',
            success: false,
            duration: Date.now() - startTime,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

/**
 * Test photo uploaded webhook flow
 */
async function testPhotoUploadFlow(webhookService: any, coupleId: string) {
    const startTime = Date.now()

    try {
        const photoData = {
            id: 'test-photo-id',
            category: 'wedding',
            file_name: 'integration-test-photo.jpg',
            file_size: 2048000,
            uploaded_by: 'guest'
        }

        await webhookService.triggerPhotoUploaded(coupleId, photoData)

        return {
            test: 'photo_uploaded',
            success: true,
            duration: Date.now() - startTime,
            data: photoData
        }
    } catch (error) {
        return {
            test: 'photo_uploaded',
            success: false,
            duration: Date.now() - startTime,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

/**
 * Test guest updated webhook flow
 */
async function testGuestUpdateFlow(webhookService: any, coupleId: string) {
    const startTime = Date.now()

    try {
        const guestData = {
            id: 'test-guest-id',
            name: 'Updated Integration Test Guest',
            phone: '+1234567890'
        }

        const changes = {
            name: { from: 'Integration Test Guest', to: 'Updated Integration Test Guest' },
            invite_status: { from: 'pending', to: 'sent' }
        }

        await webhookService.triggerGuestUpdated(coupleId, guestData, changes)

        return {
            test: 'guest_updated',
            success: true,
            duration: Date.now() - startTime,
            data: { guest: guestData, changes }
        }
    } catch (error) {
        return {
            test: 'guest_updated',
            success: false,
            duration: Date.now() - startTime,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

/**
 * Test task completed webhook flow
 */
async function testTaskCompletionFlow(webhookService: any, coupleId: string) {
    const startTime = Date.now()

    try {
        const taskData = {
            id: 'test-task-id',
            title: 'Integration Test Task',
            category: 'Testing',
            completed: true
        }

        await webhookService.triggerTaskCompleted(coupleId, taskData)

        return {
            test: 'task_completed',
            success: true,
            duration: Date.now() - startTime,
            data: taskData
        }
    } catch (error) {
        return {
            test: 'task_completed',
            success: false,
            duration: Date.now() - startTime,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

/**
 * Get available integration test scenarios
 */
export async function GET(request: NextRequest) {
    const authHandler = await withAuth(async (_authRequest: AuthenticatedRequest) => {
        try {
            const scenarios = {
                full_flow: {
                    description: 'Test all webhook event types in sequence',
                    events: ['invitation_sent', 'photo_uploaded', 'guest_updated', 'task_completed'],
                    estimated_duration: '2-5 seconds'
                },
                invitation_flow: {
                    description: 'Test invitation sent webhook flow',
                    events: ['invitation_sent'],
                    estimated_duration: '0.5-1 second'
                },
                photo_flow: {
                    description: 'Test photo uploaded webhook flow',
                    events: ['photo_uploaded'],
                    estimated_duration: '0.5-1 second'
                },
                guest_flow: {
                    description: 'Test guest updated webhook flow',
                    events: ['guest_updated'],
                    estimated_duration: '0.5-1 second'
                },
                task_flow: {
                    description: 'Test task completed webhook flow',
                    events: ['task_completed'],
                    estimated_duration: '0.5-1 second'
                }
            }

            const usage = {
                endpoint: '/api/webhooks/integration-test',
                method: 'POST',
                authentication: 'Required (Bearer token)',
                request_body: {
                    scenario: 'Scenario name (default: full_flow)'
                },
                example_request: {
                    scenario: 'full_flow'
                },
                response_format: {
                    scenario: 'full_flow',
                    results: [
                        {
                            test: 'invitation_sent',
                            success: true,
                            duration: 150,
                            data: {}
                        }
                    ],
                    summary: {
                        total_tests: 4,
                        successful_tests: 4,
                        failed_tests: 0,
                        overall_success: true,
                        total_duration: 600
                    }
                }
            }

            return createApiResponse({
                available_scenarios: scenarios,
                usage
            }, {
                message: 'Integration test information retrieved successfully'
            })

        } catch (error) {
            console.error('Error getting integration test info:', error)
            return createApiError('Failed to get integration test information', 500)
        }
    })

    return authHandler(request)
}