'use client'

import { useState, useEffect, useCallback } from 'react'
import { dataSyncMonitor, SyncStatus, SyncResult, SyncNotification } from '@/lib/sync/data-sync-monitor'

interface UseDataSyncOptions {
    coupleId: string
    autoSync?: boolean
    syncInterval?: number
}

interface UseDataSyncReturn {
    syncStatus: SyncStatus | null
    isLoading: boolean
    notifications: SyncNotification[]
    checkSync: () => Promise<void>
    forceSync: () => Promise<SyncResult | null>
    clearNotifications: () => void
    isInSync: boolean
    hasPendingChanges: boolean
    lastSyncTime: Date | null
}

export function useDataSync({
    coupleId,
    autoSync = true,
    syncInterval = 30000
}: UseDataSyncOptions): UseDataSyncReturn {
    const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [notifications, setNotifications] = useState<SyncNotification[]>([])

    // Check sync status
    const checkSync = useCallback(async () => {
        if (!coupleId) return

        setIsLoading(true)
        try {
            const status = await dataSyncMonitor.checkSyncStatus(coupleId)
            setSyncStatus(status)
        } catch (error) {
            console.error('Failed to check sync status:', error)
        } finally {
            setIsLoading(false)
        }
    }, [coupleId])

    // Force sync
    const forceSync = useCallback(async (): Promise<SyncResult | null> => {
        if (!coupleId) return null

        setIsLoading(true)
        try {
            const result = await dataSyncMonitor.forceSyncData(coupleId)
            // Refresh status after sync
            await checkSync()
            return result
        } catch (error) {
            console.error('Failed to force sync:', error)
            return null
        } finally {
            setIsLoading(false)
        }
    }, [coupleId, checkSync])

    // Clear notifications
    const clearNotifications = useCallback(() => {
        setNotifications([])
    }, [])

    // Setup subscriptions and monitoring
    useEffect(() => {
        if (!coupleId) return

        // Initial sync check
        checkSync()

        // Subscribe to sync status updates
        const unsubscribeStatus = dataSyncMonitor.subscribeSyncUpdates(coupleId, setSyncStatus)

        // Subscribe to notifications
        const unsubscribeNotifications = dataSyncMonitor.subscribeNotifications((notification) => {
            setNotifications(prev => {
                const newNotifications = [...prev, notification]
                // Keep only last 10 notifications
                return newNotifications.slice(-10)
            })

            // Auto-remove notifications after delay
            if (notification.autoHide) {
                setTimeout(() => {
                    setNotifications(prev => prev.filter(n => n !== notification))
                }, 5000)
            }
        })

        // Start automatic monitoring if enabled
        let stopMonitoring: (() => void) | undefined
        if (autoSync) {
            stopMonitoring = dataSyncMonitor.startMonitoring(coupleId, syncInterval)
        }

        return () => {
            unsubscribeStatus()
            unsubscribeNotifications()
            stopMonitoring?.()
        }
    }, [coupleId, autoSync, syncInterval, checkSync])

    return {
        syncStatus,
        isLoading,
        notifications,
        checkSync,
        forceSync,
        clearNotifications,
        isInSync: syncStatus?.isInSync ?? false,
        hasPendingChanges: (syncStatus?.pendingChanges.length ?? 0) > 0,
        lastSyncTime: syncStatus?.lastSyncTime ?? null
    }
}

// Hook for simple sync status checking
export function useSyncStatus(coupleId: string) {
    const { syncStatus, isLoading, checkSync } = useDataSync({
        coupleId,
        autoSync: false
    })

    return {
        isInSync: syncStatus?.isInSync ?? false,
        isLoading,
        checkSync,
        lastSyncTime: syncStatus?.lastSyncTime ?? null,
        pendingChanges: syncStatus?.pendingChanges ?? []
    }
}

// Hook for notifications only
export function useSyncNotifications() {
    const [notifications, setNotifications] = useState<SyncNotification[]>([])

    useEffect(() => {
        const unsubscribe = dataSyncMonitor.subscribeNotifications((notification) => {
            setNotifications(prev => [...prev.slice(-9), notification]) // Keep last 10
        })

        return unsubscribe
    }, [])

    const clearNotifications = useCallback(() => {
        setNotifications([])
    }, [])

    const dismissNotification = useCallback((index: number) => {
        setNotifications(prev => prev.filter((_, i) => i !== index))
    }, [])

    return {
        notifications,
        clearNotifications,
        dismissNotification
    }
}