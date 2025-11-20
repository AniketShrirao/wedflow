export interface WeddingTemplate {
    _id: string
    name: string
    description?: string
    preview?: any
    colorScheme?: {
        primary?: string
        secondary?: string
        accent?: string
        background?: string
    }
    fonts?: {
        heading?: string
        body?: string
    }
    layout?: {
        style?: string
        headerStyle?: string
    }
    isActive: boolean
}

export interface TodoTemplate {
    _id: string
    title: string
    description?: string
    category: string
    timeframe?: string
    priority: 'high' | 'medium' | 'low'
    estimatedDuration?: string
    tips?: string[]
    order?: number
}

export interface VendorCategory {
    _id: string
    name: string
    slug: {
        current: string
    }
    description?: string
    icon?: string
    commonServices?: string[]
    averageCost?: {
        min?: number
        max?: number
        currency?: string
    }
    bookingTimeframe?: string
    questionsToAsk?: string[]
    order?: number
}