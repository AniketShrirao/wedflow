/**
 * Utility functions for handling ZIP file uploads and extraction
 */

export interface ZipEntry {
    name: string
    file: File
    path: string
}

/**
 * Extract files from a ZIP archive (not needed for Google Drive uploads)
 * ZIP files are uploaded directly to Google Drive
 */
export async function extractZipFiles(zipFile: File): Promise<File[]> {
    // Not needed - ZIP files are uploaded directly to Google Drive
    // Users can extract them manually after download if needed
    return [zipFile]
}

/**
 * Check if a file is a ZIP archive
 */
export function isZipFile(file: File): boolean {
    return file.type === 'application/zip' ||
        file.type === 'application/x-zip-compressed' ||
        file.name.toLowerCase().endsWith('.zip')
}

/**
 * Check if a file is an image
 */
export function isImageFile(file: File): boolean {
    return file.type.startsWith('image/')
}

/**
 * Validate file for photo upload
 */
export function validatePhotoFile(file: File): { valid: boolean; error?: string } {
    // Check file size (max 10GB for ZIP files, 50MB for images)
    const maxSize = isZipFile(file)
        ? 10 * 1024 * 1024 * 1024  // 10GB for ZIP files
        : 50 * 1024 * 1024          // 50MB for individual images

    if (file.size > maxSize) {
        const maxSizeLabel = isZipFile(file) ? '10GB' : '50MB'
        return { valid: false, error: `File size must be less than ${maxSizeLabel}` }
    }

    // Check if it's an image or zip file
    if (!isImageFile(file) && !isZipFile(file)) {
        return { valid: false, error: 'Only image files and ZIP archives are allowed' }
    }

    return { valid: true }
}

/**
 * Process uploaded files (validate images and ZIP files)
 * ZIP files are uploaded directly to Google Drive without extraction
 */
export async function processUploadedFiles(files: File[]): Promise<{
    validFiles: File[]
    errors: string[]
}> {
    const validFiles: File[] = []
    const errors: string[] = []

    for (const file of files) {
        const validation = validatePhotoFile(file)

        if (!validation.valid) {
            errors.push(`${file.name}: ${validation.error}`)
            continue
        }

        // Add valid files (both images and ZIP files)
        validFiles.push(file)
    }

    return { validFiles, errors }
}