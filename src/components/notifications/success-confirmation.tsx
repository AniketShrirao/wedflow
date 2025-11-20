'use client'

import { CheckCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SuccessConfirmationProps {
  title: string
  message?: string
  action?: {
    label: string
    onClick: () => void
  }
  onDismiss?: () => void
  className?: string
}

export function SuccessConfirmation({ 
  title, 
  message, 
  action,
  onDismiss,
  className = '' 
}: SuccessConfirmationProps) {
  return (
    <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-green-800">
            {title}
          </h3>
          
          {message && (
            <p className="text-sm text-green-700 mt-1">
              {message}
            </p>
          )}
          
          {action && (
            <Button
              onClick={action.onClick}
              variant="ghost"
              size="sm"
              className="mt-3 text-green-700 hover:text-green-800 hover:bg-green-100 h-8 px-3"
            >
              {action.label}
            </Button>
          )}
        </div>
        
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-green-400 hover:text-green-600 transition-colors flex-shrink-0"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

interface InlineSuccessProps {
  message: string
  className?: string
}

export function InlineSuccess({ message, className = '' }: InlineSuccessProps) {
  return (
    <div className={`flex items-center space-x-2 text-green-600 text-sm ${className}`}>
      <CheckCircle className="h-4 w-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  )
}

interface SuccessBannerProps {
  title: string
  message: string
  actions?: Array<{
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary'
  }>
  onDismiss?: () => void
  className?: string
}

export function SuccessBanner({ 
  title, 
  message, 
  actions,
  onDismiss,
  className = '' 
}: SuccessBannerProps) {
  return (
    <div className={`bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 shadow-sm ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              {title}
            </h3>
            
            <p className="text-sm text-green-700 mb-4">
              {message}
            </p>
            
            {actions && actions.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    onClick={action.onClick}
                    variant={action.variant === 'primary' ? 'default' : 'outline'}
                    size="sm"
                    className={
                      action.variant === 'primary'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'border-green-300 text-green-700 hover:bg-green-100'
                    }
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-green-400 hover:text-green-600 transition-colors ml-4 flex-shrink-0"
            aria-label="Dismiss"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  )
}
