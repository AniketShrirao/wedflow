import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
    initializeCategoryFolders,
    createCustomFolderWithGoogleDrive,
    getOrCreateCategoryFolder,
    handleFolderCreationError
} from '../folder-initialization'
import type { GoogleDriveService } from '@/lib/google-drive'
import type { PhotoService } from '../photo-service'

describe('Folder Initialization', () => {
    let mockDriveService: any
    let mockPhotoService: any

    beforeEach(() => {
        mockDriveService = {
            createCategoryFolders: vi.fn(),
            createCustomFolder: vi.fn()
        }

        mockPhotoService = {
            getDefaultFolders: vi.fn(),
            initializeDefaultFolders: vi.fn(),
            updateFolderGoogleDriveIds: vi.fn(),
            getFolderByName: vi.fn(),
            createCustomFolder: vi.fn()
        }
    })

    describe('initializeCategoryFolders', () => {
        it('should create category folders on first initialization', async () => {
            const mockFolders = [
                {
                    id: 'folder-1',
                    couple_id: 'couple-123',
                    folder_name: 'Haldi',
                    folder_type: 'default' as const,
                    google_drive_folder_id: 'drive-1',
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z'
                }
            ]

            const googleDriveFolderIds = {
                'Haldi': 'drive-1',
                'Sangeet': 'drive-2',
                'Wedding': 'drive-3',
                'Reception': 'drive-4'
            }

            mockPhotoService.getDefaultFolders.mockResolvedValue([])
            mockDriveService.createCategoryFolders.mockResolvedValue(googleDriveFolderIds)
            mockPhotoService.initializeDefaultFolders.mockResolvedValue(mockFolders)
            mockPhotoService.updateFolderGoogleDriveIds.mockResolvedValue(undefined)

            const result = await initializeCategoryFolders(
                'couple-123',
                'main-folder-id',
                mockDriveService as GoogleDriveService,
                mockPhotoService as PhotoService
            )

            expect(result.folders).toBeDefined()
            expect(result.googleDriveFolderIds).toEqual(googleDriveFolderIds)
            expect(mockDriveService.createCategoryFolders).toHaveBeenCalledWith('main-folder-id')
            expect(mockPhotoService.updateFolderGoogleDriveIds).toHaveBeenCalledWith('couple-123', googleDriveFolderIds)
        })

        it('should return existing folders if already initialized', async () => {
            const existingFolders = [
                {
                    id: 'folder-1',
                    couple_id: 'couple-123',
                    folder_name: 'Haldi',
                    folder_type: 'default' as const,
                    google_drive_folder_id: 'drive-1',
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z'
                },
                {
                    id: 'folder-2',
                    couple_id: 'couple-123',
                    folder_name: 'Sangeet',
                    folder_type: 'default' as const,
                    google_drive_folder_id: 'drive-2',
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z'
                },
                {
                    id: 'folder-3',
                    couple_id: 'couple-123',
                    folder_name: 'Wedding',
                    folder_type: 'default' as const,
                    google_drive_folder_id: 'drive-3',
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z'
                },
                {
                    id: 'folder-4',
                    couple_id: 'couple-123',
                    folder_name: 'Reception',
                    folder_type: 'default' as const,
                    google_drive_folder_id: 'drive-4',
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z'
                }
            ]

            mockPhotoService.getDefaultFolders.mockResolvedValue(existingFolders)

            const result = await initializeCategoryFolders(
                'couple-123',
                'main-folder-id',
                mockDriveService as GoogleDriveService,
                mockPhotoService as PhotoService
            )

            expect(result.folders).toEqual(existingFolders)
            expect(mockDriveService.createCategoryFolders).not.toHaveBeenCalled()
        })

        it('should throw error if folder creation fails', async () => {
            mockPhotoService.getDefaultFolders.mockResolvedValue([])
            mockDriveService.createCategoryFolders.mockRejectedValue(
                new Error('Google Drive API error')
            )

            await expect(
                initializeCategoryFolders(
                    'couple-123',
                    'main-folder-id',
                    mockDriveService as GoogleDriveService,
                    mockPhotoService as PhotoService
                )
            ).rejects.toThrow('Failed to initialize category folders')
        })
    })

    describe('createCustomFolderWithGoogleDrive', () => {
        it('should create a custom folder in both Google Drive and database', async () => {
            const mockFolder = {
                id: 'folder-1',
                couple_id: 'couple-123',
                folder_name: 'Engagement',
                folder_type: 'custom' as const,
                google_drive_folder_id: 'drive-1',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z'
            }

            mockPhotoService.getFolderByName.mockResolvedValue(null)
            mockDriveService.createCustomFolder.mockResolvedValue('drive-1')
            mockPhotoService.createCustomFolder.mockResolvedValue(mockFolder)

            const result = await createCustomFolderWithGoogleDrive(
                'couple-123',
                'Engagement',
                'main-folder-id',
                mockDriveService as GoogleDriveService,
                mockPhotoService as PhotoService
            )

            expect(result.folder).toEqual(mockFolder)
            expect(result.googleDriveFolderId).toBe('drive-1')
            expect(mockDriveService.createCustomFolder).toHaveBeenCalledWith('main-folder-id', 'Engagement')
            expect(mockPhotoService.createCustomFolder).toHaveBeenCalledWith({
                coupleId: 'couple-123',
                folderName: 'Engagement',
                googleDriveFolderId: 'drive-1'
            })
        })

        it('should return existing folder if it already exists', async () => {
            const existingFolder = {
                id: 'folder-1',
                couple_id: 'couple-123',
                folder_name: 'Engagement',
                folder_type: 'custom' as const,
                google_drive_folder_id: 'drive-1',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z'
            }

            mockPhotoService.getFolderByName.mockResolvedValue(existingFolder)

            const result = await createCustomFolderWithGoogleDrive(
                'couple-123',
                'Engagement',
                'main-folder-id',
                mockDriveService as GoogleDriveService,
                mockPhotoService as PhotoService
            )

            expect(result.folder).toEqual(existingFolder)
            expect(mockDriveService.createCustomFolder).not.toHaveBeenCalled()
        })

        it('should throw error if folder creation fails', async () => {
            mockPhotoService.getFolderByName.mockResolvedValue(null)
            mockDriveService.createCustomFolder.mockRejectedValue(
                new Error('Google Drive API error')
            )

            await expect(
                createCustomFolderWithGoogleDrive(
                    'couple-123',
                    'Engagement',
                    'main-folder-id',
                    mockDriveService as GoogleDriveService,
                    mockPhotoService as PhotoService
                )
            ).rejects.toThrow('Failed to create custom folder')
        })
    })

    describe('getOrCreateCategoryFolder', () => {
        it('should return existing folder ID if folder exists', async () => {
            const existingFolder = {
                id: 'folder-1',
                couple_id: 'couple-123',
                folder_name: 'Wedding',
                folder_type: 'default' as const,
                google_drive_folder_id: 'drive-1',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z'
            }

            mockPhotoService.getFolderByName.mockResolvedValue(existingFolder)

            const result = await getOrCreateCategoryFolder(
                'couple-123',
                'Wedding',
                'main-folder-id',
                mockDriveService as GoogleDriveService,
                mockPhotoService as PhotoService
            )

            expect(result).toBe('drive-1')
            expect(mockDriveService.createCustomFolder).not.toHaveBeenCalled()
        })

        it('should create folder if it does not exist', async () => {
            mockPhotoService.getFolderByName.mockResolvedValue(null)
            mockDriveService.createCustomFolder.mockResolvedValue('drive-1')
            mockPhotoService.createCustomFolder.mockResolvedValue({
                id: 'folder-1',
                couple_id: 'couple-123',
                folder_name: 'Wedding',
                folder_type: 'default' as const,
                google_drive_folder_id: 'drive-1',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z'
            })

            const result = await getOrCreateCategoryFolder(
                'couple-123',
                'Wedding',
                'main-folder-id',
                mockDriveService as GoogleDriveService,
                mockPhotoService as PhotoService
            )

            expect(result).toBe('drive-1')
            expect(mockDriveService.createCustomFolder).toHaveBeenCalledWith('main-folder-id', 'Wedding')
        })

        it('should update folder with Google Drive ID if folder exists but has no ID', async () => {
            const folderWithoutId = {
                id: 'folder-1',
                couple_id: 'couple-123',
                folder_name: 'Wedding',
                folder_type: 'default' as const,
                google_drive_folder_id: null,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z'
            }

            mockPhotoService.getFolderByName.mockResolvedValue(folderWithoutId)
            mockDriveService.createCustomFolder.mockResolvedValue('drive-1')
            mockPhotoService.updateFolderGoogleDriveIds.mockResolvedValue(undefined)

            const result = await getOrCreateCategoryFolder(
                'couple-123',
                'Wedding',
                'main-folder-id',
                mockDriveService as GoogleDriveService,
                mockPhotoService as PhotoService
            )

            expect(result).toBe('drive-1')
            expect(mockPhotoService.updateFolderGoogleDriveIds).toHaveBeenCalledWith('couple-123', { 'Wedding': 'drive-1' })
        })
    })

    describe('handleFolderCreationError', () => {
        it('should log error message', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })
            const error = new Error('Test error')

            handleFolderCreationError(error, 'test-context')

            expect(consoleSpy).toHaveBeenCalledWith('Folder creation error in test-context:', 'Test error')
            consoleSpy.mockRestore()
        })

        it('should handle non-Error objects', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

            handleFolderCreationError('String error', 'test-context')

            expect(consoleSpy).toHaveBeenCalledWith('Folder creation error in test-context:', 'String error')
            consoleSpy.mockRestore()
        })
    })
})
