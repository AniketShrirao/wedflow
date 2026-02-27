'use client'

import { useState, useEffect } from 'react'
import { Camera, X, ChevronLeft, ChevronRight, ZoomIn, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import type { Image as ImageType, ImageCategory } from '@/lib/services/photo-service'

interface PhotoGallerySectionProps {
  coupleSlug: string
}

const CATEGORY_COLORS: Record<ImageCategory, string> = {
  'Haldi': 'from-yellow-200 to-orange-200',
  'Sangeet': 'from-pink-200 to-rose-200',
  'Wedding': 'from-blue-200 to-cyan-200',
  'Reception': 'from-green-200 to-emerald-200'
}

export function PhotoGallerySection({ coupleSlug }: PhotoGallerySectionProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<ImageType & { index: number } | null>(null)
  const [photos, setPhotos] = useState<ImageType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch(`/api/public/${coupleSlug}/photos`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch photos')
        }

        const data = await response.json()
        console.log('Photo gallery data:', data)
        
        // Flatten the organized photos into a single array
        const allPhotos: ImageType[] = []
        if (data.categories && Array.isArray(data.categories)) {
          data.categories.forEach((category: any) => {
            if (category.photos && Array.isArray(category.photos)) {
              allPhotos.push(...category.photos)
            }
          })
        }
        setPhotos(allPhotos)
      } catch (err) {
        console.error('Error fetching photos:', err)
        setError(err instanceof Error ? err.message : 'Failed to load photos')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPhotos()
  }, [coupleSlug])

  const openLightbox = (photo: ImageType, index: number) => {
    setSelectedPhoto({ ...photo, index })
  }

  const closeLightbox = () => {
    setSelectedPhoto(null)
  }

  const navigatePhoto = (direction: 'prev' | 'next') => {
    if (!selectedPhoto || photos.length === 0) return
    const newIndex = direction === 'next' 
      ? (selectedPhoto.index + 1) % photos.length
      : (selectedPhoto.index - 1 + photos.length) % photos.length
    setSelectedPhoto({ ...photos[newIndex], index: newIndex })
  }

  return (
    <section className="py-16 md:py-24 bg-linear-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-linear-to-br from-pink-100 to-purple-100 mb-6 shadow-lg">
            <Camera className="h-8 w-8 md:h-10 md:w-10 text-pink-600" />
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-light text-gray-800 mb-4">
            Photo Gallery
          </h2>
          <div className="w-24 h-1 mx-auto bg-linear-to-r from-pink-400 to-purple-400 rounded-full mb-6" />
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Capturing the beautiful moments of our special day
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mb-4" />
              <p className="text-gray-600">Loading photos...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-12 flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Unable to load photos</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && photos.length === 0 && (
          <div className="text-center py-16">
            <Camera className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No photos have been highlighted yet</p>
          </div>
        )}

        {/* Masonry Grid */}
        {!isLoading && !error && photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
            {photos.map((photo, index) => {
              const categoryColor = CATEGORY_COLORS[photo.category as ImageCategory] || 'from-gray-200 to-gray-300'
              return (
                <div
                  key={photo.id}
                  className={`group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer hover:-translate-y-2 ${
                    index % 7 === 0 ? 'md:col-span-2 md:row-span-2' : ''
                  }`}
                  onClick={() => openLightbox(photo, index)}
                >
                  <div className={`aspect-square bg-linear-to-br ${categoryColor} flex items-center justify-center relative overflow-hidden`}>
                    {/* Photo Image */}
                    {photo.public_url ? (
                      <Image
                        src={photo.public_url}
                        alt={photo.filename}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      />
                    ) : (
                      <Camera className="h-16 w-16 md:h-20 md:w-20 text-white/50" />
                    )}
                    
                    {/* Overlay - shows on hover (desktop only) */}
                    <div className="hidden sm:flex absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors items-center justify-center gap-2 p-2 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          openLightbox(photo, index)
                        }}
                        className="text-white hover:bg-white/20 transition-all duration-300 p-2 rounded-full"
                        title="View full size"
                      >
                        <ZoomIn className="h-6 w-6" />
                      </button>
                    </div>

                    {/* Category Badge */}
                    <div className="absolute bottom-4 left-4 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-gray-800 shadow-lg">
                      {photo.category}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 z-10"
          >
            <X className="h-6 w-6" />
          </button>

          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  navigatePhoto('prev')
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 z-10"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  navigatePhoto('next')
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 z-10"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <div 
            className="relative max-w-4xl max-h-[80vh] rounded-2xl overflow-hidden bg-gray-900 flex items-center justify-center w-full h-[60vh] sm:h-[70vh] lg:h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedPhoto.public_url ? (
              <Image
                src={selectedPhoto.public_url}
                alt={selectedPhoto.filename}
                fill
                className="object-contain"
                sizes="90vw"
              />
            ) : (
              <div className="text-center text-white">
                <p className="text-lg font-semibold mb-2">Preview not available</p>
                <p className="text-sm text-gray-400">{selectedPhoto.filename}</p>
              </div>
            )}
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white">
            {selectedPhoto.index + 1} / {photos.length}
          </div>
        </div>
      )}
    </section>
  )
}
