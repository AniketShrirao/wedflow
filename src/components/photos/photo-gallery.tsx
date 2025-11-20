'use client'

import { useState, useEffect } from 'react'
import { PhotoCollection, PhotoCategory, Photo, PHOTO_CATEGORIES } from '@/lib/types/photos'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Heart, Download, Eye, Star } from 'lucide-react'
import Image from 'next/image'

interface PhotoGalleryProps {
  photoCollection: PhotoCollection | null
  onHighlightToggle?: (photoId: string) => void
  showHighlightControls?: boolean
  className?: string
}

export function PhotoGallery({ 
  photoCollection, 
  onHighlightToggle, 
  showHighlightControls = false,
  className = '' 
}: PhotoGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)

  const categories = photoCollection?.categories || []
  const highlightPhotos = photoCollection?.highlight_photos || []

  // Get all photos across categories
  const allPhotos = categories.flatMap(category => 
    category.photos.map(photo => ({ ...photo, category_name: category.name }))
  )

  // Filter photos based on selected category
  const filteredPhotos = selectedCategory === 'all' 
    ? allPhotos 
    : categories.find(cat => cat.id === selectedCategory)?.photos || []

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo)
  }

  const handleHighlightToggle = (photoId: string) => {
    if (onHighlightToggle) {
      onHighlightToggle(photoId)
    }
  }

  if (!photoCollection || categories.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">No Photos Yet</h3>
            <p className="text-muted-foreground mb-4">
              Upload some photos to get started with your gallery
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All</TabsTrigger>
          {PHOTO_CATEGORIES.map(category => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <PhotoGrid 
            photos={allPhotos} 
            highlightPhotos={highlightPhotos}
            onPhotoClick={handlePhotoClick}
            onHighlightToggle={showHighlightControls ? handleHighlightToggle : undefined}
            showCategoryBadges={true}
          />
        </TabsContent>

        {PHOTO_CATEGORIES.map(category => {
          const categoryPhotos = categories.find(cat => cat.id === category.id)?.photos || []
          return (
            <TabsContent key={category.id} value={category.id} className="mt-6">
              <PhotoGrid 
                photos={categoryPhotos} 
                highlightPhotos={highlightPhotos}
                onPhotoClick={handlePhotoClick}
                onHighlightToggle={showHighlightControls ? handleHighlightToggle : undefined}
              />
            </TabsContent>
          )
        })}
      </Tabs>

      {/* Photo Modal */}
      {selectedPhoto && (
        <PhotoModal 
          photo={selectedPhoto} 
          onClose={() => setSelectedPhoto(null)}
          isHighlight={highlightPhotos.includes(selectedPhoto.id)}
          onHighlightToggle={showHighlightControls ? () => handleHighlightToggle(selectedPhoto.id) : undefined}
        />
      )}
    </div>
  )
}

interface PhotoGridProps {
  photos: (Photo & { category_name?: string })[]
  highlightPhotos: string[]
  onPhotoClick: (photo: Photo) => void
  onHighlightToggle?: (photoId: string) => void
  showCategoryBadges?: boolean
}

function PhotoGrid({ 
  photos, 
  highlightPhotos, 
  onPhotoClick, 
  onHighlightToggle,
  showCategoryBadges = false 
}: PhotoGridProps) {
  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No photos in this category yet</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {photos.map((photo) => (
        <div key={photo.id} className="relative group">
          <div 
            className="relative aspect-square overflow-hidden rounded-lg cursor-pointer"
            onClick={() => onPhotoClick(photo)}
          >
            <Image
              src={photo.thumbnail_url || photo.public_url}
              alt={photo.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            
            {/* Highlight indicator */}
            {highlightPhotos.includes(photo.id) && (
              <div className="absolute top-2 right-2">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
              </div>
            )}

            {/* Category badge */}
            {showCategoryBadges && photo.category_name && (
              <div className="absolute bottom-2 left-2">
                <Badge variant="secondary" className="text-xs">
                  {photo.category_name}
                </Badge>
              </div>
            )}

            {/* Highlight toggle button */}
            {onHighlightToggle && (
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation()
                  onHighlightToggle(photo.id)
                }}
              >
                <Heart 
                  className={`h-4 w-4 ${
                    highlightPhotos.includes(photo.id) 
                      ? 'text-red-500 fill-current' 
                      : 'text-white'
                  }`} 
                />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

interface PhotoModalProps {
  photo: Photo & { category_name?: string }
  onClose: () => void
  isHighlight: boolean
  onHighlightToggle?: () => void
}

function PhotoModal({ photo, onClose, isHighlight, onHighlightToggle }: PhotoModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="relative max-w-4xl max-h-[90vh] w-full">
        {/* Close button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
          onClick={onClose}
        >
          ×
        </Button>

        {/* Image */}
        <div className="relative w-full h-[80vh]">
          <Image
            src={photo.public_url}
            alt={photo.name}
            fill
            className="object-contain"
            sizes="90vw"
          />
        </div>

        {/* Controls */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
          <div className="text-white">
            <h3 className="font-semibold">{photo.name}</h3>
            {photo.category_name && (
              <Badge variant="secondary" className="mt-1">
                {photo.category_name}
              </Badge>
            )}
          </div>

          <div className="flex gap-2">
            {onHighlightToggle && (
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={onHighlightToggle}
              >
                <Heart 
                  className={`h-4 w-4 mr-2 ${
                    isHighlight ? 'text-red-500 fill-current' : ''
                  }`} 
                />
                {isHighlight ? 'Remove from Highlights' : 'Add to Highlights'}
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => window.open(photo.public_url, '_blank')}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}