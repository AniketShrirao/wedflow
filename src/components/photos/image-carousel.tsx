'use client'

import { useRef, useState, useEffect } from 'react'
import { Image as ImageType } from '@/lib/services/photo-service'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Download, Eye } from 'lucide-react'
import Image from 'next/image'

interface ImageCarouselProps {
  images: ImageType[]
  onImageClick: (image: ImageType) => void
  onImageDelete?: (imageId: string) => void
}

export function ImageCarousel({ images, onImageClick, onImageDelete }: ImageCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScroll()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScroll)
      window.addEventListener('resize', checkScroll)
      return () => {
        container.removeEventListener('scroll', checkScroll)
        window.removeEventListener('resize', checkScroll)
      }
    }
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-sm">
        Images ({images.length})
      </h4>
      
      <div className="relative group">
        {/* Left Arrow */}
        {canScrollLeft && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full h-10 w-10 p-0"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}

        {/* Scroll Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto scroll-smooth pb-2"
          style={{ scrollBehavior: 'smooth' }}
        >
          {images.map((image) => (
            <div
              key={image.id}
              className="relative group shrink-0 w-32 h-32 cursor-pointer"
              onClick={() => onImageClick(image)}
            >
              <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-200 h-full">
                {image.public_url ? (
                  <Image
                    src={image.public_url}
                    alt={`${image.filename} - ${image.category}`}
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-300">
                    <span className="text-gray-500 text-xs">No image</span>
                  </div>
                )}

                {/* Overlay */}
                <div className="hidden sm:flex absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20 h-8 w-8 p-0"
                    title="View full size"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20 h-8 w-8 p-0"
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
                    <Download className="h-4 w-4" />
                  </Button>
                </div>

                {/* Category badge */}
                <div className="absolute bottom-1 left-1">
                  <Badge variant="secondary" className="text-xs">
                    {image.category}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        {canScrollRight && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full h-10 w-10 p-0"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  )
}
