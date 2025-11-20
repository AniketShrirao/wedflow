'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { InsertCouple } from '@/lib/types/database'

interface ProfileSetupFormProps {
  userId: string
}

export function ProfileSetupForm({ userId }: ProfileSetupFormProps) {
  const [formData, setFormData] = useState({
    partner1_name: '',
    partner2_name: '',
    wedding_date: '',
    couple_slug: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
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
    
    // Auto-generate slug when partner names change
    if (field === 'partner1_name' || field === 'partner2_name') {
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

    try {
      const supabase = createClient()
      
      // Check if slug is already taken
      const { data: existingCouple } = await supabase
        .from('couples')
        .select('id')
        .eq('couple_slug', formData.couple_slug)
        .single()

      if (existingCouple) {
        setError('This couple name combination is already taken. Please try different names.')
        setIsLoading(false)
        return
      }

      // Create couple profile
      const coupleData: InsertCouple = {
        user_id: userId,
        partner1_name: formData.partner1_name,
        partner2_name: formData.partner2_name,
        wedding_date: formData.wedding_date || null,
        couple_slug: formData.couple_slug
      }

      const { error: insertError } = await supabase
        .from('couples')
        .insert(coupleData)

      if (insertError) {
        throw insertError
      }

      // Redirect to dashboard
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      console.error('Error creating couple profile:', err)
      setError('Failed to create profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>
            Set up your wedding profile to get started with Wedflow
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
              <Label htmlFor="wedding_date">Wedding Date (Optional)</Label>
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

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating Profile...' : 'Create Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}