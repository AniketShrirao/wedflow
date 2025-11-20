import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { GiftSettings, InsertGiftSettings, UpdateGiftSettings } from '@/lib/types/database'

export async function GET() {
    try {
        const supabase = await createClient()

        // Get the current user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get couple information
        const { data: couple, error: coupleError } = await supabase
            .from('couples')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (coupleError || !couple) {
            return NextResponse.json({ error: 'Couple not found' }, { status: 404 })
        }

        // Get gift settings
        const { data: giftSettings, error: giftError } = await supabase
            .from('gift_settings')
            .select('*')
            .eq('couple_id', couple.id)
            .single()

        if (giftError && giftError.code !== 'PGRST116') {
            console.error('Error fetching gift settings:', giftError)
            return NextResponse.json({ error: 'Failed to fetch gift settings' }, { status: 500 })
        }

        return NextResponse.json(giftSettings || null)
    } catch (error) {
        console.error('Error in GET /api/gifts:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Get the current user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get couple information
        const { data: couple, error: coupleError } = await supabase
            .from('couples')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (coupleError || !couple) {
            return NextResponse.json({ error: 'Couple not found' }, { status: 404 })
        }

        const body = await request.json()
        const { upi_id, qr_code_url, custom_message } = body

        // Validate UPI ID format if provided
        if (upi_id && !/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upi_id)) {
            return NextResponse.json({ error: 'Invalid UPI ID format' }, { status: 400 })
        }

        const giftData: InsertGiftSettings = {
            couple_id: couple.id,
            upi_id: upi_id || null,
            qr_code_url: qr_code_url || null,
            custom_message: custom_message || null
        }

        // Check if gift settings already exist
        const { data: existingSettings } = await supabase
            .from('gift_settings')
            .select('id')
            .eq('couple_id', couple.id)
            .single()

        let result
        if (existingSettings) {
            // Update existing settings
            const updateData: UpdateGiftSettings = {
                upi_id: upi_id || null,
                qr_code_url: qr_code_url || null,
                custom_message: custom_message || null
            }

            const { data, error } = await supabase
                .from('gift_settings')
                .update(updateData)
                .eq('couple_id', couple.id)
                .select()
                .single()

            result = { data, error }
        } else {
            // Create new settings
            const { data, error } = await supabase
                .from('gift_settings')
                .insert(giftData)
                .select()
                .single()

            result = { data, error }
        }

        if (result.error) {
            console.error('Error saving gift settings:', result.error)
            return NextResponse.json({ error: 'Failed to save gift settings' }, { status: 500 })
        }

        return NextResponse.json(result.data)
    } catch (error) {
        console.error('Error in POST /api/gifts:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Get the current user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get couple information
        const { data: couple, error: coupleError } = await supabase
            .from('couples')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (coupleError || !couple) {
            return NextResponse.json({ error: 'Couple not found' }, { status: 404 })
        }

        const body = await request.json()
        const { upi_id, qr_code_url, custom_message } = body

        // Validate UPI ID format if provided
        if (upi_id && !/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upi_id)) {
            return NextResponse.json({ error: 'Invalid UPI ID format' }, { status: 400 })
        }

        const updateData: UpdateGiftSettings = {
            upi_id: upi_id || null,
            qr_code_url: qr_code_url || null,
            custom_message: custom_message || null
        }

        const { data, error } = await supabase
            .from('gift_settings')
            .update(updateData)
            .eq('couple_id', couple.id)
            .select()
            .single()

        if (error) {
            console.error('Error updating gift settings:', error)
            return NextResponse.json({ error: 'Failed to update gift settings' }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Error in PUT /api/gifts:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}