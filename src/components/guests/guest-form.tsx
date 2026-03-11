'use client'

import { useState } from 'react'
import { Guest } from '@/lib/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface GuestFormProps {
  guest?: Guest | null
  onSave: () => void
  onCancel: () => void
}

export function GuestForm({ guest, onSave, onCancel }: GuestFormProps) {
  const [formData, setFormData] = useState({
    name: guest?.name || '',
    phone: guest?.phone || '',
    email: guest?.email || '',
    group_name: guest?.group_name || '',
    event_name: guest?.event_name || '',
    invite_status: guest?.invite_status || 'pending'
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    try {
      const url = guest ? `/api/guests/${guest.id}` : '/api/guests'
      const method = guest ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim() || null,
          group_name: formData.group_name.trim() || null,
          event_name: formData.event_name.trim() || null,
          invite_status: formData.invite_status
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save guest')
      }

      onSave()
    } catch (error) {
      console.error('Error saving guest:', error)
      alert(error instanceof Error ? error.message : 'Failed to save guest')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {guest ? 'Edit Guest' : 'Add New Guest'}
          </DialogTitle>
          <DialogDescription>
            {guest
              ? 'Update the guest information below.'
              : 'Add a new guest to your wedding list.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter guest name"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Enter phone number"
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="group">Group (Optional)</Label>
            <Select
              value={formData.group_name}
              onValueChange={(value) => handleInputChange('group_name', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fam">Fam (Family)</SelectItem>
                <SelectItem value="Friends">Friends</SelectItem>
                <SelectItem value="Colleagues">Colleagues</SelectItem>
                <SelectItem value="Close Relative">Close Relative</SelectItem>
                <SelectItem value="Relatives">Relatives</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="event">Event (Optional)</Label>
            <Select
              value={formData.event_name}
              onValueChange={(value) => handleInputChange('event_name', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Engagement">Engagement</SelectItem>
                <SelectItem value="Wedding">Wedding</SelectItem>
                <SelectItem value="Sangeet">Sangeet</SelectItem>
                <SelectItem value="Haldi">Haldi</SelectItem>
                <SelectItem value="Reception">Reception</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {guest && (
            <div className="space-y-2">
              <Label htmlFor="status">Invitation Status</Label>
              <Select
                value={formData.invite_status}
                onValueChange={(value) => handleInputChange('invite_status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="viewed">Viewed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (guest ? 'Update Guest' : 'Add Guest')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}