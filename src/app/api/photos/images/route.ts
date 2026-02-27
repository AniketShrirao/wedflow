import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { photoService } from '@/lib/services/photo-service'
import { ImageCategory } from '@/lib/services/photo-service'

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

        // Get query parameters for filtering
        const { searchParams } = new URL(request.url)
        const category = searchParams.get('category') as ImageCategory | null
        const folder = searchParams.get('folder') as string | null
        const isHighlightedParam = searchParams.get('isHighlighted')
        const isHighlighted = isHighlightedParam ? isHighlightedParam === 'true' : undefined

        // Build filters object
        const filters: {
            category?: ImageCategory
            folder?: string
            isHighlighted?: boolean
        } = {}

        if (category) {
            // Validate category
            const validCategories: ImageCategory[] = ['Haldi', 'Sangeet', 'Wedding', 'Reception']
            if (!validCategories.includes(category)) {
                return NextResponse.json(
                    { error: 'Invalid category. Must be one of: Haldi, Sangeet, Wedding, Reception' },
                    { status: 400 }
                )
            }
            filters.category = category
        }

        if (folder) {
            filters.folder = folder
        }

        if (isHighlighted !== undefined) {
            filters.isHighlighted = isHighlighted
        }

        // Get images for the couple
        const images = await photoService.getImagesByCouple(couple.id, filters)

        return NextResponse.json(images)
    } catch (error) {
        console.error('Error fetching images:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

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
        const { imageIds, category, folder, isHighlighted } = body

        // Validate that at least one update field is provided
        if (category === undefined && folder === undefined && isHighlighted === undefined) {
            return NextResponse.json(
                { error: 'At least one of category, folder, or isHighlighted must be provided' },
                { status: 400 }
            )
        }

        // Validate imageIds is provided and is an array
        if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
            return NextResponse.json(
                { error: 'imageIds must be a non-empty array' },
                { status: 400 }
            )
        }

        // Validate category if provided
        if (category !== undefined) {
            const validCategories: ImageCategory[] = ['Haldi', 'Sangeet', 'Wedding', 'Reception']
            if (!validCategories.includes(category)) {
                return NextResponse.json(
                    { error: 'Invalid category. Must be one of: Haldi, Sangeet, Wedding, Reception' },
                    { status: 400 }
                )
            }
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
        const updateData: any = {}
        if (category !== undefined) updateData.category = category
        if (folder !== undefined) updateData.folder = folder
        if (isHighlighted !== undefined) updateData.is_highlighted = isHighlighted

        const { data: updatedImages, error: updateError } = await supabase
            .from('images')
            .update(updateData)
            .in('id', imageIds)
            .select()

        if (updateError) {
            console.error('Error updating images:', updateError)
            return NextResponse.json({ error: 'Failed to update images' }, { status: 500 })
        }

        return NextResponse.json(updatedImages)
    } catch (error) {
        console.error('Error updating images:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
