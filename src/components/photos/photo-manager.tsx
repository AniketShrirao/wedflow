'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { PhotoGallery } from './photo-gallery'
import { UploadManager } from './upload-manager'
import { UploadHistory } from './upload-history'
import { CategoryManager } from './category-manager'
import { PhotoCollection, Photo, PHOTO_CATEGORIES } from '@/lib/types/photos'
import { Folder, Upload, Star, Settings, ExternalLink, History } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { photoService, type Category } from '@/lib/services/photo-service'
import { createClient } from '@/lib/supabase/client'

export function PhotoManager() {
  const [photoCollection, setPhotoCollection] = useState<PhotoCollection | null>(null)
  const [driveUrl, setDriveUrl] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'gallery' | 'upload' | 'history' | 'settings'>('upload')
  const [coupleId, setCoupleId] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const initializeData = async () => {
      const id = await fetchCoupleId()
      if (id) {
        await fetchPhotoCollection(id)
      } else {
        await fetchPhotoCollection()
      }
    }
    initializeData()
  }, [])

  const fetchCoupleId = async (): Promise<string | null> => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: couple } = await supabase
          .from('couples')
          .select('id')
          .eq('user_id', user.id)
          .single()
        if (couple) {
          setCoupleId(couple.id)
          return couple.id
        }
      }
    } catch (error) {
      console.error('Error fetching couple ID:', error)
    }
    return null
  }

  const fetchPhotoCollection = async (coupleIdParam?: string) => {
    try {
      setIsRefreshing(true)
      const response = await fetch('/api/photos')
      if (response.ok) {
        const data = await response.json()
        setPhotoCollection(data)
        setDriveUrl(data.drive_folder_url || '')
      }

      // Fetch categories if couple ID is available
      const idToUse = coupleIdParam || coupleId
      if (idToUse) {
        try {
          const availableCategories = await photoService.getAvailableCategories(idToUse)
          setCategories(availableCategories)
        } catch (error) {
          console.error('Error fetching categories:', error)
          // Continue without categories - they're optional
        }
      }
    } catch (error) {
      console.error('Failed to fetch photo collection:', error)
      console.error('Failed to load photo collection')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const saveDriveUrl = async () => {
    if (!driveUrl.trim()) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid Google Drive folder URL',
        variant: 'error'
      })
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
        toast({
          title: 'Success',
          description: 'Google Drive folder connected successfully!'
        })
      } else {
        toast({
          title: 'Error',
          description: 'Failed to save Google Drive folder',
          variant: 'error'
        })
      }
    } catch (error) {
      console.error('Failed to save drive URL:', error)
      toast({
        title: 'Error',
        description: 'Failed to save Google Drive folder',
        variant: 'error'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleUploadComplete = async (uploadId: string, imageCount: number) => {
    try {
      // Refresh the photo collection to show new images
      await fetchPhotoCollection()
      toast({
        title: 'Upload Complete',
        description: `Successfully uploaded ${imageCount} photo(s)!`
      })
    } catch (error) {
      console.error('Failed to refresh photo collection:', error)
      toast({
        title: 'Error',
        description: 'Failed to refresh photo collection',
        variant: 'error'
      })
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
        // Update the photo collection with new highlights
        setPhotoCollection({
          ...photoCollection,
          highlight_photos: data.highlight_photos || newHighlights
        })
        toast({
          title: 'Updated',
          description: currentHighlights.includes(photoId) ? 'Removed from highlights' : 'Added to highlights'
        })
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update highlights',
          variant: 'error'
        })
      }
    } catch (error) {
      console.error('Failed to update highlights:', error)
      toast({
        title: 'Error',
        description: 'Failed to update highlights',
        variant: 'error'
      })
    }
  }

  const handlePhotoDelete = async (photoId: string) => {
    if (!photoCollection) return

    try {
      const response = await fetch('/api/photos/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ photoId }),
      })

      if (response.ok) {
        await fetchPhotoCollection()
        toast({
          title: 'Deleted',
          description: 'Photo deleted successfully'
        })
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete photo',
          variant: 'error'
        })
      }
    } catch (error) {
      console.error('Failed to delete photo:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete photo',
        variant: 'error'
      })
    }
  }

  const getPhotoStats = () => {
    if (!photoCollection) return { total: 0, highlights: 0, categories: 0 }

    // Handle both old format (with categories array) and new format (empty columns)
    const categories = photoCollection.categories || []
    const total = Array.isArray(categories) ? categories.reduce((sum, cat) => sum + (cat.photos?.length || 0), 0) : 0
    const highlights = Array.isArray(photoCollection.highlight_photos) ? photoCollection.highlight_photos.length : 0
    const categoriesWithPhotos = Array.isArray(categories) ? categories.filter(cat => (cat.photos?.length || 0) > 0).length : 0

    return { total, highlights, categories: categoriesWithPhotos }
  }

  const stats = getPhotoStats()

  // Set default tab based on whether photos exist (only on initial load)
  useEffect(() => {
    if (isLoading) return
    
    // Only set tab if it hasn't been explicitly set by user
    if (activeTab === 'upload' && stats.total > 0) {
      setActiveTab('gallery')
    }
  }, [isLoading])

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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Photo Management</h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
            Manage your wedding photos and create beautiful galleries
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-xs">{stats.total} Photos</Badge>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>{stats.highlights} Highlights</span>
          </div>
          <div className="flex items-center gap-1">
            <Folder className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>{stats.categories} Categories</span>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'gallery' | 'upload' | 'history' | 'settings')} className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-auto p-1 gap-1 bg-muted rounded-lg">
          <TabsTrigger value="gallery" disabled={stats.total === 0} className="text-xs sm:text-sm py-2 px-1">
            <Folder className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Gallery</span>
            <span className="sm:hidden">({stats.total})</span>
          </TabsTrigger>
          <TabsTrigger value="upload" className="text-xs sm:text-sm py-2 px-1">
            <Upload className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Upload</span>
            <span className="sm:hidden">Up</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs sm:text-sm py-2 px-1">
            <History className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">History</span>
            <span className="sm:hidden">Hist</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-xs sm:text-sm py-2 px-1">
            <Settings className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Settings</span>
            <span className="sm:hidden">Set</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gallery" className="mt-6">
          {isRefreshing ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin">
                    <Folder className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">Loading photos...</p>
                </div>
              </CardContent>
            </Card>
          ) : !photoCollection || stats.total === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Folder className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Photos Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Upload your first photos to see them in the gallery
                </p>
                <Button onClick={() => setActiveTab('upload')}>
                  Go to Upload
                </Button>
              </CardContent>
            </Card>
          ) : (
            <PhotoGallery
              photoCollection={photoCollection}
              onHighlightToggle={handleHighlightToggle}
              onPhotoDelete={handlePhotoDelete}
              showHighlightControls={true}
            />
          )}
        </TabsContent>

        <TabsContent value="upload" className="mt-6">
          {isRefreshing ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin">
                    <Upload className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">Loading upload settings...</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <UploadManager
              coupleId={coupleId || undefined}
              uploaderName="Dashboard User"
              uploadSource="dashboard"
              onUploadComplete={handleUploadComplete}
            />
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          {isRefreshing ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin">
                    <History className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">Loading upload history...</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <UploadHistory coupleId={coupleId || undefined} />
          )}
        </TabsContent>

        <TabsContent value="settings" className="mt-4 sm:mt-6 space-y-6">
          {isRefreshing ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin">
                    <Settings className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">Loading settings...</p>
                </div>
              </CardContent>
            </Card>
          ) : (
          <>
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
                  {/* Always show default categories */}
                  {['Haldi', 'Sangeet', 'Wedding', 'Reception'].map(defaultName => {
                    const category = categories.find(c => c.category_name === defaultName)
                    return (
                      <Card key={defaultName}>
                        <CardContent className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Folder className="h-4 w-4 text-muted-foreground" />
                            <h4 className="font-medium">{defaultName}</h4>
                          </div>
                          <Badge variant="secondary" className="mb-2 text-xs">Default</Badge>
                          <p className="text-xs text-muted-foreground">
                            {category ? 'Created' : 'Not created'}
                          </p>
                        </CardContent>
                      </Card>
                    )
                  })}
                  
                  {/* Show custom categories */}
                  {categories.filter(c => c.category_type === 'custom').map(category => (
                    <Card key={category.id}>
                      <CardContent className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Folder className="h-4 w-4 text-primary" />
                          <h4 className="font-medium">{category.category_name}</h4>
                        </div>
                        <Badge className="mb-2 text-xs">Custom</Badge>
                        <p className="text-xs text-muted-foreground">
                          Custom category
                        </p>
                      </CardContent>
                    </Card>
                  ))}
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

          <CategoryManager coupleId={coupleId || undefined} />
          </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}