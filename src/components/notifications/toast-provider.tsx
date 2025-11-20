'use client'

import { Toaster } from 'sonner'

interface ToastProviderProps {
  children: React.ReactNode
}

/**
 * Toast notification provider using Sonner
 * Wrap your app with this component to enable toast notifications
 */
export function ToastProvider({ children }: ToastProviderProps) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        expand={false}
        richColors
        closeButton
        duration={5000}
        toastOptions={{
          classNames: {
            toast: 'rounded-xl shadow-lg border',
            title: 'font-medium',
            description: 'text-sm opacity-90',
            actionButton: 'bg-pink-500 text-white hover:bg-pink-600',
            cancelButton: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
            closeButton: 'bg-white border border-gray-200 hover:bg-gray-50',
            error: 'bg-red-50 border-red-200 text-red-900',
            success: 'bg-green-50 border-green-200 text-green-900',
            warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
            info: 'bg-blue-50 border-blue-200 text-blue-900',
          },
        }}
      />
    </>
  )
}
