import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

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
        const { status } = body

        if (!['pending', 'sent', 'viewed'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
        }

        // Prepare update data
        const updateData: any = {
            invite_status: status
        }

        // Set timestamps based on status
        if (status === 'sent') {
            updateData.invite_sent_at = new Date().toISOString()
        } else if (status === 'viewed') {
            updateData.invite_viewed_at = new Date().toISOString()
        }

        const { data: guest, error } = await supabase
            .from('guests')
            .update(updateData)
            .eq('id', id)
            .eq('couple_id', couple.id)
            .select()
            .single()

        if (error) {
            console.error('Error updating invite status:', error)
            return NextResponse.json({ error: 'Failed to update invite status' }, { status: 500 })
        }

        if (!guest) {
            return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
        }

        return NextResponse.json(guest)
    } catch (error) {
        console.error('Error in PUT /api/guests/[id]/invite-status:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}