'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { errorTracker } from '@/lib/monitoring/error-tracking'

interface Props {
  children: ReactNode
  sectionName: string
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  compact?: boolean
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Lightweight error boundary for individual sections
 * Use this for smaller components that shouldn't crash the entire page
 */
export class SectionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error with section context
    const context = {
      section: this.props.sectionName,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    }

    console.error(`Error in ${this.props.sectionName}:`, error, errorInfo)
    
    // Report to monitoring
    errorTracker.captureError(error, context)
    
    // Call optional error handler
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Compact error display
      if (this.props.compact) {
        return (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <span className="text-sm text-red-700">
                  Error loading {this.props.sectionName}
                </span>
              </div>
              <Button
                onClick={this.handleRetry}
                variant="ghost"
                size="sm"
                className="text-red-700 hover:text-red-800 hover:bg-red-100"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Retry
              </Button>
            </div>
          </div>
        )
      }

      // Default section error display
      return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 my-4">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-medium text-red-800 mb-2">
                Error in {this.props.sectionName}
              </h3>
              
              <p className="text-sm text-red-700 mb-4">
                We encountered an error while loading this section. 
                Your other data is safe and unaffected.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <p className="text-xs text-red-600 mb-4 font-mono bg-red-100 p-2 rounded">
                  {this.state.error.message}
                </p>
              )}
              
              <Button
                onClick={this.handleRetry}
                size="sm"
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
