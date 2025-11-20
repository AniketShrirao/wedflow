import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

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

        // Get query parameters for filtering
        const { searchParams } = new URL(request.url)
        const category = searchParams.get('category') || ''
        const format = searchParams.get('format') || 'csv'

        // Build query
        let query = supabase
            .from('vendor_contacts')
            .select('*')
            .eq('couple_id', couple.id)
            .order('category', { ascending: true })
            .order('name', { ascending: true })

        // Apply category filter if specified
        if (category) {
            query = query.eq('category', category)
        }

        const { data: contacts, error } = await query

        if (error) {
            console.error('Error fetching vendor contacts for export:', error)
            return NextResponse.json({ error: 'Failed to fetch vendor contacts' }, { status: 500 })
        }

        if (format === 'csv') {
            // Generate CSV content
            const headers = ['Name', 'Phone', 'Email', 'Category', 'Notes', 'Created Date']
            const csvRows = [
                headers.join(','),
                ...contacts.map(contact => [
                    `"${contact.name}"`,
                    `"${contact.phone}"`,
                    `"${contact.email || ''}"`,
                    `"${contact.category.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}"`,
                    `"${contact.notes || ''}"`,
                    `"${new Date(contact.created_at).toLocaleDateString()}"`
                ].join(','))
            ]

            const csvContent = csvRows.join('\n')

            return new NextResponse(csvContent, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': 'attachment; filename="vendor-contacts.csv"'
                }
            })
        } else {
            // Return JSON format
            return NextResponse.json(contacts)
        }
    } catch (error) {
        console.error('Error in GET /api/contacts/export:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}