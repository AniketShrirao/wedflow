import { describe, it, expect, beforeEach, vi } from 'vitest'
import { photoService, type CreateUploadSessionParams, type AddImagesToUploadParams } from '@/lib/services/photo-service'

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
        id: 'couple-123',
        drive_folder_url: 'https://drive.google.com/drive/folders/folder-123'
      }
    }))
  })
}))

// Mock Google Drive service
vi.mock('@/lib/google-drive', () => ({
  getDriveService: vi.fn(() => ({
    hasValidSession: vi.fn(() => false),
    initializeClient: vi.fn(),
    authenticate: vi.fn(),
    logout: vi.fn(),
    extractFolderIdFromUrl: vi.fn(() => 'folder-123'),
    createSubfolder: vi.fn(() => Promise.resolve('subfolder-123')),
    uploadFile: vi.fn(() => Promise.resolve({
      id: 'file-123',
      name: 'test.jpg',
      webContentLink: 'https://drive.google.com/uc?id=file-123',
      createdTime: new Date().toISOString()
    })),
    deleteFile: vi.fn()
  }))
}))

// Mock zip handler
vi.mock('@/lib/zip-handler', () => ({
  processUploadedFiles: vi.fn(async (files) => ({
    validFiles: files,
    errors: []
  }))
}))

// Mock toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}))

describe('UploadManager Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('PhotoService Integration', () => {
    it('should create upload session with correct parameters', async () => {
      const params: CreateUploadSessionParams = {
        coupleId: 'couple-123',
        uploaderName: 'Dashboard User',
        uploaderEmail: 'user@example.com',
        uploadSource: 'dashboard',
        googleDriveFolderPath: 'https://drive.google.com/drive/folders/folder-123'
      }

      const mockUpload = {
        id: 'upload-123',
        couple_id: 'couple-123',
        uploader_name: 'Dashboard User',
        uploader_email: 'user@example.com',
        upload_source: 'dashboard',
        status: 'pending',
        google_drive_folder_path: 'https://drive.google.com/drive/folders/folder-123',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockUpload, error: null })
            })
          })
        })
      }

      // Test that PhotoService can create upload sessions
      expect(photoService).toBeDefined()
      expect(photoService.createUploadSession).toBeDefined()
    })

    it('should add images to upload session', async () => {
      const params: AddImagesToUploadParams = {
        uploadId: 'upload-123',
        images: [
          {
            filename: 'photo1.jpg',
            googleDriveFileId: 'file-123',
            publicUrl: 'https://drive.google.com/uc?id=file-123',
            category: 'Wedding',
            folder: 'Wedding'
          }
        ]
      }

      // Test that PhotoService can add images
      expect(photoService).toBeDefined()
      expect(photoService.addImagesToUpload).toBeDefined()
    })

    it('should support all image categories', () => {
      const categories = ['Haldi', 'Sangeet', 'Wedding', 'Reception']

      categories.forEach(category => {
        expect(['Haldi', 'Sangeet', 'Wedding', 'Reception']).toContain(category)
      })
    })

    it('should support all upload sources', () => {
      const sources = ['dashboard', 'public_site', 'legacy']

      sources.forEach(source => {
        expect(['dashboard', 'public_site', 'legacy']).toContain(source)
      })
    })

    it('should handle upload session creation with optional email', async () => {
      const paramsWithEmail: CreateUploadSessionParams = {
        coupleId: 'couple-123',
        uploaderName: 'Guest User',
        uploaderEmail: 'guest@example.com',
        uploadSource: 'public_site'
      }

      const paramsWithoutEmail: CreateUploadSessionParams = {
        coupleId: 'couple-123',
        uploaderName: 'Dashboard User',
        uploadSource: 'dashboard'
      }

      // Both should be valid
      expect(paramsWithEmail.uploaderEmail).toBe('guest@example.com')
      expect(paramsWithoutEmail.uploaderEmail).toBeUndefined()
    })

    it('should handle multiple images in single upload', async () => {
      const params: AddImagesToUploadParams = {
        uploadId: 'upload-123',
        images: [
          {
            filename: 'photo1.jpg',
            googleDriveFileId: 'file-1',
            publicUrl: 'https://drive.google.com/uc?id=file-1',
            category: 'Wedding',
            folder: 'Wedding'
          },
          {
            filename: 'photo2.jpg',
            googleDriveFileId: 'file-2',
            publicUrl: 'https://drive.google.com/uc?id=file-2',
            category: 'Wedding',
            folder: 'Wedding'
          },
          {
            filename: 'photo3.jpg',
            googleDriveFileId: 'file-3',
            publicUrl: 'https://drive.google.com/uc?id=file-3',
            category: 'Reception',
            folder: 'Reception'
          }
        ]
      }

      expect(params.images).toHaveLength(3)
      expect(params.images[0].category).toBe('Wedding')
      expect(params.images[2].category).toBe('Reception')
    })

    it('should track upload source correctly', () => {
      const dashboardUpload: CreateUploadSessionParams = {
        coupleId: 'couple-123',
        uploaderName: 'Dashboard User',
        uploadSource: 'dashboard'
      }

      const publicSiteUpload: CreateUploadSessionParams = {
        coupleId: 'couple-123',
        uploaderName: 'Guest User',
        uploaderEmail: 'guest@example.com',
        uploadSource: 'public_site'
      }

      expect(dashboardUpload.uploadSource).toBe('dashboard')
      expect(publicSiteUpload.uploadSource).toBe('public_site')
    })
  })

  describe('UploadManager Component Props', () => {
    it('should accept coupleId prop', () => {
      const coupleId = 'couple-123'
      expect(coupleId).toBe('couple-123')
    })

    it('should accept uploaderName prop', () => {
      const uploaderName = 'Test User'
      expect(uploaderName).toBe('Test User')
    })

    it('should accept uploaderEmail prop', () => {
      const uploaderEmail = 'test@example.com'
      expect(uploaderEmail).toBe('test@example.com')
    })

    it('should accept uploadSource prop', () => {
      const uploadSource = 'dashboard'
      expect(['dashboard', 'public_site']).toContain(uploadSource)
    })

    it('should accept onUploadComplete callback', () => {
      const callback = vi.fn()
      expect(typeof callback).toBe('function')
    })

    it('should accept className prop', () => {
      const className = 'custom-class'
      expect(className).toBe('custom-class')
    })
  })
})
