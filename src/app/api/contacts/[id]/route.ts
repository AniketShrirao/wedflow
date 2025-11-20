import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { UpdateVendorContact } from '@/lib/types/database'

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
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

        const updateData: UpdateVendorContact = {
            name,
            phone,
            email: email || null,
            category,
            notes: notes || null,
            updated_at: new Date().toISOString()
        }

        const { data: contact, error } = await supabase
            .from('vendor_contacts')
            .update(updateData)
            .eq('id', id)
            .eq('couple_id', couple.id)
            .select()
            .single()

        if (error) {
            console.error('Error updating vendor contact:', error)
            return NextResponse.json({ error: 'Failed to update vendor contact' }, { status: 500 })
        }

        if (!contact) {
            return NextResponse.json({ error: 'Vendor contact not found' }, { status: 404 })
        }

        return NextResponse.json(contact)
    } catch (error) {
        console.error('Error in PUT /api/contacts/[id]:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
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

        const { error } = await supabase
            .from('vendor_contacts')
            .delete()
            .eq('id', id)
            .eq('couple_id', couple.id)

        if (error) {
            console.error('Error deleting vendor contact:', error)
            return NextResponse.json({ error: 'Failed to delete vendor contact' }, { status: 500 })
        }

        return NextResponse.json({ message: 'Vendor contact deleted successfully' })
    } catch (error) {
        console.error('Error in DELETE /api/contacts/[id]:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}