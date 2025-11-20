'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { WeddingTemplate } from '@/lib/sanity/service'
import { urlFor } from '@/lib/sanity/client'
import { useTheme } from './theme-provider'
import { X, Palette } from 'lucide-react'

interface TemplatePreviewProps {
  template: WeddingTemplate | null
  isOpen: boolean
  onClose: () => void
  onApply?: (templateId: string) => void
}

export function TemplatePreview({ template, isOpen, onClose, onApply }: TemplatePreviewProps) {
  const { applyTheme, isLoading } = useTheme()

  if (!template) return null

  const handleApply = async () => {
    if (onApply) {
      onApply(template._id)
    } else {
      await applyTheme(template._id)
    }
    onClose()
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

  const getHeaderStyleLabel = (style: string) => {
    const labels: Record<string, string> = {
      centered: 'Centered',
      left: 'Left Aligned',
      split: 'Split Layout'
    }
    return labels[style] || style
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            {template.name} Preview
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Preview Image */}
          {template.preview && (
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              <img
                src={urlFor(template.preview).width(800).height(450).url()}
                alt={template.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Template Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Template Details</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">Name:</span>
                    <span className="ml-2 text-sm">{template.name}</span>
                  </div>
                  {template.description && (
                    <div>
                      <span className="text-sm font-medium">Description:</span>
                      <p className="text-sm text-muted-foreground mt-1">
                        {template.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Layout Configuration */}
              <div>
                <h3 className="font-semibold mb-2">Layout Style</h3>
                <div className="space-y-2">
                  <Badge variant="secondary">
                    {getLayoutStyleLabel(template.layout.style)}
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    Header: {getHeaderStyleLabel(template.layout.headerStyle)}
                  </div>
                </div>
              </div>
            </div>

            {/* Color Scheme & Fonts */}
            <div className="space-y-4">
              {/* Color Palette */}
              <div>
                <h3 className="font-semibold mb-2">Color Palette</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: template.colorScheme.primary }}
                    />
                    <div>
                      <div className="text-sm font-medium">Primary</div>
                      <div className="text-xs text-muted-foreground">
                        {template.colorScheme.primary}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: template.colorScheme.secondary }}
                    />
                    <div>
                      <div className="text-sm font-medium">Secondary</div>
                      <div className="text-xs text-muted-foreground">
                        {template.colorScheme.secondary}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: template.colorScheme.accent }}
                    />
                    <div>
                      <div className="text-sm font-medium">Accent</div>
                      <div className="text-xs text-muted-foreground">
                        {template.colorScheme.accent}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: template.colorScheme.background }}
                    />
                    <div>
                      <div className="text-sm font-medium">Background</div>
                      <div className="text-xs text-muted-foreground">
                        {template.colorScheme.background}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Typography */}
              <div>
                <h3 className="font-semibold mb-2">Typography</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">Heading Font:</span>
                    <div 
                      className="text-lg mt-1"
                      style={{ fontFamily: template.fonts.heading }}
                    >
                      {template.fonts.heading}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Body Font:</span>
                    <div 
                      className="text-sm mt-1"
                      style={{ fontFamily: template.fonts.body }}
                    >
                      {template.fonts.body}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mock Preview Section */}
          <div className="border rounded-lg p-6" style={{
            backgroundColor: template.colorScheme.background,
            color: template.colorScheme.primary
          }}>
            <div className="text-center space-y-4">
              <h1 
                className="text-3xl font-bold"
                style={{ 
                  fontFamily: template.fonts.heading,
                  color: template.colorScheme.primary
                }}
              >
                Sarah & Michael
              </h1>
              <p 
                className="text-lg"
                style={{ 
                  fontFamily: template.fonts.body,
                  color: template.colorScheme.accent
                }}
              >
                We're getting married!
              </p>
              <div 
                className="inline-block px-6 py-2 rounded-full text-white"
                style={{ backgroundColor: template.colorScheme.accent }}
              >
                <span style={{ fontFamily: template.fonts.body }}>
                  December 15, 2024
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={handleApply} disabled={isLoading}>
              {isLoading ? 'Applying...' : 'Apply This Theme'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}