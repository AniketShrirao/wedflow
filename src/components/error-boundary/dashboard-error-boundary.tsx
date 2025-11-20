'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { errorTracker } from '@/lib/monitoring/error-tracking'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  section?: string
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class DashboardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })
    
    // Log error with context
    const context = {
      section: this.props.section || 'dashboard',
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    }

    console.error('DashboardErrorBoundary caught an error:', error, errorInfo, context)
    
    // Report to monitoring service
    errorTracker.captureError(error, context)
    
    // Call optional error handler
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  handleReportIssue = () => {
    const errorDetails = {
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      section: this.props.section,
      timestamp: new Date().toISOString()
    }

    // In a real app, this would open a support ticket or feedback form
    console.log('Report issue:', errorDetails)
    alert('Error details have been logged. Please contact support if the issue persists.')
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI for dashboard
      return (
        <div className="min-h-[400px] bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              Something went wrong
            </h2>
            
            <p className="text-gray-600 mb-2 leading-relaxed">
              We encountered an error in the {this.props.section || 'dashboard'} section.
            </p>
            
            <p className="text-sm text-gray-500 mb-6">
              Don't worry, your data is safe. Try refreshing this section or the entire page.
            </p>
            
            <div className="space-y-3">
              <Button 
                onClick={this.handleRetry}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Page
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={this.handleReportIssue}
                  className="w-full"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Report Issue
                </Button>
              </div>
              
              <Button 
                variant="ghost"
                onClick={() => window.location.href = '/dashboard'}
                className="w-full text-gray-600"
              >
                <Home className="h-4 w-4 mr-2" />
                Go to Dashboard Home
              </Button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 font-medium">
                  Error Details (Development Only)
                </summary>
                <div className="mt-3 space-y-2">
                  <div className="bg-red-50 p-3 rounded text-xs">
                    <div className="font-semibold text-red-800 mb-1">Error Message:</div>
                    <div className="text-red-700">{this.state.error.message}</div>
                  </div>
                  {this.state.error.stack && (
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="font-semibold text-gray-800 text-xs mb-1">Stack Trace:</div>
                      <pre className="text-xs text-gray-700 overflow-auto max-h-32 whitespace-pre-wrap">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="font-semibold text-gray-800 text-xs mb-1">Component Stack:</div>
                      <pre className="text-xs text-gray-700 overflow-auto max-h-32 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
