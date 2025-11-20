'use client'

import { useState, useEffect } from 'react'
import { SanityService, TodoTemplate } from '@/lib/sanity/service'

export function useSanityTodos() {
    const [templates, setTemplates] = useState<TodoTemplate[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadTemplates()
    }, [])

    const loadTemplates = async () => {
        try {
            setLoading(true)
            setError(null)
            const fetchedTemplates = await SanityService.getTodoTemplates()
            setTemplates(fetchedTemplates)
        } catch (err) {
            console.error('Error loading todo templates:', err)
            setError('Failed to load todo templates')
        } finally {
            setLoading(false)
        }
    }

    const getTemplatesByCategory = (category: string) => {
        return templates.filter(template => template.category === category)
    }

    const getCategories = () => {
        const categories = [...new Set(templates.map(template => template.category))]
        return categories.sort()
    }

    const createTaskFromTemplate = (template: TodoTemplate) => {
        return {
            title: template.title,
            description: template.description || '',
            category: template.category,
            completed: false,
            due_date: null, // Can be set based on timeframe if needed
            // Additional fields from template
            priority: template.priority,
            estimatedDuration: template.estimatedDuration,
            tips: template.tips,
            timeframe: template.timeframe
        }
    }

    return {
        templates,
        loading,
        error,
        getTemplatesByCategory,
        getCategories,
        createTaskFromTemplate,
        refetch: loadTemplates
    }
}