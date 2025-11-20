import twilio from 'twilio'

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER

// Check if credentials are properly configured (not placeholder values)
const isValidAccountSid = accountSid && accountSid.startsWith('AC') && accountSid !== 'your_twilio_account_sid'
const isValidAuthToken = authToken && authToken !== 'your_twilio_auth_token'

if (!isValidAccountSid || !isValidAuthToken) {
    console.warn('Twilio credentials not configured. SMS and WhatsApp features will be disabled.')
}

const client = isValidAccountSid && isValidAuthToken ? twilio(accountSid, authToken) : null

export interface MessageOptions {
    to: string
    message: string
    method: 'sms' | 'whatsapp'
}

export interface MessageResult {
    success: boolean
    messageId?: string
    error?: string
}

export class TwilioService {
    static async sendSMS(to: string, message: string): Promise<MessageResult> {
        if (!client || !twilioPhoneNumber) {
            return {
                success: false,
                error: 'Twilio SMS not configured'
            }
        }

        try {
            // Clean phone number (remove non-digits except +)
            const cleanPhone = to.replace(/[^\d+]/g, '')

            const result = await client.messages.create({
                body: message,
                from: twilioPhoneNumber,
                to: cleanPhone
            })

            return {
                success: true,
                messageId: result.sid
            }
        } catch (error) {
            console.error('Error sending SMS:', error)
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to send SMS'
            }
        }
    }

    static async sendWhatsApp(to: string, message: string): Promise<MessageResult> {
        if (!client || !twilioWhatsAppNumber) {
            return {
                success: false,
                error: 'Twilio WhatsApp not configured'
            }
        }

        try {
            // Clean phone number and add whatsapp: prefix
            const cleanPhone = to.replace(/[^\d+]/g, '')
            const whatsappTo = `whatsapp:${cleanPhone}`

            const result = await client.messages.create({
                body: message,
                from: twilioWhatsAppNumber,
                to: whatsappTo
            })

            return {
                success: true,
                messageId: result.sid
            }
        } catch (error) {
            console.error('Error sending WhatsApp message:', error)
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to send WhatsApp message'
            }
        }
    }

    static generateInviteMessage(guestName: string, coupleNames: string, weddingDate: string, invitationUrl: string): string {
        return `🎉 You're Invited! 🎉

Dear ${guestName},

${coupleNames} joyfully invite you to celebrate their wedding on ${weddingDate}.

View all the details and RSVP at: ${invitationUrl}

We can't wait to celebrate with you!

With love,
${coupleNames} ❤️`
    }

    static isConfigured(): boolean {
        return !!(isValidAccountSid && isValidAuthToken && (twilioPhoneNumber || twilioWhatsAppNumber))
    }
}

export default TwilioService