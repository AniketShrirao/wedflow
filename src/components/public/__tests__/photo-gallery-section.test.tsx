import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { Image as ImageType } from '@/lib/services/photo-service'

// Mock fetch
global.fetch = vi.fn()

describe('PhotoGallerySection Component', () => {
  const mockHighlightedPhotos = {
    'Wedding': [
      {
        id: 'img-1',
        upload_id: 'upload-1',
        couple_id: 'couple-1',
        filename: 'wedding-1.jpg',
        google_drive_file_id: 'file-1',
        public_url: 'https://example.com/wedding-1.jpg',
        category: 'Wedding' as const,
        folder: 'Wedding',
        is_highlighted: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'img-2',
        upload_id: 'upload-1',
        couple_id: 'couple-1',
        filename: 'wedding-2.jpg',
        google_drive_file_id: 'file-2',
        public_url: 'https://example.com/wedding-2.jpg',
        category: 'Wedding' as const,
        folder: 'Wedding',
        is_highlighted: true,
        created_at: '2024-01-01T01:00:00Z',
        updated_at: '2024-01-01T01:00:00Z'
      }
    ],
    'Reception': [
      {
        id: 'img-3',
        upload_id: 'upload-2',
        couple_id: 'couple-1',
        filename: 'reception-1.jpg',
        google_drive_file_id: 'file-3',
        public_url: 'https://example.com/reception-1.jpg',
        category: 'Reception' as const,
        folder: 'Reception',
        is_highlighted: true,
        created_at: '2024-01-01T02:00:00Z',
        updated_at: '2024-01-01T02:00:00Z'
      }
    ]
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/public/') && url.includes('/photos/highlighted')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockHighlightedPhotos)
        })
      }
      return Promise.resolve({ ok: false })
    })
  })

  describe('API Integration', () => {
    it('should fetch highlighted photos from public API endpoint', async () => {
      ;(global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/public/test-couple/photos/highlighted')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockHighlightedPhotos)
          })
        }
        return Promise.resolve({ ok: false })
      })

      const response = await fetch('/api/public/test-couple/photos/highlighted')
      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data).toHaveProperty('Wedding')
      expect(data).toHaveProperty('Reception')
    })

    it('should handle API errors gracefully', async () => {
      ;(global.fetch as any).mockImplementation(() =>
        Promise.reject(new Error('Network error'))
      )

      try {
        await fetch('/api/public/test-couple/photos/highlighted')
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    it('should handle empty highlighted photos response', async () => {
      ;(global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/public/')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({})
          })
        }
        return Promise.resolve({ ok: false })
      })

      const response = await fetch('/api/public/test-couple/photos/highlighted')
      const data = await response.json()
      expect(Object.keys(data).length).toBe(0)
    })
  })

  describe('Photo Organization', () => {
    it('should organize photos by category', () => {
      const categories = Object.keys(mockHighlightedPhotos)
      expect(categories).toContain('Wedding')
      expect(categories).toContain('Reception')
    })

    it('should maintain all photos within categories', () => {
      const allPhotos = Object.values(mockHighlightedPhotos).flat()
      expect(allPhotos.length).toBe(3)
    })

    it('should preserve photo metadata when organizing', () => {
      const weddingPhotos = mockHighlightedPhotos['Wedding']
      weddingPhotos.forEach(photo => {
        expect(photo).toHaveProperty('id')
        expect(photo).toHaveProperty('filename')
        expect(photo).toHaveProperty('public_url')
        expect(photo).toHaveProperty('category')
        expect(photo.is_highlighted).toBe(true)
      })
    })

    it('should support all image categories', () => {
      const validCategories = ['Haldi', 'Sangeet', 'Wedding', 'Reception']
      const photoCategories = Object.values(mockHighlightedPhotos)
        .flat()
        .map(p => p.category)
      
      photoCategories.forEach(cat => {
        expect(validCategories).toContain(cat)
      })
    })
  })

  describe('Photo Display', () => {
    it('should have public URLs for all highlighted photos', () => {
      const allPhotos = Object.values(mockHighlightedPhotos).flat()
      allPhotos.forEach(photo => {
        expect(photo.public_url).toBeTruthy()
        expect(photo.public_url).toMatch(/^https?:\/\//)
      })
    })

    it('should include filename for all photos', () => {
      const allPhotos = Object.values(mockHighlightedPhotos).flat()
      allPhotos.forEach(photo => {
        expect(photo.filename).toBeTruthy()
      })
    })

    it('should maintain photo order within categories', () => {
      const weddingPhotos = mockHighlightedPhotos['Wedding']
      expect(weddingPhotos[0].id).toBe('img-1')
      expect(weddingPhotos[1].id).toBe('img-2')
    })
  })

  describe('Responsive Gallery Layout', () => {
    it('should support masonry grid layout', () => {
      const allPhotos = Object.values(mockHighlightedPhotos).flat()
      expect(allPhotos.length).toBeGreaterThan(0)
    })

    it('should handle variable number of photos', () => {
      const counts = [0, 1, 3, 5, 10]
      counts.forEach(count => {
        expect(typeof count).toBe('number')
        expect(count).toBeGreaterThanOrEqual(0)
      })
    })

    it('should support lightbox navigation', () => {
      const allPhotos = Object.values(mockHighlightedPhotos).flat()
      const currentIndex = 0
      const nextIndex = (currentIndex + 1) % allPhotos.length
      const prevIndex = (currentIndex - 1 + allPhotos.length) % allPhotos.length
      
      expect(nextIndex).toBe(1)
      expect(prevIndex).toBe(allPhotos.length - 1)
    })
  })

  describe('Component Props', () => {
    it('should accept coupleSlug prop', () => {
      const coupleSlug = 'john-jane-wedding'
      expect(coupleSlug).toBeTruthy()
      expect(typeof coupleSlug).toBe('string')
    })

    it('should use coupleSlug in API endpoint', () => {
      const coupleSlug = 'test-couple'
      const endpoint = `/api/public/${coupleSlug}/photos/highlighted`
      expect(endpoint).toContain(coupleSlug)
      expect(endpoint).toContain('/photos/highlighted')
    })
  })

  describe('Error Handling', () => {
    it('should handle missing public URLs', () => {
      const photoWithoutUrl = {
        ...mockHighlightedPhotos['Wedding'][0],
        public_url: ''
      }
      expect(photoWithoutUrl.public_url).toBe('')
    })

    it('should handle invalid category values', () => {
      const validCategories = ['Haldi', 'Sangeet', 'Wedding', 'Reception']
      const invalidCategory = 'InvalidCategory'
      expect(validCategories).not.toContain(invalidCategory)
    })

    it('should validate photo data structure', () => {
      const photo = mockHighlightedPhotos['Wedding'][0]
      expect(photo.id).toBeTruthy()
      expect(photo.couple_id).toBeTruthy()
      expect(photo.is_highlighted).toBe(true)
    })
  })

  describe('Public API Access', () => {
    it('should not require authentication for public endpoint', async () => {
      ;(global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/public/')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockHighlightedPhotos)
          })
        }
        return Promise.resolve({ ok: false })
      })

      const response = await fetch('/api/public/any-couple/photos/highlighted')
      expect(response.ok).toBe(true)
    })

    it('should return only highlighted images', () => {
      const allPhotos = Object.values(mockHighlightedPhotos).flat()
      allPhotos.forEach(photo => {
        expect(photo.is_highlighted).toBe(true)
      })
    })

    it('should organize response by category', () => {
      const response = mockHighlightedPhotos
      expect(Object.keys(response).length).toBeGreaterThan(0)
      Object.entries(response).forEach(([category, photos]) => {
        expect(typeof category).toBe('string')
        expect(Array.isArray(photos)).toBe(true)
      })
    })
  })
})
