import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PhotoCollection, PHOTO_CATEGORIES } from '@/lib/types/photos'

export async function GET(request: NextRequest) {
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

        // Get photo collection
        const { data: photoCollection, error: photoError } = await supabase
            .from('photo_collections')
            .select('*')
            .eq('couple_id', couple.id)
            .single()

        if (photoError && photoError.code !== 'PGRST116') {
            return NextResponse.json({ error: 'Failed to fetch photo collection' }, { status: 500 })
        }

        // If no photo collection exists, return default structure
        if (!photoCollection) {
            const defaultCollection: Partial<PhotoCollection> = {
                couple_id: couple.id,
                drive_folder_url: '',
                categories: PHOTO_CATEGORIES.map(cat => ({
                    id: cat.id,
                    name: cat.name,
                    photos: []
                })),
                highlight_photos: []
            }
            return NextResponse.json(defaultCollection)
        }

        return NextResponse.json(photoCollection)
    } catch (error) {
        console.error('Error fetching photo collection:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

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
        const { drive_folder_url, categories, highlight_photos } = body

        // Check if photo collection already exists
        const { data: existingCollection } = await supabase
            .from('photo_collections')
            .select('id')
            .eq('couple_id', couple.id)
            .single()

        let result
        if (existingCollection) {
            // Update existing collection
            const { data, error } = await supabase
                .from('photo_collections')
                .update({
                    drive_folder_url,
                    categories: categories || [],
                    highlight_photos: highlight_photos || []
                })
                .eq('couple_id', couple.id)
                .select()
                .single()

            if (error) {
                return NextResponse.json({ error: 'Failed to update photo collection' }, { status: 500 })
            }
            result = data
        } else {
            // Create new collection
            const { data, error } = await supabase
                .from('photo_collections')
                .insert({
                    couple_id: couple.id,
                    drive_folder_url,
                    categories: categories || PHOTO_CATEGORIES.map(cat => ({
                        id: cat.id,
                        name: cat.name,
                        photos: []
                    })),
                    highlight_photos: highlight_photos || []
                })
                .select()
                .single()

            if (error) {
                return NextResponse.json({ error: 'Failed to create photo collection' }, { status: 500 })
            }
            result = data
        }

        return NextResponse.json(result)
    } catch (error) {
        console.error('Error saving photo collection:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

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
        const { categories, highlight_photos } = body

        // Update photo collection
        const { data, error } = await supabase
            .from('photo_collections')
            .update({
                categories: categories || [],
                highlight_photos: highlight_photos || []
            })
            .eq('couple_id', couple.id)
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: 'Failed to update photo collection' }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Error updating photo collection:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}