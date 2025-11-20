'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Clock, ArrowUp, ArrowDown } from 'lucide-react'
import { TimelineItem } from '@/lib/types/events'

interface TimelineEditorProps {
  timeline: TimelineItem[]
  onUpdate: (timeline: TimelineItem[]) => void
}

export function TimelineEditor({ timeline, onUpdate }: TimelineEditorProps) {
  const addTimelineItem = () => {
    const newItem: TimelineItem = {
      id: Date.now().toString(),
      time: '',
      title: '',
      description: '',
      event_id: ''
    }
    onUpdate([...timeline, newItem])
  }

  const updateTimelineItem = (id: string, field: keyof TimelineItem, value: string) => {
    const updatedTimeline = timeline.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    )
    onUpdate(updatedTimeline)
  }

  const removeTimelineItem = (id: string) => {
    const updatedTimeline = timeline.filter(item => item.id !== id)
    onUpdate(updatedTimeline)
  }

  const moveTimelineItem = (id: string, direction: 'up' | 'down') => {
    const currentIndex = timeline.findIndex(item => item.id === id)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= timeline.length) return

    const newTimeline = [...timeline]
    const [movedItem] = newTimeline.splice(currentIndex, 1)
    newTimeline.splice(newIndex, 0, movedItem)
    onUpdate(newTimeline)
  }

  // Sort timeline by time for display
  const sortedTimeline = [...timeline].sort((a, b) => {
    if (!a.time || !b.time) return 0
    return a.time.localeCompare(b.time)
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wedding Timeline</CardTitle>
        <CardDescription>
          Create a detailed schedule of events for your wedding day
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {timeline.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No timeline items added yet</p>
            <p className="text-sm mb-4">Create a schedule for your wedding day</p>
            <Button onClick={addTimelineItem} className="inline-flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add Timeline Item
            </Button>
          </div>
        ) : (
          <>
            {sortedTimeline.map((item, index) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-900">
                    Timeline Item {index + 1}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveTimelineItem(item.id, 'up')}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveTimelineItem(item.id, 'down')}
                      disabled={index === sortedTimeline.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeTimelineItem(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor={`timeline-time-${item.id}`}>Time</Label>
                    <Input
                      id={`timeline-time-${item.id}`}
                      type="time"
                      value={item.time}
                      onChange={(e) => updateTimelineItem(item.id, 'time', e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor={`timeline-title-${item.id}`}>Event Title</Label>
                    <Input
                      id={`timeline-title-${item.id}`}
                      value={item.title}
                      onChange={(e) => updateTimelineItem(item.id, 'title', e.target.value)}
                      placeholder="e.g., Ceremony Begins, Cocktail Hour, First Dance"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor={`timeline-description-${item.id}`}>Description</Label>
                  <Textarea
                    id={`timeline-description-${item.id}`}
                    value={item.description}
                    onChange={(e) => updateTimelineItem(item.id, 'description', e.target.value)}
                    placeholder="Provide details about what happens during this time..."
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            ))}

            <Button onClick={addTimelineItem} variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Timeline Item
            </Button>
          </>
        )}

        {timeline.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Timeline items are automatically sorted by time on your public wedding site. 
              Use the arrow buttons to reorder items manually if needed.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}