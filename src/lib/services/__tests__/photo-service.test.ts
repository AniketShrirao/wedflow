import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PhotoService, type CreateUploadSessionParams, type AddImagesToUploadParams } from '../photo-service'

// Mock the Supabase client
vi.mock('@/lib/supabase/client', () => ({
    createClient: () => ({
        from: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        single: vi.fn()
    })
}))

describe('PhotoService', () => {
    let photoService: PhotoService
    let mockSupabase: any

    beforeEach(() => {
        photoService = new PhotoService()
        mockSupabase = photoService['supabase']
    })

    describe('createUploadSession', () => {
        it('should create an upload session with required parameters', async () => {
            const params: CreateUploadSessionParams = {
                coupleId: 'couple-123',
                uploaderName: 'John Doe',
                uploadSource: 'dashboard'
            }

            const mockUpload = {
                id: 'upload-123',
                couple_id: 'couple-123',
                uploader_name: 'John Doe',
                uploader_email: null,
                upload_source: 'dashboard',
                status: 'pending',
                google_drive_folder_path: null,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z'
            }

            mockSupabase.from.mockReturnValue({
                insert: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({ data: mockUpload, error: null })
                    })
                })
            })

            const result = await photoService.createUploadSession(params)

            expect(result).toEqual(mockUpload)
            expect(mockSupabase.from).toHaveBeenCalledWith('uploads')
        })

        it('should include optional email parameter when provided', async () => {
            const params: CreateUploadSessionParams = {
                coupleId: 'couple-123',
                uploaderName: 'Jane Doe',
                uploaderEmail: 'jane@example.com',
                uploadSource: 'public_site'
            }

            const mockUpload = {
                id: 'upload-456',
                couple_id: 'couple-123',
                uploader_name: 'Jane Doe',
                uploader_email: 'jane@example.com',
                upload_source: 'public_site',
                status: 'pending',
                google_drive_folder_path: null,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z'
            }

            mockSupabase.from.mockReturnValue({
                insert: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({ data: mockUpload, error: null })
                    })
                })
            })

            const result = await photoService.createUploadSession(params)

            expect(result.uploader_email).toBe('jane@example.com')
        })

        it('should throw error when upload creation fails', async () => {
            const params: CreateUploadSessionParams = {
                coupleId: 'couple-123',
                uploaderName: 'John Doe',
                uploadSource: 'dashboard'
            }

            mockSupabase.from.mockReturnValue({
                insert: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } })
                    })
                })
            })

            await expect(photoService.createUploadSession(params)).rejects.toThrow('Failed to create upload session')
        })
    })

    describe('addImagesToUpload', () => {
        it('should add images to an upload session', async () => {
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

            const mockUpload = {
                couple_id: 'couple-123'
            }

            const mockImages = [
                {
                    id: 'image-123',
                    upload_id: 'upload-123',
                    couple_id: 'couple-123',
                    filename: 'photo1.jpg',
                    google_drive_file_id: 'file-123',
                    public_url: 'https://drive.google.com/uc?id=file-123',
                    category: 'Wedding',
                    folder: 'Wedding',
                    is_highlighted: false,
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z'
                }
            ]

            mockSupabase.from.mockImplementation((table: string) => {
                if (table === 'uploads') {
                    return {
                        select: vi.fn().mockReturnValue({
                            eq: vi.fn().mockReturnValue({
                                single: vi.fn().mockResolvedValue({ data: mockUpload, error: null })
                            })
                        }),
                        update: vi.fn().mockReturnValue({
                            eq: vi.fn().mockResolvedValue({ error: null })
                        })
                    }
                }
                if (table === 'images') {
                    return {
                        insert: vi.fn().mockReturnValue({
                            select: vi.fn().mockResolvedValue({ data: mockImages, error: null })
                        })
                    }
                }
            })

            const result = await photoService.addImagesToUpload(params)

            expect(result).toEqual(mockImages)
        })
    })

    describe('updateImageMetadata', () => {
        it('should update image category', async () => {
            const mockImage = {
                id: 'image-123',
                upload_id: 'upload-123',
                couple_id: 'couple-123',
                filename: 'photo1.jpg',
                google_drive_file_id: 'file-123',
                public_url: 'https://drive.google.com/uc?id=file-123',
                category: 'Haldi',
                folder: 'Wedding',
                is_highlighted: false,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z'
            }

            mockSupabase.from.mockReturnValue({
                update: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        select: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: mockImage, error: null })
                        })
                    })
                })
            })

            const result = await photoService.updateImageMetadata({
                imageId: 'image-123',
                category: 'Haldi'
            })

            expect(result.category).toBe('Haldi')
        })

        it('should update highlight status', async () => {
            const mockImage = {
                id: 'image-123',
                upload_id: 'upload-123',
                couple_id: 'couple-123',
                filename: 'photo1.jpg',
                google_drive_file_id: 'file-123',
                public_url: 'https://drive.google.com/uc?id=file-123',
                category: 'Wedding',
                folder: 'Wedding',
                is_highlighted: true,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z'
            }

            mockSupabase.from.mockReturnValue({
                update: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        select: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: mockImage, error: null })
                        })
                    })
                })
            })

            const result = await photoService.updateImageMetadata({
                imageId: 'image-123',
                isHighlighted: true
            })

            expect(result.is_highlighted).toBe(true)
        })
    })

    describe('getHighlightedImages', () => {
        it('should retrieve highlighted images for a couple', async () => {
            const mockImages = [
                {
                    id: 'image-123',
                    upload_id: 'upload-123',
                    couple_id: 'couple-123',
                    filename: 'photo1.jpg',
                    google_drive_file_id: 'file-123',
                    public_url: 'https://drive.google.com/uc?id=file-123',
                    category: 'Wedding',
                    folder: 'Wedding',
                    is_highlighted: true,
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z'
                }
            ]

            mockSupabase.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnThis(),
                    order: vi.fn().mockResolvedValue({ data: mockImages, error: null })
                })
            })

            const result = await photoService.getHighlightedImages({ coupleId: 'couple-123' })

            expect(result).toEqual(mockImages)
        })

        it('should filter highlighted images by category', async () => {
            const mockImages = [
                {
                    id: 'image-123',
                    upload_id: 'upload-123',
                    couple_id: 'couple-123',
                    filename: 'photo1.jpg',
                    google_drive_file_id: 'file-123',
                    public_url: 'https://drive.google.com/uc?id=file-123',
                    category: 'Haldi',
                    folder: 'Haldi',
                    is_highlighted: true,
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z'
                }
            ]

            mockSupabase.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnThis(),
                    order: vi.fn().mockResolvedValue({ data: mockImages, error: null })
                })
            })

            const result = await photoService.getHighlightedImages({
                coupleId: 'couple-123',
                category: 'Haldi'
            })

            expect(result).toEqual(mockImages)
        })
    })

    describe('getUploadsByUser', () => {
        it('should retrieve uploads for a couple', async () => {
            const mockUploads = [
                {
                    id: 'upload-123',
                    couple_id: 'couple-123',
                    uploader_name: 'John Doe',
                    uploader_email: 'john@example.com',
                    upload_source: 'dashboard',
                    status: 'completed',
                    google_drive_folder_path: '/Wedding/2024',
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z'
                }
            ]

            mockSupabase.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnThis(),
                    order: vi.fn().mockReturnValue({
                        range: vi.fn().mockResolvedValue({ data: mockUploads, error: null })
                    })
                })
            })

            const result = await photoService.getUploadsByUser({ coupleId: 'couple-123' })

            expect(result).toEqual(mockUploads)
        })

        it('should filter uploads by uploader email', async () => {
            const mockUploads = [
                {
                    id: 'upload-123',
                    couple_id: 'couple-123',
                    uploader_name: 'Jane Doe',
                    uploader_email: 'jane@example.com',
                    upload_source: 'public_site',
                    status: 'completed',
                    google_drive_folder_path: '/Wedding/2024',
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z'
                }
            ]

            mockSupabase.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnThis(),
                    order: vi.fn().mockReturnValue({
                        range: vi.fn().mockResolvedValue({ data: mockUploads, error: null })
                    })
                })
            })

            const result = await photoService.getUploadsByUser({
                coupleId: 'couple-123',
                uploaderEmail: 'jane@example.com'
            })

            expect(result).toEqual(mockUploads)
        })
    })

    describe('createCustomCategory', () => {
        it('should create a custom category', async () => {
            const mockCategory = {
                id: 'category-123',
                couple_id: 'couple-123',
                category_name: 'Engagement',
                category_type: 'custom',
                google_drive_folder_id: 'drive-folder-123',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z'
            }

            mockSupabase.from.mockReturnValue({
                insert: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({ data: mockCategory, error: null })
                    })
                })
            })

            const result = await photoService.createCustomCategory({
                coupleId: 'couple-123',
                categoryName: 'Engagement',
                googleDriveFolderId: 'drive-folder-123'
            })

            expect(result).toEqual(mockCategory)
            expect(result.category_type).toBe('custom')
        })
    })

    describe('getAvailableCategories', () => {
        it('should retrieve all available categories for a couple', async () => {
            const mockCategories = [
                {
                    id: 'category-1',
                    couple_id: 'couple-123',
                    category_name: 'Haldi',
                    category_type: 'default',
                    google_drive_folder_id: 'drive-folder-1',
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z'
                },
                {
                    id: 'category-2',
                    couple_id: 'couple-123',
                    category_name: 'Engagement',
                    category_type: 'custom',
                    google_drive_folder_id: 'drive-folder-2',
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z'
                }
            ]

            mockSupabase.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        order: vi.fn().mockReturnValue({
                            order: vi.fn().mockResolvedValue({ data: mockCategories, error: null })
                        })
                    })
                })
            })

            const result = await photoService.getAvailableCategories('couple-123')

            expect(result).toEqual(mockCategories)
            expect(result.length).toBe(2)
        })
    })

    describe('markImagesAsHighlighted', () => {
        it('should mark multiple images as highlighted', async () => {
            mockSupabase.from.mockReturnValue({
                update: vi.fn().mockReturnValue({
                    in: vi.fn().mockResolvedValue({ error: null })
                })
            })

            await photoService.markImagesAsHighlighted(['image-1', 'image-2'], true)

            expect(mockSupabase.from).toHaveBeenCalledWith('images')
        })

        it('should unmark images as highlighted', async () => {
            mockSupabase.from.mockReturnValue({
                update: vi.fn().mockReturnValue({
                    in: vi.fn().mockResolvedValue({ error: null })
                })
            })

            await photoService.markImagesAsHighlighted(['image-1', 'image-2'], false)

            expect(mockSupabase.from).toHaveBeenCalledWith('images')
        })
    })

    describe('deleteImage', () => {
        it('should delete an image', async () => {
            mockSupabase.from.mockReturnValue({
                delete: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({ error: null })
                })
            })

            await photoService.deleteImage('image-123')

            expect(mockSupabase.from).toHaveBeenCalledWith('images')
        })

        it('should throw error when deletion fails', async () => {
            mockSupabase.from.mockReturnValue({
                delete: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } })
                })
            })

            await expect(photoService.deleteImage('image-123')).rejects.toThrow('Failed to delete image')
        })
    })

    describe('deleteCustomCategory', () => {
        it('should delete a custom category', async () => {
            mockSupabase.from.mockReturnValue({
                delete: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnThis(),
                    mockResolvedValue: vi.fn().mockResolvedValue({ error: null })
                })
            })

            // Mock the chained calls properly
            const mockDelete = {
                eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({ error: null })
                })
            }

            mockSupabase.from.mockReturnValue({
                delete: vi.fn().mockReturnValue(mockDelete)
            })

            await photoService.deleteCustomCategory('category-123')

            expect(mockSupabase.from).toHaveBeenCalledWith('categories')
        })
    })

    describe('initializeDefaultCategories', () => {
        it('should create default categories if they do not exist', async () => {
            const mockCategories = [
                {
                    id: 'category-1',
                    couple_id: 'couple-123',
                    category_name: 'Haldi',
                    category_type: 'default',
                    google_drive_folder_id: null,
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z'
                }
            ]

            mockSupabase.from.mockImplementation((table: string) => {
                if (table === 'categories') {
                    return {
                        select: vi.fn().mockReturnValue({
                            eq: vi.fn().mockReturnValue({
                                order: vi.fn().mockReturnValue({
                                    order: vi.fn().mockResolvedValue({ data: mockCategories, error: null })
                                })
                            })
                        }),
                        insert: vi.fn().mockReturnValue({
                            select: vi.fn().mockReturnValue({
                                single: vi.fn().mockResolvedValue({ data: mockCategories[0], error: null })
                            })
                        })
                    }
                }
            })

            const result = await photoService.initializeDefaultCategories('couple-123')

            expect(result).toBeDefined()
        })
    })

    describe('updateCategoryGoogleDriveIds', () => {
        it('should update category Google Drive IDs', async () => {
            mockSupabase.from.mockReturnValue({
                update: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnThis(),
                    mockResolvedValue: vi.fn().mockResolvedValue({ error: null })
                })
            })

            const mockUpdate = {
                eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({ error: null })
                })
            }

            mockSupabase.from.mockReturnValue({
                update: vi.fn().mockReturnValue(mockUpdate)
            })

            const categoryMapping = {
                'Haldi': 'drive-folder-1',
                'Wedding': 'drive-folder-2'
            }

            await photoService.updateCategoryGoogleDriveIds('couple-123', categoryMapping)

            expect(mockSupabase.from).toHaveBeenCalledWith('categories')
        })
    })

    describe('getCategoryByName', () => {
        it('should retrieve a category by name', async () => {
            const mockCategory = {
                id: 'category-1',
                couple_id: 'couple-123',
                category_name: 'Haldi',
                category_type: 'default',
                google_drive_folder_id: 'drive-folder-1',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z'
            }

            mockSupabase.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnThis(),
                    single: vi.fn().mockResolvedValue({ data: mockCategory, error: null })
                })
            })

            const result = await photoService.getCategoryByName('couple-123', 'Haldi')

            expect(result).toEqual(mockCategory)
        })

        it('should return null if category not found', async () => {
            mockSupabase.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnThis(),
                    single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
                })
            })

            const result = await photoService.getCategoryByName('couple-123', 'NonExistent')

            expect(result).toBeNull()
        })
    })

    describe('getDefaultCategories', () => {
        it('should retrieve all default categories for a couple', async () => {
            const mockCategories = [
                {
                    id: 'category-1',
                    couple_id: 'couple-123',
                    category_name: 'Haldi',
                    category_type: 'default',
                    google_drive_folder_id: 'drive-folder-1',
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z'
                },
                {
                    id: 'category-2',
                    couple_id: 'couple-123',
                    category_name: 'Wedding',
                    category_type: 'default',
                    google_drive_folder_id: 'drive-folder-2',
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z'
                }
            ]

            mockSupabase.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnThis(),
                    order: vi.fn().mockResolvedValue({ data: mockCategories, error: null })
                })
            })

            const result = await photoService.getDefaultCategories('couple-123')

            expect(result).toEqual(mockCategories)
            expect(result.length).toBe(2)
        })
    })

    describe('getCustomCategories', () => {
        it('should retrieve all custom categories for a couple', async () => {
            const mockCategories = [
                {
                    id: 'category-1',
                    couple_id: 'couple-123',
                    category_name: 'Engagement',
                    category_type: 'custom',
                    google_drive_folder_id: 'drive-folder-1',
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z'
                }
            ]

            mockSupabase.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnThis(),
                    order: vi.fn().mockResolvedValue({ data: mockCategories, error: null })
                })
            })

            const result = await photoService.getCustomCategories('couple-123')

            expect(result).toEqual(mockCategories)
        })
    })
})
