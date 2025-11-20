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

        // Get current photo collection
        const { data: photoCollection, error: fetchError } = await supabase
            .from('photo_collections')
            .select('*')
            .eq('couple_id', couple.id)
            .single()

        if (fetchError || !photoCollection) {
            return NextResponse.json({ error: 'Photo collection not found' }, { status: 404 })
        }

        // Remove photo from all categories
        const updatedCategories = photoCollection.categories.map(category => ({
            ...category,
            photos: (category.photos || []).filter(photo => photo.id !== photoId)
        }))

        // Remove from highlights if present
        const updatedHighlights = (photoCollection.highlight_photos || []).filter(id => id !== photoId)

        // Update photo collection
        const { data, error } = await supabase
            .from('photo_collections')
            .update({
                categories: updatedCategories,
                highlight_photos: updatedHighlights
            })
            .eq('couple_id', couple.id)
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Error deleting photo:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
