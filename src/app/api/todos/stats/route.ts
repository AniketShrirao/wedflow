import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get couple information
        const { data: couple } = await supabase
            .from('couples')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (!couple) {
            return NextResponse.json({ error: 'Couple not found' }, { status: 404 })
        }

        // Get all tasks for statistics
        const { data: tasks, error } = await supabase
            .from('todo_tasks')
            .select('*')
            .eq('couple_id', couple.id)

        if (error) {
            console.error('Error fetching todo tasks for stats:', error)
            return NextResponse.json({ error: 'Failed to fetch todo statistics' }, { status: 500 })
        }

        const total = tasks.length
        const completed = tasks.filter(task => task.completed).length
        const pending = total - completed

        // Calculate overdue tasks (tasks with due_date in the past and not completed)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const overdue = tasks.filter(task => {
            if (!task.due_date || task.completed) return false
            const dueDate = new Date(task.due_date)
            dueDate.setHours(0, 0, 0, 0)
            return dueDate < today
        }).length

        const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0

        // Get category statistics
        const categoryStats = tasks.reduce((acc, task) => {
            if (!acc[task.category]) {
                acc[task.category] = { total: 0, completed: 0 }
            }
            acc[task.category].total++
            if (task.completed) {
                acc[task.category].completed++
            }
            return acc
        }, {} as Record<string, { total: number; completed: number }>)

        const categories = Object.entries(categoryStats).map(([name, stats]) => ({
            name,
            count: (stats as { total: number; completed: number }).total,
            completedCount: (stats as { total: number; completed: number }).completed
        }))

        return NextResponse.json({
            stats: {
                total,
                completed,
                pending,
                overdue,
                completionPercentage
            },
            categories
        })
    } catch (error) {
        console.error('Error in GET /api/todos/stats:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}