import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { InsertTodoTask } from '@/lib/types/database'

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

        // Get query parameters for filtering and pagination
        const { searchParams } = new URL(request.url)
        const category = searchParams.get('category') || ''
        const completed = searchParams.get('completed')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = (page - 1) * limit

        // Build query
        let query = supabase
            .from('todo_tasks')
            .select('*', { count: 'exact' })
            .eq('couple_id', couple.id)
            .order('created_at', { ascending: false })

        // Apply filters
        if (category) {
            query = query.eq('category', category)
        }

        if (completed !== null) {
            query = query.eq('completed', completed === 'true')
        }

        // Apply pagination
        query = query.range(offset, offset + limit - 1)

        const { data: tasks, error, count } = await query

        if (error) {
            console.error('Error fetching todo tasks:', error)
            return NextResponse.json({ error: 'Failed to fetch todo tasks' }, { status: 500 })
        }

        return NextResponse.json({
            tasks,
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit)
            }
        })
    } catch (error) {
        console.error('Error in GET /api/todos:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
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

        const body = await request.json()
        const { title, description, category, due_date } = body

        // Validate required fields
        if (!title || !category) {
            return NextResponse.json({ error: 'Title and category are required' }, { status: 400 })
        }

        const taskData: InsertTodoTask = {
            couple_id: couple.id,
            title,
            description: description || null,
            category,
            due_date: due_date || null
        }

        const { data: task, error } = await supabase
            .from('todo_tasks')
            .insert(taskData)
            .select()
            .single()

        if (error) {
            console.error('Error creating todo task:', error)
            return NextResponse.json({ error: 'Failed to create todo task' }, { status: 500 })
        }

        return NextResponse.json(task, { status: 201 })
    } catch (error) {
        console.error('Error in POST /api/todos:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}