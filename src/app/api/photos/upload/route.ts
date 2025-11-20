import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
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
        const { photos, category_id } = body

        // Get current photo collection
        const { data: photoCollection, error: photoError } = await supabase
            .from('photo_collections')
            .select('*')
            .eq('couple_id', couple.id)
            .single()

        if (photoError) {
            return NextResponse.json({ error: 'Photo collection not found' }, { status: 404 })
        }

        // Update the categories with new photos
        const updatedCategories = photoCollection.categories.map((category: any) => {
            if (category.id === category_id) {
                return {
                    ...category,
                    photos: [...(category.photos || []), ...photos]
                }
            }
            return category
        })

        // Update photo collection in database
        const { data, error } = await supabase
            .from('photo_collections')
            .update({
                categories: updatedCategories
            })
            .eq('couple_id', couple.id)
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: 'Failed to update photo collection' }, { status: 500 })
        }

        return NextResponse.json({ success: true, data })
    } catch (error) {
        console.error('Error uploading photos:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}