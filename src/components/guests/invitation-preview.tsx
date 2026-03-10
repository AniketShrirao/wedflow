'use client'

import { useState } from 'react'
import { Guest, Couple } from '@/lib/types/database'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { MessageSquare, Phone, Copy, ExternalLink } from 'lucide-react'

interface InvitationPreviewProps {
  guest: Guest
  couple: Couple
  onClose: () => void
  onSendInvitation?: (guest: Guest, method: 'whatsapp' | 'sms') => void
}

export function InvitationPreview({
  guest,
  couple,
  onClose,
  onSendInvitation
}: InvitationPreviewProps) {
  const [loading, setLoading] = useState(false)

  // Generate invitation URL
  const invitationUrl = `${window.location.origin}/${couple.couple_slug}?guest=${guest.id}`

  // Generate personalized message
  const generateMessage = () => {
    const coupleNames = `${couple.partner1_name} & ${couple.partner2_name}`
    const weddingDate = couple.wedding_date
      ? new Date(couple.wedding_date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      : 'our special day'

    return `🎉 You're Invited! 🎉

Dear ${guest.name},

${coupleNames} joyfully invite you to celebrate their wedding on ${weddingDate}.

View all the details and RSVP at: ${invitationUrl}

We can't wait to celebrate with you!

With love,
${coupleNames} ❤️`
  }

  // Generate WhatsApp deep link
  const generateWhatsAppLink = () => {
    const message = encodeURIComponent(generateMessage())
    const phoneNumber = guest.phone.replace(/[^\d+]/g, '') // Clean phone number
    return `https://wa.me/${phoneNumber}?text=${message}`
  }

  // Generate SMS link
  const generateSMSLink = () => {
    const message = encodeURIComponent(generateMessage())
    return `sms:${guest.phone}?body=${message}`
  }

  const handleSendInvitation = async (method: 'whatsapp' | 'sms') => {
    setLoading(true)
    try {
      if (onSendInvitation) {
        // Use the parent component's handler (which will use Twilio API)
        await onSendInvitation(guest, method)
      } else {
        // Fallback to opening links directly
        const link = method === 'whatsapp' ? generateWhatsAppLink() : generateSMSLink()
        window.open(link, '_blank')
      }
    } catch (error) {
      console.error('Error sending invitation:', error)
      alert('Failed to send invitation. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyInvitationLink = () => {
    navigator.clipboard.writeText(invitationUrl)
    alert('Invitation link copied to clipboard!')
  }

  const copyMessage = () => {
    navigator.clipboard.writeText(generateMessage())
    alert('Message copied to clipboard!')
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invitation Preview</DialogTitle>
          <DialogDescription>
            Preview and send invitation to {guest.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Guest Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Guest Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Name:</span>
                <span>{guest.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Phone:</span>
                <div className="flex items-center gap-2">
                  <span>{guest.phone}</span>
                  {guest.phone ? (
                    <a href={`tel:${guest.phone}`} className="text-blue-600 hover:text-blue-800">
                      <Phone className="w-4 h-4" />
                    </a>
                  ) : null}
                </div>
              </div>
              {guest.email && (
                <div className="flex justify-between">
                  <span className="font-medium">Email:</span>
                  <span>{guest.email}</span>
                </div>
              )}
              {guest.group_name && (
                <div className="flex justify-between">
                  <span className="font-medium">Group:</span>
                  <span>{guest.group_name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <Badge variant={
                  guest.invite_status === 'sent' ? 'default' :
                    guest.invite_status === 'viewed' ? 'secondary' : 'outline'
                }>
                  {guest.invite_status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Invitation URL */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Invitation Link</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-2 bg-gray-50 rounded border text-sm font-mono break-all">
                  {invitationUrl}
                </div>
                <Button size="sm" variant="outline" onClick={copyInvitationLink}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => window.open(invitationUrl, '_blank')}>
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Message Preview */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Message Preview</CardTitle>
                <Button size="sm" variant="outline" onClick={copyMessage}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Message
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <pre className="whitespace-pre-wrap text-sm font-sans">
                  {generateMessage()}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Send Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Send Invitation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button
                  onClick={() => handleSendInvitation('whatsapp')}
                  disabled={loading}
                  className="flex-1"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send via WhatsApp
                </Button>
                <Button
                  onClick={() => handleSendInvitation('sms')}
                  disabled={loading}
                  variant="outline"
                  className="flex-1"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Send via SMS
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Clicking these buttons will open WhatsApp or SMS with the pre-filled message.
              </p>
            </CardContent>
          </Card>

          {/* Invitation History */}
          {(guest.invite_sent_at || guest.invite_viewed_at) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Invitation History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {guest.invite_sent_at && (
                  <div className="flex justify-between">
                    <span className="font-medium">Sent:</span>
                    <span>{new Date(guest.invite_sent_at).toLocaleString()}</span>
                  </div>
                )}
                {guest.invite_viewed_at && (
                  <div className="flex justify-between">
                    <span className="font-medium">Viewed:</span>
                    <span>{new Date(guest.invite_viewed_at).toLocaleString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}