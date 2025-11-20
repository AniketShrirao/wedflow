import { client } from './client'

// Types for Sanity data
export interface WeddingTemplate {
    _id: string
    name: string
    description?: string
    preview?: {
        asset: {
            _ref: string
            url: string
        }
    }
    colorScheme: {
        primary: string
        secondary: string
        accent: string
        background: string
    }
    fonts: {
        heading: string
        body: string
    }
    layout: {
        style: 'classic' | 'modern' | 'elegant' | 'rustic' | 'minimalist'
        headerStyle: 'centered' | 'left' | 'split'
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
    isActive: boolean
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
        min: number
        max: number
        currency: string
    }
    bookingTimeframe?: string
    questionsToAsk?: string[]
    isActive: boolean
    order?: number
}

export interface ThemeConfig {
    colors: {
        primary: string
        secondary: string
        accent: string
        background: string
    }
    fonts: {
        heading: string
        body: string
    }
    layout: {
        style: string
        headerStyle: string
    }
}

// GROQ queries
const WEDDING_TEMPLATES_QUERY = `
  *[_type == "weddingTemplate" && isActive == true] | order(name asc) {
    _id,
    name,
    description,
    preview {
      asset-> {
        _ref,
        url
      }
    },
    colorScheme,
    fonts,
    layout,
    isActive
  }
`

const TODO_TEMPLATES_QUERY = `
  *[_type == "todoTemplate" && isActive == true] | order(order asc, category asc, priority desc) {
    _id,
    title,
    description,
    category,
    timeframe,
    priority,
    estimatedDuration,
    tips,
    isActive,
    order
  }
`

const VENDOR_CATEGORIES_QUERY = `
  *[_type == "vendorCategory" && isActive == true] | order(order asc, name asc) {
    _id,
    name,
    slug,
    description,
    icon,
    commonServices,
    averageCost,
    bookingTimeframe,
    questionsToAsk,
    isActive,
    order
  }
`

// Service class for Sanity operations
export class SanityService {
    /**
     * Fetch all active wedding templates
     */
    static async getWeddingTemplates(): Promise<WeddingTemplate[]> {
        try {
            if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
                console.warn('Sanity project ID not configured')
                return []
            }
            const templates = await client.fetch<WeddingTemplate[]>(WEDDING_TEMPLATES_QUERY)
            return templates || []
        } catch (error) {
            console.error('Error fetching wedding templates:', error)
            return []
        }
    }

    /**
     * Fetch a specific wedding template by ID
     */
    static async getWeddingTemplate(id: string): Promise<WeddingTemplate | null> {
        try {
            const query = `*[_type == "weddingTemplate" && _id == $id][0] {
        _id,
        name,
        description,
        preview {
          asset-> {
            _ref,
            url
          }
        },
        colorScheme,
        fonts,
        layout,
        isActive
      }`

            const template = await client.fetch<WeddingTemplate>(query, { id })
            return template || null
        } catch (error) {
            console.error('Error fetching wedding template:', error)
            return null
        }
    }

    /**
     * Fetch all active todo templates
     */
    static async getTodoTemplates(): Promise<TodoTemplate[]> {
        try {
            if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
                console.warn('Sanity project ID not configured')
                return []
            }
            const templates = await client.fetch<TodoTemplate[]>(TODO_TEMPLATES_QUERY)
            return templates || []
        } catch (error) {
            console.error('Error fetching todo templates:', error)
            return []
        }
    }

    /**
     * Fetch todo templates by category
     */
    static async getTodoTemplatesByCategory(category: string): Promise<TodoTemplate[]> {
        try {
            const query = `
        *[_type == "todoTemplate" && isActive == true && category == $category] | order(order asc, priority desc) {
          _id,
          title,
          description,
          category,
          timeframe,
          priority,
          estimatedDuration,
          tips,
          isActive,
          order
        }
      `

            const templates = await client.fetch<TodoTemplate[]>(query, { category })
            return templates || []
        } catch (error) {
            console.error('Error fetching todo templates by category:', error)
            return []
        }
    }

    /**
     * Fetch all active vendor categories
     */
    static async getVendorCategories(): Promise<VendorCategory[]> {
        try {
            if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
                console.warn('Sanity project ID not configured')
                return []
            }
            const categories = await client.fetch<VendorCategory[]>(VENDOR_CATEGORIES_QUERY)
            return categories || []
        } catch (error) {
            console.error('Error fetching vendor categories:', error)
            return []
        }
    }

    /**
     * Extract theme configuration from a wedding template
     */
    static extractThemeConfig(template: WeddingTemplate): ThemeConfig {
        return {
            colors: template.colorScheme,
            fonts: template.fonts,
            layout: template.layout
        }
    }

    /**
     * Get default theme configuration
     */
    static getDefaultTheme(): ThemeConfig {
        return {
            colors: {
                primary: '#8B5A3C',
                secondary: '#F4E4C1',
                accent: '#D4A574',
                background: '#FFFFFF'
            },
            fonts: {
                heading: 'Playfair Display',
                body: 'Open Sans'
            },
            layout: {
                style: 'classic',
                headerStyle: 'centered'
            }
        }
    }
}