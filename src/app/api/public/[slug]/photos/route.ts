import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { validateApiResponse, PhotoDataSchema } from '@/lib/validation/validator'
import { z } from 'zod'

const PhotosResponseSchema = z.object({
    categories: z.array(z.object({
        id: z.string(),
        name: z.string(),
        photos: z.array(PhotoDataSchema).default([])
    })).default([]),
    highlight_photos: z.array(z.string()).default([])
})

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const supabase = await createClient()
        const { slug } = await params

        // Get couple information by slug
        const { data: couple, error: coupleError } = await supabase
            .from('couples')
            .select('id')
            .eq('couple_slug', slug)
            .single()

        if (coupleError || !couple) {
            return NextResponse.json(
                { error: 'Wedding site not found' },
                { status: 404 }
            )
        }

        // Get photo collection for this couple
        const { data: photoCollection, error: photoError } = await supabase
            .from('photo_collections')
            .select(`
        *,
        categories:photo_categories(
          id,
          name,
          photos:photos(
            id,
            name,
            public_url,
            thumbnail_url,
            is_highlight
          )
        )
      `)
            .eq('couple_id', couple.id)
            .single()

        if (photoError) {
            console.error('Error fetching photo collection:', photoError)
            // Return empty structure instead of error
            const emptyResponse = {
                categories: [],
                highlight_photos: []
            }

            return NextResponse.json(emptyResponse)
        }

        // Prepare response data
        const responseData = {
            categories: photoCollection?.categories || [],
            highlight_photos: photoCollection?.highlight_photos || []
        }

        // Validate response data
        const validationResult = validateApiResponse(responseData, PhotosResponseSchema)

        if (!validationResult.isValid) {
            console.error('Photo data validation failed:', validationResult.errors)
            // Return empty structure for invalid data
            return NextResponse.json({
                categories: [],
                highlight_photos: []
            })
        }

        const response = NextResponse.json(validationResult.data)

        // Add cache headers
        response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600')

        return response
    } catch (error) {
        console.error('Error in photos API:', error)

        // Return empty structure instead of error to prevent UI breaks
        return NextResponse.json({
            categories: [],
            highlight_photos: []
        })
    }
}