'use client'

import { AlertCircle, X } from 'lucide-react'
import { ValidationError, ValidationWarning } from '@/lib/validation/schemas'

interface ValidationErrorDisplayProps {
  errors: ValidationError[]
  warnings?: ValidationWarning[]
  onDismiss?: () => void
  className?: string
}

export function ValidationErrorDisplay({ 
  errors, 
  warnings = [], 
  onDismiss,
  className = '' 
}: ValidationErrorDisplayProps) {
  if (errors.length === 0 && warnings.length === 0) {
    return null
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800 mb-2">
                  {errors.length === 1 ? 'Validation Error' : `${errors.length} Validation Errors`}
                </h3>
                <ul className="space-y-1">
                  {errors.map((error, index) => (
                    <li key={index} className="text-sm text-red-700">
                      <span className="font-medium">{error.field}:</span> {error.message}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-red-400 hover:text-red-600 transition-colors"
                aria-label="Dismiss errors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-yellow-800 mb-2">
                  {warnings.length === 1 ? 'Suggestion' : `${warnings.length} Suggestions`}
                </h3>
                <ul className="space-y-2">
                  {warnings.map((warning, index) => (
                    <li key={index} className="text-sm text-yellow-700">
                      <div>
                        <span className="font-medium">{warning.field}:</span> {warning.message}
                      </div>
                      {warning.suggestion && (
                        <div className="text-yellow-600 mt-1 italic">
                          💡 {warning.suggestion}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-yellow-400 hover:text-yellow-600 transition-colors"
                aria-label="Dismiss warnings"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface FieldValidationErrorProps {
  error?: ValidationError
  className?: string
}

export function FieldValidationError({ error, className = '' }: FieldValidationErrorProps) {
  if (!error) {
    return null
  }

  return (
    <div className={`flex items-center space-x-2 text-red-600 text-sm mt-1 ${className}`}>
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span>{error.message}</span>
    </div>
  )
}

interface ValidationSummaryProps {
  errors: ValidationError[]
  warnings: ValidationWarning[]
  className?: string
}

export function ValidationSummary({ errors, warnings, className = '' }: ValidationSummaryProps) {
  const totalIssues = errors.length + warnings.length

  if (totalIssues === 0) {
    return (
      <div className={`flex items-center space-x-2 text-green-600 text-sm ${className}`}>
        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
        <span>All data is valid</span>
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {errors.length > 0 && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <div className="h-2 w-2 bg-red-500 rounded-full"></div>
          <span>{errors.length} error{errors.length !== 1 ? 's' : ''} found</span>
        </div>
      )}
      {warnings.length > 0 && (
        <div className="flex items-center space-x-2 text-yellow-600 text-sm">
          <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
          <span>{warnings.length} suggestion{warnings.length !== 1 ? 's' : ''} available</span>
        </div>
      )}
    </div>
  )
}