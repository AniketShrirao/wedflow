import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Get couple information
        const { data: couple } = await supabase
            .from('couples')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (!couple) {
            return NextResponse.json(
                { error: 'Couple profile not found' },
                { status: 404 }
            )
        }

        // Get event details
        const { data: eventDetails, error } = await supabase
            .from('event_details')
            .select('*')
            .eq('couple_id', couple.id)
            .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
            console.error('Error fetching event details:', error)
            return NextResponse.json(
                { error: 'Failed to fetch event details' },
                { status: 500 }
            )
        }

        // Return default structure if no event details exist
        const result = eventDetails || {
            couple_intro: '',
            events: [],
            venues: [],
            timeline: []
        }

        return NextResponse.json(result)
    } catch (error) {
        console.error('Error in GET /api/events:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest) {
    try {
        const supabase = await createClient()

        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Get couple information
        const { data: couple } = await supabase
            .from('couples')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (!couple) {
            return NextResponse.json(
                { error: 'Couple profile not found' },
                { status: 404 }
            )
        }

        const body = await request.json()
        const { couple_intro, events, venues, timeline } = body

        console.log('Request body:', { couple_intro, events, venues, timeline })



        // Check if event details already exist
        const { data: existingDetails } = await supabase
            .from('event_details')
            .select('id')
            .eq('couple_id', couple.id)
            .single()

        let data, error

        if (existingDetails) {
            // Update existing record
            const result = await supabase
                .from('event_details')
                .update({
                    couple_intro,
                    events: events || [],
                    venues: venues || [],
                    timeline: timeline || [],
                    updated_at: new Date().toISOString()
                })
                .eq('couple_id', couple.id)
                .select()
                .single()

            data = result.data
            error = result.error
        } else {
            // Insert new record
            const result = await supabase
                .from('event_details')
                .insert({
                    couple_id: couple.id,
                    couple_intro,
                    events: events || [],
                    venues: venues || [],
                    timeline: timeline || [],
                    updated_at: new Date().toISOString()
                })
                .select()
                .single()

            data = result.data
            error = result.error
        }

        if (error) {
            console.error('Error updating event details:', error)
            return NextResponse.json(
                { error: 'Failed to update event details', details: error.message },
                { status: 500 }
            )
        }



        return NextResponse.json(data)
    } catch (error) {
        console.error('Error in PUT /api/events:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}