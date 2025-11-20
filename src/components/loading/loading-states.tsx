'use client'

import { Loader2, Camera, Calendar, Gift, Heart } from 'lucide-react'

// Generic loading spinner
export function LoadingSpinner({ size = 'md', className = '' }: { 
  size?: 'sm' | 'md' | 'lg'
  className?: string 
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  }

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  )
}

// Section loading skeleton
export function SectionLoadingSkeleton({ 
  title, 
  icon: Icon, 
  rows = 3,
  className = '' 
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  rows?: number
  className?: string
}) {
  return (
    <section className={`py-20 bg-gradient-to-b from-white to-gray-50 ${className}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header skeleton */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full mb-6 animate-pulse">
            <Icon className="h-8 w-8 text-gray-400" />
          </div>
          <div className="h-8 bg-gray-200 animate-pulse rounded max-w-md mx-auto mb-6" />
          <div className="w-24 h-0.5 bg-gray-200 animate-pulse mx-auto mb-6" />
          <div className="h-6 bg-gray-200 animate-pulse rounded max-w-2xl mx-auto" />
        </div>

        {/* Content skeleton */}
        <div className="space-y-6">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-8 shadow-lg animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-4 max-w-xs" />
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded max-w-3/4" />
                <div className="h-4 bg-gray-200 rounded max-w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Events section loading
export function EventsLoadingSkeleton() {
  return (
    <SectionLoadingSkeleton 
      title="Wedding Events"
      icon={Calendar}
      rows={3}
    />
  )
}

// Photo gallery loading
export function PhotoGalleryLoadingSkeleton() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header skeleton */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full mb-6 animate-pulse">
            <Camera className="h-8 w-8 text-gray-400" />
          </div>
          <div className="h-8 bg-gray-200 animate-pulse rounded max-w-md mx-auto mb-6" />
          <div className="w-24 h-0.5 bg-gray-200 animate-pulse mx-auto mb-6" />
          <div className="h-6 bg-gray-200 animate-pulse rounded max-w-2xl mx-auto" />
        </div>

        {/* Photo grid skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    </section>
  )
}

// Gift portal loading
export function GiftPortalLoadingSkeleton() {
  return (
    <section className="py-20 bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header skeleton */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-200 rounded-full mb-8 animate-pulse">
            <Gift className="h-10 w-10 text-gray-400" />
          </div>
          <div className="h-8 bg-gray-200 animate-pulse rounded max-w-md mx-auto mb-6" />
          <div className="w-24 h-0.5 bg-gray-200 animate-pulse mx-auto mb-8" />
          <div className="h-6 bg-gray-200 animate-pulse rounded max-w-3xl mx-auto" />
        </div>

        {/* Gift portal skeleton */}
        <div className="bg-white/80 rounded-3xl shadow-2xl p-10 max-w-lg mx-auto">
          <div className="text-center mb-8">
            <div className="w-56 h-56 bg-gray-200 animate-pulse rounded-xl mx-auto mb-4" />
            <div className="h-4 bg-gray-200 animate-pulse rounded max-w-xs mx-auto" />
          </div>
          
          <div className="mb-8">
            <div className="h-6 bg-gray-200 animate-pulse rounded max-w-xs mx-auto mb-4" />
            <div className="flex items-center space-x-3">
              <div className="flex-1 h-12 bg-gray-200 animate-pulse rounded-xl" />
              <div className="w-12 h-12 bg-gray-200 animate-pulse rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Data loading indicator with message
export function DataLoadingIndicator({ 
  message = 'Loading wedding details...',
  className = ''
}: {
  message?: string
  className?: string
}) {
  return (
    <div className={`flex items-center justify-center space-x-3 p-8 ${className}`}>
      <LoadingSpinner size="lg" className="text-pink-500" />
      <span className="text-gray-600 font-medium">{message}</span>
    </div>
  )
}

// Empty state component
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = ''
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-xl font-medium text-gray-800 mb-3">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      {action}
    </div>
  )
}

// Dashboard section skeletons
export function DashboardCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 bg-gray-200 rounded w-32" />
        <div className="h-8 w-8 bg-gray-200 rounded-full" />
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </div>
    </div>
  )
}

export function FormSkeleton({ fields = 3 }: { fields?: number }) {
  return (
    <div className="space-y-6 animate-pulse">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
          <div className="h-10 bg-gray-200 rounded" />
        </div>
      ))}
      <div className="flex space-x-3">
        <div className="h-10 bg-gray-200 rounded w-24" />
        <div className="h-10 bg-gray-200 rounded w-24" />
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {/* Header */}
      <div className="flex space-x-4 pb-3 border-b">
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-4 bg-gray-200 rounded w-1/4" />
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4 py-3">
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
        </div>
      ))}
    </div>
  )
}

// Fallback components for missing data
export function EventsFallback() {
  return (
    <EmptyState
      icon={Calendar}
      title="Events Coming Soon"
      description="Wedding event details will be available soon. Check back later for the complete schedule!"
    />
  )
}

export function PhotosFallback() {
  return (
    <EmptyState
      icon={Camera}
      title="Photos Coming Soon"
      description="Wedding photos will be shared here after the celebration. Stay tuned for beautiful memories!"
    />
  )
}

export function GiftsFallback() {
  return (
    <EmptyState
      icon={Heart}
      title="Gift Information Unavailable"
      description="Gift details are being updated. Please contact the couple directly for gift information."
    />
  )
}