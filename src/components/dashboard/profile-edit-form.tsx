'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { Couple, UpdateCouple } from '@/lib/types/database'

interface ProfileEditFormProps {
  couple: Couple
}

export function ProfileEditForm({ couple }: ProfileEditFormProps) {
  const [formData, setFormData] = useState({
    partner1_name: couple.partner1_name,
    partner2_name: couple.partner2_name,
    wedding_date: couple.wedding_date || '',
    couple_slug: couple.couple_slug
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  // Generate slug from partner names
  const generateSlug = (name1: string, name2: string) => {
    if (!name1 || !name2) return ''
    const slug = `${name1.toLowerCase()}-${name2.toLowerCase()}`
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    return slug
  }

  const handleInputChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value }
    
    // Auto-generate slug when partner names change (but allow manual override)
    if ((field === 'partner1_name' || field === 'partner2_name') && 
        formData.couple_slug === generateSlug(formData.partner1_name, formData.partner2_name)) {
      newFormData.couple_slug = generateSlug(
        field === 'partner1_name' ? value : formData.partner1_name,
        field === 'partner2_name' ? value : formData.partner2_name
      )
    }
    
    setFormData(newFormData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const supabase = createClient()
      
      // Check if slug is already taken by another couple
      if (formData.couple_slug !== couple.couple_slug) {
        const { data: existingCouple } = await supabase
          .from('couples')
          .select('id')
          .eq('couple_slug', formData.couple_slug)
          .neq('id', couple.id)
          .single()

        if (existingCouple) {
          setError('This couple name combination is already taken. Please try different names.')
          setIsLoading(false)
          return
        }
      }

      // Update couple profile
      const updateData: UpdateCouple = {
        partner1_name: formData.partner1_name,
        partner2_name: formData.partner2_name,
        wedding_date: formData.wedding_date || null,
        couple_slug: formData.couple_slug,
        updated_at: new Date().toISOString()
      }

      const { error: updateError } = await supabase
        .from('couples')
        .update(updateData)
        .eq('id', couple.id)

      if (updateError) {
        throw updateError
      }

      setSuccess('Profile updated successfully!')
      router.refresh()
    } catch (err) {
      console.error('Error updating couple profile:', err)
      setError('Failed to update profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>
          Update your wedding profile information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="partner1_name">Partner 1 Name</Label>
            <Input
              id="partner1_name"
              type="text"
              value={formData.partner1_name}
              onChange={(e) => handleInputChange('partner1_name', e.target.value)}
              required
              placeholder="Enter first partner's name"
            />
          </div>

          <div>
            <Label htmlFor="partner2_name">Partner 2 Name</Label>
            <Input
              id="partner2_name"
              type="text"
              value={formData.partner2_name}
              onChange={(e) => handleInputChange('partner2_name', e.target.value)}
              required
              placeholder="Enter second partner's name"
            />
          </div>

          <div>
            <Label htmlFor="wedding_date">Wedding Date</Label>
            <Input
              id="wedding_date"
              type="date"
              value={formData.wedding_date}
              onChange={(e) => handleInputChange('wedding_date', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="couple_slug">Your Wedding URL</Label>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">wedflow.com/</span>
              <Input
                id="couple_slug"
                type="text"
                value={formData.couple_slug}
                onChange={(e) => handleInputChange('couple_slug', e.target.value)}
                required
                placeholder="your-wedding-url"
                pattern="[a-z0-9-]+"
                title="Only lowercase letters, numbers, and hyphens allowed"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              This will be your public wedding site URL
            </p>
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          {success && (
            <div className="text-green-600 text-sm">{success}</div>
          )}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update Profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}