import { createClient } from '@supabase/supabase-js'
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
    _request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        // Use service role key to bypass RLS for public access
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )
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

        // Get all images for this couple
        const { data: allImages, error: imagesError } = await supabase
            .from('images')
            .select('*')
            .eq('couple_id', couple.id)
            .order('created_at', { ascending: false })

        if (imagesError) {
            console.error('Error fetching images:', imagesError)
            // Return empty structure instead of error
            return NextResponse.json({
                categories: [],
                highlight_photos: []
            })
        }

        // Filter for highlighted images
        const highlightedImages = (allImages || []).filter(img => img.is_highlighted === true)
        const highlightedIds = highlightedImages.map(img => img.id)

        // Group highlighted images by category
        const categoriesMap = new Map<string, any[]>()
        highlightedImages.forEach(image => {
            if (!categoriesMap.has(image.category)) {
                categoriesMap.set(image.category, [])
            }
            categoriesMap.get(image.category)?.push({
                id: image.id,
                filename: image.filename,
                public_url: image.public_url,
                category: image.category,
                is_highlighted: true
            })
        })

        // Convert map to array format
        const categories = Array.from(categoriesMap.entries()).map(([name, photos]) => ({
            id: name,
            name,
            photos
        }))

        // Prepare response data
        const responseData = {
            categories,
            highlight_photos: highlightedIds
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

        // Add cache headers - no cache for debugging
        response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
        response.headers.set('Pragma', 'no-cache')
        response.headers.set('Expires', '0')

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