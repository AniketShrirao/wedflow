import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { Image, ImageCategory } from '@/lib/services/photo-service'

type HighlightedPhotosResponse = Record<ImageCategory, Image[]>

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        // Use service role key for public API to bypass RLS
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

        // Get all highlighted images for this couple, organized by category
        const { data: highlightedImages, error: imagesError } = await supabase
            .from('images')
            .select('*')
            .eq('couple_id', couple.id)
            .eq('is_highlighted', true)
            .order('category', { ascending: true })
            .order('created_at', { ascending: false })

        if (imagesError) {
            console.error('Error fetching highlighted images:', imagesError)
            return NextResponse.json(
                { error: 'Failed to fetch highlighted images' },
                { status: 500 }
            )
        }

        // Organize images by category
        const organizedByCategory: Partial<HighlightedPhotosResponse> = {}

        if (highlightedImages && highlightedImages.length > 0) {
            for (const image of highlightedImages) {
                const category = image.category as ImageCategory
                if (!organizedByCategory[category]) {
                    organizedByCategory[category] = []
                }
                organizedByCategory[category]?.push(image)
            }
        }

        const response = NextResponse.json(organizedByCategory)

        // Add cache headers for public data
        response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600')

        return response
    } catch (error) {
        console.error('Error in highlighted photos API:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
