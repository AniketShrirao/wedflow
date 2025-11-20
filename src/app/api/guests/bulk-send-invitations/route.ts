import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { TwilioService } from '@/lib/twilio'

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
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (!couple) {
            return NextResponse.json({ error: 'Couple not found' }, { status: 404 })
        }

        const body = await request.json()
        const { guestIds, method } = body // array of guest IDs and method ('sms' or 'whatsapp')

        if (!Array.isArray(guestIds) || guestIds.length === 0) {
            return NextResponse.json({ error: 'Guest IDs array is required' }, { status: 400 })
        }

        if (!['sms', 'whatsapp'].includes(method)) {
            return NextResponse.json({ error: 'Invalid method. Use "sms" or "whatsapp"' }, { status: 400 })
        }

        // Check if Twilio is configured
        if (!TwilioService.isConfigured()) {
            return NextResponse.json({
                error: 'Messaging service not configured. Please contact support.'
            }, { status: 503 })
        }

        // Get guests
        const { data: guests, error: guestsError } = await supabase
            .from('guests')
            .select('*')
            .eq('couple_id', couple.id)
            .in('id', guestIds)

        if (guestsError || !guests) {
            return NextResponse.json({ error: 'Failed to fetch guests' }, { status: 500 })
        }

        // Generate common data
        const invitationBaseUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/${couple.couple_slug}`
        const coupleNames = `${couple.partner1_name} & ${couple.partner2_name}`
        const weddingDate = couple.wedding_date
            ? new Date(couple.wedding_date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
            : 'our special day'

        const results = []
        const successfulSends = []
        const failedSends = []

        // Send invitations to each guest
        for (const guest of guests) {
            try {
                const invitationUrl = `${invitationBaseUrl}?guest=${guest.id}`
                const message = TwilioService.generateInviteMessage(
                    guest.name,
                    coupleNames,
                    weddingDate,
                    invitationUrl
                )

                // Send the message
                let result
                if (method === 'whatsapp') {
                    result = await TwilioService.sendWhatsApp(guest.phone, message)
                } else {
                    result = await TwilioService.sendSMS(guest.phone, message)
                }

                if (result.success) {
                    // Update guest status to 'sent'
                    await supabase
                        .from('guests')
                        .update({
                            invite_status: 'sent',
                            invite_sent_at: new Date().toISOString()
                        })
                        .eq('id', guest.id)

                    successfulSends.push({
                        guestId: guest.id,
                        guestName: guest.name,
                        messageId: result.messageId
                    })
                } else {
                    failedSends.push({
                        guestId: guest.id,
                        guestName: guest.name,
                        error: result.error
                    })
                }

                results.push({
                    guestId: guest.id,
                    guestName: guest.name,
                    success: result.success,
                    messageId: result.messageId,
                    error: result.error
                })

                // Add a small delay between sends to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100))

            } catch (error) {
                console.error(`Error sending invitation to ${guest.name}:`, error)
                failedSends.push({
                    guestId: guest.id,
                    guestName: guest.name,
                    error: error instanceof Error ? error.message : 'Unknown error'
                })
            }
        }

        return NextResponse.json({
            success: true,
            method,
            total: guests.length,
            successful: successfulSends.length,
            failed: failedSends.length,
            results,
            successfulSends,
            failedSends
        })

    } catch (error) {
        console.error('Error in POST /api/guests/bulk-send-invitations:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}