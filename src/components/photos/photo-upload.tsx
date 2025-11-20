'use client'

import { useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, X, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-react'
import { PhotoCategoryId, PHOTO_CATEGORIES, UploadProgress } from '@/lib/types/photos'
import { getDriveService } from '@/lib/google-drive'
import { processUploadedFiles, isZipFile, isImageFile } from '@/lib/zip-handler'

interface PhotoUploadProps {
  onUploadComplete?: (photos: any[]) => void
  onUploadProgress?: (progress: UploadProgress[]) => void
  className?: string
}

export function PhotoUpload({ 
  onUploadComplete, 
  onUploadProgress,
  className = '' 
}: PhotoUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [selectedCategory, setSelectedCategory] = useState<PhotoCategoryId>('other')
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [driveAuthenticated, setDriveAuthenticated] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const zipInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files) return

    const fileArray = Array.from(files)
    const { validFiles, errors } = await processUploadedFiles(fileArray)

    if (errors.length > 0) {
      console.warn('File validation errors:', errors)
      // You could show these errors to the user
    }

    setSelectedFiles(prev => [...prev, ...validFiles])
  }, [])

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
    } catch (error) {
      console.error('Failed to authenticate with Google Drive:', error)
      alert('Failed to authenticate with Google Drive. Please try again.')
    }
  }

  const uploadFiles = async () => {
    if (selectedFiles.length === 0 || !driveAuthenticated) return

    setIsUploading(true)
    const progress: UploadProgress[] = selectedFiles.map(file => ({
      file,
      progress: 0,
      status: 'pending'
    }))
    setUploadProgress(progress)
    onUploadProgress?.(progress)

    try {
      const driveService = getDriveService()
      
      // For demo purposes, we'll simulate the upload process
      // In a real implementation, you would:
      // 1. Get the couple's Google Drive folder ID
      // 2. Create category subfolders if they don't exist
      // 3. Upload files to the appropriate folders
      // 4. Save photo metadata to the database

      const uploadedPhotos = []

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        
        // Update progress to uploading
        const updatedProgress = [...progress]
        updatedProgress[i] = { ...updatedProgress[i], status: 'uploading' }
        setUploadProgress(updatedProgress)
        onUploadProgress?.(updatedProgress)

        try {
          // Simulate upload progress
          for (let p = 0; p <= 100; p += 10) {
            await new Promise(resolve => setTimeout(resolve, 100))
            updatedProgress[i] = { ...updatedProgress[i], progress: p }
            setUploadProgress([...updatedProgress])
            onUploadProgress?.([...updatedProgress])
          }

          // Create photo object (in real implementation, this would come from Drive API)
          const photo = {
            id: `photo_${Date.now()}_${i}`,
            name: file.name,
            drive_file_id: `drive_${Date.now()}_${i}`,
            public_url: URL.createObjectURL(file), // Temporary URL for demo
            thumbnail_url: URL.createObjectURL(file),
            category_id: selectedCategory,
            uploaded_at: new Date().toISOString(),
            is_highlight: false
          }

          uploadedPhotos.push(photo)

          // Mark as completed
          updatedProgress[i] = { 
            ...updatedProgress[i], 
            status: 'completed',
            driveFileId: photo.drive_file_id
          }
          setUploadProgress([...updatedProgress])
          onUploadProgress?.([...updatedProgress])

        } catch (error) {
          updatedProgress[i] = { 
            ...updatedProgress[i], 
            status: 'error',
            error: error instanceof Error ? error.message : 'Upload failed'
          }
          setUploadProgress([...updatedProgress])
          onUploadProgress?.([...updatedProgress])
        }
      }

      // Call the completion callback
      onUploadComplete?.(uploadedPhotos)

      // Reset form
      setSelectedFiles([])
      setUploadProgress([])
      if (fileInputRef.current) fileInputRef.current.value = ''
      if (zipInputRef.current) zipInputRef.current.value = ''

    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Please try again.')
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

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Photos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Google Drive Authentication */}
        {!driveAuthenticated && (
          <div className="text-center py-6 border-2 border-dashed border-muted rounded-lg">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Connect to Google Drive</h3>
            <p className="text-muted-foreground mb-4">
              Authenticate with Google Drive to upload photos to your wedding folder
            </p>
            <Button onClick={authenticateGoogleDrive}>
              Connect Google Drive
            </Button>
          </div>
        )}

        {driveAuthenticated && (
          <>
            {/* Category Selection */}
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
                </SelectContent>
              </Select>
            </div>

            {/* File Upload Area */}
            <div
              className="border-2 border-dashed border-muted rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Drop photos here or click to browse</h3>
              <p className="text-muted-foreground mb-4">
                Support for individual images, multiple files, and ZIP archives
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" size="sm">
                  Select Images
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    zipInputRef.current?.click()
                  }}
                >
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
                <h4 className="font-medium">Upload Progress</h4>
                <div className="space-y-2">
                  {uploadProgress.map((progress, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{progress.file.name}</span>
                        <div className="flex items-center gap-2">
                          {progress.status === 'completed' && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                          {progress.status === 'error' && (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span>{progress.progress}%</span>
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
              className="w-full"
            >
              {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} file(s) to ${selectedCategory}`}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}