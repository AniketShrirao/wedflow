'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { dataSyncMonitor, SyncStatus, SyncNotification } from '@/lib/sync/data-sync-monitor'

interface SyncStatusIndicatorProps {
  coupleId: string
  showDetails?: boolean
  className?: string
}

export function SyncStatusIndicator({ 
  coupleId, 
  showDetails = false,
  className = '' 
}: SyncStatusIndicatorProps) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [notifications, setNotifications] = useState<SyncNotification[]>([])

  useEffect(() => {
    // Initial status check
    checkStatus()

    // Subscribe to status updates
    const unsubscribeStatus = dataSyncMonitor.subscribeSyncUpdates(coupleId, setSyncStatus)
    
    // Subscribe to notifications
    const unsubscribeNotifications = dataSyncMonitor.subscribeNotifications((notification) => {
      setNotifications(prev => [...prev.slice(-4), notification]) // Keep last 5 notifications
      
      // Auto-hide notifications
      if (notification.autoHide) {
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n !== notification))
        }, 5000)
      }
    })

    // Start monitoring
    const stopMonitoring = dataSyncMonitor.startMonitoring(coupleId)

    return () => {
      unsubscribeStatus()
      unsubscribeNotifications()
      stopMonitoring()
    }
  }, [coupleId])

  const checkStatus = async () => {
    setIsLoading(true)
    try {
      const status = await dataSyncMonitor.checkSyncStatus(coupleId)
      setSyncStatus(status)
    } catch (error) {
      console.error('Failed to check sync status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const forceSync = async () => {
    setIsLoading(true)
    try {
      await dataSyncMonitor.forceSyncData(coupleId)
      await checkStatus()
    } catch (error) {
      console.error('Failed to force sync:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = () => {
    if (isLoading) {
      return <RefreshCw className="h-4 w-4 animate-spin" />
    }

    if (!syncStatus) {
      return <WifiOff className="h-4 w-4 text-gray-400" />
    }

    if (syncStatus.isInSync) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }

    if (syncStatus.failedSyncs > 0) {
      return <AlertCircle className="h-4 w-4 text-red-500" />
    }

    return <Wifi className="h-4 w-4 text-yellow-500" />
  }

  const getStatusText = () => {
    if (isLoading) return 'Checking...'
    if (!syncStatus) return 'Unknown'
    if (syncStatus.isInSync) return 'Synced'
    if (syncStatus.failedSyncs > 0) return 'Sync Failed'
    return 'Pending'
  }

  const getStatusColor = () => {
    if (!syncStatus) return 'secondary'
    if (syncStatus.isInSync) return 'default' // green
    if (syncStatus.failedSyncs > 0) return 'destructive' // red
    return 'secondary' // yellow
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Status Badge */}
      <div className="flex items-center space-x-2">
        {getStatusIcon()}
        <Badge variant={getStatusColor()}>
          {getStatusText()}
        </Badge>
        
        {syncStatus && !syncStatus.isInSync && (
          <Button
            variant="outline"
            size="sm"
            onClick={forceSync}
            disabled={isLoading}
            className="h-6 px-2 text-xs"
          >
            {isLoading ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              'Sync Now'
            )}
          </Button>
        )}
      </div>

      {/* Detailed Status */}
      {showDetails && syncStatus && (
        <div className="text-sm space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>Last Check:</span>
            <span>{syncStatus.lastSyncTime.toLocaleTimeString()}</span>
          </div>
          
          {syncStatus.pendingChanges.length > 0 && (
            <div>
              <span className="text-gray-600">Pending Changes:</span>
              <ul className="list-disc list-inside text-xs text-gray-500 mt-1">
                {syncStatus.pendingChanges.map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>
          )}
          
          {syncStatus.failedSyncs > 0 && (
            <div className="text-red-600">
              <span>Failed Syncs: {syncStatus.failedSyncs}</span>
              {syncStatus.nextRetryTime && (
                <div className="text-xs">
                  Next retry: {syncStatus.nextRetryTime.toLocaleTimeString()}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Recent Notifications */}
      {notifications.length > 0 && (
        <div className="space-y-1">
          {notifications.slice(-3).map((notification, index) => (
            <div
              key={index}
              className={`text-xs p-2 rounded border ${
                notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' :
                notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' :
                notification.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                'bg-blue-50 border-blue-200 text-blue-700'
              }`}
            >
              <div className="font-medium">{notification.message}</div>
              {notification.details && (
                <div className="text-xs opacity-75 mt-1">{notification.details}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Compact version for use in headers/toolbars
export function CompactSyncIndicator({ coupleId, className = '' }: { coupleId: string; className?: string }) {
  return (
    <SyncStatusIndicator 
      coupleId={coupleId}
      showDetails={false}
      className={className}
    />
  )
}