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

        // Get couple information by slug
        const { data: couple, error: coupleError } = await supabase
            .from('couples')
            .select('*')
            .eq('couple_slug', slug)
            .single()

        if (coupleError || !couple) {
            return NextResponse.json(
                { error: 'Wedding site not found' },
                { status: 404 }
            )
        }

        // Get event details
        const { data: eventDetails } = await supabase
            .from('event_details')
            .select('*')
            .eq('couple_id', couple.id)
            .single()

        // Get photo collections
        const { data: photoCollection } = await supabase
            .from('photo_collections')
            .select('*')
            .eq('couple_id', couple.id)
            .single()

        // Get gift settings
        const { data: giftSettings } = await supabase
            .from('gift_settings')
            .select('*')
            .eq('couple_id', couple.id)
            .single()

        // Parse JSON fields if they're stored as strings
        const parseJsonField = (field: any, fieldName: string = 'unknown') => {
            if (!field) return null
            if (typeof field === 'string') {
                try {
                    return JSON.parse(field)
                } catch (error) {
                    console.warn(`Failed to parse JSON field ${fieldName}:`, error)
                    return field
                }
            }
            return field
        }



        // Prepare public data (exclude sensitive information)
        const rawPublicData = {
            couple: {
                partner1_name: couple.partner1_name,
                partner2_name: couple.partner2_name,
                wedding_date: couple.wedding_date,
                couple_slug: couple.couple_slug,
            },
            events: {
                couple_intro: eventDetails?.couple_intro || couple.couple_intro || '',
                events: parseJsonField(eventDetails?.events, 'events') || [],
                venues: parseJsonField(eventDetails?.venues, 'venues') || [],
                timeline: parseJsonField(eventDetails?.timeline, 'timeline') || []
            },
            photos: photoCollection ? {
                categories: parseJsonField(photoCollection.categories, 'photo_categories') || [],
                highlight_photos: parseJsonField(photoCollection.highlight_photos, 'highlight_photos') || []
            } : {
                categories: [],
                highlight_photos: []
            },
            gifts: giftSettings ? {
                upi_id: giftSettings.upi_id,
                qr_code_url: giftSettings.qr_code_url,
                custom_message: giftSettings.custom_message
            } : null
        }

        // Validate and sanitize the data before sending
        const validationResult = validatePublicWeddingData(rawPublicData)

        if (!validationResult.isValid) {
            console.error('Data validation failed for slug:', slug, validationResult.errors)
            // Return data anyway with validation warnings for now
            const response = NextResponse.json({
                ...rawPublicData,
                _validation: {
                    errors: validationResult.errors,
                    warnings: validationResult.warnings
                }
            })

            response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
            response.headers.set('Pragma', 'no-cache')
            response.headers.set('Expires', '0')

            return response
        }

        const response = NextResponse.json({
            ...validationResult.data,
            _validation: {
                warnings: validationResult.warnings
            }
        })

        // Add cache headers to ensure fresh data
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