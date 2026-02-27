import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database'

export type PhotoCollection = Database['public']['Tables']['photo_collections']['Row']
export type Upload = Database['public']['Tables']['uploads']['Row']
export type Image = Database['public']['Tables']['images']['Row']

export interface MigrationStats {
    coupleId: string
    photoCollectionCount: number
    legacyPhotoCount: number
    migratedImageCount: number
    uploadSessionCount: number
    highlightedImageCount: number
}

export interface MigrationResult {
    success: boolean
    totalCouples: number
    totalLegacyPhotos: number
    totalMigratedImages: number
    totalUploadSessions: number
    stats: MigrationStats[]
    errors: string[]
}

export class PhotoMigrationService {
    private supabase = createClient()

    /**
     * Get all photo collections with legacy data
     */
    async getLegacyPhotoCollections(): Promise<PhotoCollection[]> {
        const { data, error } = await this.supabase
            .from('photo_collections')
            .select('*')
            .not('categories', 'is', null)

        if (error) {
            throw new Error(`Failed to fetch photo collections: ${error.message}`)
        }

        return data || []
    }

    /**
     * Count photos in a JSONB categories array
     */
    private countPhotosInCategories(categories: any): number {
        if (!categories || !Array.isArray(categories)) {
            return 0
        }
        return categories.length
    }

    /**
     * Extract photos from JSONB categories
     */
    private extractPhotosFromCategories(categories: any): Array<{
        filename: string
        googleDriveFileId?: string
        publicUrl?: string
        category: string
        folder: string
        isHighlighted: boolean
        createdAt?: string
        updatedAt?: string
    }> {
        if (!categories || !Array.isArray(categories)) {
            return []
        }

        return categories.map((photo: any) => ({
            filename: photo.filename || `photo_${Math.random().toString(36).substr(2, 9)}`,
            googleDriveFileId: photo.google_drive_file_id,
            publicUrl: photo.public_url,
            category: photo.category || 'Wedding',
            folder: photo.folder || photo.category || 'Wedding',
            isHighlighted: photo.is_highlighted || false,
            createdAt: photo.created_at,
            updatedAt: photo.updated_at
        }))
    }

    /**
     * Create an upload session for legacy photos
     */
    async createLegacyUploadSession(
        coupleId: string,
        googleDriveFolderPath?: string
    ): Promise<Upload> {
        const { data, error } = await this.supabase
            .from('uploads')
            .insert({
                couple_id: coupleId,
                uploader_name: 'Legacy Import',
                uploader_email: null,
                upload_source: 'legacy',
                status: 'completed',
                google_drive_folder_path: googleDriveFolderPath
            })
            .select()
            .single()

        if (error) {
            throw new Error(`Failed to create legacy upload session: ${error.message}`)
        }

        return data
    }

    /**
     * Migrate photos from a photo collection to images table
     */
    async migratePhotoCollection(photoCollection: PhotoCollection): Promise<Image[]> {
        const { couple_id, categories, drive_folder_url, updated_at } = photoCollection

        // Check if upload session already exists for this couple
        const { data: existingUploads } = await this.supabase
            .from('uploads')
            .select('id')
            .eq('couple_id', couple_id)
            .eq('upload_source', 'legacy')
            .limit(1)

        let uploadId: string

        if (existingUploads && existingUploads.length > 0) {
            uploadId = existingUploads[0].id
        } else {
            // Create new upload session
            const uploadSession = await this.createLegacyUploadSession(couple_id, drive_folder_url)
            uploadId = uploadSession.id
        }

        // Extract photos from categories
        const photos = this.extractPhotosFromCategories(categories)

        if (photos.length === 0) {
            return []
        }

        // Insert images
        const imagesToInsert = photos.map(photo => ({
            upload_id: uploadId,
            couple_id,
            filename: photo.filename,
            google_drive_file_id: photo.googleDriveFileId,
            public_url: photo.publicUrl,
            category: photo.category as 'Haldi' | 'Sangeet' | 'Wedding' | 'Reception',
            folder: photo.folder,
            is_highlighted: photo.isHighlighted,
            created_at: photo.createdAt || updated_at,
            updated_at: photo.updatedAt || updated_at
        }))

        const { data: insertedImages, error } = await this.supabase
            .from('images')
            .insert(imagesToInsert)
            .select()

        if (error) {
            throw new Error(`Failed to insert images: ${error.message}`)
        }

        return insertedImages || []
    }

    /**
     * Initialize default folders for a couple
     */
    async initializeDefaultFolders(coupleId: string): Promise<void> {
        const defaultCategories = ['Haldi', 'Sangeet', 'Wedding', 'Reception']

        // Check which folders already exist
        const { data: existingFolders } = await this.supabase
            .from('folders')
            .select('folder_name')
            .eq('couple_id', coupleId)

        const existingNames = (existingFolders || []).map(f => f.folder_name)
        const foldersToCreate = defaultCategories.filter(cat => !existingNames.includes(cat))

        if (foldersToCreate.length === 0) {
            return
        }

        const foldersData = foldersToCreate.map(folderName => ({
            couple_id: coupleId,
            folder_name: folderName,
            folder_type: 'default' as const,
            google_drive_folder_id: null
        }))

        const { error } = await this.supabase
            .from('folders')
            .insert(foldersData)

        if (error) {
            console.error(`Failed to create default folders for couple ${coupleId}:`, error)
        }
    }

    /**
     * Get migration statistics for a couple
     */
    async getMigrationStats(coupleId: string): Promise<MigrationStats | null> {
        // Get photo collection info
        const { data: photoCollection } = await this.supabase
            .from('photo_collections')
            .select('categories')
            .eq('couple_id', coupleId)
            .single()

        if (!photoCollection) {
            return null
        }

        const legacyPhotoCount = this.countPhotosInCategories(photoCollection.categories)

        // Get upload sessions
        const { data: uploads } = await this.supabase
            .from('uploads')
            .select('id')
            .eq('couple_id', coupleId)
            .eq('upload_source', 'legacy')

        const uploadSessionCount = uploads?.length || 0

        // Get migrated images
        const { data: images } = await this.supabase
            .from('images')
            .select('id, is_highlighted')
            .eq('couple_id', coupleId)
            .in('upload_id', uploads?.map(u => u.id) || [])

        const migratedImageCount = images?.length || 0
        const highlightedImageCount = images?.filter(i => i.is_highlighted).length || 0

        return {
            coupleId,
            photoCollectionCount: 1,
            legacyPhotoCount,
            migratedImageCount,
            uploadSessionCount,
            highlightedImageCount
        }
    }

    /**
     * Verify migration integrity for a couple
     */
    async verifyMigrationIntegrity(coupleId: string): Promise<{
        isValid: boolean
        issues: string[]
    }> {
        const issues: string[] = []

        // Check if all legacy photos were migrated
        const stats = await this.getMigrationStats(coupleId)
        if (!stats) {
            return { isValid: false, issues: ['No photo collection found'] }
        }

        if (stats.legacyPhotoCount !== stats.migratedImageCount) {
            issues.push(
                `Photo count mismatch: ${stats.legacyPhotoCount} legacy photos but ${stats.migratedImageCount} migrated images`
            )
        }

        // Check for orphaned images (images without valid upload_id)
        const { data: orphanedImages } = await this.supabase
            .from('images')
            .select('id')
            .eq('couple_id', coupleId)
            .not('upload_id', 'is', null)

        // Verify all images have valid upload references
        if (orphanedImages && orphanedImages.length > 0) {
            const { data: validImages } = await this.supabase
                .from('images')
                .select('id')
                .eq('couple_id', coupleId)
                .in('upload_id', stats.uploadSessionCount > 0 ? ['valid'] : [])

            if (!validImages || validImages.length !== orphanedImages.length) {
                issues.push('Some images have invalid upload references')
            }
        }

        // Check if default folders were created
        const { data: folders } = await this.supabase
            .from('folders')
            .select('folder_name')
            .eq('couple_id', coupleId)
            .eq('folder_type', 'default')

        const defaultFolders = ['Haldi', 'Sangeet', 'Wedding', 'Reception']
        const folderNames = (folders || []).map(f => f.folder_name)
        const missingFolders = defaultFolders.filter(cat => !folderNames.includes(cat))

        if (missingFolders.length > 0) {
            issues.push(`Missing default folders: ${missingFolders.join(', ')}`)
        }

        return {
            isValid: issues.length === 0,
            issues
        }
    }

    /**
     * Execute full migration for all couples with legacy photos
     */
    async executeMigration(): Promise<MigrationResult> {
        const result: MigrationResult = {
            success: true,
            totalCouples: 0,
            totalLegacyPhotos: 0,
            totalMigratedImages: 0,
            totalUploadSessions: 0,
            stats: [],
            errors: []
        }

        try {
            // Get all photo collections with legacy data
            const photoCollections = await this.getLegacyPhotoCollections()

            if (photoCollections.length === 0) {
                return result
            }

            result.totalCouples = photoCollections.length

            // Migrate each photo collection
            for (const photoCollection of photoCollections) {
                try {
                    // Migrate photos
                    const migratedImages = await this.migratePhotoCollection(photoCollection)

                    // Initialize default folders
                    await this.initializeDefaultFolders(photoCollection.couple_id)

                    // Get migration stats
                    const stats = await this.getMigrationStats(photoCollection.couple_id)

                    if (stats) {
                        result.stats.push(stats)
                        result.totalLegacyPhotos += stats.legacyPhotoCount
                        result.totalMigratedImages += stats.migratedImageCount
                        result.totalUploadSessions += stats.uploadSessionCount
                    }

                    // Verify integrity
                    const integrity = await this.verifyMigrationIntegrity(photoCollection.couple_id)
                    if (!integrity.isValid) {
                        result.errors.push(
                            `Integrity issues for couple ${photoCollection.couple_id}: ${integrity.issues.join('; ')}`
                        )
                        result.success = false
                    }
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error)
                    result.errors.push(`Failed to migrate couple ${photoCollection.couple_id}: ${errorMessage}`)
                    result.success = false
                }
            }

            return result
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error)
            result.errors.push(`Migration failed: ${errorMessage}`)
            result.success = false
            return result
        }
    }

    /**
     * Rollback migration by deleting legacy uploads and images
     * WARNING: This is destructive and should only be used if migration failed
     */
    async rollbackMigration(): Promise<void> {
        // Delete all images from legacy uploads
        const { data: legacyUploads } = await this.supabase
            .from('uploads')
            .select('id')
            .eq('upload_source', 'legacy')

        if (legacyUploads && legacyUploads.length > 0) {
            const uploadIds = legacyUploads.map(u => u.id)

            const { error: deleteImagesError } = await this.supabase
                .from('images')
                .delete()
                .in('upload_id', uploadIds)

            if (deleteImagesError) {
                throw new Error(`Failed to delete migrated images: ${deleteImagesError.message}`)
            }

            // Delete legacy uploads
            const { error: deleteUploadsError } = await this.supabase
                .from('uploads')
                .delete()
                .eq('upload_source', 'legacy')

            if (deleteUploadsError) {
                throw new Error(`Failed to delete legacy uploads: ${deleteUploadsError.message}`)
            }
        }
    }
}

export const photoMigrationService = new PhotoMigrationService()
