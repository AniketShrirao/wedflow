'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ExternalLink, Folder, CheckCircle, AlertCircle } from 'lucide-react'
import { getDriveService } from '@/lib/google-drive'
import { PHOTO_CATEGORIES } from '@/lib/types/photos'

interface DriveFolderSetupProps {
  onSetupComplete?: (folderId: string, categoryFolders: Record<string, string>) => void
  className?: string
}

export function DriveFolderSetup({ onSetupComplete, className = '' }: DriveFolderSetupProps) {
  const [driveUrl, setDriveUrl] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const validateDriveUrl = (url: string): boolean => {
    const driveUrlPattern = /https:\/\/drive\.google\.com\/drive\/folders\/([a-zA-Z0-9-_]+)/
    return driveUrlPattern.test(url)
  }

  const setupFolders = async () => {
    if (!driveUrl.trim()) {
      setError('Please enter a Google Drive folder URL')
      return
    }

    if (!validateDriveUrl(driveUrl)) {
      setError('Please enter a valid Google Drive folder URL')
      return
    }

    setIsProcessing(true)
    setError('')
    setSuccess('')

    try {
      const driveService = getDriveService()
      
      // Initialize and authenticate
      await driveService.initializeClient()
      if (!driveService.isAuthenticated()) {
        await driveService.authenticate()
      }

      // Extract folder ID from URL
      const folderId = driveService.extractFolderIdFromUrl(driveUrl)
      if (!folderId) {
        throw new Error('Could not extract folder ID from URL')
      }

      // Create category subfolders
      const categoryFolders = await driveService.setupCategoryFolders(folderId)

      setSuccess('Successfully set up photo categories in your Google Drive folder!')
      onSetupComplete?.(folderId, categoryFolders)

    } catch (error) {
      console.error('Failed to setup folders:', error)
      setError(error instanceof Error ? error.message : 'Failed to setup folders')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Folder className="h-5 w-5" />
          Google Drive Setup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Instructions */}
        <div className="space-y-4">
          <h3 className="font-semibold">Setup Instructions:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Create a new folder in your Google Drive for wedding photos</li>
            <li>Right-click the folder and select "Share"</li>
            <li>Set permissions to "Anyone with the link can edit"</li>
            <li>Copy the folder URL and paste it below</li>
          </ol>
        </div>

        {/* URL Input */}
        <div className="space-y-2">
          <Label htmlFor="drive-url">Google Drive Folder URL</Label>
          <div className="flex gap-2">
            <Input
              id="drive-url"
              placeholder="https://drive.google.com/drive/folders/..."
              value={driveUrl}
              onChange={(e) => setDriveUrl(e.target.value)}
              disabled={isProcessing}
            />
            <Button
              onClick={setupFolders}
              disabled={isProcessing || !driveUrl.trim()}
            >
              {isProcessing ? 'Setting up...' : 'Setup'}
            </Button>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Category Preview */}
        <div className="space-y-4">
          <h3 className="font-semibold">Photo Categories</h3>
          <p className="text-sm text-muted-foreground">
            The following subfolders will be created in your Google Drive folder:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {PHOTO_CATEGORIES.map(category => (
              <div key={category.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                <Folder className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{category.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Help Link */}
        <div className="pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('https://support.google.com/drive/answer/2494822', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            How to share Google Drive folders
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}