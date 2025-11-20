'use client'

import { useState, useEffect } from 'react'
import { PhotoCollection, Photo, PHOTO_CATEGORIES } from '@/lib/types/photos'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Heart, Download, Star, Trash2, Eye } from 'lucide-react'
import Image from 'next/image'

interface PhotoGalleryProps {
  photoCollection: PhotoCollection | null
  onHighlightToggle?: (photoId: string) => void
  onPhotoDelete?: (photoId: string) => void
  showHighlightControls?: boolean
  className?: string
}

export function PhotoGallery({ 
  photoCollection, 
  onHighlightToggle,
  onPhotoDelete,
  showHighlightControls = false,
  className = '' 
}: PhotoGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showHighlightsOnly, setShowHighlightsOnly] = useState(false)

  const categories = (photoCollection?.categories && Array.isArray(photoCollection.categories)) ? photoCollection.categories : []
  const highlightPhotos = (photoCollection?.highlight_photos && Array.isArray(photoCollection.highlight_photos)) ? photoCollection.highlight_photos : []

  // Get all photos across categories (deduplicated by photo ID)
  const allPhotosMap = new Map()
  categories.forEach(category => {
    if (category.photos && Array.isArray(category.photos)) {
      category.photos.forEach(photo => {
        if (!allPhotosMap.has(photo.id)) {
          allPhotosMap.set(photo.id, { ...photo, category_name: category.name })
        }
      })
    }
  })
  let allPhotos = Array.from(allPhotosMap.values())

  // Apply search filter
  if (searchQuery) {
    allPhotos = allPhotos.filter(photo =>
      photo.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  // Apply highlights filter
  if (showHighlightsOnly) {
    allPhotos = allPhotos.filter(photo =>
      highlightPhotos.includes(photo.id)
    )
  }

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo)
  }

  const handleHighlightToggle = (photoId: string) => {
    if (onHighlightToggle) {
      onHighlightToggle(photoId)
    }
  }

  const handlePhotoDelete = (photoId: string) => {
    if (onPhotoDelete) {
      onPhotoDelete(photoId)
      setSelectedPhoto(null)
    }
  }

  if (!photoCollection || !categories || categories.length === 0 || allPhotos.length === 0) {
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
      {/* Search and Filter Bar */}
      <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Search photos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button
            variant={showHighlightsOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowHighlightsOnly(!showHighlightsOnly)}
            className="gap-2 w-full sm:w-auto"
          >
            <Star className="h-4 w-4" />
            <span className="sm:inline">Highlights</span>
          </Button>
        </div>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="flex w-full gap-2 flex-wrap h-auto p-1 bg-muted rounded-lg mb-4">
          <TabsTrigger value="all" className="text-xs sm:text-sm py-1 px-2">All</TabsTrigger>
          
          {/* Standard categories */}
          {PHOTO_CATEGORIES.map(category => (
            <TabsTrigger key={category.id} value={category.id} className="text-xs sm:text-sm py-1 px-2">
              {category.name}
            </TabsTrigger>
          ))}
          
          {/* Custom categories from folder names */}
          {categories
            .filter(cat => !PHOTO_CATEGORIES.find(pc => pc.id === cat.id))
            .map(category => (
              <TabsTrigger key={category.id} value={category.id} className="text-xs sm:text-sm py-1 px-2">
                {category.name}
              </TabsTrigger>
            ))}
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <PhotoGrid 
            photos={allPhotos} 
            highlightPhotos={highlightPhotos}
            onPhotoClick={handlePhotoClick}
            onPhotoDelete={onPhotoDelete}
            onHighlightToggle={showHighlightControls ? handleHighlightToggle : undefined}
            showCategoryBadges={true}
          />
        </TabsContent>

        {/* Standard categories */}
        {PHOTO_CATEGORIES.map(category => {
          const categoryPhotos = categories.find(cat => cat.id === category.id)?.photos || []
          return (
            <TabsContent key={category.id} value={category.id} className="mt-6">
              <PhotoGrid 
                photos={categoryPhotos} 
                highlightPhotos={highlightPhotos}
                onPhotoClick={handlePhotoClick}
                onPhotoDelete={onPhotoDelete}
                onHighlightToggle={showHighlightControls ? handleHighlightToggle : undefined}
              />
            </TabsContent>
          )
        })}
        
        {/* Custom categories from folder names */}
        {categories
          .filter(cat => !PHOTO_CATEGORIES.find(pc => pc.id === cat.id))
          .map(category => (
            <TabsContent key={category.id} value={category.id} className="mt-6">
              <PhotoGrid 
                photos={category.photos || []} 
                highlightPhotos={highlightPhotos}
                onPhotoClick={handlePhotoClick}
                onPhotoDelete={onPhotoDelete}
                onHighlightToggle={showHighlightControls ? handleHighlightToggle : undefined}
              />
            </TabsContent>
          ))}
      </Tabs>

      {/* Photo Modal */}
      {selectedPhoto && (
        <PhotoModal 
          photo={selectedPhoto} 
          onClose={() => setSelectedPhoto(null)}
          isHighlight={highlightPhotos.includes(selectedPhoto.id)}
          onHighlightToggle={showHighlightControls ? () => handleHighlightToggle(selectedPhoto.id) : undefined}
          onPhotoDelete={onPhotoDelete ? handlePhotoDelete : undefined}
        />
      )}
    </div>
  )
}

interface PhotoGridProps {
  photos: (Photo & { category_name?: string })[]
  highlightPhotos: string[]
  onPhotoClick: (photo: Photo) => void
  onPhotoDelete?: (photoId: string) => void
  onHighlightToggle?: (photoId: string) => void
  showCategoryBadges?: boolean
}

function PhotoGrid({ 
  photos, 
  highlightPhotos, 
  onPhotoClick,
  onPhotoDelete,
  onHighlightToggle,
  showCategoryBadges = false 
}: PhotoGridProps) {
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null)

  if (!photos || photos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No photos in this category yet</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {photos.map((photo, index) => {
        const isSelected = selectedPhotoId === photo.id
        
        return (
          <div key={`${photo.id}-${index}`} className="relative group">
            <div 
              className="relative aspect-square overflow-hidden rounded-lg cursor-pointer bg-gray-200"
              onClick={() => {
                if (isSelected) {
                  setSelectedPhotoId(null)
                } else {
                  setSelectedPhotoId(photo.id)
                  onPhotoClick(photo)
                }
              }}
            >
              {(photo.thumbnail_url || photo.public_url) ? (
                <Image
                  src={photo.thumbnail_url || photo.public_url}
                  alt={photo.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  loading="eager"
                  onError={() => {
                    console.warn(`Failed to load image: ${photo.name}`)
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-300">
                  <span className="text-gray-500 text-sm">No image</span>
                </div>
              )}
              
              {/* Overlay - shows on hover (desktop only) */}
              <div className="hidden sm:flex absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors items-center justify-center gap-2 p-2 opacity-0 group-hover:opacity-100">
                {/* Action buttons */}
                <div className="flex gap-2">
                  {onHighlightToggle && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-white/20"
                      onClick={(e) => {
                        e.stopPropagation()
                        onHighlightToggle(photo.id)
                      }}
                      title={highlightPhotos.includes(photo.id) ? 'Remove from highlights' : 'Add to highlights'}
                    >
                      <Heart 
                        className={`h-5 w-5 ${
                          highlightPhotos.includes(photo.id) 
                            ? 'text-red-500 fill-current' 
                            : 'text-white'
                        }`} 
                      />
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                    onClick={(e) => {
                      e.stopPropagation()
                      onPhotoClick(photo)
                    }}
                    title="View full size"
                  >
                    <Eye className="h-5 w-5" />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                    onClick={(e) => {
                      e.stopPropagation()
                      try {
                        if (photo.public_url) {
                          const link = document.createElement('a')
                          link.href = photo.public_url
                          link.download = photo.name || 'photo'
                          link.target = '_blank'
                          document.body.appendChild(link)
                          link.click()
                          document.body.removeChild(link)
                        } else {
                          console.warn('No public_url available for download')
                        }
                      } catch (error) {
                        console.error('Download failed:', error)
                      }
                    }}
                    disabled={!photo.public_url}
                    title="Download photo"
                  >
                    <Download className="h-5 w-5" />
                  </Button>

                  {onPhotoDelete && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:bg-red-500/20"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm('Are you sure you want to delete this photo?')) {
                          onPhotoDelete(photo.id)
                        }
                      }}
                      title="Delete photo"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Click overlay - shows photo info on click */}
              {isSelected && (
                <div className="absolute inset-0 bg-black/70 transition-colors flex flex-col items-center justify-between p-3 z-10">
                  <div className="text-white text-center text-sm font-medium truncate w-full">
                    {photo.name}
                  </div>
                </div>
              )}
              
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
            </div>
          </div>
        )
      })}
    </div>
  )
}

interface PhotoModalProps {
  photo: Photo & { category_name?: string }
  onClose: () => void
  isHighlight: boolean
  onHighlightToggle?: () => void
  onPhotoDelete?: (photoId: string) => void
}

function PhotoModal({ photo, onClose, isHighlight, onHighlightToggle, onPhotoDelete }: PhotoModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  // Use full resolution public_url for modal, fallback to thumbnail
  const imageUrl = photo.public_url || photo.thumbnail_url
  const isValidImageUrl = imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('blob:'))

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="relative max-w-2xl sm:max-w-3xl lg:max-w-4xl max-h-[85vh] sm:max-h-[90vh] w-full mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10 text-white hover:bg-white/20 text-lg sm:text-base"
          onClick={onClose}
        >
          ×
        </Button>

        {/* Image or Placeholder */}
        <div className="relative w-full h-[60vh] sm:h-[70vh] lg:h-[80vh] bg-gray-900 flex items-center justify-center">
          {isValidImageUrl ? (
            <Image
              src={imageUrl}
              alt={photo.name}
              fill
              className="object-contain"
              sizes="90vw"
            />
          ) : (
            <div className="text-center text-white">
              <p className="text-lg font-semibold mb-2">Preview not available</p>
              <p className="text-sm text-gray-400">{photo.name}</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="text-white min-w-0">
            <h3 className="font-semibold text-sm sm:text-base truncate">{photo.name}</h3>
            {photo.category_name && (
              <Badge variant="secondary" className="mt-1 text-xs">
                {photo.category_name}
              </Badge>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
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
              onClick={() => {
                try {
                  if (photo.public_url) {
                    const link = document.createElement('a')
                    link.href = photo.public_url
                    link.download = photo.name || 'photo'
                    link.target = '_blank'
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                  } else {
                    console.warn('No public_url available for download')
                  }
                } catch (error) {
                  console.error('Download failed:', error)
                }
              }}
              disabled={!photo.public_url}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>

            {onPhotoDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-400 hover:bg-red-500/20"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this photo?')) {
                    onPhotoDelete(photo.id)
                    onClose()
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}