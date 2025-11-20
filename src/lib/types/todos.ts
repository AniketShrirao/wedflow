export interface TodoTask {
    id: string
    couple_id: string
    title: string
    description: string | null
    category: string
    completed: boolean
    due_date: string | null
    created_at: string
    updated_at: string
}

export interface TodoCategory {
    name: string
    count: number
    completedCount: number
}

export interface TodoStats {
    total: number
    completed: number
    pending: number
    overdue: number
    completionPercentage: number
}

export interface CreateTodoTask {
    title: string
    description?: string
    category: string
    due_date?: string
}

export interface UpdateTodoTask {
    title?: string
    description?: string
    category?: string
    completed?: boolean
    due_date?: string
}

// Predefined categories for wedding planning
export const DEFAULT_TODO_CATEGORIES = [
    'Venue & Catering',
    'Photography & Videography',
    'Decorations & Flowers',
    'Music & Entertainment',
    'Invitations & Stationery',
    'Attire & Beauty',
    'Transportation',
    'Legal & Documentation',
    'Honeymoon Planning',
    'Miscellaneous'
] as const

export type DefaultTodoCategory = typeof DEFAULT_TODO_CATEGORIES[number]