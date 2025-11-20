'use client'

import { useState, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SyncNotification } from '@/lib/sync/data-sync-monitor'
import { useSyncNotifications } from '@/hooks/use-data-sync'

interface NotificationItemProps {
  notification: SyncNotification
  onDismiss: () => void
}

function NotificationItem({ notification, onDismiss }: NotificationItemProps) {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  const getTextColor = () => {
    switch (notification.type) {
      case 'success':
        return 'text-green-800'
      case 'error':
        return 'text-red-800'
      case 'warning':
        return 'text-yellow-800'
      case 'info':
      default:
        return 'text-blue-800'
    }
  }

  return (
    <div className={`border rounded-lg p-4 shadow-sm ${getBackgroundColor()}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${getTextColor()}`}>
            {notification.message}
          </p>
          
          {notification.details && (
            <p className={`text-xs mt-1 ${getTextColor()} opacity-75`}>
              {notification.details}
            </p>
          )}
          
          <p className="text-xs text-gray-500 mt-2">
            {notification.timestamp.toLocaleTimeString()}
          </p>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="flex-shrink-0 h-6 w-6 p-0 hover:bg-white/50"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

interface SyncNotificationsProps {
  maxNotifications?: number
  className?: string
}

export function SyncNotifications({ 
  maxNotifications = 5,
  className = '' 
}: SyncNotificationsProps) {
  const { notifications, clearNotifications, dismissNotification } = useSyncNotifications()

  // Show only the most recent notifications
  const visibleNotifications = notifications.slice(-maxNotifications)

  if (visibleNotifications.length === 0) {
    return null
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">
          Sync Notifications ({visibleNotifications.length})
        </h3>
        
        {visibleNotifications.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearNotifications}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Clear All
          </Button>
        )}
      </div>
      
      <div className="space-y-2">
        {visibleNotifications.map((notification, index) => (
          <NotificationItem
            key={`${notification.timestamp.getTime()}-${index}`}
            notification={notification}
            onDismiss={() => dismissNotification(notifications.length - maxNotifications + index)}
          />
        ))}
      </div>
    </div>
  )
}

// Toast-style notifications that appear at the top of the screen
export function SyncToastNotifications() {
  const { notifications, dismissNotification } = useSyncNotifications()
  const [visibleToasts, setVisibleToasts] = useState<SyncNotification[]>([])

  useEffect(() => {
    // Show only recent notifications as toasts
    const recentNotifications = notifications.slice(-3)
    setVisibleToasts(recentNotifications)

    // Auto-hide toasts after 5 seconds
    const timeouts = recentNotifications.map((notification, index) => {
      if (notification.autoHide) {
        return setTimeout(() => {
          dismissNotification(notifications.length - 3 + index)
        }, 5000)
      }
      return null
    })

    return () => {
      timeouts.forEach(timeout => {
        if (timeout) clearTimeout(timeout)
      })
    }
  }, [notifications, dismissNotification])

  if (visibleToasts.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {visibleToasts.map((notification, index) => (
        <div
          key={`${notification.timestamp.getTime()}-${index}`}
          className="transform transition-all duration-300 ease-in-out"
        >
          <NotificationItem
            notification={notification}
            onDismiss={() => dismissNotification(notifications.length - visibleToasts.length + index)}
          />
        </div>
      ))}
    </div>
  )
}

// Compact notification badge for headers
export function SyncNotificationBadge({ className = '' }: { className?: string }) {
  const { notifications } = useSyncNotifications()
  
  const unreadCount = notifications.filter(n => !n.autoHide).length
  
  if (unreadCount === 0) {
    return null
  }

  return (
    <div className={`relative ${className}`}>
      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
        {unreadCount > 9 ? '9+' : unreadCount}
      </div>
    </div>
  )
}