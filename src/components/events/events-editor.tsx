'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Calendar, Clock } from 'lucide-react'
import { EventItem } from '@/lib/types/events'

interface EventsEditorProps {
  events: EventItem[]
  onUpdate: (events: EventItem[]) => void
}

export function EventsEditor({ events, onUpdate }: EventsEditorProps) {
  const addEvent = () => {
    const newEvent: EventItem = {
      id: Date.now().toString(),
      name: '',
      description: '',
      date: '',
      time: '',
      venue_id: ''
    }
    onUpdate([...events, newEvent])
  }

  const updateEvent = (id: string, field: keyof EventItem, value: string) => {
    const updatedEvents = events.map(event =>
      event.id === id ? { ...event, [field]: value } : event
    )
    onUpdate(updatedEvents)
  }

  const removeEvent = (id: string) => {
    const updatedEvents = events.filter(event => event.id !== id)
    onUpdate(updatedEvents)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wedding Events</CardTitle>
        <CardDescription>
          Add and manage the different events that are part of your wedding celebration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No events added yet</p>
            <p className="text-sm mb-4">Start by adding your first wedding event</p>
            <Button onClick={addEvent} className="inline-flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>
        ) : (
          <>
            {events.map((event, index) => (
              <div key={event.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-900">
                    Event {index + 1}
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeEvent(event.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`event-name-${event.id}`}>Event Name</Label>
                    <Input
                      id={`event-name-${event.id}`}
                      value={event.name}
                      onChange={(e) => updateEvent(event.id, 'name', e.target.value)}
                      placeholder="e.g., Haldi Ceremony, Wedding, Reception"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor={`event-date-${event.id}`}>Date</Label>
                      <Input
                        id={`event-date-${event.id}`}
                        type="date"
                        value={event.date}
                        onChange={(e) => updateEvent(event.id, 'date', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`event-time-${event.id}`}>Time</Label>
                      <Input
                        id={`event-time-${event.id}`}
                        type="time"
                        value={event.time}
                        onChange={(e) => updateEvent(event.id, 'time', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor={`event-description-${event.id}`}>Description</Label>
                  <Textarea
                    id={`event-description-${event.id}`}
                    value={event.description}
                    onChange={(e) => updateEvent(event.id, 'description', e.target.value)}
                    placeholder="Describe this event and what guests can expect..."
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            ))}

            <Button onClick={addEvent} variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Another Event
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}