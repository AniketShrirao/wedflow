import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(request: NextRequest) {
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
        const { photoId } = body

        if (!photoId) {
            return NextResponse.json({ error: 'Photo ID is required' }, { status: 400 })
        }

        // Verify the photo belongs to this couple
        const { data: photo, error: photoError } = await supabase
            .from('images')
            .select('*')
            .eq('id', photoId)
            .eq('couple_id', couple.id)
            .single()

        if (photoError || !photo) {
            return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
        }

        // Delete the image
        const { error: deleteError } = await supabase
            .from('images')
            .delete()
            .eq('id', photoId)

        if (deleteError) {
            return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            message: 'Photo deleted successfully'
        })
    } catch (error) {
        console.error('Error deleting photo:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}