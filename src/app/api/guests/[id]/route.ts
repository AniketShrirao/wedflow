import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { UpdateGuest } from '@/lib/types/database'
import { getWebhookService } from '@/lib/webhooks/service'

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
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
        const { name, phone, email, group_name, event_name, invite_status } = body

        // Validate required fields
        if (!name || !phone) {
            return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 })
        }

        const updateData: UpdateGuest = {
            name,
            phone,
            email: email || null,
            group_name: group_name || null,
            event_name: event_name || null,
            invite_status: invite_status || 'pending'
        }

        // Get original guest data for webhook
        const { data: originalGuest } = await supabase
            .from('guests')
            .select('*')
            .eq('id', id)
            .eq('couple_id', couple.id)
            .single()

        const { data: guest, error } = await supabase
            .from('guests')
            .update(updateData)
            .eq('id', id)
            .eq('couple_id', couple.id)
            .select()
            .single()

        if (error) {
            console.error('Error updating guest:', error)
            return NextResponse.json({ error: 'Failed to update guest' }, { status: 500 })
        }

        if (!guest) {
            return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
        }

        // Trigger webhook for guest update
        if (originalGuest) {
            const webhookService = getWebhookService()
            const changes = Object.keys(updateData).reduce((acc, key) => {
                if (originalGuest[key] !== guest[key]) {
                    acc[key] = { from: originalGuest[key], to: guest[key] }
                }
                return acc
            }, {} as Record<string, any>)

            if (Object.keys(changes).length > 0) {
                await webhookService.triggerGuestUpdated(couple.id, guest, changes)
            }
        }

        return NextResponse.json(guest)
    } catch (error) {
        console.error('Error in PUT /api/guests/[id]:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
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

        const { error } = await supabase
            .from('guests')
            .delete()
            .eq('id', id)
            .eq('couple_id', couple.id)

        if (error) {
            console.error('Error deleting guest:', error)
            return NextResponse.json({ error: 'Failed to delete guest' }, { status: 500 })
        }

        return NextResponse.json({ message: 'Guest deleted successfully' })
    } catch (error) {
        console.error('Error in DELETE /api/guests/[id]:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}