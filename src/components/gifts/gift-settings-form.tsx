'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, X, Eye, EyeOff, Copy, Check, QrCode, CreditCard } from 'lucide-react'
import { GiftSettings } from '@/lib/types/database'
import { toast } from 'sonner'

interface GiftSettingsFormProps {
  initialSettings?: GiftSettings | null
  onSave: (settings: Partial<GiftSettings>) => Promise<void>
  isLoading?: boolean
}

export function GiftSettingsForm({ initialSettings, onSave, isLoading }: GiftSettingsFormProps) {
  const [upiId, setUpiId] = useState(initialSettings?.upi_id || '')
  const [qrCodeUrl, setQrCodeUrl] = useState(initialSettings?.qr_code_url || '')
  const [customMessage, setCustomMessage] = useState(initialSettings?.custom_message || '')
  const [showPreview, setShowPreview] = useState(false)
  const [copied, setCopied] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    setUploading(true)
    try {
      // Convert file to base64 for preview
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setQrCodeUrl(result)
        toast.success('QR code uploaded successfully')
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading file:', error)
      toast.error('Failed to upload QR code')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveQrCode = () => {
    setQrCodeUrl('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSave = async () => {
    try {
      await onSave({
        upi_id: upiId.trim() || null,
        qr_code_url: qrCodeUrl || null,
        custom_message: customMessage.trim() || null
      })
      toast.success('Gift settings saved successfully')
    } catch (error) {
      console.error('Error saving gift settings:', error)
      toast.error('Failed to save gift settings')
    }
  }

  const copyUpiId = async () => {
    if (upiId) {
      try {
        await navigator.clipboard.writeText(upiId)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        toast.success('UPI ID copied to clipboard')
      } catch (err) {
        console.error('Failed to copy UPI ID:', err)
        toast.error('Failed to copy UPI ID')
      }
    }
  }

  const validateUpiId = (value: string) => {
    if (!value) return true
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/
    return upiRegex.test(value)
  }

  const isUpiIdValid = validateUpiId(upiId)

  return (
    <div className="space-y-6">
      {/* UPI Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            UPI Payment Details
          </CardTitle>
          <CardDescription>
            Set up your UPI ID for receiving digital gifts from guests
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="upi-id">UPI ID</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  id="upi-id"
                  type="text"
                  placeholder="yourname@paytm"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className={!isUpiIdValid ? 'border-red-500' : ''}
                />
                {!isUpiIdValid && (
                  <p className="text-sm text-red-500 mt-1">
                    Please enter a valid UPI ID (e.g., yourname@paytm)
                  </p>
                )}
              </div>
              {upiId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyUpiId}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
            <p className="text-sm text-gray-500">
              Enter your UPI ID (e.g., yourname@paytm, yourname@gpay)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* QR Code Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            UPI QR Code
          </CardTitle>
          <CardDescription>
            Upload your UPI QR code image for easy payments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!qrCodeUrl ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Upload your UPI QR code image
              </p>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Uploading...' : 'Choose Image'}
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                Supports JPG, PNG, GIF up to 5MB
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative inline-block">
                <img
                  src={qrCodeUrl}
                  alt="UPI QR Code"
                  className="w-48 h-48 object-contain border rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0"
                  onClick={handleRemoveQrCode}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Replace Image
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Custom Message */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Message</CardTitle>
          <CardDescription>
            Add a personal message for your guests (optional)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="custom-message">Message</Label>
            <Textarea
              id="custom-message"
              placeholder="Your presence is the greatest gift, but if you wish to bless us with something more..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <p className="text-sm text-gray-500">
              {customMessage.length}/500 characters
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Preview
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Hide Preview
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Show Preview
                </>
              )}
            </Button>
          </CardTitle>
          <CardDescription>
            See how your gift portal will appear to guests
          </CardDescription>
        </CardHeader>
        {showPreview && (
          <CardContent>
            <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-8 rounded-lg">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 max-w-md mx-auto">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-serif font-light text-gray-800 mb-4">
                    Bless Us With Your Gifts
                  </h3>
                  {customMessage && (
                    <p className="text-gray-700 italic mb-4">
                      "{customMessage}"
                    </p>
                  )}
                </div>

                {qrCodeUrl && (
                  <div className="text-center mb-6">
                    <div className="inline-block p-4 bg-gray-50 rounded-xl">
                      <img
                        src={qrCodeUrl}
                        alt="UPI QR Code"
                        className="w-32 h-32 mx-auto rounded-lg"
                      />
                    </div>
                    <p className="text-gray-600 mt-2 text-sm">
                      Scan QR code to send gift
                    </p>
                  </div>
                )}

                {upiId && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-800 mb-2 text-center">
                      UPI ID
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <code className="text-gray-900 font-mono text-sm text-center block">
                        {upiId}
                      </code>
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Open any UPI app and scan the QR code or enter the UPI ID
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isLoading || !isUpiIdValid}
          size="lg"
        >
          {isLoading ? 'Saving...' : 'Save Gift Settings'}
        </Button>
      </div>
    </div>
  )
}