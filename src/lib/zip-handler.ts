/**
 * Utility functions for handling ZIP file uploads and extraction
 */

export interface ZipEntry {
    name: string
    file: File
    path: string
}

/**
 * Extract files from a ZIP archive
 * Note: This is a simplified implementation for demo purposes
 * In a production environment, you would use a proper ZIP library like JSZip
 */
export async function extractZipFiles(zipFile: File): Promise<File[]> {
    // For now, we'll return the original file as a placeholder
    // In a real implementation, you would:
    // 1. Use JSZip or similar library to extract files
    // 2. Filter for image files only
    // 3. Return array of extracted image files

    console.warn('ZIP extraction not implemented - returning original file')
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
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
        return { valid: false, error: 'File size must be less than 10MB' }
    }

    // Check if it's an image or zip file
    if (!isImageFile(file) && !isZipFile(file)) {
        return { valid: false, error: 'Only image files and ZIP archives are allowed' }
    }

    return { valid: true }
}

/**
 * Process uploaded files (extract ZIP files and validate images)
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

        if (isZipFile(file)) {
            try {
                const extractedFiles = await extractZipFiles(file)
                for (const extractedFile of extractedFiles) {
                    const extractedValidation = validatePhotoFile(extractedFile)
                    if (extractedValidation.valid && isImageFile(extractedFile)) {
                        validFiles.push(extractedFile)
                    } else if (!extractedValidation.valid) {
                        errors.push(`${extractedFile.name}: ${extractedValidation.error}`)
                    }
                }
            } catch (error) {
                errors.push(`${file.name}: Failed to extract ZIP file`)
            }
        } else if (isImageFile(file)) {
            validFiles.push(file)
        }
    }

    return { validFiles, errors }
}