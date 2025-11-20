import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { InsertVendorContact } from '@/lib/types/database'

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
        const category = searchParams.get('category') || ''
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const offset = (page - 1) * limit

        // Build query
        let query = supabase
            .from('vendor_contacts')
            .select('*', { count: 'exact' })
            .eq('couple_id', couple.id)
            .order('created_at', { ascending: false })

        // Apply filters
        if (search) {
            query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`)
        }

        if (category) {
            query = query.eq('category', category)
        }

        // Apply pagination
        query = query.range(offset, offset + limit - 1)

        const { data: contacts, error, count } = await query

        if (error) {
            console.error('Error fetching vendor contacts:', error)
            return NextResponse.json({ error: 'Failed to fetch vendor contacts' }, { status: 500 })
        }

        return NextResponse.json({
            contacts,
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit)
            }
        })
    } catch (error) {
        console.error('Error in GET /api/contacts:', error)
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
        const { name, phone, email, category, notes } = body

        // Validate required fields
        if (!name || !phone || !category) {
            return NextResponse.json({ error: 'Name, phone, and category are required' }, { status: 400 })
        }

        // Validate category
        const validCategories = ['decorator', 'event_coordinator', 'hall_manager', 'transport', 'photographer', 'caterer']
        if (!validCategories.includes(category)) {
            return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
        }

        const contactData: InsertVendorContact = {
            couple_id: couple.id,
            name,
            phone,
            email: email || null,
            category,
            notes: notes || null
        }

        const { data: contact, error } = await supabase
            .from('vendor_contacts')
            .insert(contactData)
            .select()
            .single()

        if (error) {
            console.error('Error creating vendor contact:', error)
            return NextResponse.json({ error: 'Failed to create vendor contact' }, { status: 500 })
        }

        return NextResponse.json(contact, { status: 201 })
    } catch (error) {
        console.error('Error in POST /api/contacts:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}