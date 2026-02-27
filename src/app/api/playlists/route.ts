import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET all playlists for a couple
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const coupleId = searchParams.get('coupleId')
        const type = searchParams.get('type') // 'predefined' or 'custom'

        if (!coupleId) {
            return NextResponse.json(
                { error: 'coupleId is required' },
                { status: 400 }
            )
        }

        let query = supabase
            .from('playlists')
            .select('*')
            .eq('couple_id', coupleId)

        if (type) {
            query = query.eq('type', type)
        }

        const { data, error } = await query.order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json(data)
    } catch (error) {
        console.error('Error fetching playlists:', error)
        return NextResponse.json(
            { error: 'Failed to fetch playlists' },
            { status: 500 }
        )
    }
}

// POST create a new playlist
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { coupleId, name, description, type, eventType, tracks, createdBy } = body

        if (!coupleId || !name || !type) {
            return NextResponse.json(
                { error: 'coupleId, name, and type are required' },
                { status: 400 }
            )
        }

        const { data, error } = await supabase
            .from('playlists')
            .insert([
                {
                    couple_id: coupleId,
                    name,
                    description,
                    type,
                    event_type: eventType,
                    tracks: tracks || [],
                    created_by: createdBy,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
            ])
            .select()

        if (error) throw error

        return NextResponse.json(data[0], { status: 201 })
    } catch (error) {
        console.error('Error creating playlist:', error)
        return NextResponse.json(
            { error: 'Failed to create playlist' },
            { status: 500 }
        )
    }
}
