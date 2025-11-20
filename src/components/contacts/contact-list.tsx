'use client'

import { useState, useEffect } from 'react'
import { VendorContact } from '@/lib/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Plus, Edit, Trash2, Download, Phone, Mail } from 'lucide-react'
import { ContactForm } from './contact-form'

interface ContactListProps {
  initialContacts?: VendorContact[]
}

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
}

const VENDOR_CATEGORIES = [
  { value: 'decorator', label: 'Decorator' },
  { value: 'event_coordinator', label: 'Event Coordinator' },
  { value: 'hall_manager', label: 'Hall Manager' },
  { value: 'transport', label: 'Transport' },
  { value: 'photographer', label: 'Photographer' },
  { value: 'caterer', label: 'Caterer' }
]

export function ContactList({ initialContacts = [] }: ContactListProps) {
  const [contacts, setContacts] = useState<VendorContact[]>(initialContacts)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [showContactForm, setShowContactForm] = useState(false)
  const [editingContact, setEditingContact] = useState<VendorContact | null>(null)

  const fetchContacts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
        ...(categoryFilter && categoryFilter !== 'all' && { category: categoryFilter })
      })

      const response = await fetch(`/api/contacts?${params}`)
      if (!response.ok) throw new Error('Failed to fetch contacts')
      
      const data = await response.json()
      setContacts(data.contacts)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [pagination.page, search, categoryFilter])

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return

    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete contact')
      
      await fetchContacts()
    } catch (error) {
      console.error('Error deleting contact:', error)
      alert('Failed to delete contact')
    }
  }

  const handleContactSaved = () => {
    setShowContactForm(false)
    setEditingContact(null)
    fetchContacts()
  }

  const handleExportContacts = async (format: 'csv' | 'json' = 'csv') => {
    try {
      const params = new URLSearchParams({
        format,
        ...(categoryFilter && categoryFilter !== 'all' && { category: categoryFilter })
      })

      const response = await fetch(`/api/contacts/export?${params}`)
      if (!response.ok) throw new Error('Failed to export contacts')

      if (format === 'csv') {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'vendor-contacts.csv'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const data = await response.json()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'vendor-contacts.json'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error exporting contacts:', error)
      alert('Failed to export contacts')
    }
  }

  const getCategoryBadge = (category: string) => {
    const categoryInfo = VENDOR_CATEGORIES.find(c => c.value === category)
    return <Badge variant="secondary">{categoryInfo?.label || category}</Badge>
  }

  const getCategoryStats = () => {
    const stats = VENDOR_CATEGORIES.map(category => ({
      ...category,
      count: contacts.filter(c => c.category === category.value).length
    }))
    return stats
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vendor Contacts</h2>
          <p className="text-gray-600">Manage your wedding vendor contacts</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleExportContacts('csv')} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => setShowContactForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* Category Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {getCategoryStats().map(category => (
          <Card key={category.value}>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{category.count}</div>
              <p className="text-sm text-gray-600">{category.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search contacts by name, phone, or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {VENDOR_CATEGORIES.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Contact Table */}
      <Card>
        <CardHeader>
          <CardTitle>Contacts ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading contacts...</div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No vendor contacts found. Add your first contact to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell className="font-medium">{contact.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {contact.phone}
                          <a href={`tel:${contact.phone}`} className="text-blue-600 hover:text-blue-800">
                            <Phone className="w-4 h-4" />
                          </a>
                        </div>
                      </TableCell>
                      <TableCell>
                        {contact.email ? (
                          <div className="flex items-center gap-2">
                            {contact.email}
                            <a href={`mailto:${contact.email}`} className="text-blue-600 hover:text-blue-800">
                              <Mail className="w-4 h-4" />
                            </a>
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>{getCategoryBadge(contact.category)}</TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={contact.notes || ''}>
                          {contact.notes || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingContact(contact)
                              setShowContactForm(true)
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteContact(contact.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
                {pagination.total} contacts
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

      {/* Contact Form Dialog */}
      {showContactForm && (
        <ContactForm
          contact={editingContact}
          onSave={handleContactSaved}
          onCancel={() => {
            setShowContactForm(false)
            setEditingContact(null)
          }}
        />
      )}
    </div>
  )
}