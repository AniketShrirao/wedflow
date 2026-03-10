import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { InsertGuest, UpdateGuest } from '@/lib/types/database'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get couple information
        const { data: couple } = await supabase
            .from('couples')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (!couple) {
            return NextResponse.json({ error: 'Couple not found' }, { status: 404 })
        }

        // Get query parameters for search, filter, and pagination
        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search') || ''
        const group = searchParams.get('group') || ''
        const event = searchParams.get('event') || ''
        const status = searchParams.get('status') || ''
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const offset = (page - 1) * limit

        // Build query
        let query = supabase
            .from('guests')
            .select('*', { count: 'exact' })
            .eq('couple_id', couple.id)
            .order('created_at', { ascending: false })

        // Apply filters
        if (search) {
            query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`)
        }

        if (group) {
            query = query.eq('group_name', group)
        }

        if (event) {
            query = query.eq('event_name', event)
        }

        if (status) {
            query = query.eq('invite_status', status)
        }

        // Apply pagination
        query = query.range(offset, offset + limit - 1)

        const { data: guests, error, count } = await query

        if (error) {
            console.error('Error fetching guests:', error)
            return NextResponse.json({ error: 'Failed to fetch guests' }, { status: 500 })
        }

        return NextResponse.json({
            guests,
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit)
            }
        })
    } catch (error) {
        console.error('Error in GET /api/guests:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get couple information
        const { data: couple } = await supabase
            .from('couples')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (!couple) {
            return NextResponse.json({ error: 'Couple not found' }, { status: 404 })
        }

        const body = await request.json()
        const { name, phone, email, group_name, event_name } = body

        // Validate required fields
        if (!name || !phone) {
            return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 })
        }

        const guestData: InsertGuest = {
            couple_id: couple.id,
            name,
            phone,
            email: email || null,
            group_name: group_name || null,
            event_name: event_name || null,
            invite_status: 'pending'
        }

        const { data: guest, error } = await supabase
            .from('guests')
            .insert(guestData)
            .select()
            .single()

        if (error) {
            console.error('Error creating guest:', error)
            return NextResponse.json({ error: 'Failed to create guest' }, { status: 500 })
        }

        return NextResponse.json(guest, { status: 201 })
    } catch (error) {
        console.error('Error in POST /api/guests:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}