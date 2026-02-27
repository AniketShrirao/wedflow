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

        if (!Array.isArray(highlight_photos)) {
            return NextResponse.json({ error: 'highlight_photos must be an array' }, { status: 400 })
        }

        // First, clear all highlights for this couple
        await supabase
            .from('images')
            .update({ is_highlighted: false })
            .eq('couple_id', couple.id)

        // Then set new highlights
        if (highlight_photos.length > 0) {
            const { error: updateError } = await supabase
                .from('images')
                .update({ is_highlighted: true })
                .in('id', highlight_photos)

            if (updateError) {
                return NextResponse.json({ error: 'Failed to update highlight photos' }, { status: 500 })
            }
        }

        // Return updated highlighted images
        const { data: highlightedImages } = await supabase
            .from('images')
            .select('*')
            .eq('couple_id', couple.id)
            .eq('is_highlighted', true)

        return NextResponse.json({
            success: true,
            highlight_photos: (highlightedImages || []).map(img => img.id)
        })
    } catch (error) {
        console.error('Error updating highlight photos:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}