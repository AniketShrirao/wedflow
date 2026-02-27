'use client'

import { useState, useEffect } from 'react'
import { Upload, Image as ImageType } from '@/lib/services/photo-service'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronDown, ChevronUp, Calendar, Mail, Download } from 'lucide-react'
import Image from 'next/image'
import { useToast } from '@/hooks/use-toast'
import { ImageCarousel } from './image-carousel'

interface UploadHistoryProps {
  coupleId?: string
  className?: string
}

type SortField = 'date' | 'uploader'
type SortOrder = 'asc' | 'desc'

interface ExpandedUpload {
  uploadId: string
  images: ImageType[]
  isLoading: boolean
}

interface UploadWithImages extends Upload {
  imageCount: number
}

export function UploadHistory({ className = '' }: UploadHistoryProps) {
  const [uploads, setUploads] = useState<UploadWithImages[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [filterEmail, setFilterEmail] = useState('')
  const [cachedImages, setCachedImages] = useState<Map<string, ExpandedUpload>>(new Map())
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null)
  const { toast } = useToast()

  type ToastVariant = 'default' | 'error' | 'success' | 'warning' | 'info'

  // Fetch uploads and their images
  useEffect(() => {
    const fetchUploads = async () => {
      try {
        setIsLoading(true)
        const params = new URLSearchParams()
        if (filterEmail) {
          params.append('uploaderEmail', filterEmail)
        }

        const response = await fetch(`/api/photos/uploads?${params.toString()}`)
        if (response.ok) {
          const uploadsData = await response.json()
          
          // Fetch images for each upload and cache them
          const uploadsWithImages = await Promise.all(
            uploadsData.map(async (upload: Upload) => {
              try {
                const imageResponse = await fetch(`/api/photos/uploads/${upload.id}`)
                if (imageResponse.ok) {
                  const imageData = await imageResponse.json()
                  const images = imageData.images || []
                  
                  // Cache the images
                  setCachedImages(prev => {
                    const newMap = new Map(prev)
                    newMap.set(upload.id, {
                      uploadId: upload.id,
                      images,
                      isLoading: false
                    })
                    return newMap
                  })
                  
                  return {
                    ...upload,
                    imageCount: images.length
                  }
                }
              } catch (error) {
                console.error(`Failed to fetch images for upload ${upload.id}:`, error)
              }
              return {
                ...upload,
                imageCount: 0
              }
            })
          )
          
          setUploads(uploadsWithImages)
        } else {
          toast({
            title: 'Error',
            description: 'Failed to load uploads',
            variant: 'error' as ToastVariant
          })
        }
      } catch (error) {
        console.error('Failed to fetch uploads:', error)
        toast({
          title: 'Error',
          description: 'Failed to load uploads',
          variant: 'error' as ToastVariant
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUploads()
  }, [filterEmail])

  const toggleUploadExpanded = (uploadId: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(uploadId)) {
        newSet.delete(uploadId)
      } else {
        newSet.add(uploadId)
      }
      return newSet
    })
  }

  const getSortedUploads = () => {
    const sorted = [...uploads].sort((a, b) => {
      let compareValue = 0

      if (sortField === 'date') {
        const dateA = new Date(a.created_at).getTime()
        const dateB = new Date(b.created_at).getTime()
        compareValue = dateA - dateB
      } else if (sortField === 'uploader') {
        compareValue = (a.uploader_name || '').localeCompare(b.uploader_name || '')
      }

      return sortOrder === 'asc' ? compareValue : -compareValue
    })

    return sorted
  }



  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getSourceBadgeVariant = (source: string) => {
    switch (source) {
      case 'dashboard':
        return 'default'
      case 'public_site':
        return 'secondary'
      case 'legacy':
        return 'outline'
      default:
        return 'default'
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'failed':
        return 'destructive'
      default:
        return 'default'
    }
  }

  const sortedUploads = getSortedUploads()

  return (
    <div className={className}>
      {/* Filter and Sort Bar */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Email Filter */}
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Filter by Email</label>
            <Input
              placeholder="Search by uploader email..."
              value={filterEmail}
              onChange={(e) => setFilterEmail(e.target.value)}
              className="w-full"
              disabled={isLoading}
            />
          </div>

          {/* Sort by Date */}
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Sort</label>
            <Select
              value={`${sortField}-${sortOrder}`}
              onValueChange={(value) => {
                const [field, order] = value.split('-') as [SortField, SortOrder]
                setSortField(field)
                setSortOrder(order)
              }}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Date (Newest First)</SelectItem>
                <SelectItem value="date-asc">Date (Oldest First)</SelectItem>
                <SelectItem value="uploader-asc">Uploader (A-Z)</SelectItem>
                <SelectItem value="uploader-desc">Uploader (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats */}
        <div className="text-sm text-muted-foreground">
          {isLoading ? 'Loading...' : `${sortedUploads.length} upload${sortedUploads.length !== 1 ? 's' : ''}`}
        </div>
      </div>

      {/* Uploads List */}
      <div className="space-y-3">
        {isLoading ? (
          // Skeleton loaders while loading
          <>
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="h-4 bg-muted rounded w-1/3" />
                      <div className="space-y-2">
                        <div className="h-3 bg-muted rounded w-1/2" />
                        <div className="h-3 bg-muted rounded w-2/3" />
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="h-4 bg-muted rounded w-12" />
                      <div className="h-3 bg-muted rounded w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        ) : uploads.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Uploads Yet</h3>
                <p className="text-muted-foreground">
                  Upload history will appear here once you start uploading photos
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          sortedUploads.map((upload) => {
          const isExpanded = expandedIds.has(upload.id)
          const cached = cachedImages.get(upload.id)
          const imageCount = cached?.images.length || upload.imageCount || 0
          const isClickable = imageCount > 0

          return (
            <div key={upload.id}>
              {/* Upload Row */}
              <Card className={`${isClickable ? 'hover:bg-muted/50 transition-colors' : 'opacity-60'}`}>
                <CardContent className="p-4">
                  <div
                    onClick={() => isClickable && toggleUploadExpanded(upload.id)}
                    className={`w-full text-left ${isClickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : 'cursor-not-allowed'}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Left side - Upload info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="font-semibold text-sm sm:text-base truncate">
                            {upload.uploader_name}
                          </span>
                          <Badge variant={getSourceBadgeVariant(upload.upload_source)} className="text-xs">
                            {upload.upload_source === 'public_site' ? 'Public Site' : 'Dashboard'}
                          </Badge>
                          <Badge variant={getStatusBadgeVariant(upload.status)} className="text-xs">
                            {upload.status}
                          </Badge>
                        </div>

                        <div className="space-y-1 text-xs sm:text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                            {formatDate(upload.created_at)}
                          </div>
                          {upload.uploader_email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="truncate">{upload.uploader_email}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right side - Image count and expand button */}
                      <div className="flex items-center gap-2 sm:gap-4">
                        <div className="text-right">
                          <div className="font-semibold text-sm sm:text-base">
                            {cached?.isLoading ? '...' : imageCount}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {imageCount === 1 ? 'image' : 'images'}
                          </div>
                        </div>
                        {isClickable && (
                          <div className="h-8 w-8 p-0 flex items-center justify-center">
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Expanded Images Grid */}
              {isExpanded && cached && (
                <div className="mt-3 ml-0 sm:ml-4 p-4 bg-muted/30 rounded-lg border border-muted">
                  {cached.isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin">
                        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                      </div>
                    </div>
                  ) : cached.images.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground">No images in this upload</p>
                    </div>
                  ) : (
                    <ImageCarousel
                      images={cached.images}
                      onImageClick={(image) => setSelectedImage(image)}
                    />
                  )}
                </div>
              )}
            </div>
          )
          })
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  )
}

interface ImageModalProps {
  image: ImageType
  onClose: () => void
}

function ImageModal({ image, onClose }: ImageModalProps) {
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
              alt={`${image.filename} - ${image.category}`}
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
        </div>
      </div>
    </div>
  )
}
