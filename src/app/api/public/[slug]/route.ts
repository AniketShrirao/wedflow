import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { validatePublicWeddingData } from '@/lib/validation/validator'

export async function GET(
    request: NextRequest,
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

        // Filter out non-slug requests (browser/framework assets)
        const invalidSlugs = [
            'manifest.json',
            'icon.svg',
            'favicon.ico',
            'robots.txt',
            'sitemap.xml',
            '_next',
            'api'
        ]

        if (invalidSlugs.some(invalid => slug.includes(invalid)) || slug.includes('.')) {
            return NextResponse.json(
                { error: 'Not found' },
                { status: 404 }
            )
        }

        // Use shared helper to build public data
        const { getPublicWeddingData } = await import('@/lib/public-service')
        const data = await getPublicWeddingData(slug)

        if (!data) {
            return NextResponse.json({ error: 'Wedding site not found' }, { status: 404 })
        }

        const response = NextResponse.json(data)
        response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
        response.headers.set('Pragma', 'no-cache')
        response.headers.set('Expires', '0')
        return response
    } catch (error) {
        console.error('Error fetching public wedding data:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}