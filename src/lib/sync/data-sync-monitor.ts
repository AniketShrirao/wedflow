import { createClient } from '@/lib/supabase/client'
import { checkPublicDataIntegrity } from '@/lib/data/integrity-checker'
import { validatePublicWeddingData } from '@/lib/validation/validator'

export interface SyncStatus {
    coupleId: string
    lastSyncTime: Date
    isInSync: boolean
    pendingChanges: string[]
    failedSyncs: number
    nextRetryTime?: Date
}

export interface SyncResult {
    success: boolean
    syncedFields: string[]
    failedFields: Array<{
        field: string
        error: string
    }>
    timestamp: Date
}

export interface SyncNotification {
    type: 'success' | 'error' | 'warning' | 'info'
    message: string
    details?: string
    timestamp: Date
    autoHide?: boolean
}

class DataSyncMonitor {
    private syncStatusCache = new Map<string, SyncStatus>()
    private syncListeners = new Map<string, Set<(status: SyncStatus) => void>>()
    private notificationListeners = new Set<(notification: SyncNotification) => void>()
    private retryTimeouts = new Map<string, NodeJS.Timeout>()

    /**
     * Check current sync status for a couple
     */
    async checkSyncStatus(coupleId: string): Promise<SyncStatus> {
        try {
            const supabase = createClient()

            // Get the couple's data
            const { data: couple, error: coupleError } = await supabase
                .from('couples')
                .select('*')
                .eq('id', coupleId)
                .single()

            if (coupleError || !couple) {
                throw new Error('Couple not found')
            }

            // Get related data
            const [eventDetails, photoCollection, giftSettings] = await Promise.all([
                supabase.from('event_details').select('*').eq('couple_id', coupleId).single(),
                supabase.from('photo_collections').select('*').eq('couple_id', coupleId).single(),
                supabase.from('gift_settings').select('*').eq('couple_id', coupleId).single()
            ])

            // Prepare public data structure
            const publicData = {
                couple: {
                    partner1_name: couple.partner1_name,
                    partner2_name: couple.partner2_name,
                    wedding_date: couple.wedding_date,
                    couple_slug: couple.couple_slug,
                },
                events: eventDetails.data || {
                    couple_intro: '',
                    events: [],
                    venues: [],
                    timeline: []
                },
                photos: photoCollection.data ? {
                    categories: photoCollection.data.categories || [],
                    highlight_photos: photoCollection.data.highlight_photos || []
                } : null,
                gifts: giftSettings.data ? {
                    upi_id: giftSettings.data.upi_id,
                    qr_code_url: giftSettings.data.qr_code_url,
                    custom_message: giftSettings.data.custom_message
                } : null
            }

            // Validate the data
            const validationResult = validatePublicWeddingData(publicData)
            const integrityResult = checkPublicDataIntegrity(publicData)

            const status: SyncStatus = {
                coupleId,
                lastSyncTime: new Date(),
                isInSync: validationResult.isValid && integrityResult.isValid,
                pendingChanges: integrityResult.missingFields,
                failedSyncs: 0,
                nextRetryTime: undefined
            }

            // Cache the status
            this.syncStatusCache.set(coupleId, status)

            // Notify listeners
            this.notifyStatusListeners(coupleId, status)

            return status
        } catch (error) {
            console.error('Error checking sync status:', error)

            const errorStatus: SyncStatus = {
                coupleId,
                lastSyncTime: new Date(),
                isInSync: false,
                pendingChanges: ['sync_check_failed'],
                failedSyncs: 1,
                nextRetryTime: new Date(Date.now() + 60000) // Retry in 1 minute
            }

            this.syncStatusCache.set(coupleId, errorStatus)
            return errorStatus
        }
    }

    /**
     * Force sync data for a couple
     */
    async forceSyncData(coupleId: string): Promise<SyncResult> {
        const startTime = new Date()
        const syncedFields: string[] = []
        const failedFields: Array<{ field: string; error: string }> = []

        try {
            // Notify start of sync
            this.notifyListeners({
                type: 'info',
                message: 'Starting data synchronization...',
                timestamp: startTime,
                autoHide: true
            })

            const supabase = createClient()

            // Get current data and validate
            const status = await this.checkSyncStatus(coupleId)

            if (status.isInSync) {
                this.notifyListeners({
                    type: 'success',
                    message: 'Data is already synchronized',
                    timestamp: new Date(),
                    autoHide: true
                })

                return {
                    success: true,
                    syncedFields: [],
                    failedFields: [],
                    timestamp: new Date()
                }
            }

            // Attempt to fix missing or invalid data
            for (const missingField of status.pendingChanges) {
                try {
                    await this.fixMissingField(coupleId, missingField)
                    syncedFields.push(missingField)
                } catch (error) {
                    failedFields.push({
                        field: missingField,
                        error: error instanceof Error ? error.message : 'Unknown error'
                    })
                }
            }

            // Update sync status
            const updatedStatus = await this.checkSyncStatus(coupleId)

            const result: SyncResult = {
                success: failedFields.length === 0,
                syncedFields,
                failedFields,
                timestamp: new Date()
            }

            // Notify completion
            if (result.success) {
                this.notifyListeners({
                    type: 'success',
                    message: `Data synchronized successfully! ${syncedFields.length} fields updated.`,
                    timestamp: new Date(),
                    autoHide: true
                })
            } else {
                this.notifyListeners({
                    type: 'warning',
                    message: `Partial sync completed. ${failedFields.length} fields failed to sync.`,
                    details: failedFields.map(f => `${f.field}: ${f.error}`).join(', '),
                    timestamp: new Date()
                })
            }

            return result
        } catch (error) {
            const errorResult: SyncResult = {
                success: false,
                syncedFields,
                failedFields: [{
                    field: 'sync_operation',
                    error: error instanceof Error ? error.message : 'Unknown sync error'
                }],
                timestamp: new Date()
            }

            this.notifyListeners({
                type: 'error',
                message: 'Data synchronization failed',
                details: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date()
            })

            return errorResult
        }
    }

    /**
     * Subscribe to sync status updates
     */
    subscribeSyncUpdates(coupleId: string, callback: (status: SyncStatus) => void): () => void {
        if (!this.syncListeners.has(coupleId)) {
            this.syncListeners.set(coupleId, new Set())
        }

        this.syncListeners.get(coupleId)!.add(callback)

        // Return unsubscribe function
        return () => {
            const listeners = this.syncListeners.get(coupleId)
            if (listeners) {
                listeners.delete(callback)
                if (listeners.size === 0) {
                    this.syncListeners.delete(coupleId)
                }
            }
        }
    }

    /**
     * Subscribe to sync notifications
     */
    subscribeNotifications(callback: (notification: SyncNotification) => void): () => void {
        this.notificationListeners.add(callback)

        return () => {
            this.notificationListeners.delete(callback)
        }
    }

    /**
     * Start automatic sync monitoring for a couple
     */
    startMonitoring(coupleId: string, intervalMs: number = 30000): () => void {
        const interval = setInterval(async () => {
            try {
                await this.checkSyncStatus(coupleId)
            } catch (error) {
                console.error('Error in sync monitoring:', error)
            }
        }, intervalMs)

        return () => {
            clearInterval(interval)
        }
    }

    /**
     * Schedule retry for failed sync
     */
    private scheduleRetry(coupleId: string, delayMs: number = 60000) {
        // Clear existing timeout
        const existingTimeout = this.retryTimeouts.get(coupleId)
        if (existingTimeout) {
            clearTimeout(existingTimeout)
        }

        // Schedule new retry
        const timeout = setTimeout(async () => {
            try {
                await this.forceSyncData(coupleId)
            } catch (error) {
                console.error('Retry sync failed:', error)
                // Schedule another retry with exponential backoff
                this.scheduleRetry(coupleId, Math.min(delayMs * 2, 300000)) // Max 5 minutes
            }
        }, delayMs)

        this.retryTimeouts.set(coupleId, timeout)
    }

    /**
     * Attempt to fix a specific missing field
     */
    private async fixMissingField(coupleId: string, field: string): Promise<void> {
        const supabase = createClient()

        switch (field) {
            case 'couple.partner1_name':
            case 'couple.partner2_name':
                // These are required fields that should be set during registration
                throw new Error(`Required field ${field} is missing and cannot be auto-fixed`)

            case 'events.couple_intro':
                // Set a default couple introduction
                await supabase
                    .from('event_details')
                    .upsert({
                        couple_id: coupleId,
                        couple_intro: 'We are excited to share our special day with you. Join us as we begin our journey together as one.'
                    })
                break

            case 'photos':
                // Initialize empty photo collection
                await supabase
                    .from('photo_collections')
                    .upsert({
                        couple_id: coupleId,
                        categories: [],
                        highlight_photos: []
                    })
                break

            case 'gifts':
                // Initialize empty gift settings
                await supabase
                    .from('gift_settings')
                    .upsert({
                        couple_id: coupleId,
                        upi_id: null,
                        qr_code_url: null,
                        custom_message: null
                    })
                break

            default:
                console.warn(`Unknown field to fix: ${field}`)
        }
    }

    /**
     * Notify status listeners
     */
    private notifyStatusListeners(coupleId: string, status: SyncStatus) {
        const listeners = this.syncListeners.get(coupleId)
        if (listeners) {
            listeners.forEach(callback => {
                try {
                    callback(status)
                } catch (error) {
                    console.error('Error in sync status listener:', error)
                }
            })
        }
    }

    /**
     * Notify all notification listeners
     */
    private notifyListeners(notification: SyncNotification) {
        this.notificationListeners.forEach(callback => {
            try {
                callback(notification)
            } catch (error) {
                console.error('Error in notification listener:', error)
            }
        })
    }
}

// Export singleton instance
export const dataSyncMonitor = new DataSyncMonitor()