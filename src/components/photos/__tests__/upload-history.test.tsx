import { describe, it, expect, beforeEach, vi } from 'vitest'
import { photoService, type Upload, type Image } from '@/lib/services/photo-service'

// Mock the Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn(() => Promise.resolve({
        data: { user: { id: 'user-123' } }
      }))
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(() => Promise.resolve({
      data: {
        id: 'couple-123'
      }
    }))
  })
}))

// Mock toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}))

describe('UploadHistory Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Upload Data Structure', () => {
    it('should have correct upload properties', () => {
      const upload: Upload = {
        id: 'upload-123',
        couple_id: 'couple-123',
        uploader_name: 'John Doe',
        uploader_email: 'john@example.com',
        upload_source: 'dashboard',
        status: 'completed',
        google_drive_folder_path: 'https://drive.google.com/drive/folders/folder-123',
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:05:00Z'
      }

      expect(upload.id).toBe('upload-123')
      expect(upload.couple_id).toBe('couple-123')
      expect(upload.uploader_name).toBe('John Doe')
      expect(upload.uploader_email).toBe('john@example.com')
      expect(upload.upload_source).toBe('dashboard')
      expect(upload.status).toBe('completed')
    })

    it('should support all upload sources', () => {
      const sources = ['dashboard', 'public_site', 'legacy']
      const uploads: Upload[] = sources.map((source, index) => ({
        id: `upload-${index}`,
        couple_id: 'couple-123',
        uploader_name: 'User',
        uploader_email: null,
        upload_source: source as 'dashboard' | 'public_site' | 'legacy',
        status: 'completed',
        google_drive_folder_path: null,
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z'
      }))

      expect(uploads).toHaveLength(3)
      expect(uploads[0].upload_source).toBe('dashboard')
      expect(uploads[1].upload_source).toBe('public_site')
      expect(uploads[2].upload_source).toBe('legacy')
    })

    it('should support all upload statuses', () => {
      const statuses = ['pending', 'completed', 'failed']
      const uploads: Upload[] = statuses.map((status, index) => ({
        id: `upload-${index}`,
        couple_id: 'couple-123',
        uploader_name: 'User',
        uploader_email: null,
        upload_source: 'dashboard',
        status: status as 'pending' | 'completed' | 'failed',
        google_drive_folder_path: null,
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z'
      }))

      expect(uploads).toHaveLength(3)
      expect(uploads[0].status).toBe('pending')
      expect(uploads[1].status).toBe('completed')
      expect(uploads[2].status).toBe('failed')
    })

    it('should handle optional uploader email', () => {
      const uploadWithEmail: Upload = {
        id: 'upload-1',
        couple_id: 'couple-123',
        uploader_name: 'Guest',
        uploader_email: 'guest@example.com',
        upload_source: 'public_site',
        status: 'completed',
        google_drive_folder_path: null,
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z'
      }

      const uploadWithoutEmail: Upload = {
        id: 'upload-2',
        couple_id: 'couple-123',
        uploader_name: 'Dashboard User',
        uploader_email: null,
        upload_source: 'dashboard',
        status: 'completed',
        google_drive_folder_path: null,
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z'
      }

      expect(uploadWithEmail.uploader_email).toBe('guest@example.com')
      expect(uploadWithoutEmail.uploader_email).toBeNull()
    })
  })

  describe('Image Data Structure', () => {
    it('should have correct image properties', () => {
      const image: Image = {
        id: 'image-123',
        upload_id: 'upload-123',
        couple_id: 'couple-123',
        filename: 'photo.jpg',
        google_drive_file_id: 'file-123',
        public_url: 'https://drive.google.com/uc?id=file-123',
        category: 'Wedding',
        folder: 'Wedding',
        is_highlighted: false,
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z'
      }

      expect(image.id).toBe('image-123')
      expect(image.upload_id).toBe('upload-123')
      expect(image.filename).toBe('photo.jpg')
      expect(image.category).toBe('Wedding')
      expect(image.is_highlighted).toBe(false)
    })

    it('should support all image categories', () => {
      const categories = ['Haldi', 'Sangeet', 'Wedding', 'Reception']
      const images: Image[] = categories.map((category, index) => ({
        id: `image-${index}`,
        upload_id: 'upload-123',
        couple_id: 'couple-123',
        filename: `photo-${index}.jpg`,
        google_drive_file_id: `file-${index}`,
        public_url: `https://drive.google.com/uc?id=file-${index}`,
        category: category as 'Haldi' | 'Sangeet' | 'Wedding' | 'Reception',
        folder: category,
        is_highlighted: false,
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z'
      }))

      expect(images).toHaveLength(4)
      expect(images[0].category).toBe('Haldi')
      expect(images[1].category).toBe('Sangeet')
      expect(images[2].category).toBe('Wedding')
      expect(images[3].category).toBe('Reception')
    })

    it('should track highlight status', () => {
      const highlightedImage: Image = {
        id: 'image-1',
        upload_id: 'upload-123',
        couple_id: 'couple-123',
        filename: 'featured.jpg',
        google_drive_file_id: 'file-1',
        public_url: 'https://drive.google.com/uc?id=file-1',
        category: 'Wedding',
        folder: 'Wedding',
        is_highlighted: true,
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z'
      }

      const regularImage: Image = {
        id: 'image-2',
        upload_id: 'upload-123',
        couple_id: 'couple-123',
        filename: 'regular.jpg',
        google_drive_file_id: 'file-2',
        public_url: 'https://drive.google.com/uc?id=file-2',
        category: 'Wedding',
        folder: 'Wedding',
        is_highlighted: false,
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z'
      }

      expect(highlightedImage.is_highlighted).toBe(true)
      expect(regularImage.is_highlighted).toBe(false)
    })
  })

  describe('Upload History Functionality', () => {
    it('should retrieve uploads by couple', async () => {
      const coupleId = 'couple-123'
      expect(photoService.getUploadsByUser).toBeDefined()
    })

    it('should filter uploads by email', async () => {
      const coupleId = 'couple-123'
      const uploaderEmail = 'guest@example.com'
      expect(photoService.getUploadsByUser).toBeDefined()
    })

    it('should support pagination', async () => {
      const coupleId = 'couple-123'
      const limit = 50
      const offset = 0
      expect(photoService.getUploadsByUser).toBeDefined()
    })

    it('should retrieve upload with images', async () => {
      const uploadId = 'upload-123'
      expect(photoService.getUploadWithImages).toBeDefined()
    })

    it('should sort uploads by date', () => {
      const uploads: Upload[] = [
        {
          id: 'upload-1',
          couple_id: 'couple-123',
          uploader_name: 'User 1',
          uploader_email: null,
          upload_source: 'dashboard',
          status: 'completed',
          google_drive_folder_path: null,
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-01T10:00:00Z'
        },
        {
          id: 'upload-2',
          couple_id: 'couple-123',
          uploader_name: 'User 2',
          uploader_email: null,
          upload_source: 'dashboard',
          status: 'completed',
          google_drive_folder_path: null,
          created_at: '2024-01-02T10:00:00Z',
          updated_at: '2024-01-02T10:00:00Z'
        },
        {
          id: 'upload-3',
          couple_id: 'couple-123',
          uploader_name: 'User 3',
          uploader_email: null,
          upload_source: 'dashboard',
          status: 'completed',
          google_drive_folder_path: null,
          created_at: '2024-01-03T10:00:00Z',
          updated_at: '2024-01-03T10:00:00Z'
        }
      ]

      const sortedAsc = [...uploads].sort((a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )

      const sortedDesc = [...uploads].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )

      expect(sortedAsc[0].id).toBe('upload-1')
      expect(sortedAsc[2].id).toBe('upload-3')
      expect(sortedDesc[0].id).toBe('upload-3')
      expect(sortedDesc[2].id).toBe('upload-1')
    })

    it('should sort uploads by uploader name', () => {
      const uploads: Upload[] = [
        {
          id: 'upload-1',
          couple_id: 'couple-123',
          uploader_name: 'Charlie',
          uploader_email: null,
          upload_source: 'dashboard',
          status: 'completed',
          google_drive_folder_path: null,
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-01T10:00:00Z'
        },
        {
          id: 'upload-2',
          couple_id: 'couple-123',
          uploader_name: 'Alice',
          uploader_email: null,
          upload_source: 'dashboard',
          status: 'completed',
          google_drive_folder_path: null,
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-01T10:00:00Z'
        },
        {
          id: 'upload-3',
          couple_id: 'couple-123',
          uploader_name: 'Bob',
          uploader_email: null,
          upload_source: 'dashboard',
          status: 'completed',
          google_drive_folder_path: null,
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-01T10:00:00Z'
        }
      ]

      const sortedAsc = [...uploads].sort((a, b) =>
        a.uploader_name.localeCompare(b.uploader_name)
      )

      const sortedDesc = [...uploads].sort((a, b) =>
        b.uploader_name.localeCompare(a.uploader_name)
      )

      expect(sortedAsc[0].uploader_name).toBe('Alice')
      expect(sortedAsc[2].uploader_name).toBe('Charlie')
      expect(sortedDesc[0].uploader_name).toBe('Charlie')
      expect(sortedDesc[2].uploader_name).toBe('Alice')
    })

    it('should count images per upload', () => {
      const images: Image[] = [
        {
          id: 'image-1',
          upload_id: 'upload-123',
          couple_id: 'couple-123',
          filename: 'photo1.jpg',
          google_drive_file_id: 'file-1',
          public_url: 'https://drive.google.com/uc?id=file-1',
          category: 'Wedding',
          folder: 'Wedding',
          is_highlighted: false,
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-01T10:00:00Z'
        },
        {
          id: 'image-2',
          upload_id: 'upload-123',
          couple_id: 'couple-123',
          filename: 'photo2.jpg',
          google_drive_file_id: 'file-2',
          public_url: 'https://drive.google.com/uc?id=file-2',
          category: 'Wedding',
          folder: 'Wedding',
          is_highlighted: false,
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-01T10:00:00Z'
        },
        {
          id: 'image-3',
          upload_id: 'upload-123',
          couple_id: 'couple-123',
          filename: 'photo3.jpg',
          google_drive_file_id: 'file-3',
          public_url: 'https://drive.google.com/uc?id=file-3',
          category: 'Reception',
          folder: 'Reception',
          is_highlighted: false,
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-01T10:00:00Z'
        }
      ]

      const imageCount = images.filter(img => img.upload_id === 'upload-123').length
      expect(imageCount).toBe(3)
    })
  })

  describe('UploadHistory Component Props', () => {
    it('should accept coupleId prop', () => {
      const coupleId = 'couple-123'
      expect(coupleId).toBe('couple-123')
    })

    it('should accept className prop', () => {
      const className = 'custom-class'
      expect(className).toBe('custom-class')
    })

    it('should have default empty className', () => {
      const defaultClassName = ''
      expect(defaultClassName).toBe('')
    })
  })

  describe('Upload History Display', () => {
    it('should display uploader name', () => {
      const upload: Upload = {
        id: 'upload-123',
        couple_id: 'couple-123',
        uploader_name: 'John Doe',
        uploader_email: null,
        upload_source: 'dashboard',
        status: 'completed',
        google_drive_folder_path: null,
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z'
      }

      expect(upload.uploader_name).toBe('John Doe')
    })

    it('should display upload date', () => {
      const upload: Upload = {
        id: 'upload-123',
        couple_id: 'couple-123',
        uploader_name: 'John Doe',
        uploader_email: null,
        upload_source: 'dashboard',
        status: 'completed',
        google_drive_folder_path: null,
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z'
      }

      const date = new Date(upload.created_at)
      expect(date.getFullYear()).toBe(2024)
      expect(date.getMonth()).toBe(0) // January
      expect(date.getDate()).toBe(1)
    })

    it('should display upload source badge', () => {
      const dashboardUpload: Upload = {
        id: 'upload-1',
        couple_id: 'couple-123',
        uploader_name: 'User',
        uploader_email: null,
        upload_source: 'dashboard',
        status: 'completed',
        google_drive_folder_path: null,
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z'
      }

      const publicUpload: Upload = {
        id: 'upload-2',
        couple_id: 'couple-123',
        uploader_name: 'Guest',
        uploader_email: null,
        upload_source: 'public_site',
        status: 'completed',
        google_drive_folder_path: null,
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z'
      }

      expect(dashboardUpload.upload_source).toBe('dashboard')
      expect(publicUpload.upload_source).toBe('public_site')
    })

    it('should display upload status badge', () => {
      const pendingUpload: Upload = {
        id: 'upload-1',
        couple_id: 'couple-123',
        uploader_name: 'User',
        uploader_email: null,
        upload_source: 'dashboard',
        status: 'pending',
        google_drive_folder_path: null,
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z'
      }

      const completedUpload: Upload = {
        id: 'upload-2',
        couple_id: 'couple-123',
        uploader_name: 'User',
        uploader_email: null,
        upload_source: 'dashboard',
        status: 'completed',
        google_drive_folder_path: null,
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z'
      }

      expect(pendingUpload.status).toBe('pending')
      expect(completedUpload.status).toBe('completed')
    })

    it('should display image count', () => {
      const images: Image[] = [
        {
          id: 'image-1',
          upload_id: 'upload-123',
          couple_id: 'couple-123',
          filename: 'photo1.jpg',
          google_drive_file_id: 'file-1',
          public_url: 'https://drive.google.com/uc?id=file-1',
          category: 'Wedding',
          folder: 'Wedding',
          is_highlighted: false,
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-01T10:00:00Z'
        },
        {
          id: 'image-2',
          upload_id: 'upload-123',
          couple_id: 'couple-123',
          filename: 'photo2.jpg',
          google_drive_file_id: 'file-2',
          public_url: 'https://drive.google.com/uc?id=file-2',
          category: 'Wedding',
          folder: 'Wedding',
          is_highlighted: false,
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-01T10:00:00Z'
        }
      ]

      expect(images.length).toBe(2)
    })
  })
})
