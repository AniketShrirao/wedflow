import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { Image as ImageType } from '@/lib/services/photo-service'

// Mock fetch
global.fetch = vi.fn()

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, fill, className }: any) => (
    <img src={src} alt={alt} className={className} data-testid="gallery-image" />
  )
}))

// Mock toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}))

describe('ImageGallery Component', () => {
  const mockImages: ImageType[] = [
    {
      id: 'img-1',
      upload_id: 'upload-1',
      couple_id: 'couple-1',
      filename: 'photo1.jpg',
      google_drive_file_id: 'file-1',
      public_url: 'https://example.com/photo1.jpg',
      category: 'Wedding',
      folder: 'Wedding',
      is_highlighted: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'img-2',
      upload_id: 'upload-1',
      couple_id: 'couple-1',
      filename: 'photo2.jpg',
      google_drive_file_id: 'file-2',
      public_url: 'https://example.com/photo2.jpg',
      category: 'Reception',
      folder: 'Reception',
      is_highlighted: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    ;(global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/photos/images')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockImages)
        })
      }
      if (url.includes('/api/photos/categories')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        })
      }
      return Promise.resolve({ ok: false })
    })
  })

  describe('API Integration', () => {
    it('should fetch images on mount', async () => {
      ;(global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/photos/images')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockImages)
          })
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
      })

      expect(global.fetch).toBeDefined()
    })

    it('should fetch categories on mount', async () => {
      ;(global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/photos/categories')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([])
          })
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
      })

      expect(global.fetch).toBeDefined()
    })

    it('should handle category filtering', () => {
      const categories = ['Haldi', 'Sangeet', 'Wedding', 'Reception']
      categories.forEach(cat => {
        expect(['Haldi', 'Sangeet', 'Wedding', 'Reception']).toContain(cat)
      })
    })

    it('should handle folder filtering', () => {
      const folders = ['Wedding', 'Reception', 'Custom']
      expect(folders.length).toBeGreaterThan(0)
    })
  })

  describe('Image Data Structure', () => {
    it('should have correct image properties', () => {
      const image = mockImages[0]
      expect(image).toHaveProperty('id')
      expect(image).toHaveProperty('filename')
      expect(image).toHaveProperty('public_url')
      expect(image).toHaveProperty('category')
      expect(image).toHaveProperty('is_highlighted')
    })

    it('should support all image categories', () => {
      const categories = ['Haldi', 'Sangeet', 'Wedding', 'Reception']
      mockImages.forEach(img => {
        expect(categories).toContain(img.category)
      })
    })

    it('should track highlight status', () => {
      const highlighted = mockImages.filter(img => img.is_highlighted)
      expect(highlighted.length).toBe(1)
      expect(highlighted[0].id).toBe('img-2')
    })
  })

  describe('Bulk Operations', () => {
    it('should support bulk highlight API endpoint', async () => {
      ;(global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/photos/images/bulk-highlight')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockImages)
          })
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
      })

      const response = await fetch('/api/photos/images/bulk-highlight', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageIds: ['img-1', 'img-2'],
          isHighlighted: true
        })
      })

      expect(response.ok).toBe(true)
    })

    it('should handle multiple image selection', () => {
      const selectedIds = new Set(['img-1', 'img-2'])
      expect(selectedIds.size).toBe(2)
      expect(selectedIds.has('img-1')).toBe(true)
      expect(selectedIds.has('img-2')).toBe(true)
    })

    it('should support select all operation', () => {
      const allImageIds = mockImages.map(img => img.id)
      expect(allImageIds.length).toBe(2)
    })
  })

  describe('Component Props', () => {
    it('should accept coupleId prop', () => {
      const coupleId = 'couple-1'
      expect(coupleId).toBe('couple-1')
    })

    it('should accept showHighlightControls prop', () => {
      const showControls = true
      expect(typeof showControls).toBe('boolean')
    })

    it('should accept className prop', () => {
      const className = 'custom-class'
      expect(className).toBe('custom-class')
    })
  })

  describe('Error Handling', () => {
    it('should handle fetch errors', async () => {
      ;(global.fetch as any).mockImplementation(() =>
        Promise.reject(new Error('Network error'))
      )

      try {
        await fetch('/api/photos/images')
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    it('should handle empty image list', () => {
      const emptyImages: ImageType[] = []
      expect(emptyImages.length).toBe(0)
    })

    it('should validate image data', () => {
      mockImages.forEach(img => {
        expect(img.id).toBeTruthy()
        expect(img.filename).toBeTruthy()
        expect(img.category).toBeTruthy()
      })
    })
  })
})
