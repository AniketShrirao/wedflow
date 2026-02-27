import { GoogleDriveService } from '@/lib/google-drive'
import { PhotoService } from '@/lib/services/photo-service'
import type { Folder } from '@/lib/types/database'

/**
 * Initialize category folders for a couple on first upload
 * Creates Haldi, Sangeet, Wedding, and Reception folders in both database and Google Drive
 */
export async function initializeCategoryFolders(
    coupleId: string,
    mainGoogleDriveFolderId: string,
    driveService: GoogleDriveService,
    photoService: PhotoService
): Promise<{ folders: Folder[]; googleDriveFolderIds: Record<string, string> }> {
    try {
        // Check if default folders already exist in database
        const existingFolders = await photoService.getDefaultFolders(coupleId)

        if (existingFolders.length === 4) {
            // All default folders already exist
            console.log('Default folders already initialized for couple:', coupleId)
            return {
                folders: existingFolders,
                googleDriveFolderIds: existingFolders.reduce((acc, folder) => {
                    if (folder.google_drive_folder_id) {
                        acc[folder.folder_name] = folder.google_drive_folder_id
                    }
                    return acc
                }, {} as Record<string, string>)
            }
        }

        // Create category folders in Google Drive
        console.log('Creating category folders in Google Drive for couple:', coupleId)
        const googleDriveFolderIds = await driveService.createCategoryFolders(mainGoogleDriveFolderId)

        // Initialize default folders in database
        console.log('Initializing default folders in database for couple:', coupleId)
        const createdFolders = await photoService.initializeDefaultFolders(coupleId)

        // Update folder records with Google Drive folder IDs
        console.log('Updating folder records with Google Drive IDs for couple:', coupleId)
        await photoService.updateFolderGoogleDriveIds(coupleId, googleDriveFolderIds)

        return {
            folders: createdFolders,
            googleDriveFolderIds
        }
    } catch (error) {
        console.error('Error initializing category folders:', error)
        throw new Error(`Failed to initialize category folders: ${error instanceof Error ? error.message : String(error)}`)
    }
}

/**
 * Create a custom folder for a couple
 * Creates folder in both database and Google Drive
 */
export async function createCustomFolderWithGoogleDrive(
    coupleId: string,
    folderName: string,
    mainGoogleDriveFolderId: string,
    driveService: GoogleDriveService,
    photoService: PhotoService
): Promise<{ folder: Folder; googleDriveFolderId: string }> {
    try {
        // Check if folder already exists
        const existingFolder = await photoService.getFolderByName(coupleId, folderName)
        if (existingFolder) {
            console.log(`Folder "${folderName}" already exists for couple:`, coupleId)
            return {
                folder: existingFolder,
                googleDriveFolderId: existingFolder.google_drive_folder_id || ''
            }
        }

        // Create folder in Google Drive
        console.log(`Creating custom folder "${folderName}" in Google Drive for couple:`, coupleId)
        const googleDriveFolderId = await driveService.createCustomFolder(mainGoogleDriveFolderId, folderName)

        // Create folder in database
        console.log(`Creating custom folder "${folderName}" in database for couple:`, coupleId)
        const folder = await photoService.createCustomFolder({
            coupleId,
            folderName,
            googleDriveFolderId
        })

        return {
            folder,
            googleDriveFolderId
        }
    } catch (error) {
        console.error(`Error creating custom folder "${folderName}":`, error)
        throw new Error(`Failed to create custom folder: ${error instanceof Error ? error.message : String(error)}`)
    }
}

/**
 * Get or create category folder for uploading
 * Ensures the category folder exists in Google Drive before upload
 */
export async function getOrCreateCategoryFolder(
    coupleId: string,
    category: string,
    mainGoogleDriveFolderId: string,
    driveService: GoogleDriveService,
    photoService: PhotoService
): Promise<string> {
    try {
        // Check if folder exists in database
        const folder = await photoService.getFolderByName(coupleId, category)

        if (folder && folder.google_drive_folder_id) {
            // Folder exists with Google Drive ID
            return folder.google_drive_folder_id
        }

        // Folder doesn't exist or doesn't have Google Drive ID, create it
        const googleDriveFolderId = await driveService.createCustomFolder(mainGoogleDriveFolderId, category)

        if (folder) {
            // Update existing folder with Google Drive ID
            await photoService.updateFolderGoogleDriveIds(coupleId, { [category]: googleDriveFolderId })
        } else {
            // Create new folder in database
            await photoService.createCustomFolder({
                coupleId,
                folderName: category,
                googleDriveFolderId
            })
        }

        return googleDriveFolderId
    } catch (error) {
        console.error(`Error getting or creating category folder "${category}":`, error)
        throw new Error(`Failed to get or create category folder: ${error instanceof Error ? error.message : String(error)}`)
    }
}

/**
 * Handle folder creation errors gracefully
 * Logs errors and provides fallback behavior
 */
export function handleFolderCreationError(error: unknown, context: string): void {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`Folder creation error in ${context}:`, errorMessage)

    // Log detailed error information for debugging
    if (error instanceof Error) {
        console.error('Error stack:', error.stack)
    }

    // In production, you might want to send this to an error tracking service
    // Example: Sentry.captureException(error, { tags: { context } })
}
