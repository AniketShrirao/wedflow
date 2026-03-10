import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const body = await request.json()
    const { guestId, attending, guests_count, note } = body

    if (!guestId || typeof attending !== 'boolean') {
      return NextResponse.json({ error: 'guestId and attending are required' }, { status: 400 })
    }

    const updateData: any = {
      rsvp_status: attending ? 'accepted' : 'declined',
      rsvp_at: new Date().toISOString()
    }

    if (typeof guests_count === 'number') updateData.rsvp_guests = guests_count
    if (typeof note === 'string') updateData.rsvp_note = note

    const { data: guest, error } = await supabase
      .from('guests')
      .update(updateData)
      .eq('id', guestId)
      .select()
      .single()

    if (error) {
      console.error('Error updating RSVP:', error)
      return NextResponse.json({ error: 'Failed to update RSVP' }, { status: 500 })
    }

    return NextResponse.json({ message: 'RSVP updated', guest })
  } catch (err) {
    console.error('Error in POST /api/public/rsvp:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
