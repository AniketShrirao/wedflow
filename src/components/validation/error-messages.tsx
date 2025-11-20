'use client'

import { AlertCircle, AlertTriangle, Info, HelpCircle } from 'lucide-react'

interface ErrorMessageProps {
  message: string
  type?: 'error' | 'warning' | 'info'
  className?: string
}

export function ErrorMessage({ message, type = 'error', className = '' }: ErrorMessageProps) {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getTextColor = () => {
    switch (type) {
      case 'error':
        return 'text-red-600'
      case 'warning':
        return 'text-yellow-600'
      case 'info':
        return 'text-blue-600'
    }
  }

  return (
    <div className={`flex items-start space-x-2 text-sm ${getTextColor()} ${className}`}>
      <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
      <span>{message}</span>
    </div>
  )
}

interface FieldErrorProps {
  error?: string
  touched?: boolean
  className?: string
}

export function FieldError({ error, touched, className = '' }: FieldErrorProps) {
  if (!error || !touched) {
    return null
  }

  return <ErrorMessage message={error} type="error" className={className} />
}

interface ActionableErrorProps {
  title: string
  message: string
  actions: Array<{
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary'
  }>
  className?: string
}

export function ActionableError({ 
  title, 
  message, 
  actions,
  className = '' 
}: ActionableErrorProps) {
  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="h-5 w-5 text-red-600" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-red-900 mb-2">
            {title}
          </h3>
          
          <p className="text-sm text-red-700 mb-4">
            {message}
          </p>
          
          <div className="flex flex-wrap gap-3">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className={
                  action.variant === 'primary'
                    ? 'px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors'
                    : 'px-4 py-2 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 text-sm font-medium transition-colors'
                }
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

interface ContextualHelpProps {
  title: string
  description: string
  examples?: string[]
  className?: string
}

export function ContextualHelp({ 
  title, 
  description, 
  examples,
  className = '' 
}: ContextualHelpProps) {
  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <HelpCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-blue-900 mb-1">
            {title}
          </h4>
          
          <p className="text-sm text-blue-700 mb-2">
            {description}
          </p>
          
          {examples && examples.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-blue-800 mb-2">Examples:</p>
              <ul className="space-y-1">
                {examples.map((example, index) => (
                  <li key={index} className="text-xs text-blue-700 font-mono bg-blue-100 px-2 py-1 rounded">
                    {example}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface FormErrorSummaryProps {
  errors: Record<string, string>
  title?: string
  className?: string
}

export function FormErrorSummary({ 
  errors, 
  title = 'Please fix the following errors:',
  className = '' 
}: FormErrorSummaryProps) {
  const errorEntries = Object.entries(errors)

  if (errorEntries.length === 0) {
    return null
  }

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-red-800 mb-3">
            {title}
          </h3>
          
          <ul className="space-y-2">
            {errorEntries.map(([field, message]) => (
              <li key={field} className="text-sm text-red-700">
                <span className="font-medium capitalize">
                  {field.replace(/_/g, ' ')}:
                </span>{' '}
                {message}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
