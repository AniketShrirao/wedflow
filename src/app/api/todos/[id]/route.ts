import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { UpdateTodoTask } from '@/lib/types/database'
import { getWebhookService } from '@/lib/webhooks/service'

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient()
        const { id } = await params

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
        const { title, description, category, completed, due_date } = body

        // Verify the task belongs to this couple
        const { data: existingTask } = await supabase
            .from('todo_tasks')
            .select('id')
            .eq('id', id)
            .eq('couple_id', couple.id)
            .single()

        if (!existingTask) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 })
        }

        const updateData: UpdateTodoTask = {}

        if (title !== undefined) updateData.title = title
        if (description !== undefined) updateData.description = description
        if (category !== undefined) updateData.category = category
        if (completed !== undefined) updateData.completed = completed
        if (due_date !== undefined) updateData.due_date = due_date

        // Get original task data for webhook
        const { data: originalTask } = await supabase
            .from('todo_tasks')
            .select('*')
            .eq('id', id)
            .eq('couple_id', couple.id)
            .single()

        const { data: task, error } = await supabase
            .from('todo_tasks')
            .update(updateData)
            .eq('id', id)
            .eq('couple_id', couple.id)
            .select()
            .single()

        if (error) {
            console.error('Error updating todo task:', error)
            return NextResponse.json({ error: 'Failed to update todo task' }, { status: 500 })
        }

        // Trigger webhook if task was completed
        if (originalTask && !originalTask.completed && task.completed) {
            const webhookService = getWebhookService()
            await webhookService.triggerTaskCompleted(couple.id, task)
        }

        return NextResponse.json(task)
    } catch (error) {
        console.error('Error in PUT /api/todos/[id]:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient()
        const { id } = await params

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

        // Verify the task belongs to this couple and delete it
        const { error } = await supabase
            .from('todo_tasks')
            .delete()
            .eq('id', id)
            .eq('couple_id', couple.id)

        if (error) {
            console.error('Error deleting todo task:', error)
            return NextResponse.json({ error: 'Failed to delete todo task' }, { status: 500 })
        }

        return NextResponse.json({ message: 'Task deleted successfully' })
    } catch (error) {
        console.error('Error in DELETE /api/todos/[id]:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}