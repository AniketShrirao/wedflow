'use client'

import { useState, useEffect, useCallback } from 'react'
import { Image as ImageType, ImageCategory } from '@/lib/services/photo-service'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Heart, Download, Trash2, Eye, CheckCircle2, Circle } from 'lucide-react'
import Image from 'next/image'
import { useToast } from '@/hooks/use-toast'

interface ImageGalleryProps {
  coupleId: string
  showHighlightControls?: boolean
  className?: string
}

const CATEGORIES: ImageCategory[] = ['Haldi', 'Sangeet', 'Wedding', 'Reception']

export function ImageGallery({
  coupleId,
  showHighlightControls = false,
  className = ''
}: ImageGalleryProps) {
  const [images, setImages] = useState<ImageType[]>([])
  const [folders, setFolders] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<ImageCategory | 'all'>('all')
  const [selectedFolder, setSelectedFolder] = useState<string | 'all'>('all')
  const [selectedPhoto, setSelectedPhoto] = useState<ImageType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImageIds, setSelectedImageIds] = useState<Set<string>>(new Set())
  const [isMarkingHighlights, setIsMarkingHighlights] = useState(false)
  const { toast } = useToast()

  type ToastVariant = 'default' | 'error' | 'success' | 'warning' | 'info'

  // Fetch images and folders
  useEffect(() => {
    fetchImages()
    fetchFolders()
  }, [coupleId])

  const fetchImages = useCallback(async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory)
      }
      if (selectedFolder !== 'all') {
        params.append('folder', selectedFolder)
      }

      const response = await fetch(`/api/photos/images?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setImages(data)
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load images',
          variant: 'error' as ToastVariant
        })
      }
    } catch (error) {
      console.error('Failed to fetch images:', error)
      toast({
        title: 'Error',
        description: 'Failed to load images',
        variant: 'error' as ToastVariant
      })
    } finally {
      setIsLoading(false)
    }
  }, [coupleId, selectedCategory, selectedFolder, toast])

  const fetchFolders = useCallback(async () => {
    try {
      const response = await fetch('/api/photos/categories')
      if (response.ok) {
        const data = await response.json()
        const folderNames = Array.from(new Set((data as Array<{ category_name: string }>).map((f) => f.category_name)))
        setFolders(folderNames)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }, [])

  // Refetch images when filters change
  useEffect(() => {
    fetchImages()
  }, [selectedCategory, selectedFolder, fetchImages])

  const handleToggleImageSelection = (imageId: string) => {
    const newSelected = new Set(selectedImageIds)
    if (newSelected.has(imageId)) {
      newSelected.delete(imageId)
    } else {
      newSelected.add(imageId)
    }
    setSelectedImageIds(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedImageIds.size === images.length) {
      setSelectedImageIds(new Set())
    } else {
      setSelectedImageIds(new Set(images.map(img => img.id)))
    }
  }

  const handleHighlightToggle = async (imageId: string) => {
    try {
      const image = images.find(img => img.id === imageId)
      if (!image) return

      const response = await fetch(`/api/photos/images/${imageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_highlighted: !image.is_highlighted
        })
      })

      if (response.ok) {
        setImages(images.map(img =>
          img.id === imageId ? { ...img, is_highlighted: !img.is_highlighted } : img
        ))
        toast({
          title: 'Updated',
          description: image.is_highlighted ? 'Removed from highlights' : 'Added to highlights'
        })
      }
    } catch (error) {
      console.error('Failed to toggle highlight:', error)
      toast({
        title: 'Error',
        description: 'Failed to update highlight status',
        variant: 'error' as ToastVariant
      })
    }
  }

  const handleBulkHighlight = async (isHighlight: boolean) => {
    if (selectedImageIds.size === 0) {
      toast({
        title: 'No images selected',
        description: 'Please select images first',
        variant: 'error' as ToastVariant
      })
      return
    }

    try {
      setIsMarkingHighlights(true)
      const imageIds = Array.from(selectedImageIds)

      const response = await fetch('/api/photos/images/bulk-highlight', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageIds,
          isHighlighted: isHighlight
        })
      })

      if (response.ok) {
        setImages(images.map(img =>
          selectedImageIds.has(img.id) ? { ...img, is_highlighted: isHighlight } : img
        ))
        setSelectedImageIds(new Set())
        toast({
          title: 'Success',
          description: `${imageIds.length} image(s) ${isHighlight ? 'added to' : 'removed from'} highlights`
        })
      }
    } catch (error) {
      console.error('Failed to bulk highlight:', error)
      toast({
        title: 'Error',
        description: 'Failed to update highlights',
        variant: 'error' as ToastVariant
      })
    } finally {
      setIsMarkingHighlights(false)
    }
  }

  const handlePhotoDelete = async (imageId: string) => {
    try {
      const response = await fetch(`/api/photos/images/${imageId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setImages(images.filter(img => img.id !== imageId))
        setSelectedPhoto(null)
        toast({
          title: 'Deleted',
          description: 'Photo deleted successfully'
        })
      }
    } catch (error) {
      console.error('Failed to delete photo:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete photo',
        variant: 'error' as ToastVariant
      })
    }
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-12 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3 mx-auto" />
            <div className="grid grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square bg-muted rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (images.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">No Photos Yet</h3>
            <p className="text-muted-foreground">
              Upload some photos to get started with your gallery
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const highlightedCount = images.filter(img => img.is_highlighted).length
  const allSelected = selectedImageIds.size === images.length && images.length > 0

  return (
    <div className={className}>
      {/* Filter Bar */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Category Filter */}
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as ImageCategory | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Folder Filter */}
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Folder</label>
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Folders</option>
              {folders.map(folder => (
                <option key={folder} value={folder}>{folder}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {showHighlightControls && (
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="gap-2"
              >
                {allSelected ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
                {allSelected ? 'Deselect All' : 'Select All'}
              </Button>
              {selectedImageIds.size > 0 && (
                <span className="text-sm text-muted-foreground">
                  {selectedImageIds.size} selected
                </span>
              )}
            </div>

            {selectedImageIds.size > 0 && (
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkHighlight(true)}
                  disabled={isMarkingHighlights}
                  className="gap-2 flex-1 sm:flex-none"
                >
                  <Heart className="h-4 w-4" />
                  Add to Highlights
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkHighlight(false)}
                  disabled={isMarkingHighlights}
                  className="gap-2 flex-1 sm:flex-none"
                >
                  <Heart className="h-4 w-4" />
                  Remove from Highlights
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>{images.length} photos</span>
          {showHighlightControls && <span>{highlightedCount} highlighted</span>}
        </div>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => {
          const isSelected = selectedImageIds.has(image.id)

          return (
            <div key={image.id} className="relative group">
              <div
                className="relative aspect-square overflow-hidden rounded-lg cursor-pointer bg-gray-200"
                onClick={() => {
                  if (showHighlightControls && selectedImageIds.size > 0) {
                    handleToggleImageSelection(image.id)
                  } else {
                    setSelectedPhoto(image)
                  }
                }}
              >
                {image.public_url ? (
                  <Image
                    src={image.public_url}
                    alt={image.filename}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-300">
                    <span className="text-gray-500 text-sm">No image</span>
                  </div>
                )}

                {/* Overlay - shows on hover */}
                <div className="hidden sm:flex absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors items-center justify-center gap-2 p-2 opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    {showHighlightControls && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-white/20"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleHighlightToggle(image.id)
                        }}
                        title={image.is_highlighted ? 'Remove from highlights' : 'Add to highlights'}
                      >
                        <Heart
                          className={`h-5 w-5 ${
                            image.is_highlighted
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
                        setSelectedPhoto(image)
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
                        if (image.public_url) {
                          const link = document.createElement('a')
                          link.href = image.public_url
                          link.download = image.filename
                          link.target = '_blank'
                          document.body.appendChild(link)
                          link.click()
                          document.body.removeChild(link)
                        }
                      }}
                      disabled={!image.public_url}
                      title="Download photo"
                    >
                      <Download className="h-5 w-5" />
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:bg-red-500/20"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm('Are you sure you want to delete this photo?')) {
                          handlePhotoDelete(image.id)
                        }
                      }}
                      title="Delete photo"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Selection checkbox */}
                {showHighlightControls && (
                  <div className="absolute top-2 left-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className={`h-6 w-6 p-0 ${
                        isSelected ? 'bg-primary text-white' : 'bg-white/80 hover:bg-white'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleImageSelection(image.id)
                      }}
                    >
                      {isSelected ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                )}

                {/* Highlight indicator */}
                {image.is_highlighted && (
                  <div className="absolute top-2 right-2">
                    <Heart className="h-5 w-5 text-red-500 fill-current" />
                  </div>
                )}

                {/* Category badge */}
                <div className="absolute bottom-2 left-2">
                  <Badge variant="secondary" className="text-xs">
                    {image.category}
                  </Badge>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <ImageModal
          image={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          onHighlightToggle={showHighlightControls ? () => handleHighlightToggle(selectedPhoto.id) : undefined}
          onPhotoDelete={handlePhotoDelete}
        />
      )}
    </div>
  )
}

interface ImageModalProps {
  image: ImageType
  onClose: () => void
  onHighlightToggle?: () => void
  onPhotoDelete: (imageId: string) => void
}

function ImageModal({ image, onClose, onHighlightToggle, onPhotoDelete }: ImageModalProps) {
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

        {/* Image */}
        <div className="relative w-full h-[60vh] sm:h-[70vh] lg:h-[80vh] bg-gray-900 flex items-center justify-center">
          {image.public_url ? (
            <Image
              src={image.public_url}
              alt={image.filename}
              fill
              className="object-contain"
              sizes="90vw"
            />
          ) : (
            <div className="text-center text-white">
              <p className="text-lg font-semibold mb-2">Preview not available</p>
              <p className="text-sm text-gray-400">{image.filename}</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="text-white min-w-0">
            <h3 className="font-semibold text-sm sm:text-base truncate">{image.filename}</h3>
            <div className="flex gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {image.category}
              </Badge>
              {image.folder && (
                <Badge variant="outline" className="text-xs">
                  {image.folder}
                </Badge>
              )}
            </div>
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
                    image.is_highlighted ? 'text-red-500 fill-current' : ''
                  }`}
                />
                {image.is_highlighted ? 'Remove from Highlights' : 'Add to Highlights'}
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => {
                if (image.public_url) {
                  const link = document.createElement('a')
                  link.href = image.public_url
                  link.download = image.filename
                  link.target = '_blank'
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                }
              }}
              disabled={!image.public_url}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-red-400 hover:bg-red-500/20"
              onClick={() => {
                if (confirm('Are you sure you want to delete this photo?')) {
                  onPhotoDelete(image.id)
                  onClose()
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
