'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DownloadCloud, FileText, Archive } from 'lucide-react'

interface DownloadButtonsProps {
  resource: string
  id?: string
  className?: string
  apiPath?: string
  primaryFormat?: 'xlsx' | 'pdf' | 'csv' | 'json'
  secondaryFormat?: 'xlsx' | 'pdf' | 'csv' | 'json'
  zipFormat?: 'xlsx' | 'pdf' | 'csv' | 'json'
}

export function DownloadButtons({ resource, id, className, apiPath, primaryFormat = 'xlsx', secondaryFormat = 'pdf', zipFormat = 'xlsx' }: DownloadButtonsProps) {
  const [loading, setLoading] = useState(false)

  const download = async (format: string, zip = false) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.set('format', format)
      if (id) params.set('id', id)
      if (zip) params.set('zip', 'true')

      const base = apiPath ? apiPath.replace(/\/?\?/, '') : `/api/export/${resource}`
      const url = `${base}?${params.toString()}`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Download failed')

      const blob = await res.blob()
      const contentDisposition = res.headers.get('Content-Disposition') || ''
      let filename = `${resource}.${format}`
      const match = /filename="?(.*?)"?$/.exec(contentDisposition)
      if (match && match[1]) filename = match[1].replace(/"/g, '')

      const urlObj = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = urlObj
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(urlObj)
    } catch (err) {
      console.error('Download error', err)
      alert(err instanceof Error ? err.message : 'Download failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={className ?? 'flex items-center gap-2'}>
      <Button size="sm" variant="outline" onClick={() => download(primaryFormat as any)} disabled={loading} title={`Download ${primaryFormat?.toUpperCase()}`}>
        <DownloadCloud className="w-4 h-4 mr-2" />
        <span>{primaryFormat === 'xlsx' ? 'Export' : primaryFormat.toUpperCase()}</span>
      </Button>
      <Button size="sm" variant="outline" onClick={() => download(secondaryFormat as any)} disabled={loading} className="ml-2" title={`Download ${secondaryFormat?.toUpperCase()}`}>
        <FileText className="w-4 h-4 mr-2" />
        <span>{secondaryFormat.toUpperCase()}</span>
      </Button>
      <Button size="sm" variant="outline" onClick={() => download(zipFormat as any, true)} disabled={loading} className="ml-2" title="Download ZIP">
        <Archive className="w-4 h-4 mr-2" />
        <span>ZIP</span>
      </Button>
    </div>
  )
}
