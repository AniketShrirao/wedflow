import { DriveFile, PhotoCategoryId } from './types/photos'

export class GoogleDriveService {
    private accessToken: string | null = null

    constructor(accessToken?: string) {
        this.accessToken = accessToken || null
    }

    /**
     * Initialize Google Drive API client
     */
    async initializeClient(): Promise<void> {
        if (typeof window === 'undefined') {
            throw new Error('Google Drive client can only be initialized in browser')
        }

        // Load Google API client
        await new Promise((resolve, reject) => {
            if (window.gapi) {
                resolve(window.gapi)
                return
            }

            const script = document.createElement('script')
            script.src = 'https://apis.google.com/js/api.js'
            script.onload = () => resolve(window.gapi)
            script.onerror = reject
            document.head.appendChild(script)
        })

        // Initialize the API client
        await window.gapi.load('client:auth2', async () => {
            await window.gapi.client.init({
                apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
                clientId: process.env.NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID,
                discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
                scope: 'https://www.googleapis.com/auth/drive.file'
            })
        })
    }

    /**
     * Authenticate user with Google Drive
     */
    async authenticate(): Promise<string> {
        if (typeof window === 'undefined') {
            throw new Error('Authentication can only be done in browser')
        }

        const authInstance = window.gapi.auth2.getAuthInstance()
        const user = await authInstance.signIn()
        this.accessToken = user.getAuthResponse().access_token
        return this.accessToken || ''
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        if (typeof window === 'undefined') return false
        const authInstance = window.gapi.auth2.getAuthInstance()
        return authInstance?.isSignedIn.get() || false
    }

    /**
     * Extract folder ID from Google Drive URL
     */
    extractFolderIdFromUrl(url: string): string | null {
        const match = url.match(/\/folders\/([a-zA-Z0-9-_]+)/)
        return match ? match[1] : null
    }

    /**
     * Create a subfolder in the main wedding folder
     */
    async createSubfolder(parentFolderId: string, folderName: string): Promise<string> {
        const response = await window.gapi.client.drive.files.create({
            resource: {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
                parents: [parentFolderId]
            }
        })

        return response.result.id
    }

    /**
     * Upload a single file to Google Drive
     */
    async uploadFile(
        file: File,
        folderId: string,
        onProgress?: (progress: number) => void
    ): Promise<DriveFile> {
        const metadata = {
            name: file.name,
            parents: [folderId]
        }

        const form = new FormData()
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
        form.append('file', file)

        const xhr = new XMLHttpRequest()

        return new Promise((resolve, reject) => {
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable && onProgress) {
                    const progress = (e.loaded / e.total) * 100
                    onProgress(progress)
                }
            })

            xhr.addEventListener('load', () => {
                if (xhr.status === 200) {
                    const result = JSON.parse(xhr.responseText)
                    resolve({
                        id: result.id,
                        name: result.name,
                        mimeType: result.mimeType,
                        webViewLink: result.webViewLink,
                        webContentLink: result.webContentLink,
                        createdTime: result.createdTime
                    })
                } else {
                    reject(new Error(`Upload failed with status ${xhr.status}`))
                }
            })

            xhr.addEventListener('error', () => {
                reject(new Error('Upload failed'))
            })

            xhr.open('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart')
            xhr.setRequestHeader('Authorization', `Bearer ${this.accessToken}`)
            xhr.send(form)
        })
    }

    /**
     * List files in a folder
     */
    async listFiles(folderId: string): Promise<DriveFile[]> {
        const response = await window.gapi.client.drive.files.list({
            q: `'${folderId}' in parents and trashed=false`,
            fields: 'files(id,name,mimeType,webViewLink,webContentLink,thumbnailLink,createdTime)'
        })

        return response.result.files || []
    }

    /**
     * Get public URL for a file
     */
    async getPublicUrl(fileId: string): Promise<string> {
        // Make file publicly viewable
        await window.gapi.client.drive.permissions.create({
            fileId: fileId,
            resource: {
                role: 'reader',
                type: 'anyone'
            }
        })

        // Return direct link
        return `https://drive.google.com/uc?id=${fileId}`
    }

    /**
     * Get thumbnail URL for an image
     */
    getThumbnailUrl(fileId: string, size: number = 400): string {
        return `https://drive.google.com/thumbnail?id=${fileId}&sz=s${size}`
    }

    /**
     * Setup category folders in the main wedding folder
     */
    async setupCategoryFolders(mainFolderId: string): Promise<Record<PhotoCategoryId, string>> {
        const categories: PhotoCategoryId[] = ['haldi', 'sangeet', 'wedding', 'reception', 'other']
        const folderIds: Record<string, string> = {}

        for (const category of categories) {
            const folderName = category.charAt(0).toUpperCase() + category.slice(1)
            const folderId = await this.createSubfolder(mainFolderId, folderName)
            folderIds[category] = folderId
        }

        return folderIds as Record<PhotoCategoryId, string>
    }

    /**
     * Upload multiple files with progress tracking
     */
    async uploadMultipleFiles(
        files: File[],
        categoryFolders: Record<PhotoCategoryId, string>,
        defaultCategory: PhotoCategoryId = 'other',
        onProgress?: (fileIndex: number, progress: number) => void,
        onFileComplete?: (fileIndex: number, result: DriveFile) => void,
        onError?: (fileIndex: number, error: Error) => void
    ): Promise<DriveFile[]> {
        const results: DriveFile[] = []

        for (let i = 0; i < files.length; i++) {
            try {
                const file = files[i]
                const folderId = categoryFolders[defaultCategory]

                const result = await this.uploadFile(file, folderId, (progress) => {
                    onProgress?.(i, progress)
                })

                results.push(result)
                onFileComplete?.(i, result)
            } catch (error) {
                onError?.(i, error as Error)
            }
        }

        return results
    }
}

// Global instance
let driveService: GoogleDriveService | null = null

export const getDriveService = (): GoogleDriveService => {
    if (!driveService) {
        driveService = new GoogleDriveService()
    }
    return driveService
}

// Type declarations for Google API
declare global {
    interface Window {
        gapi: any
    }
}