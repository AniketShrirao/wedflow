'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface ValidationState {
  status: 'idle' | 'validating' | 'valid' | 'invalid'
  message?: string
}

interface ValidatedInputProps {
  label: string
  error?: string
  touched?: boolean
  validate?: (value: string) => Promise<string | undefined> | string | undefined
  helpText?: string
  required?: boolean
  onValidationChange?: (isValid: boolean) => void
  className?: string
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
}

export function ValidatedInput({
  label,
  error,
  touched,
  validate,
  helpText,
  required,
  onValidationChange,
  className = '',
  inputProps = {}
}: ValidatedInputProps) {
  const [validationState, setValidationState] = useState<ValidationState>({
    status: 'idle'
  })
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)

  const handleValidation = async (value: string) => {
    if (!validate) return

    setValidationState({ status: 'validating' })

    try {
      const result = await validate(value)
      
      if (result) {
        setValidationState({ status: 'invalid', message: result })
        onValidationChange?.(false)
      } else {
        setValidationState({ status: 'valid' })
        onValidationChange?.(true)
      }
    } catch (err) {
      setValidationState({ 
        status: 'invalid', 
        message: 'Validation failed' 
      })
      onValidationChange?.(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    inputProps?.onChange?.(e)

    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    // Debounce validation
    const timer = setTimeout(() => {
      handleValidation(e.target.value)
    }, 500)

    setDebounceTimer(timer)
  }

  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
    }
  }, [debounceTimer])

  const getValidationIcon = () => {
    switch (validationState.status) {
      case 'validating':
        return <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'invalid':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const showError = touched && (error || validationState.message)
  const errorMessage = error || validationState.message

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <input
          {...inputProps}
          onChange={handleChange}
          className={[
            'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors',
            showError 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
              : validationState.status === 'valid'
              ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
              : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500',
            validationState.status === 'validating' ? 'pr-10' : ''
          ].filter(Boolean).join(' ')}
          aria-invalid={showError ? 'true' : 'false'}
          aria-describedby={
            showError 
              ? `${inputProps?.id}-error` 
              : helpText 
              ? `${inputProps?.id}-help` 
              : undefined
          }
        />
        
        {validationState.status !== 'idle' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {getValidationIcon()}
          </div>
        )}
      </div>
      
      {showError && (
        <div 
          id={`${inputProps?.id}-error`}
          className="flex items-start space-x-2 text-sm text-red-600"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}
      
      {!showError && helpText && (
        <p 
          id={`${inputProps?.id}-help`}
          className="text-sm text-gray-500"
        >
          {helpText}
        </p>
      )}
    </div>
  )
}

interface ValidatedTextareaProps {
  label: string
  error?: string
  touched?: boolean
  maxLength?: number
  showCharCount?: boolean
  helpText?: string
  required?: boolean
  className?: string
  textareaProps?: React.TextareaHTMLAttributes<HTMLTextAreaElement>
}

export function ValidatedTextarea({
  label,
  error,
  touched,
  maxLength,
  showCharCount = true,
  helpText,
  required,
  className = '',
  textareaProps = {}
}: ValidatedTextareaProps) {
  const [charCount, setCharCount] = useState(0)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCharCount(e.target.value.length)
    textareaProps?.onChange?.(e)
  }

  const showError = touched && error
  const isNearLimit = maxLength && charCount > maxLength * 0.9

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {showCharCount && maxLength && (
          <span 
            className={`text-xs ${
              isNearLimit 
                ? charCount > maxLength 
                  ? 'text-red-600 font-medium' 
                  : 'text-yellow-600'
                : 'text-gray-500'
            }`}
          >
            {charCount} / {maxLength}
          </span>
        )}
      </div>
      
      <textarea
        {...textareaProps}
        maxLength={maxLength}
        onChange={handleChange}
        className={[
          'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none',
          showError 
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'
        ].filter(Boolean).join(' ')}
        aria-invalid={showError ? 'true' : 'false'}
        aria-describedby={
          showError 
            ? `${textareaProps?.id}-error` 
            : helpText 
            ? `${textareaProps?.id}-help` 
            : undefined
        }
      />
      
      {showError && (
        <div 
          id={`${textareaProps?.id}-error`}
          className="flex items-start space-x-2 text-sm text-red-600"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      
      {!showError && helpText && (
        <p 
          id={`${textareaProps?.id}-help`}
          className="text-sm text-gray-500"
        >
          {helpText}
        </p>
      )}
    </div>
  )
}

interface ValidatedSelectProps {
  label: string
  error?: string
  touched?: boolean
  options: Array<{ value: string; label: string }>
  placeholder?: string
  helpText?: string
  required?: boolean
  className?: string
  selectProps?: React.SelectHTMLAttributes<HTMLSelectElement>
}

export function ValidatedSelect({
  label,
  error,
  touched,
  options,
  placeholder = 'Select an option',
  helpText,
  required,
  className = '',
  selectProps = {}
}: ValidatedSelectProps) {
  const showError = touched && error

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <select
        {...selectProps}
        className={[
          'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors',
          showError 
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'
        ].filter(Boolean).join(' ')}
        aria-invalid={showError ? 'true' : 'false'}
        aria-describedby={
          showError 
            ? `${selectProps?.id}-error` 
            : helpText 
            ? `${selectProps?.id}-help` 
            : undefined
        }
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {showError && (
        <div 
          id={`${selectProps?.id}-error`}
          className="flex items-start space-x-2 text-sm text-red-600"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      
      {!showError && helpText && (
        <p 
          id={`${selectProps?.id}-help`}
          className="text-sm text-gray-500"
        >
          {helpText}
        </p>
      )}
    </div>
  )
}
