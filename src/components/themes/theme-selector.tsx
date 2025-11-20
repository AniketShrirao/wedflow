'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTheme } from './theme-provider'
import { WeddingTemplate, SanityService } from '@/lib/sanity/service'
import { urlFor } from '@/lib/sanity/client'
import { Loader2, Palette, Eye } from 'lucide-react'

interface ThemeSelectorProps {
  onPreview?: (template: WeddingTemplate) => void
  showPreview?: boolean
}

export function ThemeSelector({ onPreview, showPreview = true }: ThemeSelectorProps) {
  const { theme, applyTheme, resetToDefault, isLoading } = useTheme()
  const [templates, setTemplates] = useState<WeddingTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const fetchedTemplates = await SanityService.getWeddingTemplates()
      setTemplates(fetchedTemplates)
    } catch (error) {
      console.error('Error loading templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApplyTheme = async (templateId: string) => {
    setSelectedTemplate(templateId)
    await applyTheme(templateId)
    setSelectedTemplate(null)
  }

  const handlePreview = (template: WeddingTemplate) => {
    if (onPreview) {
      onPreview(template)
    }
  }

  const getLayoutStyleLabel = (style: string) => {
    const labels: Record<string, string> = {
      classic: 'Classic',
      modern: 'Modern',
      elegant: 'Elegant',
      rustic: 'Rustic',
      minimalist: 'Minimalist'
    }
    return labels[style] || style
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Wedding Themes
          </CardTitle>
          <CardDescription>
            Choose a beautiful theme for your wedding website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading themes...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Wedding Themes
        </CardTitle>
        <CardDescription>
          Choose a beautiful theme for your wedding website
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Theme Info */}
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Current Theme</h4>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <div 
                className="w-6 h-6 rounded border"
                style={{ backgroundColor: theme.colors.primary }}
                title="Primary Color"
              />
              <div 
                className="w-6 h-6 rounded border"
                style={{ backgroundColor: theme.colors.secondary }}
                title="Secondary Color"
              />
              <div 
                className="w-6 h-6 rounded border"
                style={{ backgroundColor: theme.colors.accent }}
                title="Accent Color"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {theme.fonts.heading} • {theme.fonts.body}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDefault}
              disabled={isLoading}
            >
              Reset to Default
            </Button>
          </div>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card key={template._id} className="overflow-hidden">
              {template.preview && (
                <div className="aspect-video bg-muted">
                  <img
                    src={urlFor(template.preview).width(300).height(200).url()}
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium">{template.name}</h4>
                    {template.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {template.description}
                      </p>
                    )}
                  </div>

                  {/* Color Palette */}
                  <div className="flex gap-2">
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: template.colorScheme.primary }}
                      title="Primary"
                    />
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: template.colorScheme.secondary }}
                      title="Secondary"
                    />
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: template.colorScheme.accent }}
                      title="Accent"
                    />
                  </div>

                  {/* Style Badge */}
                  <Badge variant="secondary" className="text-xs">
                    {getLayoutStyleLabel(template.layout.style)}
                  </Badge>

                  {/* Font Info */}
                  <div className="text-xs text-muted-foreground">
                    {template.fonts.heading} • {template.fonts.body}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => handleApplyTheme(template._id)}
                      disabled={isLoading || selectedTemplate === template._id}
                      className="flex-1"
                    >
                      {selectedTemplate === template._id ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          Applying...
                        </>
                      ) : (
                        'Apply Theme'
                      )}
                    </Button>
                    
                    {showPreview && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePreview(template)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {templates.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No themes available at the moment.</p>
            <p className="text-sm">Check back later for new wedding themes!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}