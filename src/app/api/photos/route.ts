import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_request: NextRequest) {
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

        // Get all images for this couple
        const { data: images, error: imagesError } = await supabase
            .from('images')
            .select('*')
            .eq('couple_id', couple.id)
            .order('created_at', { ascending: false })

        if (imagesError) {
            return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 })
        }

        // Group images by category
        const categoriesMap = new Map<string, any[]>()
        images?.forEach(image => {
            if (!categoriesMap.has(image.category)) {
                categoriesMap.set(image.category, [])
            }
            categoriesMap.get(image.category)?.push({
                id: image.id,
                filename: image.filename,
                public_url: image.public_url,
                category: image.category,
                is_highlighted: image.is_highlighted
            })
        })

        // Get highlighted image IDs
        const highlightedIds = (images || [])
            .filter(img => img.is_highlighted)
            .map(img => img.id)

        // Convert map to array format
        const categories = Array.from(categoriesMap.entries()).map(([name, photos]) => ({
            id: name,
            name,
            photos
        }))

        return NextResponse.json({
            couple_id: couple.id,
            categories,
            highlight_photos: highlightedIds
        })
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
        const { highlight_photos } = body

        // Update highlight status for specified images
        if (highlight_photos && Array.isArray(highlight_photos)) {
            // First, clear all highlights
            await supabase
                .from('images')
                .update({ is_highlighted: false })
                .eq('couple_id', couple.id)

            // Then set new highlights
            if (highlight_photos.length > 0) {
                await supabase
                    .from('images')
                    .update({ is_highlighted: true })
                    .in('id', highlight_photos)
            }
        }

        // Return updated collection
        const { data: images } = await supabase
            .from('images')
            .select('*')
            .eq('couple_id', couple.id)
            .order('created_at', { ascending: false })

        const categoriesMap = new Map<string, any[]>()
        images?.forEach(image => {
            if (!categoriesMap.has(image.category)) {
                categoriesMap.set(image.category, [])
            }
            categoriesMap.get(image.category)?.push({
                id: image.id,
                filename: image.filename,
                public_url: image.public_url,
                category: image.category,
                is_highlighted: image.is_highlighted
            })
        })

        const highlightedIds = (images || [])
            .filter(img => img.is_highlighted)
            .map(img => img.id)

        const categories = Array.from(categoriesMap.entries()).map(([name, photos]) => ({
            id: name,
            name,
            photos
        }))

        return NextResponse.json({
            couple_id: couple.id,
            categories,
            highlight_photos: highlightedIds
        })
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
        const { highlight_photos } = body

        // Update highlight status for specified images
        if (highlight_photos && Array.isArray(highlight_photos)) {
            // First, clear all highlights
            await supabase
                .from('images')
                .update({ is_highlighted: false })
                .eq('couple_id', couple.id)

            // Then set new highlights
            if (highlight_photos.length > 0) {
                await supabase
                    .from('images')
                    .update({ is_highlighted: true })
                    .in('id', highlight_photos)
            }
        }

        // Return updated collection
        const { data: images } = await supabase
            .from('images')
            .select('*')
            .eq('couple_id', couple.id)
            .order('created_at', { ascending: false })

        const categoriesMap = new Map<string, any[]>()
        images?.forEach(image => {
            if (!categoriesMap.has(image.category)) {
                categoriesMap.set(image.category, [])
            }
            categoriesMap.get(image.category)?.push({
                id: image.id,
                filename: image.filename,
                public_url: image.public_url,
                category: image.category,
                is_highlighted: image.is_highlighted
            })
        })

        const highlightedIds = (images || [])
            .filter(img => img.is_highlighted)
            .map(img => img.id)

        const categories = Array.from(categoriesMap.entries()).map(([name, photos]) => ({
            id: name,
            name,
            photos
        }))

        return NextResponse.json({
            couple_id: couple.id,
            categories,
            highlight_photos: highlightedIds
        })
    } catch (error) {
        console.error('Error updating photo collection:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}