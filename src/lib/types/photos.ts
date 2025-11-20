export interface PhotoCategory {
    id: string
    name: string
    folder_id?: string
    photos: Photo[]
}

export interface Photo {
    id: string
    name: string
    drive_file_id: string
    public_url: string
    thumbnail_url?: string
    category_id: string
    uploaded_at: string
    is_highlight: boolean
}

export interface PhotoCollection {
    id: string
    couple_id: string
    drive_folder_url: string
    categories: PhotoCategory[]
    highlight_photos: string[]
    updated_at: string
}

export interface DriveFile {
    id: string
    name: string
    mimeType: string
    webViewLink: string
    webContentLink: string
    thumbnailLink?: string
    createdTime: string
}

export interface UploadProgress {
    file: File
    progress: number
    status: 'pending' | 'uploading' | 'completed' | 'error'
    error?: string
    driveFileId?: string
}

export const PHOTO_CATEGORIES = [
    { id: 'haldi', name: 'Haldi' },
    { id: 'sangeet', name: 'Sangeet' },
    { id: 'wedding', name: 'Wedding' },
    { id: 'reception', name: 'Reception' },
    { id: 'other', name: 'Other' }
] as const

export type PhotoCategoryId = typeof PHOTO_CATEGORIES[number]['id']