import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

export async function POST(request: NextRequest) {
    try {
        const body = await request.text()
        const params = new URLSearchParams(body)

        // Verify webhook signature (optional but recommended for production)
        const twilioSignature = request.headers.get('x-twilio-signature')
        const authToken = process.env.TWILIO_AUTH_TOKEN

        if (authToken && twilioSignature) {
            const url = request.url
            const params = Object.fromEntries(new URLSearchParams(body))
            const isValid = twilio.validateRequest(authToken, twilioSignature, url, params)

            if (!isValid) {
                console.error('Invalid Twilio webhook signature')
                return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
            }
        }

        // Extract webhook data
        const messageSid = params.get('MessageSid')
        const messageStatus = params.get('MessageStatus')
        const to = params.get('To')
        const from = params.get('From')
        const errorCode = params.get('ErrorCode')
        const errorMessage = params.get('ErrorMessage')

        console.log('Twilio webhook received:', {
            messageSid,
            messageStatus,
            to,
            from,
            errorCode,
            errorMessage
        })

        // Handle different message statuses
        switch (messageStatus) {
            case 'delivered':
                // Message was successfully delivered
                console.log(`Message ${messageSid} delivered to ${to}`)
                break

            case 'failed':
            case 'undelivered':
                // Message failed to deliver
                console.error(`Message ${messageSid} failed to deliver to ${to}:`, errorMessage)
                break

            case 'read':
                // WhatsApp message was read (only available for WhatsApp)
                console.log(`WhatsApp message ${messageSid} was read by ${to}`)
                break

            default:
                console.log(`Message ${messageSid} status: ${messageStatus}`)
        }

        // You could update guest invitation status based on delivery status here
        // For now, we'll just log the webhook data

        return NextResponse.json({
            message: 'Webhook processed successfully',
            status: messageStatus
        })

    } catch (error) {
        console.error('Error processing Twilio webhook:', error)
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
    }
}