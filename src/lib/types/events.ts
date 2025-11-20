export interface EventItem {
    id: string
    name: string
    description: string
    date: string
    time: string
    venue_id?: string
}

export interface VenueDetails {
    id: string
    name: string
    address: string
    description: string
    maps_url?: string
    contact_phone?: string
    contact_email?: string
}

export interface TimelineItem {
    id: string
    time: string
    title: string
    description: string
    event_id?: string
}

export interface EventDetailsData {
    couple_intro: string
    events: EventItem[]
    venues: VenueDetails[]
    timeline: TimelineItem[]
}