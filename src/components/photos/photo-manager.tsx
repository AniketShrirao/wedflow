'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { PhotoGallery } from './photo-gallery'
import { PhotoUpload } from './photo-upload'
import { PhotoCollection, Photo, PHOTO_CATEGORIES } from '@/lib/types/photos'
import { Folder, Upload, Star, Settings, ExternalLink } from 'lucide-react'
// Using simple alerts instead of toast for now

export function PhotoManager() {
  const [photoCollection, setPhotoCollection] = useState<PhotoCollection | null>(null)
  const [driveUrl, setDriveUrl] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchPhotoCollection()
  }, [])

  const fetchPhotoCollection = async () => {
    try {
      const response = await fetch('/api/photos')
      if (response.ok) {
        const data = await response.json()
        setPhotoCollection(data)
        setDriveUrl(data.drive_folder_url || '')
      }
    } catch (error) {
      console.error('Failed to fetch photo collection:', error)
      console.error('Failed to load photo collection')
    } finally {
      setIsLoading(false)
    }
  }

  const saveDriveUrl = async () => {
    if (!driveUrl.trim()) {
      alert('Please enter a valid Google Drive folder URL')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/photos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          drive_folder_url: driveUrl,
          categories: photoCollection?.categories || PHOTO_CATEGORIES.map(cat => ({
            id: cat.id,
            name: cat.name,
            photos: []
          })),
          highlight_photos: photoCollection?.highlight_photos || []
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setPhotoCollection(data)
        alert('Google Drive folder connected successfully!')
      } else {
        alert('Failed to save Google Drive folder')
      }
    } catch (error) {
      console.error('Failed to save drive URL:', error)
      alert('Failed to save Google Drive folder')
    } finally {
      setIsSaving(false)
    }
  }

  const handleUploadComplete = async (photos: Photo[]) => {
    try {
      // Update the photo collection with new photos
      const response = await fetch('/api/photos/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photos,
          category_id: 'other' // Default category, should be passed from upload component
        }),
      })

      if (response.ok) {
        await fetchPhotoCollection() // Refresh the collection
        alert(`Successfully uploaded ${photos.length} photo(s)!`)
      } else {
        alert('Failed to save uploaded photos')
      }
    } catch (error) {
      console.error('Failed to save uploaded photos:', error)
      alert('Failed to save uploaded photos')
    }
  }

  const handleHighlightToggle = async (photoId: string) => {
    if (!photoCollection) return

    const currentHighlights = photoCollection.highlight_photos || []
    const newHighlights = currentHighlights.includes(photoId)
      ? currentHighlights.filter(id => id !== photoId)
      : [...currentHighlights, photoId]

    try {
      const response = await fetch('/api/photos/highlights', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          highlight_photos: newHighlights
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setPhotoCollection(data)
        console.log(
          currentHighlights.includes(photoId) 
            ? 'Removed from highlights' 
            : 'Added to highlights'
        )
      } else {
        alert('Failed to update highlights')
      }
    } catch (error) {
      console.error('Failed to update highlights:', error)
      alert('Failed to update highlights')
    }
  }

  const getPhotoStats = () => {
    if (!photoCollection) return { total: 0, highlights: 0, categories: 0 }

    const total = photoCollection.categories.reduce((sum, cat) => sum + (cat.photos?.length || 0), 0)
    const highlights = photoCollection.highlight_photos?.length || 0
    const categories = photoCollection.categories.filter(cat => (cat.photos?.length || 0) > 0).length

    return { total, highlights, categories }
  }

  const stats = getPhotoStats()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Photo Management</h1>
          <p className="text-muted-foreground">
            Manage your wedding photos and create beautiful galleries
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Badge variant="outline">{stats.total} Photos</Badge>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4" />
            <span>{stats.highlights} Highlights</span>
          </div>
          <div className="flex items-center gap-1">
            <Folder className="h-4 w-4" />
            <span>{stats.categories} Categories</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="gallery" className="space-y-6">
        <TabsList>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="gallery">
          <PhotoGallery
            photoCollection={photoCollection}
            onHighlightToggle={handleHighlightToggle}
            showHighlightControls={true}
          />
        </TabsContent>

        <TabsContent value="upload">
          <PhotoUpload onUploadComplete={handleUploadComplete} />
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Photo Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Google Drive Integration */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="drive-url">Google Drive Folder URL</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Share your Google Drive folder and paste the URL here. Make sure the folder is set to "Anyone with the link can edit".
                  </p>
                  <div className="flex gap-2">
                    <Input
                      id="drive-url"
                      placeholder="https://drive.google.com/drive/folders/..."
                      value={driveUrl}
                      onChange={(e) => setDriveUrl(e.target.value)}
                    />
                    <Button onClick={saveDriveUrl} disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>

                {photoCollection?.drive_folder_url && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-800">
                        Google Drive folder connected
                      </p>
                      <p className="text-xs text-green-600">
                        Photos will be uploaded to your connected folder
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(photoCollection.drive_folder_url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Category Overview */}
              <div className="space-y-4">
                <h3 className="font-semibold">Photo Categories</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {PHOTO_CATEGORIES.map(category => {
                    const categoryData = photoCollection?.categories.find(cat => cat.id === category.id)
                    const photoCount = categoryData?.photos?.length || 0
                    
                    return (
                      <Card key={category.id}>
                        <CardContent className="p-4 text-center">
                          <h4 className="font-medium">{category.name}</h4>
                          <p className="text-2xl font-bold text-primary">{photoCount}</p>
                          <p className="text-xs text-muted-foreground">photos</p>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>

              {/* Highlight Photos */}
              <div className="space-y-4">
                <h3 className="font-semibold">Highlight Photos</h3>
                <p className="text-sm text-muted-foreground">
                  {stats.highlights} photos selected as highlights. These will be featured prominently on your wedding site.
                </p>
                {stats.highlights > 0 && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      💡 Tip: Select 8-12 of your best photos as highlights for the best visual impact on your wedding site.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}