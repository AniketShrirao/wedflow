import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST add a track to playlist
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const { title, artist, youtubeUrl, duration } = body

        console.log('Track data received:', { title, artist, youtubeUrl, duration })

        if (!title || !youtubeUrl) {
            console.error('Missing required fields:', { title, youtubeUrl })
            return NextResponse.json(
                { error: 'title and youtubeUrl are required', received: { title, youtubeUrl } },
                { status: 400 }
            )
        }

        // Get current playlist
        const { data: playlist, error: fetchError } = await supabase
            .from('playlists')
            .select('tracks')
            .eq('id', id)
            .single()

        if (fetchError) throw fetchError

        // Add new track
        const newTrack = {
            id: `track_${Date.now()}`,
            title,
            artist: artist || 'Unknown Artist',
            youtubeUrl,
            duration: duration || '0:00',
            addedAt: new Date().toISOString(),
        }

        const updatedTracks = [...(playlist.tracks || []), newTrack]

        // Update playlist
        const { data, error } = await supabase
            .from('playlists')
            .update({
                tracks: updatedTracks,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(newTrack, { status: 201 })
    } catch (error) {
        console.error('Error adding track:', error)
        return NextResponse.json(
            { error: 'Failed to add track' },
            { status: 500 }
        )
    }
}

// DELETE remove a track from playlist
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const { searchParams } = new URL(request.url)
        const trackId = searchParams.get('trackId')

        if (!trackId) {
            return NextResponse.json(
                { error: 'trackId is required' },
                { status: 400 }
            )
        }

        // Get current playlist
        const { data: playlist, error: fetchError } = await supabase
            .from('playlists')
            .select('tracks')
            .eq('id', id)
            .single()

        if (fetchError) throw fetchError

        // Remove track
        const updatedTracks = playlist.tracks.filter((t: any) => t.id !== trackId)

        // Update playlist
        const { error } = await supabase
            .from('playlists')
            .update({
                tracks: updatedTracks,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting track:', error)
        return NextResponse.json(
            { error: 'Failed to delete track' },
            { status: 500 }
        )
    }
}
