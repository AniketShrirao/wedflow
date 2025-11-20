'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, MapPin, Phone, Mail } from 'lucide-react'
import { VenueDetails } from '@/lib/types/events'

interface VenuesEditorProps {
  venues: VenueDetails[]
  onUpdate: (venues: VenueDetails[]) => void
}

export function VenuesEditor({ venues, onUpdate }: VenuesEditorProps) {
  const addVenue = () => {
    const newVenue: VenueDetails = {
      id: Date.now().toString(),
      name: '',
      address: '',
      description: '',
      maps_url: '',
      contact_phone: '',
      contact_email: ''
    }
    onUpdate([...venues, newVenue])
  }

  const updateVenue = (id: string, field: keyof VenueDetails, value: any) => {
    const updatedVenues = venues.map(venue =>
      venue.id === id ? { ...venue, [field]: value } : venue
    )
    onUpdate(updatedVenues)
  }

  const removeVenue = (id: string) => {
    const updatedVenues = venues.filter(venue => venue.id !== id)
    onUpdate(updatedVenues)
  }



  return (
    <Card>
      <CardHeader>
        <CardTitle>Venue Details</CardTitle>
        <CardDescription>
          Add information about the venues where your wedding events will take place
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {venues.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No venues added yet</p>
            <p className="text-sm mb-4">Add your wedding venues with location details</p>
            <Button onClick={addVenue} className="inline-flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add Venue
            </Button>
          </div>
        ) : (
          <>
            {venues.map((venue, index) => (
              <div key={venue.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-900">
                    Venue {index + 1}
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeVenue(venue.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`venue-name-${venue.id}`}>Venue Name</Label>
                    <Input
                      id={`venue-name-${venue.id}`}
                      value={venue.name}
                      onChange={(e) => updateVenue(venue.id, 'name', e.target.value)}
                      placeholder="e.g., Grand Ballroom, Garden Venue"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`venue-address-${venue.id}`}>Address</Label>
                    <Input
                      id={`venue-address-${venue.id}`}
                      value={venue.address}
                      onChange={(e) => updateVenue(venue.id, 'address', e.target.value)}
                      placeholder="e.g., 123 Main St, City, State 12345"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor={`venue-maps-url-${venue.id}`}>Maps Direction URL</Label>
                  <Input
                    id={`venue-maps-url-${venue.id}`}
                    value={venue.maps_url || ''}
                    onChange={(e) => updateVenue(venue.id, 'maps_url', e.target.value)}
                    placeholder="e.g., https://maps.google.com/... or https://maps.apple.com/..."
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Paste a Google Maps, Apple Maps, or any maps direction URL here
                  </p>
                </div>

                <div>
                  <Label htmlFor={`venue-description-${venue.id}`}>Description</Label>
                  <Textarea
                    id={`venue-description-${venue.id}`}
                    value={venue.description}
                    onChange={(e) => updateVenue(venue.id, 'description', e.target.value)}
                    placeholder="Describe the venue, its features, or any special instructions for guests..."
                    className="min-h-[80px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`venue-phone-${venue.id}`}>Contact Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id={`venue-phone-${venue.id}`}
                        value={venue.contact_phone || ''}
                        onChange={(e) => updateVenue(venue.id, 'contact_phone', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`venue-email-${venue.id}`}>Contact Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id={`venue-email-${venue.id}`}
                        type="email"
                        value={venue.contact_email || ''}
                        onChange={(e) => updateVenue(venue.id, 'contact_email', e.target.value)}
                        placeholder="venue@example.com"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Maps URL Preview */}
                {venue.maps_url && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-green-600 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      Maps direction URL added
                    </p>
                  </div>
                )}
              </div>
            ))}

            <Button onClick={addVenue} variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Another Venue
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}