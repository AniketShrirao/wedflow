'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface GuestData {
  id: string
  name: string
  phone?: string
  email?: string
  group_name?: string
  invite_status?: string
}

export function RSVP({ coupleSlug, guestId }: { coupleSlug: string; guestId: string }) {
  const [guest, setGuest] = useState<GuestData | null>(null)
  const [loading, setLoading] = useState(false)
  const [attending, setAttending] = useState<boolean | null>(null)
  const [guestsCount, setGuestsCount] = useState<number>(1)
  const [note, setNote] = useState('')

  useEffect(() => {
    let mounted = true
    const fetchGuest = async () => {
      try {
        const res = await fetch(`/api/public/${coupleSlug}/guest/${guestId}`)
        if (!res.ok) throw new Error('Guest not found')
        const data = await res.json()
        if (mounted) setGuest(data.guest)

        // Mark invite viewed (best-effort)
        fetch('/api/public/invite-viewed', { method: 'POST', body: JSON.stringify({ guestId }), headers: { 'Content-Type': 'application/json' } }).catch(() => { })
      } catch (err) {
        console.error('Failed to load guest', err)
      }
    }
    fetchGuest()
    return () => { mounted = false }
  }, [coupleSlug, guestId])

  const submit = async () => {
    if (!guest) return
    setLoading(true)
    try {
      const res = await fetch('/api/public/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestId: guest.id, attending: attending === true, guests_count: guestsCount, note })
      })
      if (!res.ok) throw new Error('Failed to submit RSVP')
      alert('Thanks — your RSVP has been recorded')
      window.location.reload()
    } catch (err) {
      console.error(err)
      alert(err instanceof Error ? err.message : 'RSVP failed')
    } finally {
      setLoading(false)
    }
  }

  if (!guest) return <div className="p-6 text-center">Loading invitation...</div>

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h3 className="text-2xl font-semibold mb-2">Hello, {guest.name}</h3>
      <p className="text-sm text-gray-600 mb-4">Please let us know if you'll be attending.</p>

      <div className="flex gap-2 mb-4">
        <Button variant={attending === true ? undefined : 'outline'} onClick={() => setAttending(true)}>Accept</Button>
        <Button variant={attending === false ? undefined : 'outline'} onClick={() => setAttending(false)}>Decline</Button>
      </div>

      {attending !== null && (
        <div className="space-y-3">
          {attending && (
            <div className="flex items-center gap-2">
              <label className="text-sm">Number of guests</label>
              <Input type="number" min={1} value={guestsCount} onChange={(e) => setGuestsCount(Math.max(1, Number(e.target.value || 1)))} className="w-24" />
            </div>
          )}

          <div>
            <label className="text-sm">Message (optional)</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} className="w-full mt-1 p-2 border rounded" rows={3} />
          </div>

          <div className="flex justify-end">
            <Button onClick={submit} disabled={loading || attending === null}>{loading ? 'Saving...' : 'Submit RSVP'}</Button>
          </div>
        </div>
      )}
    </div>
  )
}
