import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/types/database'

export type Upload = Database['public']['Tables']['uploads']['Row']
export type InsertUpload = Database['public']['Tables']['uploads']['Insert']
export type UpdateUpload = Database['public']['Tables']['uploads']['Update']

export type Image = Database['public']['Tables']['images']['Row']
export type InsertImage = Database['public']['Tables']['images']['Insert']
export type UpdateImage = Database['public']['Tables']['images']['Update']

export type Category = Database['public']['Tables']['categories']['Row']
export type InsertCategory = Database['public']['Tables']['categories']['Insert']
export type UpdateCategory = Database['public']['Tables']['categories']['Update']

// Folder type alias for backward compatibility (maps to Category)
export type Folder = Category
export type InsertFolder = InsertCategory
export type UpdateFolder = UpdateCategory

export type ImageCategory = string
export type UploadSource = 'dashboard' | 'public_site' | 'legacy'
export type UploadStatus = 'pending' | 'completed' | 'failed'
export type FolderType = 'default' | 'custom'

export interface CreateUploadSessionParams {
    coupleId: string
    uploaderName: string
    uploaderEmail?: string
    uploadSource: UploadSource
    googleDriveFolderPath?: string
}

export interface AddImagesToUploadParams {
    uploadId: string
    images: Array<{
        filename: string
        googleDriveFileId: string
        publicUrl: string
        category: ImageCategory
        folder: string
    }>
}

export interface UpdateImageMetadataParams {
    imageId: string
    category?: ImageCategory
    folder?: string
    isHighlighted?: boolean
}

export interface GetHighlightedImagesParams {
    coupleId: string
    category?: ImageCategory
}

export interface GetUploadsByUserParams {
    coupleId: string
    uploaderEmail?: string
    limit?: number
    offset?: number
}

export interface CreateCustomCategoryParams {
    coupleId: string
    categoryName: string
    googleDriveFolderId?: string
}

export class PhotoService {
    private supabase = createClient()

    /**
     * Create an upload session for tracking a batch of photo uploads
     */
    async createUploadSession(params: CreateUploadSessionParams): Promise<Upload> {
        const { coupleId, uploaderName, uploaderEmail, uploadSource, googleDriveFolderPath } = params

        const { data, error } = await this.supabase
            .from('uploads')
            .insert({
                couple_id: coupleId,
                uploader_name: uploaderName,
                uploader_email: uploaderEmail,
                upload_source: uploadSource,
                google_drive_folder_path: googleDriveFolderPath,
                status: 'pending'
            } as InsertUpload)
            .select()
            .single()

        if (error) {
            throw new Error(`Failed to create upload session: ${error.message}`)
        }

        return data
    }

    /**
     * Add images to an existing upload session
     */
    async addImagesToUpload(params: AddImagesToUploadParams): Promise<Image[]> {
        const { uploadId, images } = params

        // Get the upload to retrieve couple_id
        const { data: upload, error: uploadError } = await this.supabase
            .from('uploads')
            .select('couple_id')
            .eq('id', uploadId)
            .single()

        if (uploadError || !upload) {
            throw new Error(`Failed to find upload session: ${uploadError?.message}`)
        }

        // Insert all images
        const imagesToInsert = images.map(img => ({
            upload_id: uploadId,
            couple_id: upload.couple_id,
            filename: img.filename,
            google_drive_file_id: img.googleDriveFileId,
            public_url: img.publicUrl,
            category: img.category,
            folder: img.folder,
            is_highlighted: false
        } as InsertImage))

        const { data, error } = await this.supabase
            .from('images')
            .insert(imagesToInsert)
            .select()

        if (error) {
            throw new Error(`Failed to add images to upload: ${error.message}`)
        }

        // Update upload status to completed
        await this.supabase
            .from('uploads')
            .update({ status: 'completed' } as UpdateUpload)
            .eq('id', uploadId)

        return data
    }

    /**
     * Update image metadata (category, folder, highlight status)
     */
    async updateImageMetadata(params: UpdateImageMetadataParams): Promise<Image> {
        const { imageId, category, folder, isHighlighted } = params

        const updateData: UpdateImage = {}
        if (category !== undefined) updateData.category = category
        if (folder !== undefined) updateData.folder = folder
        if (isHighlighted !== undefined) updateData.is_highlighted = isHighlighted

        const { data, error } = await this.supabase
            .from('images')
            .update(updateData)
            .eq('id', imageId)
            .select()
            .single()

        if (error) {
            throw new Error(`Failed to update image metadata: ${error.message}`)
        }

        return data
    }

    /**
     * Get highlighted images for public display, optionally filtered by category
     */
    async getHighlightedImages(params: GetHighlightedImagesParams): Promise<Image[]> {
        const { coupleId, category } = params

        let query = this.supabase
            .from('images')
            .select('*')
            .eq('couple_id', coupleId)
            .eq('is_highlighted', true)

        if (category) {
            query = query.eq('category', category)
        }

        const { data, error } = await query.order('created_at', { ascending: false })

        if (error) {
            throw new Error(`Failed to get highlighted images: ${error.message}`)
        }

        return data
    }

    /**
     * Get uploads by user (uploader), with optional pagination
     */
    async getUploadsByUser(params: GetUploadsByUserParams): Promise<Upload[]> {
        const { coupleId, uploaderEmail, limit = 50, offset = 0 } = params

        let query = this.supabase
            .from('uploads')
            .select('*')
            .eq('couple_id', coupleId)

        if (uploaderEmail) {
            query = query.eq('uploader_email', uploaderEmail)
        }

        const { data, error } = await query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1)

        if (error) {
            throw new Error(`Failed to get uploads by user: ${error.message}`)
        }

        return data
    }

    /**
     * Create a custom category for a couple
     */
    async createCustomCategory(params: CreateCustomCategoryParams): Promise<Category> {
        const { coupleId, categoryName, googleDriveFolderId } = params

        const { data, error } = await this.supabase
            .from('categories')
            .insert({
                couple_id: coupleId,
                category_name: categoryName,
                category_type: 'custom',
                google_drive_folder_id: googleDriveFolderId
            } as InsertCategory)
            .select()
            .single()

        if (error) {
            throw new Error(`Failed to create custom category: ${error.message}`)
        }

        return data
    }

    /**
     * Get all available categories for a couple (both default and custom)
     * This is the main method to use for fetching categories
     */
    async getAvailableCategories(coupleId: string): Promise<Category[]> {
        const { data, error } = await this.supabase
            .from('categories')
            .select('*')
            .eq('couple_id', coupleId)
            .order('category_type', { ascending: false })
            .order('category_name', { ascending: true })

        if (error) {
            throw new Error(`Failed to get available categories: ${error.message}`)
        }

        return data || []
    }

    /**
     * Get a specific upload with all its images
     */
    async getUploadWithImages(uploadId: string): Promise<{ upload: Upload; images: Image[] } | null> {
        const { data: upload, error: uploadError } = await this.supabase
            .from('uploads')
            .select('*')
            .eq('id', uploadId)
            .single()

        if (uploadError || !upload) {
            return null
        }

        const { data: images, error: imagesError } = await this.supabase
            .from('images')
            .select('*')
            .eq('upload_id', uploadId)

        if (imagesError) {
            throw new Error(`Failed to get images for upload: ${imagesError.message}`)
        }

        return { upload, images }
    }

    /**
     * Get all images for a couple with optional filtering
     */
    async getImagesByCouple(
        coupleId: string,
        filters?: {
            category?: ImageCategory
            folder?: string
            isHighlighted?: boolean
        }
    ): Promise<Image[]> {
        let query = this.supabase
            .from('images')
            .select('*')
            .eq('couple_id', coupleId)

        if (filters?.category) {
            query = query.eq('category', filters.category)
        }

        if (filters?.folder) {
            query = query.eq('folder', filters.folder)
        }

        if (filters?.isHighlighted !== undefined) {
            query = query.eq('is_highlighted', filters.isHighlighted)
        }

        const { data, error } = await query.order('created_at', { ascending: false })

        if (error) {
            throw new Error(`Failed to get images: ${error.message}`)
        }

        return data
    }

    /**
     * Delete an image
     */
    async deleteImage(imageId: string): Promise<void> {
        const { error } = await this.supabase
            .from('images')
            .delete()
            .eq('id', imageId)

        if (error) {
            throw new Error(`Failed to delete image: ${error.message}`)
        }
    }

    /**
     * Delete a custom category
     */
    async deleteCustomCategory(categoryId: string): Promise<void> {
        const { error } = await this.supabase
            .from('categories')
            .delete()
            .eq('id', categoryId)
            .eq('category_type', 'custom')

        if (error) {
            throw new Error(`Failed to delete custom category: ${error.message}`)
        }
    }

    /**
     * Mark multiple images as highlighted
     */
    async markImagesAsHighlighted(imageIds: string[], isHighlighted: boolean = true): Promise<void> {
        const { error } = await this.supabase
            .from('images')
            .update({ is_highlighted: isHighlighted } as UpdateImage)
            .in('id', imageIds)

        if (error) {
            throw new Error(`Failed to update highlight status: ${error.message}`)
        }
    }

    /**
     * Update upload status
     */
    async updateUploadStatus(uploadId: string, status: UploadStatus): Promise<Upload> {
        const { data, error } = await this.supabase
            .from('uploads')
            .update({ status } as UpdateUpload)
            .eq('id', uploadId)
            .select()
            .single()

        if (error) {
            throw new Error(`Failed to update upload status: ${error.message}`)
        }

        return data
    }

    /**
     * Initialize default categories for a couple
     * Creates Haldi, Sangeet, Wedding, and Reception categories in the database
     */
    async initializeDefaultCategories(coupleId: string): Promise<Category[]> {
        const defaultCategories = ['Haldi', 'Sangeet', 'Wedding', 'Reception']
        const existingCategories = await this.getAvailableCategories(coupleId)

        // Check which categories already exist
        const existingNames = existingCategories.map(c => c.category_name)
        const categoriesToCreate = defaultCategories.filter(cat => !existingNames.includes(cat))

        if (categoriesToCreate.length === 0) {
            // All default categories already exist
            return existingCategories.filter(c => c.category_type === 'default')
        }

        const createdCategories: Category[] = []

        for (const categoryName of categoriesToCreate) {
            try {
                const category = await this.createCustomCategory({
                    coupleId,
                    categoryName,
                    googleDriveFolderId: undefined
                })
                createdCategories.push(category)
            } catch (error) {
                console.error(`Failed to create default category ${categoryName}:`, error)
                // Continue creating other categories even if one fails
            }
        }

        return createdCategories
    }

    /**
     * Store Google Drive folder IDs for category folders
     * Updates existing category records with Google Drive folder IDs
     */
    async updateCategoryGoogleDriveIds(
        coupleId: string,
        categoryMapping: Record<string, string>
    ): Promise<void> {
        for (const [categoryName, googleDriveFolderId] of Object.entries(categoryMapping)) {
            try {
                const { error } = await this.supabase
                    .from('categories')
                    .update({ google_drive_folder_id: googleDriveFolderId } as UpdateCategory)
                    .eq('couple_id', coupleId)
                    .eq('category_name', categoryName)

                if (error) {
                    console.error(`Failed to update Google Drive ID for category ${categoryName}:`, error)
                }
            } catch (error) {
                console.error(`Error updating category ${categoryName}:`, error)
            }
        }
    }

    /**
     * Get category by name for a couple
     */
    async getCategoryByName(coupleId: string, categoryName: string): Promise<Category | null> {
        const { data, error } = await this.supabase
            .from('categories')
            .select('*')
            .eq('couple_id', coupleId)
            .eq('category_name', categoryName)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                // No rows found
                return null
            }
            throw new Error(`Failed to get category: ${error.message}`)
        }

        return data
    }

    /**
     * Get all default categories for a couple
     */
    async getDefaultCategories(coupleId: string): Promise<Category[]> {
        const { data, error } = await this.supabase
            .from('categories')
            .select('*')
            .eq('couple_id', coupleId)
            .eq('category_type', 'default')
            .order('category_name', { ascending: true })

        if (error) {
            throw new Error(`Failed to get default categories: ${error.message}`)
        }

        return data
    }

    /**
     * Get all custom categories for a couple
     */
    async getCustomCategories(coupleId: string): Promise<Category[]> {
        const { data, error } = await this.supabase
            .from('categories')
            .select('*')
            .eq('couple_id', coupleId)
            .eq('category_type', 'custom')
            .order('category_name', { ascending: true })

        if (error) {
            throw new Error(`Failed to get custom categories: ${error.message}`)
        }

        return data
    }

}

// Export singleton instance
export const photoService = new PhotoService()
