'use client'

import { useState, useEffect } from 'react'
import { Camera, X, Heart, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PhotoGallerySectionProps {
  coupleSlug: string
}

export function PhotoGallerySection({ coupleSlug }: PhotoGallerySectionProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null)
  const [photos, setPhotos] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading photos
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }, [])

  const openLightbox = (photo: any, index: number) => {
    setSelectedPhoto({ ...photo, index })
  }

  const closeLightbox = () => {
    setSelectedPhoto(null)
  }

  const navigatePhoto = (direction: 'prev' | 'next') => {
    if (!selectedPhoto) return
    const newIndex = direction === 'next' 
      ? (selectedPhoto.index + 1) % photos.length
      : (selectedPhoto.index - 1 + photos.length) % photos.length
    setSelectedPhoto({ ...photos[newIndex], index: newIndex })
  }

  // Placeholder photos for demo
  const placeholderPhotos = [
    { id: 1, category: 'Engagement', color: 'from-pink-200 to-rose-200' },
    { id: 2, category: 'Pre-Wedding', color: 'from-purple-200 to-indigo-200' },
    { id: 3, category: 'Ceremony', color: 'from-blue-200 to-cyan-200' },
    { id: 4, category: 'Reception', color: 'from-green-200 to-emerald-200' },
    { id: 5, category: 'Candid', color: 'from-yellow-200 to-orange-200' },
    { id: 6, category: 'Family', color: 'from-red-200 to-pink-200' },
  ]

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 mb-6 shadow-lg">
            <Camera className="h-8 w-8 md:h-10 md:w-10 text-pink-600" />
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-light text-gray-800 mb-4">
            Photo Gallery
          </h2>
          <div className="w-24 h-1 mx-auto bg-gradient-to-r from-pink-400 to-purple-400 rounded-full mb-6" />
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Capturing the beautiful moments of our special day
          </p>
        </div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
          {placeholderPhotos.map((photo, index) => (
            <div
              key={photo.id}
              className={`group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer hover:-translate-y-2 ${
                index % 7 === 0 ? 'md:col-span-2 md:row-span-2' : ''
              }`}
              onClick={() => openLightbox(photo, index)}
            >
              <div className={`aspect-square bg-gradient-to-br ${photo.color} flex items-center justify-center relative overflow-hidden`}>
                {/* Placeholder Content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera className="h-16 w-16 md:h-20 md:w-20 text-white/50" />
                </div>
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-100 scale-90">
                    <ZoomIn className="h-12 w-12 text-white" />
                  </div>
                </div>

                {/* Category Badge */}
                <div className="absolute bottom-4 left-4 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-gray-800 shadow-lg">
                  {photo.category}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Upload CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl p-8 md:p-12 max-w-2xl mx-auto shadow-xl border border-pink-100">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Camera className="h-10 w-10 text-pink-600" />
            </div>
            
            <h3 className="text-2xl md:text-3xl font-light text-gray-800 mb-4">
              Share Your Photos
            </h3>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              Help us capture every moment by uploading your photos from the celebration
            </p>
            <Button 
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-lg py-6 px-8 rounded-xl"
            >
              <Camera className="h-5 w-5 mr-2" />
              Upload Photos
            </Button>
          </div>
        </div>
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

          <div 
            className={`max-w-4xl max-h-[80vh] rounded-2xl overflow-hidden bg-gradient-to-br ${selectedPhoto.color} aspect-video flex items-center justify-center`}
            onClick={(e) => e.stopPropagation()}
          >
            <Camera className="h-32 w-32 text-white/50" />
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white">
            {selectedPhoto.index + 1} / {placeholderPhotos.length}
          </div>
        </div>
      )}
    </section>
  )
}
