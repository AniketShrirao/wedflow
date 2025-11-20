import { getWebhookService, WebhookEvent } from './service'

export interface WebhookTestResult {
    success: boolean
    status?: number
    response?: any
    error?: string
    duration: number
}

export interface WebhookTestSuite {
    subscription_id: string
    url: string
    results: {
        [eventType: string]: WebhookTestResult
    }
    overall_success: boolean
    total_duration: number
}

/**
 * Test a webhook endpoint with sample data
 */
export async function testWebhookEndpoint(
    url: string,
    event: WebhookEvent,
    secret: string
): Promise<WebhookTestResult> {
    const startTime = Date.now()

    try {
        const webhookService = getWebhookService()
        const payload = JSON.stringify(event)
        const signature = webhookService.generateSignature(payload, secret)
        const timestamp = Date.now().toString()

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Webhook-Signature': signature,
                'X-Webhook-Timestamp': timestamp,
                'User-Agent': 'Wedflow-Webhooks-Test/1.0'
            },
            body: payload,
            signal: AbortSignal.timeout(10000) // 10 second timeout for tests
        })

        const responseData = await response.json().catch(() => null)
        const duration = Date.now() - startTime

        return {
            success: response.ok,
            status: response.status,
            response: responseData,
            duration
        }

    } catch (error) {
        const duration = Date.now() - startTime

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            duration
        }
    }
}

/**
 * Run a comprehensive test suite for a webhook subscription
 */
export async function runWebhookTestSuite(
    subscriptionId: string,
    url: string,
    secret: string,
    coupleId: string
): Promise<WebhookTestSuite> {
    const startTime = Date.now()
    const results: { [eventType: string]: WebhookTestResult } = {}

    // Test data for each event type
    const testEvents: { [key: string]: WebhookEvent } = {
        invitation_sent: {
            event_type: 'invitation_sent',
            couple_id: coupleId,
            data: {
                guest_id: 'test-guest-id',
                guest_name: 'Test Guest',
                guest_phone: '+1234567890',
                invitation_method: 'whatsapp',
                sent_at: new Date().toISOString()
            },
            timestamp: new Date().toISOString()
        },
        photo_uploaded: {
            event_type: 'photo_uploaded',
            couple_id: coupleId,
            data: {
                photo_id: 'test-photo-id',
                category: 'wedding',
                file_name: 'test-photo.jpg',
                file_size: 1024000,
                uploaded_by: 'guest',
                uploaded_at: new Date().toISOString()
            },
            timestamp: new Date().toISOString()
        },
        guest_updated: {
            event_type: 'guest_updated',
            couple_id: coupleId,
            data: {
                guest_id: 'test-guest-id',
                guest_name: 'Test Guest Updated',
                changes: {
                    name: { from: 'Test Guest', to: 'Test Guest Updated' },
                    invite_status: { from: 'pending', to: 'sent' }
                },
                updated_at: new Date().toISOString()
            },
            timestamp: new Date().toISOString()
        },
        task_completed: {
            event_type: 'task_completed',
            couple_id: coupleId,
            data: {
                task_id: 'test-task-id',
                task_title: 'Test Task',
                task_category: 'Planning',
                completed_at: new Date().toISOString()
            },
            timestamp: new Date().toISOString()
        }
    }

    // Run tests for each event type
    for (const [eventType, event] of Object.entries(testEvents)) {
        results[eventType] = await testWebhookEndpoint(url, event, secret)
    }

    const totalDuration = Date.now() - startTime
    const overallSuccess = Object.values(results).every(result => result.success)

    return {
        subscription_id: subscriptionId,
        url,
        results,
        overall_success: overallSuccess,
        total_duration: totalDuration
    }
}

/**
 * Generate test data for a specific event type
 */
export function generateTestData(eventType: string, coupleId: string, customData?: any): WebhookEvent {
    const baseEvent = {
        couple_id: coupleId,
        timestamp: new Date().toISOString()
    }

    switch (eventType) {
        case 'invitation_sent':
            return {
                event_type: 'invitation_sent',
                ...baseEvent,
                data: {
                    guest_id: 'test-guest-id',
                    guest_name: 'Test Guest',
                    guest_phone: '+1234567890',
                    invitation_method: 'whatsapp',
                    sent_at: new Date().toISOString(),
                    ...customData
                }
            }

        case 'photo_uploaded':
            return {
                event_type: 'photo_uploaded',
                ...baseEvent,
                data: {
                    photo_id: 'test-photo-id',
                    category: 'wedding',
                    file_name: 'test-photo.jpg',
                    file_size: 1024000,
                    uploaded_by: 'guest',
                    uploaded_at: new Date().toISOString(),
                    ...customData
                }
            }

        case 'guest_updated':
            return {
                event_type: 'guest_updated',
                ...baseEvent,
                data: {
                    guest_id: 'test-guest-id',
                    guest_name: 'Test Guest',
                    changes: {
                        name: { from: 'Test Guest', to: 'Test Guest Updated' }
                    },
                    updated_at: new Date().toISOString(),
                    ...customData
                }
            }

        case 'task_completed':
            return {
                event_type: 'task_completed',
                ...baseEvent,
                data: {
                    task_id: 'test-task-id',
                    task_title: 'Test Task',
                    task_category: 'Planning',
                    completed_at: new Date().toISOString(),
                    ...customData
                }
            }

        default:
            throw new Error(`Unknown event type: ${eventType}`)
    }
}

/**
 * Validate webhook signature for testing
 */
export function validateWebhookSignature(
    payload: string,
    signature: string,
    secret: string
): boolean {
    const webhookService = getWebhookService()
    return webhookService.verifySignature(payload, signature, secret)
}

/**
 * Generate webhook signature for testing
 */
export function generateWebhookSignature(payload: string, secret: string): string {
    const webhookService = getWebhookService()
    return webhookService.generateSignature(payload, secret)
}