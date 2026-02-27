import { createClient } from '@supabase/supabase-js'
import { validatePublicWeddingData } from '@/lib/validation/validator'

export async function getPublicWeddingData(slug: string) {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: { autoRefreshToken: false, persistSession: false }
            }
        )

        // Filter out invalid slugs
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
            return null
        }

        const { data: couple, error: coupleError } = await supabase
            .from('couples')
            .select('*')
            .eq('couple_slug', slug)
            .single()

        if (coupleError || !couple) return null

        const { data: eventDetails } = await supabase
            .from('event_details')
            .select('*')
            .eq('couple_id', couple.id)
            .single()

        const { data: highlightedImages } = await supabase
            .from('images')
            .select('*')
            .eq('couple_id', couple.id)
            .eq('is_highlighted', true)
            .order('created_at', { ascending: false })

        const { data: giftSettings } = await supabase
            .from('gift_settings')
            .select('*')
            .eq('couple_id', couple.id)
            .single()

        const { data: playlists } = await supabase
            .from('playlists')
            .select('*')
            .eq('couple_id', couple.id)
            .order('created_at', { ascending: false })

        const parseJsonField = (field: any) => {
            if (!field) return null
            if (typeof field === 'string') {
                try { return JSON.parse(field) } catch { return field }
            }
            return field
        }

        const rawPublicData = {
            couple: {
                id: couple.id,
                partner1_name: couple.partner1_name,
                partner2_name: couple.partner2_name,
                wedding_date: couple.wedding_date,
                couple_slug: couple.couple_slug,
            },
            events: {
                couple_intro: eventDetails?.couple_intro || couple.couple_intro || '',
                events: parseJsonField(eventDetails?.events) || [],
                venues: parseJsonField(eventDetails?.venues) || [],
                timeline: parseJsonField(eventDetails?.timeline) || []
            },
            photos: {
                categories: [],
                highlight_photos: (highlightedImages || []).map((img: any) => img.id)
            },
            gifts: giftSettings ? {
                upi_id: giftSettings.upi_id,
                qr_code_url: giftSettings.qr_code_url,
                custom_message: giftSettings.custom_message
            } : null,
            playlists: {
                playlists: playlists || []
            }
        }

        const validationResult = validatePublicWeddingData(rawPublicData)
        if (!validationResult.isValid) {
            // return data with validation warnings
            return { ...rawPublicData, _validation: { errors: validationResult.errors, warnings: validationResult.warnings } }
        }

        return { ...validationResult.data, _validation: { warnings: validationResult.warnings } }
    } catch (error) {
        console.error('getPublicWeddingData error:', error)
        return null
    }
}
