import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST create a song suggestion
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { coupleId, songTitle, artistName, youtubeUrl, suggestedBy, message } = body

        if (!coupleId || !songTitle || !suggestedBy) {
            return NextResponse.json(
                { error: 'coupleId, songTitle, and suggestedBy are required' },
                { status: 400 }
            )
        }

        const { data, error } = await supabase
            .from('song_suggestions')
            .insert([
                {
                    couple_id: coupleId,
                    song_title: songTitle,
                    artist_name: artistName || null,
                    youtube_url: youtubeUrl || null,
                    suggested_by: suggestedBy,
                    message: message || null,
                    status: 'pending',
                    created_at: new Date().toISOString(),
                },
            ])
            .select()

        if (error) throw error

        return NextResponse.json(data[0], { status: 201 })
    } catch (error) {
        console.error('Error creating song suggestion:', error)
        return NextResponse.json(
            { error: 'Failed to create song suggestion' },
            { status: 500 }
        )
    }
}

// GET all suggestions for a couple
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const coupleId = searchParams.get('coupleId')

        if (!coupleId) {
            return NextResponse.json(
                { error: 'coupleId is required' },
                { status: 400 }
            )
        }

        const { data, error } = await supabase
            .from('song_suggestions')
            .select('*')
            .eq('couple_id', coupleId)
            .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json(data)
    } catch (error) {
        console.error('Error fetching song suggestions:', error)
        return NextResponse.json(
            { error: 'Failed to fetch song suggestions' },
            { status: 500 }
        )
    }
}
