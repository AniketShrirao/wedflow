import { DriveFile, PhotoCategoryId } from './types/photos'

export class GoogleDriveService {
    private accessToken: string | null = null
    private tokenClient: any = null
    private readonly STORAGE_KEY = 'google_drive_access_token'
    private readonly STORAGE_EXPIRY_KEY = 'google_drive_token_expiry'

    constructor(accessToken?: string) {
        this.accessToken = accessToken || this.loadStoredToken()
    }

    /**
     * Load stored access token from localStorage
     */
    private loadStoredToken(): string | null {
        if (typeof window === 'undefined') return null

        try {
            const token = localStorage.getItem(this.STORAGE_KEY)
            const expiry = localStorage.getItem(this.STORAGE_EXPIRY_KEY)

            if (!token || !expiry) return null

            // Check if token has expired
            if (new Date().getTime() > parseInt(expiry)) {
                this.clearStoredToken()
                return null
            }

            return token
        } catch (error) {
            console.error('Error loading stored token:', error)
            return null
        }
    }

    /**
     * Save access token to localStorage
     */
    private saveToken(token: string, expiresIn: number = 3600): void {
        if (typeof window === 'undefined') return

        try {
            const expiryTime = new Date().getTime() + (expiresIn * 1000)
            localStorage.setItem(this.STORAGE_KEY, token)
            localStorage.setItem(this.STORAGE_EXPIRY_KEY, expiryTime.toString())
        } catch (error) {
            console.error('Error saving token:', error)
        }
    }

    /**
     * Clear stored token
     */
    private clearStoredToken(): void {
        if (typeof window === 'undefined') return

        try {
            localStorage.removeItem(this.STORAGE_KEY)
            localStorage.removeItem(this.STORAGE_EXPIRY_KEY)
        } catch (error) {
            console.error('Error clearing token:', error)
        }
    }

    /**
     * Check if user has a valid stored session
     */
    hasValidSession(): boolean {
        return !!this.loadStoredToken()
    }

    /**
     * Initialize Google Drive API client
     */
    async initializeClient(): Promise<void> {
        if (typeof window === 'undefined') {
            throw new Error('Google Drive client can only be initialized in browser')
        }

        // Check if API credentials are configured
        if (!process.env.NEXT_PUBLIC_GOOGLE_API_KEY || !process.env.NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID) {
            throw new Error('Google Drive API credentials are not configured. Please check your environment variables.')
        }

        // Load Google API client script
        await this.loadGapiScript()

        // Load Google Identity Services script
        await this.loadGisScript()

        // Initialize the API client (without auth2)
        await new Promise((resolve, reject) => {
            window.gapi.load('client', async () => {
                try {
                    console.log('Initializing Google API client...')

                    await window.gapi.client.init({
                        apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
                        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
                    })

                    console.log('Google API client initialized successfully')
                    resolve(undefined)
                } catch (error) {
                    console.error('Google API initialization error:', error)
                    reject(new Error('Failed to initialize Google Drive client.'))
                }
            })
        })

        // Initialize Google Identity Services token client
        this.tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID,
            scope: 'https://www.googleapis.com/auth/drive.file',
            callback: '' // Will be set during authentication
        })
    }

    /**
     * Load Google API script
     */
    private async loadGapiScript(): Promise<void> {
        if (window.gapi) {
            return
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script')
            script.src = 'https://apis.google.com/js/api.js'
            script.async = true
            script.defer = true

            script.onload = () => {
                setTimeout(() => {
                    if (window.gapi) {
                        resolve()
                    } else {
                        reject(new Error('Google API loaded but gapi object not available'))
                    }
                }, 100)
            }

            script.onerror = () => {
                reject(new Error('Failed to load Google API script. Check your internet connection.'))
            }

            document.head.appendChild(script)
        })
    }

    /**
     * Load Google Identity Services script
     */
    private async loadGisScript(): Promise<void> {
        if (window.google?.accounts) {
            return
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script')
            script.src = 'https://accounts.google.com/gsi/client'
            script.async = true
            script.defer = true

            script.onload = () => {
                setTimeout(() => {
                    if (window.google?.accounts) {
                        resolve()
                    } else {
                        reject(new Error('Google Identity Services loaded but not available'))
                    }
                }, 100)
            }

            script.onerror = () => {
                reject(new Error('Failed to load Google Identity Services. Check your internet connection.'))
            }

            document.head.appendChild(script)
        })
    }

    /**
     * Authenticate user with Google Drive using new GIS
     */
    async authenticate(): Promise<string> {
        if (typeof window === 'undefined') {
            throw new Error('Authentication can only be done in browser')
        }

        // Check if we have a valid stored session
        const storedToken = this.loadStoredToken()
        if (storedToken) {
            this.accessToken = storedToken
            window.gapi.client.setToken({ access_token: this.accessToken })
            return this.accessToken
        }

        if (!this.tokenClient) {
            throw new Error('Token client not initialized. Call initializeClient() first.')
        }

        return new Promise((resolve, reject) => {
            try {
                // Set the callback for this authentication request
                this.tokenClient.callback = (response: any) => {
                    if (response.error) {
                        reject(new Error(response.error))
                        return
                    }

                    this.accessToken = response.access_token as string
                    // Save token with expiry (typically 1 hour)
                    this.saveToken(this.accessToken, response.expires_in || 3600)
                    window.gapi.client.setToken({ access_token: this.accessToken })
                    resolve(this.accessToken)
                }

                // Request access token with 'select_account' to allow switching accounts
                this.tokenClient.requestAccessToken({ prompt: 'select_account' })
            } catch (error) {
                reject(error)
            }
        })
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return !!this.accessToken || !!this.loadStoredToken()
    }

    /**
     * Logout and clear session
     */
    logout(): void {
        this.accessToken = null
        this.clearStoredToken()
        if (typeof window !== 'undefined' && window.gapi?.auth2) {
            try {
                window.gapi.auth2.getAuthInstance()?.signOut()
            } catch (error) {
                console.error('Error signing out:', error)
            }
        }
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

            xhr.addEventListener('load', async () => {
                if (xhr.status === 200) {
                    const result = JSON.parse(xhr.responseText)
                    console.log('Upload response:', result)

                    // Fetch full file metadata to get webContentLink
                    try {
                        const fileMetadata = await window.gapi.client.drive.files.get({
                            fileId: result.id,
                            fields: 'id,name,mimeType,webViewLink,webContentLink,createdTime'
                        })

                        console.log('File metadata:', fileMetadata.result)

                        resolve({
                            id: fileMetadata.result.id,
                            name: fileMetadata.result.name,
                            mimeType: fileMetadata.result.mimeType,
                            webViewLink: fileMetadata.result.webViewLink,
                            webContentLink: fileMetadata.result.webContentLink,
                            createdTime: fileMetadata.result.createdTime
                        })
                    } catch (error) {
                        console.error('Error fetching file metadata:', error)
                        // Fallback if metadata fetch fails
                        resolve({
                            id: result.id,
                            name: result.name,
                            mimeType: result.mimeType,
                            webViewLink: result.webViewLink || '',
                            webContentLink: result.webContentLink || '',
                            createdTime: result.createdTime
                        })
                    }
                } else {
                    reject(new Error(`Upload failed with status ${xhr.status}`))
                }
            })

            xhr.addEventListener('error', () => {
                reject(new Error('Upload failed'))
            })

            xhr.open('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,webContentLink,createdTime')
            xhr.setRequestHeader('Authorization', `Bearer ${this.accessToken}`)
            xhr.send(form)
        })
    }

    /**
     * List files in a folder
     */
    async listFiles(folderId: string): Promise<DriveFile[]> {
        if (!window.gapi?.client?.drive) {
            throw new Error('Google Drive API not initialized')
        }

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
     * Delete a file from Google Drive
     */
    async deleteFile(fileId: string): Promise<void> {
        await window.gapi.client.drive.files.delete({
            fileId: fileId
        })
    }

    /**
     * Delete a folder and all its contents from Google Drive
     */
    async deleteFolder(folderId: string): Promise<void> {
        // First, get all files in the folder
        const files = await this.listFiles(folderId)

        // Delete all files in the folder
        for (const file of files) {
            await this.deleteFile(file.id)
        }

        // Delete the folder itself
        await this.deleteFile(folderId)
    }

    /**
     * Setup category folders in the main wedding folder
     */
    async setupCategoryFolders(mainFolderId: string, customFolders?: string[]): Promise<Record<string, string>> {
        const categories = customFolders || ['engagement', 'haldi', 'sangeet', 'wedding', 'reception', 'other']
        const folderIds: Record<string, string> = {}

        for (const category of categories) {
            const folderName = category.charAt(0).toUpperCase() + category.slice(1)
            try {
                const folderId = await this.createSubfolder(mainFolderId, folderName)
                folderIds[category] = folderId
            } catch (error) {
                console.error(`Failed to create folder for ${category}:`, error)
                // Continue with other folders even if one fails
            }
        }

        return folderIds
    }

    /**
     * Get or create category folders
     */
    async getOrCreateCategoryFolders(mainFolderId: string, customFolders?: string[]): Promise<Record<string, string>> {
        try {
            // Try to list existing folders
            const existingFolders = await this.listFiles(mainFolderId)
            const folderMap: Record<string, string> = {}

            const categories = customFolders || ['engagement', 'haldi', 'sangeet', 'wedding', 'reception', 'other']

            for (const category of categories) {
                const folderName = category.charAt(0).toUpperCase() + category.slice(1)
                const existing = existingFolders.find(f =>
                    f.name.toLowerCase() === folderName.toLowerCase() &&
                    f.mimeType === 'application/vnd.google-apps.folder'
                )

                if (existing) {
                    folderMap[category] = existing.id
                } else {
                    // Create if doesn't exist
                    const folderId = await this.createSubfolder(mainFolderId, folderName)
                    folderMap[category] = folderId
                }
            }

            return folderMap
        } catch (error) {
            console.error('Error getting or creating category folders:', error)
            // Fallback to creating all folders
            return this.setupCategoryFolders(mainFolderId, customFolders)
        }
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
        google: any
    }
}
