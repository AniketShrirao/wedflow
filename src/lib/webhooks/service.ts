import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'

export interface WebhookEvent {
    event_type: 'invitation_sent' | 'photo_uploaded' | 'guest_updated' | 'task_completed'
    couple_id: string
    data: Record<string, any>
    timestamp: string
}

export interface WebhookSubscription {
    id: string
    couple_id: string
    url: string
    events: string[]
    secret: string
    active: boolean
    created_at: string
}

/**
 * Webhook service for managing and triggering webhooks
 */
export class WebhookService {
    private static instance: WebhookService
    private webhookSecret: string

    constructor() {
        this.webhookSecret = process.env.WEBHOOK_SECRET || 'default-webhook-secret'
    }

    static getInstance(): WebhookService {
        if (!WebhookService.instance) {
            WebhookService.instance = new WebhookService()
        }
        return WebhookService.instance
    }

    /**
     * Generate webhook signature for payload verification
     */
    generateSignature(payload: string, secret: string): string {
        return crypto
            .createHmac('sha256', secret)
            .update(payload)
            .digest('hex')
    }

    /**
     * Verify webhook signature
     */
    verifySignature(payload: string, signature: string, secret: string): boolean {
        const expectedSignature = this.generateSignature(payload, secret)
        return crypto.timingSafeEqual(
            Buffer.from(signature, 'hex'),
            Buffer.from(expectedSignature, 'hex')
        )
    }

    /**
     * Trigger webhook for a specific event
     */
    async triggerWebhook(event: WebhookEvent): Promise<void> {
        try {
            // Get webhook subscriptions for this couple and event type
            const subscriptions = await this.getWebhookSubscriptions(event.couple_id, event.event_type)

            // Send webhook to each subscription
            const promises = subscriptions.map(subscription =>
                this.sendWebhook(subscription, event)
            )

            await Promise.allSettled(promises)
        } catch (error) {
            console.error('Error triggering webhook:', error)
        }
    }

    /**
     * Send webhook to a specific subscription
     */
    private async sendWebhook(subscription: WebhookSubscription, event: WebhookEvent): Promise<void> {
        try {
            const payload = JSON.stringify(event)
            const signature = this.generateSignature(payload, subscription.secret)
            const timestamp = Date.now().toString()

            const response = await fetch(subscription.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Webhook-Signature': signature,
                    'X-Webhook-Timestamp': timestamp,
                    'User-Agent': 'Wedflow-Webhooks/1.0'
                },
                body: payload,
                signal: AbortSignal.timeout(30000) // 30 second timeout
            })

            if (!response.ok) {
                console.error(`Webhook delivery failed for ${subscription.url}: ${response.status} ${response.statusText}`)
            } else {
                console.log(`Webhook delivered successfully to ${subscription.url}`)
            }
        } catch (error) {
            console.error(`Error sending webhook to ${subscription.url}:`, error)
        }
    }

    /**
     * Get webhook subscriptions for a couple and event type
     */
    private async getWebhookSubscriptions(coupleId: string, eventType: string): Promise<WebhookSubscription[]> {
        // For now, return hardcoded N8N webhook URL if configured
        // In a full implementation, this would query a database table
        const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL

        if (!n8nWebhookUrl) {
            return []
        }

        return [{
            id: 'n8n-default',
            couple_id: coupleId,
            url: n8nWebhookUrl,
            events: ['invitation_sent', 'photo_uploaded', 'guest_updated', 'task_completed'],
            secret: this.webhookSecret,
            active: true,
            created_at: new Date().toISOString()
        }]
    }

    /**
     * Create webhook event for invitation sent
     */
    async triggerInvitationSent(coupleId: string, guestData: any): Promise<void> {
        const event: WebhookEvent = {
            event_type: 'invitation_sent',
            couple_id: coupleId,
            data: {
                guest_id: guestData.id,
                guest_name: guestData.name,
                guest_phone: guestData.phone,
                invitation_method: guestData.invitation_method || 'whatsapp',
                sent_at: new Date().toISOString()
            },
            timestamp: new Date().toISOString()
        }

        await this.triggerWebhook(event)
    }

    /**
     * Create webhook event for photo uploaded
     */
    async triggerPhotoUploaded(coupleId: string, photoData: any): Promise<void> {
        const event: WebhookEvent = {
            event_type: 'photo_uploaded',
            couple_id: coupleId,
            data: {
                photo_id: photoData.id,
                category: photoData.category,
                file_name: photoData.file_name,
                file_size: photoData.file_size,
                uploaded_by: photoData.uploaded_by || 'guest',
                uploaded_at: new Date().toISOString()
            },
            timestamp: new Date().toISOString()
        }

        await this.triggerWebhook(event)
    }

    /**
     * Create webhook event for guest updated
     */
    async triggerGuestUpdated(coupleId: string, guestData: any, changes: any): Promise<void> {
        const event: WebhookEvent = {
            event_type: 'guest_updated',
            couple_id: coupleId,
            data: {
                guest_id: guestData.id,
                guest_name: guestData.name,
                changes: changes,
                updated_at: new Date().toISOString()
            },
            timestamp: new Date().toISOString()
        }

        await this.triggerWebhook(event)
    }

    /**
     * Create webhook event for task completed
     */
    async triggerTaskCompleted(coupleId: string, taskData: any): Promise<void> {
        const event: WebhookEvent = {
            event_type: 'task_completed',
            couple_id: coupleId,
            data: {
                task_id: taskData.id,
                task_title: taskData.title,
                task_category: taskData.category,
                completed_at: new Date().toISOString()
            },
            timestamp: new Date().toISOString()
        }

        await this.triggerWebhook(event)
    }
}

/**
 * Helper function to get webhook service instance
 */
export function getWebhookService(): WebhookService {
    return WebhookService.getInstance()
}