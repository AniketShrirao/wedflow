'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, CheckCircle, AlertCircle } from 'lucide-react'
import { UploadManager } from '@/components/photos/upload-manager'
import { useToast } from '@/hooks/use-toast'

interface PhotoUploadSectionProps {
  coupleSlug?: string
  coupleId: string
}

export function PhotoUploadSection({ coupleId }: PhotoUploadSectionProps) {
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [uploadedImageCount, setUploadedImageCount] = useState(0)
  const { toast } = useToast()

  const handleStartUpload = () => {
    // Validate guest information
    if (!guestName.trim()) {
      toast({
        title: 'Name Required',
        description: 'Please enter your name to upload photos',
        variant: 'error'
      })
      return
    }

    setShowUploadForm(true)
  }

  const handleUploadComplete = (_uploadId: string, imageCount: number) => {
    setUploadedImageCount(imageCount)
    setUploadComplete(true)
    setShowUploadForm(false)

    // Reset form after 3 seconds
    setTimeout(() => {
      setGuestName('')
      setGuestEmail('')
      setUploadComplete(false)
      setUploadedImageCount(0)
    }, 3000)
  }

  return (
    <section className="py-16 md:py-24 bg-linear-to-b from-white to-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-linear-to-br from-pink-100 to-purple-100 mb-6 shadow-lg">
            <Upload className="h-8 w-8 md:h-10 md:w-10 text-pink-600" />
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-light text-gray-800 mb-4">
            Share Your Moments
          </h2>
          <div className="w-24 h-1 mx-auto bg-linear-to-r from-pink-400 to-purple-400 rounded-full mb-6" />
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Upload your photos from the celebration and help us capture every special moment
          </p>
        </div>

        {/* Upload Success Message */}
        {uploadComplete && (
          <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-lg flex items-start gap-4">
            <CheckCircle className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900 mb-1">Upload Successful!</h3>
              <p className="text-green-700">
                Thank you for sharing {uploadedImageCount} photo{uploadedImageCount !== 1 ? 's' : ''}! Your photos have been added to our collection.
              </p>
            </div>
          </div>
        )}

        {/* Guest Information Form */}
        {!showUploadForm && !uploadComplete && (
          <Card className="max-w-2xl mx-auto shadow-lg border-0">
            <CardHeader className="bg-linear-to-r from-pink-50 to-purple-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-pink-600" />
                Upload Your Photos
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="guestName" className="text-base font-medium">
                  Your Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="guestName"
                  type="text"
                  placeholder="Enter your full name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="text-base py-2 h-auto"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleStartUpload()
                    }
                  }}
                />
                <p className="text-sm text-gray-500">
                  We'll use this to credit your photos
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="guestEmail" className="text-base font-medium">
                  Email Address <span className="text-gray-400">(Optional)</span>
                </Label>
                <Input
                  id="guestEmail"
                  type="email"
                  placeholder="your.email@example.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="text-base py-2 h-auto"
                />
                <p className="text-sm text-gray-500">
                  We'll only use this to contact you about your uploads
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">Upload Guidelines:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Support for JPG, PNG, and other common image formats</li>
                      <li>You can upload multiple files at once or a ZIP archive</li>
                      <li>Photos will be organized by event category</li>
                      <li>All uploads are tracked and credited to you</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleStartUpload}
                size="lg"
                className="w-full bg-linear-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-base py-6"
              >
                <Upload className="h-5 w-5 mr-2" />
                Continue to Upload
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Upload Manager Component */}
        {showUploadForm && (
          <div className="max-w-2xl mx-auto">
            <UploadManager
              coupleId={coupleId}
              uploaderName={guestName}
              uploaderEmail={guestEmail || undefined}
              uploadSource="public_site"
              onUploadComplete={handleUploadComplete}
              className="shadow-lg border-0"
            />
            <Button
              onClick={() => {
                setShowUploadForm(false)
                setGuestName('')
                setGuestEmail('')
              }}
              variant="outline"
              className="w-full mt-4"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
