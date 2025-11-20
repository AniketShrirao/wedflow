import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { InsertGuest } from '@/lib/types/database'

interface BulkGuestData {
    name: string
    phone: string
    email?: string
    group_name?: string
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
        const { guests, textData } = body

        let guestsToImport: BulkGuestData[] = []

        if (guests && Array.isArray(guests)) {
            // Direct array of guest objects
            guestsToImport = guests
        } else if (textData && typeof textData === 'string') {
            // Parse text data (CSV-like format)
            const lines = textData.trim().split('\n')
            guestsToImport = lines.map((line: string) => {
                const parts = line.split(',').map((part: string) => part.trim())
                return {
                    name: parts[0] || '',
                    phone: parts[1] || '',
                    email: parts[2] || undefined,
                    group_name: parts[3] || undefined
                }
            }).filter((guest: BulkGuestData) => guest.name && guest.phone)
        }

        if (guestsToImport.length === 0) {
            return NextResponse.json({ error: 'No valid guests to import' }, { status: 400 })
        }

        // Validate and prepare guest data
        const validGuests: InsertGuest[] = []
        const errors: string[] = []

        guestsToImport.forEach((guest, index) => {
            if (!guest.name || !guest.phone) {
                errors.push(`Row ${index + 1}: Name and phone are required`)
                return
            }

            validGuests.push({
                couple_id: couple.id,
                name: guest.name,
                phone: guest.phone,
                email: guest.email || null,
                group_name: guest.group_name || null,
                invite_status: 'pending'
            })
        })

        if (validGuests.length === 0) {
            return NextResponse.json({
                error: 'No valid guests to import',
                details: errors
            }, { status: 400 })
        }

        // Insert guests in batches
        const batchSize = 100
        const insertedGuests = []

        for (let i = 0; i < validGuests.length; i += batchSize) {
            const batch = validGuests.slice(i, i + batchSize)

            const { data, error } = await supabase
                .from('guests')
                .insert(batch)
                .select()

            if (error) {
                console.error('Error inserting guest batch:', error)
                return NextResponse.json({
                    error: 'Failed to import some guests',
                    details: error.message
                }, { status: 500 })
            }

            if (data) {
                insertedGuests.push(...data)
            }
        }

        return NextResponse.json({
            message: `Successfully imported ${insertedGuests.length} guests`,
            imported: insertedGuests.length,
            errors: errors.length > 0 ? errors : undefined
        }, { status: 201 })

    } catch (error) {
        console.error('Error in POST /api/guests/bulk-import:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}