/**
 * Utility functions for automatic photo categorization based on event dates
 */

export interface EventDate {
    name: string
    date: string // ISO date string
    category: 'engagement' | 'haldi' | 'sangeet' | 'wedding' | 'reception' | 'other'
}

/**
 * Parse event dates from event_details JSONB
 */
export function parseEventDates(events: any[]): EventDate[] {
    if (!Array.isArray(events)) return []

    const eventMap: Record<string, string> = {
        engagement: 'engagement',
        haldi: 'haldi',
        sangeet: 'sangeet',
        wedding: 'wedding',
        reception: 'reception'
    }

    return events
        .filter(event => event.date && event.name)
        .map(event => ({
            name: event.name,
            date: event.date,
            category: (eventMap[event.name?.toLowerCase()] || 'other') as any
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

/**
 * Categorize a photo based on its upload date and event dates
 */
export function categorizePhotoByDate(
    uploadDate: Date,
    eventDates: EventDate[]
): 'engagement' | 'haldi' | 'sangeet' | 'wedding' | 'reception' | 'other' {
    if (eventDates.length === 0) return 'other'

    const uploadTime = uploadDate.getTime()

    // Find which event period this upload falls into
    for (let i = 0; i < eventDates.length; i++) {
        const currentEvent = eventDates[i]
        const currentEventTime = new Date(currentEvent.date).getTime()
        const nextEvent = eventDates[i + 1]
        const nextEventTime = nextEvent ? new Date(nextEvent.date).getTime() : Infinity

        // If upload is between current and next event, categorize as current event
        if (uploadTime >= currentEventTime && uploadTime < nextEventTime) {
            return currentEvent.category
        }
    }

    // If upload is after all events, categorize as last event
    return eventDates[eventDates.length - 1].category
}

/**
 * Get event date ranges for display
 */
export function getEventDateRanges(eventDates: EventDate[]): Record<string, { start: Date; end: Date }> {
    const ranges: Record<string, { start: Date; end: Date }> = {}

    for (let i = 0; i < eventDates.length; i++) {
        const event = eventDates[i]
        const startDate = new Date(event.date)
        const endDate = i + 1 < eventDates.length
            ? new Date(eventDates[i + 1].date)
            : new Date(startDate.getTime() + 24 * 60 * 60 * 1000) // Next day if last event

        ranges[event.category] = { start: startDate, end: endDate }
    }

    return ranges
}
