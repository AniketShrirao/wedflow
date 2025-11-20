'use client'

import { useState, useEffect } from 'react'
import { Loader2, Upload, CheckCircle, AlertCircle } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface ProgressIndicatorProps {
  progress: number
  status: 'idle' | 'loading' | 'success' | 'error'
  message?: string
  className?: string
}

export function ProgressIndicator({ 
  progress, 
  status, 
  message,
  className = '' 
}: ProgressIndicatorProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-5 w-5 animate-spin text-pink-500" />
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'bg-pink-500'
      case 'success':
        return 'bg-green-500'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-gray-300'
    }
  }

  if (status === 'idle') {
    return null
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="text-sm font-medium text-gray-700">
            {message || 'Processing...'}
          </span>
        </div>
        <span className="text-sm text-gray-500">
          {Math.round(progress)}%
        </span>
      </div>
      
      <Progress 
        value={progress} 
        className="h-2"
        indicatorClassName={getStatusColor()}
      />
    </div>
  )
}

interface UploadProgressProps {
  fileName: string
  progress: number
  status: 'uploading' | 'processing' | 'complete' | 'error'
  error?: string
  onCancel?: () => void
  onRetry?: () => void
  className?: string
}

export function UploadProgress({ 
  fileName, 
  progress, 
  status,
  error,
  onCancel,
  onRetry,
  className = '' 
}: UploadProgressProps) {
  const getStatusMessage = () => {
    switch (status) {
      case 'uploading':
        return 'Uploading...'
      case 'processing':
        return 'Processing...'
      case 'complete':
        return 'Upload complete'
      case 'error':
        return error || 'Upload failed'
      default:
        return ''
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <Upload className="h-5 w-5 text-pink-500 animate-pulse" />
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
    }
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {getStatusIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-900 truncate">
              {fileName}
            </p>
            {status !== 'complete' && status !== 'error' && (
              <span className="text-xs text-gray-500 ml-2">
                {Math.round(progress)}%
              </span>
            )}
          </div>
          
          <p className="text-xs text-gray-600 mb-2">
            {getStatusMessage()}
          </p>
          
          {(status === 'uploading' || status === 'processing') && (
            <Progress 
              value={progress} 
              className="h-1.5 mb-2"
              indicatorClassName="bg-pink-500"
            />
          )}
          
          {status === 'error' && onRetry && (
            <button
              onClick={onRetry}
              className="text-xs text-pink-600 hover:text-pink-700 font-medium"
            >
              Try again
            </button>
          )}
          
          {(status === 'uploading' || status === 'processing') && onCancel && (
            <button
              onClick={onCancel}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

interface MultiUploadProgressProps {
  uploads: Array<{
    id: string
    fileName: string
    progress: number
    status: 'uploading' | 'processing' | 'complete' | 'error'
    error?: string
  }>
  onCancel?: (id: string) => void
  onRetry?: (id: string) => void
  className?: string
}

export function MultiUploadProgress({ 
  uploads, 
  onCancel, 
  onRetry,
  className = '' 
}: MultiUploadProgressProps) {
  const totalProgress = uploads.reduce((sum, upload) => sum + upload.progress, 0) / uploads.length
  const completedCount = uploads.filter(u => u.status === 'complete').length
  const errorCount = uploads.filter(u => u.status === 'error').length

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Overall progress */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              Uploading {uploads.length} file{uploads.length !== 1 ? 's' : ''}
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              {completedCount} completed
              {errorCount > 0 && `, ${errorCount} failed`}
            </p>
          </div>
          <span className="text-sm font-medium text-gray-700">
            {Math.round(totalProgress)}%
          </span>
        </div>
        
        <Progress 
          value={totalProgress} 
          className="h-2"
          indicatorClassName="bg-pink-500"
        />
      </div>
      
      {/* Individual uploads */}
      <div className="space-y-2">
        {uploads.map((upload) => (
          <UploadProgress
            key={upload.id}
            fileName={upload.fileName}
            progress={upload.progress}
            status={upload.status}
            error={upload.error}
            onCancel={onCancel ? () => onCancel(upload.id) : undefined}
            onRetry={onRetry ? () => onRetry(upload.id) : undefined}
          />
        ))}
      </div>
    </div>
  )
}

interface SyncProgressProps {
  message: string
  details?: string
  className?: string
}

export function SyncProgress({ message, details, className = '' }: SyncProgressProps) {
  const [dots, setDots] = useState('.')

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '.' : prev + '.')
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <Loader2 className="h-5 w-5 animate-spin text-pink-500 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">
          {message}{dots}
        </p>
        {details && (
          <p className="text-xs text-gray-600 mt-0.5">
            {details}
          </p>
        )}
      </div>
    </div>
  )
}
