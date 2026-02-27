import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: NextRequest) {
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
        const { imageIds, isHighlighted } = body

        // Validate inputs
        if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
            return NextResponse.json(
                { error: 'imageIds must be a non-empty array' },
                { status: 400 }
            )
        }

        if (typeof isHighlighted !== 'boolean') {
            return NextResponse.json(
                { error: 'isHighlighted must be a boolean' },
                { status: 400 }
            )
        }

        // Verify all images belong to the authenticated couple
        const { data: images, error: imagesError } = await supabase
            .from('images')
            .select('id, couple_id')
            .in('id', imageIds)

        if (imagesError) {
            return NextResponse.json({ error: 'Failed to verify images' }, { status: 500 })
        }

        if (!images || images.length !== imageIds.length) {
            return NextResponse.json({ error: 'One or more images not found' }, { status: 404 })
        }

        // Check that all images belong to the authenticated couple
        if (!images.every(img => img.couple_id === couple.id)) {
            return NextResponse.json({ error: 'Unauthorized to update these images' }, { status: 403 })
        }

        // Update images
        const { data: updatedImages, error: updateError } = await supabase
            .from('images')
            .update({ is_highlighted: isHighlighted })
            .in('id', imageIds)
            .select()

        if (updateError) {
            console.error('Error updating images:', updateError)
            return NextResponse.json({ error: 'Failed to update images' }, { status: 500 })
        }

        return NextResponse.json(updatedImages)
    } catch (error) {
        console.error('Error in bulk highlight:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
