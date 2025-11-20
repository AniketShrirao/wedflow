'use client'

import { useState, useEffect } from 'react'
import { GiftSettingsForm } from '@/components/gifts/gift-settings-form'
import { GiftSettings } from '@/lib/types/database'
import { toast } from 'sonner'

export default function GiftsPage() {
  const [giftSettings, setGiftSettings] = useState<GiftSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchGiftSettings()
  }, [])

  const fetchGiftSettings = async () => {
    try {
      const response = await fetch('/api/gifts')
      if (response.ok) {
        const data = await response.json()
        setGiftSettings(data)
      } else if (response.status !== 404) {
        console.error('Failed to fetch gift settings')
        toast.error('Failed to load gift settings')
      }
    } catch (error) {
      console.error('Error fetching gift settings:', error)
      toast.error('Failed to load gift settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (settings: Partial<GiftSettings>) => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/gifts', {
        method: giftSettings ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save gift settings')
      }

      const updatedSettings = await response.json()
      setGiftSettings(updatedSettings)
    } catch (error) {
      console.error('Error saving gift settings:', error)
      throw error
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gift Portal</h1>
          <p className="text-gray-600">
            Set up digital gift receiving with UPI integration
          </p>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-sm border">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gift Portal</h1>
        <p className="text-gray-600">
          Set up digital gift receiving with UPI integration
        </p>
      </div>
      
      <GiftSettingsForm
        initialSettings={giftSettings}
        onSave={handleSave}
        isLoading={isSaving}
      />
    </div>
  )
}