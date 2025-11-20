import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { TwilioService } from '@/lib/twilio'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
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

        // Get guest information
        const { data: guest } = await supabase
            .from('guests')
            .select('*')
            .eq('id', id)
            .eq('couple_id', couple.id)
            .single()

        if (!guest) {
            return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
        }

        const body = await request.json()
        const { method } = body // 'sms' or 'whatsapp'

        if (!['sms', 'whatsapp'].includes(method)) {
            return NextResponse.json({ error: 'Invalid method. Use "sms" or "whatsapp"' }, { status: 400 })
        }

        // Check if Twilio is configured
        if (!TwilioService.isConfigured()) {
            return NextResponse.json({
                error: 'Messaging service not configured. Please contact support.'
            }, { status: 503 })
        }

        // Generate invitation URL and message
        const invitationUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/${couple.couple_slug}?guest=${guest.id}`
        const coupleNames = `${couple.partner1_name} & ${couple.partner2_name}`
        const weddingDate = couple.wedding_date
            ? new Date(couple.wedding_date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
            : 'our special day'

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

        if (!result.success) {
            return NextResponse.json({
                error: result.error || 'Failed to send message'
            }, { status: 500 })
        }

        // Update guest status to 'sent'
        const { error: updateError } = await supabase
            .from('guests')
            .update({
                invite_status: 'sent',
                invite_sent_at: new Date().toISOString()
            })
            .eq('id', guest.id)

        if (updateError) {
            console.error('Error updating guest status:', updateError)
            // Don't fail the request if status update fails
        }

        return NextResponse.json({
            success: true,
            messageId: result.messageId,
            method,
            message: `Invitation sent successfully via ${method.toUpperCase()}`
        })

    } catch (error) {
        console.error('Error in POST /api/guests/[id]/send-invitation:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}