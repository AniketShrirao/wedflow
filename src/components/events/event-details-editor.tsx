'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink, Save, Loader2 } from 'lucide-react'
import { Couple } from '@/lib/types/database'
import { CoupleIntroEditor } from './couple-intro-editor'
import { EventsEditor } from './events-editor'
import { VenuesEditor } from './venues-editor'
import { TimelineEditor } from './timeline-editor'
import { EventDetailsData } from '@/lib/types/events'
import { useRouter } from 'next/navigation'

interface EventDetailsEditorProps {
  couple: Couple
}

export function EventDetailsEditor({ couple }: EventDetailsEditorProps) {
  const router = useRouter()
  const [eventData, setEventData] = useState<EventDetailsData>({
    couple_intro: '',
    events: [],
    venues: [],
    timeline: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    fetchEventDetails()
  }, [])

  const fetchEventDetails = async () => {
    try {
      const response = await fetch('/api/events')
      
      if (response.ok) {
        const data = await response.json()
        
        // Ensure we have the correct structure
        const eventDetails = {
          couple_intro: data.couple_intro || '',
          events: data.events || [],
          venues: data.venues || [],
          timeline: data.timeline || []
        }
        
        setEventData(eventDetails)
      }
    } catch (error) {
      console.error('Error fetching event details:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveMessage('')

    try {
      const response = await fetch('/api/events', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      })

      const responseData = await response.json()

      if (response.ok) {
        setSaveMessage('Changes saved successfully!')
        setTimeout(() => setSaveMessage(''), 3000)
        // No page refresh needed - React state is already updated
      } else {
        setSaveMessage(`Failed to save changes: ${responseData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error saving event details:', error)
      setSaveMessage(`Error saving changes: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSaving(false)
    }
  }

  const updateCoupleIntro = (intro: string) => {
    setEventData(prev => ({ ...prev, couple_intro: intro }))
  }

  const updateEvents = (events: any[]) => {
    setEventData(prev => ({ ...prev, events }))
  }

  const updateVenues = (venues: any[]) => {
    setEventData(prev => ({ ...prev, venues }))
  }

  const updateTimeline = (timeline: any[]) => {
    setEventData(prev => ({ ...prev, timeline }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Your Public Wedding Site
              </h3>
              <p className="text-sm text-gray-600">
                wedflow.com/{couple.couple_slug}
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                asChild
              >
                <a
                  href={`/${couple.couple_slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Preview Site
                </a>
              </Button>

              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
          {saveMessage && (
            <div className={`mt-4 p-3 rounded-md text-sm ${
              saveMessage.includes('success') 
                ? 'bg-green-50 text-green-800' 
                : 'bg-red-50 text-red-800'
            }`}>
              {saveMessage}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Editor Tabs */}
      <Tabs defaultValue="intro" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="intro">Introduction</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="venues">Venues</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="intro">
          <CoupleIntroEditor
            coupleIntro={eventData.couple_intro}
            onUpdate={updateCoupleIntro}
          />
        </TabsContent>

        <TabsContent value="events">
          <EventsEditor
            events={eventData.events}
            onUpdate={updateEvents}
          />
        </TabsContent>

        <TabsContent value="venues">
          <VenuesEditor
            venues={eventData.venues}
            onUpdate={updateVenues}
          />
        </TabsContent>

        <TabsContent value="timeline">
          <TimelineEditor
            timeline={eventData.timeline}
            onUpdate={updateTimeline}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}