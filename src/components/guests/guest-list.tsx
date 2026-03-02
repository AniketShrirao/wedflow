'use client'

import { useState, useEffect } from 'react'
import { Guest } from '@/lib/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Plus, Edit, Trash2, MessageSquare, Phone, Archive } from 'lucide-react'
import { GuestForm } from './guest-form'
import { BulkImport } from './bulk-import'
import { InvitationPreview } from './invitation-preview'
import { DownloadButtons } from './download-buttons'

interface GuestListProps {
  initialGuests?: Guest[]
  couple?: any // We'll get this from the parent component
}

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
}

export function GuestList({ initialGuests = [], couple }: GuestListProps) {
  const [guests, setGuests] = useState<Guest[]>(initialGuests)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [groupFilter, setGroupFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [showGuestForm, setShowGuestForm] = useState(false)
  const [showBulkImport, setShowBulkImport] = useState(false)
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null)
  const [showInvitationPreview, setShowInvitationPreview] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)

  // Get unique groups for filter
  const uniqueGroups = Array.from(new Set(guests.map(g => g.group_name).filter(Boolean)))

  const fetchGuests = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
        ...(groupFilter && groupFilter !== 'all' && { group: groupFilter }),
        ...(statusFilter && statusFilter !== 'all' && { status: statusFilter })
      })

      const response = await fetch(`/api/guests?${params}`)
      if (!response.ok) throw new Error('Failed to fetch guests')

      const data = await response.json()
      setGuests(data.guests)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching guests:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGuests()
  }, [pagination.page, search, groupFilter, statusFilter])

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === guests.length) setSelectedIds([])
    else setSelectedIds(guests.map(g => g.id))
  }

  const exportSelectedAsZip = async () => {
    if (selectedIds.length === 0) return alert('No guests selected')
    try {
      const params = new URLSearchParams()
      params.set('format', 'xlsx')
      params.set('zip', 'true')
      params.set('ids', selectedIds.join(','))
      const url = `/api/export/guests?${params.toString()}`
      const res = await fetch(url)
      if (!res.ok) {
        const body = await res.text().catch(() => '')
        console.error('Export request failed', { status: res.status, body })
        throw new Error(`Export failed: ${res.status} ${body}`)
      }

      // Prefer arrayBuffer -> Blob to preserve mime type
      const buffer = await res.arrayBuffer()
      const contentType = res.headers.get('Content-Type') || 'application/zip'
      const contentDisposition = res.headers.get('Content-Disposition') || ''
      let filename = `guests-selected.zip`
      const match = /filename="?(.*?)"?$/.exec(contentDisposition)
      if (match && match[1]) filename = match[1].replace(/"/g, '')

      const blob = new Blob([buffer], { type: contentType })
      const urlObj = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = urlObj
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      // cleanup
      URL.revokeObjectURL(urlObj)
    } catch (err) {
      console.error('Bulk export error', err)
      alert(err instanceof Error ? err.message : 'Export failed')
    }
  }

  const handleDeleteGuest = async (guestId: string) => {
    if (!confirm('Are you sure you want to delete this guest?')) return

    try {
      const response = await fetch(`/api/guests/${guestId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete guest')

      await fetchGuests()
    } catch (error) {
      console.error('Error deleting guest:', error)
      alert('Failed to delete guest')
    }
  }

  const handleGuestSaved = () => {
    setShowGuestForm(false)
    setEditingGuest(null)
    fetchGuests()
  }

  const handleBulkImportComplete = () => {
    setShowBulkImport(false)
    fetchGuests()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="default">Sent</Badge>
      case 'viewed':
        return <Badge variant="secondary">Viewed</Badge>
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  const handleShowInvitationPreview = (guest: Guest) => {
    setSelectedGuest(guest)
    setShowInvitationPreview(true)
  }

  const handleSendInvitation = async (guest: Guest, method: 'whatsapp' | 'sms') => {
    try {
      // Send invitation via Twilio API
      const response = await fetch(`/api/guests/${guest.id}/send-invitation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ method }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send invitation')
      }

      // Show success message
      alert(result.message || `Invitation sent successfully via ${method.toUpperCase()}`)

      // Refresh the guest list
      await fetchGuests()

      // Close the preview
      setShowInvitationPreview(false)
      setSelectedGuest(null)
    } catch (error) {
      console.error('Error sending invitation:', error)
      alert(error instanceof Error ? error.message : 'Failed to send invitation')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Guest List</h2>
          <p className="text-gray-600">Manage your wedding guests</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowBulkImport(true)} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Bulk Import
          </Button>
          <Button onClick={() => setShowGuestForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Guest
          </Button>
          <Button onClick={exportSelectedAsZip} variant="outline" disabled={selectedIds.length === 0}>
            <Archive className="w-4 h-4 mr-2" />
            Export Selected ({selectedIds.length})
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{pagination.total}</div>
            <p className="text-sm text-gray-600">Total Guests</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {guests.filter(g => g.invite_status === 'sent').length}
            </div>
            <p className="text-sm text-gray-600">Invites Sent</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {guests.filter(g => g.invite_status === 'viewed').length}
            </div>
            <p className="text-sm text-gray-600">Invites Viewed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {guests.filter(g => g.invite_status === 'pending').length}
            </div>
            <p className="text-sm text-gray-600">Pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search guests by name, phone, or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={groupFilter} onValueChange={setGroupFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Groups</SelectItem>
                {uniqueGroups.map(group => (
                  <SelectItem key={group} value={group!}>{group}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="viewed">Viewed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Guest Table */}
      <Card>
        <CardHeader>
          <CardTitle>Guests ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading guests...</div>
          ) : guests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No guests found. Add your first guest to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <input type="checkbox" checked={selectedIds.length === guests.length && guests.length > 0} onChange={toggleSelectAll} />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Group</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {guests.map((guest) => (
                    <TableRow key={guest.id}>
                      <TableCell>
                        <input type="checkbox" checked={selectedIds.includes(guest.id)} onChange={() => toggleSelect(guest.id)} />
                      </TableCell>
                      <TableCell className="font-medium">{guest.name}</TableCell>
                      <TableCell>{guest.phone}</TableCell>
                      <TableCell>{guest.email || '-'}</TableCell>
                      <TableCell>{guest.group_name || '-'}</TableCell>
                      <TableCell>{getStatusBadge(guest.invite_status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingGuest(guest)
                              setShowGuestForm(true)
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteGuest(guest.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleShowInvitationPreview(guest)}
                          >
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                          <DownloadButtons resource="guests" id={guest.id} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} guests
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Guest Form Dialog */}
      {showGuestForm && (
        <GuestForm
          guest={editingGuest}
          onSave={handleGuestSaved}
          onCancel={() => {
            setShowGuestForm(false)
            setEditingGuest(null)
          }}
        />
      )}

      {/* Bulk Import Dialog */}
      {showBulkImport && (
        <BulkImport
          onComplete={handleBulkImportComplete}
          onCancel={() => setShowBulkImport(false)}
        />
      )}

      {/* Invitation Preview Dialog */}
      {showInvitationPreview && selectedGuest && couple && (
        <InvitationPreview
          guest={selectedGuest}
          couple={couple}
          onClose={() => {
            setShowInvitationPreview(false)
            setSelectedGuest(null)
          }}
          onSendInvitation={handleSendInvitation}
        />
      )}
    </div>
  )
}