'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Upload, FileText, Download } from 'lucide-react'

interface BulkImportProps {
  onComplete: () => void
  onCancel: () => void
}

export function BulkImport({ onComplete, onCancel }: BulkImportProps) {
  const [textData, setTextData] = useState('')
  const [loading, setLoading] = useState(false)
  const [importMethod, setImportMethod] = useState<'text' | 'file'>('text')

  const handleTextImport = async () => {
    if (!textData.trim()) {
      alert('Please enter guest data to import')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/guests/bulk-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ textData: textData.trim() }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to import guests')
      }

      alert(`${result.message}${result.errors ? `\n\nWarnings:\n${result.errors.join('\n')}` : ''}`)
      onComplete()
    } catch (error) {
      console.error('Error importing guests:', error)
      alert(error instanceof Error ? error.message : 'Failed to import guests')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Handle Excel files
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      alert('Excel file support will be implemented in a future update. Please use CSV format or text paste for now.')
      return
    }

    // Handle CSV files
    if (file.name.endsWith('.csv') || file.type === 'text/csv') {
      const text = await file.text()
      setTextData(text)
      setImportMethod('text')
      return
    }

    alert('Please upload a CSV file or use the text paste method.')
  }

  const downloadTemplate = () => {
    const csvContent = 'Name,Phone,Email,Group,Event\nJohn Doe,+1234567890,john@example.com,Family,Ceremony\nJane Smith,+0987654321,jane@example.com,Friends,Reception'
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'guest-import-template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Bulk Import Guests</DialogTitle>
          <DialogDescription>
            Import multiple guests at once using text paste or file upload.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 bg-white">
          {/* Import Method Selection */}
          <div className="flex gap-4">
            <Button
              variant={importMethod === 'text' ? 'default' : 'outline'}
              onClick={() => setImportMethod('text')}
              className="flex-1"
            >
              <FileText className="w-4 h-4 mr-2" />
              Text Paste
            </Button>
            <Button
              variant={importMethod === 'file' ? 'default' : 'outline'}
              onClick={() => setImportMethod('file')}
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              File Upload
            </Button>
          </div>

          {/* Template Download */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-blue-900">Need a template?</h4>
                <p className="text-sm text-blue-700">
                  Download our CSV template to see the expected format.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <Download className="w-4 h-4 mr-2" />
                Download Template
              </Button>
            </div>
          </div>

          {importMethod === 'text' && (
            <div className="space-y-2">
              <Label htmlFor="textData">Guest Data</Label>
              <Textarea
                id="textData"
                value={textData}
                onChange={(e) => setTextData(e.target.value)}
                placeholder="Enter guest data in CSV format:\nName, Phone, Email, Group, Event\nJohn Doe, +1234567890, john@example.com, Family, Ceremony\nJane Smith, +0987654321, jane@example.com, Friends, Reception"
                className="min-h-[200px] font-mono text-sm"
              />
              <p className="text-sm text-gray-600">
                Format: Name, Phone, Email (optional), Group (optional), Event (optional)
                <br />
                Each guest should be on a separate line.
              </p>
            </div>
          )}

          {importMethod === 'file' && (
            <div className="space-y-2">
              <Label htmlFor="fileUpload">Upload File</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  id="fileUpload"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="fileUpload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Click to upload CSV or Excel file
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Supported formats: .csv, .xlsx, .xls
                  </p>
                </label>
              </div>
            </div>
          )}

          {/* Format Guidelines */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Format Guidelines:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Name and Phone are required fields</li>
              <li>• Email and Group are optional</li>
              <li>• Use comma-separated values (CSV format)</li>
              <li>• Phone numbers can include country codes</li>
              <li>• Group names help organize your guests</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleTextImport}
            disabled={loading || !textData.trim()}
          >
            {loading ? 'Importing...' : 'Import Guests'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}