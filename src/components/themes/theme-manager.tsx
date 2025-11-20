'use client'

import React, { useState } from 'react'
import { ThemeSelector } from './theme-selector'
import { TemplatePreview } from './template-preview'
import { WeddingTemplate } from '@/lib/sanity/service'

export function ThemeManager() {
  const [previewTemplate, setPreviewTemplate] = useState<WeddingTemplate | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const handlePreview = (template: WeddingTemplate) => {
    setPreviewTemplate(template)
    setIsPreviewOpen(true)
  }

  const handleClosePreview = () => {
    setIsPreviewOpen(false)
    setPreviewTemplate(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Wedding Themes</h1>
        <p className="text-muted-foreground mt-2">
          Customize the look and feel of your wedding website with beautiful themes.
        </p>
      </div>

      <ThemeSelector onPreview={handlePreview} />

      <TemplatePreview
        template={previewTemplate}
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
      />
    </div>
  )
}