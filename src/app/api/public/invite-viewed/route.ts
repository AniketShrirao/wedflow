import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        const body = await request.json()
        const { guestId } = body

        if (!guestId) {
            return NextResponse.json({ error: 'Guest ID is required' }, { status: 400 })
        }

        // Update guest invite status to 'viewed' if it's currently 'sent'
        const { data: guest, error } = await supabase
            .from('guests')
            .update({
                invite_status: 'viewed',
                invite_viewed_at: new Date().toISOString()
            })
            .eq('id', guestId)
            .eq('invite_status', 'sent') // Only update if currently 'sent'
            .select()
            .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows updated"
            console.error('Error updating invite viewed status:', error)
            return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
        }

        return NextResponse.json({
            message: 'Invite viewed status updated',
            guest: guest || null
        })
    } catch (error) {
        console.error('Error in POST /api/public/invite-viewed:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}