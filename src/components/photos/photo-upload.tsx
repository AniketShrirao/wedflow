'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, X, CheckCircle, AlertCircle, Image as ImageIcon, LogOut } from 'lucide-react'
import { PhotoCategoryId, PHOTO_CATEGORIES, UploadProgress } from '@/lib/types/photos'
import { getDriveService } from '@/lib/google-drive'
import { processUploadedFiles } from '@/lib/zip-handler'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import { parseEventDates, categorizePhotoByDate } from '@/lib/photo-categorization'

interface PhotoUploadProps {
  coupleId?: string // Optional: if not provided, will fetch from current user
  onUploadComplete?: (photos: any[]) => void
  onUploadProgress?: (progress: UploadProgress[]) => void
  className?: string
}

export function PhotoUpload({ 
  coupleId,
  onUploadComplete, 
  onUploadProgress,
  className = '' 
}: PhotoUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [selectedCategory, setSelectedCategory] = useState<PhotoCategoryId>('other')
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [driveAuthenticated, setDriveAuthenticated] = useState(false)
  const [driveFolderUrl, setDriveFolderUrl] = useState<string | null>(null)
  const [isLoadingFolder, setIsLoadingFolder] = useState(true)
  const [useAutoCategorization, setUseAutoCategorization] = useState(true)
  const [customFolders, setCustomFolders] = useState<string[]>([])
  const [newFolderName, setNewFolderName] = useState('')
  const [activeTab, setActiveTab] = useState<'upload' | 'gallery'>('upload')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const zipInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Set active tab based on uploaded files
  useEffect(() => {
    const uploadedCount = uploadProgress.filter(p => p.status === 'completed').length
    if (uploadedCount > 0) {
      setActiveTab('gallery')
    } else {
      setActiveTab('upload')
    }
  }, [uploadProgress])

  // Fetch Drive folder URL from database and check for existing session
  useEffect(() => {
    const supabase = createClient()
    
    async function fetchDriveFolderUrl() {
      try {
        setIsLoadingFolder(true)
        
        // Check if user has existing Google Drive session
        const driveService = getDriveService()
        if (driveService.hasValidSession()) {
          setDriveAuthenticated(true)
        }
        
        // Get current user's couple ID if not provided
        let targetCoupleId = coupleId
        if (!targetCoupleId) {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) {
            setIsLoadingFolder(false)
            toast({
              title: 'Authentication Required',
              description: 'Please log in to upload photos',
              variant: 'error'
            })
            return
          }
          
          const { data: couple } = await supabase
            .from('couples')
            .select('id')
            .eq('user_id', user.id)
            .single()
          
          if (!couple) {
            setIsLoadingFolder(false)
            toast({
              title: 'No Couple Profile',
              description: 'Please create a couple profile first',
              variant: 'error'
            })
            return
          }
          
          targetCoupleId = couple.id
        }
        
        // Fetch couple with drive folder URL
        const { data: couple, error } = await supabase
          .from('couples')
          .select('google_drive_folder_url')
          .eq('id', targetCoupleId)
          .single()
        
        if (error) {
          console.error('Error fetching photo collection:', error)
          setIsLoadingFolder(false)
          toast({
            title: 'Setup Required',
            description: 'Please configure your Google Drive folder in settings',
            variant: 'error'
          })
          return
        }
        
        if (photoCollection?.drive_folder_url) {
          setDriveFolderUrl(photoCollection.drive_folder_url)
        } else {
          toast({
            title: 'Drive Folder Not Configured',
            description: 'Please add your Google Drive folder URL in photo settings',
            variant: 'error'
          })
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setIsLoadingFolder(false)
      }
    }
    
    fetchDriveFolderUrl()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coupleId])

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files) return

    const fileArray = Array.from(files)
    const { validFiles, errors } = await processUploadedFiles(fileArray)

    if (errors.length > 0) {
      errors.forEach(error => {
        toast({
          title: 'File Validation Error',
          description: error,
          variant: 'error'
        })
      })
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles])
      toast({
        title: 'Files Added',
        description: `${validFiles.length} file(s) ready to upload`
      })
    }
  }, [toast])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    handleFileSelect(e.dataTransfer.files)
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const authenticateGoogleDrive = async () => {
    try {
      const driveService = getDriveService()
      await driveService.initializeClient()
      await driveService.authenticate()
      setDriveAuthenticated(true)
      toast({
        title: 'Connected to Google Drive',
        description: 'Your session has been saved and will be remembered'
      })
    } catch (error) {
      console.error('Failed to authenticate with Google Drive:', error)
      toast({
        title: 'Authentication Failed',
        description: error instanceof Error ? error.message : 'Failed to connect to Google Drive',
        variant: 'error'
      })
    }
  }

  const logoutGoogleDrive = () => {
    const driveService = getDriveService()
    driveService.logout()
    setDriveAuthenticated(false)
    toast({
      title: 'Logged Out',
      description: 'Google Drive session has been cleared'
    })
  }

  const uploadFiles = async () => {
    if (selectedFiles.length === 0 || !driveAuthenticated) return

    if (!driveFolderUrl) {
      toast({
        title: 'Drive Folder Not Configured',
        description: 'Please configure your Google Drive folder URL in settings first',
        variant: 'error'
      })
      return
    }

    // Extract folder ID from the Drive URL
    const driveService = getDriveService()
    const folderId = driveService.extractFolderIdFromUrl(driveFolderUrl)
    
    if (!folderId) {
      toast({
        title: 'Invalid Drive URL',
        description: 'Could not extract folder ID from the configured Drive URL',
        variant: 'error'
      })
      return
    }

    setIsUploading(true)
    const initialProgress: UploadProgress[] = selectedFiles.map(file => ({
      file,
      progress: 0,
      status: 'pending'
    }))
    setUploadProgress(initialProgress)
    onUploadProgress?.(initialProgress)

    try {
      const supabase = createClient()
      const driveService = getDriveService()
      const uploadedPhotos = []
      let currentProgress = [...initialProgress]

      // Get event dates for auto-categorization
      let eventDates: any[] = []
      if (useAutoCategorization) {
        const { data: eventDetails } = await supabase
          .from('event_details')
          .select('events')
          .eq('couple_id', coupleId)
          .single()
        
        if (eventDetails?.events) {
          eventDates = parseEventDates(eventDetails.events)
        }
      }

      // Determine upload folder and category
      let uploadFolderId = folderId
      let uploadCategory: PhotoCategoryId | string = selectedCategory

      // If custom folder name is provided, create it and use it
      if (newFolderName.trim()) {
        try {
          uploadFolderId = await driveService.createSubfolder(folderId, newFolderName.trim())
          uploadCategory = newFolderName.trim()
          toast({
            title: 'Folder Created',
            description: `Created folder "${newFolderName}" in Google Drive`
          })
        } catch (error) {
          console.error('Failed to create folder:', error)
          toast({
            title: 'Warning',
            description: 'Could not create folder, uploading to main folder instead',
            variant: 'error'
          })
        }
      }

      // Setup category folders - create subfolders for each category
      const categoryFolders: Record<string, string> = {}
      const allFolders = newFolderName.trim()
        ? [newFolderName.trim()]
        : useAutoCategorization 
          ? ['engagement', 'haldi', 'sangeet', 'wedding', 'reception', 'other']
          : [...PHOTO_CATEGORIES.map(c => c.id), ...customFolders]
      
      // Create subfolders for each category and map them
      for (const folder of allFolders) {
        try {
          const subFolderId = await driveService.createSubfolder(uploadFolderId, folder)
          categoryFolders[folder] = subFolderId
        } catch (error) {
          console.error(`Failed to create folder "${folder}":`, error)
          // Fallback to main folder if subfolder creation fails
          categoryFolders[folder] = uploadFolderId
        }
      }

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        
        // Determine category for this file
        let fileCategory: PhotoCategoryId | string = uploadCategory
        if (useAutoCategorization && !newFolderName.trim() && eventDates.length > 0) {
          fileCategory = categorizePhotoByDate(new Date(), eventDates) as PhotoCategoryId
        }
        
        // Get the target folder for this category
        const targetFolderId = categoryFolders[fileCategory] || uploadFolderId
        
        // Update progress to uploading
        currentProgress[i] = { ...currentProgress[i], status: 'uploading', progress: 0 }
        setUploadProgress([...currentProgress])
        onUploadProgress?.([...currentProgress])

        try {
          // Actually upload to Google Drive
          const driveFile = await driveService.uploadFile(
            file,
            targetFolderId,
            (uploadProgress) => {
              currentProgress[i] = { ...currentProgress[i], progress: uploadProgress }
              setUploadProgress([...currentProgress])
              onUploadProgress?.([...currentProgress])
            }
          )

          // Create photo object with real Drive data
          const photo = {
            id: driveFile.id,
            name: driveFile.name,
            drive_file_id: driveFile.id,
            public_url: `https://drive.google.com/uc?id=${driveFile.id}`,
            thumbnail_url: driveService.getThumbnailUrl(driveFile.id),
            category_id: fileCategory,
            uploaded_at: driveFile.createdTime,
            is_highlight: false
          }

          uploadedPhotos.push(photo)

          // Mark as completed - keep progress at 100
          currentProgress[i] = { 
            ...currentProgress[i], 
            status: 'completed',
            driveFileId: driveFile.id,
            progress: 100
          }
          setUploadProgress([...currentProgress])
          onUploadProgress?.([...currentProgress])

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Upload failed'
          currentProgress[i] = { 
            ...currentProgress[i], 
            status: 'error',
            error: errorMessage,
            progress: 0
          }
          setUploadProgress([...currentProgress])
          onUploadProgress?.([...currentProgress])
          
          toast({
            title: 'Upload Failed',
            description: `${file.name}: ${errorMessage}`,
            variant: 'error'
          })
        }
      }

      // Call the completion callback - photo-manager will handle saving to database
      onUploadComplete?.(uploadedPhotos)

      // Show success toast
      const successCount = uploadedPhotos.length
      const errorCount = uploadProgress.filter(p => p.status === 'error').length
      
      if (successCount > 0) {
        toast({
          title: 'Upload Complete',
          description: `Successfully uploaded ${successCount} photo(s)${errorCount > 0 ? `. ${errorCount} failed.` : ''}`
        })
      }

      // Reset form
      setSelectedFiles([])
      setUploadProgress([])
      if (fileInputRef.current) fileInputRef.current.value = ''
      if (zipInputRef.current) zipInputRef.current.value = ''

    } catch (error) {
      console.error('Upload failed:', error)
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to upload photos. Please try again.',
        variant: 'error'
      })
    } finally {
      setIsUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const deleteFile = async (fileId: string) => {
    try {
      const driveService = getDriveService()
      await driveService.deleteFile(fileId)
      
      // Remove from progress list
      setUploadProgress(prev => prev.filter(p => p.driveFileId !== fileId))
      
      toast({
        title: 'File Deleted',
        description: 'File has been deleted from Google Drive'
      })
    } catch (error) {
      console.error('Error deleting file:', error)
      toast({
        title: 'Delete Failed',
        description: error instanceof Error ? error.message : 'Failed to delete file',
        variant: 'error'
      })
    }
  }

  const deleteUploadedFiles = async () => {
    const uploadedFiles = uploadProgress.filter(p => p.status === 'completed' && p.driveFileId)
    
    if (uploadedFiles.length === 0) return
    
    if (!confirm(`Delete ${uploadedFiles.length} uploaded file(s) from Google Drive?`)) {
      return
    }

    try {
      const driveService = getDriveService()
      
      for (const file of uploadedFiles) {
        if (file.driveFileId) {
          await driveService.deleteFile(file.driveFileId)
        }
      }
      
      // Remove deleted files from progress
      setUploadProgress(prev => prev.filter(p => !p.driveFileId || p.status !== 'completed'))
      
      toast({
        title: 'Files Deleted',
        description: `${uploadedFiles.length} file(s) deleted from Google Drive`
      })
    } catch (error) {
      console.error('Error deleting files:', error)
      toast({
        title: 'Delete Failed',
        description: error instanceof Error ? error.message : 'Failed to delete files',
        variant: 'error'
      })
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Photos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Loading State */}
        {isLoadingFolder && (
          <div className="text-center py-6">
            <p className="text-muted-foreground">Loading photo collection settings...</p>
          </div>
        )}

        {/* Google Drive Authentication */}
        {!isLoadingFolder && !driveAuthenticated && (
          <div className="text-center py-6 border-2 border-dashed border-muted rounded-lg">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Connect to Google Drive</h3>
            <p className="text-muted-foreground mb-4">
              Authenticate with Google Drive to upload photos to your wedding folder
            </p>
            <Button 
              onClick={authenticateGoogleDrive}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <ImageIcon className="h-5 w-5 mr-2" />
              Connect Google Drive
            </Button>
          </div>
        )}

        {/* Google Drive Connected Status */}
        {!isLoadingFolder && driveAuthenticated && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 shrink-0" />
              <div>
                <p className="font-semibold text-sm sm:text-base text-green-900">Connected to Google Drive</p>
                <p className="text-xs sm:text-sm text-green-700">Your session is saved</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logoutGoogleDrive}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full sm:w-auto"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Disconnect
            </Button>
          </div>
        )}

        {!isLoadingFolder && driveAuthenticated && (
          <>
            {/* Auto-Categorization Toggle */}
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <input
                type="checkbox"
                id="autoCategorize"
                checked={useAutoCategorization}
                onChange={(e) => setUseAutoCategorization(e.target.checked)}
                className="w-4 h-4 cursor-pointer"
              />
              <label htmlFor="autoCategorize" className="text-sm font-medium cursor-pointer flex-1">
                Auto-categorize photos based on upload date and event timeline
              </label>
            </div>

            {/* Manual Category Selection */}
            {!useAutoCategorization && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Photo Category</label>
                <Select value={selectedCategory} onValueChange={(value: PhotoCategoryId) => setSelectedCategory(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PHOTO_CATEGORIES.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                    {customFolders.map(folder => (
                      <SelectItem key={folder} value={folder as PhotoCategoryId}>
                        {folder}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Custom Folder Creation */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Create Custom Folder</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Folder name (e.g., Pre-Wedding)"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-input rounded-md text-sm"
                />
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                  onClick={() => {
                    if (newFolderName.trim()) {
                      setCustomFolders([...customFolders, newFolderName.trim()])
                      setNewFolderName('')
                      toast({
                        title: 'Folder Added',
                        description: `"${newFolderName}" will be created during upload`
                      })
                    }
                  }}
                >
                  Add Folder
                </Button>
              </div>
              {customFolders.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {customFolders.map(folder => (
                    <Badge key={folder} variant="secondary" className="cursor-pointer">
                      {folder}
                      <X
                        className="h-3 w-3 ml-1"
                        onClick={() => setCustomFolders(customFolders.filter(f => f !== folder))}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* File Upload Area */}
            <div
              className="border-2 border-dashed border-muted rounded-lg p-6 sm:p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-10 sm:h-12 w-10 sm:w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">Drop photos here or click to browse</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                Support for individual images, multiple files, and ZIP archives
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  size="lg"
                  className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
                  onClick={(e) => {
                    e.stopPropagation()
                    fileInputRef.current?.click()
                  }}
                >
                  <ImageIcon className="h-5 w-5 mr-2" />
                  Select Images
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={(e) => {
                    e.stopPropagation()
                    zipInputRef.current?.click()
                  }}
                >
                  <Upload className="h-5 w-5 mr-2" />
                  Select ZIP File
                </Button>
              </div>
            </div>

            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
            <input
              ref={zipInputRef}
              type="file"
              accept=".zip,application/zip"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Selected Files ({selectedFiles.length})</h4>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        <span className="text-sm font-medium">{file.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {formatFileSize(file.size)}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        disabled={isUploading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {uploadProgress.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Upload Progress</h4>
                  {uploadProgress.some(p => p.status === 'completed' && p.driveFileId) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteUploadedFiles()}
                      disabled={isUploading}
                    >
                      Delete Uploaded Files
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  {uploadProgress.map((progress, index) => (
                    <div key={index} className="space-y-1 p-2 bg-muted rounded">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{progress.file.name}</span>
                        <div className="flex items-center gap-2">
                          {progress.status === 'completed' && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                          {progress.status === 'error' && (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-xs">{progress.progress}%</span>
                          {progress.status === 'completed' && progress.driveFileId && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteFile(progress.driveFileId!)}
                              disabled={isUploading}
                              title="Delete this file from Google Drive"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <Progress value={progress.progress} className="h-2" />
                      {progress.error && (
                        <p className="text-xs text-red-500">{progress.error}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Button */}
            <Button
              onClick={uploadFiles}
              disabled={selectedFiles.length === 0 || isUploading}
              size="lg"
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <Upload className="h-5 w-5 mr-2" />
              {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} file(s)`}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
