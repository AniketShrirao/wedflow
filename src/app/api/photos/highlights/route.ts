import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get couple record
        const { data: couple, error: coupleError } = await supabase
            .from('couples')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (coupleError || !couple) {
            return NextResponse.json({ error: 'Couple not found' }, { status: 404 })
        }

        const body = await request.json()
        const { highlight_photos } = body

        // Update highlight photos
        const { data, error } = await supabase
            .from('photo_collections')
            .update({
                highlight_photos: highlight_photos || []
            })
            .eq('couple_id', couple.id)
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: 'Failed to update highlight photos' }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Error updating highlight photos:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}